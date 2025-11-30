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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSymptomsStore } from "../stores/symptomsStore";
import { useThemeColors } from "../stores/themeStore";
import { COLORS, SPACING } from "../utils/constants";
import PointCard from "../components/PointCard";

export default function SymptomDetailsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const symptomId = params.id as string;

  const { currentSymptom, isLoading, fetchSymptomById, incrementUse } =
    useSymptomsStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (symptomId) {
      loadSymptomDetails();
      // Increment use count
      incrementUse(symptomId);
    }
  }, [symptomId]);

  const loadSymptomDetails = async () => {
    try {
      await fetchSymptomById(symptomId);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar detalhes do sintoma.");
      router.back();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSymptomById(symptomId);
    } catch (error) {
      Alert.alert("Erro", "Erro ao atualizar detalhes.");
    } finally {
      setRefreshing(false);
    }
  };

  const handlePointPress = (pointId: string) => {
    router.push({
      pathname: "/point-details",
      params: { id: pointId },
    });
  };

  const renderPoint = ({ item }: { item: any }) => (
    <View style={styles.pointCardContainer}>
      <PointCard
        point={item}
        onPress={() => handlePointPress(item.id)}
        showFavoriteButton={false}
      />
      {item.efficacy_score !== undefined && (
        <View
          style={[
            styles.efficacyBadge,
            { backgroundColor: colors.warning + "20" },
          ]}
        >
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={[styles.efficacyText, { color: colors.warning }]}>
            Eficácia: {item.efficacy_score}%
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading && !currentSymptom) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando sintoma...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentSymptom) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            Sintoma não encontrado
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.surface }]}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <ActivityIndicator animating={refreshing} color={colors.primary} />
        }
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentSymptom.name}
          </Text>
        </View>

        {/* Category and Tags */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {currentSymptom.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="folder-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {currentSymptom.category}
              </Text>
            </View>
          )}
          {currentSymptom.tags && currentSymptom.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {currentSymptom.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.background }]}
                >
                  <Text
                    style={[styles.tagText, { color: colors.textSecondary }]}
                  >
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Severity */}
        {currentSymptom.severity !== undefined && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Severidade
            </Text>
            <View style={styles.severityContainer}>
              <View
                style={[styles.severityBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.severityFill,
                    {
                      width: `${(currentSymptom.severity / 10) * 100}%`,
                      backgroundColor:
                        currentSymptom.severity > 7
                          ? colors.error
                          : currentSymptom.severity > 4
                          ? colors.warning
                          : colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.severityValue, { color: colors.text }]}>
                {currentSymptom.severity}/10
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {currentSymptom.description && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Descrição
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {currentSymptom.description}
            </Text>
          </View>
        )}

        {/* Related Points */}
        {currentSymptom.points && currentSymptom.points.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pontos de Acupuntura Relacionados
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              {currentSymptom.points.length} ponto
              {currentSymptom.points.length !== 1 ? "s" : ""} pode
              {currentSymptom.points.length !== 1 ? "m" : ""} ajudar com este
              sintoma
            </Text>
            <FlatList
              data={currentSymptom.points}
              renderItem={renderPoint}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.pointsList}
            />
          </View>
        )}

        {/* Usage Stats */}
        {currentSymptom.useCount !== undefined && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View
              style={[styles.statCard, { backgroundColor: colors.background }]}
            >
              <Ionicons
                name="analytics-outline"
                size={24}
                color={colors.info}
              />
              <View style={styles.statInfo}>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Buscas
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {currentSymptom.useCount}
                </Text>
              </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backIconButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  section: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: SPACING.md,
  },
  severityFill: {
    height: "100%",
  },
  severityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    minWidth: 40,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  pointsList: {
    marginTop: SPACING.sm,
  },
  pointCardContainer: {
    marginBottom: SPACING.md,
  },
  efficacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: SPACING.xs,
  },
  efficacyText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: "600",
    marginLeft: 4,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  statInfo: {
    marginLeft: SPACING.md,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
