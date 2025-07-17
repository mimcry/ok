import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";
export async function assignCleanerToProperty(
  propertyID: string | undefined ,
  cleanerId:string | undefined
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
     const token = getAuthToken();
    const response = await fetch(
      `${BASE_URL}/api/properties/properties/${propertyID}/assign-cleaner/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
             ...(token ? { 'X-CSRFToken': token } : {}),

        },
        body: JSON.stringify({
          "cleaner_id": cleanerId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || "Failed to assign cleaner",
      };
    }

    return {
      success: true,
      message: data.message || "Cleaner assigned successfully.",
    };
  } catch (error) {
    console.error("Assign cleaner error:", error);
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
