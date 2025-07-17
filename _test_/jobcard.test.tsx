import { JobCard } from '@/components/JobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// ✅ Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
// mock react-native-safe-area-context to prevent displayName error with css-interop
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  const MockSafeAreaView = ({ children }: any) => <>{children}</>;
  MockSafeAreaView.displayName = 'SafeAreaView';

  const MockSafeAreaProvider = ({ children }: any) => <>{children}</>;
  MockSafeAreaProvider.displayName = 'SafeAreaProvider';

  return {
    SafeAreaView: MockSafeAreaView,
    SafeAreaProvider: MockSafeAreaProvider,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 375, height: 812 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    },
  };
});


// ✅ Mock job store and fix variable name
const mockSetSelectedJob = jest.fn();

jest.mock('@/store/jobStore', () => ({
  __esModule: true,
  default: {
    getState: () => ({
      setSelectedJob: mockSetSelectedJob,
    }),
  },
}));

// ✅ Mock router
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// ✅ Mock react-native-safe-area-context to fix displayName crash
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaView: ({ children }: any) => children,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    },
  };
});

// ✅ Test data
const job = {
  id: 'job-1',
  title: 'Test Job',
  property_detail: {
    title: 'Test Property',
    main_image: 'https://example.com/image.jpg',
  },
  status: 'scheduled',
  start_time: '2025-07-11T14:00:00Z',
  end_time: '2025-07-11T16:00:00Z',
  dueTime: 'Tomorrow',
  propertyAddress: '123 Test St',
  price: 100,
  assignedTo: 'John Doe',
  date: '2025-07-11',
  description: 'This is a test job description',
};

describe('JobCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to host route when user_role is host', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('host');

    const { getByText } = render(<JobCard job={job} onDelete={jest.fn()} />);
    fireEvent.press(getByText('Details'));

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_role');
      expect(mockSetSelectedJob).toHaveBeenCalledWith(job);
    expect(mockPush).toHaveBeenCalledWith({
  pathname: '/(helper)/jobdetailshost',
});

    });
  });

  it('navigates to helper route when user_role is not host', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('helper');

    const { getByText } = render(<JobCard job={job} onDelete={jest.fn()} />);
    fireEvent.press(getByText('Details'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(helper)/jobdetails',
      });
    });
  });

  it('handles error in AsyncStorage and navigates to helper route', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('fail'));

    const { getByText } = render(<JobCard job={job} onDelete={jest.fn()} />);
    fireEvent.press(getByText('Details'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(helper)/jobdetails',
      });
    });
  });

  it('renders image with correct uri', () => {
    const { getByTestId } = render(<JobCard job={job} onDelete={jest.fn()} />);
    const image = getByTestId('job-image');
    expect(image.props.source.uri).toBe(job.property_detail.main_image);
  });
});
