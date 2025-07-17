import { chatApiService, ChatConnection, ChatMessage } from '@/api/chatApi';
import ChatRoomSkeleton from '@/components/ChatRoomSkeleton';
import { useAuthStore } from '@/context/userAuthStore';
import CustomAlert from '@/hooks/customAlert';
import useChatStore from '@/store/chatStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ImagePlus, Phone, SendHorizonal, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ChatRoomParams {
  profile_picture?: any;
  connectionId: string;
  name?: string;
  image?: string;
}

// Interface for selected images with preview
interface SelectedImage {
  uri: string;
  id: string;
}

// Helper functions for safe image handling
const isValidImageUri = (uri: any): uri is string => {
  return typeof uri === 'string' && uri.trim().length > 0;
};

const getImageSource = (uri: any, fallback: any = require('@/assets/images/profile.png')) => {
  if (isValidImageUri(uri)) {
    return { uri };
  }
  return fallback;
};

const extractImageUri = (image: any): string | null => {
  if (typeof image === 'string') return image;
  if (image && typeof image === 'object') {
    // Handle API's image object structure
    return image.image || image.uri || image.url || image.source || null;
  }
  return null;
};

// Full Screen Image Modal Component
const FullScreenImageModal: React.FC<{
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}> = ({ visible, imageUri, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View className="flex-1 bg-black">
        {/* Close button */}
        <TouchableOpacity
          className="absolute top-12 right-4 z-10 bg-black bg-opacity-50 rounded-full p-2"
          onPress={onClose}
        >
          <X size={24} color="white" />
        </TouchableOpacity>

        {/* Full screen image */}
        <View className="flex-1 justify-center items-center">
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{
                width: screenWidth,
                height: screenHeight,
              }}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ChatRoomHeader Component
const ChatRoomHeader: React.FC<{
  user: any;
  connection?: ChatConnection | null;
  onPhonePress?: () => void;
}> = ({ user, connection, onPhonePress }) => {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 mt-14 bg-white border-b border-gray-200">
      {/* Left side - Back button */}
      <TouchableOpacity onPress={handleBackPress} className="p-2 mr-4">
        <ArrowLeft size={24} color="#374151" />
      </TouchableOpacity>

      {/* Center - Profile and name */}
      <View className="flex-1 flex-row items-center justify-start">
        <Image
          source={getImageSource(user?.profile_picture)}
          className="w-10 h-10 rounded-full mr-3"
          onError={(error) => console.log('Header profile image error:', error.nativeEvent.error)}
        />
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            {user?.name || user?.username }
          </Text>
          {connection && (
            <Text className="text-sm text-gray-500">
              Online
            </Text>
          )}
        </View>
      </View>

      {/* Right side - Phone icon */}
      <TouchableOpacity onPress={onPhonePress} className="p-2">
        <Phone size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );
};

