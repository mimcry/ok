import { fetchUserDetails, updateUserProfile } from "@/api/userdetails";
import { renderMenuItem } from "@/components/displaymenuitems";
import EditProfileModal from "@/components/EditProfileModal";
import ProfileSkeleton from "@/components/ProfileSkeloton";
import { toCamelCase } from "@/constants/camel";
import { countries } from "@/constants/countries";
import { MenuItemsforhosts } from "@/constants/menuItems";
import { useAuthStore } from "@/context/userAuthStore";
import CustomAlert from "@/hooks/customAlert";
import { schema } from "@/schema/profileSchema";
import { DateFormatter } from "@/utils/DateUtils";
import {
  compressImageIfNeeded,
  pickImageFromLibrary,
} from "@/utils/imageUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import {
  Calendar,
  LogOut,
  Mail,
  MapPin,
  Phone,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";

// Type definitions
interface UserInfo {
  phone: any;
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  memberSince: string;
  completedJobs: number;
  rating: number;
  profileImage: string;
  coverImage: string;
  country: string;
  date_joined: Date;
}

interface FormData {
  country: string;
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
  profileImage: string;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

const Profile: React.FC = () => {
  // Modal and loading states
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [showAlert1, setShowAlert1] = useState<boolean>(false);
  const [showAlert2, setShowAlert2] = useState<boolean>(false);

  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);

