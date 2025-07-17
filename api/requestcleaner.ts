import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";

interface RequestResponse {
 success: boolean;
  message?: string;
  error?: string;
  status?: string;
  connection_id?: number;
}

export async function requesttoconnect(targetUserId: string | number): Promise<RequestResponse> {
  try {
    const token = getAuthToken();

    const cleanerId = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;

    console.log("Making request to cleaner:", cleanerId);

    if (!token) {
      return { success: false, error: 'No token found. Please log in again.' };
    }

    if (isNaN(cleanerId as number)) {
      return { success: false, error: 'Invalid cleaner ID' };
    }

    const response = await fetch(`${BASE_URL}/api/chats/connections/request/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'X-CSRFToken': token,
        'Content-Type': 'application/json',
       
      },
      body: JSON.stringify({
        target_user_id: cleanerId
      })
    });

    console.log('Response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Request cleaner response:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || 'Failed to request cleaner.',
        };
      }

      return {
        success: true,
        message: data.message || 'Request sent successfully',
      };
    } else {
      const textResponse = await response.text();
      console.log('Non-JSON response received:', textResponse.substring(0, 200) + '...');

      return {
        success: false,
        error: `Server returned non-JSON response (${response.status}). Please check server logs.`
      };
    }
  } catch (error) {
    console.error('Request cleaner error:', error);
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}


interface Partner {
  id: number;
  email: string;
  full_name: string;
  profile_picture: string | null;
  average_rating: number | null;
  speciality: string | null;
  experience: string | null;
  phone_number: string;
}

interface PendingRequest {
  id: number;
  partner: Partner;
  status: string;
  created_at: string;
  unread_count: number;
}

interface PendingRequestsResponse {
  success: boolean;
  data?: PendingRequest[];
  error?: string;
}

/**
 * Fetch pending connection requests
 * @returns {Promise<PendingRequestsResponse>}
 */
export const fetchPendingRequests = async (): Promise<PendingRequestsResponse> => {
  try {
   const token = getAuthToken();
    const url = `${BASE_URL}/api/chats/connections/requests/sent/`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: result.detail || "Failed to fetch pending requests.",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Fetch pending requests error:", error);
    return {
      success: false,
      error: "Network error",
    };
  }
};

/**
 * Cancel a connection request
 * @param {number} userId - The ID of the user to cancel request for
 * @returns {Promise<{ success: boolean; error?: string; message?: string }>}
 */
export const cancelConnectionRequest = async (
  userId: number
): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    const token = getAuthToken();
    const url = `${BASE_URL}/api/chats/connections/cancel/`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
              ...(token ? { 'X-CSRFToken': token } : {}),

      },
      body: JSON.stringify({
        "connection_id": userId,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || "Failed to cancel connection request.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      message: "Connection request cancelled successfully.",
    };
  } catch (error: any) {
    console.error("Cancel connection request error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
};