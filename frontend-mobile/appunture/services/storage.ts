import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { STORAGE_KEYS } from "../utils/constants";
import { User, AppSettings } from "../types/user";
import { apiService } from "./api";
import { storageLogger as logger } from "../utils/logger";

// Secure storage for sensitive data
export const storeToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    logger.error("Error storing token:", error);
    throw error;
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    logger.error("Error getting token:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    logger.error("Error removing token:", error);
  }
};

// Regular storage for non-sensitive data
export const storeUserData = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    logger.error("Error storing user data:", error);
    throw error;
  }
};

export const getStoredUserData = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    logger.error("Error getting user data:", error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    logger.error("Error removing user data:", error);
  }
};

// App settings
export const storeSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    logger.error("Error storing settings:", error);
    throw error;
  }
};

export const getStoredSettings = async (): Promise<AppSettings | null> => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    logger.error("Error getting settings:", error);
    return null;
  }
};

// Last sync timestamp
export const storeLastSync = async (timestamp: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  } catch (error) {
    logger.error("Error storing last sync:", error);
  }
};

export const getLastSync = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    logger.error("Error getting last sync:", error);
    return null;
  }
};

// Generic storage functions
export const storeData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logger.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error(`Error removing data for key ${key}:`, error);
  }
};

// Clear all stored data
export const clearAllData = async (): Promise<void> => {
  try {
    await Promise.all([
      removeToken(),
      removeUserData(),
      AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC),
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA),
    ]);
  } catch (error) {
    logger.error("Error clearing all data:", error);
  }
};

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

const normaliseFileName = (uri: string): string => {
  const cleaned = uri.split(/[?#]/)[0] ?? "image.jpg";
  const fileName = cleaned.split("/").pop() ?? "image.jpg";
  return fileName.includes(".") ? fileName : `${fileName}.jpg`;
};

const resolveMimeType = (uri: string): string => {
  const fileName = normaliseFileName(uri);
  const extension = fileName.split(".").pop()?.toLowerCase();
  return (extension && MIME_TYPES[extension]) || "image/jpeg";
};

export interface UploadProgressState {
  index: number;
  progress: number;
}

export const mediaStorageService = {
  async pickImage(allowsMultiple = false): Promise<ImagePickerAsset[]> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permissão de acesso às fotos negada");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: allowsMultiple,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      orderedSelection: true,
      selectionLimit: allowsMultiple ? 0 : 1,
    });

    if (result.canceled || !result.assets?.length) {
      return [];
    }

    return result.assets;
  },

  async takePicture(): Promise<ImagePickerAsset | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permissão de câmera negada");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0];
  },

  async compressImage(
    uri: string,
    maxWidth = 1200,
    maxHeight = 1200
  ): Promise<string> {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipResult.uri;
  },

  async uploadImage(
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const compressedUri = await this.compressImage(uri);
    const fileName = normaliseFileName(compressedUri);

    const formData = new FormData();
    formData.append("file", {
      uri:
        Platform.OS === "ios" && compressedUri.startsWith("file://")
          ? compressedUri.replace("file://", "")
          : compressedUri,
      name: fileName,
      type: resolveMimeType(compressedUri),
    } as unknown as Blob);

    const response = await apiService.uploadFile(formData, onProgress);
    return response.url;
  },

  async uploadMultipleImages(
    uris: string[],
    onProgress?: (state: UploadProgressState) => void
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let index = 0; index < uris.length; index += 1) {
      const url = await this.uploadImage(uris[index], (progress) =>
        onProgress?.({ index, progress })
      );
      urls.push(url);
    }

    return urls;
  },
};