  // Auth store and user data - IMPORTANT: Add isHydrated
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Component state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    phone: "",
    memberSince: "",
    completedJobs: 0,
    rating: 0,
    profileImage: "",
    coverImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    country: "",
    date_joined: new Date(),
  });

  // Utilities
  const toast = useToast();
  const menuItems = MenuItemsforhosts();

  // Update profile image when user store changes
  useEffect(() => {
    if (user?.profile_picture && user.profile_picture !== userInfo.profileImage) {
      setUserInfo(prevInfo => ({
        ...prevInfo,
        profileImage: user.profile_picture
      }));
    }
  }, [user?.profile_picture]);

  // FIXED: Load user details only after auth state is hydrated
  useEffect(() => {
    let isMounted = true;

    async function loadUserDetails() {
      // CRITICAL: Wait for auth state to be hydrated
      if (!isHydrated) {
        console.log("Auth not hydrated yet, waiting...");
        return;
      }

      if (!user || !token) {
        console.log("No user or token after hydration");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching user details for:", user?.id, "Role:", user?.role);
        
        const result = await fetchUserDetails(user?.id, user?.role);
        
        if (!isMounted) return;

        if (result.success && result.user) {
          const userData = result.user;
          console.log("User details fetched successfully:", userData);
          
          // Set country from user data
          let userCountry = userData.country || "US";
          const foundCountry = countries.find(c => c.code === userCountry);
          
          if (foundCountry) {
            setSelectedCountry(foundCountry);
          }

          // Handle profile image URL
          let profileImageUrl = userData.profile_picture;

          // Add base URL if needed
          if (profileImageUrl && !profileImageUrl.startsWith('http')) {
            profileImageUrl = `https://your-api-base-url.com${profileImageUrl}`;
          }
          
          // Add cache-busting parameter
          if (profileImageUrl) {
            profileImageUrl = `${profileImageUrl}${profileImageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
          } else {
            profileImageUrl = "";
          }

          // Update auth store
          const updatedUser = {
            ...userData,
            profile_picture: profileImageUrl
          };
          setAuth(token, updatedUser);

          // Update local state
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            name: userData.name || "",
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            zipCode: userData.zipCode || "",
            email: userData.email || "",
            phone: userData.phone || "",
            country: userData.country || "",
            profileImage: profileImageUrl,
            memberSince: userData.date_joined
          }));
        } else {
          console.error("Failed to fetch user details:", result.error);
          setError(result.error || "Unable to fetch user data");
          toast.show(result.error || "Failed to load user profile", {
            type: "error",
          });
        }
      } catch (err) {
        console.error("Error in loadUserDetails:", err);
        if (isMounted) {
          setError("An unexpected error occurred");
          toast.show("Failed to load user profile", { type: "error" });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUserDetails();

    return () => {
      isMounted = false;
    };
  }, [user?.id, token, isHydrated]); // IMPORTANT: Add isHydrated as dependency

  // Form setup
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      email: "",
      phone: "",
      profileImage: "",
      country: "",
    },
  });

  // Update form values when userInfo changes
  useEffect(() => {
    if (!loading && userInfo) {
      reset({
        name: userInfo.name,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        address: userInfo.address,
        city: userInfo.city,
        state: userInfo.state,
        zipCode: userInfo.zipCode,
        email: userInfo.email,
        phone: userInfo.phone,
        profileImage: userInfo.profileImage,
        country: userInfo.country,
      }, {
        keepErrors: false,
        keepDirty: false
      });
    }
  }, [loading, reset, userInfo]);

  // Format address for display
  const formatFullAddress = (): string => {
    if (!userInfo.address) return "Add your Location";

    let formattedAddress = userInfo.address;

    if (userInfo.city) {
      formattedAddress += `, ${userInfo.city}`;
    }

    if (userInfo.state) {
      formattedAddress += `, ${userInfo.state}`;
      if (userInfo.zipCode) {
        formattedAddress += ` ${userInfo.zipCode}`;
      }
    }

    return formattedAddress;
  };

  // Handle image selection
  const handleImagePick = async (): Promise<string | null> => {
    try {
      setIsUploadingImage(true);

      const imageResult = await pickImageFromLibrary({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!imageResult.success) {
        if (imageResult.error === "Permission denied") {
          setShowAlert1(true);
        }
        return null;
      }

      if (imageResult.canceled) {
        return null;
      }

      // Compress image if needed
      const compressedUri = await compressImageIfNeeded(imageResult.uri);

      // Update local state immediately
      setUserInfo((prev) => ({
        ...prev,
        profileImage: compressedUri,
      }));

      return compressedUri;
    } catch (error: any) {
      console.error("Error picking image:", error);
      toast.show("Error selecting image: " + error.message, {
        type: "error",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Prepare API data
      const updateData: any = {
        
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country
      };

      console.log("updated profile data:", updateData);

      // Include image if it's a new local image
      if (data.profileImage && !data.profileImage.startsWith('http')) {
        updateData.profile_picture = {
          uri: data.profileImage,
          type: "image/jpeg",
          name: "profile-image.jpg",
        };
      }

      const result = await updateUserProfile(updateData);
      console.log("Profile update response:", result);

      if (result.success) {
        const updatedProfileImage = result.user?.profile_picture || data.profileImage;
        
        // Update local state
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
          zipCode: data.zipCode,
          country: data.country,
          profileImage: updatedProfileImage,
        }));

        // Update auth store
        if (user && token) {
          const updatedUser = {
            ...user,
            first_name: data.firstName,
            last_name: data.lastName,
            address: data.address,
            city: data.city,
            state: data.state,
            phone: data.phone,
            country: data.country,
            profile_picture: updatedProfileImage,
          };
          setAuth(token, updatedUser);
        }

        toast.show("Profile Updated Successfully", {
          type: "success",
          animationType: "slide-in",
        });

        setIsEditModalVisible(false);
      } else {
        toast.show(result.error || "Failed to update profile", {
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.show("An error occurred while updating profile", {
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit profile modal
  const handleEditProfilePress = () => {
    reset({
     
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      address: userInfo.address,
      city: userInfo.city,
      state: userInfo.state,
      zipCode: userInfo.zipCode,
      email: userInfo.email,
      phone: userInfo.phone,
      profileImage: userInfo.profileImage,
      country: userInfo.country,
    }, {
      keepErrors: false,
      keepDirty: false
    });

    // Set selected country
    if (userInfo.country) {
      const country = countries.find(c => c.code === userInfo.country);
      if (country) {
        setSelectedCountry(country);
      }
    }

    setIsEditModalVisible(true);
  };

  // IMPORTANT: Show loading while auth is rehydrating OR while fetching user details
  if (!isHydrated || loading) {
    return <ProfileSkeleton />;
  }

  // If no user after hydration, redirect to login
  if (isHydrated && (!user || !token)) {
    router.replace("/(auth)/signin");
    return <ProfileSkeleton />;
  }

  console.log("user profile:", userInfo);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 ">
        {/* Cover Image */}
        <View className="h-48 w-full">
          <Image
            source={{ uri: userInfo.coverImage }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40" />
        </View>

        {/* Profile Section */}
        <View className="px-5 -mt-20">
          <View className="bg-white rounded-2xl shadow-md p-5">
            <View className="items-center">
              {/* Profile Image */}
              <View className="h-28 w-28 rounded-full border-4 border-white overflow-hidden -mt-20 shadow-lg">
                {isUploadingImage ? (
                  <View className="h-full w-full items-center justify-center bg-gray-200">
                    <ActivityIndicator color="#4925E9" size="large" />
                  </View>
                ) : (
                  <Image
                    source={
                      userInfo?.profileImage && userInfo.profileImage.trim() !== "" 
                        ? { uri: userInfo.profileImage } 
                        : require("@/assets/images/profile.png")
                    }
                    style={{ width: "100%", height: "100%", backgroundColor: "#8fb7f7" }}
                    resizeMode="cover"
                    testID="profile-image"
                  />
                )}
              </View>

              {/* User Name */}
              <Text className="text-2xl font-bold mt-3">
                {toCamelCase(`${userInfo.firstName} ${userInfo.lastName}`)}
              </Text>

              {/* Location */}
              <View className="flex-row items-center mt-1">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-gray-500 ml-1">
                  {formatFullAddress()}
                </Text>
              </View>
              
              {/* Country */}
              {selectedCountry && (
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-500">
                    {selectedCountry.flag} {selectedCountry.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats Section */}
            <View className="flex-row justify-between mt-6 px-3 py-4 bg-gray-50 rounded-xl">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">
                  {userInfo.completedJobs}
                </Text>
                <Text className="text-gray-500 text-sm">Jobs Completed</Text>
              </View>
              <View className="h-full w-px bg-gray-200" />
              <View className="items-center flex-1">
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold text-primary">
                    {userInfo.rating}
                  </Text>
                  <Text className="text-yellow-500 ml-1 text-lg">★</Text>
                </View>
                <Text className="text-gray-500 text-sm">Rating</Text>
              </View>
              <View className="h-full w-px bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">2yr</Text>
                <Text className="text-gray-500 text-sm">Experience</Text>
              </View>
            </View>

            {/* Contact Information */}
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Contact Information
              </Text>
              <View className="space-y-3 gap-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                    <Mail size={16} color="#4925E9" />
                  </View>
                  <Text className="text-gray-700 ml-3">{userInfo.email}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                    <Phone size={16} color="#4925E9" />
                  </View>
                  {userInfo.phone ? (
                    <Text className="text-gray-700 ml-3">{userInfo.phone}</Text>
                  ) : (
                    <Text className="text-gray-400 ml-3">Add your phone</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                    <Calendar size={16} color="#4925E9" />
                  </View>
                  <Text className="text-gray-700 ml-3">
                     Member since <DateFormatter date={userInfo.memberSince} format="short" />
                  </Text>
                </View>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              className="bg-primary rounded-xl px-5 py-3.5 mt-6"
              activeOpacity={0.8}
              onPress={handleEditProfilePress}
            >
              <Text className="text-white text-center font-semibold text-base">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Menu Section */}
        <View className="px-5 mt-6 mb-40">
          <View className="bg-white rounded-2xl shadow-md p-5">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Account
            </Text>
            <View>{menuItems.map(renderMenuItem)}</View>

            {/* Sign Out Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 px-1 mt-4"
              activeOpacity={0.7}
              onPress={() => {
                logout();
                router.replace("/(auth)/signin");
              }}
            >
              <LogOut size={20} color="#F87171" />
              <Text className="text-red-400 font-medium text-base ml-2">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleUpdateProfile}
        userInfo={userInfo}
        isLoading={isLoading}
        onImagePick={handleImagePick}
        isUploadingImage={isUploadingImage}
      />

      {/* Camera Permission Alert */}
      <CustomAlert
        visible={showAlert1}
        title="Camera Permission Required"
        message="To upload a profile picture, please allow access to your photos in your device settings."
        confirmText="Open Settings"
        cancelText="Cancel"
        onConfirm={() => {
          setShowAlert1(false);
          // Logic to open settings would go here
        }}
        onCancel={() => setShowAlert1(false)}
      />

      {/* Generic Error Alert */}
      <CustomAlert
        visible={showAlert2}
        title="Error"
        message="Something went wrong. Please try again later."
        confirmText="OK"
        onConfirm={() => setShowAlert2(false)}
        onCancel={() => ""}
        hideCancel={true}
      />
    </SafeAreaView>
  );
};

export default Profile;