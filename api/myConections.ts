
import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";

export async function myConnections() {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found',
      };
    }
    
    const response = await fetch(`${BASE_URL}/api/chats/my-connections/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
        'X-CSRFToken': token,
      },
    });
    
    // Check response content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Handle non-JSON responses
      const textResponse = await response.text();
      console.error('Server returned non-JSON response:', textResponse.substring(0, 200));
      return {
        success: false,
        error: 'Server returned an invalid response format',
        statusCode: response.status,
      };
    }
    
    const data = await response.json();
    console.log("backend data for connections",data)
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || `Request failed with status: ${response.status}`,
      };
    }
    
    return {
      success: true,
      data: data, // Return the full data object
      message: data.message,
    };
  } catch (error) {
    console.error('Connection requests error:', error);
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}