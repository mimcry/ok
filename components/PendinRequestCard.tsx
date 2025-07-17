// components/PendingRequestCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { 
  Star, 
  Mail, 
  Phone, 
  X, 
  Clock,
  AlertCircle 
} from 'lucide-react-native';

interface Partner {
  id: number;
  email: string;
  full_name: string;
  profile_picture: string | null;
  average_rating: number | null;
  speciality: string | null;
  experience: string | null;
  phone_number: string;
}

interface PendingRequest {
  id: number;
  partner: Partner;
  status: string;
  created_at: string;
  unread_count: number;
}

interface PendingRequestCardProps {
  request: PendingRequest;
  onCancel: (userId: number) => Promise<void>;
}

const PendingRequestCard: React.FC<PendingRequestCardProps> = ({ request, onCancel }) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(request.id);
    } finally {
      setCancelling(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} size={14} color="#FFD700" fill="#FFD700" />);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} size={14} color="#D1D5DB" />);
    }
    
    return <View className="flex-row">{stars}</View>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-lg border border-orange-100">
      {/* Status indicator */}
      <View className="absolute top-3 right-3 z-10">
        <View className="bg-orange-100 px-3 py-1 rounded-full flex-row items-center">
          <Clock size={12} color="#F97316" />
          <Text className="ml-1 text-xs font-medium text-orange-600">
            Pending
          </Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-center">
          <View className="relative">
            <Image
              source={
                request.partner.profile_picture 
                  ? { uri: request.partner.profile_picture } 
                  : require('@/assets/images/profile.png')
              }
              className="w-16 h-16 rounded-full border-2 border-orange-200"
            />
            {/*Pending status indicator*/}
            <View className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-orange-400 border-2 border-white" />
          </View>
          
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {request.partner.full_name}
            </Text>
            
            <View className="flex-row items-center mt-1">
              <Mail size={12} color="#6B7280" />
              <Text className="ml-1 text-gray-500 text-xs">
                {request.partner.email}
              </Text>
            </View>

            {request.partner.phone_number && (
              <View className="flex-row items-center mt-1">
                <Phone size={12} color="#6B7280" />
                <Text className="ml-1 text-gray-500 text-xs">
                  {request.partner.phone_number}
                </Text>
              </View>
            )}

            {request.partner.average_rating && (
              <View className="flex-row items-center mt-2">
                {renderStars(request.partner.average_rating)}
                <Text className="ml-2 text-xs font-semibold text-yellow-700">
                  {request.partner.average_rating.toFixed(1)}
                </Text>
              </View>
            )}

            {request.partner.speciality && (
              <View className="mt-2">
                <Text className="text-xs text-indigo-600 font-medium">
                  {request.partner.speciality}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Request info and actions */}
        <View className="mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-gray-500">
                Request sent {formatDate(request.created_at)}
              </Text>
              {request.unread_count > 0 && (
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
                  <Text className="text-xs text-blue-600 font-medium">
                    {request.unread_count} unread message{request.unread_count > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              className={`${cancelling ? 'bg-gray-400' : 'bg-red-500'} px-4 py-2 rounded-xl flex-row items-center`}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-xs font-semibold ml-2">
                    Cancelling...
                  </Text>
                </>
              ) : (
                <>
                  <X size={14} color="white" />
                  <Text className="text-white text-xs font-semibold ml-1">
                    Cancel Request
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PendingRequestCard;