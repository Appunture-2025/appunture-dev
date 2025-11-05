import { create } from "zustand";
import type { Point, Symptom, ApiError } from "../types/api";
import type {
  LocalPoint,
  LocalSymptom,
  SyncOperation,
  SyncEntityType,
} from "../types/database";
import { SyncState } from "../types/user";
import { databaseService } from "../services/database";
import { apiService } from "../services/api";
import { connectivityService } from "../services/connectivity";
import { storeLastSync, getLastSync } from "../services/storage";
import { useAuthStore } from "./authStore";

const BASE_DELAY = 1000; // 1 second
const BACKOFF_MULTIPLIER = 2;
const MAX_DELAY = 60000; // 60 seconds
const MAX_RETRIES = 5;
const QUEUE_FETCH_LIMIT = 200;

const calculateBackoffDelay = (retryCount: number): number =>
  Math.min(BASE_DELAY * Math.pow(BACKOFF_MULTIPLIER, retryCount), MAX_DELAY);

const resolveConflict = (
  localTimestamp?: string,
  remoteTimestamp?: string
): "local" | "remote" => {
  if (!localTimestamp && !remoteTimestamp) {
    return "local";
  }
  if (!localTimestamp) {
    return "remote";
  }
  if (!remoteTimestamp) {
    return "local";
  }

  const localTime = new Date(localTimestamp).getTime();
  const remoteTime = new Date(remoteTimestamp).getTime();
  return localTime >= remoteTime ? "local" : "remote";
};

