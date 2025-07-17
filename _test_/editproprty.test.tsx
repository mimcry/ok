import { EditProperty } from '@/components/EditProperty';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

describe('EditProperty Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProperty = {
    id: '123',
    name: 'Test Property',
    address: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    basePrice: '100',
    airbnblink: 'https://airbnb.com/test',
    bedrooms: 2,
    bathrooms: 1,
    area: 50,
    description: 'Nice property',
    instruction: 'No smoking',
    images: ['https://example.com/image1.jpg'],
    type: 'House',
  };

  it('renders modal when visible and shows "New Property" if no property', () => {
    const { getByText } = render(
      <EditProperty visible={true} onClose={mockOnClose} onSave={mockOnSave} property={null} />
    );

    expect(getByText('New Property')).toBeTruthy();
  });

  it('renders modal when visible and shows "Edit Property" if property is provided', () => {
    const { getByText } = render(
      <EditProperty visible={true} onClose={mockOnClose} onSave={mockOnSave} property={defaultProperty} />
    );

    expect(getByText('Edit Property')).toBeTruthy();
    expect(getByText('Update Property')).toBeTruthy();
  });

  it('calls onClose when close button pressed', () => {
    const { getByRole } = render(
      <EditProperty visible={true} onClose={mockOnClose} onSave={mockOnSave} property={null} />
    );

    const closeButton = getByRole('button', { name: /close/i });
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('updates text inputs and calls onSave with correct data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditProperty visible={true} onClose={mockOnClose} onSave={mockOnSave} property={null} />
    );

    const nameInput = getByPlaceholderText('Enter property name');
    fireEvent.changeText(nameInput, 'My New Property');

    const addressInput = getByPlaceholderText('Enter property address');
    fireEvent.changeText(addressInput, '456 New Address');

    const saveButton = getByText('Create Property');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const savedArg = mockOnSave.mock.calls[0][0];
      expect(savedArg.name).toBe('My New Property');
      expect(savedArg.address).toBe('456 New Address');
    });
  });

  it('shows alert when required fields are missing', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(
      <EditProperty visible={true} onClose={mockOnClose} onSave={mockOnSave} property={null} />
    );

    const saveButton = getByText('Create Property');
    fireEvent.press(saveButton);

    expect(alertSpy).toHaveBeenCalledWith('Validation Error', 'Property name and address are required');
    alertSpy.mockRestore();
  });

  it('calls image picker when add photo pressed', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://image.jpg' }],
    });

    const { getByTestId } = render(
      <EditProperty visible={true} onClose={mockOnClose} onSave={mockOnSave} property={null} />
    );

    const addPhotoButton = getByTestId('add-photo-button');
    fireEvent.press(addPhotoButton);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });
});
