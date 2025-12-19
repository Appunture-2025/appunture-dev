import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSyncStore } from "../stores/syncStore";
import { useThemeColors } from "../stores/themeStore";

interface SyncStatusIndicatorProps {
  variant?: "compact" | "detailed" | "inline";
  showLastSync?: boolean;
  onPress?: () => void;
  style?: any;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  variant = "compact",
  showLastSync = true,
  onPress,
  style,
}) => {
  const { isOnline, lastSync, syncInProgress, autoSync } = useSyncStore();
  const colors = useThemeColors();

  // Offline mode is enabled when autoSync is false (user manually disabled)
  const isOfflineMode = !autoSync;
  // Effectively offline if no network OR offline mode is enabled
  const isEffectivelyOffline = !isOnline || isOfflineMode;

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const getStatusColor = () => {
    if (syncInProgress) return colors.warning;
    if (isOfflineMode) return colors.warning; // Yellow for manual offline mode
    return isOnline ? colors.success : colors.error;
  };

  const getStatusIcon = () => {
    if (syncInProgress) return "sync";
    if (isOfflineMode) return "cloud-offline";
    return isOnline ? "cloud-done" : "cloud-offline";
  };

  const getStatusText = () => {
    if (syncInProgress) return "Sincronizando...";
    if (isOfflineMode) return "Modo Offline";
    return isOnline ? "Online" : "Sem conexão";
  };

  const Container = onPress ? TouchableOpacity : View;

  if (variant === "inline") {
    return (
      <Container
        style={[styles.inlineContainer, style]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.inlineText, { color: colors.textSecondary }]}>
          {getStatusText()}
        </Text>
      </Container>
    );
  }

  if (variant === "detailed") {
    return (
      <Container
        style={[styles.detailedContainer, { backgroundColor: colors.surface }, style]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.detailedHeader}>
          <Ionicons
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
          <Text style={[styles.detailedTitle, { color: colors.text }]}>
            {getStatusText()}
          </Text>
        </View>
        {showLastSync && lastSync && (
          <Text style={[styles.detailedSubtitle, { color: colors.textSecondary }]}>
            Última sincronização: {formatLastSync(lastSync)}
          </Text>
        )}
      </Container>
    );
  }

  // Compact variant (default)
  return (
    <Container
      style={[styles.compactContainer, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.compactStatus}>
        <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.compactText, { color: colors.textSecondary }]}>
          {getStatusText()}
        </Text>
      </View>
      {showLastSync && lastSync && (
        <Text style={[styles.compactSubtext, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatLastSync(lastSync)}
        </Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  // Inline variant
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  inlineText: {
    fontSize: 12,
  },

  // Compact variant
  compactContainer: {
    alignItems: "flex-end",
    maxWidth: 120,
  },
  compactStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  compactText: {
    fontSize: 12,
  },
  compactSubtext: {
    fontSize: 10,
  },

  // Detailed variant
  detailedContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  detailedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailedTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  detailedSubtitle: {
    fontSize: 12,
    marginLeft: 28,
  },
});