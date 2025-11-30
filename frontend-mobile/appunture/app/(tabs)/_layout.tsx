import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../stores/themeStore";
import { SyncBanner } from "../../components/SyncBanner";
import { useSyncStore } from "../../stores/syncStore";

function ProfileTabIcon({ color, size }: { color: string; size: number }) {
  const { pendingOperations, pendingImages } = useSyncStore();
  const colors = useThemeColors();
  const totalPending = pendingOperations + pendingImages;

  return (
    <View>
      <Ionicons name="person" size={size} color={color} />
      {totalPending > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text style={[styles.badgeText, { color: colors.surface }]}>
            {totalPending > 99 ? "99+" : totalPending}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <>
      <SyncBanner />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarAccessibilityLabel: "Início",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Buscar",
            tabBarAccessibilityLabel: "Buscar pontos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="symptoms"
          options={{
            title: "Sintomas",
            tabBarAccessibilityLabel: "Lista de sintomas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="medical" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="meridians"
          options={{
            title: "Meridianos",
            tabBarAccessibilityLabel: "Lista de meridianos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="git-network-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chatbot"
          options={{
            title: "Assistente",
            tabBarAccessibilityLabel: "Assistente virtual",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favoritos",
            tabBarAccessibilityLabel: "Meus favoritos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarAccessibilityLabel: "Meu perfil",
            tabBarIcon: ({ color, size }) => (
              <ProfileTabIcon color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
