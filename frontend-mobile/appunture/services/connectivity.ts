import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export type ConnectivityListener = (isOnline: boolean) => void;

class ConnectivityService {
  private unsubscribe?: () => void;
  private listeners = new Set<ConnectivityListener>();
  private latestStatus: boolean = true;

  start(): void {
    if (this.unsubscribe) {
      return;
    }
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      this.latestStatus = isOnline;
      this.listeners.forEach((listener) => listener(isOnline));
    });
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  onChange(listener: ConnectivityListener): () => void {
    this.start();
    this.listeners.add(listener);
    listener(this.latestStatus);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return Boolean(state.isConnected && state.isInternetReachable !== false);
    } catch (error) {
      console.warn("NetInfo fetch failed, assuming offline", error);
      return false;
    }
  }
}

export const connectivityService = new ConnectivityService();
