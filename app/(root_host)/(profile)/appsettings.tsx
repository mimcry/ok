import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { 
  ArrowRight, 
  Mail, 
  Globe, 
  Cloud, 
  HardDrive,
  Check,
  X 
} from "lucide-react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useToast } from "react-native-toast-notifications";
import { useAuthStore } from "@/context/userAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UpdateEmailResult {
  success: boolean;
  msg: string;
}

interface User {
  email?: string;
  // Add other user properties as needed
}

const AppSettings: React.FC = () => {
  const user = useAuthStore((state) => state.user) as User | null;
  const toast = useToast();
  
  // State for settings
  const [isSpanish, setIsSpanish] = useState<boolean>(false);
  const [useCloudStorage, setUseCloudStorage] = useState<boolean>(true);
  
  // State for email change modal
  const [isEmailChangeModalVisible, setIsEmailChangeModalVisible] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async (): Promise<void> => {
      try {
        const language = await AsyncStorage.getItem("language");
        const storageType = await AsyncStorage.getItem("storageType");
        
        if (language) setIsSpanish(language === "es");
        if (storageType) setUseCloudStorage(storageType === "cloud");
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save language preference
  const toggleLanguage = async (value: boolean): Promise<void> => {
    setIsSpanish(value);
    try {
      await AsyncStorage.setItem("language", value ? "es" : "en");
      toast.show(value ? "Idioma cambiado a Español" : "Language changed to English", {
        type: "success",
      });
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };
  
  // Save storage preference
  const toggleStorageLocation = async (value: boolean): Promise<void> => {
    setUseCloudStorage(value);
    try {
      await AsyncStorage.setItem("storageType", value ? "cloud" : "local");
      toast.show(value ? "Using cloud storage" : "Using local storage", {
        type: "success",
      });
    } catch (error) {
      console.error("Error saving storage preference:", error);
    }
  };
  
  // Handle email change
  const handleEmailChange = async (): Promise<void> => {
    if (!newEmail || !password) {
      toast.show("Both email and password are required", { type: "error" });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Update email using the context function
      const result: UpdateEmailResult = await updateEmail(newEmail, password);
      
      if (result.success) {
        toast.show(result.msg, { type: "success" });
        
        // Close modal and reset fields
        setIsEmailChangeModalVisible(false);
        setNewEmail("");
        setPassword("");
      } else {
        toast.show(result.msg, { type: "error" });
      }
    } catch (error) {
      console.error("Email update error:", error);
      toast.show("Failed to update email", { type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailModalClose = (): void => {
    setIsEmailChangeModalVisible(false);
    setNewEmail("");
    setPassword("");
  };

  const handleEmailModalOpen = (): void => {
    setNewEmail(user?.email || "");
    setIsEmailChangeModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Email Change Section */}
        <View className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
          <Text className="px-4 pt-4 pb-2 text-lg font-semibold">Account</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-t border-gray-100"
            onPress={handleEmailModalOpen}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                <Mail size={16} color="#4925E9" />
              </View>
              <View className="ml-3">
                <Text className="text-base font-medium">Change Email</Text>
                <Text className="text-sm text-gray-500">{user?.email}</Text>
              </View>
            </View>
            <ArrowRight size={20} color="#9CA3AF" className="transform rotate-180" />
          </TouchableOpacity>
        </View>
        
        {/* Preferences Section */}
        <View className="bg-white rounded-xl overflow-hidden shadow-sm">
          <Text className="px-4 pt-4 pb-2 text-lg font-semibold">Preferences</Text>
          
          {/* Language Toggle */}
          <View className="flex-row items-center justify-between p-4 border-t border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                <Globe size={16} color="#4925E9" />
              </View>
              <View className="ml-3">
                <Text className="text-base font-medium">{isSpanish ? "Idioma: Español" : "Language: English"}</Text>
                <Text className="text-sm text-gray-500">{isSpanish ? "Cambiar al inglés" : "Switch to Spanish"}</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={isSpanish ? "#4925E9" : "#F3F4F6"}
              onValueChange={toggleLanguage}
              value={isSpanish}
            />
          </View>
          
          {/* Storage Location Toggle */}
          <View className="flex-row items-center justify-between p-4 border-t border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                {useCloudStorage ? (
                  <Cloud size={16} color="#4925E9" />
                ) : (
                  <HardDrive size={16} color="#4925E9" />
                )}
              </View>
              <View className="ml-3">
                <Text className="text-base font-medium">
                  {useCloudStorage ? "Cloud Storage" : "Local Storage"}
                </Text>
                <Text className="text-sm text-gray-500">
                  {useCloudStorage 
                    ? "Photos are stored in the cloud" 
                    : "Photos are stored on your device"
                  }
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
              thumbColor={useCloudStorage ? "#4925E9" : "#F3F4F6"}
              onValueChange={toggleStorageLocation}
              value={useCloudStorage}
            />
          </View>
        </View>
        
        {/* App Info */}
        <View className="mt-6 items-center">
          <Text className="text-gray-500">App Version 1.0.0</Text>
        </View>
      </ScrollView>
      
      {/* Email Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEmailChangeModalVisible}
        onRequestClose={handleEmailModalClose}
      >
        <BlurView intensity={100} tint="dark" style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0}} />
        <View className="flex-1 justify-center items-center px-5">
          <View className="bg-white rounded-xl p-5 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Change Email</Text>
              <TouchableOpacity 
                onPress={handleEmailModalClose}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text className="mb-4 text-gray-600">
              Changing your email requires verification. Enter your new email and current password.
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-600 mb-1 ml-1">New Email</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-800"
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-600 mb-1 ml-1">Current Password</Text>
              <TextInput
                className="bg-gray-100 p-4 rounded-xl text-gray-800"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
              />
            </View>
            
            <TouchableOpacity
              className="bg-[#4925E9] py-4 rounded-xl mt-2 flex-row justify-center items-center"
              activeOpacity={0.8}
              onPress={handleEmailChange}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">
                    Update Email
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AppSettings;

// You'll need to implement this function or import it from your auth store
const updateEmail = async (newEmail: string, password: string): Promise<UpdateEmailResult> => {
  // Replace this with your actual implementation
  throw new Error("Function not implemented. Please implement updateEmail function.");
};