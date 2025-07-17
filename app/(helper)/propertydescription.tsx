import { deleteProperty as deletePropertyAPI, fetchPropertyById, updateProperty as updatePropertyAPI } from "@/api/propertyapi";
import { getUserDetail } from "@/api/userdetails";
import { EditProperty } from '@/components/EditProperty';
import CustomAlert from '@/hooks/customAlert';
import { useAppToast } from '@/hooks/toastNotification';
import useChatStore from "@/store/chatStore";
import usePropertyStore from '@/store/jobStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, DollarSign, Edit, ExternalLink, MapPin, MessageCircleMore, Phone, Star, Trash2, Users } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Linking, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";


interface PropertyImage {
  image: string;
}

interface Cleaner {
  full_name: string;
  profile_picture: string | undefined;
  name: string;
  image?: string;
  rating?: string;
  jobs?: string;
  cleaner_email?: string;
  cleaner_id?: string;
}

interface Property {
  main_image: string | undefined;
  id: string;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  description?: string;
  instruction?: string;
  airbnb_link?: string;
  property_type?: string;
  bedrooms?: string;
  bathrooms?: string;
  area?: string;
  base_price: string;
  images: PropertyImage[];
  cleaner?: Cleaner;
  cleaner_email?: string;
  cleaner_id?: string;
  zipCode: string;
}

interface UpdatedProperty {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description?: string;
  instruction?: string;
  airbnblink?: string;
  bedrooms?: number;
  bathrooms?: number;
  type?: string;
  area?: number;
  basePrice?: number;
  images: string[];
}

