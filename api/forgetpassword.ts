import { BASE_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "./userdetails";

/**
 * Password reset API functions
 */
export const userApi = {
  /**
   * Request password reset OTP via email
   * @param {string} email - User's email address
   * @returns {Promise<Object>} - API response
   */
requestPasswordResetOTP: async (
  email: string | string[]
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log("forget password email:", email);

    const token = getAuthToken();

    const response = await fetch(`${BASE_URL}/api/users/password-reset/request/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { "X-CSRFToken": token } : {}),
      },
      body: JSON.stringify({
        email: email.trim(),
        channel: "email",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || "Something went wrong.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.detail || "Password reset request sent.",
    };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
},


  /**
   * Verify OTP code for password reset
   * @param {string} email - User's email address
   * @param {string} code - OTP code received via email
   * @returns {Promise<Object>} - API response
   */
verifyPasswordResetOTP: async (
  email: string | string[],
  code: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const token = await AsyncStorage.getItem("auth_token");

    const response = await fetch(`${BASE_URL}/api/users/password-reset/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { "X-CSRFToken": token } : {}),
      },
      body: JSON.stringify({
        email: email.trim(),
        code: code.trim(),
        channel: "email",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || "OTP verification failed.",
        error: `Error ${response.status}`,
      };
    }
  if (data.reset_token) {
      await AsyncStorage.setItem("reset_token", data.reset_token);
    }
    return {
      success: true,
      message: data.detail  || "OTP verified successfully.",
      
    };

  } catch (error: any) {
    console.error("Password reset OTP verification error:", error);
    return {
      success: false,
      error: "Network error",
      message: error.message,
    };
  }
},


  /**
   * Confirm password reset and set new password
   * @param {string} email - User's email address
   * @param {string} code - Verified OTP code
   * @param {string} newPassword - New password to set
   * @returns {Promise<Object>} - API response
   */
confirmPasswordReset: async (
 
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const token = await AsyncStorage.getItem("reset_token");

    const payload = {
      reset_token: token,
      new_password: newPassword,
    };

    console.log("Confirm password payload:", payload);

    const response = await fetch(`${BASE_URL}/api/users/password-reset/confirm/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.log("Confirm password error response:", data);
      return {
        success: false,
        message: data.detail || data.message || "Password reset failed.",
        error: `Error ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.detail || "Password reset successfully.",
    };
  } catch (error: any) {
    console.error("Password reset confirmation error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong.",
      error: "Network error",
    };
  }
}

};