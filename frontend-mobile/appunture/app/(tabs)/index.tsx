import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePointsStore } from "../../stores/pointsStore";
import { useSymptomsStore } from "../../stores/symptomsStore";
import { useAuthStore } from "../../stores/authStore";
import { COLORS, SPACING } from "../../utils/constants";
import PointCard from "../../components/PointCard";
import { Point, Symptom } from "../../types/api";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { loadPopularPoints } = usePointsStore();
  const { fetchPopularSymptoms } = useSymptomsStore();

  const [popularPoints, setPopularPoints] = useState<Point[]>([]);
  const [popularSymptoms, setPopularSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load popular points
      await loadPopularPoints(5);
      const pointsState = usePointsStore.getState();
      setPopularPoints(pointsState.points);

      // Load popular symptoms
      await fetchPopularSymptoms(5);
      const symptomsState = useSymptomsStore.getState();
      setPopularSymptoms(symptomsState.popularSymptoms);

      setLoading(false);
    } catch (error) {
      console.error("Error loading home data:", error);
      setLoading(false);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handlePointPress = (pointId: string) => {
    router.push({
      pathname: "/point-details",
      params: { id: pointId },
    });
  };

  const handleSymptomPress = (symptomId: string) => {
    router.push({
      pathname: "/symptom-details",
      params: { id: symptomId },
    });
  };

  const renderPoint = ({ item }: { item: Point }) => (
    <View style={styles.cardContainer}>
      <PointCard
        point={item}
        onPress={() => handlePointPress(item.id)}
        showFavoriteButton={false}
      />
    </View>
  );

  const renderSymptom = ({ item }: { item: Symptom }) => (
    <TouchableOpacity
      style={styles.symptomCard}
      onPress={() => handleSymptomPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes do sintoma ${item.name}${
        item.category ? `, categoria ${item.category}` : ""
      }`}
    >
      <Ionicons
        name="medical-outline"
        size={24}
        color={COLORS.primary}
        importantForAccessibility="no-hide-descendants"
      />
      <View style={styles.symptomInfo}>
        <Text style={styles.symptomName}>{item.name}</Text>
        {item.category && (
          <Text style={styles.symptomCategory}>{item.category}</Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.textSecondary}
        importantForAccessibility="no-hide-descendants"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.loadingContainer}
          accessibilityRole="alert"
          accessibilityLabel="Carregando dados da tela inicial"
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeSection} accessibilityRole="header">
          <Text style={styles.welcomeTitle}>
            Bem-vindo{isAuthenticated && user?.name ? `, ${user.name}` : ""}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Explore pontos de acupuntura e sintomas
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Ações Rápidas
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(tabs)/search")}
              accessibilityRole="button"
              accessibilityLabel="Buscar Pontos"
              accessibilityHint="Navegar para a busca de pontos"
            >
              <Ionicons
                name="search"
                size={32}
                color={COLORS.primary}
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.quickActionText}>Buscar Pontos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(tabs)/symptoms")}
              accessibilityRole="button"
              accessibilityLabel="Ver Sintomas"
              accessibilityHint="Navegar para a lista de sintomas"
            >
              <Ionicons
                name="medical"
                size={32}
                color={COLORS.secondary}
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.quickActionText}>Ver Sintomas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/body-map")}
              accessibilityRole="button"
              accessibilityLabel="Mapa Corporal"
              accessibilityHint="Navegar para o mapa corporal interativo"
            >
              <Ionicons
                name="body"
                size={32}
                color={COLORS.accent}
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.quickActionText}>Mapa Corporal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(tabs)/chatbot")}
              accessibilityRole="button"
              accessibilityLabel="Assistente IA"
              accessibilityHint="Conversar com o assistente virtual"
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={32}
                color={COLORS.success}
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.quickActionText}>Assistente IA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Points */}
        {popularPoints.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Pontos Populares
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/search")}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os pontos populares"
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={popularPoints}
              renderItem={renderPoint}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Popular Symptoms */}
        {popularSymptoms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Sintomas Comuns
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/symptoms")}
                accessibilityRole="button"
                accessibilityLabel="Ver todos os sintomas comuns"
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.symptomsList}>
              {popularSymptoms.map((symptom) => (
                <View key={symptom.id}>{renderSymptom({ item: symptom })}</View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  welcomeSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.surface,
    opacity: 0.9,
  },
  quickActionsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  section: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  horizontalList: {
    paddingRight: SPACING.md,
  },
  cardContainer: {
    width: 280,
    marginRight: SPACING.md,
  },
  symptomsList: {
    gap: SPACING.sm,
  },
  symptomCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  symptomCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
