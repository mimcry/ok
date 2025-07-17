import { createPropertyWithImages } from "@/api/propertyapi";
import { FormField } from "@/components/FormField";
import { toCamelCase } from "@/constants/camel";
import usePropertyStore from "@/store/jobStore";
import { ValidationComponent } from "@/types/formvalidation";
import { propertyTypes } from "@/types/propertytype";
import { ApiResult, FormattedProperty, ValidationErrors } from "@/types/validation";
import { ImagePickerComponent } from "@/utils/imagepicker";
import { router } from "expo-router";
import {
    AlertCircle,
    Bed,
    Building2,
    CheckCircle,
    DollarSign,
    Droplet,
    ExternalLink,
    FileText,
    Home,
    LandPlot,
    MapPin
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useToast } from "react-native-toast-notifications";


interface PropertyFormProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

 const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onClose }) => {
    const toast = useToast();
    const newProperty = usePropertyStore((state) => state.newProperty);
    const updateNewPropertyField = usePropertyStore((state) => state.updateNewPropertyField);
    const resetNewProperty = usePropertyStore((state) => state.resetNewProperty);
    
    // State for form submission
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [images, setImages] = useState<string[]>(newProperty.images || []);

    // Initialize validation component
    const validator = useMemo(() => new ValidationComponent(setErrors), []);

    // Handle field changes with validation
    const handleFieldChange = (field: string, value: string): void => {
        updateNewPropertyField(field, value);
        
        // Validate field based on type
        switch (field) {
            case 'name':
                validator.validateName(value);
                break;
            case 'type':
                validator.validateType(value);
                break;
            case 'address':
                validator.validateAddress(value);
                break;
            case 'city':
                validator.validateCity(value);
                break;
            case 'state':
                validator.validateState(value);
                break;
            case 'ZipCode':
                validator.validateZipCode(value);
                break;
            case 'area':
                validator.validateArea(value);
                break;
            case 'bedrooms':
                validator.validateBedrooms(value);
                break;
            case 'bathrooms':
                validator.validateBathrooms(value);
                break;
            case 'basePrice':
                validator.validateBasePrice(value);
                break;
            case 'instruction':
                validator.validateInstruction(value);
                break;
            case 'description':
                validator.validateDescription(value);
                break;
            case 'airbnblink':
                // No validation needed for optional field
                break;
            default:
                break;
        }
    };

    const handleImagesChange = (newImages: string[]): void => {
        setImages(newImages);
        updateNewPropertyField('images', newImages);
        validator.validateImages(newImages);
    };

    const handleSubmit = async (): Promise<void> => {
        const isValid = validator.validateForm(
            newProperty.name,
            newProperty.type,
            newProperty.address,
            newProperty.city,
            newProperty.state,
            newProperty.ZipCode,
            newProperty.area,
            newProperty.bedrooms,
            newProperty.bathrooms,
            newProperty.basePrice,
            newProperty.instruction,
            newProperty.description,
            images
        );

        if (!isValid) {
            toast.show("Please fix all validation errors before submitting", {
                type: "danger",
                title: "Validation Error",
                duration: 4000
            });
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const formattedProperty: FormattedProperty = {
                ...newProperty,
                name: String(newProperty.name || '').trim(),
                address: String(newProperty.address || '').trim(),
                city: String(newProperty.city || '').trim(),
                state: String(newProperty.state || '').trim(),
                zipCode: String(newProperty.ZipCode || newProperty.zipCode || '').trim(),
                description: newProperty.description || '',
                bedrooms: parseInt(newProperty.bedrooms) || 0,
                bathrooms: parseInt(newProperty.bathrooms) || 0,
                area: parseFloat(newProperty.area) || 0,
                basePrice: String(newProperty.basePrice || '0.00').trim(),
                type: newProperty.propertyType || newProperty.type || ''
            };
            
            console.log("Submitting property with images:", formattedProperty);
            
            const result: ApiResult = await createPropertyWithImages(
                formattedProperty,
                images
            );
            
            if (result.success) {
                toast.show("Property created successfully!", {
                    type: "success",
                    title: "Success",
                    duration: 3000
                });
                
                resetNewProperty();
                setErrors({});
                setImages([]);
                
                // Call success callback if provided
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.back()
                }
               
            } else {
                const errorMessage = result.error || "Failed to create property";
                toast.show(errorMessage, {
                    type: "danger",
                    title: "Error",
                    duration: 4000
                });
                console.error("API Error:", result.data);
            }
        } catch (error) {
            toast.show("An unexpected error occurred", {
                type: "danger",
                title: "Error",
                duration: 4000
            });
            console.error("Submit Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-white  pt-4">
            <ScrollView className="mb-6 px-4" showsVerticalScrollIndicator={false}>
                {/* Property Type Selection */}
              <View className="mb-5">
  <Text className="text-gray-700 font-semibold mb-2 ">Property Type *</Text>
  
  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
    {propertyTypes.map((type: string) => (
      <TouchableOpacity
        key={type}
        onPress={() => handleFieldChange('type', type)}
        className={`mr-2 px-4 py-2 rounded-full ${
          newProperty.type === type ? "bg-blue-100 border-blue-500" : "bg-gray-100"
        } border ${errors.type ? "border-red-500" : ""}`}
      >
        <Text
          className={`${
            newProperty.type === type ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {toCamelCase(type)}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>

  {errors.type && (
    <Text className="text-red-500 text-sm mt-1">{errors.type}</Text>
  )}
</View>

                {/* Form Fields */}
                <FormField
                    label="Property Name *"
                    icon={<Home size={20} color="#4B5563" />}
                    placeholder="Enter property name"
                    value={newProperty.name}
                    onChangeText={(value) => handleFieldChange('name', value)}
                    containerStyle={errors.name ? "border-red-500" : "border-gray-300"}
                />
                {errors.name && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.name}</Text>
                )}

                <FormField
                    label="State *"
                    icon={<MapPin size={20} color="#4B5563" />}
                    placeholder="Enter state"
                    value={newProperty.state}
                    onChangeText={(value) => handleFieldChange('state', value)}
                    containerStyle={errors.state ? "border-red-500" : "border-gray-300"}
                />
                {errors.state && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.state}</Text>
                )}

                <FormField
                    label="City *"
                    icon={<Building2 size={20} color="#4B5563" />}
                    placeholder="Enter city"
                    value={newProperty.city}
                    onChangeText={(value) => handleFieldChange('city', value)}
                    containerStyle={errors.city ? "border-red-500" : "border-gray-300"}
                />
                {errors.city && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.city}</Text>
                )}

                <FormField
                    label="Full Address *"
                    icon={<MapPin size={20} color="#4B5563" />}
                    placeholder="Enter street address"
                    value={newProperty.address}
                    onChangeText={(value) => handleFieldChange('address', value)}
                    containerStyle={errors.address ? "border-red-500" : "border-gray-300"}
                />
                {errors.address && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.address}</Text>
                )}

                <FormField
                    label="Zip Code *"
                    icon={<MapPin size={20} color="#4B5563" />}
                    placeholder="Enter zip code"
                    value={newProperty.ZipCode}
                    onChangeText={(value) => handleFieldChange('ZipCode', value)}
                    containerStyle={errors.ZipCode ? "border-red-500" : "border-gray-300"}
                    keyboardType="numeric"
                />
                {errors.ZipCode && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.ZipCode}</Text>
                )}

                <FormField
                    label="Area (m²) *"
                    icon={<LandPlot size={20} color="#4B5563" />}
                    placeholder="Enter area in square meters"
                    value={newProperty.area}
                    onChangeText={(value) => handleFieldChange('area', value)}
                    keyboardType="numeric"
                    containerStyle={errors.area ? "border-red-500" : "border-gray-300"}
                />
                {errors.area && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.area}</Text>
                )}

                <View className="flex-row mb-5">
                    <View className="flex-1 mr-2">
                        <FormField
                            testID="bedrooms-input"
                            label="Bedrooms *"
                            icon={<Bed size={20} color="#4B5563" />}
                            placeholder="Number"
                            value={newProperty.bedrooms}
                            onChangeText={(value) => handleFieldChange('bedrooms', value)}
                            keyboardType="numeric"
                            containerStyle={errors.bedrooms ? "border-red-500" : "border-gray-300"}
                        />
                        {errors.bedrooms && (
                            <Text className="text-red-500 text-sm mt-1">{errors.bedrooms}</Text>
                        )}
                    </View>
                    <View className="flex-1 ml-2">
                        <FormField
                            testID="bathrooms-input"
                            label="Bathrooms *"
                            icon={<Droplet size={20} color="#4B5563" />}
                            placeholder="Number"
                            value={newProperty.bathrooms}
                            onChangeText={(value) => handleFieldChange('bathrooms', value)}
                            keyboardType="numeric"
                            containerStyle={errors.bathrooms ? "border-red-500" : "border-gray-300"}
                        />
                        {errors.bathrooms && (
                            <Text className="text-red-500 text-sm mt-1">{errors.bathrooms}</Text>
                        )}
                    </View>
                </View>
                
                <FormField
                    label="Cleaning Price *"
                    icon={<DollarSign size={20} color="#4B5563" />}
                    placeholder="Cleaning price (per room for hotels)"
                    value={newProperty.basePrice}
                    onChangeText={(value) => handleFieldChange('basePrice', value)}
                    keyboardType="numeric"
                    containerStyle={errors.basePrice ? "border-red-500" : "border-gray-300"}
                />
                {errors.basePrice && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.basePrice}</Text>
                )}

                <FormField
                    label="Airbnb/iCloud Link "
                    icon={<ExternalLink size={20} color="#4B5563" />}
                    placeholder="Enter link to fetch checkin/checkout data"
                    value={newProperty.airbnblink}
                    onChangeText={(value) => handleFieldChange('airbnblink', value)}
                    containerStyle="border-gray-300"
                />

                {/* Image Picker Component */}
                <ImagePickerComponent
                    images={images}
                    onImagesChange={handleImagesChange}
                    error={errors.images}
                    label="Property Images"
                    required={true}
                />

                <FormField
                    label="Special Instructions *"
                    icon={<AlertCircle size={20} color="#4B5563" />}
                    placeholder="Enter any special instructions for cleaners"
                    value={newProperty.instruction}
                    onChangeText={(value) => handleFieldChange('instruction', value)}
                    multiline={true}
                    containerStyle={errors.instruction ? "border-red-500" : "border-gray-300"}
                />
                {errors.instruction && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.instruction}</Text>
                )}

                <FormField
                    label="Additional Description *"
                    icon={<FileText size={20} color="#4B5563" />}
                    placeholder="Enter additional property description"
                    value={newProperty.description}
                    onChangeText={(value) => handleFieldChange('description', value)}
                    multiline={true}
                    containerStyle={errors.description ? "border-red-500" : "border-gray-300"}
                />
                {errors.description && (
                    <Text className="text-red-500 text-sm mt-1 mb-3">{errors.description}</Text>
                )}

                <View className="mt-3 mb-2 p-3 bg-blue-50 rounded-lg">
                    <Text className="text-blue-800 text-sm">
                        Fields marked with * are required. Please make sure to fill all mandatory fields 
                        and upload at least one property image.
                    </Text>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View className="px-4 pb-4 mb-4">
                <TouchableOpacity 
                    className="bg-primary py-4 rounded-xl flex-row justify-center items-center shadow-md"
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <CheckCircle size={20} color="#ffffff" />
                    )}
                    <Text className="text-white font-bold ml-2 text-lg">
                        {isSubmitting ? "Creating Property..." : "Create Property"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default PropertyForm;