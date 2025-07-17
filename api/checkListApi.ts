
import { BASE_URL } from '@/utils/config';
import { getAuthToken } from './userdetails';

// Interface for checklist data
interface ChecklistData {
  property: number | null;
  room: string| null | undefined;
  description: string;
  priority:string | null |undefined;
}

// Interface for updating checklist data
interface UpdateChecklistData extends ChecklistData {
  id: string;
}

// API Response interface
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}
export const getChecklist = async (
  
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();

    const url = `${BASE_URL}/api/properties/checklist/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { 'X-CSRFToken': token } : {}),
      }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || result.message || "Failed to get checklist item.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      data: result,
      message: "Checklist ifetched successfully.",
    };
  } catch (error: any) {
    console.error("Fetching checklist error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to create checklist item.",
    };
  }
};
export const createPropertyChecklist = async (
  checklistData: ChecklistData
): Promise<ApiResponse> => {
  try {
 const token = getAuthToken();

    const url = `${BASE_URL}/api/properties/checklist/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      body: JSON.stringify(checklistData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || result.message || "Failed to create checklist item.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      data: result,
      message: "Checklist item created successfully.",
    };
  } catch (error: any) {
    console.error("Create checklist error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to create checklist item.",
    };
  }
};

export const updatePropertyChecklist = async (
  checklistData: UpdateChecklistData
): Promise<ApiResponse> => {
  try {
   const token = getAuthToken();
    const url = `${BASE_URL}/api/properties/checklist/${checklistData.id}/`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      body: JSON.stringify({
        property: checklistData.property,
        room: checklistData.room,
        description: checklistData.description,
        priority: checklistData.priority,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || result.message || "Failed to update checklist item.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      data: result,
      message: "Checklist item updated successfully.",
    };
  } catch (error: any) {
    console.error("Update checklist error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to update checklist item.",
    };
  }
};

export const deletePropertyChecklist = async (
  checklistId: number
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();

    const url = `${BASE_URL}/api/properties/checklist/${checklistId}/`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: false,
        message: result.detail || result.message || "Failed to delete checklist item.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      message: "Checklist item deleted successfully.",
    };
  } catch (error: any) {
    console.error("Delete checklist error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message || "Failed to delete checklist item.",
    };
  }
};