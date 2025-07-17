import { DisplayJobCard } from '@/components/DisplayJobCard';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// ✅ Fix: Define the mock *inside* the jest.mock factory
jest.mock('@/utils/DateUtils', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    DateFormatter: ({ date, format }: any) => (
      <Text testID="date-formatter">{`Formatted: ${date} (${format})`}</Text>
    ),
  };
});

// ✅ Mock the router separately
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('DisplayJobCard', () => {
  const mockJob = {
    id: '1',
    name: 'Test Job',
    address: '123 Main St, Test City',
    date: '2025-07-20',
    dueTime: '3:00 PM',
    price: 150,
    description: 'Clean the property.',
    imageUrl: ['https://example.com/image.jpg'],
    status: 'scheduled',
    end_time: '17:00',
    start_time: '14:00',
    property: {
      instruction: 'Leave keys in lockbox.',
    },
  };

  it('renders job information correctly', () => {
    const { getByText, getByTestId } = render(<DisplayJobCard item={mockJob} />);

    expect(getByText('Test Job')).toBeTruthy();
    expect(getByText('Scheduled')).toBeTruthy();
    expect(getByText('123 Main St, Test City')).toBeTruthy();
    expect(getByText('Due 3:00 PM')).toBeTruthy();
    expect(getByText('View Details')).toBeTruthy();
    expect(getByTestId('date-formatter')).toBeTruthy();
  });

  it('navigates to job details screen with correct params', () => {
    const { getByText } = render(<DisplayJobCard item={mockJob} />);
    fireEvent.press(getByText('View Details'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(helper)/jobdetails',
      params: {
        id: '1',
        name: 'Test Job',
        date: '2025-07-20',
        imageUrl: JSON.stringify(mockJob.imageUrl),
        address: '123 Main St, Test City',
        dueTime: '3:00 PM',
        price: 150,
        description: 'Clean the property.',
        status: 'scheduled',
        instruction: 'Leave keys in lockbox.',
        end_time: '17:00',
        start_time: '14:00',
      },
    });
  });
});
