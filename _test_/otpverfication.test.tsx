import OtpVerification from '@/app/(auth)/otpverification';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

// Mock router navigation
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ email: 'test@example.com' }),
}));

// Mock toast
const mockShowToast = jest.fn();
jest.mock('react-native-toast-notifications', () => ({
  useToast: () => ({
    show: mockShowToast,
  }),
}));

// Mock auth token
jest.mock('@/api/userdetails', () => ({
  getAuthToken: () => 'FAKE_CSRF_TOKEN',
}));

// Fake timers for resend test
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('OtpVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls API and navigates on successful OTP verification', async () => {
    const mockPush = require('expo-router').router.push;

    // Mock success fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { getByTestId } = render(<OtpVerification />);

    // Fill all OTP inputs
    for (let i = 0; i < 6; i++) {
      const input = getByTestId(`otp-input-${i}`);
      fireEvent.changeText(input, '1');
    }

    const button = getByTestId('verify-button');
    expect(button.props.accessibilityState?.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(button);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/register/verify/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-CSRFToken': 'FAKE_CSRF_TOKEN',
          }),
          body: JSON.stringify({ code: '111111' }),
        })
      );

      expect(mockShowToast).toHaveBeenCalledWith('Your email has been verified.', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/(auth)/signin');
    });
  });

  it('shows error toast on failed OTP verification', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid OTP' }),
    });

    const { getByTestId } = render(<OtpVerification />);

    // Fill incorrect OTP
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(getByTestId(`otp-input-${i}`), '9');
    }

    const button = getByTestId('verify-button');
    expect(button.props.accessibilityState?.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(button);
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Invalid OTP', expect.any(Object));
    });
  });

  it('resets OTP and shows toast when resend is pressed', async () => {
    const { getByTestId, getByText } = render(<OtpVerification />);

    const resendButton = getByTestId('resend-button');

    await act(async () => {
      fireEvent.press(resendButton);
    });

    expect(getByText('Verifying...')).toBeTruthy(); // Check indicator appears

    // Simulate timeout
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('OTP Sent', expect.any(Object));
    });
  });
});
