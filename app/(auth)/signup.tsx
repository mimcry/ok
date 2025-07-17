import { SimpleInputField } from "@/components/SimpleInputField";
import { useAppToast } from "@/hooks/toastNotification";
import { BASE_URL } from "@/utils/config";
import { router } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface SignUpScreenProps {
  onGoogleSignIn?: () => void;
}

interface ValidationErrors { 
  email?: string;
  password?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: string;
}

// API registration function
const register = async (userData: {  
  email: string;
  password: string;
  first_name: string;
  confirm_password: string;
  last_name: string;
  phone_number: string;
  role: string;
}) => {
  try {
    // Make the API request
    const response = await fetch(`${BASE_URL}/api/users/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    console.log("Registration response:", data);

    if (!response.ok) {
      // Extract error messages from API response
      if (data.email) {
        return { success: false, msg: `Email: ${data.email[0]}` };
      } else if (data.password) {
        return { success: false, msg: `Password: ${data.password[0]}` };
      } else if (data.message) {
        return { success: false, msg: data.message };
      } else if (data.detail) {
        return { success: false, msg: data.detail };
      } else if (data.non_field_errors) {
        return { success: false, msg: data.non_field_errors[0] };
      }
      
      return { success: false, msg: "Registration failed" };
    }
     
    // Return success response
    return { success: true, data };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

export default function SignUp({
  onGoogleSignIn,
}: SignUpScreenProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("host");  
  // UI state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);  
  const toast = useAppToast()
  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    
    if (value.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(value)) {
      setErrors(prev => ({ 
        ...prev, 
        password: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  };

  const validateConfirmPassword = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, confirm_password: 'Confirm password is required' }));
      return false;
    }
    
    if (value !== password) {
      setErrors(prev => ({ ...prev, confirm_password: 'Passwords must match' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, confirm_password: undefined }));
    return true;
  };

  const validateFirstName = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, first_name: 'First name is required' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, first_name: undefined }));
    return true;
  };

  const validateLastName = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, last_name: 'Last name is required' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, last_name: undefined }));
    return true;
  };

  const validatePhoneNumber = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, phone_number: 'Phone number is required' }));
      return false;
    }
    
    if (value.length < 10) {
      setErrors(prev => ({ ...prev, phone_number: 'Phone number must be at least 10 digits' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, phone_number: undefined }));
    return true;
  };

  const validateRole = (value: string): boolean => {
    if (!value || (value !== 'host' && value !== 'cleaner')) {
      setErrors(prev => ({ ...prev, role: 'Please select a valid role' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, role: undefined }));
    return true;
  };

  // Validate all form fields
  const validateForm = (): boolean => {

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isPhoneNumberValid = validatePhoneNumber(phoneNumber);
    const isRoleValid = validateRole(role);
    
    return (
     
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid &&
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumberValid &&
      isRoleValid
    );
  };

  const handleSignUp = async (): Promise<void> => {
    setIsSubmitting(true);
    
    const isValid = validateForm();
    
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
  
    try {
      const userData = {
        
        email: email,
        password: password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        role: role,
      };

      const response = await register(userData);
      
      if (!response.success) {
        toast.error(response.msg);
      } else {
        toast.success("Registration successful! Please verify your email.");
        
        // Navigate to OTP verification screen after successful registration
        router.push({
          pathname: "/(auth)/otpverification",
          params: { email: email }
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Sign up error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    router.push("/(auth)/signin");
  };

  // Dropdown component for role selection
  const RoleSelection = () => (
  <View>
    <Text className="text-gray-700 mb-2 font-medium">Role</Text>
    <View className="flex-row space-x-3 gap-3">
      <TouchableOpacity
        className={`flex-1 border rounded-lg h-12 items-center justify-center ${
          role === "host" 
            ? "border-indigo-600 bg-indigo-50" 
            : "border-gray-300 bg-white"
        }`}
        onPress={() => setRole("host")}
        activeOpacity={0.7}
      >
        <Text className={`font-medium ${
          role === "host" ? "text-indigo-600" : "text-gray-800"
        }`}>
          Host
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className={`flex-1 border rounded-lg h-12 items-center justify-center ${
          role === "cleaner" 
            ? "border-indigo-600 bg-indigo-50" 
            : "border-gray-300 bg-white"
        }`}
        onPress={() => setRole("cleaner")}
        activeOpacity={0.7}
      >
        <Text className={`font-medium ${
          role === "cleaner" ? "text-indigo-600" : "text-gray-800"
        }`}>
          Cleaner
        </Text>
      </TouchableOpacity>
    </View>
    
    {errors.role && (
      <Text className="text-red-500 text-xs mt-1">{errors.role}</Text>
    )}
  </View>
);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleKeyboardDismiss = () => {
      setDropdownOpen(false);
    };

    Keyboard.addListener('keyboardDidHide', handleKeyboardDismiss);

    return () => {
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
          
            activeOpacity={1} 
            onPress={() => {
              Keyboard.dismiss();
              setDropdownOpen(false);
            }}
            style={{ flex: 1 }}
          >
            <View className="px-6 py-4 flex-1 justify-center">
              {/* Header with solid background instead of gradient */}
              <View className="items-center mb-8">
                <View className="bg-indigo-100 w-20 h-20 rounded-full items-center justify-center mb-3 shadow-md">
                  <Image
                    source={require("@/assets/images/hero.png")}
                    className="w-14 h-14"
                    resizeMode="contain"
                    style={{ tintColor: '#4338ca' }} 
                  />
                </View>
                <Text className="text-3xl font-bold text-gray-800 mt-3">Create Account</Text>
                <Text className="text-gray-500 text-center mt-2">Join our community today</Text>
              </View>

              {/* Form */}
              <View className="space-y-5 gap-4">
                {/* Basic Info Section */}
                <View className="mb-2">
                  <Text className="text-lg font-semibold text-gray-800 border-l-4 border-indigo-500 pl-2">
                    Personal Information
                  </Text>
                </View>
                
                {/* First Name and Last Name */}
                <View className="flex-row space-x-3 gap-4">
                  <View className="flex-1">
                    <SimpleInputField
                      label="First Name"
                      value={firstName}
                      setValue={(value:any) => {
                        setFirstName(value);
                        validateFirstName(value);
                      }}
                      placeholder="John"
                      error={errors.first_name}
                      testID="first-name-input"
                    />
                  </View>
                  <View className="flex-1">
                    <SimpleInputField
                      label="Last Name"
                      value={lastName}
                      setValue={(value:any) => {
                        setLastName(value);
                        validateLastName(value);
                      }}
                      placeholder="Doe"
                      error={errors.last_name}
                      testID="last-name-input"
                    />
                  </View>
                </View>

              
                
                {/* Email */}
                <SimpleInputField
                  label="Email"
                  value={email}
                  setValue={(value:string) => {
                    setEmail(value);
                    validateEmail(value);
                  }}
                  placeholder="example@gmail.com"
                  error={errors.email}
                  keyboardType="email-address"
                  testID="email-input"
                />
                
                {/* Phone Number */}
                <SimpleInputField
                  label="Phone Number"
                  value={phoneNumber}
                  setValue={(value:string) => {
                    setPhoneNumber(value);
                    validatePhoneNumber(value);
                  }}
                  placeholder="(123) 456-7890"
                  error={errors.phone_number}
                  keyboardType="phone-pad"
                  testID="phone-input"
                />
                
                {/* Role Dropdown */}
                <RoleSelection/>
                
                {/* Account Security Section */}
                <View className="mb-2 mt-6">
                  <Text className="text-lg font-semibold text-gray-800 border-l-4 border-indigo-500 pl-2">
                    Security
                  </Text>
                </View>
                
                {/* Password */}
                <SimpleInputField
                  label="Password"
                  value={password}
                  setValue={(value:string) => {
                    setPassword(value);
                    validatePassword(value);
                    // Also validate confirm password in case it was already entered
                    if (confirmPassword) {
                      validateConfirmPassword(confirmPassword);
                    }
                  }}
                  placeholder="Create a strong password"
                  error={errors.password}
                  secureTextEntry={!showPassword}
                  showPasswordToggle={true}
                  passwordVisible={showPassword}
                  togglePasswordVisibility={() => setShowPassword(!showPassword)}
                  testID="password-input"
                />
                
                {/* Confirm Password */}
                <SimpleInputField
                  label="Confirm Password"
                  value={confirmPassword}
                  setValue={(value:string) => {
                    setConfirmPassword(value);
                    validateConfirmPassword(value);
                  }}
                  placeholder="Confirm your password"
                  error={errors.confirm_password}
                  secureTextEntry={!showConfirmPassword}
                  showPasswordToggle={true}
                  passwordVisible={showConfirmPassword}
                  togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                  testID="confirm-password-input"
                />

                {/* Sign Up Button - Using solid color instead of gradient */}
                <TouchableOpacity
                 testID="create-account-button"
                  className={`${
                    isSubmitting ? "bg-indigo-400" : "bg-indigo-600"
                  } rounded-lg py-4 items-center mt-8 shadow-md`}
                  onPress={handleSignUp}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Sign up"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold text-lg">Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Terms and Privacy */}
                <Text className="text-gray-500 text-center text-xs mt-3">
                  By creating an account, you agree to our{"\n"}
                  <Text className="text-indigo-600">Terms & Privacy Policy</Text>
                </Text>

                <View className="flex-row items-center justify-center my-5">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-gray-500 mx-3">or</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>
                
                {/* Google Sign In */}
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg py-3 items-center flex-row justify-center bg-white shadow-sm"
                  onPress={onGoogleSignIn}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in with Google"
                >
                  <Image
                    source={require("@/assets/images/google.png")}
                    className="w-5 h-5"
                  />
                  <Text className="text-gray-700 ml-2 font-medium">Continue with Google</Text>
                </TouchableOpacity>

                {/* Already have account */}
                <View className="flex-row justify-center mt-6 mb-4">
                  <Text className="text-gray-600">Already have an account? </Text>
                  <TouchableOpacity onPress={handleSignIn}>
                    <Text className="text-indigo-600 font-semibold">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}