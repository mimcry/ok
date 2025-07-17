// imageUtils.js
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

/**
 * Gets the file type from a URI
 * @param {string} uri - The URI of the file
 * @returns {string} - The file type
 */
export const getFileTypeFromUri = (uri) => {
  const uriParts = uri.split('.');
  return uriParts[uriParts.length - 1];
};

/**
 * Gets the mime type based on file extension
 * @param {string} fileType - The file extension
 * @returns {string} - The mime type
 */
export const getMimeType = (fileType) => {
  switch (fileType.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'heic':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
};

/**
 * Opens image picker and returns selected image
 * @param {Object} options - Image picker options
 * @returns {Promise<Object>} - Selected image info or error
 */
export const pickImageFromLibrary = async (options = {}) => {
  try {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      return { success: false, error: 'Permission denied' };
    }

    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    const result = await ImagePicker.launchImageLibraryAsync({
      ...defaultOptions,
      ...options
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    // Get image info
    const selectedImage = result.assets[0];
    const fileType = getFileTypeFromUri(selectedImage.uri);
    const mimeType = getMimeType(fileType);

    return {
      success: true,
      uri: selectedImage.uri,
      fileType,
      mimeType,
      width: selectedImage.width,
      height: selectedImage.height,
      fileSize: selectedImage.fileSize,
      fileName: `profile-image.${fileType}`
    };
  } catch (error) {
    console.error("Error picking image:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Compresses an image if it's larger than the specified max size
 * @param {string} uri - The URI of the image
 * @param {number} maxSizeKB - Maximum size in KB
 * @returns {Promise<string>} - The URI of the compressed image
 */
export const compressImageIfNeeded = async (uri, maxSizeKB = 500) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    // If file size is less than max, return original
    if (fileInfo.size / 1024 <= maxSizeKB) {
      return uri;
    }
    
    // Calculate compression quality (higher size = lower quality)
    const sizeRatio = maxSizeKB / (fileInfo.size / 1024);
    const quality = Math.min(0.8, Math.max(0.1, sizeRatio));
    
    // Create a new filename
    const fileType = getFileTypeFromUri(uri);
    const newPath = `${FileSystem.cacheDirectory}compressed-${Date.now()}.${fileType}`;
    
    // Compress the image
    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });
    
    // Return the new URI
    return newPath;
  } catch (error) {
    console.error("Error compressing image:", error);
    return uri; // Return original if compression fails
  }
};