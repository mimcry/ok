import OTPVerificationScreen from '@/app/(auth)/fogetpasswordotpverification';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({
    email: 'test@example.com',
    purpose: 'password-reset',
  }),
}));

// in forgetpassword.test.tsx
jest.mock('@/api/forgetpassword', () => ({
  userApi: {
    verifyPasswordResetOTP: jest.fn().mockResolvedValue({ success: true }),
  },
}));


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





describe('OTPVerificationScreen Tests', () => {
  // ... your other tests unchanged

it('calls API and navigates when full valid OTP is submitted', async () => {
  const { getAllByTestId, getByText } = render(<OTPVerificationScreen />);
  const inputs = getAllByTestId(/otp-input-/);
  const verifyButton = getByText('Verify Code');

  for (let i = 0; i < 6; i++) {
    fireEvent.changeText(inputs[i], String(i + 1));
  }

await act(async () => {
  fireEvent.press(verifyButton);
  // Optionally wait here for the promise to resolve if you want to test verifying UI visibility
});

  // Wait for navigation call, which implies verification success
  await waitFor(() => {
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/createnewpassword',
      params: {
        email: 'test@example.com',
        code: '123456',
      },
    });
  }, { timeout: 3000 });
});

});
