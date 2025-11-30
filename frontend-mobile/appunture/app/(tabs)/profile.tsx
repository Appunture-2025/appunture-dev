import React, { useState, useMemo } from "react";
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
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { useSyncStore } from "../../stores/syncStore";
import { useThemeStore, useThemeColors } from "../../stores/themeStore";

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
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOnline, lastSync } = useSyncStore();
  const { mode, setMode, isDark } = useThemeStore();
  const colors = useThemeColors();
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

  const handleThemeCycle = () => {
    // Cycle through: light -> dark -> system -> light
    const nextMode =
      mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(nextMode);
  };

  const getThemeLabel = () => {
    switch (mode) {
      case "light":
        return "Claro";
      case "dark":
        return "Escuro";
      case "system":
        return "Automático";
    }
  };

  const settings: SettingsOption[] = [
    {
      id: "edit-profile",
      title: "Editar perfil",
      subtitle: "Alterar nome, foto e informações",
      type: "navigation",
      icon: "create-outline",
      onPress: () => {
        router.push("/profile-edit");
      },
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            id: "admin",
            title: "Painel Admin",
            subtitle: "Gerenciar conteúdo",
            type: "navigation" as const,
            icon: "shield-checkmark-outline" as keyof typeof Ionicons.glyphMap,
            onPress: () => {
              router.push("/admin");
            },
          },
        ]
      : []),
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
      id: "theme",
      title: "Tema",
      subtitle: `Modo ${getThemeLabel()}`,
      type: "navigation",
      icon: isDark ? "moon-outline" : "sunny-outline",
      onPress: handleThemeCycle,
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
    const isToggle = item.type === "toggle";

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, { borderBottomColor: colors.border }]}
        onPress={item.onPress}
        disabled={isToggle}
        accessibilityRole={isToggle ? "none" : "button"}
        accessibilityLabel={`${item.title}${
          item.subtitle ? `, ${item.subtitle}` : ""
        }`}
        accessibilityHint={isToggle ? undefined : "Toque para ativar"}
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.background },
              item.id === "logout" && {
                backgroundColor: isDark ? "#4a2020" : "#fee2e2",
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={item.id === "logout" ? colors.error : colors.primary}
              importantForAccessibility="no-hide-descendants"
            />
          </View>
          <View style={styles.settingText}>
            <Text
              style={[
                styles.settingTitle,
                { color: colors.text },
                item.id === "logout" && { color: colors.error },
              ]}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text
                style={[
                  styles.settingSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {isToggle && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
              accessibilityRole="switch"
              accessibilityLabel={item.title}
              accessibilityHint={item.subtitle}
            />
          )}
          {item.type === "navigation" && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              importantForAccessibility="no-hide-descendants"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* User Info */}
      <View
        style={[styles.userCard, { backgroundColor: colors.surface }]}
        accessibilityRole="header"
        accessibilityLabel={`Perfil de ${user?.name || "Usuário"}`}
      >
        <View style={[styles.avatar, { backgroundColor: colors.background }]}>
          <Ionicons
            name="person"
            size={40}
            color={colors.primary}
            importantForAccessibility="no-hide-descendants"
          />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || "Usuário"}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || "email@exemplo.com"}
        </Text>

        {/* Email Verification Badge */}
        {user?.emailVerified !== undefined && (
          <View
            style={[
              styles.emailBadge,
              {
                backgroundColor: user.emailVerified
                  ? colors.success
                  : colors.warning,
              },
            ]}
            accessibilityLabel={
              user.emailVerified ? "Email verificado" : "Email não verificado"
            }
          >
            <Ionicons
              name={user.emailVerified ? "checkmark-circle" : "alert-circle"}
              size={14}
              color={colors.surface}
              importantForAccessibility="no-hide-descendants"
            />
            <Text style={[styles.emailBadgeText, { color: colors.surface }]}>
              {user.emailVerified ? "Email verificado" : "Email não verificado"}
            </Text>
          </View>
        )}

        {/* Sync Status */}
        <View
          style={styles.syncStatus}
          accessibilityLabel={`Status de sincronização: ${
            isOnline ? "Online" : "Offline"
          }${
            lastSync
              ? `, última sincronização em ${new Date(lastSync).toLocaleString(
                  "pt-BR"
                )}`
              : ""
          }`}
        >
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? colors.success : colors.warning },
            ]}
          />
          <Text style={[styles.syncText, { color: colors.textSecondary }]}>
            {isOnline ? "Online" : "Offline"}
            {lastSync && (
              <Text style={styles.lastSync}>
                {" • Última sincronização: "}
                {new Date(lastSync).toLocaleString("pt-BR")}
              </Text>
            )}
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View
        style={[styles.settingsSection, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configurações
        </Text>
        {settings.map(renderSettingItem)}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
          Appunture - Acupuntura Digital
        </Text>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Versão 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userCard: {
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 4,
  },
  emailBadgeText: {
    fontSize: 12,
    fontWeight: "500",
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
    textAlign: "center",
  },
  lastSync: {
    fontSize: 12,
  },
  settingsSection: {
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
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
    marginBottom: 4,
  },
  versionText: {
    fontSize: 14,
  },
});
