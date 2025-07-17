import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { KeySquare, Eye, EyeOff } from 'lucide-react-native';
import { useAppToast } from '@/hooks/toastNotification';
import { userApi } from '@/api/forgetpassword';

const ResetPasswordConfirm = () => {
  const { email, code } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useAppToast();

  const validateForm = () => {
    if (!password) {
      toast.warning("Please enter a new password");
      return false;
    }

    if (password.length < 8) {
      toast.warning("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords don't match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const result = await userApi.confirmPasswordReset( password);

      if (result.success) {
        toast.success("Password reset successful");
        
        setTimeout(() => {
          router.push("/(auth)/signin");
        }, 1500);
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password reset confirmation error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        className="flex-1 w-full"
      >
        <View className="flex-1 justify-center p-5">
          <View className="items-center py-4">
            <KeySquare size={50} color="#4925E9" />
            <Text className="text-lg font-medium text-gray-800 mt-4 text-center">
              Create New Password
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Your identity has been verified. Set your new password.
            </Text>
          </View>

          {/* Password Input */}
          <View className="mt-6">
            <View className="relative mb-4">
              <TextInput
                className="h-12 border border-gray-300 rounded-lg px-3 bg-gray-50"
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={24} color="#4925E9" />
                ) : (
                  <Eye size={24} color="#4925E9" />
                )}
              </TouchableOpacity>
            </View>

            <View className="relative mb-6">
              <TextInput
                className="h-12 border border-gray-300 rounded-lg px-3 bg-gray-50"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                className="absolute right-3 top-3"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={24} color="#4925E9" />
                ) : (
                  <Eye size={24} color="#4925E9" />
                )}
              </TouchableOpacity>
            </View>

            {/* Password requirements */}
            <View className="mb-6">
              <Text className="text-gray-500 text-sm mb-2">Password must contain:</Text>
              <Text className={`text-sm ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                • At least 8 characters
              </Text>
              <Text className={`text-sm ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                • At least one uppercase letter
              </Text>
              <Text className={`text-sm ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                • At least one number
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              className="mt-2 bg-indigo-600 py-4 rounded-xl flex-row justify-center items-center"
              activeOpacity={0.8}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">Resetting...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordConfirm;