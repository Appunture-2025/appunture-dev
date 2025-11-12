import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { databaseService } from "../services/database";
import { useAuthStore } from "../stores/authStore";
import { useSyncStore } from "../stores/syncStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state: any) => state.loadStoredAuth);
  const loadLastSync = useSyncStore((state: any) => state.loadLastSync);
  const checkConnection = useSyncStore((state: any) => state.checkConnection);
  const processSyncQueue = useSyncStore((state: any) => state.processSyncQueue);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await databaseService.init();

        // Load stored authentication
        await loadStoredAuth();

        // Load last sync info
        await loadLastSync();

        // Check connection status
        const isOnline = await checkConnection();

        // Auto-sync if online and has pending operations
        if (isOnline) {
          processSyncQueue().catch((error) => {
            console.warn("Auto-sync failed on app start:", error);
          });
        }

        console.log("App initialized successfully");
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="point/[id]"
            options={{
              title: "Detalhes do Ponto",
              headerBackTitle: "Voltar",
            }}
          />
          <Stack.Screen
            name="body-map"
            options={{
              title: "Mapa Corporal",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
