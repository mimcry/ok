import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";

// Interface definitions
interface PropertyData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ZipCode?: string; // Alternative naming
  description?: string;
  instruction?: string;
  airbnblink?: string;
  bedrooms?: number;
  bathrooms?: number;
  type?: string;
  area?: number;
  basePrice?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

/**
 * Creates a property and uploads images in a single API request
 * 
 * @param {PropertyData} propertyData - The property data
 * @param {string[]} imageUris - Array of image URIs to upload (optional)
 * @returns {Promise<ApiResponse>} - Response with success status and data or error
 */
export async function createPropertyWithImages(
  propertyData: PropertyData, 
  imageUris: string[] = []
): Promise<ApiResponse> {
  try {
   const csrfToken = getAuthToken();
    console.log("token", csrfToken);

    // Create a FormData object to send both property data and images
    const formData = new FormData();

    // Add each property field individually to the form data
    // This is important because the backend expects form fields, not a JSON object
    formData.append('name', String(propertyData.name || '').trim());
    formData.append('address', String(propertyData.address || '').trim());
    formData.append('city', String(propertyData.city || '').trim());
    formData.append('state', String(propertyData.state || '').trim());
    formData.append('zip_code', String(propertyData.zipCode || propertyData.ZipCode || '').trim());

    if (propertyData.description) {
      formData.append('description', propertyData.description);
    }

    if (propertyData.instruction) {
      formData.append('instruction', propertyData.instruction);
    }

    if (propertyData.airbnblink) {
      formData.append('airbnb_link', propertyData.airbnblink);
    }

    formData.append('bedrooms', String(parseInt(String(propertyData.bedrooms)) || 0));
    formData.append('bathrooms', String(parseInt(String(propertyData.bathrooms)) || 0));

    if (propertyData.type) {
      formData.append('property_type', propertyData.type);
    }

    formData.append('area', String(parseFloat(String(propertyData.area)) || 0));
    formData.append('base_price', String(propertyData.basePrice || '0.00').trim());

    // Add each image to the form data if provided
    if (imageUris && imageUris.length > 0) {
      // Add the first image as main_image 
      const mainUri = imageUris[0];
      const mainUriParts = mainUri.split('/');
      const mainFilename = mainUriParts[mainUriParts.length - 1];

      const mainFileType = mainFilename.split('.').pop()?.toLowerCase() || 'jpg';
      const mainMimeType = mainFileType === 'jpg' || mainFileType === 'jpeg' ? 'image/jpeg' :
        mainFileType === 'png' ? 'image/png' :
          mainFileType === 'gif' ? 'image/gif' : `image/${mainFileType}`;

      formData.append('main_image', {
        uri: mainUri,
        name: mainFilename,
        type: mainMimeType,
      } as any);

      // Add the rest as additional images
      imageUris.forEach((uri: string, index: number) => {
        // Get filename from URI
        const uriParts = uri.split('/');
        const filename = uriParts[uriParts.length - 1];

        // Determine file type
        const fileType = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' :
          fileType === 'png' ? 'image/png' :
            fileType === 'gif' ? 'image/gif' : `image/${fileType}`;

        formData.append('new_images', {
          uri: uri,
          name: filename,
          type: mimeType,
        } as any);
      });
    }

    console.log('Sending property data with images');

    // Make a single request with both property data and images
    const response = await fetch(`${BASE_URL}/api/properties/properties/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfToken || '',
      },
      body: formData,
    });

    // Handle the response
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      console.error('Error creating property with images:', data);
      return {
        success: false,
        error: data.detail || JSON.stringify(data) || 'Failed to create property with images',
        data: data
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('Error in createPropertyWithImages:', error);
    return {
      success: false,
      error: 'Network error occurred while creating property with images: ' + error.message,
    };
  }
}

/**
 * Fetch properties using just the authentication token
 * No need for userId parameter as the API will return properties based on the authenticated user
 * @returns {Promise<ApiResponse>} API response with success flag and data or error
 */
export async function fetchPropertiesByUserId(): Promise<ApiResponse> {
  try {
    const authToken = getAuthToken();

    if (!authToken) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again."
      };
    }

    const response = await fetch(`${BASE_URL}/api/properties/properties/`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${authToken}`,  // Changed to Bearer (consistent with jobs function)
        "Content-Type": "application/json",
      },
    });

    const maindata = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: maindata.detail || "Failed to fetch properties",
        data: []
      };
    }

    // Merge self_created_properties and assigned_properties
    const createdProperty = Array.isArray(maindata.self_created_properties) ? maindata.self_created_properties : [];
    const assignedProperty = Array.isArray(maindata.assigned_properties) ? maindata.assigned_properties : [];
    const properties = Array.isArray(maindata.properties) ? maindata.properties : [];
    // Combine both arrays
    const data = [...createdProperty, ...assignedProperty, ...properties];
    console.log("what were the properties:", data);
    console.log("Created properties count:", createdProperty.length);
    console.log("Assigned properties count:", assignedProperty.length);
    console.log("Total merged properties:", data.length);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return {
      success: false,
      error: "Network error occurred while fetching properties: " + error.message,
      data: []
    };
  }
}

