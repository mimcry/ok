import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { X, ChevronDown } from "lucide-react-native";

interface CleanerProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    bio: string;
    experience: string;
    speciality: string;
  }) => Promise<void>;
  currentData: {
    bio: string;
    experience: string;
    speciality: string;
    speciality_display: string;
  };
  isLoading: boolean;
}

const specialtyOptions = [
  { value: "residential", label: "Residential Cleaning" },
  { value: "commercial", label: "Commercial Cleaning" },
  { value: "deep", label: "Deep Cleaning" },
  { value: "move_in_out", label: "Move-In/Move-Out Cleaning" },
  { value: "post_construction", label: "Post-Construction Cleaning" },
];

const CleanerProfileModal: React.FC<CleanerProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  currentData,
  isLoading,
}) => {
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);

  // Update local state when currentData changes
  useEffect(() => {
    if (visible) {
      setBio(currentData.bio || "");
      setExperience(currentData.experience || "");
      setSelectedSpecialty(currentData.speciality || "");
    }
  }, [visible, currentData]);

  const handleSave = async () => {
    try {
      await onSave({
        bio: bio.trim(),
        experience: experience.trim(),
        speciality: selectedSpecialty,
      });
      onClose();
    } catch (error) {
      console.error("Error saving cleaner profile:", error);
    }
  };

  const getSelectedSpecialtyLabel = () => {
    const option = specialtyOptions.find(opt => opt.value === selectedSpecialty);
    return option ? option.label : "Select Specialty";
  };

  const handleSpecialtySelect = (value: string) => {
    setSelectedSpecialty(value);
    setShowSpecialtyDropdown(false);
  };

  // Debug: Add console log
  console.log("CleanerProfileModal visible:", visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={false}
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] min-h-[60%]">
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">
                Professional Profile
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-2xl bg-gray-100"
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
              {/* Bio Section */}
              <View className="mt-6">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  Bio
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell clients about yourself and your cleaning experience..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-gray-200 rounded-xl p-4 text-gray-900 bg-gray-50 min-h-[100px]"
                  maxLength={500}
                />
                <Text className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/500
                </Text>
              </View>

              {/* Experience Section */}
              <View className="mt-6">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  Experience
                </Text>
                <TextInput
                  value={experience}
                  onChangeText={setExperience}
                  placeholder="e.g., 2 years, 5+ years, 10 years"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-xl p-4 text-gray-900 bg-gray-50"
                  maxLength={50}
                  keyboardType="numeric"
                />
                <Text className="text-xs text-gray-400 mt-1">
                  How long have you been providing cleaning services?
                </Text>
              </View>

              {/* Specialty Section */}
              <View className="mt-6 mb-8">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  Specialty
                </Text>
                <TouchableOpacity
                  onPress={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <Text className={`text-base ${!selectedSpecialty ? 'text-gray-400' : 'text-gray-900'}`}>
                    {getSelectedSpecialtyLabel()}
                  </Text>
                  <ChevronDown 
                    size={20} 
                    color="#6B7280" 
                    style={{ 
                      transform: [{ rotate: showSpecialtyDropdown ? '180deg' : '0deg' }] 
                    }} 
                  />
                </TouchableOpacity>
                {/* Dropdown Options */}
                {showSpecialtyDropdown && (
                  <View className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg">
                    {specialtyOptions.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSpecialtySelect(option.value)}
                        className={`p-4 flex-row items-center ${
                          index < specialtyOptions.length - 1 ? 'border-b border-gray-100' : ''
                        } ${selectedSpecialty === option.value ? 'bg-indigo-50' : ''}`}
                        activeOpacity={0.7}
                      >
                        <View className={`w-4 h-4 rounded-full border-2 mr-3 items-center justify-center ${
                          selectedSpecialty === option.value 
                            ? 'border-indigo-600 bg-indigo-600' 
                            : 'border-gray-300'
                        }`}>
                          {selectedSpecialty === option.value && (
                            <View className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </View>
                        <Text className={`text-base ${
                          selectedSpecialty === option.value 
                            ? 'text-indigo-600 font-medium' 
                            : 'text-gray-700'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text className="text-xs text-gray-400 mt-1">
                  Choose your main area of expertise
                </Text>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className="p-5 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isLoading}
                className={`rounded-xl py-4 items-center justify-center ${
                  isLoading ? 'bg-gray-300' : 'bg-indigo-600'
                }`}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default CleanerProfileModal;