import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { ArrowLeft, Lock, Shield, Key, Eye, Database, Bell } from 'lucide-react-native';

const SecurityPrivacyScreen = () => {
  const SecurityPrivacyPoint = ({ icon, title, description }:any) => (
    <View className="flex-row items-start mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <View className="bg-indigo-100 p-3 rounded-full">
        {icon}
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
     
      <ScrollView className="flex-1 px-5 pt-6">
        {/* Intro Text */}
        <View className="mb-8">
          <Text className="text-base text-gray-600 leading-relaxed">
            At Neatly, we prioritize the security of your data and respect your privacy.
            Here's how we protect your information:
          </Text>
        </View>

        {/* Security Points */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4 px-1">Security</Text>
          
          <SecurityPrivacyPoint
            icon={<Lock size={24} color="#4F46E5" />}
            title="End-to-End Encryption"
            description="All your cleaning records, client information, and communications are secured with end-to-end encryption."
          />
          
          <SecurityPrivacyPoint
            icon={<Key size={24} color="#4F46E5" />}
            title="Multi-Factor Authentication"
            description="Add an extra layer of security to your account with our two-factor authentication system."
          />
          
          <SecurityPrivacyPoint
            icon={<Database size={24} color="#4F46E5" />}
            title="Secure Cloud Storage"
            description="Your data is stored in secure cloud servers with regular backups and industry-standard security protocols."
          />
        </View>

        {/* Privacy Points */}
        <View className="mb-12">
          <Text className="text-xl font-bold text-gray-800 mb-4 px-1">Privacy</Text>
          
          <SecurityPrivacyPoint
            icon={<Eye size={24} color="#4F46E5" />}
            title="No Unauthorized Data Sharing"
            description="We never sell your data to third parties. Your information is used only to provide and improve our cleaning management services."
          />
          
          <SecurityPrivacyPoint
            icon={<Bell size={24} color="#4F46E5" />}
            title="Transparent Notifications"
            description="You control what notifications you receive and how you receive them. Easy opt-out options are always available."
          />
          
          <SecurityPrivacyPoint
            icon={<Shield size={24} color="#4F46E5" />}
            title="GDPR Compliance"
            description="We adhere to global privacy standards including GDPR, giving you control over your personal data and the right to be forgotten."
          />
        </View>

        {/* Version Info */}
        <View className="mb-12 items-center">
          <Text className="text-gray-400 text-sm">Neatly v1.1.0</Text>
          <Text className="text-gray-400 text-xs mt-1">© 2025 Neatly</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityPrivacyScreen;