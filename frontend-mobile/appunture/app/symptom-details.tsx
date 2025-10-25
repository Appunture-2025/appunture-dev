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
import { COLORS, SPACING } from "../utils/constants";
import PointCard from "../components/PointCard";

export default function SymptomDetailsScreen() {
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
        <View style={styles.efficacyBadge}>
          <Ionicons name="star" size={12} color={COLORS.warning} />
          <Text style={styles.efficacyText}>
            Eficácia: {item.efficacy_score}%
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading && !currentSymptom) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando sintoma...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentSymptom) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>Sintoma não encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
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
        refreshControl={
          <ActivityIndicator animating={refreshing} color={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{currentSymptom.name}</Text>
        </View>

        {/* Category and Tags */}
        <View style={styles.section}>
          {currentSymptom.category && (
            <View style={styles.categoryBadge}>
              <Ionicons name="folder-outline" size={16} color={COLORS.primary} />
              <Text style={styles.categoryText}>{currentSymptom.category}</Text>
            </View>
          )}
          {currentSymptom.tags && currentSymptom.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {currentSymptom.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Severity */}
        {currentSymptom.severity !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Severidade</Text>
            <View style={styles.severityContainer}>
              <View style={styles.severityBar}>
                <View
                  style={[
                    styles.severityFill,
                    {
                      width: `${(currentSymptom.severity / 10) * 100}%`,
                      backgroundColor:
                        currentSymptom.severity > 7
                          ? COLORS.error
                          : currentSymptom.severity > 4
                          ? COLORS.warning
                          : COLORS.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.severityValue}>
                {currentSymptom.severity}/10
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {currentSymptom.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{currentSymptom.description}</Text>
          </View>
        )}

        {/* Related Points */}
        {currentSymptom.points && currentSymptom.points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pontos de Acupuntura Relacionados
            </Text>
            <Text style={styles.sectionSubtitle}>
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
          <View style={styles.section}>
            <View style={styles.statCard}>
              <Ionicons name="analytics-outline" size={24} color={COLORS.info} />
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Buscas</Text>
                <Text style={styles.statValue}>{currentSymptom.useCount}</Text>
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
