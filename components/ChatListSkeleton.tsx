import React from 'react';
import { View, TouchableOpacity } from 'react-native';

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

// Main ChatListItem Skeleton Component
const ChatListItemSkeleton: React.FC = () => {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      disabled={true}
    >
      {/* Avatar with online indicator skeleton */}
      <View className="relative mr-4">
        {/* Profile picture skeleton */}
        <View className="w-14 h-14 rounded-full bg-gray-200" />
        
        {/* Online indicator skeleton (optional - can be shown randomly) */}
        <View className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 rounded-full border-2 border-white" />
      </View>

      {/* Message content skeleton */}
      <View className="flex-1 justify-center">
        {/* Name and timestamp row */}
        <View className="flex-row justify-between items-center mb-1">
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="20%" height={12} />
        </View>
        
        {/* Message preview and status row */}
        <View className="flex-row justify-between items-center">
          <SkeletonBox width="75%" height={14} className="mr-2" />
          
          {/* Read status indicator skeleton */}
          <View className="flex-row items-center">
            <SkeletonBox width={16} height={16} className="mr-2" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Variant with unread indicator
const ChatListItemSkeletonWithUnread: React.FC = () => {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      disabled={true}
    >
      {/* Avatar with online indicator skeleton */}
      <View className="relative mr-4">
        {/* Profile picture skeleton */}
        <View className="w-14 h-14 rounded-full bg-gray-200" />
        
        {/* Online indicator skeleton */}
        <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-300 rounded-full border-2 border-white" />
      </View>

      {/* Message content skeleton */}
      <View className="flex-1 justify-center">
        {/* Name and timestamp row */}
        <View className="flex-row justify-between items-center mb-1">
          <SkeletonBox width="65%" height={16} />
          <SkeletonBox width="25%" height={12} />
        </View>
        
        {/* Message preview and status row */}
        <View className="flex-row justify-between items-center">
          <SkeletonBox width="70%" height={14} className="mr-2" />
          
          {/* Unread indicator */}
          <View className="flex-row items-center">
            <View className="h-2 w-2 rounded-full bg-blue-300" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Compact version for smaller screens
const ChatListItemSkeletonCompact: React.FC = () => {
  return (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-100"
      disabled={true}
    >
      {/* Smaller avatar */}
      <View className="relative mr-3">
        <View className="w-12 h-12 rounded-full bg-gray-200" />
        <View className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 rounded-full border border-white" />
      </View>

      {/* Compact message content */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <SkeletonBox width="55%" height={14} />
          <SkeletonBox width="18%" height={10} />
        </View>
        
        <View className="flex-row justify-between items-center">
          <SkeletonBox width="65%" height={12} className="mr-2" />
          <SkeletonBox width={12} height={12} className="rounded-full" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// List of multiple chat item skeletons
const ChatListSkeletonList: React.FC<{ 
  count?: number; 
  compact?: boolean; 
  showVariants?: boolean;
}> = ({ 
  count = 5, 
  compact = false, 
  showVariants = true 
}) => {
  const renderSkeleton = (index: number) => {
    if (compact) {
      return <ChatListItemSkeletonCompact key={index} />;
    }
    
    // Show variants for more realistic loading
    if (showVariants && index % 3 === 1) {
      return <ChatListItemSkeletonWithUnread key={index} />;
    }
    
    return <ChatListItemSkeleton key={index} />;
  };

  return (
    <View>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </View>
  );
};

// Animated variant (for enhanced UX)
const ChatListItemSkeletonAnimated: React.FC = () => {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      disabled={true}
    >
      {/* Avatar with pulse animation */}
      <View className="relative mr-4">
        <View className="w-14 h-14 rounded-full bg-gray-200 opacity-70" />
        <View className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 rounded-full border-2 border-white opacity-50" />
      </View>

      {/* Message content with staggered animation */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <View className="bg-gray-200 rounded h-4 opacity-60" style={{ width: '60%' }} />
          <View className="bg-gray-200 rounded h-3 opacity-40" style={{ width: '20%' }} />
        </View>
        
        <View className="flex-row justify-between items-center">
          <View className="bg-gray-200 rounded h-3.5 mr-2 opacity-50" style={{ width: '75%' }} />
          <View className="bg-gray-200 rounded h-4 w-4 opacity-30" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Full chat list skeleton with header
const ChatListFullSkeleton: React.FC<{ showHeader?: boolean }> = ({ showHeader = true }) => {
  return (
    <View className="flex-1 bg-white">
      {/* Header skeleton */}
      {showHeader && (
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <SkeletonBox width="30%" height={24} />
            <SkeletonBox width={40} height={40} className="rounded-full" />
          </View>
        </View>
      )}
      
      {/* Chat list */}
      <ChatListSkeletonList count={8} showVariants={true} />
    </View>
  );
};

export default ChatListItemSkeleton;
export { 
  ChatListItemSkeletonWithUnread,
  ChatListItemSkeletonCompact,
  ChatListSkeletonList,
  ChatListItemSkeletonAnimated,
  ChatListFullSkeleton,
  SkeletonBox
};