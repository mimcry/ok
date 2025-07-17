import { DisplayJobCard } from '@/components/DisplayJobCard';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('DisplayJobCard', () => {
  it('renders without crashing', () => {
    const mockJob = {
      id: '1',
      title: 'Test Job',
      status: 'scheduled',
      name: 'Test Property',
      date: '2025-07-11',
      end_time: '18:00',
      imageUrl: ['https://example.com/image.jpg'],
      property_detail: {
        instruction: 'Test instruction',
      },
    };

    const { getByText } = render(<DisplayJobCard item={mockJob} />);
    expect(getByText('Test Property')).toBeTruthy();
  });
});
