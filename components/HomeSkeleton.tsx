import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Skeleton shimmer effect component
const SkeletonBox: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  className?: string;
  style?: any;
}> = ({ width = '100%', height = 20, className = '', style }) => (
  <View 
    className={`bg-gray-200 rounded ${className}`}
    style={[
      { 
        width: typeof width === 'string' ? undefined : width, 
        height: typeof height === 'string' ? undefined : height 
      }, 
      typeof width === 'string' && { width },
      typeof height === 'string' && { height },
      style
    ]} 
  />
);

const HomeSkeleton: React.FC = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Section Skeleton */}
          <View className="bg-white rounded-2xl mx-4 mt-4 px-5 py-4 shadow-lg flex-row items-center justify-between">
            {/* Text Section */}
            <View className="flex-1 mr-4">
              <SkeletonBox width="60%" height={28} className="mb-2" />
              <SkeletonBox width="40%" height={16} />
            </View>

            {/* Profile Image Skeleton */}
            <View className="h-14 w-14 rounded-full bg-gray-200" />
          </View>

          {/* Stats Section Skeleton */}
          <View className="flex-row justify-between mx-4 mt-6">
            {/* Today's Stats */}
            <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-md">
              <SkeletonBox width="50%" height={16} className="mb-2" />
              <View className="flex-row items-center mb-2">
                <SkeletonBox width={40} height={32} className="mr-2" />
                <SkeletonBox width="30%" height={16} />
              </View>
              <View className="flex-row">
                <View className="h-4 w-4 rounded-full bg-gray-200 mr-1" />
                <View className="h-4 w-4 rounded-full bg-gray-200 mr-1" />
                <View className="h-4 w-4 rounded-full bg-gray-200" />
              </View>
            </View>

            {/* Earnings Stats */}
            <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-md">
              <SkeletonBox width="50%" height={16} className="mb-2" />
              <SkeletonBox width={60} height={32} className="mb-2" />
              <SkeletonBox width="70%" height={16} />
            </View>

            {/* Completion Rate Stats */}
            <View className="bg-white rounded-lg p-4 flex-1 shadow-md">
              <SkeletonBox width="60%" height={16} className="mb-2" />
              <SkeletonBox width={40} height={32} className="mb-2" />
              <SkeletonBox width="80%" height={12} />
            </View>
          </View>

          {/* Friend Request Section Skeleton */}
          <View className="mx-4 mt-4">
            <SkeletonBox width="40%" height={22} className="mb-3" />
            <View className="bg-white rounded-lg p-4 shadow-md flex-row items-center justify-between">
              {/* Profile Section */}
              <View className="flex-row items-center flex-1">
                <View className="h-12 w-12 rounded-full bg-gray-200" />
                <View className="ml-3 flex-1">
                  <SkeletonBox width="60%" height={16} className="mb-1" />
                  <SkeletonBox width="80%" height={14} />
                </View>
              </View>
              
              {/* Action Buttons */}
              <View className="flex-row">
                <SkeletonBox width={50} height={32} className="rounded-lg mr-2" />
                <SkeletonBox width={60} height={32} className="rounded-lg" />
              </View>
            </View>
          </View>

          {/* Today's Schedule Section Skeleton */}
          <View className="mt-6 mx-4">
            <View className="flex-row justify-between items-center mb-3">
              <SkeletonBox width="50%" height={24} />
              <SkeletonBox width="20%" height={16} />
            </View>

            {/* Job Cards Skeleton */}
            {[1, 2].map((index) => (
              <JobCardSkeleton key={index} />
            ))}
          </View>

          {/* Upcoming Schedule Section Skeleton */}
          <View className="mx-4 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <SkeletonBox width="60%" height={24} />
              <SkeletonBox width="20%" height={16} />
            </View>

            {/* Job Cards Skeleton */}
            {[1, 2].map((index) => (
              <JobCardSkeleton key={index} />
            ))}
          </View>

          {/* Bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Job Card Skeleton Component
const JobCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-md border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="h-12 w-12 rounded-full bg-gray-200 mr-3" />
          <View className="flex-1">
            <SkeletonBox width="70%" height={16} className="mb-1" />
            <SkeletonBox width="50%" height={14} />
          </View>
        </View>
        <SkeletonBox width={60} height={24} className="rounded-full" />
      </View>

      {/* Job Details */}
      <View className="mb-3">
        <SkeletonBox width="80%" height={16} className="mb-2" />
        <View className="flex-row items-center mb-2">
          <SkeletonBox width={16} height={16} className="mr-2" />
          <SkeletonBox width="60%" height={14} />
        </View>
        <View className="flex-row items-center">
          <SkeletonBox width={16} height={16} className="mr-2" />
          <SkeletonBox width="40%" height={14} />
        </View>
      </View>

      {/* Price and Action */}
      <View className="flex-row items-center justify-between mx-8 mt-4">
        
        <SkeletonBox width={280} height={32} className="rounded-lg" />
      </View>
    </View>
  );
};

export default HomeSkeleton;
export { JobCardSkeleton };