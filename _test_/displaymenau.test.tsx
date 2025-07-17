import { renderMenuItem } from '@/components/displaymenuitems';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('react-native-css-interop', () => {
  return {
    someFunction: jest.fn(),
  
  };
});

jest.mock('react-native-css-interop', () => ({})); 
describe('renderMenuItem', () => {
  const mockNavigate = jest.fn();
  const mockToggle = jest.fn();

  const baseLinkItem = {
    id: '1',
    type: 'link' as const,
    title: 'Link Item',
    icon: <Text>Icon</Text>,
    navigate: mockNavigate,
  };

  const baseToggleItem = {
    id: '2',
    type: 'toggle' as const,
    title: 'Toggle Item',
    icon: <Text>Icon</Text>,
    value: false,
    onToggle: mockToggle,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a link item and calls navigate on press', () => {
    const { getByTestId } = render(renderMenuItem(baseLinkItem));
    const touchable = getByTestId('menu-item-1');
    fireEvent.press(touchable);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('renders a toggle item and calls onToggle on switch change', () => {
    const { getByTestId } = render(renderMenuItem(baseToggleItem));
    const switchComponent = getByTestId('switch-2');
    expect(switchComponent).toBeTruthy();

    fireEvent(switchComponent, 'valueChange', true);
    expect(mockToggle).toHaveBeenCalledWith(true);
  });
});
