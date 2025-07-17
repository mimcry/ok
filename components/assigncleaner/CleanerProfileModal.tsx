import { CleanerProfileModalProps } from '@/types/cleanermarketplace';
import { DateFormatter } from '@/utils/DateUtils';
import {
  Award,
  Briefcase,
  Calendar,
  ChevronLeft,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  UserCheck
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import NealtyButton from '../Button';

const CleanerProfileModal: React.FC<CleanerProfileModalProps> = ({
  visible,
  selectedCleaner,
  selectedCleanerDetails,
  loadingCleanerDetails,
  assigningCleaner,
  onClose,
  onAssignCleaner
}) => {
  // Render stars for ratings
  const renderStars = (rating: number) => {
    const validRating = isNaN(rating) ? 0 : Math.max(0, Math.min(5, rating));

    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= validRating ? "#FFB800" : "#E5E7EB"}
            fill={star <= validRating ? "#FFB800" : "none"}
          />
        ))}
      </View>
    );
  };

  if (!selectedCleaner) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View className="mt-16 h-[40%] bg-white flex-1 overflow-hidden shadow-2xl">
          {/* Header with close button */}
          <View className="absolute left-4 ml-4 top-4 z-10">
            <TouchableOpacity
              onPress={onClose}
              className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg border border-gray-100"
            >
              <ChevronLeft size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {loadingCleanerDetails ? (
              <View className="flex-1 justify-center items-center py-32">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-600 font-medium">Loading details...</Text>
              </View>
            ) : (
              <>
                {/* Profile header with gradient background */}
                <View className="bg-gradient-to-b from-indigo-50 to-white">
                  <View className="items-center pt-12 pb-8 px-6">
                    {/* Profile image with enhanced styling */}
                    <View className="relative">
                      <View className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-20"></View>
                      <View className="relative border-2 mt-4 border-primary p-1 rounded-full shadow-xl bg-white">
                        <Image
                          source={
                            selectedCleanerDetails?.profile_picture || selectedCleaner.avatar
                              ? { uri: selectedCleanerDetails?.profile_picture || selectedCleaner.avatar, cache: 'force-cache' }
                              : require("@/assets/images/profile.png")
                          }
                          className="w-28 h-28 rounded-full"
                        />
                      </View>
                      {/* Status indicator */}
                      <View className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${selectedCleaner.availability ? 'bg-green-500' : 'bg-gray-400'}`}>
                      </View>
                    </View>

                    {/* Name and username */}
                    <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">
                      {selectedCleanerDetails?.first_name && selectedCleanerDetails?.last_name
                        ? `${selectedCleanerDetails.first_name} ${selectedCleanerDetails.last_name}`
                        : selectedCleaner.name}
                    </Text>
                    <Text className="text-gray-500 text-base font-medium mt-1">
                      @{selectedCleanerDetails?.username || selectedCleaner.username || 'N/A'}
                    </Text>

                    {/* Rating */}
                    <View className="flex-row items-center mt-4 bg-white/70 px-4 py-2 rounded-full">
                      {renderStars(selectedCleanerDetails?.average_rating || selectedCleaner.rating)}
                      <Text className="ml-3 text-gray-700 font-semibold">
                        {(selectedCleanerDetails?.average_rating || selectedCleaner.rating).toFixed(1)}
                      </Text>
                      <Text className="text-gray-500 text-sm ml-1">
                        ({(selectedCleanerDetails?.ratings || selectedCleaner.reviews).length} reviews)
                      </Text>
                    </View>

                    {/* Contact Info */}
                    <View className="flex-row flex-wrap justify-center mt-6 gap-4">
                      {selectedCleanerDetails?.phone_number && (
                        <View className="flex-row items-center bg-white/70 px-3 py-2 rounded-full">
                          <Phone size={16} color="#4B5563" />
                          <Text className="ml-2 text-gray-700 text-sm font-medium">
                            {selectedCleanerDetails.phone_number}
                          </Text>
                        </View>
                      )}
                      {selectedCleanerDetails?.email && (
                        <View className="flex-row items-center bg-white/70 px-3 py-2 rounded-full">
                          <Mail size={16} color="#4B5563" />
                          <Text className="ml-2 text-gray-700 text-sm font-medium" numberOfLines={1}>
                            {selectedCleanerDetails.email}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Stats Section with cards */}
                <View className="px-6 py-6 bg-gray-50/50">
                  <Text className="text-lg font-bold text-gray-900 mb-4">Performance Stats</Text>
                  <View className="flex-row justify-between mb-4">
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mr-2">
                      <View className="items-center">
                        <View className="bg-green-100 p-2 rounded-full mb-2">
                          <Award size={20} color="#059669" />
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">Completed</Text>
                        <Text className="text-xl font-bold text-gray-900 mt-1">
                          {selectedCleanerDetails?.completed_jobs || selectedCleaner.totalJobs}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mx-1">
                      <View className="items-center">
                        <View className="bg-blue-100 p-2 rounded-full mb-2">
                          <Clock size={20} color="#2563EB" />
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">Scheduled</Text>
                        <Text className="text-xl font-bold text-gray-900 mt-1">
                          {selectedCleanerDetails?.scheduled_jobs || 0}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 ml-2">
                      <View className="items-center">
                        <View className="bg-purple-100 p-2 rounded-full mb-2">
                          <Briefcase size={20} color="#7C3AED" />
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">Total</Text>
                        <Text className="text-xl font-bold text-gray-900 mt-1">
                          {selectedCleanerDetails?.total_assigned || 0}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Additional Stats Row */}
                  {selectedCleanerDetails?.in_progress_jobs !== undefined && (
                    <View className="flex-row justify-between">
                      <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mr-2">
                        <View className="items-center">
                          <View className="bg-amber-100 p-2 rounded-full mb-2">
                            <Clock size={18} color="#D97706" />
                          </View>
                          <Text className="text-xs text-gray-500 font-medium">In Progress</Text>
                          <Text className="text-lg font-bold text-amber-600 mt-1">
                            {selectedCleanerDetails.in_progress_jobs}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 ml-2">
                        <View className="items-center">
                          <View className="bg-red-100 p-2 rounded-full mb-2">
                            <Clock size={18} color="#DC2626" />
                          </View>
                          <Text className="text-xs text-gray-500 font-medium">Overdue</Text>
                          <Text className="text-lg font-bold text-red-600 mt-1">
                            {selectedCleanerDetails.overdue_jobs}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* Bio Section */}
                <View className="px-6 py-6 bg-white">
                  <Text className="text-lg font-bold text-gray-900 mb-4">About</Text>
                  <Text className="text-gray-600 leading-6 text-base">
                    {selectedCleanerDetails?.bio || selectedCleaner.bio || 'No bio available'}
                  </Text>

                  <View className="mt-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Specialty</Text>
                    <View className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-full self-start">
                      <Text className="text-white text-sm font-medium">
                        {selectedCleanerDetails?.speciality || selectedCleaner.specialties[0]}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Address */}
                {(selectedCleanerDetails?.address_line || selectedCleanerDetails?.city) && (
                  <View className="px-6 py-6 bg-gray-50/50 border-t border-gray-100">
                    <View className="flex-row items-start">
                      <View className="bg-gray-100 p-2 rounded-full mr-4 mt-1">
                        <MapPin size={20} color="#6B7280" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold text-base mb-1">Address</Text>
                        <Text className="text-gray-600 text-sm leading-5">
                          {[
                            selectedCleanerDetails.address_line,
                            selectedCleanerDetails.city,
                            selectedCleanerDetails.state,
                            selectedCleanerDetails.zip_code,
                            selectedCleanerDetails.country
                          ].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Member Since */}
                <View className="px-6 py-6 bg-white border-t border-gray-100">
                  <View className="flex-row items-center">
                    <View className="bg-indigo-100 p-2 rounded-full mr-4">
                      <Calendar size={20} color="#4F46E5" />
                    </View>
                    <View>
                      <Text className="text-gray-900 font-semibold text-base">Member Since</Text>
                      <Text className="text-gray-600 text-sm mt-1">
                        <DateFormatter
                          date={selectedCleanerDetails?.date_joined || selectedCleaner.member_since}
                          format="display"
                        />
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Reviews */}
                <View className="px-6 py-6 bg-gray-50/50 border-t border-gray-100">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-lg font-bold text-gray-900">Reviews</Text>
                    <View className="flex-row items-center bg-white px-3 py-2 rounded-full">
                      <MessageCircle size={16} color="#6B7280" />
                      <Text className="ml-2 text-gray-700 font-medium">
                        {(selectedCleanerDetails?.ratings || selectedCleaner.reviews).length}
                      </Text>
                    </View>
                  </View>

                  {(selectedCleanerDetails?.ratings || selectedCleaner.reviews).length > 0 ? (
                    (selectedCleanerDetails?.ratings || selectedCleaner.reviews).map((rating: any, index: number) => (
                      <View key={index} className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-start mb-3">
                          <Text className="font-semibold text-gray-900 text-base">
                            {rating.host_name || rating.user || 'Anonymous'}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            <DateFormatter
                              date={rating.created_at || rating.date}
                              format="display"
                            />
                          </Text>
                        </View>
                        <View className="mb-3">
                          {renderStars(rating.score || rating.rating)}
                        </View>
                        <Text className="text-gray-600 leading-5">{rating.comment}</Text>
                      </View>
                    ))
                  ) : (
                    <View className="bg-white p-8 rounded-xl border border-gray-100 items-center">
                      <MessageCircle size={32} color="#D1D5DB" />
                      <Text className="text-gray-500 italic mt-2">No reviews yet</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>

 {/* Enhanced Assignment button */}
<View className="p-6 border-t border-gray-200 bg-white">
  <NealtyButton
    text={selectedCleaner.availability ? 'Assign Cleaner' : 'Not Available'}
    loading={assigningCleaner}
    loadingText="Assigning..."
    disabled={!selectedCleaner.availability}
    variant={selectedCleaner.availability ? 'primary' : 'secondary'}
    size="small"
    fullWidth={true}
    icon={UserCheck}
    iconPosition="left"
    iconSize={22}
    onPress={() => onAssignCleaner(selectedCleaner.id.toString())}
    customStyle={{
      borderRadius: 16, 
      paddingVertical: 16, 
      ...(selectedCleaner.availability && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8, 
      }),
    }}
  />
</View>
        </View>
      </View>
    </Modal>
  );
};

export default CleanerProfileModal;