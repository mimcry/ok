
import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";
/**
 * Get mynotifications

 * @returns {Promise<{ success: boolean; data?: any[]; error?: string; message?: string }>}
 */
export const myNotifications= async (
): Promise<{ success: boolean; data?: any[]; error?: string; message?: string }> => {
  try {
     const authToken = getAuthToken();
    
    if (!authToken) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again."
      };
    }
    
    const response = await fetch(`${BASE_URL}/api/chats/notifications/`, {
      method: "GET",
      headers: {
        'Authorization': `Token ${authToken}`, 
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || "Failed to fetch notifications",
        data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: "Network error occurred while fetching notifications: " + error.message,
    };
  }
}