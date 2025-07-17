import PropertyCard from '@/components/CheckListCard';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('PropertyCard', () => {
  const mockItem = {
    name: 'Test Property',
    address: '123 Main St',
    city: 'Springfield',
    main_image: 'https://example.com/image.jpg',
  };

  it('renders property name and address', () => {
    const { getByText } = render(
      <PropertyCard item={mockItem} onPress={() => {}} isSelected={false} taskCount={3} />
    );

    expect(getByText('Test Property')).toBeTruthy();
    expect(getByText('123 Main St, Springfield')).toBeTruthy();
    expect(getByText('3 tasks')).toBeTruthy();
  });

  it('applies selected styles when isSelected is true (via testID)', () => {
    const { getByTestId } = render(
      <PropertyCard item={mockItem} onPress={() => {}} isSelected={true} taskCount={3} />
    );

    expect(getByTestId('property-card-selected')).toBeTruthy();
  });
});
