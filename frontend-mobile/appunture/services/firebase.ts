import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirebaseConfig } from "../config/firebaseConfig";

/**
 * Single Firebase app instance shared across the project.
 */
const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(getFirebaseConfig());

// Initialize Auth with AsyncStorage persistence for React Native
// On web, use default persistence
const initFirebaseAuth = () => {
  if (getApps().length > 1) {
    // App already initialized, just get auth
    return getAuth(firebaseApp);
  }

  if (Platform.OS === "web") {
    return getAuth(firebaseApp);
  }

  // For React Native, use AsyncStorage persistence
  return initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
};

export const firebaseAuth = initFirebaseAuth();
export const firebaseFirestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);

export { firebaseApp };
