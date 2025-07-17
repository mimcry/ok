// components/CleanerModal.tsx
import { requesttoconnect } from '@/api/requestcleaner';
import { getUserDetail } from '@/api/userdetails';
import { useAppToast } from '@/hooks/toastNotification';
import { UserCheck, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';


import { Cleaner, DetailedUser } from '@/types/cleanermarketplace';
import AboutSection from './AboutSection';
import ContactCard from './ContactCard';
import ProfileHeader from './ProfileHeader';
import ReviewsSection from './ReviewsSection';
import StatsGrid from './StatsGrid';

interface CleanerModalProps {
  visible: boolean;
  cleaner: Cleaner | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CleanerModal: React.FC<CleanerModalProps> = ({ 
  visible, 
  cleaner, 
  onClose, 
  onSuccess 
}) => {
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [assigningCleaner, setAssigningCleaner] = useState<boolean>(false);
  const toast = useAppToast();

  useEffect(() => {
    if (visible && cleaner) {
      fetchUserDetails(cleaner.id);
    } else {
      setDetailedUser(null);
    }
  }, [visible, cleaner]);

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const response = await getUserDetail(parseInt(userId), 'cleaner');
      if (response.success && response.data) {
        const userData = {
          ...response.data,
          ratings: response.data.ratings || []
        };
        setDetailedUser(userData);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const assignCleaner = (cleanerId: string) => {
    setAssigningCleaner(true);
    requesttoconnect(cleanerId)
      .then(response => {
        if (response) {
          toast.success("Connection request sent successfully.");
          onSuccess();
        } else {
          toast.error('Failed to send request');
        }
      })
      .catch(error => {
        console.error('Request error:', error);
        toast.error('An error occurred while sending the request');
      })
      .finally(() => {
        setAssigningCleaner(false);
        onClose();
      });
  };

  if (!cleaner) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <Pressable 
          className="absolute w-full h-full" 
          onPress={onClose}
        />
        
        <View className="mt-20 bg-white rounded-t-3xl flex-1 overflow-hidden">
          {/* Close button */}
          <View className="absolute right-4 top-4 z-10">
            <TouchableOpacity 
              onPress={onClose}
              className="bg-white/90 p-2.5 rounded-3xl shadow-md"
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <ProfileHeader 
              cleaner={cleaner}
              detailedUser={detailedUser}
            />

            {loadingDetails && (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-3 text-gray-500">Loading details...</Text>
              </View>
            )}

            <StatsGrid 
              cleaner={cleaner}
              detailedUser={detailedUser}
            />

            <ContactCard detailedUser={detailedUser} />

            <AboutSection 
              cleaner={cleaner}
              detailedUser={detailedUser}
            />

            <ReviewsSection 
              cleaner={cleaner}
              detailedUser={detailedUser}
            />
          </ScrollView>
          
          {/* Action Button */}
          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-100 shadow-2xl">
            <TouchableOpacity
              className={`${assigningCleaner ? 'bg-gray-400' : 'bg-indigo-600'} py-4 rounded-2xl flex-row items-center justify-center shadow-lg`}
              onPress={() => assignCleaner(cleaner.id)}
              disabled={assigningCleaner}
            >
              {assigningCleaner ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Sending Request...
                  </Text>
                </>
              ) : (
                <>
                  <UserCheck size={24} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Send Connection Request
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CleanerModal;