export default function PropertyDetailsScreen() {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [showAssignAlert, setShowAssignAlert] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [role, setRole] = useState<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [detailedUser, setDetailedUser] = useState<UserDetail>({} as UserDetail);

  const toast = useAppToast();

  // Get property from store
  const property = usePropertyStore((state) => state.selectedProperty);
  console.log("selected Property:", property);

  // Check if cleaner is assigned
  const hasCleanerAssigned = property?.cleaner || property?.cleaner_email || property?.cleaner_id;

  // Handle case where no property is selected
  useEffect(() => {
    if (!property || !property.id) {
      toast.error("No property selected");
      router.back();
    }
    fetchUserDetail(property?.cleaner_id)
  }, [property]);
const fetchUserDetail = async (userId: string): Promise<void> => {
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
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('user_role');
        if (storedRole !== null) {
          setRole(storedRole);
          console.log('User role:', storedRole);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };

    getUserRole();
  }, []);

  const handlePrevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);
      setImageError(false);
    }
  };

  const handleNextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
      setImageError(false);
    }
  };

  const handleLongPressAddress = () => {
    if (property) {
      Clipboard.setStringAsync(`${property.address}, ${property.city}, ${property.zip_code}`);
      toast.success("Address was copied to clipboard!");
    }
  };

  const handleImageError = () => {
    console.log("Image failed to load");
    setImageError(true);
  };

  const handleEditProperty = () => {
    setModalVisible(true);
  };

  const handleSaveProperty = async (updatedProperty: UpdatedProperty) => {
    setIsSubmitting(true);
    try {
      if (!property?.id) {
        toast.error("Property ID not found");
        return;
      }

      const propertyData = {
        name: updatedProperty.name,
        address: updatedProperty.address,
        city: updatedProperty.city,
        state: updatedProperty.state,
        zipCode: updatedProperty.zipCode,
        description: updatedProperty.description,
        instruction: updatedProperty.instruction,
        airbnblink: updatedProperty.airbnblink,
        bedrooms: updatedProperty.bedrooms,
        bathrooms: updatedProperty.bathrooms,
        type: updatedProperty.type,
        area: updatedProperty.area,
        basePrice: updatedProperty.basePrice,
      };

      const existingImages = property.images ?
        property.images.map(img =>
          typeof img === 'string' ? img :
            typeof img === 'object' && img.image ? img.image :
              String(img)
        ).filter(img => img && img !== 'undefined' && img !== 'null') : [];

      const updatedImages = (updatedProperty.images || []).filter(img =>
        img && typeof img === 'string' && img.trim() !== '' &&
        img !== 'undefined' && img !== 'null'
      );

      const newImageUris = updatedImages.filter(img =>
        !existingImages.includes(img)
      );

      const response = await updatePropertyAPI(property.id, propertyData, newImageUris);

      if (response.success) {
        const updatedPropertyResponse = await fetchPropertyById(property.id);
        setModalVisible(false);
        toast.success("Property updated successfully");
      } else {
        toast.error(response.error || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = () => {
    setShowDeleteAlert(true);
  };

  const confirmDeleteProperty = async () => {
    if (property && property.id) {
      setLoading(true);
      try {
        const response = await deletePropertyAPI(property.id);
        if (response.success) {
          toast.success("Property deleted successfully");
          router.back();
        } else {
          toast.error(response.error || "Failed to delete property");
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error("Failed to delete property");
      } finally {
        setLoading(false);
        setShowDeleteAlert(false);
      }
    }
  };

  const handleAssignCleaner = () => {
    if (!property?.id) return;

    if (hasCleanerAssigned) {
      setShowAssignAlert(true);
    } else {
      router.push({
        pathname: "/(helper)/assigncleaner",
        params: { propertyId: property.id, propertyName: property.name }
      });
    }
  };

  const handleReassignCleaner = () => {
    if (property?.id) {
      setShowAssignAlert(false);
      router.push({
        pathname: "/(helper)/assigncleaner",
        params: { propertyId: property.id, propertyName: property.name }
      });
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
   const setSelectedUser = useChatStore((state) => state.setSelectedUser);
    const handleStartChat = (): void => {
      setSelectedUser({
        id: property.connection_id,
        profile_picture: property?.property_detail?.cleaner_profile_picture,
        username: `${detailedUser.first_name} ${detailedUser.last_name}`,
      });
      router.push("/(helper)/chatroom");
    };
  const handleOpenAirbnbLink = () => {
    if (property?.airbnb_link) {
      Linking.openURL(property.airbnb_link);
    } else {
      toast.error("No Airbnb link available");
    }
  };

  const FallbackImage = () => (
    <View className="w-full h-full bg-gray-200 items-center justify-center">
      <Text className="text-gray-500">Image not available</Text>
    </View>
  );

  if (!property) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600">Loading property details...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className=" bg-white">
        <StatusBar
          hidden={false}
          translucent={true}
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Back Button */}
        <View className="absolute top-8    z-10">
          <TouchableOpacity
            className="absolute top-12 left-4 z-50 bg-black/50 p-3 rounded-full"
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {/* Image Section */}
          <View className="relative h-80 z-5">
            {property.images && property.images.length > 0 ? (
              imageError ? (
                <FallbackImage />
              ) : (
                <Image
                  source={{ uri: property.images[currentImageIndex].image }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={handleImageError}
                />
              )
            ) : (
              <Image
                source={{ uri: property.main_image }}
                className="w-full h-full"
                resizeMode="cover"
                onError={handleImageError}
              />
            )}

            {/* Image Navigation */}
            {property.images && property.images.length > 1 && (
              <View className="absolute inset-0 flex-row justify-between items-center px-4">
                <TouchableOpacity
                  className="bg-black/50 rounded-full p-3"
                  onPress={handlePrevImage}
                >
                  <ChevronLeft size={14} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-black/50 rounded-full p-3"
                  onPress={handleNextImage}
                >
                  <ChevronRight size={14} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {/* Image Dots */}
            {property.images && property.images.length > 1 && (
              <View className="absolute bottom-6 w-full flex-row justify-center">
                {property.images.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 w-2 rounded-full mx-1 ${currentImageIndex === index ? 'bg-white' : 'bg-white/40'
                      }`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Content */}
          <View className="p-5">
            {/* Property Name and Price */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{property.name}</Text>
                <TouchableOpacity
                  onLongPress={handleLongPressAddress}
                  className="flex-row items-center mt-1"
                >
                  <MapPin size={16} color="#666" />
                  <Text className="text-gray-600 ml-1 text-sm">
                    {property.address}, {property.city}, {property.zip_code}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="items-end">
                <View className="flex-row items-center">
                  <DollarSign size={18} color="#4D9043" />
                  <Text className="text-xl font-bold text-green-700">{property.base_price} </Text>
                </View>
                <Text className="text-xs bg-blue-50 text-primary p-1 px-2 rounded-full"> {property.property_type}</Text>
              </View>
            </View>

            {/* Property Stats */}
            <View className=" p-4 rounded-md border border-gray-200 mb-5">
              <View className="flex-row justify-between mx-4">

                <View className="items-center">

                  <Text className="font-medium text-lg">{property.bedrooms || "0"}</Text>
                  <Text className="text-xs text-gray-500 mt-1">Bedrooms</Text>

                </View>
                <View className="items-center">
                  <Text className="font-medium text-lg">{property.bathrooms || "0"}</Text>
                  <Text className="text-xs text-gray-500 mt-1">Bathrooms</Text>

                </View>
                <View className="items-center">
                  <Text className="font-medium text-lg">{property.area || "0"} </Text>
                  <Text className="text-xs text-gray-500 mt-1">Sq Ft.</Text>

                </View>
              </View>
            </View>

            {/* Description */}
            {property.description && property.description !== "null" && (
              <View className="">
                <Text className="text-md font-semibold mb-2">Description</Text>
                <Text className="text-gray-700 border border-gray-200 rounded-md p-2">{property.description}</Text>
              </View>
            )}

            {/* Instructions */}
            {property.instruction && property.instruction !== "null" && (
              <View className="my-5">
                <Text className="text-md font-semibold mb-2">Cleaning Instructions</Text>

                <Text className="text-gray-700  border border-gray-200 rounded-md p-2">{property.instruction}</Text>

              </View>
            )}

            {/* Airbnb Link */}
            {property.airbnb_link && property.airbnb_link !== "null" && (
              <TouchableOpacity
                className="bg-blue-50 p-3 rounded-md mb-5"
                onPress={handleOpenAirbnbLink}
              >
                <View className="flex-row items-center">
                  <ExternalLink size={18} color="#3B82F6" />
                  <Text className="text-primary ml-2">Airbnb is connected to this property</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Cleaner Info */}
            {hasCleanerAssigned ? (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-2">Assigned Cleaner</Text>
                <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Image
                        source={
                          property?.property_detail?.cleaner_profile_picture
                            ? { uri: property?.property_detail?.cleaner_profile_picture }
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
              
              </View>
            ) : (
              null
            )}

            {/* Action Buttons */}
            {role !== "cleaner" && (
              <View className="space-y-3 ">
                <View className="flex-row space-x-3 gap-2">
                  <TouchableOpacity
                    className="bg-primary py-3 px-4 mb-2 rounded-lg flex-1 flex-row items-center justify-center"
                    onPress={handleEditProperty}
                  >
                    <Edit size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-600 py-3 px-4 mb-2 rounded-lg flex-row items-center justify-center"
                    onPress={handleDeleteProperty}
                  >
                    <Trash2 size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className={`py-3 px-4 rounded-lg flex-row items-center justify-center ${hasCleanerAssigned ? 'bg-orange-600' : 'bg-green-600'
                    }`}
                  onPress={handleAssignCleaner}
                >
                  <Users size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {hasCleanerAssigned ? 'Reassign Cleaner' : 'Assign Cleaner'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Alerts */}
        <CustomAlert
          visible={showDeleteAlert}
          type="danger"
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone."
          onCancel={() => setShowDeleteAlert(false)}
          onConfirm={confirmDeleteProperty}
        />

        <CustomAlert
          visible={showAssignAlert}
          type="warning"
          title="Reassign Cleaner"
          message="This property already has a cleaner assigned. Do you want to reassign to a different cleaner?"
          onCancel={() => setShowAssignAlert(false)}
          onConfirm={handleReassignCleaner}
        />

        <EditProperty
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveProperty}
          property={property}
          isLoading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}