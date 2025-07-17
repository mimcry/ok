import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  X,
  Home,
  MapPin,
  Check,
  Calendar,
  Clock,
  ChevronLeft,
  Mail,
  Phone,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { confirmConnection } from '@/api/confirmConnection';
import { connectionRequests } from '@/api/connectionRequests';
import { DateFormatter, DateUtils } from '@/utils/DateUtils';
import { toCamelCase } from '@/constants/camel';
import { useAuthStore } from '@/context/userAuthStore';
import { useAppToast } from '@/hooks/toastNotification';
import CustomAlert from '@/hooks/customAlert';
export type ConnectionRequest = {
  cleaner_city: string;
  cleaner_country: string;
  id: number;
  cleaner_full_name: string;
  host_full_name: string;
  initiator_full_name: string;
  initiator_id: number;
  status: string;
  created_at: string;
  host_city?: string;
  host_country?: string;
  host_profile_picture?: string;
  cleaner_profile_picture?: string;
  host_email?: string;
  cleaner_email?: string;
  host_phone?: string;
  cleaner_phone?: string;
  avatar?: string;
  address?: string;
  email?: string;
  phone?: string;
  memberSince?: string;
}
interface HostRequestsPageProps {
  notificationCandidateId?: number | null;
  shouldOpenModal?: boolean;
  onModalHandled?: () => void;
}


