import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StatusBar, Alert,Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppToast } from '@/hooks/toastNotification';
interface Integration {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  isConnected: boolean;
}

const IntegrationPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
const toast =useAppToast()
  const integrations: Integration[] = [
    {
      id: 'guestly',
      name: 'Guestly',
      description: 'Connect your Guestly account to sync property data and automate cleaning management',
      logoUrl: 'https://mma.prnewswire.com/media/835437/Guesty_Logo.jpg?p=twitter',
      isConnected: false,
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      description: 'Sync your Airbnb listings and manage cleaning seamlessly',
      logoUrl: 'https://s3.us-east-1.amazonaws.com/cdn.designcrowd.com/blog/airbnb-logo-history/Color-Airbnb-Logo.jpg',
      isConnected: false,
    },
   
  ];

  const handleIntegrationPress = (integration: Integration) => {
    if (integration.isConnected) {
        toast.success(`${integration.name} is already connected to your account.`)
     
      return;
    }
    
    setSelectedIntegration(integration);
    setModalVisible(true);
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
        toast.error('Please enter your API key')
     
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setModalVisible(false);
      setApiKey('');
      toast.success(`${selectedIntegration?.name} has been connected successfully!`)
         }, 2000);
  };

  const closeModal = () => {
    setModalVisible(false);
    setApiKey('');
    setSelectedIntegration(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-4 pb-6 px-6">
       
        <Text className="text-gray-600">
          Connect your property management platforms to streamline operations
        </Text>
      </View>

      {/* Integration List */}
      <ScrollView className="flex-1 px-6 py-6">
        {integrations.map((integration) => (
          <TouchableOpacity
            key={integration.id}
            className="bg-white rounded-xl p-6 mb-4 border border-gray-200 shadow-sm"
            onPress={() => handleIntegrationPress(integration)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              {/* Logo */}
              <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center mr-4">
            <Image source={{uri:integration.logoUrl}} className=' w-16 h-16' />
            
              </View>
              
              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-900">
                    {integration.name}
                  </Text>
                  
                  {/* Status Badge */}
                  {integration.isConnected ? (
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-800 text-sm font-medium">
                        Connected
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-gray-100 px-3 py-1 rounded-full">
                      <Text className="text-gray-600 text-sm font-medium">
                        Not Connected
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text className="text-gray-600 text-sm leading-5">
                  {integration.description}
                </Text>
              </View>
            </View>
            
            {/* Action Indicator */}
            <View className="flex-row justify-end mt-4">
              <View className="bg-indigo-50 px-4 py-2 rounded-lg">
                <Text className="text-indigo-600 font-medium text-sm">
                  {integration.isConnected ? 'Manage' : 'Connect'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* API Key Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
          <BlurView intensity={50} tint="dark" className="flex-1 justify-end">
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-96">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Connect {selectedIntegration?.name}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-600 font-bold">×</Text>
              </TouchableOpacity>
            </View>

            {/* Integration Info */}
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-lg bg-indigo-100 items-center justify-center mr-3">
                        <Image source={{uri:selectedIntegration?.logoUrl}} className=' w-10 h-10' />
                </View>
                <Text className="text-lg font-semibold text-gray-900">
                  {selectedIntegration?.name}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">
                {selectedIntegration?.description}
              </Text>
            </View>

            {/* API Key Input */}
            <View className="mb-6">
              <Text className="text-gray-900 font-medium mb-2">
                API Key
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900"
                placeholder="Enter your API key"
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="text-gray-500 text-sm mt-2">
                You can find your API key in your {selectedIntegration?.name} account settings
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl ${
                  loading ? 'bg-indigo-300' : 'bg-indigo-600'
                }`}
                onPress={handleConnect}
                disabled={loading}
              >
                <Text className="text-white font-semibold text-center">
                  {loading ? 'Connecting...' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default IntegrationPage;