import { NewProperty, Property, UpdatedProperty, convertPropertyForAPI, convertToUpdatedProperty, createDefaultProperty, normalizePropertyNumbers, propertyTypes } from "@/types/propertytype";
import * as ImagePicker from "expo-image-picker";
import {
    Camera,
    X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

type EditPropertyProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (property: Property | UpdatedProperty) => void | Promise<void>; // Accept both sync and async
    property: Property | null;
    isLoading?: boolean;
};

export const EditProperty: React.FC<EditPropertyProps> = ({
    visible,
    onClose,
    onSave,
    property,
    isLoading = false
}) => {

    const renderImageItem = ({ item, index }:any) => {
    // Ensure item is a string URI
    const imageUri = typeof item === 'string' ? item : item?.uri || item?.url;
    
    if (!imageUri) {
        return null; // Skip invalid images
    }
    
    return (
        <View className="mr-3 relative">
            <Image
                source={{ uri: imageUri }}
                className="rounded-lg"
                style={{ width: 120, height: 120 }}
                resizeMode="cover"
                onError={() => {
                    console.log(`Failed to load image: ${imageUri}`);
                    // Optionally remove the failed image from the array
                    removeImage(index);
                }}
            />
            <TouchableOpacity
                onPress={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
            >
                <X size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};
    const screenHeight = Dimensions.get("window").height;
console.log("i got this :",property)
    const styles = StyleSheet.create({
        blurBackground: {
            backgroundColor: 'rgba(0,0,0,0.65)',
            ...Platform.select({
                ios: {
                    backdropFilter: 'blur(10px)',
                },
                android: {
                    // Android doesn't support backdropFilter
                },
            }),
        },
    });

    // Form state - Use NewProperty type for form data
    const [formData, setFormData] = useState<NewProperty>(createDefaultProperty());

    // Reset form when property changes
 // Replace your existing useEffect with this:
useEffect(() => {
    if (property) {
        const normalizedProperty = normalizePropertyNumbers(property);
        
        // Handle images with fallback to main_image
        let imagesToUse: string[] = [];
        
        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
            // Filter out invalid images and ensure they're strings
            imagesToUse = property.images.filter(img => {
                if (typeof img === 'string') {
                    return img.trim() !== '' && img !== 'undefined' && img !== 'null';
                }
                return false;
            });
        } else if (property.main_image && typeof property.main_image === 'string') {
            // Use main_image as fallback
            imagesToUse = [property.main_image];
        }
        
        setFormData({
            ...normalizedProperty,
            images: imagesToUse
        });
    } else {
        setFormData(createDefaultProperty());
    }
}, [property, visible]);
    // Handle text input changes
    const handleChange = (key: keyof NewProperty, value: string | number | string[]) => {
        setFormData(prevData => ({
            ...prevData,
            [key]: value
        }));
    };

    // Handle numeric input changes
    const handleNumericChange = (key: keyof NewProperty, value: string) => {
        // Allow both string and number values for flexibility
        const numValue = value ? parseInt(value, 10) : 0;
        if (!isNaN(numValue) || value === "") {
            setFormData(prevData => ({
                ...prevData,
                [key]: value === "" ? 0 : numValue
            }));
        }
    };

    // Handle image picking
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImage = result.assets[0].uri;
                if (newImage && typeof newImage === 'string') {
                    setFormData(prevData => ({
                        ...prevData,
                        images: [...(prevData.images || []), newImage]
                    }));
                }
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        setFormData(prevData => ({
            ...prevData,
            images: prevData.images?.filter((_, i) => i !== index) || []
        }));
    };

    // Save changes
   const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.address) {
        Alert.alert("Validation Error", "Property name and address are required");
        return;
    }

    // Better image validation and filtering
    const validImages = (formData.images || []).filter(img => {
        // Check if image is valid
        if (!img || typeof img !== 'string') return false;
        
        // Filter out placeholder values
        const trimmed = img.trim();
        if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return false;
        
        // Check if it's a valid URI (starts with http, https, or file)
        if (!trimmed.startsWith('http') && !trimmed.startsWith('file') && !trimmed.startsWith('data:')) {
            console.warn('Invalid image URI:', trimmed);
            return false;
        }
        
        return true;
    });

    console.log('Valid images to save:', validImages);

    const propertyToSave: Property = convertPropertyForAPI({
        ...formData,
        id: property?.id || formData.id || "",
        images: validImages,
        zipCode: formData.zipCode || "",
    });

    try {
        await onSave(propertyToSave);
    } catch (error) {
        console.error('Save error:', error);
        const updatedProperty = convertToUpdatedProperty(propertyToSave);
        await onSave(updatedProperty);
    }
};

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View className="flex-1 bg-black/40 justify-end items-center" style={styles.blurBackground}>
                    <View
                        className="bg-white rounded-2xl overflow-hidden"
                        style={{
                            maxHeight: screenHeight * 0.8
                        }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-4 py-2">
                            <TouchableOpacity onPress={onClose} accessibilityRole="button"
                                accessibilityLabel="close">
                                <View className="bg-gray-400 rounded-full p-2">
                                    <X size={24} color="#333" />
                                </View>
                            </TouchableOpacity>

                            <Text className="flex-1 text-center font-bold text-lg">
                                {property ? "Edit Property" : "New Property"}
                            </Text>

                            <View className="w-10" />
                        </View>

                            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                                <View className="p-4">
                                    {/* Property Type Section */}
                                    <View className="mb-4">
                                        <Text className="text-gray-600 text-sm mb-1">Property Type</Text>
                                        <View className="flex-row flex-wrap">
                                            {propertyTypes.map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => handleChange("type", type)}
                                                    className={`mr-2 mb-2 px-4 py-2 rounded-full ${formData.type === type
                                                            ? "bg-blue-100 border-blue-500"
                                                            : "bg-gray-100"
                                                        } border`}
                                                >
                                                    <Text
                                                        className={`${formData.type === type
                                                                ? "text-blue-600"
                                                                : "text-gray-700"
                                                            }`}
                                                    >
                                                        {type}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Images Section */}
                                    <View className="mb-6">
                                        <Text className="text-gray-700 font-semibold mb-2">Property Images</Text>

                                        {formData.images && formData.images.length > 0 ? (
                                            <FlatList
                                                data={formData.images}
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                renderItem={renderImageItem}
                                                keyExtractor={(item, index) => `${item}-${index}`}
                                                ListFooterComponent={
                                                    <TouchableOpacity
                                                        testID="add-photo-button"
                                                        onPress={pickImage}
                                                        className="w-28 h-28 bg-gray-100 rounded-lg justify-center items-center border-2 border-dashed border-gray-300 ml-1"
                                                    >
                                                        <Camera size={32} color="#9CA3AF" />
                                                        <Text className="text-xs text-gray-500 mt-1">Add Photo</Text>
                                                    </TouchableOpacity>
                                                }
                                            />
                                        ) : (
                                            <TouchableOpacity
                                                testID="add-photo-button"
                                                onPress={pickImage}
                                                className="h-36 bg-gray-100 rounded-lg justify-center items-center border-2 border-dashed border-gray-300"
                                            >
                                                <Camera size={40} color="#9CA3AF" />
                                                <Text className="text-sm text-gray-500 mt-2">Add Property Photos</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Basic Info Section */}
                                    <View className="mb-6">
                                        <Text className="text-gray-700 font-semibold mb-4">Basic Information</Text>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">Property Name</Text>
                                            <TextInput
                                                value={formData.name}
                                                onChangeText={(text) => handleChange("name", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter property name"
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">Address</Text>
                                            <TextInput
                                                value={formData.address}
                                                onChangeText={(text) => handleChange("address", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter property address"
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">City</Text>
                                            <TextInput
                                                value={formData.city}
                                                onChangeText={(text) => handleChange("city", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter city"
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">State</Text>
                                            <TextInput
                                                value={formData.state}
                                                onChangeText={(text) => handleChange("state", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter state"
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">Zip Code</Text>
                                            <TextInput
                                                value={formData.zipCode}
                                                onChangeText={(text) => handleChange("zipCode", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter zip code"
                                                keyboardType="number-pad"
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">Base Price</Text>
                                            <TextInput
                                                value={formData.basePrice}
                                                onChangeText={(text) => handleChange("basePrice", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter base price"
                                                keyboardType="decimal-pad"
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">Airbnb Link</Text>
                                            <TextInput
                                                value={formData.airbnblink || ""}
                                                onChangeText={(text) => handleChange("airbnblink", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter Airbnb listing URL"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    {/* Features Section */}
                                    <View className="mb-6">
                                        <Text className="text-gray-700 font-semibold mb-4">Property Features</Text>

                                        <View className="flex-row justify-between mb-4">
                                            <View className="flex-1 mr-2">
                                                <Text className="text-gray-600 text-sm mb-1">Bedrooms</Text>
                                                <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
                                                    <TouchableOpacity
                                                        className="bg-gray-100 px-4 py-3"
                                                        onPress={() => handleNumericChange("bedrooms", String(Math.max(0, (typeof formData.bedrooms === 'number' ? formData.bedrooms : parseInt(formData.bedrooms as string) || 0) - 1)))}
                                                    >
                                                        <Text className="font-bold">-</Text>
                                                    </TouchableOpacity>
                                                    <TextInput
                                                        value={String(formData.bedrooms || 0)}
                                                        onChangeText={(text) => handleNumericChange("bedrooms", text)}
                                                        className="flex-1 text-center p-2 text-gray-800"
                                                        keyboardType="number-pad"
                                                    />
                                                    <TouchableOpacity
                                                        className="bg-gray-100 px-4 py-3"
                                                        onPress={() => handleNumericChange("bedrooms", String((typeof formData.bedrooms === 'number' ? formData.bedrooms : parseInt(formData.bedrooms as string) || 0) + 1))}
                                                    >
                                                        <Text className="font-bold">+</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View className="flex-1 ml-2">
                                                <Text className="text-gray-600 text-sm mb-1">Bathrooms</Text>
                                                <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
                                                    <TouchableOpacity
                                                        className="bg-gray-100 px-4 py-3"
                                                        onPress={() => handleNumericChange("bathrooms", String(Math.max(0, (typeof formData.bathrooms === 'number' ? formData.bathrooms : parseInt(formData.bathrooms as string) || 0) - 1)))}
                                                    >
                                                        <Text className="font-bold">-</Text>
                                                    </TouchableOpacity>
                                                    <TextInput
                                                        value={String(formData.bathrooms || 0)}
                                                        onChangeText={(text) => handleNumericChange("bathrooms", text)}
                                                        className="flex-1 text-center p-2 text-gray-800"
                                                        keyboardType="number-pad"
                                                    />
                                                    <TouchableOpacity
                                                        className="bg-gray-100 px-4 py-3"
                                                        onPress={() => handleNumericChange("bathrooms", String((typeof formData.bathrooms === 'number' ? formData.bathrooms : parseInt(formData.bathrooms as string) || 0) + 1))}
                                                    >
                                                        <Text className="font-bold">+</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-sm mb-1">Area (m²)</Text>
                                            <TextInput
                                                value={formData.area ? String(formData.area) : ""}
                                                onChangeText={(text) => handleNumericChange("area", text)}
                                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                                placeholder="Enter area in square meters"
                                                keyboardType="number-pad"
                                            />
                                        </View>
                                    </View>

                                    {/* Description Section */}
                                    <View className="mb-6">
                                        <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                                        <TextInput
                                            value={formData.description}
                                            onChangeText={(text) => handleChange("description", text)}
                                            className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                            placeholder="Enter property description"
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    {/* Instructions Section */}
                                    <View className="mb-8">
                                        <Text className="text-gray-700 font-semibold mb-2">Instructions</Text>
                                        <TextInput
                                            value={formData.instruction}
                                            onChangeText={(text) => handleChange("instruction", text)}
                                            className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                            placeholder="Enter any special instructions"
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                 

                        {/* Bottom action buttons */}
                        <View className="p-4 border-t border-gray-200">
                            <View className="flex-row">
                                <TouchableOpacity
                                    className={`flex-1 ${property ? "ml-2" : ""} flex-row items-center justify-center py-3 px-4 rounded-lg bg-primary mb-2`}
                                    onPress={handleSave}
                                    disabled={isLoading}
                                >
                                    <Text className="font-semibold text-white">
                                        {property ? "Update Property" : "Create Property"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};