import { getJobs } from '@/api/jobApi';
import { myNotifications } from '@/api/notificationApi';
import { fetchPropertiesByUserId } from '@/api/propertyapi';
import { ChatListItemSkeletonAnimated } from '@/components/ChatListSkeleton';
import useChatStore from '@/store/chatStore';
import usePropertyStore from '@/store/jobStore';
import { router } from 'expo-router';
import {
  Bell,
  Briefcase,
  Home,
  MessageCircle,
  UserPlus
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type NotificationType = 'job_assigned' | 'connection_request' | 'chat_message' | 'property_assignment';

interface Job {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

interface NotificationItem {
  initiator_profile_picture: any;
  initiator_id: boolean;
  id: number;
  recipient_id: number;
  recipient_full_name: string;
  initiator_full_name: string | null;
  connection_id: number | null;
  message_id: number | null;
  notification_type: NotificationType;
  related_content_type: string;
  related_object_id: number | null;
  job?: Job;
  property?: Property;
  text: string | null;
  created_at: string;
  read?: boolean; 
}

const Notification: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');
  const [notificationData, setNotificationData] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
const setSelectedUser = useChatStore((state) => state.setSelectedUser);
const[userJobs,setUserJobs]=useState([])
const [userProperties ,setUserProperties]=useState([])
const fetchProperties = async () => {
    try {
    
      const response = await fetchPropertiesByUserId();

      if (response.success) {
        setUserProperties(response.data);
        console.log("Properties fetched successfully:", response.data.length);
      } else {
        console.error("Error fetching properties:", response.error);
        
      }
    } catch (error) {
      console.error("Exception in fetchProperties:", error);
    
    } 
  };
    const fetchJobs = async (propertyId = null) => {
      try {
        
        const response = await getJobs(propertyId);
        
        if (response.success && response.data) {
          setUserJobs(response.data);
          console.log("Jobs fetched successfully at cleaners job field:", response.data);
        } else {
          console.error("Error fetching jobs:", response.error);
         
        }
      } catch (error) {
        console.error("Exception in fetchJobs:", error);
      
      }
    }
  const fetchNotifications = async () => {
    try {
      setError(null);
      const result = await myNotifications();
      
      if (result.success && result.data) {
        setNotificationData(result.data);
        console.log("my notification:",result.data)
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const filterNotifications = (filter: 'all' | NotificationType) => {
    setActiveFilter(filter);
  };

  const filteredNotifications = notificationData.filter((notification) => {
    if (activeFilter === 'all') return true;
    return notification.notification_type === activeFilter;
  });

  const markAsRead = (id: number) => {
    setNotificationData(
      notificationData.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    // TODO: Implement API call to mark notification as read on the backend
  };

 const getNotificationIcon = (type: NotificationType, read: boolean, profilePicture?: string | null) => {
  const iconColor = read ? '#9CA3AF' : '#4925E9';
  
  switch (type) {
    case 'job_assigned':
      return (<View className='rounded-full border border-primary p-0.5 border-dashed mt-4'>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('@/assets/images/profile.png')
            }
            className="w-10 h-10 rounded-full"
          />
        </View>)
    case 'connection_request':
      return (
        <View className='rounded-full border border-primary p-0.5 border-dashed mt-4'>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('@/assets/images/profile.png')
            }
            className="w-10 h-10 rounded-full"
          />
        </View>
      );
    case 'chat_message':
      return (<View className='rounded-full border border-primary p-0.5 border-dashed mt-4'>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('@/assets/images/profile.png')
            }
            className="w-10 h-10 rounded-full"
          />
        </View>)
    case 'property_assignment':
      return(<View className='rounded-full border border-primary p-0.5 border-dashed mt-4'>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('@/assets/images/profile.png')
            }
            className="w-10 h-10 rounded-full"
          />
        </View>)
    default:
      return (<View className='rounded-full border border-primary p-0.5 border-dashed mt-4'>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('@/assets/images/profile.png')
            }
            className="w-10 h-10 rounded-full"
          />
        </View>)
  }
};

  const formatNotificationContent = (notification: NotificationItem) => {
    const initiatorName = notification.initiator_full_name || 'Unknown';
    
    switch (notification.notification_type) {
      case 'job_assigned':
        if (notification.job) {
          // Check if it's a status update or new assignment
          if (notification.text?.includes('status has been updated')) {
            return {
              title: 'Job Status Updated',
              message: `Job "${notification.job.title}" status has been updated to ${notification.job.status}`,
              details: `Updated by: ${initiatorName}`
            };
          } else {
            return {
              title: 'New Job Assigned',
              message: `You have been assigned to "${notification.job.title}" by ${initiatorName}`,
              details: `Scheduled: ${new Date(notification.job.start_time).toLocaleDateString()} - ${new Date(notification.job.end_time).toLocaleDateString()}`
            };
          }
        }
        return {
          title: 'Job Assignment',
          message: notification.text || `You have been assigned to a new job by ${initiatorName}`,
          details: null
        };

      case 'property_assignment':
        if (notification.property) {
          return {
            title: 'Property Assigned',
            message: `You have been assigned to property "${notification.property.name}" by ${initiatorName}`,
            details: `Location: ${notification.property.address}, ${notification.property.city}, ${notification.property.state} ${notification.property.zip_code}`
          };
        }
        return {
          title: 'Property Assignment',
          message: notification.text || `You have been assigned to a property by ${initiatorName}`,
          details: null
        };

      case 'connection_request':
        return {
          title: 'Connection Request',
          message: `${initiatorName} has sent you a connection request`,
          details: notification.text || 'Tap to view details'
        };

      case 'chat_message':
        return {
          title: 'New Message',
          message: `${initiatorName} has sent you a message`,
          details: notification.text || 'Tap to view conversation'
        };

      default:
        return {
          title: 'Notification',
          message: notification.text || 'You have a new notification',
          details: initiatorName !== 'Unknown' ? `From: ${initiatorName}` : null
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
  };

const renderNotificationItem: ListRenderItem<NotificationItem> = ({ item }) => {
  const content = formatNotificationContent(item);
  const isRead = item.read !== false; // Default to read if not specified

  return (
    <TouchableOpacity
      className={`flex-row p-4 mb-2 rounded-lg ${
        !isRead ? 'bg-blue-50' : 'bg-white'
      } border border-gray-100`}
      onPress={() => {
        markAsRead(item.id);
        
        // If it's a connection request notification, navigate with the initiator ID
        if (item.notification_type === 'connection_request' && item.initiator_id) {
          // Navigate to Host Connection page with the initiator ID
          router.push({
            pathname: "/(root_cleaner)/(profile)/connecttohost",
            params: { 
              candidateId: item.initiator_id,
              openModal: 'true' 
            }
          });
        }
        if (item.notification_type === 'chat_message' && item.initiator_id) {
          // Navigate to Host Connection page with the initiator ID
            setSelectedUser({
                  id: item.initiator_id,
            profile_picture:item.initiator_profile_picture,
            username:item.initiator_full_name
        });
        router.push("/(helper)/chatroom")
        }
        if (item.notification_type === 'property_assignment' && item.property) {
  // Fetch properties and navigate to property description
  fetchProperties(); // You'll need to add this function to this component
  // Find the property that matches the notification's property ID
  const matchedProperty = userProperties.find(prop => prop.id === item.property.id);
  if (matchedProperty) {
    router.push({
      pathname: "/(helper)/propertydescription",
    });
    usePropertyStore.getState().setSelectedProperty(matchedProperty);
  }
}

  if (item.notification_type === 'job_assigned' && item.job) {
  // Fetch jon and navigate to jobs description
  fetchJobs(); // You'll need to add this function to this component
  // Find the jobs that matches the notification's jobs ID
  const matchedJob = userJobs.find(prop => prop.id === item.job.id);
  console.log("matched property:",matchedJob)
  if (matchedJob) {
    router.push({
      pathname: "/(helper)/jobdetails",
    });
     const originalJob = matchedJob;
        usePropertyStore.getState().setSelectedJob(originalJob || matchedJob);
  }
}
      }}
    >
      <View className="mr-3 mt-1">
        {getNotificationIcon(item.notification_type, isRead, item.initiator_profile_picture)}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start ">
          <Text className={`font-semibold text-base flex-1 ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
            {content.title}
          </Text>
          <Text className="text-xs text-gray-500 ml-2">{formatTimeAgo(item.created_at)}</Text>
        </View>
        
        <Text className={`mt-1 ${!isRead ? 'text-gray-700' : 'text-gray-500'}`}>
          {content.message}
        </Text>
        
        {content.details && (
          <Text className="text-xs text-gray-500 mt-1">
            {content.details}
          </Text>
        )}

        {/* Job specific details */}
        {item.notification_type === 'job_assigned' && item.job && (
          <View className="mt-2 p-2 bg-blue-50 rounded">
            <Text className="text-xs text-black font-bold">
              Status: <Text className="font-medium text-blue-600">{item.job.status}</Text>
            </Text>
            <Text className="text-xs text-black font-bold">
              Duration: <Text className='font-medium text-blue-600'>
                {new Date(item.job.start_time).toLocaleDateString()} - {new Date(item.job.end_time).toLocaleDateString()}
              </Text>
            </Text>
          </View>
        )}

        {/* Property specific details */}
        {item.notification_type === 'property_assignment' && item.property && (
          <View className="mt-2 p-2 bg-green-50 rounded">
            <Text className="text-xs text-black font-bold">
              Property ID: <Text className="font-medium text-green-600">#{item.property.id}</Text>
            </Text>
            <Text className="text-xs text-black font-bold">
              Address: <Text className='font-medium text-green-600'>
                {item.property.address}, {item.property.city}
              </Text>
            </Text>
          </View>
        )}
      </View>      
      {!isRead && (
        <View className="ml-2 mt-1">
          <View className="w-2 h-2 rounded-full bg-blue-600" />
        </View>
      )}
    </TouchableOpacity>
  );
};
  const FilterButton: React.FC<{
    title: string;
    filter: 'all' | NotificationType;
    icon: React.ReactNode;
  }> = ({ title, filter, icon }) => (
    <TouchableOpacity
      onPress={() => filterNotifications(filter)}
      className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${
        activeFilter === filter ? 'bg-primary' : 'bg-gray-100'
      }`}
    >
      {icon}
      <Text
        className={`ml-1 font-medium ${
          activeFilter === filter ? 'text-white' : 'text-gray-700'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 ">
           {Array.from({ length: 8 }).map((_, index) => (
  <ChatListItemSkeletonAnimated key={index} />
))}
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center px-4">
          <Bell size={48} color="#EF4444" />
          <Text className="mt-4 text-red-500 text-center font-medium text-base">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchNotifications}
            className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4925E9']}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Bell size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-500 text-center font-medium text-base">
              No notifications to display
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white mt-14">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row items-center justify-center p-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        <View className="w-10" />
      </View>

      {/* Filter Section */}
      <View className="px-4 py-3">
        <ScrollView className="flex-row" horizontal  showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="All"
            filter="all"
            icon={<Bell size={16} color={activeFilter === 'all' ? 'white' : '#4B5563'} />}
          />
          <FilterButton
            title="Jobs"
            filter="job_assigned"
            icon={<Briefcase size={16} color={activeFilter === 'job_assigned' ? 'white' : '#4B5563'} />}
          />
          <FilterButton
            title="Properties"
            filter="property_assignment"
            icon={<Home size={16} color={activeFilter === 'property_assignment' ? 'white' : '#4B5563'} />}
          />
          <FilterButton
            title="Connections"
            filter="connection_request"
            icon={<UserPlus size={16} color={activeFilter === 'connection_request' ? 'white' : '#4B5563'} />}
          />
          <FilterButton
            title="Messages"
            filter="chat_message"
            icon={<MessageCircle size={16} color={activeFilter === 'chat_message' ? 'white' : '#4B5563'} />}
          />
        </ScrollView>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

export default Notification;