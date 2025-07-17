// components/ProfileHeader.tsx
import { Cleaner, DetailedUser } from '@/types/cleanermarketplace';
import { CheckCircle } from 'lucide-react-native';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { StarRating } from '../StarRating';

interface ProfileHeaderProps {
  cleaner: Cleaner;
  detailedUser: DetailedUser | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ cleaner, detailedUser }) => {
  const getRatings = () => {
    return detailedUser?.ratings || cleaner?.ratings || [];
  };

  return (
    <View className="items-center pt-10 pb-8 px-6 bg-indigo-500">
      <View className="relative">
        <Image
          source={typeof cleaner.profile_picture === 'string' ? { uri: cleaner.profile_picture } : cleaner.profile_picture}
          className="w-28 h-28 rounded-full border-4 border-white"
        />
        {cleaner.availability && (
          <View className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 border-3 border-white items-center justify-center">
            <CheckCircle size={12} color="white" />
          </View>
        )}
      </View>
      
      <Text className="text-3xl font-extrabold text-white mt-5 text-center">
        {detailedUser ? `${detailedUser.first_name} ${detailedUser.last_name}` : cleaner.full_name}
      </Text>
      
      <Text className="text-base text-white/80 mt-1">
        @{detailedUser ? detailedUser.username : cleaner.username}
      </Text>
      
      {(detailedUser?.average_rating || cleaner.average_rating) && (
        <View className="flex-row items-center mt-3 bg-white/20 px-4 py-2 rounded-2xl">
          <StarRating rating={detailedUser?.average_rating || cleaner.average_rating} />
          <Text className="ml-2 text-white font-semibold text-base">
            {(detailedUser?.average_rating || cleaner.average_rating)?.toFixed(1)} ({getRatings().length} reviews)
          </Text>
        </View>
      )}

      {(detailedUser?.speciality || cleaner.speciality_display) && (
        <View className="mt-3 bg-white/20 px-4 py-2 rounded-2xl">
          <Text className="text-white font-semibold">
            {detailedUser?.speciality || cleaner.speciality_display}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProfileHeader;