import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  Check,
  CheckSquare,
  MapPin,
  MessageSquare,
  Plus,
  Square,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { updateCompleteJobStatus, uploadCleaningImages } from '@/api/jobApi';
import { toCamelCase } from '@/constants/camel';
import CustomAlert from '@/hooks/customAlert';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from '@/store/jobStore';
import { Property } from '@/types/propertytype';
import ContinuousCamera from './continousCamera';

// Type definitions
interface Photo {
  uri: string;
  id: string;
  timestamp: string;
  file?: {
    uri: string;
    type: string;
    name: string;
  };
}

interface ChecklistItem {
  id: number;
  property: number;
  property_detail: any;
  room: string;
  room_display: string;
  description: string;
  priority: string;
  priority_display: string;
  assigned_by: number;
  assigned_to: number;
  is_done: boolean;
  created_at: string;
}

interface AlertConfig {
  type: 'danger' | 'success' | 'warning' | 'default';
  title: string;
  message: string;
}

interface PriorityStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const PostCleaning: React.FC = () => {
  // State declarations
  const [roomPhotos, setRoomPhotos] = useState<Photo[]>([]);
  const [photoViewerVisible, setPhotoViewerVisible] = useState<boolean>(false);
  const [currentPhotoType, setCurrentPhotoType] = useState<string>('room');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    type: 'danger',
    title: 'Error',
    message: 'Failed to add photo'
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [iscomplete, setIsComplete] = useState<boolean>(false);
  const [photosUploaded, setPhotosUploaded] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [showPhotoOptionsAlert, setShowPhotoOptionsAlert] = useState<boolean>(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);

  // Hooks
  const params = useLocalSearchParams();
  const toast = useAppToast();
  const selectedJob = usePropertyStore((state) => state.selectedJob) as unknown as Property | undefined;

  // Parse checklist from params
  useEffect(() => {
    if (params.checkList) {
      try {
        const parsedChecklist: ChecklistItem[] = JSON.parse(params.checkList as string);
        setChecklist(parsedChecklist);
        console.log("Parsed checklist:", parsedChecklist);
      } catch (error) {
        console.error("Error parsing checklist:", error);
        setChecklist([]);
      }
    }
  }, [params.checkList]);

  // Check if all tasks are completed
  const areAllTasksCompleted = (): boolean => {
    if (checklist.length === 0) {
      return true;
    }
    return completedTasks.size === checklist.length;
  };

  // UPDATED: Check if job can be completed - Fixed logic
  const canCompleteJob = (): boolean => {
    // Check if we have photos
    const hasPhotos = roomPhotos.length > 0;
    
    // Check if all checklist tasks are completed (if checklist exists)
    const checklistComplete = checklist.length === 0 || areAllTasksCompleted();
    
    // Both conditions must be met
    return hasPhotos && checklistComplete;
  };

