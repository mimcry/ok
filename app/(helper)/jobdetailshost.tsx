import { fetchJobImagesById } from '@/api/jobApi';
import { submitReview } from '@/api/ratingApi';
import { getUserDetail } from '@/api/userdetails';
import TimelineSchedule from '@/components/cleaningstatushost/TimeLine';
import { useAppToast } from '@/hooks/toastNotification';
import useChatStore from '@/store/chatStore';
import usePropertyStore from '@/store/jobStore';
import { router } from 'expo-router';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  ChevronRight,
  DollarSign,
  MessageCircleMore,
  Phone,
  PlayCircle,
  Star,
  X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface JobImage {
  id: number;
  url: string;
  image_type: 'before' | 'after' | 'damage';
  uploaded_at: string;
}

interface JobImagesResponse {
  job_id: number;
  images: JobImage[];
}

interface JobImagesState {
  before: JobImage[];
  after: JobImage[];
  damage: JobImage[];
}

interface JobData {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  start_time: string;
  end_time: string;
  cleaner_started_time?: string;
  finished_at?: string;
  assigned_to?: string;
  property_detail: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    base_price: string;
    description: string;
    instruction?: string;
    property_type: string;
    cleaner_id: string;
    connection_id: number;
    cleaner_profile_picture?: string;
    cleaner?: {
      id: string;
      full_name: string;
      profile_picture?: string;
    };
  };
}

interface UserDetail {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  speciality: string;
  average_rating: number;
  ratings: any[];
}

interface StatusConfig {
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  label: string;
}

interface PhotoSectionProps {
  title: string;
  images: JobImage[];
  type: 'before' | 'after' | 'damage';
  labelColor: string;
  labelText: string;
  onImagePress: (index: number, type: 'before' | 'after' | 'damage') => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const JobDetailsScreen: React.FC = () => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedImageType, setSelectedImageType] = useState<'property' | 'before' | 'after' | 'damage'>('property');
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [detailedUser, setDetailedUser] = useState<UserDetail>({} as UserDetail);
  const [jobImages, setJobImages] = useState<JobImagesState>({
    before: [],
    after: [],
    damage: []
  });
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  const selectedJob = usePropertyStore((state) => state.selectedJob);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const flatListRef = useRef<FlatList>(null);
  const toast = useAppToast();

