import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

interface PermissionStatus {
  camera: boolean;
  mediaLibrary: boolean;
  allGranted: boolean;
  loading: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    mediaLibrary: false,
    allGranted: false,
    loading: true,
  });

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const checkAndRequestPermissions = async () => {
    try {
      // Check current permissions first
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.getPermissionsAsync();

      let finalCameraStatus = cameraStatus;
      let finalMediaStatus = mediaStatus;

      // Request permissions only if not already granted
      if (cameraStatus.status !== 'granted') {
        finalCameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      }

      if (mediaStatus.status !== 'granted') {
        finalMediaStatus = await MediaLibrary.requestPermissionsAsync();
      }

      const cameraGranted = finalCameraStatus.status === 'granted';
      const mediaGranted = finalMediaStatus.status === 'granted';

      setPermissions({
        camera: cameraGranted,
        mediaLibrary: mediaGranted,
        allGranted: cameraGranted && mediaGranted,
        loading: false,
      });

    } catch (error) {
      console.error('Permission error:', error);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  };

  const requestPermissions = async () => {
    setPermissions(prev => ({ ...prev, loading: true }));
    await checkAndRequestPermissions();
  };

  return { permissions, requestPermissions };
};