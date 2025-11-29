import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
} from "firebase/auth";
import { User, AuthState, LoginCredentials, RegisterData } from "../types/user";
import { createLogger } from "../utils/logger";

const authLogger = createLogger("Auth");
import { apiService } from "../services/api";
import { firebaseAuth } from "../services/firebase";
import {
  storeToken,
  storeUserData,
  removeToken,
  removeUserData,
  getStoredToken,
  getStoredUserData,
} from "../services/storage";
import { signInWithGoogle, GoogleAuthConfig } from "../services/googleAuth";
import { signInWithApple, isAppleSignInAvailable } from "../services/appleAuth";

// Google OAuth Configuration - loaded from environment
const googleAuthConfig: GoogleAuthConfig = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
};

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateProfile: (data: { name: string; profession?: string }) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

type StoreSetter<T> = (
  partial: Partial<T> | ((state: T) => Partial<T>),
  replace?: boolean
) => void;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set: StoreSetter<AuthStore>, get: () => AuthStore) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });

          const credential = await signInWithEmailAndPassword(
            firebaseAuth,
            credentials.email.trim(),
            credentials.password
          );

          const idToken = await credential.user.getIdToken(true);
          await storeToken(idToken);

          let profile: User | null = null;
          try {
            profile = await apiService.getProfile();
          } catch (error) {
            profile = await apiService.syncFirebaseUser();
          }

          await storeUserData(profile);

          set({
            user: profile,
            token: idToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true });

          // Check if Google Sign-In is configured
          if (!googleAuthConfig.webClientId) {
            throw new Error(
              "Google Sign-In não configurado. " +
                "Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no arquivo .env"
            );
          }

          // Perform Google Sign-In using expo-auth-session
          const googleResult = await signInWithGoogle(googleAuthConfig);

          // Create Firebase credential from Google ID Token
          const credential = GoogleAuthProvider.credential(
            googleResult.idToken,
            googleResult.accessToken
          );

          // Sign in to Firebase with Google credential
          const userCredential = await signInWithCredential(
            firebaseAuth,
            credential
          );

          // Get Firebase ID Token for backend API
          const idToken = await userCredential.user.getIdToken(true);
          await storeToken(idToken);

          // Sync user profile with backend
          let profile: User | null = null;
          try {
            profile = await apiService.getProfile();
          } catch (error) {
            // User doesn't exist in backend yet, sync from Firebase
            profile = await apiService.syncFirebaseUser();
          }

          await storeUserData(profile);

          set({
            user: profile,
            token: idToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithApple: async () => {
        try {
          set({ isLoading: true });

          // Check if Apple Sign-In is available (iOS only)
          const isAvailable = await isAppleSignInAvailable();
          if (!isAvailable) {
            throw new Error(
              "Apple Sign-In está disponível apenas em dispositivos iOS 13 ou superior."
            );
          }

          // Perform Apple Sign-In
          const appleResult = await signInWithApple();

          // Create Firebase credential from Apple identity token
          const provider = new OAuthProvider("apple.com");
          const credential = provider.credential({
            idToken: appleResult.identityToken,
            rawNonce: undefined, // PKCE is handled by expo-apple-authentication
          });

          // Sign in to Firebase with Apple credential
          const userCredential = await signInWithCredential(
            firebaseAuth,
            credential
          );

          // Update display name if provided by Apple (only on first sign-in)
          if (appleResult.user?.fullName) {
            const { givenName, familyName } = appleResult.user.fullName;
            const displayName = [givenName, familyName]
              .filter(Boolean)
              .join(" ");

            if (displayName && userCredential.user) {
              await updateFirebaseProfile(userCredential.user, { displayName });
            }
          }

          // Get Firebase ID Token for backend API
          const idToken = await userCredential.user.getIdToken(true);
          await storeToken(idToken);

          // Sync user profile with backend
          let profile: User | null = null;
          try {
            profile = await apiService.getProfile();
          } catch (error) {
            // User doesn't exist in backend yet, sync from Firebase
            profile = await apiService.syncFirebaseUser();
          }

          await storeUserData(profile);

          set({
            user: profile,
            token: idToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true });

          const credential = await createUserWithEmailAndPassword(
            firebaseAuth,
            data.email.trim(),
            data.password
          );

          if (data.name) {
            await updateFirebaseProfile(credential.user, {
              displayName: data.name,
            });
          }

          const idToken = await credential.user.getIdToken(true);
          await storeToken(idToken);

          const profile = await apiService.syncFirebaseUser();
          await storeUserData(profile);

          set({
            user: profile,
            token: idToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          await firebaseSignOut(firebaseAuth);

          await removeToken();
          await removeUserData();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          authLogger.error("Logout error:", error);
          // Even if there's an error, clear the state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      loadStoredAuth: async () => {
        try {
          set({ isLoading: true });

          const [storedToken, storedUser] = await Promise.all([
            getStoredToken(),
            getStoredUserData(),
          ]);

          const firebaseUser = await new Promise<FirebaseUser | null>(
            (resolve) => {
              const unsubscribe = onAuthStateChanged(
                firebaseAuth,
                (user: FirebaseUser | null) => {
                  unsubscribe();
                  resolve(user);
                }
              );

              setTimeout(() => {
                unsubscribe();
                resolve(firebaseAuth.currentUser ?? null);
              }, 1500);
            }
          );

          if (!firebaseUser) {
            await removeToken();
            await removeUserData();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          const token = storedToken ?? (await firebaseUser.getIdToken());
          await storeToken(token);

          let profile = storedUser ?? null;

          if (!profile) {
            try {
              profile = await apiService.getProfile();
            } catch (error) {
              profile = await apiService.syncFirebaseUser();
            }
            await storeUserData(profile);
          }

          set({
            user: profile,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          authLogger.error("Load stored auth error:", error);
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: { name: string; profession?: string }) => {
        try {
          set({ isLoading: true });

          const response = await apiService.updateProfile(data);

          if (data.name && firebaseAuth.currentUser) {
            await updateFirebaseProfile(firebaseAuth.currentUser, {
              displayName: data.name,
            });
          }

          await storeUserData(response);

          set({
            user: response,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthStore) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