const HostRequestsPage: React.FC<HostRequestsPageProps> = ({
  notificationCandidateId,
  shouldOpenModal,
  onModalHandled
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState<boolean>(false);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState(false)
  const { user } = useAuthStore();
  const userRole = user?.role
  const toast = useAppToast()
  const [selectedID, setSelectedID] = useState<number>()
  console.log("user role:", userRole)
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const result = await connectionRequests();
        console.log("connection requestssss", result);

        if (result.success && Array.isArray(result.data)) {
          // Enhance the API data with some default values for UI display
          const enhancedRequests = result.data.map(request => ({
            ...request,
            avatar: request.host_profile_picture,
            address: `${request.host_city || ''}, ${request.host_country || ''}`,
            email: request.host_email || request.cleaner_email ||
              "Not provided",
            phone: request.host_phone || request.cleaner_phone || 'Not provided',
            memberSince: DateUtils.formatToDateTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1))),
          }));
          setRequests(enhancedRequests);
        } else {
          console.error('Unexpected response format:', result);
          toast.error("Received unexpected data format from server")

        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error("Failed to fetch connection requests")

      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const openRequestDetails = (request: ConnectionRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };
  // Add this useEffect after the existing fetchRequests useEffect
  useEffect(() => {
    if (shouldOpenModal && notificationCandidateId && requests.length > 0) {
      // Find the request with the matching initiator ID
      const matchingRequest = requests.find(request =>
        request.initiator_id === notificationCandidateId
      );

      if (matchingRequest) {
        // Open modal with the matching request
        openRequestDetails(matchingRequest);
      } else {
        // Show toast if request doesn't exist (already accepted/rejected)
        toast.warning("This request has already been accepted or is no longer available.");
      }

      // Call the callback to reset the notification handling state
      onModalHandled?.();
    }
  }, [shouldOpenModal, notificationCandidateId, requests]);
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

      closeModal();
    } catch (error) {
      toast.error("An unexpected error occurred while accepting the request.")

    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setShowAlert(true)
    setSelectedID(requestId)

  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : requests.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Text className="text-base text-gray-500">No connection requests available</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {requests.map((request) => (
              <View
                key={request.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
              >
                <View className="flex-row items-center p-4 border-b border-gray-100">
                  <Image
                    source={
                      userRole === 'host'
                        ? request.cleaner_profile_picture
                          ? { uri: request.cleaner_profile_picture }
                          : request.avatar
                            ? { uri: request.avatar }
                            : require('@/assets/images/profile.png')
                        : request.host_profile_picture
                          ? { uri: request.host_profile_picture }
                          : request.avatar
                            ? { uri: request.avatar }
                            : require('@/assets/images/profile.png')
                    }
                    className="w-12 h-12 rounded-full border-2 border-gray-100"
                  />

                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-gray-800">
                      {toCamelCase(userRole === 'host' ? request.cleaner_full_name : request.host_full_name)}
                    </Text>
                    {(userRole === 'host'
                      ? request.cleaner_city && request.cleaner_country
                      : request.host_city && request.host_country) && (
                        <View className="flex-row items-center mt-1">
                          <MapPin size={14} color="#6B7280" />
                          <Text className="ml-1 text-sm text-gray-500">
                            {userRole === 'host'
                              ? `${request.cleaner_city}, ${request.cleaner_country}`
                              : `${request.host_city}, ${request.host_country}`}
                          </Text>
                        </View>
                      )}

                    <View className="flex-row items-center mt-1">
                      <Calendar size={14} color="#6B7280" />
                      <Text className="ml-1 text-sm text-gray-500">
                        <DateFormatter date={request.created_at} format="short" />
                      </Text>
                    </View>
                  </View>
                  <View className="px-2 py-1 bg-yellow-100 rounded-full">
                    <Text className="text-xs text-yellow-800 font-medium">{request.status}</Text>
                  </View>
                </View>

                <View className="flex-row p-4">
                  <TouchableOpacity
                    onPress={() => handleRejectRequest(request.id)}
                    className="flex-1 py-2 mr-2 bg-gray-100 rounded-lg items-center justify-center"
                  >
                    <Text className="text-gray-700 font-medium">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openRequestDetails(request)}
                    className="flex-1 py-2 ml-2 bg-indigo-600 rounded-lg items-center justify-center"
                  >
                    <Text className="text-white font-medium">Proceed</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal for request details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        {selectedRequest && (
          <BlurView intensity={20} tint="dark" className="flex-1">
            <View className="bg-white mt-12 flex-1 h-[60%]" style={{ height: '60%' }}>
              <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <TouchableOpacity onPress={closeModal} className="p-2">
                  <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">Request Details</Text>
                <View className="w-10"></View>
              </View>

              <ScrollView className="flex-1">
                {/* Host Profile Section */}
                <View className="p-4 border-b border-gray-100">
                  <View className="flex-row bg-gray-50 rounded-2xl p-4">
                    <Image
                      source={
                        userRole === 'host'
                          ? selectedRequest.cleaner_profile_picture
                            ? { uri: selectedRequest.cleaner_profile_picture }
                            : selectedRequest.avatar
                              ? { uri: selectedRequest.avatar }
                              : require('@/assets/images/profile.png')
                          : selectedRequest.host_profile_picture
                            ? { uri: selectedRequest.host_profile_picture }
                            : selectedRequest.avatar
                              ? { uri: selectedRequest.avatar }
                              : require('@/assets/images/profile.png')
                      }
                      className="w-16 h-16 rounded-full border-2 border-white"
                    />

                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-semibold text-gray-900">
                        {userRole === 'host' ? selectedRequest.cleaner_full_name : selectedRequest.host_full_name}
                      </Text>
                      {(userRole === 'host'
                        ? selectedRequest.cleaner_city && selectedRequest.cleaner_country
                        : selectedRequest.host_city && selectedRequest.host_country) && (
                          <View className="flex-row items-center mt-1">
                            <MapPin size={14} color="#6B7280" />
                            <Text className="ml-1 text-sm text-gray-500">
                              {userRole === 'host'
                                ? `${selectedRequest.cleaner_city}, ${selectedRequest.cleaner_country}`
                                : `${selectedRequest.host_city}, ${selectedRequest.host_country}`}
                            </Text>
                          </View>
                        )}

                      <Text className="text-sm text-gray-500 mt-1">
                        Member since {selectedRequest.memberSince}
                      </Text>
                      <View className="mt-2">
                        <Text className="text-xs text-gray-500">Connection requested</Text>
                        <Text className="text-sm text-gray-700 font-medium">
                          {DateUtils.formatToDateTime(selectedRequest.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Contact Details */}
                <View className="py-4 border-b border-gray-100 px-4">
                  <Text className="text-base font-semibold text-gray-900 mb-3">Contact Information</Text>

                  <View className="flex-row items-center mb-3">
                    <Mail size={16} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-700">
                      {userRole === 'host' ? selectedRequest.cleaner_email : selectedRequest.host_email}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Phone size={16} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-700">
                      {userRole === 'host' ? selectedRequest.cleaner_phone : selectedRequest.host_phone}
                    </Text>
                  </View>
                </View>

                {/* Request Details Section */}
                <View className="p-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">Request Details</Text>
                  <View className="bg-gray-50 rounded-2xl p-4">
                    <View className="mb-4">
                      <Text className="text-sm text-gray-500 mb-1">Date</Text>
                      <View className="flex-row items-center">
                        <Calendar size={16} color="#4B5563" />
                        <Text className="ml-2 text-base font-medium text-gray-700">
                          <DateFormatter date={selectedRequest.created_at} format="display" />
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm text-gray-500 mb-1">Time</Text>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#4B5563" />
                        <Text className="ml-2 text-base font-medium text-gray-700">
                          {DateUtils.formatToTime(selectedRequest.created_at)}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm text-gray-500 mb-1">Status</Text>
                      <View className="flex-row items-center">
                        <View className="px-2 py-1 bg-yellow-100 rounded-full">
                          <Text className="text-xs text-yellow-800 font-medium">{selectedRequest.status}</Text>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text className="text-sm text-gray-500 mb-1">Initiator</Text>
                      <Text className="text-base font-medium text-gray-700">{selectedRequest.initiator_full_name}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Accept Button */}
              <View className="p-4 border-t border-gray-200">
                <TouchableOpacity
                  className="w-full flex-row items-center justify-center py-4 bg-indigo-600 rounded-xl"
                  onPress={() => handleAcceptRequest(selectedRequest.id)}
                  disabled={processingRequest}
                >
                  {processingRequest ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={20} color="#FFFFFF" />
                      <Text className="ml-2 text-white font-semibold">Accept Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        )}
      </Modal>
      <CustomAlert
        visible={showAlert}
        type="warning"
        title="Reject Request"
        message="Are you sure you want to reject this request?"
        onCancel={() => setShowAlert(false)}
        onConfirm={async () => {
          setProcessingRequest(true);
          try {
            const response = await confirmConnection(selectedID, 'reject');
            if (response.success) {
              toast.warning("Request has been rejected")

              const result = await connectionRequests();
              if (result.success && Array.isArray(result.data)) {
                setRequests(result.data);
              }
            } else {
              toast.error("Failed to reject the request.")

            }
          } catch (error) {
            toast.error("An unexpected error occurred while rejecting the request.")

          } finally {
            setProcessingRequest(false);
            setShowAlert(false)
          }

        }} />
    </View>
  );
};

export default HostRequestsPage;