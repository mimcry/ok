import TaskFormModal from '@/components/CheckListForm';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

describe('TaskFormModal', () => {
  const mockTask = { task: '', room: '', priority: '' };
  const mockSetTask = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const priorities = ['low', 'medium', 'high'];
  const rooms = ['Kitchen', 'Bathroom', 'Living Room'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return { backgroundColor: '#E0F2FE', color: '#0284C7' };
      case 'medium':
        return { backgroundColor: '#FEF9C3', color: '#CA8A04' };
      case 'high':
        return { backgroundColor: '#FECACA', color: '#B91C1C' };
      default:
        return { backgroundColor: '#E5E7EB', color: '#6B7280' };
    }
  };

  it('calls onClose when close icon is pressed', () => {
    const { getByText } = render(
      <TaskFormModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        task={mockTask}
        setTask={mockSetTask}
        title="New Task"
        rooms={rooms}
        priorities={priorities}
        getPriorityColor={getPriorityColor}
      />
    );

    const closeButton = getByText('close'); // mocked Ionicon name
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
