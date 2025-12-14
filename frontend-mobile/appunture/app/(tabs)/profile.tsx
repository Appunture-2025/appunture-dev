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
import { useThemeStore, useThemeColors } from "../../stores/themeStore";
import { SyncStatusIndicator } from "../../components/SyncStatusIndicator";
import { useOfflineMode } from "../../hooks/useOfflineMode";

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
  const { user, logout, isAuthenticated } = useAuthStore();
  const { mode, setMode, isDark } = useThemeStore();
  const colors = useThemeColors();
  const { isOffline, toggleOfflineMode } = useOfflineMode();

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

  const handleThemeCycle = (): void => {
    // Cycle through: light -> dark -> system -> light
    const nextMode =
      mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(nextMode);
  };

  const getThemeLabel = (): string => {
    switch (mode) {
      case "light":
        return "Claro";
      case "dark":
        return "Escuro";
      case "system":
        return "Automatico";
      default:
        return "Claro";
    }
  };

  // Build settings list - only show logout if authenticated
  const baseSettings: SettingsOption[] = [
    {
      id: "offline",
      title: "Modo offline",
      subtitle: "Desabilitar sincronização automática",
      type: "toggle",
      icon: "cloud-offline-outline",
      value: isOffline,
      onToggle: () => toggleOfflineMode(),
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
        router.push("/favorites");
      },
    },
    {
      id: "about",
      title: "Sobre o app",
      subtitle: "Versao 1.0.1",
      type: "navigation",
      icon: "information-circle-outline",
      onPress: () => {
        Alert.alert(
          "Appunture",
          "Aplicativo de consulta de pontos de acupuntura\nVersao 1.0.0\n\nDesenvolvido para auxiliar profissionais e estudantes de acupuntura."
        );
      },
    },
  ];

  const settings: SettingsOption[] = isAuthenticated
    ? [
        ...baseSettings,
        {
          id: "logout",
          title: "Sair da conta",
          type: "action",
          icon: "log-out-outline",
          onPress: handleLogout,
        },
      ]
    : [
        ...baseSettings,
        {
          id: "login",
          title: "Entrar na conta",
          subtitle: "Faca login para sincronizar seus dados",
          type: "action",
          icon: "log-in-outline",
          onPress: () => router.push("/login"),
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
              item.id === "login" && {
                backgroundColor: isDark ? "#1a4a2a" : "#dcfce7",
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={item.id === "logout" ? colors.error : item.id === "login" ? colors.success : colors.primary}
              importantForAccessibility="no-hide-descendants"
            />
          </View>
          <View style={styles.settingText}>
            <Text
              style={[
                styles.settingTitle,
                { color: colors.text },
                item.id === "logout" && { color: colors.error },
                item.id === "login" && { color: colors.success },
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
        accessibilityLabel={isAuthenticated ? `Perfil de ${user?.name || "Usuario"}` : "Visitante - nao logado"}
      >
        <View style={[styles.avatar, { backgroundColor: colors.background }]}>
          <Ionicons
            name={isAuthenticated ? "person" : "person-outline"}
            size={40}
            color={colors.primary}
            importantForAccessibility="no-hide-descendants"
          />
        </View>
        
        {isAuthenticated ? (
          <>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || "Usuario"}
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
              >
                <Ionicons
                  name={user.emailVerified ? "checkmark-circle" : "alert-circle"}
                  size={14}
                  color={colors.surface}
                  importantForAccessibility="no-hide-descendants"
                />
              </View>
            )}

            {/* Sync Status */}
            <SyncStatusIndicator 
              variant="detailed" 
              showLastSync={true}
              style={{ marginTop: 12 }}
            />
          </>
        ) : (
          <>
            <Text style={[styles.userName, { color: colors.text }]}>
              Visitante
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              Voce esta navegando como visitante
            </Text>
            
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/login")}
              accessibilityRole="button"
              accessibilityLabel="Fazer login ou criar conta"
            >
              <Ionicons name="log-in-outline" size={20} color={colors.surface} />
              <Text style={[styles.loginButtonText, { color: colors.surface }]}>
                Entrar ou Criar Conta
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.guestHint, { color: colors.textSecondary }]}>
              Faca login para sincronizar dados, salvar favoritos e usar a IA
            </Text>
          </>
        )}
      </View>

      {/* Settings */}
      <View
        style={[styles.settingsSection, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configuracoes
        </Text>
        {settings.map(renderSettingItem)}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
          Appunture - Acupuntura Digital
        </Text>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Versao 1.0.0
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

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  guestHint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    lineHeight: 18,
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
