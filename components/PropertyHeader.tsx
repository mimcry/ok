import React from 'react';
import { Text, View } from 'react-native';

interface PropertyHeaderProps {
  propertyName: string;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({ propertyName }) => {
  return (
    <View className="bg-white p-4 rounded-xl mb-4 -mt-10 shadow-sm justify-start">
      <Text className="text-gray-500 text-sm mb-1">Property</Text>
      <Text className="text-lg font-semibold text-gray-800">
        {propertyName || 'Beach House'}
      </Text>
    </View>
  );
};