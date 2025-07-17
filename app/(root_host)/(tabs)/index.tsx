import { getJobs } from '@/api/jobApi';
import { fetchPropertiesForMeta } from '@/api/propertyapi';
import { fetchUserDetails } from '@/api/userdetails';
import HomeSkeleton from '@/components/HomeSkeleton';
import HostDashboardCard from '@/components/HostDashboardCard';
import { toCamelCase } from '@/constants/camel';

import { useAuthStore, User } from '@/context/userAuthStore';
import { useAppToast } from '@/hooks/toastNotification';
import { today } from '@/utils/DateUtils';
import { filterTodaysJobs, filterUpcomingJobs } from '@/utils/filterJobs';
import { router } from 'expo-router';
import { Bell, ChevronRight, DollarSign, Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Define your job structure based on API response
interface Job {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  cleaningPrice: number;
  cleaner_id: string;
  address?: string;
  connection_id: number;
  profileImage?: string;
  property_detail?: {
    base_price?: string;
  };
}

const HostDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawJobs, setRawJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User | null>(null);
  const [totalProperties, setTotalProperties] = useState<number | undefined>();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const toast = useAppToast();
  const user = useAuthStore((state) => state.user);

  const currentDate = new Date();

  const totalCleaned = rawJobs.filter((job) => {
    if (job.status !== 'completed') return false;
    const jobDate = new Date(job.start_time);
    return (
      jobDate.getMonth() === currentDate.getMonth() &&
      jobDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const totalExpenditure = rawJobs
    .filter((job) => {
      if (!job.start_time || job.status !== 'completed') return false;
      const jobDate = new Date(job.start_time);
      return (
        jobDate.getMonth() === currentDate.getMonth() &&
        jobDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((total, job) => {
      const basePrice = parseFloat(job.property_detail?.base_price ?? "0");
      return total + basePrice;
    }, 0);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      if (response.success && response.data) {
        setRawJobs(response.data);
        console.log("user jobs:", response.data)
      } else {
        console.error("Error fetching jobs:", response.error);
        toast.error("Failed to load jobs");
      }
    } catch (error) {
      console.error("Exception in fetchJobs:", error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalProperties = async () => {
    try {
      const response = await fetchPropertiesForMeta();
      if (response.success && response.data) {
        setTotalProperties(response.data.properties_created);
      } else {
        toast.error("Failed to load total properties");
      }
    } catch (error) {
      toast.error("An error occurred while fetching total properties");
    }
  };

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const result = await fetchUserDetails(user?.id, user?.role);
      console.log("user details", user?.id, user?.role)
      if (result && result.success) {
        setUsers(result);
      }
      else {
        setUsers(null);
      }
    } catch (error) {
      toast.error("An error occurred while fetching user details");
      setUsers(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchUserDetail();
    fetchTotalProperties();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchJobs(),
        fetchUserDetail(),
        fetchTotalProperties()
      ]);
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          <HomeSkeleton />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const todaysJobs = filterTodaysJobs(rawJobs);
  const upcomingJobs = filterUpcomingJobs(rawJobs);

  const navigateToTodayCleanings = () => {
    router.push({
      pathname: "/(root_host)/(tabs)/jobs",
      params: { filter: 'Today' }
    });
  };

  return (
    <SafeAreaProvider >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1 "
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4F46E5']}
              tintColor="#4F46E5"
              title="Pull to refresh"
              titleColor="#4F46E5"
            />
          }
        >
          {/* Header */}
          <View className="bg-white rounded-2xl mt-2 px-5 py-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-gray-900">
                Hello, {toCamelCase(`${users?.user?.first_name || 'User'}`)}
              </Text>
              <Text className="text-gray-500 text-md mt-1">{today}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(root_cleaner)/(tabs)/notification")} className='bg-gray-100 p-3 rounded-full'>
              <Bell size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mx-4 mt-0">
            <TouchableOpacity
              className="bg-white rounded-lg p-4 flex-1 mt-2 mr-2 shadow-md gap-2 space-y-2"
              onPress={() => router.push("/(root_host)/(profile)/payment")}
            >
              <View className="items-center">
                <DollarSign color="green" size={24} />
                <Text className="mt-2 text-xs text-gray-500">Total spent this month</Text>
                <Text className="text-xl font-semibold mt-1">${totalExpenditure.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>

            <View className="bg-white rounded-lg p-4 flex-1 mt-2 shadow-md gap-2 space-y-2">
              <View className="items-center">
                <Sparkles color="#4925E9" size={24} />
                <Text className="mt-2 text-xs text-gray-500">Total cleaned this month</Text>
                <Text className="text-xl font-semibold mt-1">{totalCleaned}</Text>
              </View>
            </View>
          </View>

          {/* Today's Cleanings */}
          <View className="mt-6 mx-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold">Today's Cleanings</Text>
              <TouchableOpacity className="flex-row items-center" onPress={navigateToTodayCleanings}>
                <Text className="text-indigo-600 font-medium">See All</Text>
                <ChevronRight size={16} color="#4F46E5" className="ml-1" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={todaysJobs.filter(
                (item: {
                  property_detail: any;
                  profile_detail: {
                    cleaner_email: any;
                  };
                }) =>
                  item.property_detail?.cleaner_email
              )}
              renderItem={({ item }) => <HostDashboardCard jobs={item} />}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-gray-500">
                    No properties scheduled for cleaning today
                  </Text>
                </View>
              }
            />

          </View>

          {/* Upcoming Cleanings */}
          <View className="mx-4 mt-6 ">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold">Upcoming Cleanings</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/(root_host)/(tabs)/jobs")}
              >
                <Text className="text-indigo-600 font-medium">See All</Text>
                <ChevronRight size={16} color="#4F46E5" className="ml-1" />
              </TouchableOpacity>
            </View>

            <FlatList
               data={upcomingJobs.filter(
                (item: {
                  property_detail: any;
                  profile_detail: {
                    cleaner_email: any;
                  };
                }) =>
                  item.property_detail?.cleaner_email
              )}
              renderItem={({ item }) => <HostDashboardCard jobs={item} />}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-gray-500">
                    No properties scheduled for up commming days
                  </Text>
                </View>
              }
           
            />

          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default HostDashboard;
