
import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";
// Type definitions
interface JobDetails {
  property: string | number | null;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

interface JobsResponse {
  success: boolean;
  data?: any[];
  error?: string;
  message?: string;
}

interface JobsApiData {
  created_jobs?: any[];
  assigned_jobs?: any[];
  detail?: string;
}

interface UploadImageFile {
  uri: string;
  type?: string;
  name?: string;
}

interface ImageUploadItem {
  file: UploadImageFile;
  type: string;
}

interface UploadResponse extends ApiResponse {
  details?: string;
}

/**
 * Create a new job
 */
export const createJob = async (
  jobDetails: JobDetails
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { "X-CSRFToken": token } : {}),
      },
      body: JSON.stringify(jobDetails),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || "Failed to create job.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.detail || "Job created successfully.",
    };
  } catch (error: any) {
    console.error("Create job error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
};

/**
 * Get jobs
 */
export const getJobs = async (
  propertyId?:number| string | null | any[]
): Promise<JobsResponse> => {
  try {
    const token = getAuthToken();;
    
    // Construct URL with query parameter if propertyId is provided
    let url = `${BASE_URL}/api/jobs/`;
    if (propertyId) {
      url += `?property=${propertyId}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    const maindata: JobsApiData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: maindata.detail || "Failed to fetch jobs.",
        error: `Error ${response.status}`,
      };
    }

    // Merge created_jobs and assigned_jobs
    const createdJobs = Array.isArray(maindata.created_jobs) ? maindata.created_jobs : [];
    const assignedJobs = Array.isArray(maindata.assigned_jobs) ? maindata.assigned_jobs : [];
    
    // Combine both arrays
    const mergedJobs = [...createdJobs, ...assignedJobs];

    return {
      success: true,
      data: mergedJobs,
    };
  } catch (error: any) {
    console.error("Get jobs error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
      data: [],
    };
  }
};

/**
 * Get job history
 */
export const getJobHistory = async (
  propertyId?: string | null
): Promise<JobsResponse> => {
  try {
    const token = getAuthToken();
    let url = `${BASE_URL}/api/jobs/history/`;
    if (propertyId) {
      url += `?property=${propertyId}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch job history.",
        error: `Error ${response.status}`,
      };
    }
    
    const maindata = await response.json().catch(() => []);
    
    // The API returns an array of job objects directly - no need to extract 'data' field
    const jobHistoryArray = Array.isArray(maindata) ? maindata : [];
    
    console.log("Job history received for this user:", jobHistoryArray);
    
    return {
      success: true,
      data: jobHistoryArray,
    };
  } catch (error: any) {
    console.error("Get job history error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
      data: [],
    };
  }
};

/**
 * Call backend to update job status
 */
