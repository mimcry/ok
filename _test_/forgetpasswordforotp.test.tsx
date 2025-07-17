// _test_/forgetpasswordforotp.test.tsx
import ForgotPasswordScreen from '@/app/(auth)/forgetpassword';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// --- Mocks ---
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn() },
}));

const mockRequestOTP = jest.fn();
jest.mock('@/api/forgetpassword', () => ({
  userApi: { requestPasswordResetOTP: (...args: any[]) => mockRequestOTP(...args) },
}));

jest.mock('@/hooks/customAlert', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => {
    if (!props.visible) return null;
    return <Text testID="custom-alert">{props.title}: {props.message}</Text>;
  };
});

describe('ForgotPasswordScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders input and buttons', () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Request Reset Code')).toBeTruthy();
    expect(getByText('Back to Login')).toBeTruthy();
  });

  it('shows warning when email is empty', async () => {
    const { getByText, getByTestId } = render(<ForgotPasswordScreen />);
    await act(async () => {
      fireEvent.press(getByText('Request Reset Code'));
    });
    await waitFor(() => {
      expect(getByTestId('custom-alert').props.children).toContain('Missing Email');
    });
  });

  it('shows warning when email is invalid', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<ForgotPasswordScreen />);
    const emailInput = getByPlaceholderText('Email');
    const submitButton = getByText('Request Reset Code');

    // Update email first
    await act(async () => {
      fireEvent.changeText(emailInput, 'not-an-email');
    });
    // Then submit
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(getByTestId('custom-alert').props.children).toContain('Invalid Email');
    });
  });

  it('navigates to OTP screen on successful API call', async () => {
    mockRequestOTP.mockResolvedValueOnce({ success: true });
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    const emailInput = getByPlaceholderText('Email');
    const submitButton = getByText('Request Reset Code');

    // Input valid email
    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });
    // Press submit
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockRequestOTP).toHaveBeenCalledWith('test@example.com');
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/(auth)/fogetpasswordotpverification',
        params: { email: 'test@example.com' },
      });
    });
  });

  it('shows error alert on API failure', async () => {
    mockRequestOTP.mockResolvedValueOnce({ success: false, message: 'Server says no' });
    const { getByPlaceholderText, getByText, getByTestId } = render(<ForgotPasswordScreen />);
    const emailInput = getByPlaceholderText('Email');
    const submitButton = getByText('Request Reset Code');

    // Input email
    await act(async () => {
      fireEvent.changeText(emailInput, 'fail@example.com');
    });
    // Press submit
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockRequestOTP).toHaveBeenCalledWith('fail@example.com');
      const alert = getByTestId('custom-alert');
      expect(alert.props.children).toContain('Error');
      expect(alert.props.children).toContain('Server says no');
    });
  });
});
