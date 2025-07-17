import { User, useAuthStore } from "@/context/userAuthStore";
import { BASE_URL } from "@/utils/config";
import axios, { AxiosResponse } from "axios";
// Helper function to get token - this should be called from React components/hooks only
export const getAuthToken = (): string => {
  return useAuthStore.getState().token; 
};

interface UserDetailsResponse {
  success: boolean;
  user?: User;
  error?: string;
}

interface ApiResponse<T = any> {
  user?: any;
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

interface ImageData {
  uri: string;
  type?: string;
  name?: string;
}

interface ProfileData {
  name?: string;
  location?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  profile_picture?: ImageData;
}

interface CleanerProfileData {
  bio: string;
  experience: string;
  speciality: string;
}

/**
 * Fetches detailed user information after login
 * @param userId - The ID of the user to fetch details for
 * @param role - User role
 * @returns User details response
 */
export async function fetchUserDetails(
  userId: string | undefined ,
  role: string | undefined 
): Promise<UserDetailsResponse> {
  try {
    const token = getAuthToken();
    console.log("token for user details ", token);
    
    const response = await fetch(
      `${BASE_URL}/api/users/users/detail/?user_id=${userId}&role=${role}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Parse the JSON response
    const data = await response.json();
    console.log("User details response:", JSON.stringify(data));

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || "Failed to fetch user details",
      };
    }

    const user: User = {
      id: data.id.toString(),
      email: data.email,
      role: data.role,
      phone: data.phone_number,
      first_name: data.first_name,
      last_name: data.last_name,
      profile_picture: data.profile_picture,
      city: data.city,
      state: data.state,
      country: data.country,
      address: data.address_line,
      zipCode: data.zip_code,
      date_joined: data.date_joined,
      user: undefined,
      phone_number: "",
      profile_image: "",
      location: undefined,
      bio: undefined,
      full_name: undefined
    };

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      error: "Network error occurred while fetching user details",
    };
  }
}


/**
 * Fetches a user's profile information
 * @param userId - The ID of the user
 * @param role - User role
 * @returns Response object with success status and user data or error message
 */
export const fetchUserProfile = async (
  userId: string,
  role: string
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: "Authentication token is required" };
    }

    const response: AxiosResponse = await axios({
      method: "GET",
      url: `${BASE_URL}/api/users/profile`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Failed to fetch user profile",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user profile:", error);

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || "Server error while fetching profile",
        statusCode: error.response.status,
      };
    } else if (error.request) {
      return {
        success: false,
        error: "No response received from server. Please check your connection.",
      };
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  }
};

/**
 * Updates a user's profile information and/or profile picture in a single request
 * @param userId - The ID of the user to update
 * @param profileData - The profile data to update
 * @param imageData - Optional image data object
 * @returns Response object with success status and user data or error message
 */
export const updateUserProfileWithImage = async (
  userId: string,
  profileData: ProfileData,
  imageData: ImageData | null = null
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    // Ensure token is provided
    if (!token) {
      return { success: false, error: "Authentication token is required" };
    }

    // Create a FormData object to send both profile data and image
    const formData = new FormData();

    // Process profile data
    const updatedData = { ...profileData };
    if (profileData.name && (!profileData.first_name || !profileData.last_name)) {
      const nameParts = profileData.name.split(" ");
      if (nameParts.length > 0) {
        updatedData.first_name = nameParts[0];
        if (nameParts.length > 1) {
          updatedData.last_name = nameParts.slice(1).join(" ");
        } else {
          updatedData.last_name = "";
        }
      }
    }

    // Add all profile fields to formData
    Object.keys(updatedData).forEach((key) => {
      const value = updatedData[key as keyof ProfileData];
      if (value !== undefined && value !== null && typeof value === 'string') {
        formData.append(key, value);
      }
    });

    // Add the image to the form data if provided
    if (imageData && imageData.uri) {
      formData.append("profile_image", {
        uri: imageData.uri,
        type: imageData.type || "image/jpeg",
        name: imageData.name || "profile_image.jpg",
      } as any);
    }

    const response: AxiosResponse = await axios({
      method: "PUT",
      url: `${BASE_URL}/users/profile/`,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      data: formData,
    });

    // If the request was successful
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Failed to update profile",
      };
    }
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    // Handle different types of errors
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Server error occurred";

      return {
        success: false,
        error: errorMessage,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      return {
        success: false,
        error: "No response received from server. Please check your connection.",
      };
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  }
};

/**
 * Updates user profile information including image upload
 * @param userData - User data to update
 * @returns The API response
 */
export const updateUserProfile = async (
  userData: ProfileData
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: "Authentication token missing" };
    }

    // Create FormData to handle file upload
    const formData = new FormData();

    if (userData.first_name) formData.append("first_name", userData.first_name);
    if (userData.last_name) formData.append("last_name", userData.last_name);
    if (userData.phone_number) formData.append("phone_number", userData.phone_number);
    if (userData.address) formData.append("address_line", userData.address);
    if (userData.city) formData.append("city", userData.city);
    if (userData.state) formData.append("state", userData.state);
    if (userData.country) formData.append("country", userData.country);
    if (userData.zipCode) formData.append("zip_code", userData.zipCode);

    // Handle profile picture if provided
    if (userData.profile_picture && userData.profile_picture.uri) {
      const uriParts = userData.profile_picture.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("profile_picture", {
        uri: userData.profile_picture.uri,
        name: `profile-image.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    const response: AxiosResponse = await axios.patch(
      `${BASE_URL}/api/users/profile/`,
      formData,
      {       
        headers: {
          "X-CSRFToken": token,
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("user has updated profile:", userData.profile_picture);

    return {
      success: true,
      data: {
        ...response.data,
        profileImageUrl: response.data.profile_picture || null,
      },
    };
  } catch (error: any) {
    console.error("API Error in updateUserProfile:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update profile",
    };
  }
};

/**
 * Updates a user's profile picture
 * @param userId - The ID of the user
 * @param imageData - The image data object
 * @returns Response object with success status and image URL or error message
 */
export const updateProfilePicture = async (
  userId: string,
  imageData: ImageData
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: "Authentication token is required" };
    }

    // Create a FormData object to send the image
    const formData = new FormData();

    // Add the image to the form data
    formData.append("profile_image", {
      uri: imageData.uri,
      type: imageData.type || "image/jpeg",
      name: imageData.name || "profile_image.jpg",
    } as any);

    // Send the request
    const response: AxiosResponse = await axios({
      method: "POST",
      url: `${BASE_URL}/users/profile/`,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      data: formData,
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: {
          imageUrl: response.data.image_url || response.data.profileImageUrl,
        },
        message: "Profile picture updated successfully",
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Failed to update profile picture",
      };
    }
  } catch (error: any) {
    console.error("Error updating profile picture:", error);

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || "Server error while updating profile picture",
      };
    } else if (error.request) {
      return {
        success: false,
        error: "No response received from server. Please check your connection.",
      };
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  }
};

/**
 * Get cleaner profile information
 * @returns Promise with success status and cleaner profile data
 */
export const getCleanerProfile = async (): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${BASE_URL}/api/users/cleaner/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { "X-CSRFToken": token } : {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || "Failed to fetch cleaner profile.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      data: data,
      message: "Cleaner profile fetched successfully.",
    };
  } catch (error: any) {
    console.error("Get cleaner profile error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
};

/**
 * Update cleaner profile information
 * @param data - Cleaner profile data
 * @returns Promise with success status and response data
 */
export const updateCleanerProfile = async (
  data: CleanerProfileData
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    console.log("Making request to:", `${BASE_URL}/api/users/cleaner/profile/`);
    console.log("Request data:", data);

    const response = await fetch(`${BASE_URL}/api/users/cleaner/profile/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(token ? { "X-CSRFToken": token } : {}),
      },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    // Check if response is ok first
    if (!response.ok) {
      // Log the actual response text to see what's being returned
      const responseText = await response.text();
      console.log("Error response text:", responseText);
      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);
      
      // Try to parse as JSON if it looks like JSON, otherwise return the text
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        console.log("Parsed error data:", errorData);
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
      } catch (parseError) {
        console.log("Could not parse error response as JSON");
        // If it's not JSON, use the raw text (probably HTML error page)
        errorMessage = `Server error (${response.status}): ${responseText.substring(0, 100)}...`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.log("Non-JSON response:", responseText);
      return {
        success: false,
        error: "Server returned non-JSON response",
      };
    }

    const result = await response.json();
    console.log("Success response:", result);
    
    // Sometimes servers return 200 but with error in the response body
    if (result.error || result.message) {
      console.log("Server returned error in response body:", result);
      return {
        success: false,
        error: result.message || result.error || "Unknown error from server",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("API Error:", error);

    // More specific error handling
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network connection failed - check your internet connection",
      };
    }

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return {
        success: false,
        error: "Server returned invalid JSON response",
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * Get user details
 * @param userId - User ID to get details for
 * @param role - User role (e.g., 'cleaner', 'client', etc.)
 * @returns Promise with success status and user details
 */
export const getUserDetail = async (
  userId: number,
  role: string
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
   
    const url = `${BASE_URL}/api/users/users/detail/?user_id=${userId}&role=${role}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const maindata = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: maindata.detail || "Failed to fetch user details.",
        error: `Error ${response.status}`,
      };
    }
    
    return {
      success: true,
      data: maindata,
    };
  } catch (error: any) {
    console.error("Get user detail error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
      data: null,
    };
  }
};