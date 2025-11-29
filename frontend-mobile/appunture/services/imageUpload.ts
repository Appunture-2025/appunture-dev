/**
 * Image Upload Service
 *
 * Provides functionality for picking, compressing, and uploading images.
 * Used primarily for profile photo uploads.
 */

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import { createLogger } from "../utils/logger";

const logger = createLogger("ImageUpload");

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

const DEFAULT_OPTIONS: ImagePickerOptions = {
  allowsEditing: true,
  aspect: [1, 1], // Square for profile photos
  quality: 0.8,
};

/**
 * Request permission for media library access
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  } catch (error) {
    logger.error("Failed to request media library permission:", error);
    return false;
  }
}

/**
 * Request permission for camera access
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  } catch (error) {
    logger.error("Failed to request camera permission:", error);
    return false;
  }
}

/**
 * Pick an image from the device's media library
 * @returns The URI of the selected image, or null if cancelled
 */
export async function pickImage(
  options: ImagePickerOptions = {}
): Promise<string | null> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    throw new Error("Permissão de acesso à galeria negada");
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: mergedOptions.allowsEditing,
      aspect: mergedOptions.aspect,
      quality: mergedOptions.quality,
    });

    if (result.canceled) {
      logger.info("Image pick cancelled");
      return null;
    }

    const uri = result.assets[0].uri;
    logger.info("Image picked successfully");
    return uri;
  } catch (error) {
    logger.error("Failed to pick image:", error);
    throw new Error("Falha ao selecionar imagem");
  }
}

/**
 * Take a photo using the device's camera
 * @returns The URI of the captured photo, or null if cancelled
 */
export async function takePhoto(
  options: ImagePickerOptions = {}
): Promise<string | null> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error("Permissão de câmera negada");
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: mergedOptions.allowsEditing,
      aspect: mergedOptions.aspect,
      quality: mergedOptions.quality,
    });

    if (result.canceled) {
      logger.info("Photo capture cancelled");
      return null;
    }

    const uri = result.assets[0].uri;
    logger.info("Photo captured successfully");
    return uri;
  } catch (error) {
    logger.error("Failed to capture photo:", error);
    throw new Error("Falha ao tirar foto");
  }
}

/**
 * Compress and resize an image
 * @param uri The URI of the image to compress
 * @param maxSize The maximum width/height (default 500)
 * @param quality Compression quality 0-1 (default 0.7)
 */
export async function compressImage(
  uri: string,
  maxSize: number = 500,
  quality: number = 0.7
): Promise<string> {
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxSize, height: maxSize } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    logger.info("Image compressed successfully");
    return manipulated.uri;
  } catch (error) {
    logger.error("Failed to compress image:", error);
    throw new Error("Falha ao processar imagem");
  }
}

/**
 * Create FormData for image upload
 */
export function createImageFormData(
  uri: string,
  fieldName: string = "file",
  type: string = "profile"
): FormData {
  const formData = new FormData();

  const filename = `${type}_${Date.now()}.jpg`;
  const fileUri = Platform.OS === "ios" ? uri.replace("file://", "") : uri;

  const file = {
    uri: fileUri,
    type: "image/jpeg",
    name: filename,
  } as any;

  formData.append(fieldName, file);
  formData.append("type", type);

  return formData;
}

/**
 * Upload a profile image
 * @param uri The URI of the image to upload
 * @param uploadFn The upload function from API service
 * @param onProgress Optional progress callback (0-100)
 */
export async function uploadProfileImage(
  uri: string,
  uploadFn: (
    formData: FormData,
    onProgress?: (progress: number) => void
  ) => Promise<UploadResult>,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // Compress before upload
    const compressedUri = await compressImage(uri);

    // Create form data
    const formData = createImageFormData(compressedUri, "file", "profile");

    // Upload via provided function
    const result = await uploadFn(formData, onProgress);

    logger.info("Profile image uploaded successfully");
    return result;
  } catch (error) {
    logger.error("Failed to upload profile image:", error);
    throw error;
  }
}

/**
 * Show image picker options (camera or gallery)
 * @returns Object with pick and take functions
 */
export function useImagePicker(options: ImagePickerOptions = {}) {
  return {
    pickFromGallery: () => pickImage(options),
    takeWithCamera: () => takePhoto(options),
  };
}
