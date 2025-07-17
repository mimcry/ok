import React from 'react';
import { View, Text } from 'react-native';

interface EmptyJobsCardProps {
  message?: string;
  subtitle?: string;
}

const EmptyJobsCard: React.FC<EmptyJobsCardProps> = ({ 
  message = "No jobs scheduled for upcomming days",
  subtitle = "Take a well-deserved break! 🌟"
}) => {
  return (
    <View className="mx-4 my-6">
      <View className=" rounded-xl p-8 items-center  ">
        {/* Icon Container */}
        <View className=" rounded-full p-4 mb-4 shadow-sm">
          <View className="bg-blue-100 rounded-full p-3">
            <Text className="text-3xl">📋</Text>
          </View>
        </View>
        
        {/* Main Message */}
        <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
          {message}
        </Text>
        
        {/* Subtitle */}
        <Text className="text-sm text-gray-600 text-center mb-4 leading-5">
          {subtitle}
        </Text>
        
       
      </View>
    </View>
  );
};

// Alternative minimalist version
const EmptyJobsCardMinimal: React.FC<EmptyJobsCardProps> = ({ 
  message = "No jobs scheduled for today",
  subtitle = "Enjoy your free time! ✨"
}) => {
  return (
    <View className="mx-4 my-8">
      <View className="bg-white rounded-xl p-6 items-center border border-gray-100 shadow-sm">
        <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">🎯</Text>
        </View>
        <Text className="text-base font-medium text-gray-700 text-center mb-1">
          {message}
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

// Creative version with illustration-like design
const EmptyJobsCardCreative: React.FC<EmptyJobsCardProps> = ({ 
  message = "All clear for today!",
  subtitle = "No scheduled jobs • Time to relax 🌸"
}) => {
  return (
    <View className="mx-4 my-6">
      <View className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 items-center border border-white shadow-lg">
        {/* Floating elements */}
        <View className="relative w-full items-center mb-4">
          <View className="absolute -top-2 -left-4 w-3 h-3 bg-yellow-300 rounded-full opacity-70"></View>
          <View className="absolute -top-1 -right-6 w-2 h-2 bg-pink-300 rounded-full opacity-60"></View>
          
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-4xl">🌅</Text>
          </View>
          
          <View className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-300 rounded-full opacity-50"></View>
        </View>
        
        <Text className="text-lg font-bold text-gray-800 text-center mb-2">
          {message}
        </Text>
        <Text className="text-sm text-gray-600 text-center px-4">
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

export default EmptyJobsCard;
export { EmptyJobsCardMinimal, EmptyJobsCardCreative };