const toLocalPoint = (point: Point, timestamp: string): LocalPoint => ({
  id: point.id,
  code: point.code,
  name: point.name,
  chinese_name: point.chinese_name ?? point.chineseName,
  meridian: point.meridian,
  location: point.location,
  functions: point.functions,
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

const safeParse = <T>(raw: string, context: string): T => {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Falha ao interpretar payload da operação (${context}). ${
        (error as Error).message
      }`
    );
  }
};

const getCurrentUserId = (): string | null => {
  const user = useAuthStore.getState().user;
  if (!user || user.id === undefined || user.id === null) {
    return null;
  }
  return String(user.id);
};

interface SyncStore extends SyncState {
  pendingOperations: number;
  pendingImages: number;
  queueProcessing: boolean;
  failedOperations: SyncOperation[];
  notificationMessage: string | null;
  checkConnection: () => Promise<boolean>;
  syncAll: () => Promise<void>;
  syncPoints: () => Promise<void>;
  syncSymptoms: () => Promise<void>;
  syncFavorites: () => Promise<void>;
  syncImages: () => Promise<void>;
  processSyncQueue: () => Promise<void>;
  refreshPendingOperations: () => Promise<void>;
  refreshFailedOperations: () => Promise<void>;
  acknowledgeNotification: () => void;
  retryFailedOperation: (id: string) => Promise<void>;
  retryAllFailed: () => Promise<void>;
  clearFailedOperation: (id: string) => Promise<void>;
  clearAllFailedOperations: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setAutoSync: (autoSync: boolean) => void;
  loadLastSync: () => Promise<void>;
}

export const useSyncStore = create<SyncStore>((set, get) => {
  const handleFavoriteOperation = async (operation: SyncOperation) => {
    const payload = safeParse<{
      userId?: string;
      pointId?: string;
      action?: "ADD" | "REMOVE";
      timestamp?: string;
      remoteTimestamp?: string;
    }>(operation.data, "favorite");

    const userId = payload.userId ?? getCurrentUserId();
    const pointId = payload.pointId;
    const action = payload.action ?? (operation.operation === "DELETE" ? "REMOVE" : "ADD");

    if (!userId || !pointId) {
      throw new Error("Payload de favorito inválido - userId ou pointId ausente");
    }

    const shouldFavorite = action === "ADD";

    try {
      // Evita chamadas desnecessárias se estado remoto já corresponde à intenção
      const remoteFavorites = await apiService.getFavorites();
      const isRemoteFavorite = remoteFavorites.points.some((point) => point.id === pointId);

      if (isRemoteFavorite !== shouldFavorite) {
        if (shouldFavorite) {
          await apiService.addFavorite(pointId);
        } else {
          await apiService.removeFavorite(pointId);
        }
      }

      await databaseService.setFavoriteStatus({
        pointId,
        userId,
        isFavorite: shouldFavorite,
        synced: true,
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const handlePointOperation = async (operation: SyncOperation) => {
    const payload = safeParse<{
      point?: Partial<Point> & { id?: string };
      pointId?: string;
      localId?: string;
      timestamp?: string;
    }>(operation.data, "point");

    const pointData = payload.point;

    if (operation.operation === "CREATE") {
      if (!pointData) {
        throw new Error("Payload de criação de ponto ausente");
      }

      const response = await apiService.createPoint(pointData as Point);
      const createdPoint = response.point;
      const now = new Date().toISOString();

      if (payload.localId && payload.localId !== createdPoint.id) {
        await databaseService.deletePointById(payload.localId);
      }

      await databaseService.upsertPoint(toLocalPoint(createdPoint, now));
      await databaseService.markPointSynced(createdPoint.id, now);
      return;
    }

    if (operation.operation === "UPDATE") {
      if (!pointData || !pointData.id) {
        throw new Error("Payload de atualização de ponto inválido");
      }

      let remoteTimestamp: string | undefined;
      try {
        const remotePoint = await apiService.getPoint(pointData.id);
        remoteTimestamp = remotePoint.point.updatedAt ?? remotePoint.point.updated_at;

        const winner = resolveConflict(payload.timestamp, remoteTimestamp);
        if (winner === "remote") {
          const now = new Date().toISOString();
          await databaseService.upsertPoint(toLocalPoint(remotePoint.point, now));
          await databaseService.markPointSynced(remotePoint.point.id, now);
          return;
        }
      } catch (error) {
        console.warn(`Não foi possível recuperar ponto remoto ${pointData.id} para reconciliação`, error);
      }

      const response = await apiService.updatePoint(pointData.id, pointData as Point);
      const updatedPoint = response.point;
      const now = new Date().toISOString();
      await databaseService.upsertPoint(toLocalPoint(updatedPoint, now));
      await databaseService.markPointSynced(updatedPoint.id, now);
      return;
    }

    if (operation.operation === "DELETE") {
      const pointId = pointData?.id ?? payload.pointId;
      if (!pointId) {
        throw new Error("Payload de exclusão de ponto inválido");
      }

      await apiService.deletePoint(pointId);
      await databaseService.deletePointById(pointId);
      return;
    }

    throw new Error(`Operação de ponto não suportada: ${operation.operation}`);
  };

  const handleSymptomOperation = async (operation: SyncOperation) => {
    const payload = safeParse<{
      symptom?: Partial<Symptom> & { id?: string };
      symptomId?: string;
      timestamp?: string;
    }>(operation.data, "symptom");

    const symptomData = payload.symptom;

    if (operation.operation === "CREATE") {
      if (!symptomData) {
        throw new Error("Payload de criação de sintoma ausente");
      }

      const response = await apiService.createSymptom(symptomData as Symptom);
      const now = new Date().toISOString();
      await databaseService.upsertSymptom(toLocalSymptom(response.symptom, now));
      await databaseService.markSymptomSynced(response.symptom.id, now);
      return;
    }

    if (operation.operation === "UPDATE") {
      if (!symptomData || !symptomData.id) {
        throw new Error("Payload de atualização de sintoma inválido");
      }

      let remoteTimestamp: string | undefined;
      try {
        const remote = await apiService.getSymptom(symptomData.id);
        remoteTimestamp = remote.symptom.updatedAt ?? remote.symptom.updated_at;
        const winner = resolveConflict(payload.timestamp, remoteTimestamp);

        if (winner === "remote") {
          const now = new Date().toISOString();
          await databaseService.upsertSymptom(toLocalSymptom(remote.symptom, now));
          await databaseService.markSymptomSynced(remote.symptom.id, now);
          return;
        }
      } catch (error) {
        console.warn(`Não foi possível recuperar sintoma remoto ${symptomData.id} para reconciliação`, error);
      }

      const response = await apiService.updateSymptom(symptomData.id, symptomData as Symptom);
      const now = new Date().toISOString();
      await databaseService.upsertSymptom(toLocalSymptom(response.symptom, now));
      await databaseService.markSymptomSynced(response.symptom.id, now);
      return;
    }

    if (operation.operation === "DELETE") {
      const symptomId = symptomData?.id ?? payload.symptomId;
      if (!symptomId) {
        throw new Error("Payload de exclusão de sintoma inválido");
      }

      await apiService.deleteSymptom(symptomId);
      await databaseService.deleteSymptomById(symptomId);
      return;
    }

    throw new Error(`Operação de sintoma não suportada: ${operation.operation}`);
  };

  const handleNoteOperation = async (operation: SyncOperation) => {
    const payload = safeParse<{
      noteId?: number | string;
      remoteId?: string;
      pointId: string;
      content?: string;
      userId?: string;
      timestamp?: string;
      action?: "CREATE" | "UPDATE" | "DELETE";
    }>(operation.data, "note");

    const rawAction = payload.action ?? operation.operation;
    if (rawAction !== "CREATE" && rawAction !== "UPDATE" && rawAction !== "DELETE") {
      throw new Error(`Ação de nota inválida: ${String(rawAction)}`);
    }
    const action = rawAction;

    const userId = payload.userId ?? getCurrentUserId();

    if (!userId) {
      throw new Error("Não é possível sincronizar nota sem usuário autenticado");
    }

    if (action === "CREATE") {
      if (!payload.content) {
        throw new Error("Conteúdo da nota ausente para criação");
      }

      try {
        const response = await apiService.createNote({
          pointId: payload.pointId,
          content: payload.content,
          userId,
        });
        const noteId = payload.noteId ?? response.note.id;
        if (noteId !== undefined) {
          await databaseService.markNoteSynced(noteId);
        }
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status === 404) {
          console.warn("Endpoint de notas indisponível. Marcando operação como sincronizada localmente.");
          if (payload.noteId !== undefined) {
            await databaseService.markNoteSynced(payload.noteId);
          }
        } else {
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
      return;
    }

    if (action === "UPDATE") {
      if (!payload.noteId || !payload.content) {
        throw new Error("Dados insuficientes para atualizar nota");
      }

      try {
        await apiService.updateNote(String(payload.noteId), {
          pointId: payload.pointId,
          content: payload.content,
          userId,
        });
        await databaseService.markNoteSynced(payload.noteId);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status === 404) {
          console.warn("Endpoint de notas indisponível. Atualização aplicada somente localmente.");
          await databaseService.markNoteSynced(payload.noteId);
        } else {
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
      return;
    }

    if (action === "DELETE") {
      if (!payload.noteId) {
        throw new Error("ID da nota ausente para exclusão");
      }

      try {
        await apiService.deleteNote(String(payload.noteId));
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status !== 404) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      }

      await databaseService.deleteNote(payload.noteId);
      return;
    }

    throw new Error(`Operação de nota não suportada: ${action}`);
  };

  const handleSearchHistoryOperation = async (operation: SyncOperation) => {
    const payload = safeParse<{
      query: string;
      type: string;
      timestamp?: string;
    }>(operation.data, "search_history");

    try {
      await apiService.logSearchHistory({
        query: payload.query,
        type: payload.type,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 404) {
        console.warn("Endpoint de histórico de busca indisponível. Mantendo sincronizado apenas localmente.");
        return;
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const handlers: Record<SyncEntityType, (operation: SyncOperation) => Promise<void>> = {
    favorite: handleFavoriteOperation,
    point: handlePointOperation,
    symptom: handleSymptomOperation,
    note: handleNoteOperation,
    search_history: handleSearchHistoryOperation,
    image: async () => {
      // Images are handled by syncImages flow
    },
  };

  return {
    isOnline: true,
    lastSync: undefined,
    syncInProgress: false,
    autoSync: true,
    pendingOperations: 0,
    pendingImages: 0,
    queueProcessing: false,
    failedOperations: [],
    notificationMessage: null,

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
          throw new Error("Sem conexão com a internet");
        }

        await get().processSyncQueue();

        await Promise.all([
          get().syncPoints(),
          get().syncSymptoms(),
          get().syncFavorites(),
          get().syncImages(),
        ]);

        const now = new Date().toISOString();
        await storeLastSync(now);

        set({ lastSync: now, notificationMessage: "Sincronização completa" });
      } finally {
        set({ syncInProgress: false });
        await get().refreshPendingOperations();
        await get().refreshFailedOperations();
      }
    },

    syncPoints: async () => {
      const response = await apiService.getPoints({ limit: 1000 });
      const now = new Date().toISOString();
      const localPoints = response.points.map((point) => toLocalPoint(point, now));

      await databaseService.upsertPoints(localPoints);
      await databaseService.removePointsNotIn(localPoints.map((point) => point.id));
      await databaseService.updateSyncStatus("points", "success");
    },

    syncSymptoms: async () => {
      const response = await apiService.getSymptoms();
      const now = new Date().toISOString();
      const localSymptoms = response.symptoms.map((symptom) => toLocalSymptom(symptom, now));

      await databaseService.upsertSymptoms(localSymptoms);
      await databaseService.updateSyncStatus("symptoms", "success");
    },

    syncFavorites: async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        await databaseService.updateSyncStatus("favorites", "success");
        return;
      }

      await get().processSyncQueue();

      const response = await apiService.getFavorites();
      const favoriteIds = response.points.map((point) => point.id);
      await databaseService.replaceFavorites(userId, favoriteIds);
      await databaseService.updateSyncStatus("favorites", "success");
      await get().refreshPendingOperations();
    },

    syncImages: async () => {
      const pendingImages = await databaseService.getPendingImages(50);

      for (const imageOp of pendingImages) {
        try {
          if (imageOp.retry_count > 0 && imageOp.last_attempt) {
            const backoffDelay = calculateBackoffDelay(imageOp.retry_count);
            const lastAttemptMs = Date.parse(imageOp.last_attempt);
            if (Number.isFinite(lastAttemptMs)) {
              const elapsed = Date.now() - lastAttemptMs;
              if (elapsed < backoffDelay) {
                continue;
              }
            } else {
              continue;
            }
          }

          await databaseService.markImageSyncInProgress(imageOp.id);

          // TODO: Implementar upload real para Firebase Storage
          await databaseService.markImageSyncCompleted(imageOp.id);
        } catch (error) {
          console.warn(`Falha ao sincronizar imagem ${imageOp.id}`, error);
          await databaseService.markImageSyncFailed(imageOp.id);
        }
      }

      await get().refreshPendingOperations();
    },

    processSyncQueue: async () => {
      if (get().queueProcessing || !get().isOnline) {
        return;
      }

      set({ queueProcessing: true, syncInProgress: true });

      try {
        const operations = await databaseService.getQueuedOperations(undefined, QUEUE_FETCH_LIMIT);
        if (operations.length === 0) {
          return;
        }

        let processedCount = 0;

        for (const operation of operations) {
          const handler = handlers[operation.entity_type];
          if (!handler) {
            await databaseService.markOperationCompleted(operation.id);
            continue;
          }

          if (operation.retry_count > 0 && operation.last_attempt) {
            const backoffDelay = calculateBackoffDelay(operation.retry_count);
            const elapsed = Date.now() - operation.last_attempt;
            if (elapsed < backoffDelay) {
              continue;
            }
          }

          try {
            await databaseService.markOperationInProgress(operation.id);
            await handler(operation);
            await databaseService.markOperationCompleted(operation.id);
            processedCount += 1;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`Falha ao processar operação ${operation.id}: ${message}`);
            await databaseService.markOperationFailed(operation.id, message);
          }
        }

        if (processedCount > 0) {
          set({
            notificationMessage:
              processedCount === 1
                ? "1 operação sincronizada"
                : `${processedCount} operações sincronizadas`,
          });
        }
      } finally {
        set({ queueProcessing: false, syncInProgress: false });
        await get().refreshPendingOperations();
        await get().refreshFailedOperations();
      }
    },

    refreshPendingOperations: async () => {
      const [pendingOperations, pendingImages] = await Promise.all([
        databaseService.countPendingOperations(),
        databaseService.countPendingImages(),
      ]);

      set({ pendingOperations, pendingImages });
    },

    refreshFailedOperations: async () => {
      const failedOperations = await databaseService.getFailedOperations();
      set({ failedOperations });
    },

    acknowledgeNotification: () => {
      set({ notificationMessage: null });
    },

    retryFailedOperation: async (id: string) => {
      await databaseService.resetOperation(id);
      await get().refreshFailedOperations();
      await get().refreshPendingOperations();
    },

    retryAllFailed: async () => {
      const failed = get().failedOperations;
      await Promise.all(failed.map((operation) => databaseService.resetOperation(operation.id)));
      await get().refreshFailedOperations();
      await get().refreshPendingOperations();
    },

    clearFailedOperation: async (id: string) => {
      await databaseService.removeOperation(id);
      await get().refreshFailedOperations();
      await get().refreshPendingOperations();
    },

    clearAllFailedOperations: async () => {
      const failed = get().failedOperations;
      await Promise.all(failed.map((operation) => databaseService.removeOperation(operation.id)));
      await get().refreshFailedOperations();
      await get().refreshPendingOperations();
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
      const lastSync = await getLastSync();
      set({ lastSync: lastSync ?? undefined });
      await get().refreshPendingOperations();
      await get().refreshFailedOperations();
    },
  };
});

connectivityService.onChange(async (isOnline) => {
  const store = useSyncStore.getState();
  store.setOnlineStatus(isOnline);
  await Promise.all([
    store.refreshPendingOperations(),
    store.refreshFailedOperations(),
  ]);

  if (isOnline) {
    try {
      await store.processSyncQueue();
    } catch (error) {
      console.error("Erro ao processar fila após reconexão", error);
    }
  }
});