export const updateJobStatus = async (
  id: string | string[]
): Promise<ApiResponse> => {
  try {
  const token = getAuthToken();

    const url = `${BASE_URL}/api/jobs/${id}/start/`; 

    const response = await fetch(url, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || "Failed to update job status.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Update job status error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
};

/**
 * Call backend to update job status to complete
 */
export const updateCompleteJobStatus = async (
  id: string | string[] | undefined
): Promise<ApiResponse> => {
  try {
     const token = getAuthToken();
    const url = `${BASE_URL}/api/jobs/${id}/complete/`; 

    const response = await fetch(url, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || "Failed to update job status.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Update job status error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
};

/**
 * Helper function to get MIME type from file extension
 */
const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
};

/**
 * Upload multiple images to job with a single image type
 * @param jobId - The job ID
 * @param images - Array of objects with file and type
 * @returns Promise with upload result
 * 
 * Note: Backend expects 'image_type' (singular) and multiple 'images' with same key
 */
export const uploadCleaningImages = async (
  jobId: string | undefined,
  images: ImageUploadItem[]
): Promise<UploadResponse> => {
  try {
   const token = getAuthToken();
    if (!token) {
      console.log('No auth token found');
      return { success: false, error: 'Authentication token not found' };
    }

    if (!images || images.length === 0) {
      console.log('No images provided');
      return { success: false, error: 'No images provided for upload' };
    }

    const url = `${BASE_URL}/api/jobs/${jobId}/images/`;
    
    console.log('Upload URL:', url);
    console.log('Token exists:', !!token);
    console.log('Images to upload:', images.length);

    const formData = new FormData();

    // Based on backend example, we need to send image_type once and multiple images
    // Assuming all images have the same type (e.g., 'before', 'after', 'during')
    const imageType = images[0]?.type || 'before'; // Default to 'before' if not specified
    formData.append('image_type', imageType);

    // Add each image file to form data
    images.forEach((item, index) => {
      if (!item.file || !item.file.uri) {
        console.warn(`Image ${index + 1} missing file or URI`);
        return;
      }

      console.log(`Processing image ${index + 1}:`, {
        hasUri: !!item.file.uri,
        type: item.file.type,
        name: item.file.name,
        imageType: item.type
      });

      // Ensure proper file extension and MIME type
      const fileExtension = item.file.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = item.file.type || getMimeTypeFromExtension(fileExtension);
      const fileName = item.file.name || `image_${index + 1}.${fileExtension}`;

      // For React Native, append the file object with key 'images' (same key for all files)
      formData.append('images', {
        uri: item.file.uri,
        type: mimeType,
        name: fileName,
      } as any); // Type assertion needed for FormData compatibility
    });

    // Validate that we have files to upload
    const formDataParts = (formData as any)._parts;
    if (!formDataParts || formDataParts.length === 0) {
      return { success: false, error: 'No valid images to upload' };
    }

    // Log FormData contents for debugging
    console.log('FormData contents:');
    formDataParts.forEach(([key, value]: [string, any]) => {
      console.log(key, ':', typeof value === 'object' ? JSON.stringify(value) : value);
    });

    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRFToken': token
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Get response text first to handle potential HTML error pages
    const responseText = await response.text();
    console.log('Raw response:', responseText.substring(0, 500));

    let result: any = {};
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      
      // Handle HTML error responses
      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        console.log('Received HTML error page instead of JSON');
        
        // Try to extract error message from HTML
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
        const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';
        
        return { 
          success: false, 
          error: `Server returned HTML error: ${errorTitle}`,
          details: 'Check server logs for more information'
        };
      }
      
      return { 
        success: false, 
        error: 'Invalid response format from server',
        details: responseText.substring(0, 200)
      };
    }

    if (!response.ok) {
      console.log('Request failed with status:', response.status);
      return { 
        success: false, 
        error: result.error || result.message || `HTTP ${response.status}`,
        details: result.details || 'Request failed'
      };
    }

    console.log('Upload successful:', result);
    return { 
      success: true, 
      message: result.message || 'Images uploaded successfully',
      data: result.data
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle network errors
    if (error.message.includes('Network request failed')) {
      return { 
        success: false, 
        error: 'Network connection failed. Please check your internet connection.',
        details: error.message
      };
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout')) {
      return { 
        success: false, 
        error: 'Upload timed out. Please try again.',
        details: error.message
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during upload',
      details: error.toString()
    };
  }
};
/**
 * Fetch images associated with a job by job ID
 * @param {string} jobId - The ID of the job
 * @returns {Promise<ApiResponse>} - API response with success flag and data or error
 */
export async function fetchJobImagesById(jobId: string): Promise<ApiResponse> {
  if (!jobId) {
    return { success: false, error: "Job ID is required" };
  }

  try {
   
    const csrfToken = getAuthToken()

    const response = await fetch(`${BASE_URL}/api/jobs/${jobId}/images/`, {
      method: "GET",
      headers: {
        'X-CSRFToken': csrfToken || '',
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || "Failed to fetch job images",
        data: [],
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error fetching job images:", error);
    return {
      success: false,
      error: "Network error occurred while fetching job images",
    };
  }
}
