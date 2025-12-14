import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSyncStore } from "../stores/syncStore";
import { useThemeColors } from "../stores/themeStore";

interface OfflineBannerProps {
  onRetry?: () => void;
  style?: any;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  onRetry,
  style,
}) => {
  const { isOnline, syncInProgress, pendingOperations } = useSyncStore();
  const colors = useThemeColors();

  // Don't show banner if online
  if (isOnline) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.warning + "20", borderColor: colors.warning },
        style,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name="cloud-offline"
          size={20}
          color={colors.warning}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Modo Offline
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {pendingOperations > 0
              ? `${pendingOperations} alterações pendentes`
              : "Usando dados locais"}
          </Text>
        </View>
      </View>
      
      {onRetry && !syncInProgress && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.warning }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Tentar reconectar"
        >
          <Ionicons name="refresh" size={16} color={colors.surface} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  retryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});