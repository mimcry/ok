import MessageList from '@/components/MessageList';
import { render } from '@testing-library/react-native';

describe('MessageList', () => {
  it('renders nothing when message or currentUser is undefined', () => {
    const { queryByText } = render(<MessageList message={null} currentUser={null} />);
    // Expect no message text to be rendered
    expect(queryByText(/./)).toBeNull();
  });
});
