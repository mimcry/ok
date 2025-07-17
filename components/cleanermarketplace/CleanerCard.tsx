
import { Cleaner } from '@/types/cleanermarketplace';
import { CheckCircle, Clock, Mail, Star } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CleanerCardProps {
  cleaner: Cleaner;
  onPress: () => void;
}

const CleanerCard: React.FC<CleanerCardProps> = ({ cleaner, onPress }) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl mb-3 shadow-lg"
      onPress={onPress}
    >
      <View className="flex-row p-4 items-center">
        <View className="relative">
          <Image
            source={typeof cleaner.profile_picture === 'string' ? { uri: cleaner.profile_picture } : cleaner.profile_picture}
            className={`w-16 h-16 rounded-full border-2 ${cleaner.availability ? 'border-primary' : 'border-gray-300'}`}
          />
          {cleaner.availability && (
            <View className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
          )}
        </View>
        
        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-800">
              {cleaner.full_name}
            </Text>
            {cleaner.average_rating && (
              <View className="flex-row items-center bg-yellow-100 px-2 py-0.5 rounded-xl">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text className="ml-1 text-xs font-semibold text-yellow-700">
                  {cleaner.average_rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center mt-1">
            <Mail size={12} color="#6B7280" />
            <Text className="ml-1 text-gray-500 text-xs">
              {cleaner.email}
            </Text>
          </View>

          {cleaner.speciality_display && (
            <View className="mt-1.5">
              <Text className="text-xs text-indigo-600 font-medium">
                {cleaner.speciality_display}
              </Text>
            </View>
          )}
          
          <View className="flex-row mt-2 bg-gray-50 rounded-xl p-2">
            <View className="flex-row items-center mr-4">
              <CheckCircle size={12} color="#10B981" />
              <Text className="ml-1 text-xs text-green-800 font-medium">
                {cleaner.completed_jobs} completed
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Clock size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-500">
                {cleaner.total_assigned} total jobs
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CleanerCard;