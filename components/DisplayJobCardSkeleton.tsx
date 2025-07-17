import React from 'react';
import { View } from 'react-native';

// Reusable Skeleton Box Component
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

// Animated Shimmer Effect (Optional Enhancement)
const SkeletonShimmer: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  className?: string;
}> = ({ width = '100%', height = 20, className = '' }) => (
  <View className={`relative overflow-hidden ${className}`}>
    <SkeletonBox width={width} height={height} />
    {/* You can add shimmer animation here with Animated API if needed */}
  </View>
);

// Main DisplayJobCard Skeleton Component
const DisplayJobCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header Section with Profile and Status */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Profile Section */}
        <View className="flex-row items-center flex-1">
          {/* Profile Image Skeleton */}
          <View className="h-12 w-12 rounded-full bg-gray-200 mr-3" />
          
          {/* Name and Location */}
          <View className="flex-1">
            <SkeletonBox width="70%" height={16} className="mb-1" />
            <SkeletonBox width="50%" height={14} />
          </View>
        </View>
        
        {/* Status Badge Skeleton */}
        <SkeletonBox width={70} height={24} className="rounded-full" />
      </View>

      {/* Job Title and Description */}
      <View className="mb-3">
        <SkeletonBox width="85%" height={18} className="mb-2" />
        <SkeletonBox width="95%" height={14} className="mb-1" />
        <SkeletonBox width="60%" height={14} />
      </View>

      {/* Job Details with Icons */}
      <View className="mb-4 space-y-2">
        {/* Date/Time */}
        <View className="flex-row items-center">
          <SkeletonBox width={16} height={16} className="mr-3" />
          <SkeletonBox width="60%" height={14} />
        </View>
        
        {/* Location */}
        <View className="flex-row items-center">
          <SkeletonBox width={16} height={16} className="mr-3" />
          <SkeletonBox width="70%" height={14} />
        </View>
        
        {/* Duration */}
        <View className="flex-row items-center">
          <SkeletonBox width={16} height={16} className="mr-3" />
          <SkeletonBox width="40%" height={14} />
        </View>
      </View>

      {/* Tags/Categories */}
      <View className="flex-row mb-4">
        <SkeletonBox width={60} height={20} className="rounded-full mr-2" />
        <SkeletonBox width={80} height={20} className="rounded-full mr-2" />
        <SkeletonBox width={50} height={20} className="rounded-full" />
      </View>

      {/* Price and Action Button */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        {/* Price Section */}
        <View>
          <SkeletonBox width="25%" height={12} className="mb-1" />
          <SkeletonBox width={60} height={20} />
        </View>
        
        {/* Action Button */}
        <SkeletonBox width={100} height={36} className="rounded-lg" />
      </View>
    </View>
  );
};

// Compact version for lists
const DisplayJobCardSkeletonCompact: React.FC = () => {
  return (
    <View className="bg-white rounded-lg p-3 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 rounded-full bg-gray-200 mr-2" />
          <View className="flex-1">
            <SkeletonBox width="65%" height={14} className="mb-1" />
            <SkeletonBox width="45%" height={12} />
          </View>
        </View>
        <SkeletonBox width={50} height={20} className="rounded-full" />
      </View>

      {/* Content */}
      <SkeletonBox width="80%" height={16} className="mb-2" />
      
      {/* Details */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <SkeletonBox width={12} height={12} className="mr-2" />
          <SkeletonBox width="50%" height={12} />
        </View>
        <SkeletonBox width={70} height={28} className="rounded" />
      </View>
    </View>
  );
};

// List of multiple skeletons for loading states
const DisplayJobCardSkeletonList: React.FC<{ count?: number; compact?: boolean }> = ({ 
  count = 3, 
  compact = false 
}) => {
  const SkeletonComponent = compact ? DisplayJobCardSkeletonCompact : DisplayJobCardSkeleton;
  
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </View>
  );
};

export default DisplayJobCardSkeleton;
export { 
  DisplayJobCardSkeletonCompact, 
  DisplayJobCardSkeletonList,
  SkeletonBox
};