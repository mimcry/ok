import { confirmConnection } from '@/api/confirmConnection';
import { connectionRequests } from '@/api/connectionRequests';
import { getJobs } from '@/api/jobApi';
import { fetchUserDetails } from '@/api/userdetails';
import { ConnectionRequest } from '@/app/(helper)/hostreuestpage';
import CleanerDashboardCard from '@/components/CleanerDashboardCard';
import EmptyJobsCard, { EmptyJobsCardMinimal } from '@/components/EmptyJobCard';
import HomeSkeleton from '@/components/HomeSkeleton';
import { getCurrentGreeting } from '@/constants/greeating';
import { useAuthStore } from '@/context/userAuthStore';
import { useAppToast } from '@/hooks/toastNotification';
import { jobtype } from '@/types/jobs';
import { today } from '@/utils/DateUtils';
import { filterTodaysJobs, filterUpcomingJobs } from '@/utils/filterJobs';
import { router } from 'expo-router';
import { Bell, DollarSign, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface User {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  role: string;
}

interface UserDetailsResponse {
  success: boolean;
  user: User;
  result?:[]
}
interface Job {
  status: string;
  end_time?: string;
  updated_at?: string;
  property_detail?: {
    base_price?: string;
  };
}

const home: React.FC = () => {
  const [greeting, setGreeting] = useState<string>('');
  const [matchedJobs, setMatchedJobs] = useState<jobtype[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userJobs, setUserJobs] = useState<jobtype[]>([]);
  const [users, setUsers] = useState<UserDetailsResponse | null>(null);
  const toast = useAppToast();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [connectionRequest, setConnectionRequest] = useState<ConnectionRequest[]>([]);
   const [processingRequest, setProcessingRequest] = useState<boolean>(false);
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
const fetchrequest = async () => {
  try {
    const result = await connectionRequests();
    console.log("Connection details:", result);
    if (result.success && result.data && result.data.length > 0) {
      setConnectionRequest(result.data);
    }
  } catch (error) {
    console.error("Error fetching connection requests:", error);
  }
}
  const fetchJobs = async (propertyId = null) => {
    try {
      const response = await getJobs(propertyId);

      if (response.success && response.data) {
        setUserJobs(response.data);
      } else {
        console.error("Error fetching jobs:", response.error);
        toast.error("Failed to load jobs");
      }
    } catch (error) {
      console.error("Exception in fetchJobs:", error);
      toast.error("An error occurred while fetching jobs");
    }
  };

  const fetchuserdetail = async (propertyId = null) => {
    try {
       
      
      const result = await fetchUserDetails(user.id, user.role);
      console.log("Profile data from backend:", result);

      if (result.success && result.user) {
        const userData = result.user;
        setUsers(result);
        console.log("user details in profile section", userData);
      } else {
        console.log("API returned unsuccessful or no user data:", result);
      }
    } catch (error) {
      console.error("Exception in fetchuserdetails:", error);
      toast.error("An error occurred while fetching user details");
    }
  };

  // Combined function to fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update greeting
      setGreeting(getCurrentGreeting());
      
      // Fetch both jobs and user details concurrently
      await Promise.all([
        fetchJobs(),
        fetchuserdetail(),
           fetchrequest()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      connectionRequests()
      // Update greeting
      setGreeting(getCurrentGreeting());
      
      // Fetch both jobs and user details concurrently
      await Promise.all([
        fetchJobs(),
        fetchuserdetail(),
           fetchrequest()
      ]);
      
    
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  console.log("Users fetched successfully in home:", users);

  useEffect(() => {
    fetchAllData();
    fetchrequest()
  }, []);

  const todaysJobs = filterTodaysJobs(userJobs);
  console.log("Today's jobs count:", todaysJobs);
  const upcomingJobs = filterUpcomingJobs(userJobs);
  console.log("Upcoming jobs:", upcomingJobs);

const calculateTotalEarnings = (jobs: Job[]): number => {
  return jobs
    .filter(job => job.status.toLowerCase() === 'completed')
    .reduce((total, job) => {
      const jobPrice = parseFloat(job.property_detail?.base_price ?? "0");
      return total + jobPrice;
    }, 0);
};

const getLatestCompletedJobPrice = (jobs: Job[]): number => {
  const completedJobs = jobs
    .filter(job => job.status.toLowerCase() === 'completed')
    .sort((a, b) => {
      const dateA = new Date(a.end_time ?? a.updated_at ?? "");
      const dateB = new Date(b.end_time ?? b.updated_at ?? "");
      return dateB.getTime() - dateA.getTime();
    });

  if (completedJobs.length > 0) {
    return parseFloat(completedJobs[0].property_detail?.base_price ?? "0");
  }

  return 0;
};


// Replace the existing totalEarnings and todaysEarnings calculations (around lines 116-120) with:
const totalEarnings = calculateTotalEarnings(userJobs);
const latestCompletedJobPrice = getLatestCompletedJobPrice(userJobs);
console.log("total earning today :",latestCompletedJobPrice)

  const completionRate = upcomingJobs.length
  const handleAcceptRequest = async (requestId: number) => {
    setProcessingRequest(true);
    try {
      const response = await confirmConnection(requestId, 'accept');

      if (response.success) {
        toast.success("Request accepted successfully!")
      
        // Refresh requests list after accepting
        const result = await connectionRequests();
        if (result.success && Array.isArray(result.data)) {
          setRequests(result.data);
        }
      } else {
        toast.error("Failed to accept the request.")
       
      }

 
    } catch (error) {
              toast.error("An unexpected error occurred while accepting the request.")
      
    } finally {
      setProcessingRequest(false);
    }
  };
  const navigateToTodayJobs = () => {
    router.push({
      pathname: "/(root_cleaner)/(tabs)/jobs",
      params: { filter: 'Today' }
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white ">
        <HomeSkeleton></HomeSkeleton>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
          <Text className="text-red-500 text-lg mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-indigo-600 py-3 px-6 rounded-lg"
            onPress={() => {
              setError(null);
              fetchAllData();
            }}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4F46E5']} // Android
              tintColor="#4F46E5" // iOS
              title="Pull to refresh" // iOS
              titleColor="#4F46E5" // iOS
            />
          }
        >
          {/* Header Section */}
          <View className="bg-white  mx-4 mt-4 px-5 py-4  flex-row items-center justify-between">
            {/* Text Section */}
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-semibold text-gray-900">
                Hello, {users?.user?.first_name || 'User'}
              </Text>
             <Text className="text-gray-500 text-md mt-1">{today}</Text>
            </View>

           <TouchableOpacity onPress={() => router.push("/(root_cleaner)/(tabs)/notification")} className='bg-gray-100 p-3 rounded-full'>
              <Bell size={24} color="black" />
            </TouchableOpacity>
        
          </View>
<View className="flex-row justify-between mx-4 mt-0">
            <TouchableOpacity
              className="bg-white rounded-lg p-4 flex-1 mt-2 mr-2 shadow-md gap-2 space-y-2"
              onPress={() => router.push("/(root_host)/(profile)/payment")}
            >
              <View className="items-center">
                <DollarSign color="green" size={24} />
                <Text className="mt-2 text-sm text-gray-500">Total Earned this month</Text>
                <Text className="text-xl font-semibold mt-1">${totalEarnings}</Text>
              </View>
            </TouchableOpacity>

            <View className="bg-white rounded-lg p-4 flex-1 mt-2 shadow-md gap-2 space-y-2">
              <View className="items-center">
                <Sparkles color="#4925E9" size={24} />
                <Text className="mt-2 text-sm text-gray-500">Total cleaned this month</Text>
                <Text className="text-xl font-semibold mt-1">{completionRate}</Text>
              </View>
            </View>
          </View>
         
{/* Friend Request Section - Add this after Header Section */}
{connectionRequest.length > 0 && (
  <View className="mx-4 mt-4">
    <Text className="text-lg font-semibold mb-3">Host Requests</Text>
    <View className="bg-white rounded-lg p-4 shadow-md flex-row items-center justify-between">
      {/* Profile Section */}
      <View className="flex-row items-center flex-1">
        <View className="h-12 w-12 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
          <Image
            source={
              connectionRequest[0].host_profile_picture
                ? { uri: connectionRequest[0].host_profile_picture }
                : require('@/assets/images/profile.png')
            }
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{connectionRequest[0].host_full_name}</Text>
          <Text className="text-sm text-gray-500">
            {connectionRequest[0].host_city || connectionRequest[0].host_country || 'Location not specified'}
          </Text>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View className="flex-row">
        <TouchableOpacity className="bg-gray-100 px-3 py-2 rounded-lg mr-2" onPress={()=> router.push({
              pathname: "/(root_cleaner)/(profile)/connecttohost",
              params: { 
                candidateId: connectionRequest[0].initiator_id,
                openModal: 'true' 
              }
            })}>
          <Text className="text-gray-700 font-medium">View</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-indigo-600 px-3 py-2 rounded-lg"    onPress={() => handleAcceptRequest(connectionRequest[0].initiator_id )}>
          <Text className="text-white font-medium">Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}
          {/* Schedule Section */}
          <View className="mt-6 mx-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold">Today's Schedule</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={navigateToTodayJobs}
              >
                <Text className="text-indigo-600 mr-1">See All</Text>
              </TouchableOpacity>
            </View>

            {/* Job List For Today's schedules */}
            <FlatList
              data={todaysJobs}
              renderItem={({ item }) => <CleanerDashboardCard jobs={item} />}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Disable scrolling within FlatList as parent ScrollView handles scrolling
              ListEmptyComponent={<EmptyJobsCardMinimal/>}
            />
          </View>

          <View className='mx-4 mt-6'>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold">Upcoming Schedule</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/(root_cleaner)/(tabs)/jobs")}
              >
                <Text className="text-indigo-600 mr-1">See All</Text>
              </TouchableOpacity>
            </View>

            {/* Job List For upcoming days */}
            <FlatList
              data={upcomingJobs.slice(0, 3)} // Show only up to 3 upcoming jobs
              renderItem={({ item }) => <CleanerDashboardCard jobs={item} />}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={<EmptyJobsCard/>}
            />
          </View>

          {/* Pull to refresh indicator */}
          <View className="items-center py-6">
            <Text className="text-gray-400 text-sm">Pull down to refresh</Text>
          </View>

          {/* Add padding at the bottom for better scrolling experience */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default home;