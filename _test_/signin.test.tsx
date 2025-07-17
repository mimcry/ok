// __tests__/signin.test.tsx
import { authenticateUser } from '@/api/auth';
import { fetchUserDetails } from '@/api/userdetails';
import SignInScreen from '@/app/(auth)/signin';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
jest.mock('expo-auth-session/providers/google', () => ({
  useIdTokenAuthRequest: () => [null, null, jest.fn()],
}));

// Mock auth API
jest.mock('@/api/auth', () => ({
  authenticateUser: jest.fn(),
  authenticateWithGoogle: jest.fn(),
}));
// Mock user details fetch
jest.mock('@/api/userdetails', () => ({
  fetchUserDetails: jest.fn(),
}));

// Mock Zustand store with selector support
const mockSetAuth = jest.fn();
jest.mock('@/context/userAuthStore', () => ({
  useAuthStore: jest.fn((selector) => {
    // Zustand selector pattern: call selector with state object
    if (typeof selector === 'function') {
      return selector({ setAuth: mockSetAuth });
    }
    return { setAuth: mockSetAuth };
  }),
}));

// Mock toast
const mockToast = { success: jest.fn(), error: jest.fn(), warning: jest.fn() };
jest.mock('@/hooks/toastNotification', () => ({ useAppToast: () => mockToast }));

// Mock router
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs and buttons', () => {
    const { getByTestId, getByText } = render(<SignInScreen />);
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText, queryByText } = render(<SignInScreen />);
    // Initially no error
    expect(queryByText('Email is required')).toBeNull();
    expect(queryByText('Password is required')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Sign In'));
    });

    // After press, errors should appear under inputs
    expect(queryByText('Email is required')).toBeTruthy();
    expect(queryByText('Password is required')).toBeTruthy();
  });

  it('attempts login and navigates on success', async () => {
    // Mock successful login
    (authenticateUser as jest.Mock).mockResolvedValueOnce({
      success: true,
      user: { id: '1', role: 'host' },
      token: 'ABC',
    });
    // Mock successful details fetch
    (fetchUserDetails as jest.Mock).mockResolvedValueOnce({
      success: true,
      user: { id: '1', role: 'host', name: 'Test' },
    });

    const { getByTestId, getByText } = render(<SignInScreen />);
    await act(async () => {
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
    });

    await act(async () => {
      fireEvent.press(getByText('Sign In'));
    });

    await waitFor(() => {
      expect(authenticateUser).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(mockSetAuth).toHaveBeenNthCalledWith(1, 'ABC', { id: '1', role: 'host' });
      expect(mockSetAuth).toHaveBeenNthCalledWith(2, 'ABC', { id: '1', role: 'host', name: 'Test' });
      expect(mockToast.success).toHaveBeenCalledWith('Login successful!');
      expect(router.replace).toHaveBeenCalledWith('/(root_host)/(tabs)');
    });
  });

  it('handles login failure', async () => {
    (authenticateUser as jest.Mock).mockResolvedValueOnce({ success: false, error: 'Bad credentials' });

    const { getByTestId, getByText } = render(<SignInScreen />);
    await act(async () => {
      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
    });

    await act(async () => {
      fireEvent.press(getByText('Sign In'));
    });

    await waitFor(() => {
      expect(authenticateUser).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith('Bad credentials');
      expect(mockSetAuth).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  it('handles exception during login', async () => {
    (authenticateUser as jest.Mock).mockRejectedValueOnce(new Error('Network'));

    const { getByTestId, getByText } = render(<SignInScreen />);
    await act(async () => {
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password');
    });

    await act(async () => {
      fireEvent.press(getByText('Sign In'));
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Something went wrong. Please try again later.');
      expect(mockSetAuth).not.toHaveBeenCalled();
    });
  });
});
