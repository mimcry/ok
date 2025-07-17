import { mergePropertyImageUrls } from '@/constants/mergeimages';
import usePropertyStore from '@/store/jobStore';
import { JobStatus } from '@/types/propertytype';
import { DateFormatter, DateUtils } from '@/utils/DateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Type definitions
type UserRole = 'host' | 'helper' | string;

type StatusStylesType = {
  containerClass: string;
  textClass: string;
  stateText: string;
};

type StatusColors = Record<string, string>;

const getStatusStyles = (state: JobStatus): StatusStylesType => {
  switch (state) {
    case 'completed':
      return {
        containerClass: 'bg-green-100',
        textClass: 'text-green-700',
        stateText: 'Completed'
      };
    case 'scheduled':
      return {
        containerClass: 'bg-red-100',
        textClass: 'text-red-700',
        stateText: 'Scheduled'
      };
    case 'in-progress':
      return {
        containerClass: 'bg-yellow-100',
        textClass: 'text-yellow-700',
        stateText: 'In Progress'
      };
    default:
      return {
        containerClass: 'bg-gray-100',
        textClass: 'text-gray-700',
        stateText: 'Unknown'
      };
  }
};

// Interface for property details
interface Property {
  id?: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  main_image?: string;
  base_price?: string;
  description?: string;
  instruction?: string;
  images?: string[];
}

// Interface for job item
interface JobItem {
  id: string | number;
  title: string;
  description: string;
  status: JobStatus;
  date?: string;
  startTime?: string;
  dueTime?: string;
  price?: string;
  property?: Property;
  property_detail?: Property;
  propertyId?: string | number;
  imageUrl?: string[];
  name?: string;
  address?: string;
  displayDate?: string;
  start_time?: string;
  end_time?: string;
}

// Props interface
interface JobCardProps {
  item: JobItem;
}

// Navigation parameters type
interface NavigationParams {
  id: string;
  name?: string;
  date?: string;
  imageUrl?: string;
  address?: string;
  city?: string;
  ZipCode?: string;
  dueTime?: string;
  price?: string;
  description?: string;
  status: JobStatus;
  instruction?: string;
  end_time?: string;
  start_time?: string;
  images?: string[];
  userRole?: string;
}

export const DisplayJobCard: React.FC<JobCardProps> = ({ item }) => {
  console.log("card details", item);

  const statusColors: StatusColors = {
    completed: 'bg-green-100',
    'in-progress': 'bg-blue-100',
    scheduled: 'bg-purple-100',
    pending: 'bg-amber-100',
    cancelled: 'bg-red-100'
  };

  const statusTextColors: StatusColors = {
    completed: 'text-green-800',
    'in-progress': 'text-blue-800',
    scheduled: 'text-purple-800',
    pending: 'text-amber-800',
    cancelled: 'text-red-800'
  };

  // Check if the job is today or upcoming
  const isToday: boolean = item.displayDate === 'Today';
  const isUpcoming: boolean = item.displayDate === 'Tomorrow' ||
    (item.date !== undefined && new Date(item.date) > new Date());

  // Image source with proper typing
  const imageSource: { uri: string } = {
    uri: (item.imageUrl && item.imageUrl[0]) ||
      (item.property_detail?.main_image) ||
      'https://via.placeholder.com/300'
  };

  const imageUrls: string[] = mergePropertyImageUrls(item.property_detail) || [];
  console.log("images that i got ", imageUrls);

 const handleViewDetails = async (): Promise<void> => {
  if (!item.id) {
    console.error("No job ID available");
    return;
  }

  try {
    // Get user role from AsyncStorage
    const storedRole: string | null = await AsyncStorage.getItem('user_role');
    console.log("User role:", storedRole);

    // Set the selected job in the store
    usePropertyStore.getState().setSelectedJob(item);

    // Determine route based on user role
    const targetRoute: string = storedRole === 'host'
      ? "/(helper)/jobdetailshost"
      : "/(helper)/jobdetails";

    // Build params object for navigation
    const params = {
      id: item.id,
      name: item.name || item.title,
      date: item.date,
      imageUrl: item.imageUrl ? JSON.stringify(item.imageUrl) : undefined,
      address: item.address || item.property_detail?.address,
      city: item.property_detail?.city,
      ZipCode: item.property_detail?.zip_code,
      dueTime: item.end_time,
      price: item.price,
      description: item.description,
      status: item.status,
      instruction: item.property_detail?.instruction || '',
      end_time: item.end_time,
      start_time: item.start_time,
      images: item.property_detail?.main_image ? [item.property_detail.main_image] : [],
      userRole: storedRole || '',
    };

    // Navigate with params included
    router.push({
      pathname: targetRoute,
      params,
    });

  } catch (error) {
    console.error("Error getting user role or navigating:", error);

    // Fallback route without params
    router.push({
      pathname: "/(helper)/jobdetails",
    });
  }
};


  // Format the address
  const formattedAddress: string = item.address ||
    (item.property_detail
      ? `${item.property_detail.address}, ${item.property_detail.city}, ${item.property_detail.state}, ${item.property_detail.zip_code}`
      : 'No address');

  const statusStyles: StatusStylesType = getStatusStyles(item.status);

  // Default image source for fallback
  const defaultImageSource: ImageSourcePropType = require('@/assets/images/hero.png');

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-md mb-4 overflow-hidden"
      onPress={handleViewDetails}
      activeOpacity={0.9}
      style={styles.cardShadow}
    >
      <Image
        source={imageSource}
        className="w-full h-40"
        defaultSource={defaultImageSource}
        style={styles.image}
      />
      {(isToday || isUpcoming) && (
        <View className="absolute top-3 right-3">
          <DateFormatter
            date={item.date}
            format="badge"
            badgeStyle="bg-black bg-opacity-60 rounded-lg px-4 py-1"
            textStyle="text-white font-medium text-xs"
          />
        </View>
      )}
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <Text className="text-lg font-bold text-gray-800">
            {item.name || item.title}
          </Text>
          <View className={`px-3 py-1 rounded-full ${statusStyles.containerClass}`}>
            <Text className={`text-xs font-semibold ${statusStyles.textClass}`}>
              {statusStyles.stateText}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-2">
          <MapPin size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-1 text-sm">{formattedAddress}</Text>
        </View>

        <View className="flex-row items-center mt-2">
          <Clock size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-1 text-sm">
            Due {DateUtils.formatToTime(item.end_time)}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-indigo-600 py-3 rounded-lg mt-3"
          onPress={handleViewDetails}
        >
          <Text className="text-white font-semibold text-center">View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  image: {
    backgroundColor: '#E5E7EB' // gray-200 as placeholder color
  }
});