export async function fetchPropertiesForMeta(): Promise<ApiResponse> {
  try {
    const authToken = getAuthToken();

    if (!authToken) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again."
      };
    }

    const response = await fetch(`${BASE_URL}/api/properties/properties/`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${authToken}`,  // Changed to Bearer (consistent with jobs function)
        "Content-Type": "application/json",
      },
    });

    const maindata = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: maindata.detail || "Failed to fetch properties",
        data: []
      };
    }

    const data = maindata.meta;
    console.log("Total Properties:", data);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return {
      success: false,
      error: "Network error occurred while fetching properties: " + error.message,
      data: []
    };
  }
}

/**
 * Delete a property
 * @param {string} propertyId - The ID of the property to delete
 * @returns {Promise<ApiResponse>} - API response with success flag and data or error
 */
export async function deleteProperty(propertyId: number|string): Promise<ApiResponse> {
  if (!propertyId) {
    return { success: false, error: "Property ID is required" };
  }

  try {
    const csrfToken =  getAuthToken();;
    if (!csrfToken) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again."
      };
    }

    const response = await fetch(`${BASE_URL}/api/properties/properties/${propertyId}/`, {
      method: "DELETE",
      headers: {
        'X-CSRFToken': csrfToken,
        "Content-Type": "application/json",
      },
    });

    // For DELETE requests, a 204 No Content response is success
    if (response.status === 204) {
      return {
        success: true,
      };
    }

    // If there's a response body
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      // No JSON body in response
      data = null;
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.detail || "Failed to delete property",
        data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return {
      success: false,
      error: "Network error occurred while deleting property: " + error.message,
    };
  }
}

/**
 * Fetch a single property by ID
 * @param {string} propertyId - The ID of the property to fetch
 * @returns {Promise<ApiResponse>} - API response with success flag and data or error
 */
export async function fetchPropertyById(propertyId: string): Promise<ApiResponse> {
  if (!propertyId) {
    return { success: false, error: "Property ID is required" };
  }

  try {
    const storedToken = getAuthToken();
    const csrfToken = storedToken;

    const response = await fetch(`${BASE_URL}/api/properties/properties/${propertyId}/`, {
      method: "GET",
      headers: {
        'X-CSRFToken': csrfToken || '',
        "Content-Type": "application/json",
      },
    });

    const maindata = await response.json();

    // Merge created_jobs and assigned_jobs
    const createdProperty = Array.isArray(maindata.self_created_properties) ? maindata.self_created_properties : [];
    const assignedProperty = Array.isArray(maindata.assigned_properties) ? maindata.assigned_properties : [];

    // Combine both arrays
    const data = [...createdProperty, ...assignedProperty];
    console.log("These was properties that he get ", data);
    
    if (!response.ok) {
      return {
        success: false,
        error: maindata.detail || "Failed to fetch property details",
        data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error fetching property by ID:", error);
    return {
      success: false,
      error: "Network error occurred while fetching property details",
    };
  }
}

/**
 * Update a property
 * @param {string} propertyId - The ID of the property to update
 * @param {PropertyData} propertyData - Updated property data
 * @param {string[]} newImageUris - New images to add (optional)
 * @returns {Promise<ApiResponse>} - API response with success flag and data or error
 */
export async function updateProperty(
  propertyId: string, 
  propertyData: PropertyData, 
  newImageUris: string[] = []
): Promise<ApiResponse> {
  if (!propertyId) {
    return { success: false, error: "Property ID is required" };
  }

  try {
    const storedToken = getAuthToken();
    const csrfToken = storedToken;

    // Create a FormData object for the update
    const formData = new FormData();

    // Add property fields to form data
    if (propertyData.name !== undefined) formData.append('name', String(propertyData.name).trim());
    if (propertyData.address !== undefined) formData.append('address', String(propertyData.address).trim());
    if (propertyData.city !== undefined) formData.append('city', String(propertyData.city).trim());
    if (propertyData.state !== undefined) formData.append('state', String(propertyData.state).trim());
    if (propertyData.zipCode !== undefined) formData.append('zip_code', String(propertyData.zipCode).trim());
    if (propertyData.description !== undefined) formData.append('description', propertyData.description);
    if (propertyData.instruction !== undefined) formData.append('instruction', propertyData.instruction);
    if (propertyData.airbnblink !== undefined) formData.append('airbnb_link', propertyData.airbnblink);
    if (propertyData.bedrooms !== undefined) formData.append('bedrooms', String(parseInt(String(propertyData.bedrooms)) || 0));
    if (propertyData.bathrooms !== undefined) formData.append('bathrooms', String(parseInt(String(propertyData.bathrooms)) || 0));
    if (propertyData.type !== undefined) formData.append('property_type', propertyData.type);
    if (propertyData.area !== undefined) formData.append('area', String(parseFloat(String(propertyData.area)) || 0));
    if (propertyData.basePrice !== undefined) formData.append('base_price', String(propertyData.basePrice).trim());

    // CRITICAL FIX: Handle ALL images, not just new ones
    // Send all images (existing + new) to ensure complete update
    const allImages = propertyData.images || [];
    const combinedImages = [...allImages, ...newImageUris];

    console.log('All images to send:', combinedImages);
    console.log('Existing images:', allImages);
    console.log('New images:', newImageUris);

    // Process all images
    if (combinedImages && Array.isArray(combinedImages) && combinedImages.length > 0) {
      combinedImages.forEach((uri: string, index: number) => {
        // Validate that uri is a string and not undefined/null
        if (!uri || typeof uri !== 'string') {
          console.warn(`Skipping invalid image URI at index ${index}:`, uri);
          return;
        }

        try {
          // Handle different URI types
          if (uri.startsWith('http') || uri.startsWith('https')) {
            // Existing image - send as URL reference
            formData.append('existing_images', uri);
          } else if (uri.startsWith('file://') || uri.startsWith('data:')) {
            // New local image - send as file
            const uriParts = uri.split('/');
            const filename = uriParts[uriParts.length - 1] || `image_${index}.jpg`;

            const fileType = filename.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' :
              fileType === 'png' ? 'image/png' :
                fileType === 'gif' ? 'image/gif' : `image/${fileType}`;

            console.log(`Adding new image ${index + 1}:`, { uri, filename, fileType, mimeType });

            formData.append('images', {
              uri: uri,
              name: filename,
              type: mimeType,
            } as any);
          } else {
            console.warn(`Unknown URI format: ${uri}`);
          }
        } catch (uriError) {
          console.error(`Error processing image URI at index ${index}:`, uri, uriError);
        }
      });
    }

    console.log('Updating property with ID:', propertyId);

    // IMPORTANT: Remove Content-Type header to let fetch set it automatically with boundary
    const response = await fetch(`${BASE_URL}/api/properties/properties/${propertyId}/`, {
      method: 'PATCH',
      headers: {
        // DON'T set Content-Type for multipart/form-data - let fetch handle it
        'X-CSRFToken': csrfToken || '',
      },
      body: formData,
    });

    // Handle response
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      console.error('Error updating property:', data);
      return {
        success: false,
        error: data.detail || JSON.stringify(data) || 'Failed to update property',
        data: data
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error("Error updating property:", error);
    return {
      success: false,
      error: "Network error occurred while updating property: " + error.message,
    };
  }
}