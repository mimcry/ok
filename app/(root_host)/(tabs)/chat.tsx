import { CheckCheck, MessageCircleMore, MoreVertical, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { chatApiService } from '@/api/chatApi';
import { myConnections } from '@/api/myConections';
import { ChatListItemSkeletonAnimated } from '@/components/ChatListSkeleton';
import { useAuthStore } from '@/context/userAuthStore';
import useChatStore from '@/store/chatStore';
import { router } from 'expo-router';

interface User {
  userId: string;
  username: string;
  profileImage?: string;
  isOnline: boolean;
}

interface LastMessage {
  text: string;
  timestamp: number;
  isRead: boolean;
  sentByMe: boolean;
  hasImage?: boolean;
}

interface Connection {
  id: any;
  partner: any;
  userId: string;
  username: string;
  profile_picture?: string;
  isOnline: boolean;
  lastMessage: LastMessage | null;
}

interface ChatListItemProps {
  connection: Connection;
}

// Chat list item component
const ChatListItem: React.FC<ChatListItemProps> = ({ connection }) => {
  const user = useAuthStore((state) => state.user);

  // Format timestamp to readable time
  const formatTime = (timestamp: number | string | undefined): string => {
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
      return 'Yesterday';
    } else {
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
  };

  // Get message preview text
  const getMessagePreview = (): string => {
    if (!connection.lastMessage) return "Say hi 💴";

    const { text, sentByMe, hasImage } = connection.lastMessage;
    
    // Handle image messages
    if (hasImage && !text) {
      return sentByMe ? "You sent a photo" : "📷 Photo";
    } else if (hasImage && text) {
      return sentByMe ? `You: 📷 ${text}` : `📷 ${text}`;
    }
    
    // Handle text messages
    if (text) {
      const messageText = text.length > 30 ? `${text.substring(0, 30)}...` : text;
      return sentByMe ? `You: ${messageText}` : messageText;
    }

    return "Say hi 💴";
  };

  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => {
        // Store the complete user data
        setSelectedUser({
                  profile_picture: connection.partner.profile_picture,
        
          ...connection
        });
        
        // Navigate without parameters
        router.push("/(helper)/chatroom");
      }}
    >
      {/* Avatar with online indicator */}
      <View className="relative mr-4">
        <Image
          source={
            connection.partner.profile_picture
              ? { uri: connection.partner.profile_picture }
              : require('@/assets/images/profile.png')
          }
          className="w-14 h-14 rounded-full"
        />
        {connection.isOnline && (
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      {/* Message content */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-semibold text-base text-gray-900">
            {connection.partner.full_name}
          </Text>
          {connection.lastMessage?.timestamp && (
            <Text className="text-xs text-gray-500">
              {formatTime(connection.lastMessage.timestamp)}
            </Text>
          )}
        </View>
        <View className="flex-row justify-between items-center">
          <Text
            className={`text-sm flex-1 mr-2 ${
              connection.lastMessage && !connection.lastMessage.isRead && !connection.lastMessage.sentByMe
                ? 'text-gray-900 font-medium'
                : 'text-gray-600'
            }`}
            numberOfLines={1}
          >
            {getMessagePreview()}
          </Text>

          {/* Read status and unread indicator */}
          <View className="flex-row items-center">
            {/* Show read ticks for sent messages */}
            {connection.lastMessage?.sentByMe && (
              <View className="mr-2">
                {connection.lastMessage.isRead ? (
                  <CheckCheck size={16} color="#0084ff" />
                ) : (
                  <CheckCheck size={16} color="#9ca3af" />
                )}
              </View>
            )}
            
            {/* Unread indicator for received messages */}
            {connection.lastMessage &&
              !connection.lastMessage.isRead &&
              !connection.lastMessage.sentByMe && (
                <View className="h-2 w-2 rounded-full bg-blue-500" />
              )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main chat list screen
const Chat: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const user = useAuthStore((state) => state.user);

  // Function to fetch last message for a connection
  const fetchLastMessageForConnection = async (connectionId: number): Promise<LastMessage | null> => {
    try {
      const response = await chatApiService.fetchMessages(connectionId);
      const messages = response.messages || [];
      
      if (messages.length === 0) {
        return null;
      }

      // Get the latest message
      const lastMessage = messages[messages.length - 1];
      
      // Determine if message was sent by current user
      const sentByMe = lastMessage.message_type === 'sent' || 
                      (response.connection && user?.id === response.connection.initiator_id && lastMessage.is_sent === true) ||
                      (response.connection && user?.id !== response.connection.initiator_id && lastMessage.is_sent === false);

      return {
        text: lastMessage.message || '',
        timestamp: new Date(lastMessage.timestamp).getTime(),
        isRead: lastMessage.is_read || false,
        sentByMe: sentByMe,
        hasImage: lastMessage.images && lastMessage.images.length > 0
      };
    } catch (error) {
      console.error(`Error fetching last message for connection ${connectionId}:`, error);
      return null;
    }
  };

  // Enhanced fetchConnections function that also fetches last messages
  const fetchConnections = useCallback(async (force: boolean = false): Promise<void> => {
    // If not forcing refresh and it's been less than 2 minutes since last fetch, skip
    const now = Date.now();
    if (!force && lastFetchTime > 0 && (now - lastFetchTime < 2 * 60 * 1000)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await myConnections();

      if (response.success && response.data) {
        const connectionsData = response.data || [];
        
        // Fetch last messages for each connection in parallel
        const connectionsWithMessages = await Promise.all(
          connectionsData.map(async (connection: Connection) => {
            const lastMessage = await fetchLastMessageForConnection(connection.id);
            return {
              ...connection,
              lastMessage
            };
          })
        );

        // Sort connections by last message timestamp (most recent first)
        connectionsWithMessages.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || 0;
          const bTime = b.lastMessage?.timestamp || 0;
          return bTime - aTime;
        });

        setConnections(connectionsWithMessages);
        setLastFetchTime(now);
        console.log("Connections with messages fetched:", connectionsWithMessages.length);
      } else {
        setError(response.error || 'Failed to fetch connections');
        console.error('Error fetching connections:', response.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error in fetchConnections:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime, user?.id]);

  // Initial data fetch on component mount
  useEffect(() => {
    if (user?.id) {
      fetchConnections(true);
    }
  }, [user?.id]);

  // Auto-refresh every 30 seconds when app is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchConnections(false); // Don't force, respect the time limit
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchConnections, isLoading]);

  // Filter chats based on search query
  const filteredConnections = searchQuery
    ? connections.filter(connection =>
      connection.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.partner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : connections;

  // Handle manual refresh
  const handleRefresh = () => {
    fetchConnections(true);
  };

  // Count unread messages
  const unreadCount = connections.filter(conn => 
    conn.lastMessage && !conn.lastMessage.isRead && !conn.lastMessage.sentByMe
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold">Messages</Text>
            {unreadCount > 0 && (
              <View className="ml-2 bg-blue-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1">
                <Text className="text-white text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity className="p-2" onPress={handleRefresh}>
            <MoreVertical size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
         {connections.length !=0 &&( <View className="mt-3 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                  <Search size={20} color="#9ca3af" />
                  <TextInput
                    className="ml-2 flex-1 text-base text-gray-800"
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>)}
      </View>

      {/* Loading state - only show full loading indicator on initial load */}
      {isLoading && connections.length === 0 && (
         
   
        <SafeAreaView className="flex-1 bg-white ">
         {Array.from({ length: 3 }).map((_, index) => (
  <ChatListItemSkeletonAnimated key={index} />
))}
        </SafeAreaView>
      
     )}

      {/* Error state */}
      {!isLoading && error && connections.length === 0 && (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => fetchConnections(true)}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat list */}
      <FlatList
        data={filteredConnections}
        keyExtractor={(item) => item.userId || item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <ChatListItem connection={item} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="flex-1 justify-center items-center p-8">
                          <View className="bg-white rounded-xl  p-6 mx-4 w-full max-w-sm justify-center items-center ">
                           <MessageCircleMore size={56} color="#6B7280" />
            
                            <Text className="text-gray-800 text-xl font-semibold text-center my-3">
                              No Connections
                            </Text>
            
                            <Text className="text-gray-500 text-center mb-6 leading-5">
                              You don't have any connections yet. Start by finding cleaners to chat with.
                            </Text>
            
                            <TouchableOpacity
                               onPress={()=>router.push("/(helper)/cleanermarketplace")}
                              className="bg-primary rounded-lg py-3 px-6 w-full"
                              activeOpacity={0.8}
                            >
                              <Text className="text-white text-center font-medium text-base">
                                Find Cleaners
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
          ) : null
        }
        refreshing={isLoading && connections.length > 0}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

export default Chat;