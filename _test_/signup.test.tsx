import SignUp from '@/app/(auth)/signup';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// ✅ Mock router.push to avoid isReady crash
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

// ✅ Mock toast methods used in component
jest.mock('@/hooks/toastNotification', () => ({
  useAppToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    normal: jest.fn(),
  }),
}));

describe('SignUp Screen', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('renders all inputs and submit button', () => {
    const { getByTestId } = render(<SignUp />);
    expect(getByTestId('first-name-input')).toBeTruthy();
    expect(getByTestId('last-name-input')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('phone-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('confirm-password-input')).toBeTruthy();
    expect(getByTestId('create-account-button')).toBeTruthy();
  });

  it('shows validation errors on empty submission', async () => {
    const { getByTestId, getByText } = render(<SignUp />);
    
    await act(async () => {
      fireEvent.press(getByTestId('create-account-button'));
    });

    expect(getByText('First name is required')).toBeTruthy();
    expect(getByText('Last name is required')).toBeTruthy();
    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Phone number is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
    expect(getByText('Confirm password is required')).toBeTruthy();
  });

  it('submits form and handles successful registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    const { getByTestId } = render(<SignUp />);

    fireEvent.changeText(getByTestId('first-name-input'), 'John');
    fireEvent.changeText(getByTestId('last-name-input'), 'Doe');
    fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('phone-input'), '1234567890');
    fireEvent.changeText(getByTestId('password-input'), 'Password1');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'Password1');

    await act(async () => {
      fireEvent.press(getByTestId('create-account-button'));
    });

    // Optional: assert router.push or toast.success was called
  });
});
