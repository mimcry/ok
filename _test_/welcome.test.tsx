import WelcomeScreen from '@/app/(auth)/welcome';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('WelcomeScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all text content correctly', () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText('Find Your Perfect Job')).toBeTruthy();
    expect(getByText(/job opportunities/i)).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
    expect(getByText('I already have an account')).toBeTruthy();
  });

  it('navigates to signup when Get Started is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    fireEvent.press(getByText('Get Started'));
    expect(router.replace).toHaveBeenCalledWith('/(auth)/signup');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it('navigates to signin when "I already have an account" is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    fireEvent.press(getByText('I already have an account'));
    expect(router.replace).toHaveBeenCalledWith('/(auth)/signin');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });
});
