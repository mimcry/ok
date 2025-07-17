import PropertyCard from '@/components/CheckListCard';
import { Property } from '@/types/checklist';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface PropertiesListViewProps {
  userProperties: Property[];
  selectedProperty: Property | null;
  propertyTaskCounts: { [propertyId: number]: number };
  onSelectProperty: (property: Property) => void;
}

export const PropertiesListView: React.FC<PropertiesListViewProps> = ({
  userProperties,
  selectedProperty,
  propertyTaskCounts,
  onSelectProperty
}) => {
  return (
    <>
      <View className="flex-row items-center justify-between px-5 py-4   bg-white border-b border-gray-200 rounded-tr-[20px]">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-xl font-semibold text-gray-900">Cleaner Checklist</Text>   
          <Text className="text-sm text-gray-500 mt-1">{userProperties.length} properties available</Text>    
        </View>
      </View>

      {userProperties.length === 0 ? (
        <View className="flex-1 justify-center items-center p-10">
          <Ionicons name="home-outline" size={64} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-500 mt-4">No properties found</Text>
          <Text className="text-sm text-gray-400 text-center mt-2 leading-5">Properties will appear here once they're assigned to you</Text>
        </View>
      ) : (
        <FlatList
          data={userProperties}
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              onPress={() => onSelectProperty(item)}
              isSelected={selectedProperty?.id === item.id}
              taskCount={propertyTaskCounts[item.id] || 0}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </>
  );
};