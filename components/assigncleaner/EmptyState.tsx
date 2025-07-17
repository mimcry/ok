import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  searchQuery, 
  onClearSearch 
}) => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-gray-600 text-center">
        {searchQuery ? 'No cleaners match your search' : 'No cleaners found'}
      </Text>
      {searchQuery && onClearSearch && (
        <TouchableOpacity
          onPress={onClearSearch}
          className="mt-2 px-4 py-2 bg-indigo-100 rounded-lg"
        >
          <Text className="text-indigo-600">Clear search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};