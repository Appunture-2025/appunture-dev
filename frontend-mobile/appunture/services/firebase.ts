import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirebaseConfig } from "../config/firebaseConfig";

/**
 * Single Firebase app instance shared across the project.
 */
const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(getFirebaseConfig());

// Firebase v11 automatically handles persistence for React Native
// Just use getAuth() - it will use the default persistence mechanism
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseFirestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);

export { firebaseApp };
