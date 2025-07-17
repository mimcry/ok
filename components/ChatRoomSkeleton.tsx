import { ArrowLeft, ImagePlus, Phone, SendHorizonal } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';

// Skeleton shimmer effect component
const SkeletonBox: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}> = ({ width = '100%', height = 20, className = '', rounded = false }) => {
  return (
    <View
      className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
    />
  );
};

// Skeleton Header Component
const ChatRoomHeaderSkeleton: React.FC = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 mt-14 bg-white border-b border-gray-200">
      {/* Left side - Back button */}
      <TouchableOpacity className="p-2" disabled>
        <ArrowLeft size={24} color="#d1d5db" />
      </TouchableOpacity>

      {/* Center - Profile and name skeleton */}
      <View className="flex-1 flex-row items-center justify-start">
        <SkeletonBox width={40} height={40} rounded className="mr-3" />
        <View>
          <SkeletonBox width={120} height={18} className="mb-2" />
          <SkeletonBox width={60} height={14} />
        </View>
      </View>

      {/* Right side - Phone icon */}
      <TouchableOpacity className="p-2" disabled>
        <Phone size={24} color="#d1d5db" />
      </TouchableOpacity>
    </View>
  );
};

// Skeleton Message Component
const MessageSkeleton: React.FC<{ isCurrentUser?: boolean }> = ({ isCurrentUser = false }) => {
  return (
    <View className="mb-4 px-2">
      <View className={`flex-row items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {/* Other user's profile picture skeleton */}
        {!isCurrentUser && (
          <View className="mr-2 mb-1">
            <SkeletonBox width={32} height={32} rounded />
          </View>
        )}

        {/* Message bubble skeleton */}
        <View 
          className={`max-w-xs rounded-2xl p-3 ${
            isCurrentUser ? 'bg-gray-200' : 'bg-gray-100'
          }`}
          style={{ maxWidth: '75%' }}
        >
          <SkeletonBox width="100%" height={16} className="mb-1" />
          <SkeletonBox width="80%" height={16} />
        </View>
      </View>

     
    </View>
  );
};

// Main ChatRoom Skeleton Component
const ChatRoomSkeleton: React.FC = () => {
  // Generate multiple message skeletons with mixed current/other user
  const messageSkeletons = Array.from({ length: 8 }, (_, index) => (
    <MessageSkeleton key={index} isCurrentUser={index % 3 === 0} />
  ));

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Skeleton */}
      <ChatRoomHeaderSkeleton />

      {/* Message List Skeleton */}
      <View className="flex-1 p-2">
        <View className="flex-1 pt-2">
          {messageSkeletons}
        </View>
      </View>

      {/* Message Input Skeleton */}
      <View className="border-t border-gray-200 bg-white">
        <View className="flex-row items-center p-3">
          {/* Image picker button skeleton */}
          <TouchableOpacity className="p-2 mr-2" disabled>
            <ImagePlus size={24} color="#d1d5db" />
          </TouchableOpacity>

          {/* Text input skeleton */}
          <View className="flex-1 bg-gray-100 rounded-full px-4 py-4 mr-2">
            <SkeletonBox width="50%" height={16} />
          </View>

          {/* Send button skeleton */}
          <TouchableOpacity className="p-3 rounded-full bg-gray-300" disabled>
            <SendHorizonal size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatRoomSkeleton;
