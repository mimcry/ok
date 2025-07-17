import { mergePropertyImageUrls } from "@/constants/mergeimages";
import usePropertyStore from "@/store/jobStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Bath, Bed, Briefcase, Building, DollarSign, Home, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


export interface Property {
  is_active: any;
  connection_id: null;
  id: number;  
  name: string;
  address: string;
  city: string;
  zip_code: string; 
    images: string[];
  description: string;
  instruction?: string;
  airbnb_link?: string;  
  bedrooms: number;
  bathrooms: number;
  property_type: string;  
  area: number;
  base_price: string | number |undefined ;  
  main_image: string;  
  cleaner: any;
  host: number;
  state: string;
  created_at: string;
  updated_at: string;
}

type PropertyCardProps = {
  property: Property;
  onSelect: (property: Property) => void;
  onDelete?: (id: number) => void;
  onEdit?: (property: Property) => void;
  onAssignCleaner?: (property: Property) => void;
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
 
}) => {
  
  console.log("property:", property);

  const PropertyDetails = () => {
     usePropertyStore.getState().setSelectedProperty(property);
    router.push("/(helper)/propertydescription");
    
  }

  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('user_role');
        if (storedRole !== null) {
          setRole(storedRole);
          console.log('User role:', storedRole);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };

    getUserRole();
  }, []);
const imageUrls = mergePropertyImageUrls(property);
console.log("images that i got ",imageUrls)
  // Component for the card 
  const Card = () => (
    <TouchableOpacity
      onPress={PropertyDetails}
      className="bg-white rounded-xl overflow-hidden mb-4 shadow-lg"
    >
      {/* Images carousel */}
      <View className="h-48 relative rounded-t-xl overflow-hidden">
        {property.main_image? (
     
            <Image
        
              source={{ uri: property.main_image}}
              className="h-48 w-full"
              resizeMode="cover"
            />
     
        ) : (
          <View className="w-full h-48 bg-gray-200 justify-center items-center">
            <Building size={40} className="text-gray-300" />
          </View>
        )}
      
{!property?.is_active && (
  <View className="absolute top-3 left-3 ml-4 bg-red-500 rounded-full px-3 py-1">
    <Text className="text-xs font-bold text-white">Inactive Property</Text>
  </View>
)}

      <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <Text className="text-xs font-bold text-gray-700">
            {property.property_type}</Text>
        </View>

     
      </View>

      {/* Content */}
      <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={1}>
            {property?.name || 'Property Name'}
          </Text>
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-lg">
            <DollarSign size={14} color="#059669" />
            <Text className="text-sm font-bold text-green-600 ml-1">
              {property?.base_price }
            </Text>
          </View>
        </View>


        <View className="flex-row items-center mt-1">
          <MapPin size={14} color="#6B7280"  />
          <Text className="text-gray-600 text-sm flex-shrink ml-1" numberOfLines={1}>
            {property.address}, {property.city}, {property.state}, {property.zip_code}
          </Text>
        </View>

        {/* Bedrooms, Bathrooms & Area row */}
        <View className="flex-row mt-3 items-center">
          <View className="flex-row items-center">
            <Bed size={16} color="#6B7280"  />
            <Text className="text-gray-700 font-medium text-sm ml-1">{property.bedrooms} Beds</Text>
          </View>

          <View className="mx-2 h-4 w-px bg-gray-300" />

          <View className="flex-row items-center">
            <Bath size={16} color="#6B7280"  />
            <Text className="text-gray-700 font-medium text-sm ml-1">{property.bathrooms} Baths</Text>
          </View>

          <View className="mx-2 h-4 w-px bg-gray-300" />

          <View className="flex-row items-center">
            <Home size={16} color="#6B7280"  />
            <Text className="text-gray-700 font-medium text-sm ml-1">{property.area} sqft</Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-gray-600 text-sm mt-2" numberOfLines={2}>
          {property.description}
        </Text>

        {/* Buttons */}
        <View className="flex-row mt-4 justify-between">
         {(role !== 'cleaner' && property.host != null) && (
  <TouchableOpacity
    onPress={() => {
      usePropertyStore.getState().setSelectedProperty(property);
      router.push('/(helper)/assigncleaner');
    }}
    className="bg-green-500 px-4 py-2 rounded-md"
  >
    <Text className="text-white text-center font-medium">Assign Cleaner</Text>
  </TouchableOpacity>
)}
{((role !== 'cleaner') || (role === 'cleaner' && property.connection_id == null)) && (
  <TouchableOpacity
    className="bg-primary py-2 px-3 rounded-lg flex-row items-center"
    onPress={() => {onSelect(property)
      router.push("/(helper)/jobform")
    }}
  >
    <Briefcase size={16} className="text-white" color="#ffff" />
    <Text className="text-white font-medium ml-1 text-sm">Create Job</Text>
  </TouchableOpacity>
)}

        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Card />
    </>
  );
};