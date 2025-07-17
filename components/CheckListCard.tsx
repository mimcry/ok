import { PropertyCardProps } from '@/types/checklist';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PropertyCard: React.FC<PropertyCardProps> = ({
  item,
  onPress,
  isSelected,
  taskCount,
}) => (
  <TouchableOpacity
    testID={isSelected ? 'property-card-selected' : 'property-card'}
    onPress={onPress}
    className={`flex-row items-center p-3 mb-3 rounded-xl border-2 shadow-sm bg-white ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}
  >
    <Image
      source={{ uri: item.main_image }}
      className="w-15 h-15 rounded-md mr-3 bg-gray-100"
      resizeMode="cover"
    />

    <View className="flex-1">
      <Text
        numberOfLines={1}
        className="text-base font-semibold text-gray-900"
      >
        {item.name}
      </Text>

      <View className="flex-row items-center mt-1 mb-1">
        <Ionicons name="location-outline" size={12} color="#9CA3AF" />
        <Text
          numberOfLines={1}
          className="text-sm text-gray-500 ml-1"
        >
          {item.address}, {item.city}
        </Text>
      </View>

      <Text className="text-xs text-gray-400 font-medium">{taskCount} tasks</Text>
    </View>
  </TouchableOpacity>
);

export default PropertyCard;
