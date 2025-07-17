import React, { useState, useEffect, ReactNode } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  Modal, 
  ScrollView, 
  ActivityIndicator, 
  Pressable, 
  TextInput,
  RefreshControl
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Star, 
  StarHalf, 
  MapPin, 
  Briefcase, 
  Clock, 
  Calendar, 
  MessageCircle, 
  UserCheck,
  Search,
  AlertCircle,
  Mail,
  Award,
  CheckCircle,
  User,
  TrendingUp,
  Phone,
  Home,
  Globe,
  Users,
  UserPlus
} from 'lucide-react-native';
import { fetchCandidates } from "@/api/unconnectedusers"
import { requesttoconnect } from '@/api/requestcleaner';
import { getUserDetail } from '@/api/userdetails'; 
import { fetchPendingRequests, cancelConnectionRequest } from '@/api/requestcleaner';
import { useAppToast } from '@/hooks/toastNotification';
import { router } from 'expo-router';
import PendingRequestCard from '@/components/PendinRequestCard';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  profile_picture: string | null;
  date_joined: string;
  total_assigned?: number;
  completed_jobs?: number;
  scheduled_jobs?: number;
  in_progress_jobs?: number;
  overdue_jobs?: number;
  bio?: string | null;
  experience?: string | null;
  speciality?: string | null;
  speciality_display?: string | null;
  average_rating?: number | null;
  ratings?: Rating[];
}

interface Rating {
  id?: number;
  score: number;
  comment: string;
  created_at: string;
  host_name?: string;
}

// Enhanced interface for detailed user data
interface DetailedUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  profile_picture: string | null;
  address_line?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  date_joined: string;
  bio?: string;
  speciality?: string;
  average_rating?: number;
  ratings: Rating[];
  total_assigned: number;
  completed_jobs: number;
  scheduled_jobs: number;
  in_progress_jobs: number;
  overdue_jobs: number;
}

// Transformed interface for frontend use
interface Cleaner {
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_picture: string;
  date_joined: string;
  total_assigned: number;
  completed_jobs: number;
  scheduled_jobs: number;
  in_progress_jobs: number;
  overdue_jobs: number;
  bio: string | null;
  experience: string | null;
  speciality: string | null;
  speciality_display: string | null;
  average_rating: number | null;
  ratings: Rating[];
  member_since: string;
  availability: boolean;
}

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

const CleanersMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'pending'>('find');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [assigningCleaner, setAssigningCleaner] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingLoading, setPendingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const toast = useAppToast();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadCleaners();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingRequests();
    }
  }, [activeTab]);

  const loadCleaners = async (isRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchCandidates();
      
      if (response.success && response.candidates) {
        const formattedCleaners: Cleaner[] = response.candidates.map((user: any) => ({
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          profile_picture: user.profile_picture || require('@/assets/images/profile.png'),
          date_joined: user.date_joined,
          total_assigned: user.total_assigned,
          completed_jobs: user.completed_jobs,
          scheduled_jobs: user.scheduled_jobs,
          in_progress_jobs: user.in_progress_jobs,
          overdue_jobs: user.overdue_jobs,
          bio: user.bio,
          experience: user.experience,
          speciality: user.speciality,
          speciality_display: user.speciality_display,
          average_rating: user.average_rating,
          ratings: user.ratings || [], // FIX: Ensure ratings is always an array
          member_since: new Date(user.date_joined).getFullYear().toString(),
          availability: user.scheduled_jobs < 5 
        }));
        
        setCleaners(formattedCleaners);
      } else {
        setError(response.error || 'Failed to load cleaners');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    setPendingLoading(true);
    setPendingError(null);
    
    try {
      const response = await fetchPendingRequests();
      
      if (response.success && response.data) {
        setPendingRequests(response.data);
      } else {
        setPendingError(response.error || 'Failed to load pending requests');
      }
    } catch (err) {
      setPendingError('An unexpected error occurred');
      console.error(err);
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const response = await getUserDetail(parseInt(userId), 'cleaner');
      if (response.success && response.data) {
        // FIX: Ensure ratings is always an array
        const userData = {
          ...response.data,
          ratings: response.data.ratings || []
        };
        setDetailedUser(userData);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const onRefresh = () => {
    if (activeTab === 'find') {
      loadCleaners(true);
    } else {
      loadPendingRequests();
    }
  };

  const openModal = async (cleaner: Cleaner) => {
    setSelectedCleaner(cleaner);
    setModalVisible(true);
    setDetailedUser(null);
    await fetchUserDetails(cleaner.id);
  };

  const closeModal = () => {
    setModalVisible(false);
    setDetailedUser(null);
  };

  const assignCleaner = (cleanerId: string) => {
    setAssigningCleaner(true);
    requesttoconnect(cleanerId)
      .then(response => {
        if (response) {
          toast.success("Connection request sent successfully.");
          loadCleaners(false);
        } else {
          toast.error('Failed to send request');
        }
      })
      .catch(error => {
        console.error('Request error:', error);
        toast.error('An error occurred while sending the request');
      })
      .finally(() => {
        setAssigningCleaner(false);
        closeModal();
        router.push("/(helper)/cleanermarketplace")
      });
  };

  const handleCancelRequest = async (userId: number) => {
    try {
      const response = await cancelConnectionRequest(userId);
      
      if (response.success) {
        toast.success(response.message || "Connection request cancelled successfully.");
        loadPendingRequests(); // Refresh the pending requests list
      } else {
        toast.error(response.message || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Cancel request error:', error);
      toast.error('An error occurred while cancelling the request');
    }
  };

  const renderStars = (rating: number | null) => {
    const stars = [];
    const actualRating = rating || 0;
    const fullStars = Math.floor(actualRating);
    const hasHalfStar = actualRating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} size={16} color="#FFD700" fill="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" size={16} color="#FFD700" fill="#FFD700" />);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} size={16} color="#D1D5DB" />);
    }
    
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  // FIX: Helper function to safely get ratings array
  const getRatings = (user: DetailedUser | null, cleaner: Cleaner | null): Rating[] => {
    return user?.ratings || cleaner?.ratings || [];
  };

  const renderCleanerCard = ({ item }: { item: Cleaner }) => (
    <TouchableOpacity 
      className="bg-white rounded-2xl mb-3 shadow-lg"
      onPress={() => openModal(item)}
    >
      <View className="flex-row p-4 items-center">
        <View className="relative">
          <Image
            source={typeof item.profile_picture === 'string' ? { uri: item.profile_picture } : item.profile_picture}
            className={`w-16 h-16 rounded-full border-2 ${item.availability ? 'border-primary' : 'border-gray-300'}`}
          />
          {item.availability && (
            <View className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
          )}
        </View>
        
        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-800">
              {item.full_name}
            </Text>
            {item.average_rating && (
              <View className="flex-row items-center bg-yellow-100 px-2 py-0.5 rounded-xl">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text className="ml-1 text-xs font-semibold text-yellow-700">
                  {item.average_rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center mt-1">
            <Mail size={12} color="#6B7280" />
            <Text className="ml-1 text-gray-500 text-xs">
              {item.email}
            </Text>
          </View>

          {item.speciality_display && (
            <View className="mt-1.5">
              <Text className="text-xs text-indigo-600 font-medium">
                {item.speciality_display}
              </Text>
            </View>
          )}
          
          <View className="flex-row mt-2 bg-gray-50 rounded-xl p-2">
            <View className="flex-row items-center mr-4">
              <CheckCircle size={12} color="#10B981" />
              <Text className="ml-1 text-xs text-green-800 font-medium">
                {item.completed_jobs} completed
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Clock size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-500">
                {item.total_assigned} total jobs
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredCleaners = searchQuery 
    ? cleaners.filter(cleaner => 
        cleaner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleaner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cleaner.speciality_display && cleaner.speciality_display.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : cleaners;

  const renderTabContent = () => {
    if (activeTab === 'find') {
      if (loading) {
        return (
          <View className="flex-1 justify-center items-center bg-gray-50">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="mt-4 text-gray-600 text-base">Loading cleaners...</Text>
          </View>
        );
      }

      if (error) {
        return (
          <View className="flex-1 justify-center items-center bg-gray-50 p-4">
            <AlertCircle size={48} color="#EF4444" />
            <Text className="mt-4 text-gray-800 font-medium text-lg text-center">
              Unable to load cleaners
            </Text>
            <Text className="mt-2 text-gray-600 text-center">{error}</Text>
            <TouchableOpacity 
              className="mt-6 bg-indigo-600 py-3 px-6 rounded-xl"
              onPress={() => loadCleaners(false)}
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <FlatList
          data={filteredCleaners}
          renderItem={renderCleanerCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
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
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <User size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-4">No cleaners found</Text>
              <Text className="text-gray-400 text-sm mt-1">Try adjusting your search terms</Text>
            </View>
          }
        />
      );
    } else {
      if (pendingLoading) {
        return (
          <View className="flex-1 justify-center items-center bg-gray-50">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-4 text-gray-600 text-base">Loading pending requests...</Text>
          </View>
        );
      }

      if (pendingError) {
        return (
          <View className="flex-1 justify-center items-center bg-gray-50 p-4">
            <AlertCircle size={48} color="#EF4444" />
            <Text className="mt-4 text-gray-800 font-medium text-lg text-center">
              Unable to load pending requests
            </Text>
            <Text className="mt-2 text-gray-600 text-center">{pendingError}</Text>
            <TouchableOpacity 
              className="mt-6 bg-orange-600 py-3 px-6 rounded-xl"
              onPress={loadPendingRequests}
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <FlatList
          data={pendingRequests}
          renderItem={({ item }) => (
            <PendingRequestCard 
              request={item} 
              onCancel={handleCancelRequest}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F97316']} // Android
              tintColor="#F97316" // iOS
              title="Pull to refresh" // iOS
              titleColor="#F97316" // iOS
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Clock size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-4">No pending requests</Text>
              <Text className="text-gray-400 text-sm mt-1">Your sent requests will appear here</Text>
            </View>
          }
        />
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tab Header */}
      <View className="pt-2 pb-4 px-4 bg-white shadow-sm">
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
              activeTab === 'find' ? 'bg-indigo-600' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('find')}
          >
            <Users size={20} color={activeTab === 'find' ? 'white' : '#6B7280'} />
            <Text className={`ml-2 font-semibold ${
              activeTab === 'find' ? 'text-white' : 'text-gray-500'
            }`}>
              Find Cleaners
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
              activeTab === 'pending' ? 'bg-primary' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('pending')}
          >
            <Clock size={20} color={activeTab === 'pending' ? 'white' : '#6B7280'} />
            <Text className={`ml-2 font-semibold ${
              activeTab === 'pending' ? 'text-white' : 'text-gray-500'
            }`}>
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search bar - only show on find tab */}
        {activeTab === 'find' && (
          <View className="flex-row bg-gray-100 rounded-xl px-3 py-2  items-center">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800 text-base"
              placeholder="Search cleaners by name, email, or specialty..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}
      </View>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Enhanced Modal for cleaner details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      > 
        <View className="flex-1 bg-black/70 justify-end">
          <Pressable 
            className="absolute w-full h-full" 
            onPress={closeModal}
          />
          
          {selectedCleaner && (
            <View className="mt-20 bg-white rounded-t-3xl flex-1 overflow-hidden ">
              {/* Close button */}
              <View className="absolute right-4 top-4 z-10">
                <TouchableOpacity 
                  onPress={closeModal}
                  className="bg-white/90 p-2.5 rounded-3xl shadow-md"
                >
                  <X size={20} color="#374151" />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Enhanced Profile header with gradient background */}
                <View className="items-center pt-10 pb-8 px-6 bg-indigo-500">
                  <View className="relative">
                    <Image
                      source={typeof selectedCleaner.profile_picture === 'string' ? { uri: selectedCleaner.profile_picture } : selectedCleaner.profile_picture}
                      className="w-28 h-28 rounded-full border-4 border-white"
                    />
                    {selectedCleaner.availability && (
                      <View className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 border-3 border-white items-center justify-center">
                        <CheckCircle size={12} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-3xl font-extrabold text-white mt-5 text-center">
                    {detailedUser ? `${detailedUser.first_name} ${detailedUser.last_name}` : selectedCleaner.full_name}
                  </Text>
                  
                  <Text className="text-base text-white/80 mt-1">
                    @{detailedUser ? detailedUser.username : selectedCleaner.username}
                  </Text>
                  
                  {(detailedUser?.average_rating || selectedCleaner.average_rating) && (
                    <View className="flex-row items-center mt-3 bg-white/20 px-4 py-2 rounded-2xl">
                      {renderStars(detailedUser?.average_rating || selectedCleaner.average_rating)}
                      <Text className="ml-2 text-white font-semibold text-base">
                        {/* FIX: Use helper function to safely get ratings length */}
                        {(detailedUser?.average_rating || selectedCleaner.average_rating)?.toFixed(1)} ({getRatings(detailedUser, selectedCleaner).length} reviews)
                      </Text>
                    </View>
                  )}

                  {(detailedUser?.speciality || selectedCleaner.speciality_display) && (
                    <View className="mt-3 bg-white/20 px-4 py-2 rounded-2xl">
                      <Text className="text-white font-semibold">
                        {detailedUser?.speciality || selectedCleaner.speciality_display}
                      </Text>
                    </View>
                  )}
                </View>

                {loadingDetails && (
                  <View className="py-10 items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text className="mt-3 text-gray-500">Loading details...</Text>
                  </View>
                )}

                {/* Stats Grid */}
                <View className="flex-row px-6 py-6 justify-between">
                  <View className="items-center flex-1">
                    <View className="bg-blue-100 p-3 rounded-2xl mb-2">
                      <CheckCircle size={24} color="#1D4ED8" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800">
                      {detailedUser?.completed_jobs || selectedCleaner.completed_jobs}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      Completed
                    </Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <View className="bg-yellow-100 p-3 rounded-2xl mb-2">
                      <Clock size={24} color="#D97706" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800">
                      {detailedUser?.scheduled_jobs || selectedCleaner.scheduled_jobs}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      Scheduled
                    </Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <View className="bg-purple-100 p-3 rounded-2xl mb-2">
                      <TrendingUp size={24} color="#7C3AED" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800">
                      {detailedUser?.total_assigned || selectedCleaner.total_assigned}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      Total Jobs
                    </Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <View className="bg-green-100 p-3 rounded-2xl mb-2">
                      <Calendar size={24} color="#059669" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800">
                      {selectedCleaner.member_since}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      Member Since
                    </Text>
                  </View>
                </View>

                {/* Contact Information Card */}
                {detailedUser && (
                  <View className="mx-4 mb-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 ">
                    <Text className="text-lg font-bold text-gray-800 mb-4">
                      Contact Information
                    </Text>
                    
                    <View className="flex-row items-center mb-3">
                      <View className="bg-blue-100 p-2 rounded-xl mr-3">
                        <Mail size={18} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-0.5">Email</Text>
                        <Text className="text-gray-800 text-sm font-medium">
                          {detailedUser.email}
                        </Text>
                      </View>
                    </View>

                    {detailedUser.phone_number && (
                      <View className="flex-row items-center mb-3">
                        <View className="bg-green-100 p-2 rounded-xl mr-3">
                          <Phone size={18} color="#10B981" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-gray-500 mb-0.5">Phone</Text>
                          <Text className="text-gray-800 text-sm font-medium">
                            {detailedUser.phone_number}
                          </Text>
                        </View>
                      </View>
                    )}


                    {(detailedUser.address_line || detailedUser.city) && (
                      <View className="flex-row items-center">
                        <View className="bg-yellow-100 p-2 rounded-xl mr-3">
                          <MapPin size={18} color="#D97706" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-gray-500 mb-0.5">Address</Text>
                          <Text className="text-gray-800 text-sm font-medium">
                            {[detailedUser.address_line, detailedUser.city, detailedUser.state, detailedUser.zip_code]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Bio Section */}
                {(detailedUser?.bio || selectedCleaner.bio) && (
                  <View className="px-6 py-5 border-t border-gray-100">
                    <Text className="text-xl font-bold text-gray-800 mb-3">
                      About
                    </Text>
                    <Text className="text-base text-gray-600 leading-6">
                      {detailedUser?.bio || selectedCleaner.bio}
                    </Text>
                  </View>
                )}

                {/* Experience Section */}
                {selectedCleaner.experience && (
                  <View className="px-6 py-5 border-t border-gray-100">
                    <Text className="text-xl font-bold text-gray-800 mb-3">
                      Experience
                    </Text>
                    <Text className="text-base text-gray-600 leading-6">
                      {selectedCleaner.experience}
                    </Text>
                  </View>
                )}
                
                {/* Reviews Section */}
              {(detailedUser?.ratings || selectedCleaner.ratings) && (detailedUser?.ratings || selectedCleaner.ratings).length > 0 && (
  <View className="px-6 py-5 border-t border-gray-100 pb-56">
    <View className="flex-row justify-between items-center mb-5">
      <Text className="text-xl font-bold text-gray-800">
        Reviews & Ratings
      </Text>
      <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-2xl">
        <MessageCircle size={16} color="#4B5563" />
        <Text className="ml-1.5 text-gray-600 font-medium">
          {(detailedUser?.ratings || selectedCleaner.ratings).length}
        </Text>
      </View>
    </View>
    
    {(detailedUser?.ratings || selectedCleaner.ratings).map((rating, index) => (
      <View 
        key={index}
        className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            {renderStars(rating.score)}
            <Text className="ml-2 font-semibold text-gray-800">
              {rating.score.toFixed(1)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {new Date(rating.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {rating.host_name && (
          <View className="flex-row items-center mb-2">
            <User size={14} color="#6B7280" />
            <Text className="ml-1.5 text-sm text-gray-500 font-medium">
              {rating.host_name}
            </Text>
          </View>
        )}
        
        <Text className="text-sm text-gray-700 leading-5">
          {rating.comment}
        </Text>
      </View>
    ))}
  </View>
)}
                
             
              </ScrollView>
              
              {/* Action Button */}
              <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-100 shadow-2xl">
                <TouchableOpacity
                  className={`${assigningCleaner ? 'bg-gray-400' : 'bg-indigo-600'} py-4 rounded-2xl flex-row items-center justify-center shadow-lg`}
                  onPress={() => assignCleaner(selectedCleaner.id)}
                  disabled={assigningCleaner}
                >
                  {assigningCleaner ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white text-lg font-bold ml-3">
                        Sending Request...
                      </Text>
                    </>
                  ) : (
                    <>
                      <UserCheck size={24} color="white" />
                      <Text className="text-white text-lg font-bold ml-3">
                        Send Connection Request
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default CleanersMarketplace;