import { countries } from "@/constants/countries";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Camera,
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";

// Types
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

interface UserInfo {
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string | number;
  profileImage: string;
  country: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  userInfo: UserInfo;
  isLoading?: boolean;
  onImagePick: () => Promise<string | null>;
  isUploadingImage?: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  userInfo,
  isLoading = false,
  onImagePick,
  isUploadingImage = false,
}) => {
  // State for country selection
  const [countryDropdownOpen, setCountryDropdownOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>("");
  const [filteredCountries, setFilteredCountries] = useState<CountryOption[]>(countries);

  // Validation schema
  const schema = yup.object().shape({
  
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zipCode: yup.string().required("Zip code is required"),
    email: yup.string().email("Email is invalid").required("Email is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^[0-9+\s]{10,15}$/, "Phone number must be valid"),
    profileImage: yup.string(),
    country: yup.string().required("Country is required"),
  });

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
  
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

  // Filter countries based on search query
  useEffect(() => {
    if (countrySearchQuery.trim() === "") {
      setFilteredCountries(countries);
    } else {
      const query = countrySearchQuery.toLowerCase();
      const filtered = countries.filter(
        country => country.name.toLowerCase().includes(query)
      );
      setFilteredCountries(filtered);
    }
  }, [countrySearchQuery]);

  // Reset form when modal opens or userInfo changes
  useEffect(() => {
    if (visible && userInfo) {
      reset({

        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        address: userInfo.address,
        city: userInfo.city,
        state: userInfo.state,
        zipCode: userInfo.zipCode,
        email: userInfo.email,
        phone: userInfo.phone.toString(),
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

      // Reset search states
      setCountrySearchQuery("");
      setFilteredCountries(countries);
      setCountryDropdownOpen(false);
    }
  }, [visible, userInfo, reset]);

  // Handle country selection
  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    setValue("country", country.code);
    setCountryDropdownOpen(false);
  };

  // Handle image picking
  const handleImagePick = async () => {
    try {
      const imageUri = await onImagePick();
      if (imageUri) {
        setValue("profileImage", imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setCountryDropdownOpen(false);
    onClose();
  };

  // Render country item
  const renderCountryItem = ({ item }: { item: CountryOption }) => {
    return (
      <TouchableOpacity
        className="flex-row items-center p-3 border-b border-gray-100"
        onPress={() => handleSelectCountry(item)}
      >
        <Text className="text-lg mr-2">{item.flag}</Text>
        <Text className="text-base text-gray-800">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity
              accessibilityLabel="close-button"
              testID="close-button"
              onPress={handleClose}
              className="p-2"
            >
              <X size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Edit Profile
            </Text>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="p-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#4925E9" />
              ) : (
                <Check size={24} color="#4925E9" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4">
            {/* Profile Picture Section */}
            <View className="items-center mt-6">
              <View className="relative">
                <View className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {isUploadingImage ? (
                    <View className="h-full w-full items-center justify-center bg-gray-200">
                      <ActivityIndicator color="#4925E9" size="large" />
                    </View>
                  ) : (
                    <Image
                      source={
                        watch("profileImage") && watch("profileImage").trim() !== ""
                          ? { uri: watch("profileImage") }
                          : require("@/assets/images/profile.png")
                      }
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  )}
                </View>
                <TouchableOpacity
                  accessibilityLabel="camera-button"
                  testID="camera-button"
                  className="absolute bottom-0 right-0 bg-blue-600 h-8 w-8 rounded-full items-center justify-center border-2 border-white"
                  onPress={handleImagePick}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Camera size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View className="mt-6 space-y-4 gap-3">
              {/* Name Fields */}
              <View className="flex-row space-x-3 gap-2">
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 font-medium">
                    First Name
                  </Text>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className={`border ${errors.firstName
                          ? "border-red-500"
                          : "border-gray-300"
                          } rounded-lg px-4 py-3 text-gray-800`}
                        placeholder="First name"
                      />
                    )}
                  />
                  {errors.firstName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 font-medium">
                    Last Name
                  </Text>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className={`border ${errors.lastName
                          ? "border-red-500"
                          : "border-gray-300"
                          } rounded-lg px-4 py-3 text-gray-800`}
                        placeholder="Last name"
                      />
                    )}
                  />
                  {errors.lastName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </Text>
                  )}
                </View>
              </View>

              {/* Country Selector */}
              <View>
                <Text className="text-gray-700 mb-1 font-medium">
                  Country
                </Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                  onPress={() => setCountryDropdownOpen(!countryDropdownOpen)}
                >
                  <View className="flex-row items-center">
                    {selectedCountry ? (
                      <>
                        <Text className="text-lg mr-2">
                          {selectedCountry.flag}
                        </Text>
                        <Text className="text-gray-800">
                          {selectedCountry.name}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-gray-400">Select your country</Text>
                    )}
                  </View>
                  <ChevronDown size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Country dropdown */}
                {countryDropdownOpen && (
                  <View className="border border-gray-300 mt-1 rounded-lg bg-white shadow-md z-10 max-h-72">
                    <View className="p-2 border-b border-gray-200">
                      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                        <Search size={18} color="#9CA3AF" />
                        <TextInput
                          className="flex-1 ml-2 text-gray-800"
                          placeholder="Search countries..."
                          value={countrySearchQuery}
                          onChangeText={setCountrySearchQuery}
                        />
                      </View>
                    </View>
                    <FlatList
                      data={filteredCountries}
                      renderItem={renderCountryItem}
                      keyExtractor={(item) => item.code}
                      maxToRenderPerBatch={10}
                      initialNumToRender={10}
                      className="max-h-60"
                    />
                  </View>
                )}
                {errors.country && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.country.message}
                  </Text>
                )}
              </View>

              {/* Address Input */}
              <View>
                <Text className="text-gray-600 mb-1 ml-1">
                  Street Address
                </Text>
                <View className="relative">
                  <View className="flex-row items-center bg-gray-100 rounded-xl">
                    <Controller
                      control={control}
                      name="address"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="flex-1 p-4 text-gray-800"
                          value={value}
                          onChangeText={onChange}
                          placeholder="Enter your street address"
                        />
                      )}
                    />
                  </View>
                  {errors.address && (
                    <Text className="text-red-500 text-sm mt-1 ml-4">
                      {errors.address.message}
                    </Text>
                  )}
                </View>
              </View>

              {/* City, State, Zip */}
              <View className="flex-row space-x-3 gap-2">
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 font-medium">
                    City
                  </Text>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className={`border ${errors.city ? "border-red-500" : "border-gray-300"
                          } rounded-lg px-4 py-3 text-gray-800`}
                        placeholder="City"
                      />
                    )}
                  />
                  {errors.city && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 font-medium">
                    State
                  </Text>
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className={`border ${errors.state ? "border-red-500" : "border-gray-300"
                          } rounded-lg px-4 py-3 text-gray-800`}
                        placeholder="State"
                      />
                    )}
                  />
                  {errors.state && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.state.message}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 font-medium">
                    Zip Code
                  </Text>
                  <Controller
                    control={control}
                    name="zipCode"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        className={`border ${errors.zipCode
                          ? "border-red-500"
                          : "border-gray-300"
                          } rounded-lg px-4 py-3 text-gray-800`}
                        placeholder="Zip Code"
                        keyboardType="numeric"
                      />
                    )}
                  />
                  {errors.zipCode && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.zipCode.message}
                    </Text>
                  )}
                </View>
              </View>

              {/* Email (read-only) */}
              <View>
                <Text className="text-gray-700 mb-1 font-medium">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value } }) => (
                    <TextInput
                      value={value}
                      editable={false}
                      className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 text-gray-600"
                    />
                  )}
                />
              </View>

              {/* Phone */}
              <View>
                <Text className="text-gray-700 mb-1 font-medium">
                  Phone Number
                </Text>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      className={`border ${errors.phone ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-3 text-gray-800`}
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                    />
                  )}
                />
                {errors.phone && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Save button for smaller screens */}
            <TouchableOpacity
              className="bg-primary rounded-xl px-5 py-3.5 mt-8 mb-8"
              activeOpacity={0.8}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileModal;