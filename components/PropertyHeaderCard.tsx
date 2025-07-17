import { MapPin } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const PropertyHeaderCard = ({ property, onPress }: any) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-md mb-4  overflow-hidden border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View className="flex-row items-center p-3">
        {/* Image Section */}
        <View className="relative">
          <Image
            source={{ uri: property?.main_image }}
            className="w-12 h-12 rounded-lg bg-gray-200"
            resizeMode="cover"
          />
          {!property?.is_active && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 justify-center items-center">
              <View className="w-2 h-2 bg-white rounded-full" />
            </View>
          )}
        </View>

        {/* Content Section */}
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
            {property?.name || 'Property Name'}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <MapPin size={12} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1 flex-1" numberOfLines={1}>
              {property?.address || `${property?.city}, ${property?.state}`}
            </Text>
          </View>
        </View>

        {/* Status Indicator */}
        <View className={`w-3 h-3 rounded-full ${
          property?.is_active ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </View>
    </TouchableOpacity>
  );
};

export default PropertyHeaderCard;