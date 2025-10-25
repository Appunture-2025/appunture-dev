import { create } from "zustand";
import { SyncState } from "../types/user";
import { databaseService } from "../services/database";
import { apiService } from "../services/api";
import { storeLastSync, getLastSync } from "../services/storage";

interface SyncStore extends SyncState {
  // Actions
  checkConnection: () => Promise<boolean>;
  syncAll: () => Promise<void>;
  syncPoints: () => Promise<void>;
  syncSymptoms: () => Promise<void>;
  syncFavorites: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setAutoSync: (autoSync: boolean) => void;
  loadLastSync: () => Promise<void>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  // Initial state
  isOnline: true,
  lastSync: undefined,
  syncInProgress: false,
  autoSync: true,

  // Actions
  checkConnection: async () => {
    try {
      await apiService.healthCheck();
      set({ isOnline: true });
      return true;
    } catch (error) {
      set({ isOnline: false });
      return false;
    }
  },

  syncAll: async () => {
    try {
      set({ syncInProgress: true });

      const isOnline = await get().checkConnection();
      if (!isOnline) {
        throw new Error("No internet connection");
      }

      // Sync all data types
      await Promise.all([
        get().syncPoints(),
        get().syncSymptoms(),
        get().syncFavorites(),
      ]);

      const now = new Date().toISOString();
      await storeLastSync(now);

      set({
        lastSync: now,
        syncInProgress: false,
      });

      console.log("Full sync completed successfully");
    } catch (error: any) {
      console.error("Sync all error:", error);
      set({ syncInProgress: false });
      throw error;
    }
  },

  syncPoints: async () => {
    try {
      // Get points from API
      const response = await apiService.getPoints({ limit: 1000 });

      // Clear existing points and insert new ones
      await databaseService.clearAllData();

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

      await databaseService.updateSyncStatus("points", "success");
      console.log(`Synced ${response.points.length} points`);
    } catch (error) {
      await databaseService.updateSyncStatus("points", "error");
      throw error;
    }
  },

  syncSymptoms: async () => {
    try {
      // Get symptoms from API
      const response = await apiService.getSymptoms();

      for (const symptom of response.symptoms) {
        await databaseService.insertSymptom({
          name: symptom.name,
          category: symptom.category,
          synced: true,
          last_sync: new Date().toISOString(),
        });
      }

      await databaseService.updateSyncStatus("symptoms", "success");
      console.log(`Synced ${response.symptoms.length} symptoms`);
    } catch (error) {
      await databaseService.updateSyncStatus("symptoms", "error");
      throw error;
    }
  },

  syncFavorites: async () => {
    try {
      // Get unsynced favorites from local database
      const unsyncedFavorites = await databaseService.getUnsyncedRecords(
        "favorites"
      );

      // Sync each favorite to server
      for (const favorite of unsyncedFavorites) {
        try {
          await apiService.addFavorite(favorite.point_id);
          await databaseService.markAsSynced("favorites", favorite.id);
        } catch (error) {
          console.error(`Failed to sync favorite ${favorite.id}:`, error);
        }
      }

      await databaseService.updateSyncStatus("favorites", "success");
      console.log(`Synced ${unsyncedFavorites.length} favorites`);
    } catch (error) {
      await databaseService.updateSyncStatus("favorites", "error");
      throw error;
    }
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  setSyncInProgress: (inProgress: boolean) => {
    set({ syncInProgress: inProgress });
  },

  setAutoSync: (autoSync: boolean) => {
    set({ autoSync });
  },

  loadLastSync: async () => {
    try {
      const lastSync = await getLastSync();
      set({ lastSync: lastSync ?? undefined });
    } catch (error) {
      console.error("Load last sync error:", error);
    }
  },
}));
