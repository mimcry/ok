import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  icon?: ReactNode;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardtype?: string;
  containerStyle?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardtype,
  containerStyle
}) => (
  <View className="mb-5">
    <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
    <View
      className={`${
        multiline
          ? "bg-gray-100 rounded-xl px-4 py-2"
          : "flex-row items-center bg-gray-100 rounded-xl overflow-hidden"
      } border ${containerStyle || "border-gray-300"}`}
    >
      {!multiline && icon && <View className="p-3 pl-4">{icon}</View>}
      <TextInput
        className={
          multiline ? "p-2 text-gray-800 min-h-24" : "flex-1 p-4 text-gray-800"
        }
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "auto"}
        keyboardType={keyboardtype}
      />
    </View>
  </View>
);