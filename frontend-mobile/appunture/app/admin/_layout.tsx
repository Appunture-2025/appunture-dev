import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useThemeColors } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";

export default function AdminLayout() {
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      router.replace("/(tabs)");
    }
  }, [user]);

  if (user?.role !== "ADMIN") {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Painel Admin",
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: "Gerenciar Usuários",
        }}
      />
      <Stack.Screen
        name="points"
        options={{
          title: "Gerenciar Pontos",
        }}
      />
      <Stack.Screen
        name="symptoms"
        options={{
          title: "Gerenciar Sintomas",
        }}
      />
    </Stack>
  );
}
