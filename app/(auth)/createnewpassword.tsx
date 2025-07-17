import { userApi } from '@/api/forgetpassword';
import CustomAlert from '@/hooks/customAlert';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * New Password Screen - For setting a new password after OTP verification
 */
function NewPasswordScreen() {
  // Get params from previous screen
  const { email, code } = useLocalSearchParams();
  
  // State management
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'warning',
    title: '',
    message: '',
  });

  // Validation state
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Check if we have the required params
  useEffect(() => {
    if (!email || !code) {
      showAlertWithConfig(
        'danger',
        'Missing Information',
        'Required information is missing. Please restart the password reset process.'
      );
    }
  }, [email, code]);

  /**
   * Show alert with specified configuration
   */
  const showAlertWithConfig = (type: string, title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  /**
   * Validate password strength
   * At least 8 characters, with at least one uppercase letter, one lowercase letter, and one number
   */
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  /**
   * Handle form validation
   */
  const validateForm = () => {
    Keyboard.dismiss();
    
    // Check if passwords are entered
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showAlertWithConfig('warning', 'Missing Fields', 'Please fill in all fields.');
      return false;
    }
    
    // Validate password strength
    const isValid = validatePassword(newPassword);
    setIsPasswordValid(isValid);
    if (!isValid) {
      showAlertWithConfig(
        'warning',
        'Weak Password',
        'Password must be at least 8 characters and include uppercase, lowercase, and numbers.'
      );
      return false;
    }
    
    // Check if passwords match
    const doPasswordsMatch = newPassword === confirmPassword;
    setPasswordsMatch(doPasswordsMatch);
    if (!doPasswordsMatch) {
      showAlertWithConfig('warning', 'Passwords Do Not Match', 'Please ensure both passwords match.');
      return false;
    }
    
    return true;
  };

  /**
   * Handle password reset confirmation
   */
  const handleSetNewPassword = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      const result = await userApi.confirmPasswordReset(newPassword);
      
      console.log('Password reset confirmation result:', result);
      
      if (result.success) {
        showAlertWithConfig(
          'success',
          'Password Updated',
          'Your password has been successfully reset. You can now log in with your new password.'
        );
        
        // Redirect to login after alert is dismissed
        setTimeout(() => {
          return router.replace('/(auth)/signin');
        }, 2000);
      } else {
        showAlertWithConfig(
          'danger',
          'Error',
          result.message || 'Failed to reset password. Please try again.'
        );
      }
    } catch (error) {
      console.error('Password reset confirmation error:', error);
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
      <Text className="text-2xl font-bold mb-2 text-center">Set New Password</Text>
      <Text className="text-base mb-8 text-center text-gray-600">
        Create a strong password for your account.
      </Text>
      
      {/* New Password Input */}
      <View className="relative mb-5">
        <TextInput
          className={`h-12 border rounded-lg px-3 ${
            !isPasswordValid && newPassword.length > 0 ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="New Password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (text.length > 0) setIsPasswordValid(validatePassword(text));
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          className="absolute right-3 top-3"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={24} 
            color="gray" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Password strength indicator */}
      {newPassword.length > 0 && !isPasswordValid && (
        <Text className="text-xs text-red-500 ml-1 mb-4">
          Password must be at least 8 characters with uppercase, lowercase, and numbers.
        </Text>
      )}
      
      {/* Confirm Password Input */}
      <View className="relative mb-5">
        <TextInput
          className={`h-12 border rounded-lg px-3 ${
            !passwordsMatch && confirmPassword.length > 0 ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (text.length > 0) setPasswordsMatch(text === newPassword);
          }}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          className="absolute right-3 top-3"
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={24} 
            color="gray" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Password match indicator */}
      {confirmPassword.length > 0 && !passwordsMatch && (
        <Text className="text-xs text-red-500 ml-1 mb-4">
          Passwords do not match.
        </Text>
      )}
      
      {/* Submit Button */}
      <TouchableOpacity
      testID="set-new-password-button"
        className={`h-12 rounded-lg justify-center items-center mb-5 ${
          isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
        }`}
        onPress={handleSetNewPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Updating...</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-base">Set New Password</Text>
        )}
      </TouchableOpacity>
      
      {/* Back Button */}
      <TouchableOpacity
        className="justify-center items-center"
        onPress={() => router.back()}
        disabled={isLoading}
      >
        <Text className="text-indigo-600 text-base">Back</Text>
      </TouchableOpacity>
      
      {/* Alert Component */}
      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onCancel={() => setShowAlert(false)}
        onConfirm={() => {
          setShowAlert(false);
          // If it's a success alert, navigate to login after dismissal
          if (alertConfig.type === 'success') {
            router.replace('/(auth)/signin');
          }
        }}
      />
    </View>
  );
}

export default NewPasswordScreen;