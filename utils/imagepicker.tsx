import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { X, Upload, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerComponentProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  images,
  onImagesChange,
  error,
  label = "Property Images",
  required = false
}) => {

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return mediaLibraryPermission.status === 'granted';
  };

  const pickFromGallery = async (): Promise<void> => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to select images.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images from gallery:', error);
      Alert.alert("Error", "Failed to pick images from gallery");
    }
  };

  const removeImage = (index: number): void => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-700 font-semibold">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
        <Text className={`text-sm ${error ? "text-red-500" : "text-gray-500"}`}>
          {images.length} Photo{images.length !== 1 ? 's' : ''} selected
        </Text>
      </View>

      {/* Image Gallery */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {images.map((uri: string, index: number) => (
            <View key={index} className="mr-3 relative">
              <Image
                source={{ uri }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 justify-center items-center"
                onPress={() => removeImage(index)}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Image Button - Direct Gallery Access */}
      <TouchableOpacity
        onPress={pickFromGallery}
        className={`bg-gray-100 rounded-xl p-4 items-center justify-center border-2 border-dashed ${
          error ? "border-red-400" : "border-gray-300"
        }`}
        style={{ height: 100 }}
      >
        <Upload size={32} color={error ? "#F87171" : "#10B981"} />
        <Text className={error ? "text-red-500 mt-2 text-center" : "text-gray-500 mt-2 text-center"}>
          {images.length > 0 ? 'Add More Images' : 'Tap to select from gallery'}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">
          Gallery only • Max 10 images
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};