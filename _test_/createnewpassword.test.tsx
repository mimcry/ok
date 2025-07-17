import { userApi } from '@/api/forgetpassword';
import NewPasswordScreen from '@/app/(auth)/createnewpassword';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

// Mock icons (like @expo/vector-icons) to avoid act warnings
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  // Add other icon sets if used
}));

// Mock expo-router and router navigation
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock your API userApi calls
jest.mock('@/api/forgetpassword', () => ({
  userApi: {
    confirmPasswordReset: jest.fn(),
  },
}));

// Mock your custom alert hook/component
jest.mock('@/hooks/customAlert', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => {
    if (!props.visible) return null;
    return (
      <Text testID="custom-alert">
        {props.title}: {props.message}
      </Text>
    );
  };
});

describe('NewPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      email: 'test@example.com',
      code: '123456',
    });
  });

  it('renders screen inputs and header', () => {
    const { getByPlaceholderText, getAllByText } = render(<NewPasswordScreen />);
    // Use getAllByText if multiple elements have same text
    const headers = getAllByText('Set New Password');
    expect(headers.length).toBeGreaterThan(0);

    expect(getByPlaceholderText('New Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('shows alert when password is weak', async () => {
    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);
    const button = getByTestId('set-new-password-button');

    fireEvent.changeText(getByPlaceholderText('New Password'), 'weak');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'weak');

    await act(async () => {
      fireEvent.press(button);
    });

    const alert = await waitFor(() => getByTestId('custom-alert'));
    expect(alert.props.children.join('')).toMatch(/Weak Password/i);
  });

  it('shows alert when passwords do not match', async () => {
    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);
    const button = getByTestId('set-new-password-button');

    fireEvent.changeText(getByPlaceholderText('New Password'), 'StrongPass1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Mismatch1');

    await act(async () => {
      fireEvent.press(button);
    });

    const alert = await waitFor(() => getByTestId('custom-alert'));
    expect(alert.props.children.join('')).toMatch(/Passwords Do Not Match/i);
  });

  it('calls API and navigates on successful reset', async () => {
    (userApi.confirmPasswordReset as jest.Mock).mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);
    const button = getByTestId('set-new-password-button');

    fireEvent.changeText(getByPlaceholderText('New Password'), 'ValidPass1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'ValidPass1');

    await act(async () => {
      fireEvent.press(button);
    });

    await waitFor(() => {
      expect(userApi.confirmPasswordReset).toHaveBeenCalledWith('ValidPass1');
      expect(router.replace).toHaveBeenCalledWith('/(auth)/signin');
    }, { timeout: 3000 });
  });

  it('shows error alert when API call returns failure', async () => {
    (userApi.confirmPasswordReset as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Reset failed',
    });

    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);
    const button = getByTestId('set-new-password-button');

    fireEvent.changeText(getByPlaceholderText('New Password'), 'ValidPass1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'ValidPass1');

    await act(async () => {
      fireEvent.press(button);
    });

    const alert = await waitFor(() => getByTestId('custom-alert'));
    expect(alert.props.children.join('')).toMatch(/Reset failed/i);
  });

  it('shows error alert on unexpected error', async () => {
    (userApi.confirmPasswordReset as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);
    const button = getByTestId('set-new-password-button');

    fireEvent.changeText(getByPlaceholderText('New Password'), 'ValidPass1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'ValidPass1');

    await act(async () => {
      fireEvent.press(button);
    });

    const alert = await waitFor(() => getByTestId('custom-alert'));
    expect(alert.props.children.join('')).toMatch(/Something went wrong/i);
  });
});
