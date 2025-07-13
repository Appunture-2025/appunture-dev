import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { useSyncStore } from "../../stores/syncStore";
import { COLORS } from "../../utils/constants";

interface SettingsOption {
  id: string;
  title: string;
  subtitle?: string;
  type: "navigation" | "toggle" | "action";
  icon: keyof typeof Ionicons.glyphMap;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { isOnline, lastSyncTime } = useSyncStore();
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const settings: SettingsOption[] = [
    {
      id: "notifications",
      title: "Notificações",
      subtitle: "Receber notificações push",
      type: "toggle",
      icon: "notifications-outline",
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: "offline",
      title: "Modo offline",
      subtitle: "Usar apenas dados locais",
      type: "toggle",
      icon: "cloud-offline-outline",
      value: offlineMode,
      onToggle: setOfflineMode,
    },
    {
      id: "favorites",
      title: "Meus favoritos",
      subtitle: "Pontos salvos como favoritos",
      type: "navigation",
      icon: "heart-outline",
      onPress: () => {
        // Navigate to favorites - already implemented in tabs
        console.log("Navigate to favorites");
      },
    },
    {
      id: "history",
      title: "Histórico de consultas",
      subtitle: "Ver pesquisas anteriores",
      type: "navigation",
      icon: "time-outline",
      onPress: () => {
        console.log("Navigate to history");
      },
    },
    {
      id: "about",
      title: "Sobre o app",
      subtitle: "Versão 1.0.0",
      type: "navigation",
      icon: "information-circle-outline",
      onPress: () => {
        Alert.alert(
          "Appunture",
          "Aplicativo de consulta de pontos de acupuntura\nVersão 1.0.0\n\nDesenvolvido para auxiliar profissionais e estudantes de acupuntura."
        );
      },
    },
    {
      id: "logout",
      title: "Sair da conta",
      type: "action",
      icon: "log-out-outline",
      onPress: handleLogout,
    },
  ];

  const renderSettingItem = (item: SettingsOption) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === "toggle"}
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.iconContainer,
              item.id === "logout" && styles.logoutIconContainer,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={item.id === "logout" ? COLORS.error : COLORS.primary}
            />
          </View>
          <View style={styles.settingText}>
            <Text
              style={[
                styles.settingTitle,
                item.id === "logout" && styles.logoutText,
              ]}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === "toggle" && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.surface}
            />
          )}
          {item.type === "navigation" && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || "Usuário"}</Text>
        <Text style={styles.userEmail}>
          {user?.email || "email@exemplo.com"}
        </Text>

        {/* Sync Status */}
        <View style={styles.syncStatus}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? COLORS.success : COLORS.warning },
            ]}
          />
          <Text style={styles.syncText}>
            {isOnline ? "Online" : "Offline"}
            {lastSyncTime && (
              <Text style={styles.lastSync}>
                {" • Última sincronização: "}
                {new Date(lastSyncTime).toLocaleString("pt-BR")}
              </Text>
            )}
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        {settings.map(renderSettingItem)}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Appunture - Acupuntura Digital</Text>
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  syncText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  lastSync: {
    fontSize: 12,
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: "#fee2e2",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  logoutText: {
    color: COLORS.error,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 12,
  },
  appInfo: {
    padding: 24,
    alignItems: "center",
  },
  appInfoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
