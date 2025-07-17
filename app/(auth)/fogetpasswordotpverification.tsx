import { userApi } from '@/api/forgetpassword';
import CustomAlert from '@/hooks/customAlert';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * OTP Verification Screen - For verifying OTP code sent via email
 */
function OTPVerificationScreen() {
  // Get params from previous screen
  const { email, purpose } = useLocalSearchParams();

  // State for OTP digits
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'warning',
    title: '',
    message: '',
  });

  // References for TextInput focus management
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Set up countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Check if email param exists
  useEffect(() => {
    if (!email) {
      showAlertWithConfig(
        'danger',
        'Missing Information',
        'Email address is missing. Please restart the password reset process.'
      );
    }
  }, [email]);

  /**
   * Show alert with specified configuration
   */
  const showAlertWithConfig = (type: string, title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (text: string, index: number) => {
    // Only allow numeric input
    if (/^[0-9]?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus to next input if current input is filled
      if (text && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  /**
   * Handle key press for backspace to go to previous input
   */
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Resend OTP code
   */
  const handleResendOtp = async () => {
    if (!email) return;

    try {
      setIsLoading(true);

      const result = await userApi.requestPasswordResetOTP(email);

      if (result.success) {
        // Reset timer and disable resend button
        setTimer(60);
        setCanResend(false);

        showAlertWithConfig(
          'success',
          'Code Sent',
          'A new verification code has been sent to your email.'
        );
      } else {
        showAlertWithConfig(
          'danger',
          'Error',
          result.message || 'Failed to resend verification code.'
        );
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showAlertWithConfig(
        'danger',
        'Unexpected Error',
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify OTP code
   */
  const handleVerifyOtp = async () => {
    Keyboard.dismiss();

    // Check if OTP is complete (no empty fields)
    if (otp.some((digit) => digit === '')) {
      showAlertWithConfig(
        'warning',
        'Incomplete Code',
        'Please enter the 6-digit verification code.'
      );
      return;
    }

    if (!email) {
      showAlertWithConfig(
        'danger',
        'Missing Email',
        'Email address is missing. Please restart the process.'
      );
      return;
    }

    try {
      setIsLoading(true);

      const otpCode = otp.join('');
      const result = await userApi.verifyPasswordResetOTP(email, otpCode);
     
      if (result.success) {
        // Navigate to new password screen
        router.push({
          pathname: '/(auth)/createnewpassword',
          params: {
            email,
            code: otpCode,
          },
        });
      } else {
        showAlertWithConfig(
          'danger',
          'Invalid Code',
          result.message || 'The verification code is incorrect or has expired.'
        );
      }
    } catch (error) {
      console.error('OTP verification error:', error);
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
      <Text className="text-2xl font-bold mb-2 text-center">Verification Code</Text>
      <Text className="text-base mb-8 text-center text-gray-600">
        {purpose === 'password-reset'
          ? 'Enter the 6-digit code sent to your email to reset your password.'
          : 'Enter the verification code sent to your email.'}
      </Text>

      {/* Email display */}
      {email && (
        <Text className="text-sm mb-8 text-center font-medium">
          Code sent to: <Text className="text-indigo-600">{email}</Text>
        </Text>
      )}

      {/* OTP Input Fields */}
      <View className="flex-row justify-between mb-8">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            testID={`otp-input-${index}`}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className="h-14 w-14 border border-gray-300 rounded-lg text-center text-xl font-bold"
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            accessible
            accessibilityLabel={`OTP digit ${index + 1}`}
            returnKeyType={index === 5 ? 'done' : 'next'}
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        className={`h-12 rounded-lg justify-center items-center mb-5 ${
          isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
        }`}
        onPress={handleVerifyOtp}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Verify Code Button"
      >
        {isLoading ? (
  <View className="flex-row items-center">
    <ActivityIndicator color="#FFFFFF" />
    <Text testID="verifying-text" className="text-white font-semibold ml-2">
      Verifying...
    </Text>
  </View>
) : (
  <Text className="text-white font-bold text-base">Verify Code</Text>
)}

      </TouchableOpacity>

      {/* Resend Code */}
      <View className="flex-row justify-center items-center mb-5">
        <Text className="text-gray-600">Didn't receive code? </Text>
        {canResend ? (
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Resend Code Button"
          >
            <Text className="text-indigo-600 font-medium">Resend Code</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-400">Resend in {timer}s</Text>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity
        className="justify-center items-center"
        onPress={() => router.back()}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Back Button"
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
        onConfirm={() => setShowAlert(false)}
      />
    </View>
  );
}

export default OTPVerificationScreen;
