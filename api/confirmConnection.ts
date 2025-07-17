import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";
export async function confirmConnection(connectionId: number | undefined, action: 'accept' | 'reject'): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
   const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/api/chats/connections/confirm/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
                 ...(token ? { 'X-CSRFToken': token } : {}),

      },
      body: JSON.stringify({
        connection_id: connectionId,
        action: action,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || 'Failed to confirm connection',
      };
    }

    return {
      success: true,
      message: data.message || `Connection ${action}ed successfully.`,
    };
  } catch (error) {
    console.error('Confirm connection error:', error);
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
