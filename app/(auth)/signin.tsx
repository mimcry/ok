import { authenticateUser, authenticateWithGoogle } from '@/api/auth';
import { fetchUserDetails } from '@/api/userdetails';
import { useAuthStore } from '@/context/userAuthStore';
import { useAppToast } from '@/hooks/toastNotification';
import { GOOGLE_CLIENT_ID } from '@/utils/config';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

interface Assets {
  workerIcon: any;
  googleIcon: any;
}

interface SignInScreenProps {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
}

export default function SignInScreen({
  onSignUp,
  onForgotPassword,
  onGoogleSignIn,
  onFacebookSignIn
}: SignInScreenProps): JSX.Element {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
 
  const toast = useAppToast()
  
  // Get authentication state setter from Zustand store
  const setAuth = useAuthStore(state => state.setAuth);
  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:GOOGLE_CLIENT_ID, 
   
  });

  const assets: Assets = {
    workerIcon: require('@/assets/images/hero.png'),
    googleIcon: require('@/assets/images/google.png'),
  };

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      toast.error('Google Sign-In was cancelled or failed');
      setIsGoogleLoading(false);
    } else if (response?.type === 'cancel') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  // Handle Google authentication with backend
  const handleGoogleSignIn = async (idToken: string): Promise<void> => {
    try {
      setIsGoogleLoading(true);
      
      // Call your API with the Google ID token
      const result = await authenticateWithGoogle(idToken);
      
      if (result.success && result.user && result.token) {
        // First, set basic auth with the login response data
        setAuth(result.token, result.user);
  
        // Then try to fetch additional user details
        try {
          const userDetailsResponse = await fetchUserDetails(result.user.id, result.token, result.user.role);
          
          if (userDetailsResponse.success && userDetailsResponse.user) {
            // Update auth with the complete user details
            setAuth(result.token, userDetailsResponse.user);
          }
        } catch (detailsError) {
          // If fetching details fails, continue with basic user info
          console.error("Failed to fetch user details:", detailsError);
        }
        
        // Show success toast
        toast.success("Google Sign-In successful!");
        
        // Navigate based on user role
        if (result.user.role === 'host') {
          router.replace('/(root_host)/(tabs)');
        } else if (result.user.role === 'cleaner') {
          router.replace('/(root_cleaner)/(tabs)');
        } else {
          // Default route if role is not recognized
          router.replace('/');
        }
      } else {
        // Show error toast
        toast.error(result.message || result.error || "Google Sign-In failed");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast.error("Something went wrong with Google Sign-In. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Google Sign-In button press
  const handleGoogleSignInPress = async (): Promise<void> => {
    try {
      setIsGoogleLoading(true);
      
      if (onGoogleSignIn) {
        // If custom handler is provided, use it
        onGoogleSignIn();
      } else {
        // Use the built-in Google authentication
        await promptAsync();
      }
    } catch (error) {
      console.error("Error initiating Google Sign-In:", error);
      toast.error("Failed to initiate Google Sign-In");
      setIsGoogleLoading(false);
    }
  };
  
  // Basic field validation
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
    
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  };

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value);
  };

  // Handle sign in button press
  const handleSignIn = async(): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Validate fields
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      
      if (!isEmailValid || !isPasswordValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Call API for authentication
      const response = await authenticateUser({ email, password });
      
      // Check if login was successful
      if (response.success && response.user && response.token) {
        // First, set basic auth with the login response data
        setAuth(response.token, response.user);
        
        // Then try to fetch additional user details
        try {
          const userDetailsResponse = await fetchUserDetails(response.user.id, response.token,response.user.role);
          
          if (userDetailsResponse.success && userDetailsResponse.user) {
            // Update auth with the complete user details
            setAuth(response.token, userDetailsResponse.user);
          }
        } catch (detailsError) {
          // If fetching details fails, continue with basic user info
          console.error("Failed to fetch user details:", detailsError);
          // We won't show an error to the user since login was still successful
        }
        
        // Show success toast
        toast.success("Login successful!");
        
        // Navigate based on user role
        if (response.user.role === 'host') {
          router.replace('/(root_host)/(tabs)');
        } else if (response.user.role === 'cleaner') {
          router.replace('/(root_cleaner)/(tabs)');
        } else {
          // Default route if role is not recognized
          router.replace('/');
        }
      } else {
        // Show error toast
        toast.error(response.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      // Show general error toast
      toast.error("Something went wrong. Please try again later.");
      console.error("Sign in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-8 flex-1 justify-center">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="bg-indigo-100 w-20 h-20 rounded-full items-center justify-center mb-3">
            <Image 
              source={require("@/assets/images/hero.png")} 
              className="w-12 h-12"
              style={{ tintColor: '#4338ca' }} 
            />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mt-2">Welcome Back</Text>
          <Text className="text-gray-500 mt-1">Sign in to continue</Text>
        </View>

        {/* Form */}
        <View className="space-y-5 gap-4">
          {/* Email field */}
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-4 text-gray-700`}
              placeholder="example@gmail.com"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password field */}
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="relative flex-row items-center">
              <TextInput
                className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-4 text-gray-700 flex-1`}
                placeholder="••••••••"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="password-input"
              />
              <TouchableOpacity 
                className="absolute right-3"
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} color="#6B7280" />
                ) : (
                  <EyeIcon size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            className="items-end" 
            onPress={()=>router.push("/(auth)/forgetpassword")}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text className="text-indigo-600 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity 
            className={`${
              isSubmitting ? "bg-indigo-400" : "bg-indigo-600"
            } rounded-lg py-4 items-center mt-4 shadow-md`}
            onPress={handleSignIn}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-500 mx-4 text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="flex-row space-x-4 gap-4">
            {/* Google Sign In */}
            <TouchableOpacity 
              className={`border border-gray-300 rounded-lg py-3 items-center flex-row justify-center flex-1 ${
                isGoogleLoading ? 'opacity-50' : ''
              }`}
              onPress={handleGoogleSignInPress}
              disabled={isGoogleLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#4B5563" />
              ) : (
                <Image 
                  source={assets.googleIcon} 
                  className="w-5 h-5"
                />
              )}
              <Text className="text-gray-700 ml-2 font-medium">
                {isGoogleLoading ? 'Signing in...' : 'Google'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Don't have account */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={()=>router.push("/(auth)/signup")}>
              <Text className="text-indigo-600 font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}