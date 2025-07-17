import { Property, PropertyCard } from '@/components/PropertyCard';
import usePropertyStore from '@/store/jobStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock usePropertyStore
jest.mock('@/store/jobStore', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(() => ({
      setSelectedProperty: jest.fn(),
    })),
  },
}));

const mockProperty: Property = {
  connection_id: null,
  id: 1,
  name: 'Test Property',
  address: '123 Test St',
  city: 'Testville',
  zip_code: '12345',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  description: 'A nice test property',
  bedrooms: 3,
  bathrooms: 2,
  property_type: 'Apartment',
  area: 1200,
  base_price: 1500,
  main_image: 'https://example.com/main.jpg',
  cleaner: null,
  host: 42,
  state: 'TestState',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with property data and role is host', async () => {
    // AsyncStorage returns 'host' role
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('host');

    const { getByText, queryByText, findByText } = render(
      <PropertyCard property={mockProperty} onSelect={jest.fn()} />
    );

    // Wait for useEffect role setting
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_role'));

    expect(getByText('Test Property')).toBeTruthy();
    expect(getByText(/123 Test St, Testville, TestState, 12345/)).toBeTruthy();
    expect(getByText('3 Beds')).toBeTruthy();
    expect(getByText('2 Baths')).toBeTruthy();
    expect(getByText('1200 sqft')).toBeTruthy();
    expect(getByText('A nice test property')).toBeTruthy();

    // 'Assign Cleaner' button shown for host role and host present
    expect(getByText('Assign Cleaner')).toBeTruthy();

    // 'Create Job' button also shown
    expect(getByText('Create Job')).toBeTruthy();
  });

  it('does not show "Assign Cleaner" button for cleaner role', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('cleaner');

    const { queryByText } = render(
      <PropertyCard property={mockProperty} onSelect={jest.fn()} />
    );

    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    // No assign cleaner button for cleaner role
    expect(queryByText('Assign Cleaner')).toBeNull();

    // Create job button still shown if connection_id is null
    expect(queryByText('Create Job')).toBeTruthy();
  });

  it('does not show "Create Job" button if cleaner role and connection_id not null', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('cleaner');

    const propWithConnection: Property = {
      ...mockProperty,
      connection_id: 123,
    };

    const { queryByText } = render(
      <PropertyCard property={propWithConnection} onSelect={jest.fn()} />
    );

    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    expect(queryByText('Create Job')).toBeNull();
  });

  it('pressing "Assign Cleaner" button calls setSelectedProperty and navigates', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('host');

    const setSelectedProperty = jest.fn();
    (usePropertyStore.getState as jest.Mock).mockReturnValue({
      setSelectedProperty,
    });

    const { getByText } = render(
      <PropertyCard property={mockProperty} onSelect={jest.fn()} />
    );

    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    fireEvent.press(getByText('Assign Cleaner'));

    expect(setSelectedProperty).toHaveBeenCalledWith(mockProperty);
    expect(router.push).toHaveBeenCalledWith('/(helper)/assigncleaner');
  });

  it('pressing "Create Job" button calls onSelect with property', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('host');

    const onSelect = jest.fn();

    const { getByText } = render(
      <PropertyCard property={mockProperty} onSelect={onSelect} />
    );

    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());

    fireEvent.press(getByText('Create Job'));

    expect(onSelect).toHaveBeenCalledWith(mockProperty);
  });
});
