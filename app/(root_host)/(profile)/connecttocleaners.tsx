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
} from 'react-native';
import {
  Copy,
  CheckCircle,
  Key,
  Mail,
  MessageSquare,
  X,
} from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import CustomAlert from '@/hooks/customAlert';
import HostRequestsPage from '@/app/(helper)/hostreuestpage';
import { useLocalSearchParams } from 'expo-router';
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

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => (
  <View className="flex-row bg-white mb-4 shadow-sm">
    <TouchableOpacity
      className={`flex-1 py-4 items-center ${activeTab === 'Requests' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('Requests')}
    >
      <Text className={`${activeTab === 'Requests' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>Requests</Text>
    </TouchableOpacity>
    <TouchableOpacity
      className={`flex-1 py-4 items-center ${activeTab === 'OTP' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('OTP')}
    >
      <Text className={`${activeTab === 'OTP' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>OTP</Text>
    </TouchableOpacity>
  </View>
);

const ConnectToHost: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'Requests' | 'OTP'>('Requests');
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
  const params = useLocalSearchParams();
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

  // Generate a code only when tab is on OTP
  useEffect(() => {
    if (activeTab === 'OTP' && !generatedCode) {
      generateNewCode();
    }
  }, [activeTab]);

  const connectWithCode = async (code: string): Promise<void> => {
    setIsLoading(true);
    setConnectionStatus(null);

    setTimeout(() => {
      if (Math.random() > 0.3) {
        showCustomAlert('Connected', `Successfully connected `, 'success');
        setSuccessCleanerName('Sarah Johnson');
      } else {
        showCustomAlert('Connection Failed', 'Invalid or expired connection code. Please try again.', 'danger');
        setErrorMessage('Invalid or expired connection code. Please try again.');
      }
      setIsLoading(false);
      setShowModal(false);
    }, 1500);
  };

  const generateNewCode = (): void => {
    if (activeTab !== 'OTP') return;

    setGeneratedCode('');
    setIsGeneratingCode(true);

    setTimeout(() => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const result = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');
      setGeneratedCode(result);
      setIsGeneratingCode(false);
      showCustomAlert('New Code Generated', 'Your connection code has been refreshed', 'success');
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

  const renderOtpTab = (): JSX.Element => {
    if (isGeneratingCode && !generatedCode) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-center mt-4">Generating your connection code...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 px-6 mt-6">
        <Text className="text-gray-600 mb-6">
          Generate a connection code and share it with your host to establish a connection.
        </Text>

        <Text className="text-sm font-medium text-gray-700 mb-2">Your Connection Code</Text>
        <View className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-6">
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

        <TouchableOpacity
          className="flex-row items-center border border-gray-300 rounded-lg p-4 mb-3"
          onPress={shareViaEmail}
        >
          <Mail size={20} color="#6B7280" />
          <Text className="ml-3 text-gray-800">Share via Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center border border-gray-300 rounded-lg p-4 mb-6"
          onPress={shareViaSMS}
        >
          <MessageSquare size={20} color="#6B7280" />
          <Text className="ml-3 text-gray-800">Share via Text Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-200 p-4 rounded-lg items-center"
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

        <TouchableOpacity
          onPress={openEnterCodeModal}
          className="mt-6"
        >
          <Text className="text-primary text-sm text-center font-medium">
            Already have a code from your host?
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'OTP' && renderOtpTab()}

      {activeTab === 'Requests' && <HostRequestsPage notificationCandidateId={notificationCandidateId}
        shouldOpenModal={shouldOpenModal}
        onModalHandled={handleModalHandled} />}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center bg-black bg-opacity-70 backdrop-blur-md">
          <View className="bg-white m-5 p-6 rounded-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Enter Cleaner's Code</Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">
              Enter the verification code provided by your host to connect your accounts.
            </Text>

            <Text className="text-sm font-medium text-gray-700 mb-2">Cleaner's Code</Text>
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
                <Text className="text-white font-semibold text-base">Connect with Cleaner</Text>
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
      </Modal>

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