
// __tests__/resetPasswordConfirm.test.tsx
import { userApi } from '@/api/forgetpassword';
import ResetPasswordConfirm from '@/app/(auth)/resetpasswordconfirm';
import { useAppToast } from '@/hooks/toastNotification';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/toastNotification', () => ({
  useAppToast: jest.fn(),
}));

jest.mock('@/api/forgetpassword', () => ({
  userApi: { confirmPasswordReset: jest.fn() },
}));

describe('ResetPasswordConfirm', () => {
  const mockToast = { success: jest.fn(), warning: jest.fn(), error: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ email: 'test@example.com', code: '123456' });
    (useAppToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('renders inputs and button', () => {
    const { getByPlaceholderText, getByText } = render(<ResetPasswordConfirm />);
    expect(getByPlaceholderText('New Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Reset Password')).toBeTruthy();
  });

  it('shows warning if password is empty', async () => {
    const { getByText } = render(<ResetPasswordConfirm />);
    fireEvent.press(getByText('Reset Password'));
    await waitFor(() => expect(mockToast.warning).toHaveBeenCalledWith('Please enter a new password'));
  });

  it('shows warning if password too short', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPasswordConfirm />);
    fireEvent.changeText(getByPlaceholderText('New Password'), 'short');
    fireEvent.press(getByText('Reset Password'));
    await waitFor(() => expect(mockToast.warning).toHaveBeenCalledWith('Password must be at least 8 characters'));
  });

  it('shows warning if passwords do not match', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPasswordConfirm />);
    fireEvent.changeText(getByPlaceholderText('New Password'), 'Password1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password2');
    fireEvent.press(getByText('Reset Password'));
    await waitFor(() => expect(mockToast.warning).toHaveBeenCalledWith("Passwords don't match"));
  });

  it('calls API and navigates on success', async () => {
    (userApi.confirmPasswordReset as jest.Mock).mockResolvedValueOnce({ success: true });
    jest.useFakeTimers();

    const { getByPlaceholderText, getByText } = render(<ResetPasswordConfirm />);
    fireEvent.changeText(getByPlaceholderText('New Password'), 'Password1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1');

    await act(async () => {
      fireEvent.press(getByText('Reset Password'));
    });

    await waitFor(() => expect(userApi.confirmPasswordReset).toHaveBeenCalledWith('Password1'));
    expect(mockToast.success).toHaveBeenCalledWith('Password reset successful');

    // advance navigation timeout
    act(() => jest.advanceTimersByTime(1500));
    expect(router.push).toHaveBeenCalledWith('/(auth)/signin');
    jest.useRealTimers();
  });

  it('shows error toast on API failure', async () => {
    (userApi.confirmPasswordReset as jest.Mock).mockResolvedValueOnce({ success: false, message: 'Fail' });
    const { getByPlaceholderText, getByText } = render(<ResetPasswordConfirm />);

    fireEvent.changeText(getByPlaceholderText('New Password'), 'Password1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1');

    await act(async () => {
      fireEvent.press(getByText('Reset Password'));
    });

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('Fail'));
  });

  it('shows error toast on exception', async () => {
    (userApi.confirmPasswordReset as jest.Mock).mockRejectedValueOnce(new Error('Network')); 
    const { getByPlaceholderText, getByText } = render(<ResetPasswordConfirm />);

    fireEvent.changeText(getByPlaceholderText('New Password'), 'Password1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1');

    await act(async () => {
      fireEvent.press(getByText('Reset Password'));
    });

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('Something went wrong. Please try again.'));
  });
});
