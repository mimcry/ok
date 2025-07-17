import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  formComponent: ReactNode;
  onSubmit?: () => void;
  submitButtonText?: string;
  submitIcon?: ReactNode;
  button?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  visible,
  onClose,
  title,
  formComponent,
  onSubmit,
  submitButtonText = "Submit",
  submitIcon,
  button = true,
}) => (
  <Modal
    animationType="slide"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 h-[80%]">
          
          {/* Title and close button */}
          <View className="flex-row items-center justify-between mb-6">
            {/* Invisible spacer to balance layout */}
            <View style={{ width: 40 }} />

            {/* Centered title */}
            <Text className="text-2xl font-bold text-gray-800 text-center flex-1">
              {title}
            </Text>

            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-gray-100 rounded-full"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View className="flex-1 justify-start">{formComponent}</View>

          {/* Submit Button (conditionally rendered) */}
          {button && (
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl flex-row justify-center items-center shadow-md mt-4"
              onPress={onSubmit}
            >
              {submitIcon}
              <Text className="text-white font-bold ml-2 text-lg">
                {submitButtonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);