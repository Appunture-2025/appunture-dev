import { create } from "zustand";
import { Point, PointWithSymptoms } from "../types/api";
import { LocalPoint } from "../types/database";
import { apiService } from "../services/api";
import { databaseService } from "../services/database";

interface PointsState {
  // State
  points: Point[];
  favorites: Point[];
  selectedPoint: PointWithSymptoms | null;
  searchResults: Point[];
  meridians: Array<{ meridian: string; point_count: number }>;
  loading: boolean;
  error: string | null;

  // Actions
  loadPoints: (params?: {
    limit?: number;
    offset?: number;
    meridian?: string;
  }) => Promise<void>;
  loadPoint: (id: string) => Promise<void>;
  searchPoints: (query: string) => Promise<void>;
  searchPointByCode: (code: string) => Promise<void>;
  loadPointsByMeridian: (meridian: string) => Promise<void>;
  loadPopularPoints: (limit?: number) => Promise<void>;
  loadMeridians: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (pointId: string) => Promise<void>;
  clearSearch: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Offline methods
  getLocalPoints: () => Promise<void>;
  getLocalPoint: (id: string) => Promise<void>;
  syncPoints: () => Promise<void>;
}

export const usePointsStore = create<PointsState>((set, get) => ({
  // Initial state
  points: [],
  favorites: [],
  selectedPoint: null,
  searchResults: [],
  meridians: [],
  loading: false,
  error: null,

  // Actions
  loadPoints: async (params) => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.getPoints(params);

      set({
        points: response.points,
        loading: false,
      });
    } catch (error: any) {
      console.error("Load points error:", error);

      // Try to load from local database
      try {
        await get().getLocalPoints();
      } catch (localError) {
        set({
          error: error.message || "Failed to load points",
          loading: false,
        });
      }
    }
  },

  loadPoint: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.getPoint(id);

      set({
        selectedPoint: response.point,
        loading: false,
      });
    } catch (error: any) {
      console.error("Load point error:", error);

      // Try to load from local database
      try {
        await get().getLocalPoint(id);
      } catch (localError) {
        set({
          error: error.message || "Failed to load point",
          loading: false,
        });
      }
    }
  },

  searchPoints: async (query: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.searchPoints(query);

      set({
        searchResults: response.points,
        loading: false,
      });
    } catch (error: any) {
      console.error("Search points error:", error);
      set({
        error: error.message || "Failed to search points",
        loading: false,
      });
    }
  },

  searchPointByCode: async (code: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.getPointByCode(code);

      set({
        selectedPoint: response.point,
        loading: false,
      });
    } catch (error: any) {
      console.error("Search point by code error:", error);
      set({
        error: error.message || "Failed to find point",
        loading: false,
      });
    }
  },

  loadPointsByMeridian: async (meridian: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.getPointsByMeridian(meridian);

      set({
        points: response.points,
        loading: false,
      });
    } catch (error: any) {
      console.error("Load points by meridian error:", error);
      set({
        error: error.message || "Failed to load points",
        loading: false,
      });
    }
  },

  loadPopularPoints: async (limit = 10) => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.getPopularPoints(limit);

      set({
        points: response.points,
        loading: false,
      });
    } catch (error: any) {
      console.error("Load popular points error:", error);
      set({
        error: error.message || "Failed to load popular points",
        loading: false,
      });
    }
  },

  loadMeridians: async () => {
    try {
      set({ loading: true, error: null });

      const response = await apiService.getMeridians();

      set({
        meridians: response.meridians,
        loading: false,
      });
    } catch (error: any) {
      console.error("Load meridians error:", error);
      set({
        error: error.message || "Failed to load meridians",
        loading: false,
      });
    }
  },

  loadFavorites: async () => {
    try {
      set({ loading: true, error: null });

      // Try to load from API first
      try {
        const response = await apiService.getFavorites();
        set({
          favorites: response.points,
          loading: false,
        });
      } catch (apiError) {
        // Fall back to local favorites
        const localFavorites = await databaseService.getFavorites(1); // Assuming user id 1
        set({
          favorites: localFavorites.map((p) => ({
            id: p.id,
            code: "",
            name: p.name,
            chinese_name: p.chinese_name,
            meridian: p.meridian,
            location: p.location,
            indications: p.indications,
            contraindications: p.contraindications,
            coordinates: p.coordinates ? JSON.parse(p.coordinates) : undefined,
            image_url: p.image_path,
            isFavorite: true,
          })),
          loading: false,
        });
      }
    } catch (error: any) {
      console.error("Load favorites error:", error);
      set({
        error: error.message || "Failed to load favorites",
        loading: false,
      });
    }
  },

  toggleFavorite: async (pointId: string) => {
    try {
      const { favorites } = get();
      const isFavorite = favorites.some((p) => p.id === pointId);

      if (isFavorite) {
        // Remove from favorites
        await apiService.removeFavorite(pointId);

        set({
          favorites: favorites.filter((p) => p.id !== pointId),
          points: get().points.map((p) =>
            p.id === pointId ? { ...p, isFavorite: false } : p
          ),
        });
      } else {
        // Add to favorites
        await apiService.addFavorite(pointId);

        // Find the point to add to favorites
        const point =
          get().points.find((p) => p.id === pointId) ||
          get().searchResults.find((p) => p.id === pointId);

        if (point) {
          set({
            favorites: [...favorites, { ...point, isFavorite: true }],
            points: get().points.map((p) =>
              p.id === pointId ? { ...p, isFavorite: true } : p
            ),
          });
        }
      }
    } catch (error: any) {
      console.error("Toggle favorite error:", error);
      set({ error: error.message || "Failed to toggle favorite" });
    }
  },

  clearSearch: () => {
    set({ searchResults: [] });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  // Offline methods
  getLocalPoints: async () => {
    try {
      const localPoints = await databaseService.getPoints();

      set({
        points: localPoints.map((p) => ({
          id: String(p.id), // Convert to string for Firestore compatibility
          code: "",
          name: p.name,
          chinese_name: p.chinese_name,
          meridian: p.meridian,
          location: p.location,
          indications: p.indications,
          contraindications: p.contraindications,
          coordinates: p.coordinates ? JSON.parse(p.coordinates) : undefined,
          image_url: p.image_path,
          isFavorite: false,
        })),
        loading: false,
      });
    } catch (error: any) {
      console.error("Get local points error:", error);
      throw error;
    }
  },

  getLocalPoint: async (id: string) => {
    try {
      // Try to parse as number for local DB
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error("Invalid point ID");
      }
      
      const localPoint = await databaseService.getPointById(numericId);

      if (localPoint) {
        set({
          selectedPoint: {
            id: String(localPoint.id),
            code: "",
            name: localPoint.name,
            chinese_name: localPoint.chinese_name,
            meridian: localPoint.meridian,
            location: localPoint.location,
            indications: localPoint.indications,
            contraindications: localPoint.contraindications,
            coordinates: localPoint.coordinates
              ? JSON.parse(localPoint.coordinates)
              : undefined,
            image_url: localPoint.image_path,
            symptoms: [], // No symptoms data in local storage
            isFavorite: false,
          },
          loading: false,
        });
      } else {
        throw new Error("Point not found locally");
      }
    } catch (error: any) {
      console.error("Get local point error:", error);
      throw error;
    }
  },

  syncPoints: async () => {
    try {
      set({ loading: true });

      // Get points from API
      const response = await apiService.getPoints();

      // Update local database
      for (const point of response.points) {
        await databaseService.insertPoint({
          name: point.name,
          chinese_name: point.chinese_name,
          meridian: point.meridian,
          location: point.location,
          indications: point.indications,
          contraindications: point.contraindications,
          coordinates: point.coordinates
            ? JSON.stringify(point.coordinates)
            : undefined,
          image_path: point.image_url,
          synced: true,
          last_sync: new Date().toISOString(),
        });
      }

      // Update state
      set({
        points: response.points,
        loading: false,
      });

      console.log("Points synced successfully");
    } catch (error: any) {
      console.error("Sync points error:", error);
      set({
        error: error.message || "Failed to sync points",
        loading: false,
      });
    }
  },
}));
