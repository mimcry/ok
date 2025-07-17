import { assignCleanerToProperty } from '@/api/assignProperty';
import { myConnections } from '@/api/myConections';
import { getUserDetail } from '@/api/userdetails';
import { CleanerCard } from '@/components/assigncleaner/CleanerCard';
import CleanerProfileModal from '@/components/assigncleaner/CleanerProfileModal';
import { EmptyState } from '@/components/assigncleaner/EmptyState';
import { LoadingState } from '@/components/Loading';
import PropertyHeaderCard from '@/components/PropertyHeaderCard';
import { SearchBar } from '@/components/SearchBar';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from '@/store/jobStore';
import { Cleaner } from '@/types/cleanermarketplace'; // Use the imported type
import { router, useLocalSearchParams } from 'expo-router';
import {
  Star
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  View,
} from 'react-native';


const AssignCleanerScreen: React.FC = () => {
  const { propertyId, propertyName } = useLocalSearchParams();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [filteredCleaners, setFilteredCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [selectedCleanerDetails, setSelectedCleanerDetails] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [assigningCleaner, setAssigningCleaner] = useState(false);
  const [loadingCleanerDetails, setLoadingCleanerDetails] = useState(false);
  const toast = useAppToast();

  const property = usePropertyStore((state) => state.selectedProperty);
  console.log("selected property:", property);

  // Fetch connected cleaners using the API
  useEffect(() => {
    fetchConnectedCleaners();
  }, []);

  // Function to fetch connected cleaners
  const fetchConnectedCleaners = async () => {
    setLoading(true);
    try {
      const response = await myConnections();
      console.log("response data for cleaners to assign a property:", response.data);

      if (response.success && response.data) {
        // Transform the API data to match the imported Cleaner interface
        const connectedCleaners: Cleaner[] = response.data.map((connection: any) => {
          // Handle both old structure (partner) and new direct structure
          const cleanerData = connection.partner || connection;

          return {
            // Required fields from the imported Cleaner interface
            id: cleanerData.id?.toString() || '',
            email: cleanerData.email || '',
            username: cleanerData.username || cleanerData.full_name || '',
            full_name: cleanerData.full_name || `${cleanerData.first_name || ''} ${cleanerData.last_name || ''}`.trim() || cleanerData.username || 'Unknown',

            // Optional fields
            profile_picture: cleanerData.profile_picture,
            date_joined: cleanerData.date_joined || new Date().toISOString(),
            total_assigned: Number(cleanerData.total_assigned) || 0,
            completed_jobs: Number(cleanerData.completed_jobs) || 0,
            scheduled_jobs: Number(cleanerData.scheduled_jobs) || 0,
            in_progress_jobs: Number(cleanerData.in_progress_jobs) || 0,
            overdue_jobs: Number(cleanerData.overdue_jobs) || 0,
            bio: cleanerData.bio || 'No bio available',
            experience: Math.max(1, Math.floor((new Date().getTime() - new Date(cleanerData.date_joined || Date.now()).getTime()) / (365.25 * 24 * 60 * 60 * 1000))),
            speciality: cleanerData.speciality || 'General Cleaning',
            speciality_display: cleanerData.speciality || 'General Cleaning',
            average_rating: Number(cleanerData.average_rating) || 0,
            ratings: Array.isArray(cleanerData.ratings) ? cleanerData.ratings : [],
            member_since: cleanerData.date_joined || new Date().toISOString(),
            availability: (cleanerData.scheduled_jobs || 0) < 5,

            // Computed fields for compatibility
            name: cleanerData.full_name || `${cleanerData.first_name || ''} ${cleanerData.last_name || ''}`.trim() || cleanerData.username || 'Unknown',
            avatar: cleanerData.profile_picture,
            rating: Number(cleanerData.average_rating) || 0,
            totalJobs: Number(cleanerData.completed_jobs) || 0,
            reviews: Array.isArray(cleanerData.ratings) ? cleanerData.ratings : [],
            specialties: cleanerData.speciality ? [cleanerData.speciality] : ['General Cleaning']
          };
        });

        setCleaners(connectedCleaners);
        setFilteredCleaners(connectedCleaners);
      } else {
        console.error('Failed to fetch cleaners:', response.error);
        setCleaners([]);
        setFilteredCleaners([]);

        Alert.alert(
          "Connection Error",
          "Failed to load cleaners. " + (response.error || "Please try again later."),
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error fetching cleaners:', error);
      setCleaners([]);
      setFilteredCleaners([]);

      Alert.alert(
        "Error",
        "An unexpected error occurred while loading cleaners.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  console.log("matched cleaners:", cleaners);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCleaners(cleaners);
    } else {
      const filtered = cleaners.filter(cleaner => {
        const searchLower = searchQuery.toLowerCase();
        return (
          cleaner.name?.toLowerCase().includes(searchLower) ||
          cleaner.specialties?.some((specialty: string) =>
            specialty.toLowerCase().includes(searchLower)
          ) ||
          cleaner.username.toLowerCase().includes(searchLower) ||
          cleaner.full_name.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCleaners(filtered);
    }
  }, [searchQuery, cleaners]);

  // Open modal with cleaner details
  const openCleanerProfile = async (cleaner: Cleaner) => {
    setSelectedCleaner(cleaner);
    setModalVisible(true);
    setLoadingCleanerDetails(true);

    try {
      // Fetch detailed user information
      const cleanerId = parseInt(cleaner.id.toString());
      if (isNaN(cleanerId)) {
        throw new Error('Invalid cleaner ID');
      }

      const response = await getUserDetail(cleanerId, 'cleaner');

      if (response.success && response.data) {
        setSelectedCleanerDetails(response.data);
        console.log("Detailed cleaner info:", response.data);
      } else {
        console.error('Failed to fetch cleaner details:', response.error);
        toast.error('Failed to load detailed information');
      }
    } catch (error) {
      console.error('Error fetching cleaner details:', error);
      toast.error('Failed to load detailed information');
    } finally {
      setLoadingCleanerDetails(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedCleaner(null);
    setSelectedCleanerDetails(null);
    setLoadingCleanerDetails(false);
  };

  const assignCleaner = async (cleanerId: string) => {
    if (!property?.id) {
      toast.error("No property selected");
      return;
    }

    setAssigningCleaner(true);
    try {
      const propertyID = property.id;
      console.log("Assigning cleaner to property:", { cleanerId, propertyID });

      const response = await assignCleanerToProperty(propertyID, cleanerId);

      if (response.success) {
        closeModal();
        toast.success("Assigned cleaner successfully");

        // Use push instead of replace to maintain navigation stack
        router.push({
          pathname: "/(root_cleaner)/(profile)/propertymanager",
          params: {
            id: propertyId as string,
            assignedCleaner: cleanerId,
          },
        });
      } else {
        const errorMessage = response.error || "Failed to assign cleaner";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error assigning cleaner:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAssigningCleaner(false);
    }
  };

  // Render stars for ratings
  const renderStars = (rating: number) => {
    const validRating = isNaN(rating) ? 0 : Math.max(0, Math.min(5, rating));

    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= validRating ? "#FFB800" : "#D1D5DB"}
            fill={star <= validRating ? "#FFB800" : "none"}
          />
        ))}
      </View>
    );
  };



  // Add key extractor function
  const keyExtractor = (item: Cleaner) => item.id.toString();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 ">
        {/* Property info */}
        <PropertyHeaderCard
          property={property}
          onPress={() => {
            // Handle card press - maybe navigate to property details
            console.log('Property card pressed');
          }}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <LoadingState message="Loading cleaners..." />
        ) : filteredCleaners.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        ) : (
          <FlatList
            data={filteredCleaners}
            renderItem={({ item }) => (
              <CleanerCard cleaner={item} onPress={openCleanerProfile} />
            )}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}

          />
        )}
        {/* Cleaner profile modal */}
        <CleanerProfileModal
          visible={modalVisible}
          selectedCleaner={selectedCleaner}
          selectedCleanerDetails={selectedCleanerDetails}
          loadingCleanerDetails={loadingCleanerDetails}
          assigningCleaner={assigningCleaner}
          onClose={closeModal}
          onAssignCleaner={assignCleaner}
        />
      </View>
    </SafeAreaView>
  );
};

export default AssignCleanerScreen;