  // UPDATED: Get completion button text with better messaging
  const getCompletionButtonText = (): string => {
    const hasPhotos = roomPhotos.length > 0;
    const checklistComplete = checklist.length === 0 || areAllTasksCompleted();
    
    if (!hasPhotos && !checklistComplete) {
      return 'Add Photos & Complete Tasks';
    }
    
    if (!hasPhotos) {
      return 'Add Photos to Continue';
    }
    
    if (!checklistComplete) {
      return 'Complete All Tasks';
    }
    
    if (!photosUploaded) {
      return 'Upload Photos & Complete Job';
    }
    
    return 'Complete Cleaning Job';
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: number): void => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Get priority style
  const getPriorityStyle = (priority: string): PriorityStyle => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
        };
      case 'medium':
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
        };
      case 'low':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
        };
    }
  };

  // Group checklist by room
  const groupedChecklist: Record<string, ChecklistItem[]> = Array.isArray(checklist) 
    ? checklist.reduce((acc, item) => {
        const room = item.room_display || item.room;
        if (!acc[room]) {
          acc[room] = [];
        }
        acc[room].push(item);
        return acc;
      }, {} as Record<string, ChecklistItem[]>)
    : {};

  // Pick image function
  const pickImage = (): void => {
    setShowPhotoOptionsAlert(true);
  };

  // Take photo with custom camera
  const takePhotoWithCustomCamera = (): void => {
    setCameraVisible(true);
  };

  // Handle photos from custom camera
  const handlePhotosFromCamera = (photos: Photo[]): void => {
    const formattedPhotos = photos.map(photo => ({
      ...photo,
      file: {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `room_${Date.now()}_${Math.random()}.jpg`,
      }
    }));
    
    setRoomPhotos(prev => [...prev, ...formattedPhotos]);
    setPhotosUploaded(false); // Reset upload status when new photos are added
    setCameraVisible(false);
  };

  // Launch gallery for photo selection
  const launchGallery = async (): Promise<void> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMessage("Permission to access media library is required");
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
            file: {
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
            }
          };
          
          newPhotos.push(newPhoto);
        });
        
        setRoomPhotos(prev => [...prev, ...newPhotos]);
        setPhotosUploaded(false); // Reset upload status when new photos are added
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

  // Upload all room photos
  const uploadRoomPhotos = async (): Promise<void> => {
    if (!selectedJob?.id) {
      setAlertConfig({
        type: 'danger',
        title: 'Error',
        message: 'Job ID is required for upload'
      });
      setShowAlert(true);
      return;
    }

    if (roomPhotos.length === 0) {
      setAlertConfig({
        type: 'danger',
        title: 'No Photos',
        message: 'Please add at least one photo before uploading'
      });
      setShowAlert(true);
      return;
    }

    try {
      console.log('Starting upload for post-cleaning photos');
      console.log('Job ID:', selectedJob?.id);
      
      setIsUploading(true);

      const formattedImages = roomPhotos.map((photo, index) => {
        const file = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `room_${Date.now()}_${index}.jpg`,
        };
        
        console.log(`Processing image ${index + 1}:`, {
          hasUri: !!file.uri,
          imageType: "after",
          name: file.name,
          type: file.type
        });
        
        return {
          file: file,
          type: "after"
        };
      });

      console.log('Images array:', formattedImages);

      const result = await uploadCleaningImages(selectedJob?.id, formattedImages);
      console.log('Upload result:', result);

      if (result.success) {
        console.log("Post-cleaning images uploaded successfully");
        setPhotosUploaded(true);
        setAlertConfig({
          type: 'success',
          title: 'Success',
          message: result.message || 'Images uploaded successfully!'
        });
        setShowAlert(true);
      } else {
        console.log("Upload failed:", result.message);
        setAlertConfig({
          type: 'danger',
          title: 'Upload Failed',
          message: result.message || result.error || 'Failed to upload images'
        });
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setAlertConfig({
        type: 'danger',
        title: 'Upload Error',
        message: `Upload failed: ${error}`
      });
      setShowAlert(true);
    } finally {
      setIsUploading(false);
    }
  };

  // UPDATED: Handle completion with better validation
  const handleCompleteWithUpload = async (): Promise<void> => {
    // Check if we have photos
    if (roomPhotos.length === 0) {
      setAlertConfig({
        type: 'danger',
        title: 'Photos Required',
        message: 'Please add at least one photo before completing the job'
      });
      setShowAlert(true);
      return;
    }

    // Check if checklist is complete (if it exists)
    if (checklist.length > 0 && !areAllTasksCompleted()) {
      setAlertConfig({
        type: 'danger',
        title: 'Incomplete Tasks',
        message: 'Please complete all checklist items before finishing the job'
      });
      setShowAlert(true);
      return;
    }

    // If photos are not uploaded yet, upload them first
    if (!photosUploaded) {
      await uploadRoomPhotos();
      
      // Check if upload was successful before proceeding
      if (!photosUploaded) {
        setAlertConfig({
          type: 'danger',
          title: 'Upload Required',
          message: 'Please upload photos successfully before completing the job'
        });
        setShowAlert(true);
        return;
      }
    }

    // Proceed with job completion
    try {
      setIsComplete(true); 
     
      const result = await updateCompleteJobStatus(selectedJob?.id);

      if (result.success) {
        toast.success("You have successfully completed the job!");
        setIsComplete(false); 
        router.replace("/(root_cleaner)/(tabs)");
        return;
      } else {
        toast.error("Something went wrong while completing the job.");
        setIsComplete(false); 
      }
    } catch (error) {
      console.error("Completion error:", error);
      toast.error("Something went wrong while completing the job.");
      setIsComplete(false);
    }
  };

  // View a specific photo
  const viewPhoto = (photo: Photo, type: string): void => {
    setSelectedPhoto(photo);
    setCurrentPhotoType(type);
    setPhotoViewerVisible(true);
  };

  // Delete a photo
  const deletePhoto = (photoId: string, type: string): void => {
    if (type === 'room') {
      const updatedPhotos = roomPhotos.filter(photo => photo.id !== photoId);
      setRoomPhotos(updatedPhotos);
      
      // If no photos left, reset upload status
      if (updatedPhotos.length === 0) {
        setPhotosUploaded(false);
      }
    }
    setPhotoViewerVisible(false);
  };

  // Render individual photo thumbnail
  const renderPhotoThumbnail = (photo: Photo, type: string) => (
    <TouchableOpacity 
      key={photo.id}
      className="w-24 h-24 m-1 rounded-lg overflow-hidden border border-gray-200"
      onPress={() => viewPhoto(photo, type)}
    >
      <Image 
        source={{ uri: photo.uri }} 
        className="w-full h-full" 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex-1 bg-white'>
        <View className="flex-1">
          <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
              {/* Property Card */}
              <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
                <View className="p-4 flex-row items-center">
                  <View className="w-16 h-16 rounded-full overflow-hidden mr-3">
                    <Image 
                      source={{ uri: selectedJob?.property_detail.main_image }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text className="text-primary font-bold text-lg">
                      {selectedJob?.title}
                    </Text>
                    <View className="flex-row items-center">
                      <MapPin size={16} color="#666" className="mr-1" />
                      <Text className="text-gray-600 text-sm">
                        {selectedJob?.property_detail.address}, {selectedJob?.property_detail.city}, {selectedJob?.property_detail.state}, {selectedJob?.property_detail.zip_code}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

             
              <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Camera size={20} color="#6366F1" className="mr-2" />
                    <Text className="text-primary font-bold text-lg ml-2">
                      Upload Room Condition
                    </Text>
                  </View>
                  <View className="bg-indigo-100 px-2 py-1 rounded-full">
                    <Text className="text-xs text-primary font-medium">
                      {roomPhotos.length} photos
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-500 mb-3">
                  Take photos of the room's condition after cleaning (multiple selection supported)
                </Text>
                
                {/* Photo Gallery */}
                {roomPhotos.length > 0 && (
                  <View className="mb-3">
                    <FlatList
                      data={roomPhotos}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      renderItem={({item}) => renderPhotoThumbnail(item, 'room')}
                      keyExtractor={item => item.id}
                      className="py-2"
                    />
                  </View>
                )}
           
                
                {/* Add Photo Button */}
                <TouchableOpacity 
                  className="border-2 border-dashed border-indigo-200 rounded-xl h-32 justify-center items-center bg-indigo-50 mb-3"
                  onPress={pickImage}
                  disabled={isUploading}
                >
                  <Plus size={24} color="#6366F1" />
                  <Text className="text-indigo-500 font-medium mt-1">
                    {roomPhotos.length > 0 ? 'Add More Photos' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>

                {/* Upload Button - Only show when there are photos */}
                {roomPhotos.length > 0 && (
                  <TouchableOpacity 
                    className="bg-green-500 rounded-xl p-3 flex-row items-center justify-center"
                    onPress={uploadRoomPhotos}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-medium ml-2">Uploading...</Text>
                      </>
                    ) : (
                      <>
                        <Camera size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          {photosUploaded ? 'Re-upload Photos' : 'Upload Photos'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Checklist Section - Only show if checklist exists */}
              {checklist.length > 0 && (
                <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-primary font-bold text-lg">
                      Cleaning Checklist
                    </Text>
                    <View className="bg-indigo-100 px-3 py-1 rounded-full">
                      <Text className="text-xs text-primary font-medium">
                        {completedTasks.size}/{checklist.length} completed
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="bg-gray-200 rounded-full h-2 mb-4">
                    <View 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${checklist.length > 0 ? (completedTasks.size / checklist.length) * 100 : 0}%` 
                      }}
                    />
                  </View>

                  {/* Filter Buttons */}
                  <View className="flex-row mb-3 bg-gray-50 rounded-lg p-2">
                    {['all', 'high', 'medium', 'low'].map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        className={`flex-1 py-2 px-3 rounded-lg mr-2 ml-2 last:mr-0 ${
                          priorityFilter === filter ? 'bg-indigo-600' : 'bg-gray-100'
                        }`}
                        onPress={() => setPriorityFilter(filter)}
                      >
                        <Text className={`text-center text-xs font-medium capitalize ${
                          priorityFilter === filter ? 'text-white' : 'text-gray-600'
                        }`}>
                          {toCamelCase(filter)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Grouped Checklist with Filtering */}
                  {Object.keys(groupedChecklist).map((room, roomIndex) => {
                    const filteredItems = priorityFilter === 'all'
                      ? groupedChecklist[room]
                      : groupedChecklist[room].filter(item => {
                          const itemPriority = (item.priority_display || item.priority).toLowerCase();
                          return itemPriority === priorityFilter.toLowerCase();
                        });

                    if (filteredItems.length === 0) return null;

                    const sortedItems = [...filteredItems].sort((a, b) => {
                      const priorityOrder: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
                      const aPriority = (a.priority_display || a.priority).toLowerCase();
                      const bPriority = (b.priority_display || b.priority).toLowerCase();
                      return (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
                    });

                    return (
                      <View key={roomIndex} className="mb-4 last:mb-0">
                        {/* Room Header */}
                        <View className=" px-3 mt-2 py-2 rounded-t-lg ">
                          <Text className="font-semibold text-gray-70 text-sm">
                            {room} ({sortedItems.length} {priorityFilter !== 'all' ? priorityFilter : 'tasks'})
                          </Text>
                        </View>

                        {/* Room Tasks */}
                        <View className="bg-white  border-gray-200">
                          {sortedItems.map((item, index) => {
                            const priorityStyle = getPriorityStyle(item.priority_display || item.priority);
                            const isCompleted = completedTasks.has(item.id);
                            
                            return (
                              <TouchableOpacity
                                key={item.id}
                                className={`p-3 flex-row items-start ${
                                  index !== sortedItems.length - 1 ? 'border-b border-gray-100' : ''
                                } ${isCompleted ? 'bg-green-50' : 'bg-white'}`}
                                onPress={() => toggleTaskCompletion(item.id)}
                                activeOpacity={0.7}
                              >
                                {/* Checkbox */}
                                <View className="mr-3 mt-1">
                                  {isCompleted ? (
                                    <CheckSquare size={20} color="#22C55E" />
                                  ) : (
                                    <Square size={20} color="#9CA3AF" />
                                  )}
                                </View>

                                {/* Task Content */}
                                <View className="flex-1">
                                  <View className="flex-row items-start justify-between">
                                    <Text className={`text-sm font-medium flex-1 mr-2 ${
                                      isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                                    }`}>
                                      {item.description}
                                    </Text>

                                    {/* Priority Badge */}
                                    <View className={`px-2 py-1 rounded-full ${priorityStyle.bgColor} ${priorityStyle.borderColor} border`}>
                                      <Text className={`text-xs font-medium ${priorityStyle.textColor}`}>
                                        {item.priority_display || item.priority}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Message Owner Button */}
              <TouchableOpacity 
                className="bg-white rounded-xl shadow-sm mb-6 p-4 flex-row items-center justify-center"
                onPress={() => router.push("/(root_cleaner)/(tabs)/chat")}
              >
                <MessageSquare size={20} color="#4B5563" className="mr-2" />
                <Text className="text-gray-700 font-medium">Message owner</Text>
              </TouchableOpacity>
            </View>
            
            {/* Photo Viewer Modal */}
            <Modal
              visible={photoViewerVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setPhotoViewerVisible(false)}
            >
              <View className="flex-1 bg-black/90 justify-center items-center p-4">
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
                        <Text className="text-white font-medium">
                          {currentPhotoType === 'room' ? 'Room Condition' : 'Damage Report'}
                        </Text>
                        <Text className="text-gray-300 text-sm">
                          Taken at {selectedPhoto.timestamp}
                        </Text>
                      </View>
                      
                      <View className="flex-row">
                        <TouchableOpacity 
                          className="bg-red-500 p-3 rounded-full mr-3"
                          onPress={() => deletePhoto(selectedPhoto.id, currentPhotoType)}
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
          </ScrollView>
          
          {/* UPDATED: Completion Button with better logic */}
          <View className='p-4 bg-white pb-0'>
            <TouchableOpacity 
              className={`rounded-xl shadow-sm p-4 mb-6 items-center ${
                canCompleteJob() ? 'bg-primary' : 'bg-gray-400'
              }`}
              onPress={handleCompleteWithUpload}
              disabled={iscomplete || !canCompleteJob()}
            >
              {iscomplete ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">
                  {getCompletionButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Continuous Camera Modal */}
        <ContinuousCamera
          visible={cameraVisible}
          onClose={() => setCameraVisible(false)}
          onPhotosCapture={handlePhotosFromCamera}
          photoType="room"
        />

        {/* Custom Alerts */}
        <CustomAlert
          visible={showAlert}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onCancel={() => setShowAlert(false)}
          onConfirm={() => setShowAlert(false)}
          hideCancel
        />

        <CustomAlert
          visible={showErrorAlert}
          type="danger"
          title="Error"
          message={errorMessage}
          onCancel={() => setShowErrorAlert(false)}
          onConfirm={() => setShowErrorAlert(false)}
          hideCancel
        />
        
        <CustomAlert
          visible={showPermissionAlert}
          type="warning"
          title="Permission Needed"
          message="Please allow camera access to take photos"
          onCancel={() => setShowPermissionAlert(false)}
          onConfirm={() => setShowPermissionAlert(false)}
          hideCancel
        />
        
        {/* Photo Options Alert */}
        <CustomAlert
          visible={showPhotoOptionsAlert}
          type="default"
          title="Add Photo"
          message="Choose how you want to add photos"
          confirmText="Access Camera"
          cancelText="Gallery"
          onCancel={() => {
            setShowPhotoOptionsAlert(false);
            launchGallery();
          }}
          onConfirm={() => {
            setShowPhotoOptionsAlert(false);
            takePhotoWithCustomCamera();
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default PostCleaning;