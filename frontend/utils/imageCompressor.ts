import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * Compresses an image to be roughly within 1MB.
 * @param uri The URI of the image to compress.
 * @returns The URI of the compressed image.
 */
export const compressImage = async (uri: string): Promise<string> => {
  // If it's already a web URL, we don't compress it here
  if (uri.startsWith('http') && !uri.startsWith('blob:')) {
    return uri;
  }

  try {
    // Basic compression: reduce quality and possibly dimensions
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize to a reasonable width while maintaining aspect ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% quality usually drops size significantly
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original if compression fails
  }
};
