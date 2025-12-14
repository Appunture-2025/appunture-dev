import { useEffect, useState } from "react";
import { useSyncStore } from "../stores/syncStore";
import { useAuthStore } from "../stores/authStore";

export interface OfflineModeState {
  isOffline: boolean;
  isOnline: boolean;
  canSync: boolean;
  pendingOperations: number;
  lastSync: string | undefined;
  syncInProgress: boolean;
  autoSyncEnabled: boolean;
}

export interface OfflineModeActions {
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  toggleOfflineMode: () => void;
  syncNow: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

export const useOfflineMode = (): OfflineModeState & OfflineModeActions => {
  const {
    isOnline,
    lastSync,
    syncInProgress,
    autoSync,
    pendingOperations,
    setAutoSync,
    syncAll,
    checkConnection,
  } = useSyncStore();
  
  const { isAuthenticated } = useAuthStore();
  
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(!autoSync);

  useEffect(() => {
    setIsOfflineModeEnabled(!autoSync);
  }, [autoSync]);

  const enableOfflineMode = () => {
    setAutoSync(false);
    setIsOfflineModeEnabled(true);
  };

  const disableOfflineMode = () => {
    setAutoSync(true);
    setIsOfflineModeEnabled(false);
  };

  const toggleOfflineMode = () => {
    if (isOfflineModeEnabled) {
      disableOfflineMode();
    } else {
      enableOfflineMode();
    }
  };

  const syncNow = async () => {
    if (!isAuthenticated || !isOnline) {
      throw new Error("Não é possível sincronizar: usuário não autenticado ou sem conexão");
    }
    await syncAll();
  };

  return {
    // State
    isOffline: !isOnline || isOfflineModeEnabled,
    isOnline,
    canSync: isAuthenticated && isOnline && !syncInProgress,
    pendingOperations,
    lastSync,
    syncInProgress,
    autoSyncEnabled: autoSync,

    // Actions
    enableOfflineMode,
    disableOfflineMode,
    toggleOfflineMode,
    syncNow,
    checkConnection,
  };
};