import { create } from "zustand";
import { persist } from "zustand/middleware";
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

          // For web, use signInWithPopup
          // For mobile, we need Google Sign-In library
          // This is a placeholder implementation
          // In production, use @react-native-google-signin/google-signin for mobile
          
          throw new Error(
            "Google Sign-In requer configuração adicional. " +
            "Para React Native, instale @react-native-google-signin/google-signin. " +
            "Para web, use signInWithPopup do Firebase Auth."
          );

          // Example web implementation:
          // const provider = new GoogleAuthProvider();
          // const result = await signInWithPopup(firebaseAuth, provider);
          // const idToken = await result.user.getIdToken(true);
          // await storeToken(idToken);
          // const profile = await apiService.syncFirebaseUser();
          // await storeUserData(profile);
          // set({ user: profile, token: idToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithApple: async () => {
        try {
          set({ isLoading: true });

          // For iOS, use Apple Sign-In
          // This is a placeholder implementation
          // In production, use expo-apple-authentication or native modules
          
          throw new Error(
            "Apple Sign-In requer configuração adicional. " +
            "Para iOS, use expo-apple-authentication. " +
            "Disponível apenas em dispositivos Apple."
          );

          // Example iOS implementation:
          // const credential = await AppleAuthentication.signInAsync({
          //   requestedScopes: [
          //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
          //   ],
          // });
          // const provider = new OAuthProvider('apple.com');
          // const oauthCredential = provider.credential({
          //   idToken: credential.identityToken!,
          // });
          // const result = await signInWithCredential(firebaseAuth, oauthCredential);
          // const idToken = await result.user.getIdToken(true);
          // await storeToken(idToken);
          // const profile = await apiService.syncFirebaseUser();
          // await storeUserData(profile);
          // set({ user: profile, token: idToken, isAuthenticated: true, isLoading: false });
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
          console.error("Logout error:", error);
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

          const firebaseUser = await new Promise<FirebaseUser | null>((resolve) => {
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user: FirebaseUser | null) => {
              unsubscribe();
              resolve(user);
            });

            setTimeout(() => {
              unsubscribe();
              resolve(firebaseAuth.currentUser ?? null);
            }, 1500);
          });

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
          console.error("Load stored auth error:", error);
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
      partialize: (state: AuthStore) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
