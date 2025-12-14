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

import { useOfflineMode } from "../../hooks/useOfflineMode";
import { COLORS, MERIDIANS } from "../../utils/constants";
import { styles } from "./styles";

export default function HomeScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyStateTitle}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {isAuthenticated
                ? `Olá, ${user?.name?.split(" ")[0] || "Usuário"}!`
                : "Bem-vindo ao Appunture"}
            </Text>
            <Text style={styles.subtitle}>
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
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section} accessibilityLabel="Acesso Rápido">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Acesso Rápido</Text>
          </View>
          <View style={styles.quickActionsGrid} accessibilityRole="list">
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/search")}
              accessibilityRole="button"
              accessibilityLabel="Buscar Pontos. Encontre pontos por nome ou código"
              accessibilityHint="Navega para a tela de busca"
            >
              <Ionicons
                name="search"
                size={32}
                color={COLORS.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={styles.quickActionTitle}>Buscar Pontos</Text>
              <Text style={styles.quickActionDescription}>
                Encontre pontos por nome ou código
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/body-map")}
              accessibilityRole="button"
              accessibilityLabel="Mapa Corporal. Visualize pontos no corpo humano"
              accessibilityHint="Navega para o mapa interativo do corpo"
            >
              <Ionicons
                name="body"
                size={32}
                color={COLORS.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={styles.quickActionTitle}>Mapa Corporal</Text>
              <Text style={styles.quickActionDescription}>
                Visualize pontos no corpo humano
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/chatbot")}
              accessibilityRole="button"
              accessibilityLabel="Assistente. Encontre pontos por sintomas"
              accessibilityHint="Navega para o assistente virtual"
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={32}
                color={COLORS.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={styles.quickActionTitle}>Assistente</Text>
              <Text style={styles.quickActionDescription}>
                Encontre pontos por sintomas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/favorites")}
              accessibilityRole="button"
              accessibilityLabel="Favoritos. Seus pontos salvos"
              accessibilityHint="Navega para a lista de favoritos"
            >
              <Ionicons
                name="heart"
                size={32}
                color={COLORS.primary}
                style={styles.quickActionIcon}
                accessibilityElementsHidden
              />
              <Text style={styles.quickActionTitle}>Favoritos</Text>
              <Text style={styles.quickActionDescription}>
                Seus pontos salvos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section} accessibilityLabel="Estatísticas">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Estatísticas</Text>
          </View>
          <View style={styles.statsGrid} accessibilityRole="list">
            <View style={styles.statCard} accessibilityLabel={`${points.length} Pontos Disponíveis`}>
              <Text style={styles.statValue}>{points.length}</Text>
              <Text style={styles.statLabel}>Pontos Disponíveis</Text>
            </View>
            <View style={styles.statCard} accessibilityLabel={`${meridianStats.length} Meridianos`}>
              <Text style={styles.statValue}>{meridianStats.length}</Text>
              <Text style={styles.statLabel}>Meridianos</Text>
            </View>
            <View style={styles.statCard} accessibilityLabel={`${points.filter((p) => p.isFavorite).length} Favoritos`}>
              <Text style={styles.statValue}>
                {points.filter((p) => p.isFavorite).length}
              </Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Recent Points */}
        {recentPoints.length > 0 && (
          <View style={styles.section} accessibilityLabel="Pontos Recentes">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">Pontos Recentes</Text>
              <TouchableOpacity 
                onPress={() => router.push("/search")}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os pontos"
              >
                <Text style={styles.sectionAction}>Ver todos</Text>
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
                    style={styles.pointCard}
                    accessibilityRole="button"
                    accessibilityLabel={`${point.name}. Código: ${point.code}. Meridiano: ${point.meridian}`}
                    accessibilityHint="Toque para ver detalhes do ponto"
                  >
                    <View style={styles.pointHeader}>
                      <Text style={styles.pointName}>{point.name}</Text>
                      <Text style={styles.pointCode}>{point.code}</Text>
                    </View>
                    <Text style={styles.pointMeridian}>{point.meridian}</Text>
                    <Text style={styles.pointLocation} numberOfLines={2}>
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
              <Text style={styles.sectionTitle} accessibilityRole="header">Sincronização</Text>
            </View>
            <View style={styles.syncCard}>
              <SyncStatusIndicator 
                variant="detailed" 
                showLastSync={true}
                style={{ flex: 1, marginRight: 12 }}
              />
              <TouchableOpacity
                style={[
                  styles.syncButton,
                  (!isOnline || syncInProgress) && styles.syncButtonDisabled,
                ]}
                onPress={handleSync}
                disabled={!isOnline || syncInProgress}
                accessibilityRole="button"
                accessibilityLabel={syncInProgress ? "Sincronizando dados" : isOnline ? "Sincronizar dados" : "Sem conexão"}
                accessibilityState={{ disabled: !isOnline || syncInProgress }}
              >
                {syncInProgress ? (
                  <ActivityIndicator size="small" color={COLORS.surface} accessibilityLabel="Sincronizando" />
                ) : (
                  <Text style={styles.syncButtonText}>
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
              color={COLORS.textSecondary}
              style={styles.emptyStateIcon}
              accessibilityElementsHidden
            />
            <Text style={styles.emptyStateTitle}>Nenhum ponto encontrado</Text>
            <Text style={styles.emptyStateDescription}>
              Os dados estão sendo carregados. Verifique sua conexão com a
              internet e tente novamente.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
