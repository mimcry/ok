import { Search } from 'lucide-react-native';
import React from 'react';
import { TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search by name or specialty"
}) => {
  return (
    <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3 my-2 shadow-sm">
      {/* Icon container */}
      <View className="mr-2 justify-center items-center">
        <Search 
          size={18} 
          color="#9CA3AF" 
          strokeWidth={2}
        />
      </View>
      
      {/* TextInput with proper styling */}
      <TextInput
        className="flex-1 text-sm text-gray-700 py-0 leading-4"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
};