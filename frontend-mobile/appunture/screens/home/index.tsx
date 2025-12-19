import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { useAuthStore } from "../../stores/authStore";
import { SyncStatusIndicator } from "../../components/SyncStatusIndicator";
import { SyncBanner } from "../../components/SyncBanner";

import { useOfflineMode } from "../../hooks/useOfflineMode";
import { COLORS, MERIDIANS } from "../../utils/constants";
import { useThemeColors } from "../../stores/themeStore";
import { styles } from "./styles";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { points, loading, loadPoints } = usePointsStore();
  const { user, isAuthenticated } = useAuthStore();
  const { isOnline, syncInProgress, syncNow, checkConnection } = useOfflineMode();
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
      // Check connection first
      await checkConnection();
      
      if (isOnline) {
        await syncNow();
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

  const handleSync = async () => {
    try {
      await syncNow();
      Alert.alert("Sucesso", "Dados sincronizados com sucesso!", [
        { text: "OK" },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha na sincronização. Tente novamente mais tarde.";
      Alert.alert("Erro", message, [{ text: "OK" }]);
    }
  };

  const recentPoints = points.slice(0, 5);
  const meridianStats = MERIDIANS.map((meridian) => ({
    name: meridian,
    count: points.filter((p) => p.meridian === meridian).length,
  })).filter((m) => m.count > 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sync Banner - appears only on home screen */}
      <SyncBanner />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {isAuthenticated
                ? `Olá, ${user?.name?.split(" ")[0] || "Usuário"}!`
                : "Bem-vindo ao Appunture"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isAuthenticated
                ? "Seus dados estão sincronizados"
                : "Explore os pontos de acupuntura"}
            </Text>
          </View>
          
          <SyncStatusIndicator variant="compact" showLastSync={true} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section} accessibilityLabel="Acesso Rápido">
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">Acesso Rápido</Text>
          </View>
          <View style={styles.quickActionsGrid} accessibilityRole="list">
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push("/search")}
              accessibilityRole="button"
              accessibilityLabel="Buscar Pontos. Encontre pontos por nome ou código"
              accessibilityHint="Navega para a tela de busca"
            >
              <Ionicons
                name="search"
                size={32}
                color={colors.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Buscar Pontos</Text>
              <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
                Encontre pontos por nome ou código
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push("/body-map")}
              accessibilityRole="button"
              accessibilityLabel="Mapa Corporal. Visualize pontos no corpo humano"
              accessibilityHint="Navega para o mapa interativo do corpo"
            >
              <Ionicons
                name="body"
                size={32}
                color={colors.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Mapa Corporal</Text>
              <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
                Visualize pontos no corpo humano
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push("/chatbot")}
              accessibilityRole="button"
              accessibilityLabel="Assistente. Encontre pontos por sintomas"
              accessibilityHint="Navega para o assistente virtual"
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={32}
                color={colors.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Assistente</Text>
              <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
                Encontre pontos por sintomas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push("/favorites")}
              accessibilityRole="button"
              accessibilityLabel="Favoritos. Seus pontos salvos"
              accessibilityHint="Navega para a lista de favoritos"
            >
              <Ionicons
                name="heart"
                size={32}
                color={colors.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Favoritos</Text>
              <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
                Seus pontos salvos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section} accessibilityLabel="Estatísticas">
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">Estatísticas</Text>
          </View>
          <View style={styles.statsGrid} accessibilityRole="list">
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel={`${points.length} Pontos Disponíveis`}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{points.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pontos Disponíveis</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel={`${meridianStats.length} Meridianos`}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{meridianStats.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Meridianos</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel={`${points.filter((p) => p.isFavorite).length} Favoritos`}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {points.filter((p) => p.isFavorite).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Recent Points */}
        {recentPoints.length > 0 && (
          <View style={styles.section} accessibilityLabel="Pontos Recentes">
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">Pontos Recentes</Text>
              <TouchableOpacity 
                onPress={() => router.push("/search")}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os pontos"
              >
                <Text style={[styles.sectionAction, { color: colors.primary }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentPointsList} accessibilityRole="list">
              {recentPoints.map((point) => (
                <Link
                  key={point.id}
                  href={{
                    pathname: "/point-details",
                    params: { id: String(point.id) },
                  }}
                  asChild
                >
                  <TouchableOpacity 
                    style={[styles.pointCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${point.name}. Código: ${point.code}. Meridiano: ${point.meridian}`}
                    accessibilityHint="Toque para ver detalhes do ponto"
                  >
                    <View style={styles.pointHeader}>
                      <Text style={[styles.pointName, { color: colors.text }]}>{point.name}</Text>
                      <Text style={[styles.pointCode, { color: colors.primary, backgroundColor: `${colors.primary}15` }]}>{point.code}</Text>
                    </View>
                    <Text style={[styles.pointMeridian, { color: colors.textSecondary }]}>{point.meridian}</Text>
                    <Text style={[styles.pointLocation, { color: colors.textSecondary }]} numberOfLines={2}>
                      {point.location}
                    </Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Sync Section */}
        {isAuthenticated && (
          <View style={styles.section} accessibilityLabel="Sincronização">
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">Sincronização</Text>
            </View>
            <View style={[styles.syncCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SyncStatusIndicator 
                variant="detailed" 
                showLastSync={true}
                style={{ flex: 1, marginRight: 12 }}
              />
              <TouchableOpacity
                style={[
                  styles.syncButton,
                  { backgroundColor: colors.primary },
                  (!isOnline || syncInProgress) && styles.syncButtonDisabled,
                ]}
                onPress={handleSync}
                disabled={!isOnline || syncInProgress}
                accessibilityRole="button"
                accessibilityLabel={syncInProgress ? "Sincronizando dados" : isOnline ? "Sincronizar dados" : "Sem conexão"}
                accessibilityState={{ disabled: !isOnline || syncInProgress }}
              >
                {syncInProgress ? (
                  <ActivityIndicator size="small" color={colors.surface} accessibilityLabel="Sincronizando" />
                ) : (
                  <Text style={[styles.syncButtonText, { color: colors.surface }]}>
                    {isOnline ? "Sincronizar" : "Offline"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Empty State */}
        {points.length === 0 && !loading && (
          <View style={styles.emptyState} accessibilityLabel="Nenhum ponto encontrado">
            <Ionicons
              name="medical"
              size={64}
              color={colors.textSecondary}
              style={styles.emptyStateIcon}
              accessibilityElementsHidden
            />
            <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>Nenhum ponto encontrado</Text>
            <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
              Os dados estão sendo carregados. Verifique sua conexão com a
              internet e tente novamente.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