const ChatRoom: React.FC = () => {
  const selectedUser = useChatStore((state) => state.selectedUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connection, setConnection] = useState<ChatConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = useAuthStore((state) => state.user);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const params = useLocalSearchParams();
  const [messageText, setMessageText] = useState<string>("");
  const inputRef = useRef<TextInput>(null);
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [error, setError] = useState<string>();
  const pollCleanupRef = useRef<(() => void) | null>(null);
  const { id } = useLocalSearchParams();
  
  // New state for selected images
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  
  // Full screen image modal state
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  // COMPLETELY REWRITTEN focus management
  const [inputFocused, setInputFocused] = useState(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendingRef = useRef(false); // Use ref instead of state to avoid re-renders
  const messageCountRef = useRef(0); // Track message sends

  // Fixed connectionId logic
  const connectionId = (() => {
    if (selectedUser?.id) {
      console.log("Using selectedUser ID:", selectedUser.id);
      return selectedUser?.id;
    }
    if (id) {
      const parsedId = parseInt(id as string);
      console.log("Using parsed ID from params:", parsedId);
      return parsedId;
    }
    if (params.connectionId) {
      const parsedConnectionId = parseInt(Array.isArray(params.connectionId) ? params.connectionId[0] : params.connectionId);
      console.log("Using connectionId from params:", parsedConnectionId);
      return parsedConnectionId;
    }
    console.error("No valid connectionId found");
    return null;
  })();

  // Enhanced debugging
  console.log("=== CHAT ROOM DEBUGGING ===");
  console.log("Chat params:", params);
  console.log("Raw ID param:", id);
  console.log("Connection ID:", connectionId);
  console.log("Selected User:", selectedUser);
  console.log("Current User:", user);
  console.log("Is connectionId valid?", connectionId && !isNaN(connectionId));

  // REWRITTEN: Force focus function that's more aggressive
  const forceFocus = useCallback(() => {
    if (inputRef.current) {
      // Clear any existing timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      
      // Try immediate focus
      inputRef.current.focus();
      
      // Try again after a short delay
      focusTimeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      
      // Try again after interaction manager tasks complete
      InteractionManager.runAfterInteractions(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Initialize API service tokens when component mounts or user changes
  useEffect(() => {
    const initializeApiService = async () => {
      try {
        await chatApiService.initializeTokens();
        console.log('Chat API service tokens initialized');
      } catch (error) {
        console.error('Failed to initialize chat API service:', error);
      }
    };

    if (user) {
      initializeApiService();
    }
  }, [user]);

  // Request image picker permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required to send images.');
      }
    })();
  }, []);

  // Initial fetch of messages with better error handling
  useEffect(() => {
    if (!connectionId || isNaN(connectionId)) {
      console.error("Invalid connection ID:", connectionId);
      setError("Invalid connection ID. Please check your navigation parameters.");
      setShowAlert1(true);
      setLoading(false);
      return;
    }

    fetchMessages();
  }, [connectionId, user]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!connectionId || isNaN(connectionId) || !user) {
      return;
    }

    if (messages.length >= 0 && !loading) {
      const lastMessageId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) : 0;

      const cleanup = chatApiService.pollMessages(
        connectionId,
        lastMessageId,
        (newMessages) => {
          if (newMessages.length > 0) {
            console.log("Received new messages:", newMessages.length);
            setMessages(prevMessages => [...prevMessages, ...newMessages]);
          }
        },
      );

      pollCleanupRef.current = cleanup;

      return () => {
        if (pollCleanupRef.current && typeof pollCleanupRef.current === 'function') {
          pollCleanupRef.current();
          pollCleanupRef.current = null;
        }
      };
    }
  }, [connectionId, messages.length, loading, user]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollCleanupRef.current && typeof pollCleanupRef.current === 'function') {
        pollCleanupRef.current();
        pollCleanupRef.current = null;
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const fetchMessages = async (): Promise<void> => {
    try {
      console.log("Fetching messages for connection ID:", connectionId);

      const response = await chatApiService.fetchMessages(connectionId);
      console.log("Successfully fetched messages:", response);

      setConnection(response.connection);
      setMessages(response.messages || []);
      setError(undefined);
    } catch (error) {
      console.error('Error fetching messages:', error);

      let errorMessage = 'Failed to load messages';
      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes('404')) {
          errorMessage = `Connection not found (ID: ${connectionId}). Please check if this connection exists or try navigating back and selecting the chat again.`;
        } else if (error.message.includes('403') || error.message.includes('CSRF')) {
          errorMessage = 'Authentication error. Please try logging out and logging back in.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Session expired. Please log in again.';
        }
      }

      setError(errorMessage);
      setShowAlert1(true);
    } finally {
      setLoading(false);
    }
  };

  // COMPLETELY REWRITTEN sendMessage function
  const sendMessage = useCallback(async (): Promise<void> => {
    const message = messageText.trim();

    // Validate that we have either text or images
    if (!message && selectedImages.length === 0) {
      console.log('No message text or images provided');
      return;
    }

    if (!user?.id || !connectionId || sendingRef.current) {
      console.log('Missing required data or already sending');
      return;
    }

    // Increment message count and store focus state BEFORE any async operations
    messageCountRef.current += 1;
    const wasFocused = inputFocused;
    const currentMessageText = messageText;
    const currentImages = [...selectedImages];

    console.log(`Sending message #${messageCountRef.current}, wasFocused: ${wasFocused}`);

    try {
      // Set sending state using ref to avoid triggering re-renders
      sendingRef.current = true;
      setSending(true);

      // Clear input IMMEDIATELY to prevent UI lag
      setMessageText("");
      setSelectedImages([]);

      // Prepare message data
      const messageData = {
        message: message,
        sender_id: user.id,
      };

      console.log("Sending message:", {
        hasText: !!message,
        hasImages: currentImages.length > 0,
        imageCount: currentImages.length,
        sender_id: user.id
      });

      // Send message based on what we have
      if (currentImages.length > 0) {
        const imageUris = currentImages.map(img => img.uri);
        await chatApiService.sendMessageWithMultipleImages(connectionId, messageData, imageUris);
        console.log("images that is going to send:", imageUris);
      } else {
        await chatApiService.sendMessage(connectionId, messageData);
      }

      // Refresh messages to get the latest including the sent message
      await fetchMessages();

      console.log(`Message #${messageCountRef.current} sent successfully, refocusing...`);

    } catch (error) {
      console.error('Error sending message:', error);

      // Restore the message text and images on error
      setMessageText(currentMessageText);
      setSelectedImages(currentImages);

      let errorMessage = 'Failed to send message';

      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes('Either message text or image is required')) {
          errorMessage = 'Please enter a message or select an image to send.';
        } else if (error.message.includes('415')) {
          errorMessage = 'Server configuration error. Please try again.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid message format. Please try again.';
        } else if (error.message.includes('403') || error.message.includes('CSRF')) {
          errorMessage = 'Authentication error. Please try logging out and logging back in.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Session expired. Please log in again.';
        }
      }

      setError(errorMessage);
      setShowAlert1(true);
    } finally {
      // Reset sending state
      sendingRef.current = false;
      setSending(false);

      // CRITICAL: Always refocus if input was focused before sending
      if (wasFocused) {
        console.log(`Refocusing after message #${messageCountRef.current}`);
        
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          forceFocus();
        });
        
        // Additional delayed attempts
        setTimeout(() => {
          if (inputRef.current && wasFocused) {
            forceFocus();
          }
        }, 100);
        
        setTimeout(() => {
          if (inputRef.current && wasFocused) {
            forceFocus();
          }
        }, 300);
      }
    }
  }, [messageText, selectedImages, user?.id, connectionId, inputFocused, forceFocus]);

  const pickMultipleImages = async () => {
    try {
      const wasFocused = inputFocused;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages: SelectedImage[] = result.assets.map((asset, index) => ({
          uri: asset.uri,
          id: `${Date.now()}_${index}`,
        }));
        
        setSelectedImages(prevImages => [...prevImages, ...newImages]);
      }
      
      // Refocus if input was focused before
      if (wasFocused) {
        setTimeout(() => {
          forceFocus();
        }, 200);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeSelectedImage = (imageId: string) => {
    setSelectedImages(prevImages => prevImages.filter(img => img.id !== imageId));
  };

  const formatTime = (timestamp: string): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return time;
    } else if (isYesterday) {
      const dayMonth = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `${dayMonth}, ${time}`;
    } else {
      const isCurrentYear = date.getFullYear() === now.getFullYear();
      const formatOptions: Intl.DateTimeFormatOptions = isCurrentYear
        ? { month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

      const dateString = date.toLocaleDateString(undefined, formatOptions);
      return `${dateString}, ${time}`;
    }
  };

  const isMessageFromCurrentUser = (message: ChatMessage): boolean => {
    if (!connection || !user?.id) return false;

    if (message.message_type) {
      return message.message_type === 'sent';
    }

    const isCurrentUserInitiator = user.id === connection.initiator_id;

    if (isCurrentUserInitiator) {
      return message.is_sent === true;
    } else {
      return message.is_sent === false;
    }
  };

  const getOtherUserInfo = () => {
    if (!connection || !user?.id) return null;

    const isCurrentUserInitiator = user.id === connection.initiator_id;
    if (isCurrentUserInitiator) {
      return {
        name: connection.cleaner_full_name || 'Cleaner',
        picture: connection.cleaner_profile_picture,
        online: connection.cleaner_online,
        phone: connection.cleaner_phone
      };
    } else {
      return {
        name: connection.initiator_full_name || 'Host',
        picture: null,
        online: connection.host_online,
        phone: connection.host_phone
      };
    }
  };

  const handlePhonePress = () => {
    console.log("other user phone number:", selectedUser?.partner?.phone_number);
    if (user?.phone) {
      const phoneUrl = `tel:${selectedUser?.partner?.phone_number}`;
      Linking.openURL(phoneUrl).catch(err => {
        console.error('Error opening phone app:', err);
        Alert.alert('Error', 'Could not open phone app');
      });
    } else {
      Alert.alert('Phone Number', 'Phone number not available');
    }
  };

  const handleImagePress = (imageUri: string) => {
    setFullScreenImage(imageUri);
  };

  const renderMessage = ({ item }: { item: ChatMessage }): React.ReactElement => {
    const isCurrentUser = isMessageFromCurrentUser(item);
    const otherUser = getOtherUserInfo();

    const renderTicks = () => {
      if (!isCurrentUser || item.message_type !== 'sent') return null;

      if (!item.is_sent) {
        return <Feather name="check" size={14} color="#808080" />;
      } else if (item.is_sent && !item.is_read) {
        return (
          <View className="flex-row ml-1">
            <Feather name="check" size={14} color="#808080" />
            <Feather name="check" size={14} color="#808080" style={{ marginLeft: -6 }} />
          </View>
        );
      } else if (item.is_sent && item.is_read) {
        return (
          <View className="flex-row ml-1">
            <Feather name="check" size={14} color="#0084ff" />
            <Feather name="check" size={14} color="#0084ff" style={{ marginLeft: -6 }} />
          </View>
        );
      }
      return null;
    };

    // Debug logging for images
    console.log('Message item:', {
      id: item.id,
      message: item.message,
      hasImages: !!item.images,
      imagesLength: item.images?.length,
      images: item.images
    });

    return (
      <View className="mb-4 px-2">
        <View 
          className={`flex-row items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isCurrentUser && (
            <View className="mr-2 mb-1">
              <Image
                source={getImageSource(
                  selectedUser?.profile_picture || otherUser?.picture
                )}
                className="w-8 h-8 rounded-full"
                onError={(error) => console.log('Profile image error:', error.nativeEvent.error)}
              />
            </View>
          )}

          <View 
  className={`max-w-xs rounded-2xl ${
    item.message ? 'p-3' : 'p-1'
  } ${
    item.message ? (isCurrentUser ? 'bg-indigo-500' : 'bg-gray-200') : 'bg-transparent'
  }`}
  style={{ maxWidth: '75%' }}
>
            {/* Fixed Image Rendering for Object Structure */}
            {item.images && item.images.length > 0 && (
              <View className="mb-2">
                {item.images.map((imageObj: any, index: number) => {
                  const imageUrl = extractImageUri(imageObj);
                  
                  console.log('Rendering image object:', {
                    imageObj,
                    extractedUrl: imageUrl,
                    filename: imageObj?.filename
                  });
                  
                  // Skip if no valid URL
                  if (!imageUrl) {
                    console.warn('Skipping invalid image object:', imageObj);
                    return null;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={`msg_${item.id}_img_${imageObj.id || index}`}
                      onPress={() => handleImagePress(imageUrl)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-20 h-20 rounded-lg mb-1"
                        resizeMode="cover"
                        onLoad={() => console.log('Image loaded:', imageUrl)}
                        onError={(error) => {
                          console.log('Image load error:', {
                            error: error.nativeEvent.error,
                            url: imageUrl,
                            filename: imageObj?.filename
                          });
                        }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Text Message */}
            {item.message && (
              <Text className={`${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                {item.message}
              </Text>
            )}

            {/* Debug: Show if no content */}
            {!item.message && (!item.images || item.images.length === 0) && (
              <Text className={`${isCurrentUser ? 'text-white' : 'text-gray-800'} italic`}>
                [No content]
              </Text>
            )}
          </View>
        </View>

        <View 
          className={`flex-row items-center mt-1 ${
            isCurrentUser ? 'justify-end pr-2' : 'justify-start pl-10'
          }`}
        >
          <Text className="text-xs text-gray-500">{formatTime(item.timestamp)}</Text>
          {renderTicks()}
        </View>
      </View>
    );
  };

  const renderSelectedImage = ({ item }: { item: SelectedImage }) => (
    <View className="relative mr-2 mt-2">
      <Image
        source={{ uri: item.uri }}
        className="w-16 h-16 rounded-lg"
        resizeMode="cover"
      />
      <TouchableOpacity
        className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
        onPress={() => removeSelectedImage(item.id)}
      >
        <Ionicons name="close" size={12} color="white" />
      </TouchableOpacity>
    </View>
  );

  // Show error state if connectionId is invalid
  if (!connectionId || isNaN(connectionId)) {
    return (
      <SafeAreaView className="flex-1 bg-white mt-10">
        <ChatRoomHeader 
          user={{
            name: 'Chat Error',
            ...params
          }} 
          onPhonePress={handlePhonePress}
        />
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="warning-outline" size={64} color="#ef4444" />
          <Text className="text-red-500 text-lg font-semibold mt-4 text-center">
            Invalid Connection
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Connection ID is missing or invalid. Please navigate back and try again.
          </Text>
          <Text className="text-gray-400 text-sm mt-4 text-center">
            Debug Info: connectionId = {String(connectionId)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ChatRoomSkeleton/>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ChatRoomHeader 
        user={{
          name: selectedUser?.username || connection?.cleaner_full_name || connection?.initiator_full_name || 'Chat',
          profile_picture: selectedUser?.profile_picture || getOtherUserInfo()?.picture,
          ...params
        }} 
        connection={connection}
        onPhonePress={handlePhonePress}
      />

      {/* Message List */}
      <View className="flex-1 p-2">
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No messages yet. Start the conversation!</Text>
            {connection && (
              <Text className="text-gray-400 text-sm mt-2">
                Connected with: {getOtherUserInfo()?.name}
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            onScrollBeginDrag={() => {
              // Prevent any focus changes during scroll
            }}
          />
        )}
      </View>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <View className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <FlatList
            data={selectedImages}
            renderItem={renderSelectedImage}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Message Input */}
      <View className="border-t border-gray-200 bg-white">
        <View className="flex-row items-center p-3">
          <TouchableOpacity
            className="p-2 mr-2"
            onPress={pickMultipleImages}
            disabled={sending}
            activeOpacity={0.7}
          >
            <ImagePlus size={24} color={sending ? "#9ca3af" : "#6366f1"} />
          </TouchableOpacity>


          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-4 mr-2"
            placeholder="Type a message..."
            ref={inputRef}
            value={messageText}
            onChangeText={setMessageText}
            editable={!sending}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
            returnKeyType="default"
            enablesReturnKeyAutomatically={false}
            autoCorrect={true}
            spellCheck={true}
            onFocus={() => {
              console.log('Input focused');
              setInputFocused(true);
            }}
            onBlur={() => {
              console.log('Input blurred');
              setInputFocused(false);
            }}
            textContentType="none"
            autoComplete="off"
            selection={undefined}
          />

          <TouchableOpacity
            className={`p-3 rounded-full ${
              sending ? 'bg-gray-400' : 
              (messageText.trim() || selectedImages.length > 0) ? 'bg-indigo-500' : 'bg-gray-300'
            }`}
            onPress={sendMessage}
            disabled={sendingRef.current || !connectionId || (!messageText.trim() && selectedImages.length === 0)}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={0}
          >
            {sending ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <SendHorizonal size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Screen Image Modal */}
      <FullScreenImageModal
        visible={!!fullScreenImage}
        imageUri={fullScreenImage || ''}
        onClose={() => setFullScreenImage(null)}
      />
      <CustomAlert
        visible={showAlert1}
        type="danger"
        title="Error"
        message={error || "An error occurred while processing your request."}
        onCancel={() => setShowAlert1(false)}
        onConfirm={() => setShowAlert1(false)}
      />

      <CustomAlert
        visible={showAlert2}
        type="danger"
        title="Error"
        message="An unknown error occurred"
        onCancel={() => setShowAlert2(false)}
        onConfirm={() => setShowAlert2(false)}
      />
    </SafeAreaView>
  );
};

export default ChatRoom;