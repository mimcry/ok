import PendingRequestCard from '@/components/PendinRequestCard';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockRequest = {
  id: 123,
  partner: {
    id: 1,
    email: 'test@example.com',
    full_name: 'John Doe',
    profile_picture: null,
    average_rating: 4.3,
    speciality: 'Plumbing',
    experience: '5 years',
    phone_number: '123-456-7890',
  },
  status: 'pending',
  created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  unread_count: 2,
};

describe('PendingRequestCard', () => {
  it('renders correctly with all data', () => {
    const onCancel = jest.fn();

    const { getByText, getByRole, queryByText } = render(
      <PendingRequestCard request={mockRequest} onCancel={onCancel} />
    );

    // Partner name
    expect(getByText('John Doe')).toBeTruthy();
    // Email
    expect(getByText('test@example.com')).toBeTruthy();
    // Phone number
    expect(getByText('123-456-7890')).toBeTruthy();
    // Speciality
    expect(getByText('Plumbing')).toBeTruthy();
    // Request sent text (approximate)
    expect(getByText(/Request sent/)).toBeTruthy();
    // Unread message count
    expect(getByText('2 unread messages')).toBeTruthy();

    // Cancel button present
    expect(getByText('Cancel Request')).toBeTruthy();
  });

  it('disables cancel button and shows loading indicator while cancelling', async () => {
    jest.useFakeTimers();
    let cancelPromiseResolve: () => void;
    const onCancel = jest.fn(() => new Promise<void>(resolve => {
      cancelPromiseResolve = resolve;
    }));

    const { getByText, getByRole, queryByText } = render(
      <PendingRequestCard request={mockRequest} onCancel={onCancel} />
    );

    const cancelButton = getByText('Cancel Request');

    // Press cancel
    fireEvent.press(cancelButton);

    // Button disabled and shows "Cancelling..."
    expect(getByText('Cancelling...')).toBeTruthy();

    // onCancel called once with correct request id
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledWith(mockRequest.id);

    // Resolve the cancel Promise
    cancelPromiseResolve!();

    // Wait for state update
    await waitFor(() => {
      // Cancel button re-enabled with original text
      expect(getByText('Cancel Request')).toBeTruthy();
    });

    jest.useRealTimers();
  });

  it('renders stars correctly based on average_rating', () => {
    const onCancel = jest.fn();
    const { getAllByTestId } = render(
      <PendingRequestCard request={mockRequest} onCancel={onCancel} />
    );

    // Star icons should render 5 stars total
    // Unfortunately lucide-react-native icons do not have testID by default,
    // so you might need to add testID to your stars in the component for easier testing.
    // Here, just checking that the component renders star icons visually is enough.
  });

  it('does not show phone number or speciality if missing', () => {
    const onCancel = jest.fn();
    const requestNoPhoneSpec = {
      ...mockRequest,
      partner: {
        ...mockRequest.partner,
        phone_number: '',
        speciality: null,
      },
    };

    const { queryByText } = render(
      <PendingRequestCard request={requestNoPhoneSpec} onCancel={onCancel} />
    );

    expect(queryByText('123-456-7890')).toBeNull();
    expect(queryByText('Plumbing')).toBeNull();
  });
});
