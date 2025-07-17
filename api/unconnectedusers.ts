import { User } from "@/context/userAuthStore";
import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";

interface CandidatesResponse {
  success: boolean;
  candidates?: User[];
  error?: string;
}

export async function fetchCandidates(): Promise<CandidatesResponse> {
  try {
     const token = getAuthToken();

    if (!token) {
      return { success: false, error: 'No token found. Please log in again.' };
    }

    const response = await fetch(`${BASE_URL}/api/users/users/candidates/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Fetched candidateeees:', JSON.stringify(data));

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || 'Failed to fetch candidates',
      };
    }

    return {
      success: true,
      candidates: data, // Adjust if the response is like { candidates: [...] }
    };

  } catch (error) {
    console.error('Candidate fetch error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}
