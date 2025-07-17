import { getUserDetail } from '@/api/userdetails';
import useChatStore from '@/store/chatStore';
import usePropertyStore from '@/store/jobStore';
import { DateFormatter, getTimeDuration } from '@/utils/DateUtils';
import { router } from 'expo-router';
import {
  Clock,
  MapPin,
  MessageCircleMore,
  Phone,
  Star,
} from 'lucide-react-native';
import React, { JSX, ReactNode, useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SkeletonCard } from './HostDashboardCardSkeleton';

interface ServiceProvider {
  property_detail: any;
  connection_id: number;
  cleaningPrice: ReactNode;
  cleaner_id: string;
  name: string;
  rating: number;
  time: string;
  location: string;
  price: number;
  duration: string;
  serviceType: string;
  profileImage: ImageSourcePropType;
  status?: string;
  start_time: string;
  end_time: string;
  address?: string;
}

interface ServiceProviderCardProps {
  jobs: ServiceProvider;
  onCall?: () => void;
  onMessage?: () => void;
  onMore?: () => void;
}

export default function HostDashboardCard({
  jobs,
  onCall,

  onMore,
}: ServiceProviderCardProps): JSX.Element {
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [detailUser, setDetailedUser] = useState<any>(null);

  const inProgressGreen = '#4D9043';

  // Determine if job status is "in progress"
  const isInProgress = jobs?.status?.toLowerCase() === 'in-progress' ||jobs?.status?.toLowerCase() === 'completed';

  // Conditional styles for "in progress"
  const cardStyle = {
    backgroundColor: isInProgress ? inProgressGreen : '#FFFFFF',
  };
const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const textColor = isInProgress ? '#FFFFFF' : '#1F2937'; // white or gray-900
  const subTextColor = isInProgress ? '#FFFFFF' : '#4B5563'; // white or gray-600
  const iconColor = isInProgress ? '#FFFFFF' : '#6B7280'; // white or gray-500
  const buttonBg = isInProgress ? 'rgba(255,255,255,0.2)' : '#EFF6FF'; // translucent white or blue-50
  const buttonIconColor = isInProgress ? '#FFFFFF' : '#4925E9';
console.log("jobs",jobs)
  const statusBg = isInProgress ? 'rgba(255,255,255,0.3)' : '#DBEAFE'; // translucent white or blue-100
  const statusTextColor = isInProgress ? '#FFFFFF' : '#2563EB'; // white or blue-600
const onMessage = () => {
  setSelectedUser({
      id: jobs.property_detail.connection_id,
      profile_picture: detailUser.profile_picture,
      username: '',
      partner: {
          phone_number: ''
      }
  });

  router.push("/(helper)/chatroom");
};

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const response = await getUserDetail(parseInt(userId), 'cleaner');
      if (response.success && response.data) {
        const userData = {
          ...response.data,
          ratings: response.data.ratings || [],
        };
        setDetailedUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchUserDetails(jobs?.property_detail.cleaner_id);
  }, []);
if (loadingDetails || !detailUser) {
  return <SkeletonCard />;
}
  return (
    <TouchableOpacity
      style={cardStyle}
      className="rounded-lg shadow-sm border border-gray-200 p-4 m-3 py-2 mt-2"
      onPress={()=>{
        router.push("/(helper)/jobdetailshost");
                        usePropertyStore.getState().setSelectedJob(jobs);

      }}
    >
      {/* Header Row */}
      <View className="flex-row items-start mb-1">
        {/* Profile Image */}
        <Image
          source={
            detailUser?.profile_picture
              ? { uri: detailUser.profile_picture }
              : require('@/assets/images/profile.png')
          }
          className="w-14 h-14 mr-3 rounded-md"
          resizeMode="cover"
        />

        <View className="flex-1">
          {/* Name and Rating */}
          <View className="flex-row items-center justify-between mb-1">
            {/* Left: Name and Rating */}
            <View className="flex-row items-center">
              <Text
                style={{ color: textColor }}
                className="text-lg font-semibold mr-2"
              >
                {detailUser?.first_name} {detailUser?.last_name}
              </Text>
              <View className="flex-row items-center">
                <Star size={16} color="#FFD700" />
                <Text
                  style={{ color: textColor }}
                  className="text-sm ml-1"
                >
                  {detailUser?.average_rating}
                </Text>
              </View>
            </View>

            {/* Right: Job Status */}
            <View
              style={{ backgroundColor: statusBg }}
              className="px-2 py-1 rounded-xl"
            >
              <Text
                style={{ color: statusTextColor }}
                className="text-xs font-semibold capitalize"
              >
                {jobs?.status}
              </Text>
            </View>
          </View>

          {/* Time and Location */}
          <View className="flex-row items-center">
            <Clock size={14} color={iconColor} />
            <Text
              style={{ color: subTextColor }}
              className="text-sm ml-2"
            >
              <DateFormatter date={jobs?.start_time as string} format="time"   textClassName={`text-${textColor}`}/>
            </Text>

            <Text className="mx-2 text-white font-bold">•</Text>

            <MapPin size={14} color={iconColor} />
            <Text
              style={{ color: subTextColor }}
              className="text-sm ml-2"
            >
              {jobs?.property_detail.address}, {jobs?.property_detail.city}, {jobs?.property_detail.state}, {jobs?.property_detail.zip_code}
            </Text>
          </View>
        </View>
      </View>

      <View className="my-2 border-t border-white opacity-40" />

      {/* Bottom Row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text
            style={{ color: textColor }}
            className="text-md font-bold mr-2"
          >
            ${jobs?.property_detail.base_price}
          </Text>

          <Text
            style={{ color: subTextColor }}
            className="text-sm ml-4"
          >
            {getTimeDuration(jobs.start_time, jobs.end_time)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center space-x-2 gap-2">
          <TouchableOpacity
            onPress={() => {
              if (detailUser?.phone_number) {
                Linking.openURL(`tel:${detailUser.phone_number}`);
              }
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: buttonBg }}
            activeOpacity={0.7}
          >
            <Phone size={15} color={buttonIconColor} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onMessage}
            className="w-10 h-10 rounded-full  items-center justify-center"
            style={{ backgroundColor: buttonBg }}
            activeOpacity={0.7}
          >
            <MessageCircleMore size={20} color={buttonIconColor} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
