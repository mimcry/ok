import { FormModal } from '@/components/FormModel';
import { Ionicons } from '@expo/vector-icons';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('FormModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const formContent = <Text testID="form-content">This is a form</Text>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and form content when visible', () => {
    const { getByText, getByTestId } = render(
      <FormModal
        visible={true}
        onClose={mockOnClose}
        title="Test Modal"
        formComponent={formContent}
      />
    );

    expect(getByText('Test Modal')).toBeTruthy();
    expect(getByTestId('form-content')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <FormModal
        visible={false}
        onClose={mockOnClose}
        title="Hidden Modal"
        formComponent={formContent}
      />
    );

    expect(queryByText('Hidden Modal')).toBeNull();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByRole } = render(
      <FormModal
        visible={true}
        onClose={mockOnClose}
        title="Closable Modal"
        formComponent={formContent}
      />
    );

    const closeButton = getByRole('button'); // only one TouchableOpacity here
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSubmit when submit button is pressed', () => {
    const { getByText } = render(
      <FormModal
        visible={true}
        onClose={mockOnClose}
        title="Submit Modal"
        formComponent={formContent}
        onSubmit={mockOnSubmit}
        submitButtonText="Save"
        submitIcon={<Ionicons name="checkmark" size={20} color="white" />}
      />
    );

    const submitButton = getByText('Save');
    fireEvent.press(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('does not render submit button when `button` prop is true', () => {
    const { queryByText } = render(
      <FormModal
        visible={true}
        onClose={mockOnClose}
        title="No Submit"
        formComponent={formContent}
        onSubmit={mockOnSubmit}
        submitButtonText="Submit"
        button={true}
      />
    );

    expect(queryByText('Submit')).toBeNull();
  });
});
