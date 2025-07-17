import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { ReactNode } from 'react';

interface DateTimeFieldProps {
  label: string;
  icon: ReactNode;
  value: string | null;
  onPress: (event: GestureResponderEvent) => void;
  containerStyle?: string;
  error?: string;
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({ 
  label, 
  icon, 
  value, 
  onPress, 
  containerStyle = "border-gray-300",
  error 
}) => (
  <View className="mb-5">
    <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center bg-gray-100 rounded-xl overflow-hidden p-4 border ${containerStyle}`}
    >
      {icon}
      <Text className={`ml-2 ${value ? 'text-gray-800' : 'text-gray-500'}`}>
        {value || `Select ${label.toLowerCase()}`}
      </Text>
    </TouchableOpacity>
    {error && (
      <Text className="text-red-500 text-sm mt-1">{error}</Text>
    )}
  </View>
);