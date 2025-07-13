import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { useSyncStore } from "../../stores/syncStore";
import { useAuthStore } from "../../stores/authStore";
import { COLORS, SPACING, MERIDIANS } from "../../utils/constants";

export default function HomeScreen() {
  const { points, loading, loadPoints } = usePointsStore();
  const { isOnline, lastSync, syncAll, syncInProgress } = useSyncStore();
  const { user, isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await loadPoints({ limit: 10 });
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        await syncAll();
      }
      await loadPoints({ limit: 10 });
    } catch (error) {
      Alert.alert(
        "Erro de Sincronização",
        "Não foi possível sincronizar os dados. Verifique sua conexão.",
        [{ text: "OK" }]
      );
    } finally {
      setRefreshing(false);
    }
  };

  const recentPoints = points.slice(0, 5);
  const meridianStats = MERIDIANS.map((meridian) => ({
    name: meridian,
    count: points.filter((p) => p.meridian === meridian).length,
  })).filter((m) => m.count > 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Appunture</Text>
          <Text style={styles.subtitle}>
            {isAuthenticated
              ? `Bem-vindo, ${user?.name || "Usuário"}!`
              : "Seu guia de acupuntura"}
          </Text>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Ionicons
              name={isOnline ? "cloud-done" : "cloud-offline"}
              size={20}
              color={isOnline ? COLORS.success : COLORS.error}
            />
            <Text
              style={[
                styles.statusText,
                { color: isOnline ? COLORS.success : COLORS.error },
              ]}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>

          {lastSync && (
            <View style={styles.statusItem}>
              <Ionicons name="sync" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statusText}>
                Última sync: {new Date(lastSync).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={syncInProgress || refreshing}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.quickActions}>
            <Link href="/search" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="search" size={32} color={COLORS.primary} />
                <Text style={styles.actionText}>Buscar Pontos</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/body-map" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="body" size={32} color={COLORS.secondary} />
                <Text style={styles.actionText}>Mapa Corporal</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/chatbot" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={32}
                  color={COLORS.accent}
                />
                <Text style={styles.actionText}>Assistente</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/favorites" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="heart" size={32} color={COLORS.error} />
                <Text style={styles.actionText}>Favoritos</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Recent Points */}
        {recentPoints.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pontos Recentes</Text>
              <Link href="/search" asChild>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {recentPoints.map((point) => (
              <Link key={point.id} href={`/point/${point.id}`} asChild>
                <TouchableOpacity style={styles.pointCard}>
                  <View>
                    <Text style={styles.pointName}>{point.name}</Text>
                    <Text style={styles.pointMeridian}>{point.meridian}</Text>
                    <Text style={styles.pointLocation} numberOfLines={2}>
                      {point.location}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        )}

        {/* Meridian Stats */}
        {meridianStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meridianos Disponíveis</Text>
            <View style={styles.meridianGrid}>
              {meridianStats.slice(0, 6).map((meridian) => (
                <View key={meridian.name} style={styles.meridianCard}>
                  <Text style={styles.meridianName}>{meridian.name}</Text>
                  <Text style={styles.meridianCount}>
                    {meridian.count} pontos
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dica do Dia</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={COLORS.accent} />
            <Text style={styles.tipText}>
              Use o assistente para encontrar pontos baseados em sintomas. Basta
              descrever o que você está sentindo!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    gap: SPACING.sm,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },
  pointCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pointMeridian: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  pointLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  meridianGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  meridianCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  meridianName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
  },
  meridianCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
