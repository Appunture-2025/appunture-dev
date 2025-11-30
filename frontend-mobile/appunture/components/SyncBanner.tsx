import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSyncStore } from "../stores/syncStore";
import { COLORS } from "../utils/constants";

export function SyncBanner() {
  const router = useRouter();
  const {
    syncInProgress,
    pendingOperations,
    pendingImages,
    failedOperations,
    notificationMessage,
    acknowledgeNotification,
    isOnline,
  } = useSyncStore();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const totalPending = pendingOperations + pendingImages;
  const failedCount = failedOperations.length;

  useEffect(() => {
    if (notificationMessage) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        acknowledgeNotification();
      });
    }
  }, [notificationMessage, fadeAnim, acknowledgeNotification]);

  // Show notification toast if there's a message
  if (notificationMessage) {
    return (
      <Animated.View
        style={[
          styles.notificationToast,
          {
            opacity: fadeAnim,
          },
        ]}
        accessibilityRole="alert"
        accessibilityLabel={notificationMessage}
      >
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
        <Text style={styles.notificationText}>{notificationMessage}</Text>
      </Animated.View>
    );
  }

  // Show offline banner
  if (!isOnline) {
    return (
      <View
        style={[styles.banner, styles.offlineBanner]}
        accessibilityRole="alert"
        accessibilityLabel="Modo Offline. Alterações serão sincronizadas quando conectar."
      >
        <Ionicons name="cloud-offline" size={20} color={COLORS.surface} />
        <Text style={styles.bannerText}>
          Modo Offline - Alterações serão sincronizadas quando conectar
        </Text>
      </View>
    );
  }

  // Show syncing banner
  if (syncInProgress && totalPending > 0) {
    return (
      <View
        style={[styles.banner, styles.syncingBanner]}
        accessibilityRole="progressbar"
        accessibilityLabel={`Sincronizando ${totalPending} itens.`}
      >
        <ActivityIndicator size="small" color={COLORS.surface} />
        <Text style={styles.bannerText}>
          Sincronizando {totalPending} {totalPending === 1 ? "item" : "itens"}
          ...
        </Text>
      </View>
    );
  }

  // Show failed operations warning
  if (failedCount > 0) {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.failedBanner]}
        onPress={() => router.push("/sync-status" as any)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${failedCount} operações falharam. Toque para ver detalhes.`}
        accessibilityHint="Navega para a tela de status de sincronização"
      >
        <Ionicons name="warning" size={20} color={COLORS.surface} />
        <Text style={styles.bannerText}>
          ⚠️ {failedCount}{" "}
          {failedCount === 1 ? "operação falhou" : "operações falharam"}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.surface} />
      </TouchableOpacity>
    );
  }

  // Show pending operations count (subtle indicator)
  if (totalPending > 0) {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.pendingBanner]}
        onPress={() => router.push("/sync-status" as any)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${totalPending} itens pendentes de sincronização. Toque para ver detalhes.`}
        accessibilityHint="Navega para a tela de status de sincronização"
      >
        <Ionicons
          name="cloud-upload-outline"
          size={18}
          color={COLORS.textSecondary}
        />
        <Text style={styles.pendingText}>
          {totalPending} pendente{totalPending > 1 ? "s" : ""}
        </Text>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  offlineBanner: {
    backgroundColor: COLORS.textSecondary,
  },
  syncingBanner: {
    backgroundColor: COLORS.primary,
  },
  failedBanner: {
    backgroundColor: COLORS.error,
  },
  pendingBanner: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bannerText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  pendingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  notificationToast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SyncBanner;
