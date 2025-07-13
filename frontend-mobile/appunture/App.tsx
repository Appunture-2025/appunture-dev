import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "./stores/authStore";
import { databaseService } from "./services/database";

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading, initializeAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await databaseService.init();

        // Initialize auth
        await initializeAuth();

        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsReady(true); // Still set ready to prevent infinite loading
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (user && !inTabsGroup) {
      // User is signed in but not in tabs, redirect to tabs
      router.replace("/(tabs)");
    } else if (!user && inTabsGroup) {
      // User is not signed in but in protected route, redirect to welcome
      router.replace("/welcome");
    }
  }, [user, segments, isReady, isLoading]);

  if (!isReady || isLoading) {
    // You can return a loading screen here
    return null;
  }

  return <Slot />;
}

export default function App() {
  return (
    <>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </>
  );
}
