import { create } from "zustand";
import type { Point, Symptom } from "../types/api";
import type { LocalPoint, LocalSymptom } from "../types/database";
import { SyncState } from "../types/user";
import { databaseService } from "../services/database";
import { apiService } from "../services/api";
import { connectivityService } from "../services/connectivity";
import { storeLastSync, getLastSync } from "../services/storage";
import { useAuthStore } from "./authStore";

interface SyncStore extends SyncState {
  checkConnection: () => Promise<boolean>;
  syncAll: () => Promise<void>;
  syncPoints: () => Promise<void>;
  syncSymptoms: () => Promise<void>;
  syncFavorites: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setAutoSync: (autoSync: boolean) => void;
  loadLastSync: () => Promise<void>;
  processSyncQueue: () => Promise<void>;
  refreshPendingOperations: () => Promise<void>;
  pendingOperations: number;
  queueProcessing: boolean;
}

const toLocalPoint = (point: Point, timestamp: string): LocalPoint => ({
  id: point.id,
  code: point.code,
  name: point.name,
  chinese_name: point.chinese_name ?? point.chineseName,
  meridian: point.meridian,
  location: point.location,
  functions: undefined,
  indications: point.indications,
  contraindications: point.contraindications,
  image_path: point.image_url ?? point.imageUrls?.[0],
  coordinates: point.coordinates ? JSON.stringify(point.coordinates) : undefined,
  favorite_count: point.favoriteCount,
  synced: true,
  last_sync: timestamp,
});

const toLocalSymptom = (symptom: Symptom, timestamp: string): LocalSymptom => ({
  id: symptom.id,
  name: symptom.name,
  synonyms: symptom.tags ? JSON.stringify(symptom.tags) : undefined,
  category: symptom.category,
  use_count: symptom.useCount,
  synced: true,
  last_sync: timestamp,
});

export const useSyncStore = create<SyncStore>((set, get) => ({
  isOnline: true,
  lastSync: undefined,
  syncInProgress: false,
  autoSync: true,
  pendingOperations: 0,
  queueProcessing: false,

  checkConnection: async () => {
    try {
      const hasNetwork = await connectivityService.isOnline();
      if (!hasNetwork) {
        set({ isOnline: false });
        return false;
      }

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

      await get().refreshPendingOperations();

      console.log("Full sync completed successfully");
    } catch (error) {
      console.error("Sync all error:", error);
      set({ syncInProgress: false });
      throw error;
    }
  },

  syncPoints: async () => {
    try {
      const response = await apiService.getPoints({ limit: 1000 });
      const now = new Date().toISOString();
      const localPoints = response.points.map((point) => toLocalPoint(point, now));

      await databaseService.upsertPoints(localPoints);
      await databaseService.removePointsNotIn(localPoints.map((point) => point.id));
      await databaseService.updateSyncStatus("points", "success");

      console.log(`Synced ${localPoints.length} points`);
    } catch (error) {
      await databaseService.updateSyncStatus("points", "error");
      throw error;
    }
  },

  syncSymptoms: async () => {
    try {
      const response = await apiService.getSymptoms();
      const now = new Date().toISOString();
      const localSymptoms = response.symptoms.map((symptom) =>
        toLocalSymptom(symptom, now)
      );

      await databaseService.upsertSymptoms(localSymptoms);
      await databaseService.updateSyncStatus("symptoms", "success");

      console.log(`Synced ${localSymptoms.length} symptoms`);
    } catch (error) {
      await databaseService.updateSyncStatus("symptoms", "error");
      throw error;
    }
  },

  syncFavorites: async () => {
    const user = useAuthStore.getState().user;
    if (!user || user.id === undefined || user.id === null) {
      await databaseService.updateSyncStatus("favorites", "success");
      return;
    }
    const userId = String(user.id);

    try {
      await get().processSyncQueue();

      const response = await apiService.getFavorites();
      const favoriteIds = response.points.map((point) => point.id);
      await databaseService.replaceFavorites(userId, favoriteIds);
      await databaseService.updateSyncStatus("favorites", "success");

      console.log(`Synced ${favoriteIds.length} favorites`);
    } catch (error) {
      await databaseService.updateSyncStatus("favorites", "error");
      throw error;
    } finally {
      await get().refreshPendingOperations();
    }
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  setSyncInProgress: (syncInProgress: boolean) => {
    set({ syncInProgress });
  },

  setAutoSync: (autoSync: boolean) => {
    set({ autoSync });
  },

  loadLastSync: async () => {
    try {
      const lastSync = await getLastSync();
      set({ lastSync: lastSync ?? undefined });
      await get().refreshPendingOperations();
    } catch (error) {
      console.error("Load last sync error:", error);
    }
  },

  processSyncQueue: async () => {
    if (get().queueProcessing || !get().isOnline) {
      return;
    }

    set({ queueProcessing: true });

    try {
      const operations = await databaseService.getPendingOperations("favorite", 100);
      if (operations.length === 0) {
        return;
      }

      for (const operation of operations) {
        try {
          await databaseService.markOperationInProgress(operation.id);
          const payload = operation.payload ? JSON.parse(operation.payload) : {};
          const userId = payload.userId as string | undefined;
          const pointId = payload.pointId as string | undefined;
          const action = (payload.action as "ADD" | "REMOVE" | undefined) ??
            (operation.operation === "DELETE" ? "REMOVE" : "ADD");

          if (!userId || !pointId) {
            throw new Error("Invalid favorite operation payload");
          }

          if (operation.operation === "DELETE" || action === "REMOVE") {
            await apiService.removeFavorite(pointId);
            await databaseService.setFavoriteStatus({
              pointId,
              userId,
              isFavorite: false,
              synced: true,
            });
          } else {
            await apiService.addFavorite(pointId);
            await databaseService.setFavoriteStatus({
              pointId,
              userId,
              isFavorite: true,
              synced: true,
            });
          }

          await databaseService.markOperationCompleted(operation.id);
        } catch (operationError) {
          console.warn("Failed to process sync operation", operationError);
          await databaseService.markOperationFailed(operation.id);
        }
      }
    } finally {
      set({ queueProcessing: false });
      await get().refreshPendingOperations();
    }
  },

  refreshPendingOperations: async () => {
    try {
      const pendingOperations = await databaseService.countPendingOperations();
      set({ pendingOperations });
    } catch (error) {
      console.error("Failed to refresh pending operations", error);
    }
  },
}));

connectivityService.onChange(async (isOnline) => {
  const store = useSyncStore.getState();
  store.setOnlineStatus(isOnline);
  await store.refreshPendingOperations();

  if (isOnline) {
    try {
      await store.processSyncQueue();
    } catch (error) {
      console.error("Queue processing error after reconnect", error);
    }
  }
});