console.log("selected job",selectedJob)

  const propertyDetail = selectedJob?.property_detail;

  const imageUrls =
    propertyDetail?.images && propertyDetail.images.length > 0
      ? propertyDetail.images.map((img) => img.image) // map if needed
      : propertyDetail?.main_image
        ? [propertyDetail.main_image]
        : [];
  console.log("selected job:", imageUrls);
  const fetchJobImages = async (jobId: string): Promise<void> => {
    setIsLoadingImages(true);
    try {
      const response = await fetchJobImagesById(jobId);
      console.log("fetched organized images:", response);

      // Fixed typo: changed 'imaged' to 'images'
      if (response.success && response.data?.images) {
        const organizedImages: JobImagesState = {
          before: response.data.images.filter((img: JobImage) => img.image_type === "before"),
          after: response.data.images.filter((img: JobImage) => img.image_type === "after"),
          damage: response.data.images.filter((img: JobImage) => img.image_type === "damage"),
        };

        console.log("organized images:", organizedImages);
        setJobImages(organizedImages);
      } else {
        console.log("No images found or API call failed");
        // Reset to empty arrays if no images found
        setJobImages({
          before: [],
          after: [],
          damage: []
        });
      }
    } catch (error) {
      console.log("error fetching job images:", error);
      toast.error("Failed to load job images");
      // Reset to empty arrays on error
      setJobImages({
        before: [],
        after: [],
        damage: []
      });
    } finally {
      setIsLoadingImages(false);
    }
  };

  console.log("fetched images:", jobImages);

  useEffect(() => {
    if (!selectedJob) {
      Alert.alert('Error', 'No job details found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
    if (selectedJob?.property_detail?.cleaner_id) {
      fetchUserDetails(selectedJob.property_detail.cleaner_id);
    }
    if (selectedJob?.id) {
      fetchJobImages(selectedJob.id);
    }
  }, [selectedJob]);

  const fetchUserDetails = async (userId: string): Promise<void> => {
    try {
      const response = await getUserDetail(parseInt(userId), 'cleaner');
      if (response.success && response.data) {
        setDetailedUser({
          ...response.data,
          ratings: response.data.ratings || []
        });
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string): StatusConfig => {
    const configs: Record<string, StatusConfig> = {
      scheduled: {
        color: '#3B82F6',
        bgColor: '#EBF8FF',
        textColor: '#3B82F6',
        icon: <Calendar size={16} color="#3B82F6" />,
        label: 'Scheduled'
      },
      in_progress: {
        color: '#EA580C',
        bgColor: '#FEF3E2',
        textColor: '#EA580C',
        icon: <PlayCircle size={16} color="#EA580C" />,
        label: 'In Progress'
      },
      completed: {
        color: '#16A34A',
        bgColor: '#F0FDF4',
        textColor: '#16A34A',
        icon: <CheckCircle size={16} color="#16A34A" />,
        label: 'Completed'
      }
    };

    return configs[status] || {
      color: '#6B7280',
      bgColor: '#F9FAFB',
      textColor: '#6B7280',
      icon: <AlertCircle size={16} color="#6B7280" />,
      label: 'Unknown'
    };
  };

  const onImageScroll = (event: any): void => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const openImageModal = (index: number, type: 'property' | 'before' | 'after' | 'damage' = 'property'): void => {
    setSelectedImageIndex(index);
    setSelectedImageType(type);
    setShowImageModal(true);
  };

  const getItemLayout = (data: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  const onScrollToIndexFailed = (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };

  const renderPropertyImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={{ width: screenWidth, height: 280 }}
      className="relative"
      onPress={() => openImageModal(index, 'property')}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item }}
        style={{ width: screenWidth, height: 280 }}
        resizeMode="cover"
      />
      <View className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-full">
        <Text className="text-white text-xs font-medium">
          {index + 1} / {imageUrls?.length || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const PhotoSection: React.FC<PhotoSectionProps> = ({
    title,
    images,
    type,
    labelColor,
    labelText
  }) => {
    // Don't render section if no images
    if (!images || images.length === 0) return null;

    const handleSeeAll = () => {
      // You can customize this navigation or modal behavior
      console.log(`See all ${type} photos`);
    };

    return (
      <View className="mb-4 border border-gray-100 rounded-lg p-3">
        {/* Header with title + See All */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-medium text-gray-700">
            {title}
          </Text>
          <TouchableOpacity onPress={handleSeeAll}>
            <Text className="text-sm font-semibold text-primary">View All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal image scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {images.map((image, index) => (
            <TouchableOpacity
              key={image.id}
              onPress={() => openImageModal(index, type)}
              className="mr-3"
              activeOpacity={0.8}
            >
              <View className="relative">
                <Image
                  source={{ uri: image.url }}
                  className="w-28 h-28 rounded-lg"
                  resizeMode="cover"
                />

                <View className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded">
                  <Text className="text-white text-xs">
                    {formatDate(image.uploaded_at)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };


 const renderCompletionPhotos = (): React.ReactNode => {
  // If still loading all images, show spinner for the whole block
  if (isLoadingImages) {
    return (
      <View className="bg-white">
        <View className="py-8 items-center">
          <Text className="text-gray-500">Loading job images...</Text>
        </View>
      </View>
    );
  }

  // Once loaded, always render all three sections:
  return (
    <View className="bg-white">
      {/* BEFORE */}
      <PhotoSection
        title="Before Photos"
        images={jobImages.before}
        type="before"
        labelColor="bg-red-500"
        labelText="BEFORE"
        onImagePress={openImageModal}
      >
        {jobImages.before.length === 0 && (
          <View className="py-4 items-center">
            <Text className="text-gray-500">No images uploaded yet</Text>
          </View>
        )}
      </PhotoSection>

      {/* AFTER */}
      <PhotoSection
        title="After Photos"
        images={jobImages.after}
        type="after"
        labelColor="bg-green-500"
        labelText="AFTER"
        onImagePress={openImageModal}
      >
        {jobImages.after.length === 0 && (
          <View className="py-4 items-center">
            <Text className="text-gray-500">No images uploaded yet</Text>
          </View>
        )}
      </PhotoSection>

      {/* ISSUES */}
      <PhotoSection
        title="Issues Reported"
        images={jobImages.damage}
        type="damage"
        labelColor="bg-orange-500"
        labelText="ISSUE"
        onImagePress={openImageModal}
      >
        {jobImages.damage.length === 0 && (
          <View className="py-4 items-center">
            <Text className="text-gray-500">No damage issues reported</Text>
          </View>
        )}
      </PhotoSection>
    </View>
  );
};


  const renderImageModal = (): React.ReactNode => {
    const imageTypeMap = {
      property: { images: imageUrls || [], title: "Property Photos" },
      before: { images: jobImages.before, title: "Before Photos" },
      after: { images: jobImages.after, title: "After Photos" },
      damage: { images: jobImages.damage, title: "Issues Reported" }
    };

    const { images: currentImages, title } = imageTypeMap[selectedImageType];

    // For job images, extract URLs; for property images, use as-is
    const displayImageUrls = selectedImageType === 'property'
      ? currentImages as string[]
      : (currentImages as JobImage[])?.map(img => img.url) || [];

    return (
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between p-4">
              <TouchableOpacity
                onPress={() => setShowImageModal(false)}
                className="bg-white/20 p-2 rounded-full"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-semibold">{title}</Text>
              <View className="bg-white/20 px-3 py-2 rounded-full">
                <Text className="text-white text-sm">
                  {selectedImageIndex + 1} / {displayImageUrls?.length || 0}
                </Text>
              </View>
            </View>

            {/* Show upload date for job images */}
            {selectedImageType !== 'property' && (currentImages as JobImage[])?.[selectedImageIndex] && (
              <View className="px-4 pb-2">
                <Text className="text-white/70 text-sm text-center">
                  Uploaded:    {formatDate((currentImages as JobImage[])[selectedImageIndex].uploaded_at)} - {formatTime((currentImages as JobImage[])[selectedImageIndex].uploaded_at)}
                </Text>
              </View>
            )}

            <FlatList
              data={displayImageUrls}
              horizontal
              pagingEnabled
              initialScrollIndex={Math.min(selectedImageIndex, (displayImageUrls?.length || 1) - 1)}
              showsHorizontalScrollIndicator={false}
              getItemLayout={getItemLayout}
              onScrollToIndexFailed={onScrollToIndexFailed}
              renderItem={({ item }) => (
                <View style={{ width: screenWidth, height: screenHeight - 250 }} className="justify-center">
                  <Image
                    source={{ uri: item }}
                    style={{ width: screenWidth, height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
              )}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setSelectedImageIndex(index);
              }}
              scrollEventThrottle={16}
            />
          </SafeAreaView>
        </View>
      </Modal>
    );
  };

  const handleSubmitReview = async (): Promise<void> => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    try {
      setIsSubmitting(true);

      const cleaner_id = jobData.property_detail?.cleaner?.id || jobData.assigned_to;

      if (!cleaner_id) {
        toast.error("Cleaner information not found.");
        return;
      }

      const response = await submitReview(cleaner_id, rating, reviewText);

      if (response.success) {
        toast.success("Your Rating and Review was submitted.");
        setShowReviewModal(false);
        setRating(0);
        setReviewText('');
      } else {
        toast.error(response.message || 'Failed to submit your review. Please try again.');
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit your review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

   const renderStars = (currentRating: number, onPress?: (rating: number) => void, size: number = 20): React.ReactNode => (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress && onPress(star)}
          disabled={!onPress}
        >
          <Star
            size={size}
            color={star <= currentRating ? "#FFA500" : "#E5E7EB"}
            fill={star <= currentRating ? "#FFA500" : "none"}
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const handlePhoneCall = (): void => {
    const phoneNumber = detailedUser?.phone_number;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleStartChat = (): void => {
    setSelectedUser({
      id: jobData.property_detail?.connection_id,
      profile_picture: jobData?.property_detail?.cleaner_profile_picture,
      username: `${detailedUser.first_name} ${detailedUser.last_name}`,
    });
    router.push("/(helper)/chatroom");
  };

  if (!selectedJob) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No job selected</Text>
      </SafeAreaView>
    );
  }

  const jobData = selectedJob as unknown as JobData;
  const statusConfig = getStatusConfig(jobData.status);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image Gallery */}
        <View className="relative">
          {imageUrls && imageUrls.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={imageUrls}
                renderItem={renderPropertyImageItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onImageScroll}
                scrollEventThrottle={16}
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={onScrollToIndexFailed}
                style={{ height: 280 }}
              />

              {imageUrls.length > 1 && (
                <View className="absolute bottom-4 self-center flex-row bg-black/50 px-3 py-2 rounded-full">
                  {imageUrls.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full mx-1 ${index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View className="h-280 bg-gray-100 items-center justify-center">
              <Camera size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No images available</Text>
            </View>
          )}
        </View>

        <View className="px-4 py-4">
          {/* Header */}
          <View className="mb-4">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {jobData.title}
                </Text>
                <Text className="text-md text-gray-600">
                  {jobData.property_detail?.name}
                </Text>
              </View>
              <View className="flex-col items-end">
                <View className="flex-row items-center mb-2">
                  <DollarSign size={16} color="#4D9043" />
                  <Text className="text-lg font-semibold text-green-700">
                    {jobData.property_detail?.base_price || '$0'}
                  </Text>
                </View>

              </View>
            </View>
          </View>
          <TimelineSchedule jobData={jobData} />



          {/* Assigned Cleaner */}
         {jobData.assigned_to && detailedUser.first_name && (
  <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center">
        <Image
          source={
            jobData?.property_detail?.cleaner_profile_picture
              ? { uri: jobData?.property_detail?.cleaner_profile_picture }
              : require('@/assets/images/profile.png')
          }
          className="w-12 h-12 rounded-md"
          resizeMode="cover"
        />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {detailedUser.first_name} {detailedUser.last_name}
          </Text>
          <View className="flex-row items-center mt-1">
            {renderStars(detailedUser?.average_rating || 0)}
            <Text className="text-gray-600 ml-2 text-sm">
              {detailedUser?.average_rating || 0}
            </Text>
          </View>
        </View>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-primary text-xs font-medium">
            {detailedUser.speciality || 'Verified'}
          </Text>
        </View>
      </View>
    </View>
    
    <View className="flex-row space-x-3">
      <TouchableOpacity
        className="flex-1 bg-primary flex-row items-center justify-center py-3 px-4 rounded-md"
        onPress={handlePhoneCall}
      >
        <Phone size={18} color="white" />
        <Text className="text-white font-medium ml-2">Call</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="flex-1 bg-gray-100 ml-2 flex-row items-center justify-center py-3 px-4 rounded-md"
        onPress={handleStartChat}
      >
        <MessageCircleMore size={18} color="gray" />
        <Text className="text-gray-700 font-medium ml-2">Message</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
          {/* Completion Photos */}
          {renderCompletionPhotos()}

          {/* Special Instructions */}
          {jobData.property_detail?.instruction && (
            <View>
              <Text className="text-md font-semibold text-gray-800 mb-2">Special Instructions</Text>
              <View className="bg-blue-50 border border-gray-200 rounded-md p-2 mb-4">
                <View className="flex-row items-start">

                  <View className="ml-3 flex-1">
                    <Text className="text-gray-700 ">{jobData.property_detail.instruction}</Text>
                  </View>
                </View>
              </View>
            </View>

          )}
          <View>
            <Text className="text-md font-semibold text-gray-900 ml-2 mb-2">Job Description</Text>
            <View className="bg-blue-50 rounded-md p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-3">


              </View>
              <Text className="text-gray-700 ">{jobData.description}</Text>
            </View>
          </View>
          {/* Job Description */}


          {/* Property Description */}
          <View>
            <Text className="text-mdlg font-semibold text-gray-900 ml-2 mb-2">About Property</Text>
            <View className="bg-blue-50 rounded-md p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center ">

              </View>
              <Text className="text-gray-700 ">{jobData.property_detail?.description}</Text>
            </View>
          </View>


          {/* Review Section */}
          {jobData.status === 'completed' && (
            <View className="bg-white rounded-xl p-4 mb-4  border-gray-100">
            

              <TouchableOpacity
                onPress={() => setShowReviewModal(true)}
                className="bg-primary p-4 rounded-lg flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Award size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Leave a Review</Text>
                <ChevronRight size={20} color="white" className="ml-1" />
              </TouchableOpacity>
            </View>
          )}

          <View className="h-6" />
        </View>
      </ScrollView>

      {/* Image Modal */}
      {renderImageModal()}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View
            className="bg-white rounded-t-3xl border-t border-white"
            style={{ height: screenHeight * 0.45 }}
          >
            <SafeAreaView className="flex-1">
              <View className="flex-row items-center justify-between p-6">
                <View className="w-8" />
                <Text className="text-xl font-bold text-black">Rate & Review</Text>
                <TouchableOpacity
                  onPress={() => setShowReviewModal(false)}
                  className="p-2"
                >
                  <X size={20} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-6">
                {/* Rating */}
                <View className="items-center mb-6">
                  <View className="mb-4">
                    {renderStars(rating, setRating, 32)}
                  </View>
                </View>

                {/* Review Text */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-3">
                    Share your experience (optional)
                  </Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <TextInput
                      className="min-h-24 text-base"
                      placeholder="Tell us about your cleaning experience..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      textAlignVertical="top"
                      value={reviewText}
                      onChangeText={setReviewText}
                      maxLength={500}
                    />
                  </View>
                  <Text className="text-gray-400 text-sm mt-2 text-right">
                    {reviewText.length}/500
                  </Text>
                </View>
              </ScrollView>

              {/* Submit Button */}
              <View className="p-6 pt-4">
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={rating === 0 || isSubmitting}
                  activeOpacity={0.8}
                >
                  <View
                    className={`p-4 rounded-xl flex-row items-center justify-center ${rating === 0 || isSubmitting ? 'bg-gray-400' : 'bg-blue-500'
                      }`}
                  >
                    <Text className="text-white font-semibold text-base">
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default JobDetailsScreen;
