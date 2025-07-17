import { User } from "@/context/userAuthStore";
import { BASE_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "./userdetails";

// Response shape for local login
interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  data?: string;
}

// Function: Authenticate with email/password
export async function authenticateUser(userData: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.email || data.password || data.detail || "Authentication failed",
      };
    }

    if (data.detail === "Login successful") {
      const user: User = {
        id: String(data.user_id),
        email: userData.email,
        role: (data.role as "host" | "cleaner") || "cleaner",

        zipCode: "",


        first_name: "",

        profile_picture: "",
        city: "",
        state: "",
        country: "",

        phone: "",
        date_joined: "",
        name: "",
        last_name: ""
      };

      const token = data.csrf_token;

      // Store credentials locally
      await AsyncStorage.multiSet([
        ["auth_token", token],
        ["user_role", user.role],
        ["user_id", user.id],
      ]);

      return {
        success: true,
        token,
        user,
      };
    }

    return {
      success: false,
      error: "Login was not successful",
    };
  } catch (error) {
    console.error("Login network error:", error);
    return { success: false, error: "Network error occurred" };
  }
}

// Response shape for Google login
interface GoogleAuthResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: User;
  token?: string;
}

// Function: Authenticate with Google
export const authenticateWithGoogle = async (
  idToken: string
): Promise<GoogleAuthResponse> => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${BASE_URL}/api/users/login/google/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { "X-CSRFToken": token } : {}),
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.detail || result.message || "Google sign-in failed.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      user: result.user,
      token: result.token,
    };
  } catch (error: any) {
    console.error("Google authentication error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
};
