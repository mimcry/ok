// _test_/chat.test.tsx

import Chat from '@/app/(root_cleaner)/(tabs)/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('lucide-react-native', () => ({
  Search: () => null,
  MoreVertical: () => null,
  CheckCheck: () => null,
  MessageCircle: () => null,
  MessageCircleMore: () => null,
}));

jest.mock('@/components/ChatListSkeleton', () => ({
  ChatListItemSkeletonAnimated: () => null,
}));

jest.mock('@/api/myConections', () => ({ myConnections: jest.fn() }));
jest.mock('@/api/chatApi', () => ({
  chatApiService: { fetchMessages: jest.fn() },
}));
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@/context/userAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: 1 } }),
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

import { chatApiService } from '@/api/chatApi';
import { myConnections } from '@/api/myConections';

const myConnectionsMock = myConnections as jest.MockedFunction<typeof myConnections>;
const fetchMessagesMock = chatApiService.fetchMessages as jest.MockedFunction<typeof chatApiService.fetchMessages>;

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('helper');
});

const renderChat = () =>
  render(
    <SafeAreaProvider>
      <Chat />
    </SafeAreaProvider>
  );

describe('Chat Screen', () => {
  it('displays chat list after fetching', async () => {
    myConnectionsMock.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 1,
          userId: 'u1',
          username: 'johndoe',
          partner: { full_name: 'John Doe', profile_picture: null },
          isOnline: true,
        },
      ],
    });

    fetchMessagesMock.mockResolvedValueOnce({
      messages: [
        {
          message: 'Hello there!',
          timestamp: new Date().toISOString(),
          is_read: false,
          message_type: 'received',
          is_sent: false,
          images: [],
        },
      ],
      connection: { initiator_id: 2 },
    });

    renderChat();

    expect(await screen.findByText('John Doe')).toBeTruthy();
    expect(await screen.findByText('Hello there!')).toBeTruthy();
    expect(await screen.findByPlaceholderText('Search conversations')).toBeTruthy();
  });

  it('filters chats by search query', async () => {
    myConnectionsMock.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 2,
          userId: 'u2',
          username: 'janedoe',
          partner: { full_name: 'Jane Doe', profile_picture: null },
          isOnline: false,
        },
      ],
    });

    fetchMessagesMock.mockResolvedValueOnce({
      messages: [
        {
          message: 'Hi Jane!',
          timestamp: new Date().toISOString(),
          is_read: true,
          message_type: 'received',
          is_sent: false,
          images: [],
        },
      ],
      connection: { initiator_id: 2 },
    });

    renderChat();

    const input = await screen.findByPlaceholderText('Search conversations');
    fireEvent.changeText(input, 'Jane');

    expect(await screen.findByText('Jane Doe')).toBeTruthy();
    expect(await screen.findByText('Hi Jane!')).toBeTruthy();
  });

  it('shows error message when fetch fails', async () => {
    myConnectionsMock.mockRejectedValueOnce(new Error('Fetch failed'));

    renderChat();

    expect(await screen.findByText('Try Again')).toBeTruthy();
    expect(screen.getByText('Fetch failed')).toBeTruthy();
  });

  it('shows empty state when no connections', async () => {
    myConnectionsMock.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    renderChat();

    expect(await screen.findByText('Find Cleaners')).toBeTruthy();
    expect(screen.getByText('No Connections')).toBeTruthy();
  });
});
