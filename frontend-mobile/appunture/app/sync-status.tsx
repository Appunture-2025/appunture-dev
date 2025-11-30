import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSyncStore } from "../stores/syncStore";
import { useThemeColors } from "../stores/themeStore";
import type { SyncOperation } from "../types/database";

const EntityTypeLabels: Record<string, string> = {
  favorite: "Favorito",
  point: "Ponto",
  symptom: "Sintoma",
  note: "Nota",
  search_history: "Busca",
  image: "Imagem",
};

const OperationLabels: Record<string, string> = {
  CREATE: "Criar",
  UPDATE: "Atualizar",
  DELETE: "Excluir",
  UPSERT: "Salvar",
};

function formatTimestamp(timestamp: number | string): string {
  try {
    const date =
      typeof timestamp === "number"
        ? new Date(timestamp)
        : new Date(parseInt(String(timestamp), 10));

    if (isNaN(date.getTime())) {
      return "Data inválida";
    }

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Data inválida";
  }
}

function OperationItem({
  operation,
  onRetry,
  onClear,
}: {
  operation: SyncOperation;
  onRetry?: () => void;
  onClear?: () => void;
}) {
  const colors = useThemeColors();
  const entityLabel =
    EntityTypeLabels[operation.entity_type] || operation.entity_type;
  const operationLabel =
    OperationLabels[operation.operation] || operation.operation;
  const isFailed = operation.status === "failed";

  return (
    <View
      style={[
        styles.operationCard,
        {
          backgroundColor: colors.background,
          borderLeftColor: isFailed ? colors.error : colors.primary,
        },
      ]}
    >
      <View style={styles.operationHeader}>
        <View style={styles.operationInfo}>
          <Ionicons
            name={isFailed ? "close-circle" : "time-outline"}
            size={20}
            color={isFailed ? colors.error : colors.primary}
          />
          <Text style={[styles.operationTitle, { color: colors.text }]}>
            {operationLabel} {entityLabel}
          </Text>
        </View>
        {operation.retry_count > 0 && (
          <View
            style={[
              styles.retryBadge,
              { backgroundColor: colors.textSecondary },
            ]}
          >
            <Text style={[styles.retryText, { color: colors.surface }]}>
              Tentativa {operation.retry_count}/{5}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.operationTimestamp, { color: colors.textSecondary }]}
      >
        {formatTimestamp(operation.timestamp)}
      </Text>

      {isFailed && operation.last_error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorLabel, { color: colors.error }]}>
            Erro:
          </Text>
          <Text
            style={[styles.errorText, { color: colors.error }]}
            numberOfLines={2}
          >
            {operation.last_error}
          </Text>
        </View>
      )}

      {isFailed && (
        <View style={styles.actionButtons}>
          {onRetry && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.retryButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={onRetry}
            >
              <Ionicons name="refresh" size={16} color={colors.surface} />
              <Text
                style={[styles.actionButtonText, { color: colors.surface }]}
              >
                Tentar Novamente
              </Text>
            </TouchableOpacity>
          )}
          {onClear && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.clearButton,
                { backgroundColor: colors.error },
              ]}
              onPress={onClear}
            >
              <Ionicons name="trash-outline" size={16} color={colors.surface} />
              <Text
                style={[styles.actionButtonText, { color: colors.surface }]}
              >
                Remover
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function SyncStatusScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const {
    pendingOperations,
    pendingImages,
    failedOperations,
    lastSync,
    syncInProgress,
    isOnline,
    syncAll,
    processSyncQueue,
    refreshPendingOperations,
    refreshFailedOperations,
    retryFailedOperation,
    retryAllFailed,
    clearFailedOperation,
    clearAllFailedOperations,
  } = useSyncStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshPendingOperations();
    refreshFailedOperations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshPendingOperations(), refreshFailedOperations()]);
    setRefreshing(false);
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert("Sem Conexão", "Conecte-se à internet para sincronizar.");
      return;
    }

    try {
      await syncAll();
      Alert.alert("Sucesso", "Sincronização concluída!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao sincronizar. Tente novamente.");
    }
  };

  const handleRetryAll = async () => {
    Alert.alert(
      "Tentar Novamente",
      `Deseja tentar sincronizar ${failedOperations.length} operações falhadas?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            await retryAllFailed();
            if (isOnline) {
              await processSyncQueue();
            }
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      "Limpar Fila",
      "Tem certeza que deseja remover todas as operações falhadas? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Remover",
          style: "destructive",
          onPress: clearAllFailedOperations,
        },
      ]
    );
  };

  const totalPending = pendingOperations + pendingImages;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Status de Sincronização",
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.surface} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.statusRow}>
            <Ionicons
              name={isOnline ? "cloud-done" : "cloud-offline"}
              size={48}
              color={isOnline ? colors.success : colors.textSecondary}
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {isOnline ? "Online" : "Offline"}
              </Text>
              {lastSync && (
                <Text
                  style={[
                    styles.statusSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Última sincronização: {formatTimestamp(lastSync)}
                </Text>
              )}
            </View>
          </View>

          {isOnline && (
            <TouchableOpacity
              style={[
                styles.syncButton,
                { backgroundColor: colors.primary },
                (syncInProgress || totalPending === 0) &&
                  styles.syncButtonDisabled,
              ]}
              onPress={handleSyncNow}
              disabled={syncInProgress || totalPending === 0}
            >
              <Ionicons name="sync" size={20} color={colors.surface} />
              <Text style={[styles.syncButtonText, { color: colors.surface }]}>
                {syncInProgress ? "Sincronizando..." : "Sincronizar Agora"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pending Operations Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Operações Pendentes
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.surface }]}>
                {totalPending}
              </Text>
            </View>
          </View>

          {totalPending === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.success}
              />
              <Text
                style={[styles.emptyStateText, { color: colors.textSecondary }]}
              >
                Todas as operações foram sincronizadas!
              </Text>
            </View>
          ) : (
            <View style={styles.summaryGrid}>
              <View
                style={[
                  styles.summaryItem,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {pendingOperations}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Operações
                </Text>
              </View>
              <View
                style={[
                  styles.summaryItem,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {pendingImages}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Imagens
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Failed Operations */}
        {failedOperations.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Operações Falhadas
              </Text>
              <View
                style={[
                  styles.badge,
                  styles.errorBadge,
                  { backgroundColor: colors.error },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.surface }]}>
                  {failedOperations.length}
                </Text>
              </View>
            </View>

            <View style={styles.bulkActions}>
              <TouchableOpacity
                style={[
                  styles.bulkButton,
                  styles.retryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleRetryAll}
              >
                <Ionicons name="refresh" size={18} color={colors.surface} />
                <Text
                  style={[styles.bulkButtonText, { color: colors.surface }]}
                >
                  Tentar Todas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.bulkButton,
                  styles.clearButton,
                  { backgroundColor: colors.error },
                ]}
                onPress={handleClearAll}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.surface}
                />
                <Text
                  style={[styles.bulkButtonText, { color: colors.surface }]}
                >
                  Limpar Todas
                </Text>
              </TouchableOpacity>
            </View>

            {failedOperations.map((operation) => (
              <OperationItem
                key={operation.id}
                operation={operation}
                onRetry={async () => {
                  await retryFailedOperation(operation.id);
                  if (isOnline) {
                    await processSyncQueue();
                  }
                }}
                onClear={() => clearFailedOperation(operation.id)}
              />
            ))}
          </View>
        )}

        {/* Help Text */}
        <View style={[styles.helpSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            💡 Dica
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            As operações são sincronizadas automaticamente quando você volta a
            ficar online. Operações falhadas podem ser tentadas novamente
            manualmente.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  syncButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorBadge: {
    backgroundColor: COLORS.error,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bulkActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  bulkButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  bulkButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  operationCard: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  failedCard: {
    borderLeftColor: COLORS.error,
  },
  operationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  operationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  operationTimestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  retryBadge: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  retryText: {
    fontSize: 11,
    color: COLORS.surface,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.error,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
  },
  clearButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: "600",
  },
  helpSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
