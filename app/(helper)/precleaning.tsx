import { fetchJobImagesById, uploadCleaningImages } from '@/api/jobApi';
import CustomAlert from '@/hooks/customAlert';
import { usePermissions } from '@/hooks/usePermissions';
import useChatStore from '@/store/chatStore';
import usePropertyStore from '@/store/jobStore';
import { Property } from '@/types/propertytype';
import { DateFormatter } from '@/utils/DateUtils';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Camera, Check, CheckCircle, MapPin, MessageSquare, Plus, Upload, X } from 'lucide-react-native';
import React, { ReactNode, useEffect, useState } from 'react';
import { FlatList, Image, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ContinuousCamera from './continousCamera';

interface Photo {
  uri: string;
  id: string;
  timestamp: string;
  uploaded?: boolean; // Track if this specific photo is uploaded
}

interface Params {
  end_time: ReactNode;
  id: string;
  clickTime: string;
  name: string;
  imageUrl: string;
  price: string;
  description: string;
  status: string;
  address: string;
  dueTime: string;
  date: string;
}

// Define the expected structure of job images from API
interface JobImage {
  id: number;
  url: string;
  image_type: string;
  created_at: string;
}

interface JobImagesResponse {
  success: boolean;
  data?: {
    images: JobImage[];
  };
  message?: string;
}

export default function CleaningInProgress(): JSX.Element {
  const [roomPhotos, setRoomPhotos] = useState<Photo[]>([]);
  const [damagePhotos, setDamagePhotos] = useState<Photo[]>([]);
  const [photoViewerVisible, setPhotoViewerVisible] = useState<boolean>(false);
  const [currentPhotoType, setCurrentPhotoType] = useState<'room' | 'damage'>('room');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isUploadingRoom, setIsUploadingRoom] = useState<boolean>(false);
  const [isUploadingDamage, setIsUploadingDamage] = useState<boolean>(false);
  const [roomPhotosUploaded, setRoomPhotosUploaded] = useState<boolean>(false);
  const [damagePhotosUploaded, setDamagePhotosUploaded] = useState<boolean>(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [isLoadingExistingPhotos, setIsLoadingExistingPhotos] = useState(true);

  // Custom alert states for different scenarios
  const [showCameraAlert, setShowCameraAlert] = useState<boolean>(false);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [showDeleteConfirmAlert, setShowDeleteConfirmAlert] = useState<boolean>(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState<boolean>(false);
  const [showPhotoOptionsAlert, setShowPhotoOptionsAlert] = useState<boolean>(false);
  const [showHelpAlert, setShowHelpAlert] = useState<boolean>(false);
  const [selectMoreImage, setSelectMoreImage] = useState<boolean>(false);
  const [showContinuousCamera, setShowContinuousCamera] = useState(false);
  const [showAddMorePhotosAlert, setShowAddMorePhotosAlert] = useState<boolean>(false);

  // Get selected job from property store
  const selectedJob = usePropertyStore((state) => state.selectedJob) as unknown as Property | undefined;
  const { permissions } = usePermissions();
  const params = useLocalSearchParams();
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  console.log("params for pre cleaning:", selectedJob);

  // Load existing photos when component mounts
  useEffect(() => {
    loadExistingPhotos();
  }, [selectedJob?.id]);

  const loadExistingPhotos = async () => {
    if (!selectedJob?.id) return;

    try {
      setIsLoadingExistingPhotos(true);

      // Fetch existing photos from API - using the correct function name
      const result: JobImagesResponse = await fetchJobImagesById(selectedJob.id);

      console.log("Fetched job images:", result);

      if (result.success && result.data?.images) {
        const existingRoomPhotos: Photo[] = [];
        const existingDamagePhotos: Photo[] = [];

        // Process existing photos - using 'before' and 'damage' types
        result.data.images.forEach((imageData: JobImage) => {
          const photo: Photo = {
            uri: imageData.url,
            id: imageData.id.toString(),
            timestamp: new Date(imageData.created_at).toLocaleString(),
            uploaded: true
          };

          if (imageData.image_type === 'before') {
            existingRoomPhotos.push(photo);
          } else if (imageData.image_type === 'damage') {
            existingDamagePhotos.push(photo);
          }
        });

        console.log("Processed room photos:", existingRoomPhotos);
        console.log("Processed damage photos:", existingDamagePhotos);

        setRoomPhotos(existingRoomPhotos);
        setDamagePhotos(existingDamagePhotos);

        // Set uploaded status based on existing photos
        setRoomPhotosUploaded(existingRoomPhotos.length > 0);
        setDamagePhotosUploaded(existingDamagePhotos.length > 0);
      } else {
        console.log("No images found or API call failed:", result.message);
        // Reset to empty arrays if no images found
        setRoomPhotos([]);
        setDamagePhotos([]);
        setRoomPhotosUploaded(false);
        setDamagePhotosUploaded(false);
      }
    } catch (error) {
      console.error('Error loading existing photos:', error);
      setErrorMessage('Failed to load existing photos');
      setShowErrorAlert(true);
      // Reset to empty arrays on error
      setRoomPhotos([]);
      setDamagePhotos([]);
      setRoomPhotosUploaded(false);
      setDamagePhotosUploaded(false);
    } finally {
      setIsLoadingExistingPhotos(false);
    }
  };

  // Replace your photo options alert with this:
  const handlePhotoOptions = (type: 'room' | 'damage'): void => {
    setCurrentPhotoType(type);
    const isAlreadyUploaded = type === 'room' ? roomPhotosUploaded : damagePhotosUploaded;

    if (isAlreadyUploaded) {
      setShowAddMorePhotosAlert(true);
    } else {
      setShowPhotoOptionsAlert(true);
    }
  };

  // Check if start cleaning button should be enabled
  const canStartCleaning = roomPhotosUploaded && roomPhotos.length > 0;

  // Pick image from library or camera
  const pickImage = (type: 'room' | 'damage'): void => {
    setCurrentPhotoType(type);
    setShowPhotoOptionsAlert(true);
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.6,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const now = new Date();

        const newPhoto: Photo = {
          uri: uri,
          id: Date.now().toString(),
          timestamp: now.toLocaleString(),
          uploaded: false
        };

        if (currentPhotoType === 'room') {
          setRoomPhotos(prev => [...prev, newPhoto]);
          // Don't reset uploaded status if there are already uploaded photos
          const hasUploadedPhotos = roomPhotos.some(photo => photo.uploaded);
          if (!hasUploadedPhotos) {
            setRoomPhotosUploaded(false);
          }
        } else {
          setDamagePhotos(prev => [...prev, newPhoto]);
          const hasUploadedPhotos = damagePhotos.some(photo => photo.uploaded);
          if (!hasUploadedPhotos) {
            setDamagePhotosUploaded(false);
          }
        }

        // Continue taking photos if in continuous mode
        if (continuousMode) {
          setTimeout(() => {
            launchCamera();
          }, 500);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to access camera");
      setShowErrorAlert(true);
    }
  };

  const launchCamera = async (): Promise<void> => {
    try {
      // Check if permissions are granted (from our hook)
      if (!permissions.camera) {
        setErrorMessage("Camera permission is required. Please enable it in your device settings.");
        setShowErrorAlert(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.6,
        allowsMultipleSelection: false,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset, index) => {
          const now = new Date();
          const newPhoto: Photo = {
            uri: asset.uri,
            id: `${Date.now()}_${index}`,
            timestamp: now.toLocaleString(),
            uploaded: false
          };

          if (currentPhotoType === 'room') {
            setRoomPhotos(prev => [...prev, newPhoto]);
            const hasUploadedPhotos = roomPhotos.some(photo => photo.uploaded);
            if (!hasUploadedPhotos) {
              setRoomPhotosUploaded(false);
            }
          } else {
            setDamagePhotos(prev => [...prev, newPhoto]);
            const hasUploadedPhotos = damagePhotos.some(photo => photo.uploaded);
            if (!hasUploadedPhotos) {
              setDamagePhotosUploaded(false);
            }
          }
        });

        setTimeout(() => {
          launchCamera();
        }, 300);
      }

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to access camera");
      setShowErrorAlert(true);
    }
  };

  const uploadPhotos = async (type: 'room' | 'damage'): Promise<void> => {
    try {
      const photos = type === 'room' ? roomPhotos : damagePhotos;
      // Only upload photos that haven't been uploaded yet
      const photosToUpload = photos.filter(photo => !photo.uploaded);

      if (photosToUpload.length === 0) {
        setErrorMessage("No new photos to upload");
        setShowErrorAlert(true);
        return;
      }

      const imageUris = photosToUpload.map(photo => photo.uri);

      console.log(`Starting upload for ${type} images:`, imageUris);
      console.log('Job ID:', selectedJob?.id);

      if (type === 'room') {
        setIsUploadingRoom(true);
      } else {
        setIsUploadingDamage(true);
      }

      // Create file objects for React Native
      const images = imageUris.map((uri, index) => ({
        file: {
          uri: uri,
          type: 'image/jpeg',
          name: `${type}_${Date.now()}_${index}.jpg`,
        },
        type: type === 'room' ? "before" : "damage"
      }));

      console.log('Images array:', images);

      // Upload to API
      const result = await uploadCleaningImages(selectedJob?.id, images);

      console.log('Upload result:', result);

      if (result.success) {
        console.log(`${type} images uploaded successfully`);

        // Mark the newly uploaded photos as uploaded
        if (type === 'room') {
          setRoomPhotos(prev => prev.map(photo =>
            photosToUpload.some(p => p.id === photo.id)
              ? { ...photo, uploaded: true }
              : photo
          ));
          setRoomPhotosUploaded(true);
        } else {
          setDamagePhotos(prev => prev.map(photo =>
            photosToUpload.some(p => p.id === photo.id)
              ? { ...photo, uploaded: true }
              : photo
          ));
          setDamagePhotosUploaded(true);
        }
      } else {
        console.log("Upload failed:", result.message);
        setErrorMessage(result.message || "Failed to upload images");
        setShowErrorAlert(true);
      }

    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(`Upload failed: ${error}`);
      setShowErrorAlert(true);
    } finally {
      if (type === 'room') {
        setIsUploadingRoom(false);
      } else {
        setIsUploadingDamage(false);
      }
    }
  };

  const launchGallery = async (): Promise<void> => {
    try {
      // Check if permissions are granted (from our hook)
      if (!permissions.mediaLibrary) {
        setErrorMessage("Media library permission is required. Please enable it in your device settings.");
        setShowErrorAlert(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        const now = new Date();
        const newPhotos: Photo[] = [];

        result.assets.forEach((asset, index) => {
          const newPhoto: Photo = {
            uri: asset.uri,
            id: `${Date.now()}_${index}`,
            timestamp: now.toLocaleString(),
            uploaded: false
          };

          newPhotos.push(newPhoto);
        });

        if (currentPhotoType === 'room') {
          setRoomPhotos(prev => [...prev, ...newPhotos]);
          const hasUploadedPhotos = roomPhotos.some(photo => photo.uploaded);
          if (!hasUploadedPhotos) {
            setRoomPhotosUploaded(false);
          }
        } else {
          setDamagePhotos(prev => [...prev, ...newPhotos]);
          const hasUploadedPhotos = damagePhotos.some(photo => photo.uploaded);
          if (!hasUploadedPhotos) {
            setDamagePhotosUploaded(false);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to select photos from gallery");
      }
      setShowErrorAlert(true);
    }
  };

  // View a specific photo
  const viewPhoto = (photo: Photo, type: 'room' | 'damage'): void => {
    setSelectedPhoto(photo);
    setCurrentPhotoType(type);
    setPhotoViewerVisible(true);
  };

  // Delete a photo
  const deletePhoto = (): void => {
    if (!selectedPhoto) return;

    if (currentPhotoType === 'room') {
      const updatedPhotos = roomPhotos.filter(photo => photo.id !== selectedPhoto.id);
      setRoomPhotos(updatedPhotos);
      // Check if there are still uploaded photos remaining
      const hasUploadedPhotos = updatedPhotos.some(photo => photo.uploaded);
      setRoomPhotosUploaded(hasUploadedPhotos);
    } else {
      const updatedPhotos = damagePhotos.filter(photo => photo.id !== selectedPhoto.id);
      setDamagePhotos(updatedPhotos);
      const hasUploadedPhotos = updatedPhotos.some(photo => photo.uploaded);
      setDamagePhotosUploaded(hasUploadedPhotos);
    }

    setPhotoViewerVisible(false);
    setShowDeleteConfirmAlert(false);
  };

  // Confirm delete
  const confirmDelete = (): void => {
    setShowDeleteConfirmAlert(true);
  };

  // Render individual photo thumbnail
  const renderPhotoThumbnail = ({ item, type }: { item: Photo; type: 'room' | 'damage' }): JSX.Element => (
    <TouchableOpacity
      key={item.id}
      className="w-28 h-28 m-1 rounded-lg overflow-hidden shadow-sm relative"
      onPress={() => viewPhoto(item, type)}
    >
      <Image
        source={{ uri: item.uri }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {/* Upload status indicator */}
      {item.uploaded && (
        <View className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
          <CheckCircle size={12} color="white" />
        </View>
      )}
      <View className="absolute bottom-0 left-0 right-0 bg-black/30 py-1 px-2">
        <Text className="text-white text-xs">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const PhotoSection = ({ title, description, type, photos, iconColor, bgColor, borderColor, textColor }:
    {
      title: string; description: string; type: 'room' | 'damage'; photos: Photo[];
      iconColor: string; bgColor: string; borderColor: string; textColor: string
    }) => {

    const isUploading = type === 'room' ? isUploadingRoom : isUploadingDamage;
    const isUploaded = type === 'room' ? roomPhotosUploaded : damagePhotosUploaded;
    const hasNewPhotos = photos.some(photo => !photo.uploaded);
    const uploadedCount = photos.filter(photo => photo.uploaded).length;
    const newPhotosCount = photos.filter(photo => !photo.uploaded).length;

    return (
      <View className={`rounded-xl shadow mb-4 p-5 ${bgColor}`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            {type === 'room' ?
              <Camera size={22} color={iconColor} className="mr-3" /> :
              <AlertTriangle size={22} color={iconColor} className="mr-3" />
            }
            <Text className={`font-bold text-lg ml-2 ${textColor}`}>
              {title}
            </Text>
            {/* Required indicator for room photos */}
            {type === 'room' && (
              <Text className="text-red-500 ml-1 text-lg font-bold">*</Text>
            )}
          </View>
          <View className={`px-3 py-1.5 rounded-full ${borderColor}`}>
            <Text className={`text-sm font-medium ${textColor}`}>
              {photos.length} photos
              {isUploaded && uploadedCount > 0 && (
                <Text className="text-green-600"> ({uploadedCount} uploaded)</Text>
              )}
            </Text>
          </View>
        </View>

        <Text className="text-gray-600 mb-4">
          {type === 'room' ? `${description} (Required before starting cleaning)` : description}
        </Text>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <View className="mb-4">
            <FlatList
              data={photos}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => renderPhotoThumbnail({ item, type })}
              keyExtractor={item => item.id}
              className="py-1"
            />
          </View>
        )}

        {/* Upload Button - Show only when there are new photos to upload */}
        {hasNewPhotos && (
          <TouchableOpacity
            className={`${isUploading ? 'bg-gray-400' : 'bg-green-500'} rounded-xl p-3 mb-4 flex-row items-center justify-center`}
            onPress={() => uploadPhotos(type)}
            disabled={isUploading}
          >
            <Upload size={18} color="white" className="mr-2" />
            <Text className="text-white font-medium ml-2">
              {isUploading ? `Uploading ${newPhotosCount} photo(s)...` : `Upload ${newPhotosCount} New Photo(s)`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Upload Success Message */}
        {isUploaded && !hasNewPhotos && (
          <View className="bg-green-100 rounded-xl p-3 mb-4 flex-row items-center justify-center">
            <CheckCircle size={18} color="#10B981" className="mr-2" />
            <Text className="text-green-700 font-medium ml-2">
              {uploadedCount} photo(s) uploaded successfully
            </Text>
          </View>
        )}

        {/* Add Photo Button */}
        <TouchableOpacity
          className={`border-2 border-dashed ${borderColor} rounded-xl h-20 justify-center items-center`}
          onPress={() => handlePhotoOptions(type)}
        >
          <Plus size={24} color={iconColor} />
          <Text className={`font-medium mt-1 ${textColor}`}>
            {isUploaded ? 'Add More Photos' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleStartCleaning = () => {
    router.push({
      pathname: "/(helper)/postcleaning",
      params: {
        checkList: params.checkList
      }
    });
  };

  // Show loading state while fetching existing photos
  if (isLoadingExistingPhotos) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="bg-gray-50 flex-1 justify-center items-center">
          <Text className="text-gray-600 text-lg">Loading existing photos...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-gray-50 flex-1">
        <View className="flex-1">
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="p-4">
              {/* Property Card */}
              <View className="bg-white rounded-xl shadow mb-5 overflow-hidden">
                <Image
                  source={{ uri: selectedJob?.property_detail.main_image }}
                  className="w-full h-40"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <Text className="text-gray-800 font-bold text-xl mb-1">
                    {selectedJob?.title}
                  </Text>
                  <View className="flex-row items-center">
                    <MapPin color="gray" size={22} />
                    <Text className="text-gray-500 ml-2">
                      {selectedJob?.property_detail.address}, {selectedJob?.property_detail.city}, {selectedJob?.property_detail.state}, {selectedJob?.property_detail.zip_code}
                    </Text>
                  </View>

                  <View className="flex-row mt-3 items-center">
                    <View className="bg-indigo-100 px-3 py-1.5 rounded-full mr-2">
                      <Text className="text-indigo-700 font-medium text-sm">
                        Due by <DateFormatter date={selectedJob?.end_time as string} format='shorttime' />
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Room Condition Photos */}
              <PhotoSection
                title="Room Condition"
                description="Take photos of the room's condition before cleaning (multiple selection supported)"
                type="room"
                photos={roomPhotos}
                iconColor="#6366F1"
                bgColor="bg-white"
                borderColor="border-indigo-200"
                textColor="text-indigo-600"
              />

              {/* Damage Report Photos */}
              <PhotoSection
                title="Damage Report"
                description="Document any damages you find in the property (multiple selection supported)"
                type="damage"
                photos={damagePhotos}
                iconColor="#EF4444"
                bgColor="bg-white"
                borderColor="border-red-200"
                textColor="text-red-600"
              />

              {/* Warning message if room photos not uploaded */}
              {!canStartCleaning && (
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center">
                    <AlertTriangle size={20} color="#F59E0B" className="mr-2" />
                    <Text className="text-amber-700 font-medium ml-2">
                      Room condition photos are required before starting cleaning
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row justify-between mt-2 mb-6">
                <TouchableOpacity
                  className="bg-white rounded-xl shadow p-4 flex-row items-center justify-center flex-1 mr-2"
                  onPress={() => {
                    setSelectedUser({
                      id: selectedJob?.property_detail?.connection_id,
                      username: '',
                      partner: {
                        phone_number: ''
                      }
                    });
                    router.push("/(helper)/chatroom")
                  }}
                >
                  <MessageSquare size={18} color="#4B5563" className="mr-2" />
                  <Text className="text-gray-700 font-medium ml-2">Message Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white rounded-xl shadow p-4 flex-row items-center justify-center flex-1 ml-2"
                  onPress={() => setShowHelpAlert(true)}
                >
                  <AlertTriangle size={18} color="#4B5563" className="mr-2" />
                  <Text className="text-gray-700 font-medium ml-2">Need Help</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Bottom action button */}
          <View className="absolute bottom-4 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
            <TouchableOpacity
              className={`${!canStartCleaning || isUploadingRoom || isUploadingDamage ? 'bg-gray-400' : 'bg-primary'} rounded-xl p-4 items-center`}
              disabled={!canStartCleaning || isUploadingRoom || isUploadingDamage}
              onPress={handleStartCleaning}
            >
              <Text className="text-white font-bold text-lg">
                {(isUploadingRoom || isUploadingDamage)
                  ? 'Uploading Images...'
                  : !canStartCleaning
                    ? 'Upload Room Photos to Start'
                    : 'Start Cleaning'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Viewer Modal */}
          <Modal
            visible={photoViewerVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setPhotoViewerVisible(false)}
          >
            <View className="flex-1 bg-black/95 justify-center items-center p-4">
              {selectedPhoto && (
                <>
                  <View className="w-full h-3/4 rounded-xl overflow-hidden">
                    <Image
                      source={{ uri: selectedPhoto.uri }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>

                  <View className="w-full flex-row justify-between items-center mt-4">
                    <View>
                      <Text className="text-white font-medium text-lg">
                        {currentPhotoType === 'room' ? 'Room Condition' : 'Damage Report'}
                      </Text>
                      <Text className="text-gray-300 text-sm">
                        Taken at {selectedPhoto.timestamp}
                      </Text>
                      {selectedPhoto.uploaded && (
                        <Text className="text-green-400 text-sm">✓ Uploaded</Text>
                      )}
                    </View>

                    <View className="flex-row">
                      <TouchableOpacity
                        className="bg-red-500 p-3 rounded-full mr-3"
                        onPress={confirmDelete}
                      >
                        <X size={20} color="white" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="bg-white p-3 rounded-full"
                        onPress={() => setPhotoViewerVisible(false)}
                      >
                        <Check size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          </Modal>
          {/* Error Alert */}
          <CustomAlert
            visible={showErrorAlert}
            type="danger"
            title="Error"
            message={errorMessage}
            onCancel={() => setShowErrorAlert(false)}
            onConfirm={() => setShowErrorAlert(false)}
            hideCancel
          />

          {/* Permission Alert */}
          <CustomAlert
            visible={showPermissionAlert}
            type="warning"
            title="Permission Needed"
            message="Please allow camera access to take photos"
            onCancel={() => setShowPermissionAlert(false)}
            onConfirm={() => setShowPermissionAlert(false)}
            hideCancel
          />

          {/* Delete Confirmation Alert */}
          <CustomAlert
            visible={showDeleteConfirmAlert}
            type="danger"
            title="Delete Photo"
            message="Are you sure you want to delete this photo?"
            onCancel={() => setShowDeleteConfirmAlert(false)}
            onConfirm={deletePhoto}
            confirmText="Delete"
          />

          <CustomAlert
            visible={showPhotoOptionsAlert}
            type="default"
            title="Add Photos"
            message="Choose how you want to add photos"
            confirmText="Access Camera"
            cancelText=" From Gallery"
            onCancel={() => {
              setShowPhotoOptionsAlert(false);
              launchGallery();
            }}
            onConfirm={() => {
              setShowPhotoOptionsAlert(false);
              setShowContinuousCamera(true);
            }}
          />

          <ContinuousCamera
            visible={showContinuousCamera}
            onClose={() => setShowContinuousCamera(false)}
            onPhotosCapture={(photos) => {
              if (currentPhotoType === 'room') {
                setRoomPhotos(prev => [...prev, ...photos]);
                setRoomPhotosUploaded(false);
              } else {
                setDamagePhotos(prev => [...prev, ...photos]);
                setDamagePhotosUploaded(false);
              }
              setShowContinuousCamera(false);
            }}
            photoType={currentPhotoType}
          />

          {/* Help Alert */}
          <CustomAlert
            visible={showHelpAlert}
            type="default"
            title="Help Center"
            message="Our support team is available 24/7. Do you want us to call you back?"
            confirmText="Yes, Call Me"
            cancelText="No Thanks"
            onCancel={() => setShowHelpAlert(false)}
            onConfirm={() => {
              setShowHelpAlert(false);
              // Implement call back functionality here
            }}
          />
          <CustomAlert
            visible={selectMoreImage}
            type="default"
            title="Photo Capture"
            message="Do you want to take another photo?"
            confirmText="Yes"
            cancelText="No "
            onCancel={() => setSelectMoreImage(false)}
            onConfirm={() => {
              takePhoto()
            }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}