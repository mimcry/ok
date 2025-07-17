import { getAuthToken } from '@/api/userdetails';
import { BASE_URL } from '@/utils/config';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function PaymentScreen() {
  const { createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('add-card');
  
  // Mock payment history data - replace with actual API call
  const [paymentHistory] = useState([
    { id: 1, last4: '4242', brand: 'Visa', exp: '12/25', isDefault: true },
    { id: 2, last4: '5555', brand: 'Mastercard', exp: '08/26', isDefault: false },
    { id: 3, last4: '3782', brand: 'American Express', exp: '03/27', isDefault: false },
  ]);

  const handleAddPaymentMethod = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Incomplete Card Info', 'Please enter complete card details.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create a Stripe PaymentMethod
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        card: cardDetails,
      });
      if (error || !paymentMethod?.id) {
        throw new Error(error?.message ?? 'Failed to create payment method.');
      }

      // 2. Get your auth token
      const token = await getAuthToken();

      // 3. POST to /api/invoices/payment-methods/
      const res = await fetch(`${BASE_URL}/api/invoices/payment-methods/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),          
          ...(token ? { "X-CSRFToken": token } : {}),
        },
        body: JSON.stringify({
          stripe_payment_method_id: paymentMethod.id,
          is_default: false,
        }),
      });
      
      console.log("paymentMethod.id", paymentMethod.id)
      const payload = await res.text();
      if (!res.ok) {
        throw new Error(payload);
      }

      Alert.alert('Success', 'Payment method added successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentHistoryItem = ({ item }) => (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Text className="text-white text-xs font-bold">
              {item.brand === 'Visa' ? 'V' : item.brand === 'Mastercard' ? 'MC' : 'AE'}
            </Text>
          </View>
          <View>
            <Text className="text-gray-900 font-semibold text-base">
              •••• •••• •••• {item.last4}
            </Text>
            <Text className="text-gray-500 text-sm">
              {item.brand} • Expires {item.exp}
            </Text>
          </View>
        </View>
        {item.isDefault && (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-800 text-xs font-medium">Default</Text>
          </View>
        )}
      </View>
      <View className="flex-row justify-end space-x-3">
        <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-lg">
          <Text className="text-gray-700 text-sm font-medium">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-100 px-4 py-2 rounded-lg">
          <Text className="text-red-700 text-sm font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddCardTab = () => (
    <ScrollView className="flex-1">
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Add New Card</Text>
          <Text className="text-gray-600">Enter your card details securely</Text>
        </View>
        
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-3">Card Information</Text>
          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <CardField
              postalCodeEnabled={false}
              placeholder={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                borderWidth: 0,
                textColor: '#111827',
                fontSize: 16,
                placeholderColor: '#9CA3AF',
              }}
              style={{ height: 50 }}
              onCardChange={(card) => setCardDetails(card)}
            />
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center bg-blue-50 p-4 rounded-xl">
            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">🔒</Text>
            </View>
            <Text className="text-blue-800 text-sm flex-1">
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-2xl p-4 ${isProcessing ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
          onPress={handleAddPaymentMethod}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Add Payment Method
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPaymentHistoryTab = () => (
    <View className="flex-1">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Payment Methods</Text>
        <Text className="text-gray-600">Manage your saved payment methods</Text>
      </View>
      
      <FlatList
        data={paymentHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPaymentHistoryItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );

  // Inline tab button component
  const TabButton = ({ 
    label, 
    tab 
  }: { 
    label: string, 
    tab: 'add-card' | 'payment-history' 
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-full mr-2 ${
        activeTab === tab 
          ? 'bg-primary' 
          : 'bg-gray-100'
      }`}
    >
      <Text 
        className={`text-sm font-medium ${
          activeTab === tab 
            ? 'text-white' 
            : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View className="bg-white pt-4 pb-6 px-6 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900 text-center">
          Payment Settings
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="px-5 mb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row">
            <TabButton label="Add Card" tab="add-card" />
            <TabButton label="Payment History" tab="payment-history" />
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="flex-1 px-5">
        {activeTab === 'add-card' ? renderAddCardTab() : renderPaymentHistoryTab()}
      </View>
    </SafeAreaView>
  );
}