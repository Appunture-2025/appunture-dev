import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthState, LoginCredentials, RegisterData } from "../types/user";
import { apiService } from "../services/api";
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
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateProfile: (data: { name: string; profession?: string }) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });

          const response = await apiService.login(credentials);

          // Store token and user data
          await storeToken(response.token);
          await storeUserData(response.user);

          set({
            user: response.user,
            token: response.token,
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

          const response = await apiService.register(data);

          // Store token and user data
          await storeToken(response.token);
          await storeUserData(response.user);

          set({
            user: response.user,
            token: response.token,
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

          // Remove stored data
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

          if (storedToken && storedUser) {
            // Verify token is still valid by getting profile
            try {
              const profileResponse = await apiService.getProfile();

              set({
                user: profileResponse.user,
                token: storedToken,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (error) {
              // Token is invalid, clear stored data
              await removeToken();
              await removeUserData();

              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Load stored auth error:", error);
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: { name: string; profession?: string }) => {
        try {
          set({ isLoading: true });

          const response = await apiService.updateProfile(data);

          // Update stored user data
          await storeUserData(response.user);

          set({
            user: response.user,
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
