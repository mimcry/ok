import { BASE_URL } from "@/utils/config";
import { getAuthToken } from './userdetails';
/**
 * Submit review and rating for a job
 * @param {number} score - Rating score (1-5)
 * @param {string} comment - Review comment
 * @param {string} cleaner_id} - Job ID (optional, if needed for the endpoint)
 * @returns {Promise<{ success: boolean; data?: any; error?: string; message?: string }>}
 */
export const submitReview = async (
  cleaner_id: string | number,
  score: string | number, 
  comment: string
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
  try {
     const token = getAuthToken();
    
    // Debug token
    console.log("Token exists:", !!token);
    console.log("Token preview:", token ? `${token.substring(0, 20)}...` : 'No token');
    
    let url = `${BASE_URL}/api/users/cleaners/${cleaner_id}/rating/`;
    console.log("URL:", url);
    console.log("cleaner_id:", cleaner_id);
    console.log("score:", score);
    console.log("comment:", comment);
    
    const requestBody = {
      "score": score,
      "comment": comment,
    };
    
    console.log("Submitting review:", requestBody);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
                ...(token ? { 'X-CSRFToken': token } : {}),

        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
    });
    
    // Get more detailed error info
    const responseText = await response.text();
    console.log("Raw response:", responseText);
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.log("Could not parse error response as JSON");
      }
      
      return {
        success: false,
        message: errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        error: `Error ${response.status}`,
      };
    }
    
    const responseData = JSON.parse(responseText);
    console.log("Review submitted successfully:", responseData);
    
    return {
      success: true,
      data: responseData,
      message: "Review submitted successfully!",
    };
  } catch (error: any) {
    console.error("Submit review error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to submit review due to network error.",
    };
  }
};