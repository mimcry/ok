import React, { useEffect } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Animated,
  
} from "react-native";

interface ProfileSkeletonProps {
  /**
   * Whether to show the shimmer animation
   * @default true
   */
  showShimmer?: boolean;
}

const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ 
  showShimmer = true 
}) => {
  const shimmerValue = new Animated.Value(0);

  useEffect(() => {
    if (showShimmer) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [showShimmer, shimmerValue]);

  const shimmerStyle = showShimmer ? {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  } : {};

  const SkeletonBox: React.FC<{
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    marginTop?: string;
    marginBottom?: string;
    marginHorizontal?: string;
  }> = ({ 
    width = "100%", 
    height = "16px", 
    borderRadius = "rounded-md",
    marginTop = "",
    marginBottom = "",
    marginHorizontal = ""
  }) => (
    <Animated.View
      style={[shimmerStyle]}
      className={`bg-gray-200 ${borderRadius} ${marginTop} ${marginBottom} ${marginHorizontal}`}
      style={[
        { width, height },
        shimmerStyle
      ]}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Cover Image Skeleton */}
        <SkeletonBox 
          width="100%" 
          height={192} 
          borderRadius="rounded-none" 
        />

        {/* Profile Section */}
        <View className="px-5 -mt-20">
          <View className="bg-white rounded-2xl shadow-md p-5">
            <View className="items-center">
              {/* Profile Image Skeleton */}
              <View className="h-28 w-28 rounded-full border-4 border-white overflow-hidden -mt-20 shadow-lg bg-gray-200">
                <SkeletonBox 
                  width="100%" 
                  height="100%" 
                  borderRadius="rounded-full" 
                />
              </View>

              {/* User Name Skeleton */}
              <SkeletonBox 
                width={160} 
                height={28} 
                borderRadius="rounded-md"
                marginTop="mt-3"
              />

              {/* Location Skeleton */}
              <View className="flex-row items-center mt-2">
                <SkeletonBox 
                  width={16} 
                  height={16} 
                  borderRadius="rounded-sm" 
                />
                <SkeletonBox 
                  width={120} 
                  height={16} 
                  borderRadius="rounded-md"
                  marginHorizontal="ml-2"
                />
              </View>

              {/* Country Skeleton */}
              <SkeletonBox 
                width={100} 
                height={16} 
                borderRadius="rounded-md"
                marginTop="mt-2"
              />

              {/* Update Bio Button Skeleton */}
              <SkeletonBox 
                width={120} 
                height={28} 
                borderRadius="rounded-full"
                marginTop="mt-3"
              />
            </View>

            {/* Stats Section Skeleton */}
            <View className="flex-row justify-between mt-6 px-3 py-4 bg-gray-50 rounded-xl">
              {/* Jobs Completed */}
              <View className="items-center flex-1">
                <SkeletonBox 
                  width={40} 
                  height={32} 
                  borderRadius="rounded-md" 
                />
                <SkeletonBox 
                  width={80} 
                  height={14} 
                  borderRadius="rounded-md"
                  marginTop="mt-1"
                />
              </View>
              
              <View className="h-full w-px bg-gray-200" />

              {/* Rating */}
              <View className="items-center flex-1">
                <View className="flex-row items-center">
                  <SkeletonBox 
                    width={40} 
                    height={32} 
                    borderRadius="rounded-md" 
                  />
                  <SkeletonBox 
                    width={20} 
                    height={20} 
                    borderRadius="rounded-md"
                    marginHorizontal="ml-1"
                  />
                </View>
                <SkeletonBox 
                  width={50} 
                  height={14} 
                  borderRadius="rounded-md"
                  marginTop="mt-1"
                />
              </View>

              <View className="h-full w-px bg-gray-200" />

              {/* Monthly Earning */}
              <View className="items-center flex-1">
                <SkeletonBox 
                  width={60} 
                  height={32} 
                  borderRadius="rounded-md" 
                />
                <SkeletonBox 
                  width={90} 
                  height={14} 
                  borderRadius="rounded-md"
                  marginTop="mt-1"
                />
              </View>
            </View>

            {/* Contact Information Skeleton */}
            <View className="mt-6">
              <SkeletonBox 
                width={150} 
                height={22} 
                borderRadius="rounded-md"
                marginBottom="mb-3"
              />
              
              {/* Email */}
              <View className="flex-row items-center mb-4">
                <SkeletonBox 
                  width={32} 
                  height={32} 
                  borderRadius="rounded-full" 
                />
                <SkeletonBox 
                  width={180} 
                  height={16} 
                  borderRadius="rounded-md"
                  marginHorizontal="ml-3"
                />
              </View>

              {/* Phone */}
              <View className="flex-row items-center">
                <SkeletonBox 
                  width={32} 
                  height={32} 
                  borderRadius="rounded-full" 
                />
                <SkeletonBox 
                  width={140} 
                  height={16} 
                  borderRadius="rounded-md"
                  marginHorizontal="ml-3"
                />
              </View>
            </View>

            {/* Edit Profile Button Skeleton */}
            <SkeletonBox 
              width="100%" 
              height={50} 
              borderRadius="rounded-xl"
              marginTop="mt-6"
            />
          </View>
        </View>

        {/* Account Menu Section Skeleton */}
        <View className="px-5 mt-6 mb-8">
          <View className="bg-white rounded-2xl shadow-md p-5">
            <SkeletonBox 
              width={80} 
              height={22} 
              borderRadius="rounded-md"
              marginBottom="mb-4"
            />
            
            {/* Menu Items Skeleton */}
            {Array.from({ length: 4 }, (_, index) => (
              <View key={index} className="flex-row items-center py-4">
                <SkeletonBox 
                  width={24} 
                  height={24} 
                  borderRadius="rounded-md" 
                />
                <View className="flex-1 ml-3">
                  <SkeletonBox 
                    width={120} 
                    height={16} 
                    borderRadius="rounded-md" 
                  />
                </View>
                <SkeletonBox 
                  width={16} 
                  height={16} 
                  borderRadius="rounded-sm" 
                />
              </View>
            ))}

            {/* Sign Out Button Skeleton */}
            <View className="flex-row items-center justify-center py-4 mt-4">
              <SkeletonBox 
                width={20} 
                height={20} 
                borderRadius="rounded-sm" 
              />
              <SkeletonBox 
                width={80} 
                height={16} 
                borderRadius="rounded-md"
                marginHorizontal="ml-2"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileSkeleton;
