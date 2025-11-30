import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { databaseService } from "../services/database";
import { useAuthStore } from "../stores/authStore";
import { useSyncStore } from "../stores/syncStore";
import { useThemeStore } from "../stores/themeStore";
import { useNotifications } from "../hooks/useNotifications";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ThemeProvider } from "../components/ThemeProvider";
import { createLogger } from "../utils/logger";

const logger = createLogger("RootLayout");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status?: number }).status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state: any) => state.loadStoredAuth);
  const loadLastSync = useSyncStore((state: any) => state.loadLastSync);
  const checkConnection = useSyncStore((state: any) => state.checkConnection);
  const processSyncQueue = useSyncStore((state: any) => state.processSyncQueue);
  const isDark = useThemeStore((state) => state.isDark);

  // Inicializa push notifications
  const { pushToken, hasPermission } = useNotifications();

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
          processSyncQueue().catch((error: any) => {
            logger.warn("Auto-sync failed on app start:", error);
          });
        }

        logger.info("App initialized successfully");
      } catch (error) {
        logger.error("App initialization error:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error for debugging
        logger.error("App Error:", error);
        logger.error("Component Stack:", errorInfo.componentStack);
        // In production, send to error reporting service (e.g., Crashlytics, Sentry)
      }}
    >
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
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
            <StatusBar style={isDark ? "light" : "dark"} />
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
