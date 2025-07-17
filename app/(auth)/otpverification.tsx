import { BASE_URL } from "@/utils/config";
import { router, useLocalSearchParams } from "expo-router";
import { Mail } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
const OtpVerification = () => {
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const toast = useToast();
  const { email } = useLocalSearchParams();

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (index === 5) {
      otpInputRefs.current[index]?.blur();
    }
  };

  const sendEmailVerificationOTP = () => {
    setIsVerifyingEmail(true);

    // You can call your resend endpoint here instead of timeout simulation
    setTimeout(() => {
      setIsVerifyingEmail(false);
      setIsOtpModalVisible(true);
      setOtp(["", "", "", "", "", ""]);
      toast.show("OTP Sent", {
        type: "success",
        animationType: "slide-in",
        style: {
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 10,
        },
      });
    }, 1500);
  };

  const verifyOTP = async () => {
    setIsVerifyingEmail(true);
    const enteredOtp = otp.join("");

    try {
    
      const response = await fetch(`${BASE_URL}/api/users/register/verify/`, {
        method: "POST",
       headers: {
  "Content-Type": "application/json",

       },
        body: JSON.stringify({
          "code": enteredOtp,
         
        }),
      });
console.log("entered code:",enteredOtp)
      const data = await response.json();
console.log("data",data)
     if (data.detail === "Account activated.") {
  setIsOtpModalVisible(false);
  toast.show("Your email has been verified.", {
    type: "success",
    animationType: "slide-in",
    style: {
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
  });
  router.push("/(auth)/signin");
} else {
  toast.show(data?.detail || "Something went wrong", {
    type: "error",
    animationType: "slide-in",
    style: {
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: "red",
    },
  });
}

    } catch (error) {
      console.error("OTP verification error:", error);
      toast.show("Something went wrong. Try again.", {
        type: "error",
        animationType: "slide-in",
        style: {
          borderRadius: 10,
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: "red",
        },
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        className="flex-1 w-full"
      >
        <View className="flex-1 justify-center">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="items-center py-4">
              <Mail size={50} color="#4925E9" />
              <Text className="text-lg font-medium text-gray-800 mt-4 text-center">
                Verify your new email address
              </Text>
              <Text className="text-gray-500 mt-2 text-center">
                We've sent a verification code to your email {email}.
              </Text>
            </View>

            {/* OTP Input */}
            <View className="flex-row justify-between mt-6 px-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                
                  key={index}
                  testID={`otp-input-${index}`}
                  ref={(ref) => (otpInputRefs.current[index] = ref)}
                  className="bg-gray-100 h-16 w-12 rounded-xl text-gray-800 text-center text-2xl font-bold border border-indigo-400"
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (
                      nativeEvent.key === "Backspace" &&
                      !otp[index] &&
                      index > 0
                    ) {
                      otpInputRefs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
             testID="verify-button"
              className="mt-8 bg-indigo-600 py-4 rounded-xl flex-row justify-center items-center"
              activeOpacity={0.8}
              onPress={verifyOTP}
              disabled={isVerifyingEmail || otp.join("").length !== 6}
            >
              {isVerifyingEmail ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">Verifying...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Verify Email</Text>
              )}
            </TouchableOpacity>

            {/* Resend */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-500">Didn't receive code? </Text>
              <TouchableOpacity
               testID="resend-button"
                onPress={sendEmailVerificationOTP}
                disabled={isVerifyingEmail}
              >
                <Text className="text-indigo-600 font-medium">Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpVerification;
