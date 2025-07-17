import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, FlatList, SafeAreaView, Alert } from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { X, RotateCcw, Zap, ZapOff, Grid3X3, Check, Trash2 } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';

interface Photo {
  uri: string;
  id: string;
  timestamp: string;
}

interface ContinuousCameraProps {
  visible: boolean;
  onClose: () => void;
  onPhotosCapture: (photos: Photo[]) => void;
  photoType: 'room' | 'damage';
}

export default function ContinuousCamera({ 
  visible, 
  onClose, 
  onPhotosCapture, 
  photoType 
}: ContinuousCameraProps): JSX.Element {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedPhotos, setCapturedPhotos] = useState<Photo[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCapturedPhotos([]);
    }
  }, [visible]);

  // Check permissions
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black">
          <Text className="text-white text-center mb-4">
            We need your permission to show the camera
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={requestPermission}
          >
            <Text className="text-white font-medium">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // Take photo function
// Take photo function
const takePicture = async (): Promise<void> => {
  if (cameraRef.current && !isCapturing) {
    try {
      setIsCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        const now = new Date();
        const newPhoto: Photo = {
          uri: photo.uri,
          id: `${Date.now()}_${Math.random()}`,
          timestamp: now.toLocaleString()
        };

        // Add to captured photos
        setCapturedPhotos(prev => [...prev, newPhoto]);
        
        console.log(`Photo captured: ${newPhoto.id}`);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  }
};


  // Toggle camera type
  const toggleCameraType = (): void => {
    setFacing(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  // Toggle flash
  const toggleFlash = (): void => {
    setFlash(current => 
      current === 'off' ? 'on' : 'off'
    );
  };

  // Delete photo
  const deletePhoto = (photoId: string): void => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  // Finish and return photos
  const finishCapture = (): void => {
    onPhotosCapture(capturedPhotos);
    onClose();
  };

  // Close without saving
  const closeCamera = (): void => {
    if (capturedPhotos.length > 0) {
      Alert.alert(
        'Discard Photos?',
        `You have ${capturedPhotos.length} photos. Are you sure you want to discard them?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setCapturedPhotos([]);
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  // Render photo thumbnail
  const renderPhotoThumbnail = ({ item }: { item: Photo }): JSX.Element => (
    <View className="relative mr-2 mt-2">
      <Image
        source={{ uri: item.uri }}
        className="w-16 h-16 rounded-lg"
        resizeMode="cover"
      />
      <TouchableOpacity
        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
        onPress={() => deletePhoto(item.id)}
      >
        <X size={12} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView className="flex-1 bg-black">
        {/* Camera View */}
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          flash={flash}
        >
          {/* Grid Overlay */}
          {showGrid && (
            <View className="absolute inset-0">
              {/* Horizontal lines */}
              <View className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
              <View className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
              {/* Vertical lines */}
              <View className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
              <View className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
            </View>
          )}

          {/* Top Controls */}
          <View className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-6">
            <TouchableOpacity
              className="bg-black/50 rounded-full p-3"
              onPress={closeCamera}
            >
              <X size={24} color="white" />
            </TouchableOpacity>

            <View className="bg-black/50 rounded-full px-4 py-2">
              <Text className="text-white font-medium">
                {photoType === 'room' ? 'Room Photos' : 'Damage Report'}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="bg-black/50 rounded-full p-3 mr-2"
                onPress={toggleFlash}
              >
                {flash === 'off' ? (
                  <ZapOff size={24} color="white" />
                ) : (
                  <Zap size={24} color="yellow" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-black/50 rounded-full p-3"
                onPress={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 size={24} color={showGrid ? 'yellow' : 'white'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 pb-8">
            {/* Captured Photos Preview */}
            {capturedPhotos.length > 0 && (
              <View className="px-6 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white font-medium">
                    {capturedPhotos.length} photo(s) captured
                  </Text>
                  <TouchableOpacity
                    className="bg-green-500 rounded-full px-4 py-2"
                    onPress={finishCapture}
                  >
                    <Text className="text-white font-medium">Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={capturedPhotos}
                  horizontal
                  renderItem={renderPhotoThumbnail}
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {/* Camera Controls */}
            <View className="flex-row justify-center items-center px-6">
              <View className="flex-1" />
              
              {/* Capture Button */}
              <TouchableOpacity
                className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${
                  isCapturing ? 'bg-gray-400' : 'bg-transparent'
                }`}
                onPress={takePicture}
                disabled={isCapturing}
              >
                <View className="w-16 h-16 rounded-full bg-white" />
              </TouchableOpacity>

              {/* Flip Camera */}
              <View className="flex-1 items-end">
                <TouchableOpacity
                  className="bg-black/50 rounded-full p-3"
                  onPress={toggleCameraType}
                >
                  <RotateCcw size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    </Modal>
  );
}