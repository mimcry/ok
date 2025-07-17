import { Cleaner } from '@/types/cleanermarketplace';
import { Briefcase, Star } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CleanerCardProps {
  cleaner: Cleaner;
   onPress: (cleaner: Cleaner) => void | Promise<void>;
}

export const CleanerCard: React.FC<CleanerCardProps> = ({ cleaner, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-white mb-3 p-4 rounded-xl shadow-lg border border-gray-100"
      onPress={() => onPress(cleaner)}
    >
      <View className='border border-primary p-1 rounded-full mr-4'>
        <Image
          source={
            cleaner.avatar
              ? { uri: cleaner.avatar, cache: 'force-cache' }
              : require("@/assets/images/profile.png")
          }
          className="w-16 h-16 rounded-full"
        />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
            {cleaner.username}
          </Text>
          <View className="flex-row items-center">
            <Star size={14} color="#FFB800" fill="#FFB800" />
            <Text className="ml-1 text-gray-700">{cleaner.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View className="flex-row items-center mt-1">
          <Briefcase size={14} color="#4B5563" />
          <Text className="ml-1 text-gray-600 text-sm" numberOfLines={1}>
            {cleaner.speciality}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};