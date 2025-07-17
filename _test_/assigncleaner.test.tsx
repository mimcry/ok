// _test_/assignCleaner.test.tsx
import { myConnections } from '@/api/myConections';
import AssignCleanerScreen from '@/app/(root_cleaner)/(tabs)/AssignCleanerScreen';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from '@/store/jobStore';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('@/api/myConections');
jest.mock('@/store/jobStore');
jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(), router: { push: jest.fn() } }));
jest.mock('@/hooks/toastNotification');

describe('AssignCleanerScreen', () => {
  // Mock shape matching component's expected API
  const mockConnections = [
    {
      id: 1,
      userId: '1',
      username: 'ignored',
      partner: {
        id: 1,
        full_name: 'Alice',
        profile_picture: null,
        first_name: 'Alice',
        last_name: 'A',
        email: '',
        phone_number: '',
        address_line: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        date_joined: new Date().toISOString(),
        bio: '',
        speciality: 'Deep Clean',
        average_rating: 4.5,
        ratings: [],
        total_assigned: 2,
        completed_jobs: 2,
        scheduled_jobs: 1,
        in_progress_jobs: 0,
        overdue_jobs: 0,
      },
    },
    {
      id: 2,
      userId: '2',
      username: 'ignored2',
      partner: {
        id: 2,
        full_name: 'Bob',
        profile_picture: null,
        first_name: 'Bob',
        last_name: 'B',
        email: '',
        phone_number: '',
        address_line: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        date_joined: new Date().toISOString(),
        bio: '',
        speciality: 'Regular',
        average_rating: 3.0,
        ratings: [],
        total_assigned: 5,
        completed_jobs: 5,
        scheduled_jobs: 2,
        in_progress_jobs: 1,
        overdue_jobs: 0,
      },
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (usePropertyStore as jest.Mock).mockReturnValue({ selectedProperty: { id: '100', name: 'Test Property' } });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ propertyId: '100', propertyName: 'Test Property' });
    (useAppToast as jest.Mock).mockReturnValue({ success: jest.fn(), error: jest.fn() });
  });

  it('renders list of cleaners after fetch', async () => {
    (myConnections as jest.Mock).mockResolvedValue({ success: true, data: mockConnections });

    render(
      <SafeAreaProvider>
        <AssignCleanerScreen />
      </SafeAreaProvider>
    );

    // find text using partner.full_name
    expect(await screen.findByText('Alice')).toBeTruthy();
    expect(await screen.findByText('Bob')).toBeTruthy();
  });

  it('filters cleaners based on search query', async () => {
    (myConnections as jest.Mock).mockResolvedValue({ success: true, data: mockConnections });
    render(
      <SafeAreaProvider>
        <AssignCleanerScreen />
      </SafeAreaProvider>
    );

    await screen.findByText('Alice');
    fireEvent.changeText(screen.getByPlaceholderText('Search by name or specialty'), 'Bob');
    expect(screen.queryByText('Alice')).toBeNull();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('shows empty state when no cleaners match search', async () => {
    (myConnections as jest.Mock).mockResolvedValue({ success: true, data: mockConnections });
    render(
      <SafeAreaProvider>
        <AssignCleanerScreen />
      </SafeAreaProvider>
    );

    await screen.findByText('Alice');
    fireEvent.changeText(screen.getByPlaceholderText('Search by name or specialty'), 'Charlie');
    expect(screen.getByText('No cleaners match your search')).toBeTruthy();
    expect(screen.getByText('Clear search')).toBeTruthy();
  });
});
