import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
  ToastAndroid,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import {
  Copy,
  CheckCircle,
  Key,
  Mail,
  MessageSquare,
  X,
  Phone,
  MapPin,
  Check,
  MoreVertical,
  Search,
} from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import CustomAlert from '@/hooks/customAlert';
import HostRequestsPage from '@/app/(helper)/hostreuestpage';
import { BlurView } from 'expo-blur';
import { useAppToast } from '@/hooks/toastNotification';
import { requesttoconnect } from '@/api/requestcleaner';
import { fetchCandidates } from '@/api/unconnectedusers';
import { useLocalSearchParams } from 'expo-router';
// Host interface
interface Host {
  profile_picture: string | undefined;
  id: number;
  full_name: string;
  email: string;
  profile_image?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface TabNavigationProps {
  activeTab: 'Requests' | 'OTP';
  setActiveTab: (tab: 'Requests' | 'OTP') => void;
}

interface ConnectionStatus {
  success: boolean;
  message: string;
  cleanerName?: string;
}

interface EmailVerificationData {
  code: string;
  type: 'email' | 'sms';
}

const HostCard = ({ host, onPress }: { host: Host, onPress: () => void }) => {
  return (
    <TouchableOpacity 
      className="flex-row bg-white rounded-xl p-3 mb-3 shadow-sm items-center"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
      source={
                  host.profile_image
                    ? { uri: host.profile_image }
                    : require('@/assets/images/profile.png')
                }
        className="w-12 h-12 rounded-full"
      />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-gray-900">{host.full_name}</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{host.email}</Text>
      </View>
    </TouchableOpacity>
  );
};

const HostDetailModal = ({ 
  visible, 
  host, 
  onClose, 
  onSendRequest,
  isRequesting
}: { 
  visible: boolean; 
  host: Host | null; 
  onClose: () => void;
  onSendRequest: () => void;
  isRequesting: boolean;
}) => {
  if (!host) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint='dark' className="flex-1 justify-end">
        <View className="bg-gray-300 rounded-t-3xl p-6 items-center shadow-lg">
          <TouchableOpacity className="absolute top-4 right-4 z-10" onPress={onClose}>
            <X size={24} color="#333" />
          </TouchableOpacity>
          
         <View className='border border-primary p-2 rounded-full'>
            <Image 
            source={
                  host.profile_image
                    ? { uri: host.profile_image }
                    : require('@/assets/images/profile.png')
                }
        className="w-28 h-28 rounded-full"
      />
         </View>
          
          <Text className="text-2xl font-bold text-gray-900 mb-4">{host.full_name}</Text>
          
          <View className="w-full mb-5">
            <View className="flex-row items-center mb-3">
              <Mail size={20} color="black" />
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${host.email}`)}>
                <Text className="text-base text-gray-600 ml-3">{host.email}</Text>
              </TouchableOpacity>
            </View>
            
            {host.phone && (
              <View className="flex-row items-center mb-3">
                <Phone size={20} color="#0284c7" />
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${host.phone}`)}>
                  <Text className="text-base text-gray-600 ml-3">{host.phone}</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {host.location && (
              <View className="flex-row items-center mb-3">
                <MapPin size={20} color="#0284c7" />
                <Text className="text-base text-gray-600 ml-3">{host.location}</Text>
              </View>
            )}
          </View>
          
          {host.bio && (
            <View className="w-full mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">About</Text>
              <Text className="text-base text-gray-600 leading-relaxed">{host.bio}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            className="flex-row bg-primary rounded-xl py-3.5 px-6 items-center justify-center w-full"
            onPress={onSendRequest}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Check size={20} color="#ffffff" />
                <Text className="text-white font-semibold text-base ml-2">Send Connection Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => (
  <View className="flex-row bg-white mb-4 shadow-sm">
   
    <TouchableOpacity 
      className={`flex-1 py-4 items-center ${activeTab === 'OTP' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('OTP')}
    >
      <Text className={`${activeTab === 'OTP' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>Host marketplace</Text>
    </TouchableOpacity>
     <TouchableOpacity 
      className={`flex-1 py-4 items-center ${activeTab === 'Requests' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('Requests')}
    >
      <Text className={`${activeTab === 'Requests' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>Requests</Text>
    </TouchableOpacity>
  </View>
);

const ConnectToHost: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const toast = useAppToast();
  
  const [activeTab, setActiveTab] = useState<'Requests' | 'OTP'>('OTP');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successCleanerName, setSuccessCleanerName] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertType, setAlertType] = useState<string>('danger');
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [emailVerificationData, setEmailVerificationData] = useState<EmailVerificationData | null>(null);
  const [showAlert2, setShowAlert2] = useState<boolean>(false);
  const [notificationCandidateId, setNotificationCandidateId] = useState<number | null>(null);
const [shouldOpenModal, setShouldOpenModal] = useState(false);
  // Host marketplace states
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [hostModalVisible, setHostModalVisible] = useState(false);
  const [isRequestingConnection, setIsRequestingConnection] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
console.log("host details:",hosts)
const params = useLocalSearchParams();
console.log("local params:",params)
useEffect(() => {
  
  if (params.candidateId && params.openModal === 'true') {
    setNotificationCandidateId(Number(params.candidateId));
    setShouldOpenModal(true);
    setActiveTab('Requests'); // Switch to Requests tab
  }
}, []);
const handleModalHandled = () => {
  setNotificationCandidateId(null);
  setShouldOpenModal(false);
};
  // Deep linking support
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const match = url?.match(/[?&]code=([^&]+)/);
      if (match?.[1]) {
        const code = match[1];
        setVerificationCode(code);
        connectWithCode(code);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      const match = url?.match(/[?&]code=([^&]+)/);
      if (match?.[1]) {
        const code = match[1];
        setVerificationCode(code);
        connectWithCode(code);
      }
    });

    return () => subscription.remove();
  }, []);

  // Generate a code only when needed
  useEffect(() => {
    if (activeTab === 'OTP' && showOtpSection && !generatedCode) {
      generateNewCode();
    }
  }, [activeTab, showOtpSection]);

  // Fetch hosts on initial load
  useEffect(() => {
    if (activeTab === 'OTP') {
      fetchHosts();
    }
  }, [activeTab]);

  const fetchHosts = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetchCandidates();
      
      if (response.success && response.candidates) {
        // Map the API response to match your Host interface
        const mappedHosts = response.candidates.map(candidate => ({
          id: candidate.id,
          full_name: candidate.full_name || candidate.username || 'Unknown',
          email: candidate.email || 'No email provided',
          profile_image: candidate.profile_picture ,
          phone: candidate.phone || undefined,
          location: candidate.location || undefined,
          bio: candidate.bio || undefined
        }));
        
        setHosts(mappedHosts);
      } else {
        toast.error(response.error || 'Failed to load hosts');
        console.error('Error fetching hosts:', response.error);
      }
    } catch (error) {
      console.error('Error fetching hosts:', error);
      toast.error('Failed to load hosts. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const connectWithCode = async (code: string): Promise<void> => {
    setIsLoading(true);
    setConnectionStatus(null);

    setTimeout(() => {
      if (Math.random() > 0.3) {
        toast.success("Successfully connected with Sarah Johnson");
      } else {
        toast.error("Invalid or expired connection code. Please try again.");
        setErrorMessage('Invalid or expired connection code. Please try again.');
      }
      setIsLoading(false);
      setShowModal(false);
    }, 1500);
  };

  const generateNewCode = (): void => {
    setGeneratedCode('');
    setIsGeneratingCode(true);
    
    setTimeout(() => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const result = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');
      setGeneratedCode(result);
      setIsGeneratingCode(false);
      toast.success("Your connection code has been generated.");
    }, 1500);
  };

  const handleConnect = (): void => {
    if (!verificationCode.trim()) {
      showCustomAlert('Error', 'Please enter a verification code', 'danger');
      return;
    }
    connectWithCode(verificationCode.trim());
  };

  const resetConnection = (): void => {
    setConnectionStatus(null);
    setVerificationCode('');
    setErrorMessage('');
    generateNewCode();
  };

  const showCustomAlert = (title: string, message: string, type: string): void => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertType(type);
      setShowAlert(true);
    }
  };

  const copyCodeToClipboard = (): void => {
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareViaEmail = (): void => {
    setEmailVerificationData({
      code: generatedCode,
      type: 'email'
    });
    setShowAlert2(true);
  };

  const shareViaSMS = (): void => {
    setEmailVerificationData({
      code: generatedCode,
      type: 'sms'
    });
    setShowAlert2(true);
  };

  const handleUpdateProfile = (data: EmailVerificationData): void => {
    showCustomAlert('Success', `Code shared via ${data.type}`, 'success');
    setShowAlert2(false);
  };

  const openEnterCodeModal = (): void => {
    setVerificationCode('');
    setShowModal(true);
  };
  
  const closeModal = (): void => {
    setShowModal(false);
    setVerificationCode('');
  };

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // Host marketplace handlers
  const handleOpenHostModal = (host: Host) => {
    setSelectedHost(host);
    setHostModalVisible(true);
  };

  const handleCloseHostModal = () => {
    setHostModalVisible(false);
    setTimeout(() => setSelectedHost(null), 300);
  };

  const handleSendRequest = async () => {
    if (!selectedHost) return;
    
    setIsRequestingConnection(true);
    
    try {
      const response = await requesttoconnect(selectedHost.id);
      console.log("selested host id:", selectedHost.id)
      if (response.success) {
        toast.success(`Connection request sent to ${selectedHost.full_name}`);
        handleCloseHostModal();
      } else {
        toast.error(response.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsRequestingConnection(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHosts();
  };

  const toggleOtpSection = () => {
    setShowOtpSection(!showOtpSection);
    if (!showOtpSection && !generatedCode) {
      generateNewCode();
    }
  };

  const renderOtpSection = (): JSX.Element => {
    if (isGeneratingCode && !generatedCode) {
      return (
        <View className="justify-center items-center py-4">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-center mt-4">Generating your connection code...</Text>
        </View>
      );
    }

    return (
      <View className="px-6 py-4 bg-gray-50 rounded-lg mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Your Connection Code</Text>
        <View className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
          {generatedCode ? (
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold tracking-widest text-primary">
                {generatedCode}
              </Text>
              <TouchableOpacity onPress={copyCodeToClipboard}>
                {codeCopied ? (
                  <CheckCircle size={24} color="#10B981" />
                ) : (
                  <Copy size={24} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row justify-center items-center py-2">
              <ActivityIndicator size="small" color="#0000ff" />
              <Text className="ml-3 text-gray-500">Generating code...</Text>
            </View>
          )}
          {codeCopied && (
            <Text className="text-green-500 text-sm mt-2">Copied to clipboard!</Text>
          )}
        </View>

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-1 mr-2 flex-row justify-center items-center"
            onPress={shareViaEmail}
          >
            <Mail size={18} color="#0284c7" />
            <Text className="ml-2 text-blue-700 font-medium">Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-1 ml-2 flex-row justify-center items-center"
            onPress={shareViaSMS}
          >
            <MessageSquare size={18} color="#0284c7" />
            <Text className="ml-2 text-blue-700 font-medium">SMS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-gray-200 p-3 rounded-lg items-center"
          onPress={generateNewCode}
          disabled={isGeneratingCode}
        >
          {isGeneratingCode ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#6B7280" />
              <Text className="text-gray-600 font-semibold ml-2">Generating...</Text>
            </View>
          ) : (
            <Text className="text-gray-800 font-semibold">Generate New Code</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHostMarketplace = (): JSX.Element => {
    return (
      <View className="flex-1 px-4">
        {/* <TouchableOpacity 
          className="bg-blue-100 rounded-2xl px-4 py-3 shadow-sm border border-blue-200 mb-4 flex-row justify-between items-center"
          onPress={toggleOtpSection}
        >
          <Text className="text-blue-900 text-base font-medium">
            {showOtpSection ? "Hide connection OTP" : "Connect host with OTP"}
          </Text>
          {showOtpSection ? (
            <X size={20} color="#1e40af" />
          ) : (
            <Key size={20} color="#1e40af" />
          )}
        </TouchableOpacity>

        {showOtpSection && renderOtpSection()}
        
        {!showOtpSection && (
          <TouchableOpacity 
            onPress={openEnterCodeModal}
            className="bg-gray-100 rounded-xl px-4 py-3 mb-4 flex-row justify-center items-center"
          >
            <Key size={18} color="#4b5563" />
            <Text className="text-gray-700 text-sm font-medium ml-2">
              Enter host's connection code
            </Text>
          </TouchableOpacity>
        )} */}

        <Text className="text-lg font-semibold text-gray-800 mb-2">Available Hosts</Text>
        <Text className="text-sm text-gray-600 mb-4">Connect with hosts to provide cleaning services</Text>

        {isLoading && hosts.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="mt-4 text-gray-600">Loading hosts...</Text>
          </View>
        ) : hosts.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-center mb-4">No hosts available at this time</Text>
            <TouchableOpacity 
              className="bg-sky-600 py-2.5 px-5 rounded-lg" 
              onPress={fetchHosts}
            >
              <Text className="text-white text-base font-medium">Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={hosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <HostCard host={item} onPress={() => handleOpenHostModal(item)} />
            )}
            className="pb-5"
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'OTP' && renderHostMarketplace()}
      
  {activeTab === 'Requests' && (
  <HostRequestsPage 
    notificationCandidateId={notificationCandidateId}
    shouldOpenModal={shouldOpenModal}
    onModalHandled={handleModalHandled}
  />
)}

      {/* Enter Code Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >  
        <BlurView intensity={90} tint="dark" className="flex-1">
          <View className="flex-1 justify-center">
            <View className="bg-white m-5 p-6 rounded-xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">Enter Host's Code</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-gray-600 mb-4">
                Enter the verification code provided by your host to connect your accounts.
              </Text>
              
              <Text className="text-sm font-medium text-gray-700 mb-2">Host's Code</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50 mb-4">
                <Key size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-base"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                className="bg-primary p-4 rounded-lg items-center"
                onPress={handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white font-semibold text-base">Connect with Host</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                className="mt-4 items-center"
                onPress={closeModal}
              >
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Host Detail Modal */}
      <HostDetailModal
        visible={hostModalVisible}
        host={selectedHost}
        onClose={handleCloseHostModal}
        onSendRequest={handleSendRequest}
        isRequesting={isRequestingConnection}
      />

      <CustomAlert
        visible={showAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onCancel={() => setShowAlert(false)}
        onConfirm={() => setShowAlert(false)}
        hideCancel
      />

      <CustomAlert
        visible={showAlert2}
        type="success"
        title="Confirm Sharing"
        message={`Are you sure you want to share your code via ${emailVerificationData?.type}?`}
        onCancel={() => setShowAlert2(false)}
        onConfirm={() => handleUpdateProfile(emailVerificationData as EmailVerificationData)}
      />
    </SafeAreaView>
  );
};

export default ConnectToHost;