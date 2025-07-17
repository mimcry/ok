
import { Clock, Search, Users } from 'lucide-react-native';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TabHeaderProps {
  activeTab: 'find' | 'pending';
  onTabChange: (tab: 'find' | 'pending') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TabHeader: React.FC<TabHeaderProps> = ({ 
  activeTab, 
  onTabChange, 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <View className="pt-2 pb-4 px-4 bg-white shadow-sm">
      <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
            activeTab === 'find' ? 'bg-indigo-600' : 'bg-transparent'
          }`}
          onPress={() => onTabChange('find')}
        >
          <Users size={20} color={activeTab === 'find' ? 'white' : '#6B7280'} />
          <Text className={`ml-2 font-semibold ${
            activeTab === 'find' ? 'text-white' : 'text-gray-500'
          }`}>
            Find Cleaners
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
            activeTab === 'pending' ? 'bg-primary' : 'bg-transparent'
          }`}
          onPress={() => onTabChange('pending')}
        >
          <Clock size={20} color={activeTab === 'pending' ? 'white' : '#6B7280'} />
          <Text className={`ml-2 font-semibold ${
            activeTab === 'pending' ? 'text-white' : 'text-gray-500'
          }`}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search bar - only show on find tab */}
      {activeTab === 'find' && (
        <View className="flex-row bg-gray-100 rounded-xl px-3 py-2 items-center">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800 text-base"
            placeholder="Search cleaners by name, email, or specialty..."
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      )}
    </View>
  );
};

export default TabHeader;