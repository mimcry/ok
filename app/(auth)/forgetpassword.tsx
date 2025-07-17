import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { router } from 'expo-router';
import CustomAlert from '@/hooks/customAlert';
import { userApi } from '@/api/forgetpassword';

/**
 * ForgotPasswordScreen component for requesting password reset via email
 */
function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'warning',
    title: '',
    message: '',
  });

  /**
   * Show alert with specified configuration
   */
  const showAlertWithConfig = (type: string, title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle password reset request
   */
  const handleResetPassword = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Basic validation
    if (!email.trim()) {
      showAlertWithConfig('warning', 'Missing Email', 'Please enter your email address.');
      return;
    }
    
    if (!isValidEmail(email)) {
      showAlertWithConfig('warning', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Requesting password reset OTP for:', email);
      
      const result = await userApi.requestPasswordResetOTP(email);
      
      console.log('Reset password OTP request result:', result);
      
      if (result.success) {
        // Navigate to OTP verification screen
        router.replace({
          pathname: "/(auth)/fogetpasswordotpverification",
          params: {
            email
          }
        });
      } else {
        // Show error message from server
        showAlertWithConfig(
          'danger', 
          'Error', 
          result.message || "Failed to send reset code"
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showAlertWithConfig(
        'danger',
        'Unexpected Error',
        'Something went wrong. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5 justify-center bg-white">
      {/* Header */}
      <Text className="text-2xl font-bold mb-2 text-center">Forgot Password</Text>
      <Text className="text-base mb-8 text-center text-gray-600">
        Enter your email address and we'll send you a code to reset your password.
      </Text>
      
      {/* Email Input */}
      <TextInput
        className="h-12 border border-gray-300 rounded-lg mb-5 px-3"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {/* Submit Button */}
      <TouchableOpacity
        className={`h-12 rounded-lg justify-center items-center mb-5 ${
          isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
        }`}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Sending...</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-base">Request Reset Code</Text>
        )}
      </TouchableOpacity>
      
      {/* Back to Login */}
      <TouchableOpacity
        className="justify-center items-center"
        onPress={() => router.back()}
        disabled={isLoading}
      >
        <Text className="text-indigo-600 text-base">Back to Login</Text>
      </TouchableOpacity>
      
      {/* Alert Component */}
      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onCancel={() => setShowAlert(false)}
        onConfirm={() => setShowAlert(false)}
      />
    </View>
  );
}

export default ForgotPasswordScreen;