import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirebaseConfig } from "../config/firebaseConfig";

/**
 * Single Firebase app instance shared across the project.
 */
const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(getFirebaseConfig());

/**
 * Firebase Auth with AsyncStorage persistence for React Native.
 * This ensures the user stays logged in between app restarts.
 */
let firebaseAuth;
try {
  // Try to initialize with persistence (first time)
  firebaseAuth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized, just get the existing instance
  firebaseAuth = getAuth(firebaseApp);
}

export const firebaseFirestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);

export { firebaseApp, firebaseAuth };
