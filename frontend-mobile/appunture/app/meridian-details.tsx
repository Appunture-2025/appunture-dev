import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePointsStore } from "../stores/pointsStore";
import { COLORS } from "../utils/constants";
import { MERIDIAN_DATA } from "../utils/meridianData";
import { Point } from "../types/api";

export default function MeridianDetailsScreen() {
  const { meridianId } = useLocalSearchParams<{ meridianId: string }>();
  const router = useRouter();
  const { points, loading, loadPoints } = usePointsStore();
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);

  const meridianInfo = meridianId ? MERIDIAN_DATA[meridianId] : null;

  useEffect(() => {
    loadPoints();
  }, []);

  useEffect(() => {
    if (meridianInfo && points.length > 0) {
      // Filter points by meridian name
      const filtered = points.filter(
        (p) =>
          p.meridian.toLowerCase() === meridianInfo.name.toLowerCase() ||
          p.meridian.toLowerCase() === meridianInfo.abbreviation.toLowerCase()
      );
      setFilteredPoints(filtered);
    }
  }, [points, meridianInfo]);

  const handlePointPress = (pointId: string) => {
    router.push({
      pathname: "/point-details",
      params: { id: pointId },
    });
  };

  if (!meridianInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>Meridiano não encontrado</Text>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando pontos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: meridianInfo.color }]}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.abbreviation}>
              {meridianInfo.abbreviation}
            </Text>
            <Text style={styles.meridianName}>{meridianInfo.name}</Text>
            <Text style={styles.chineseName}>{meridianInfo.chineseName}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="pin" size={20} color={COLORS.text} />
                <Text style={styles.statText}>
                  {filteredPoints.length} pontos
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="water-outline" size={20} color={COLORS.text} />
                <Text style={styles.statText}>{meridianInfo.element}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={COLORS.text} />
                <Text style={styles.statText}>{meridianInfo.hours}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Meridian Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="body-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Órgão:</Text>
                <Text style={styles.infoValue}>{meridianInfo.organ}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="git-branch-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Trajeto:</Text>
                <Text style={styles.infoValue}>{meridianInfo.path}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Funções:</Text>
                {meridianInfo.functions.map((func, idx) => (
                  <Text key={idx} style={styles.infoValue}>
                    • {func}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Points List */}
        <View style={styles.pointsSection}>
          <Text style={styles.sectionTitle}>
            Pontos ({filteredPoints.length})
          </Text>

          {filteredPoints.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="location-outline"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>
                Nenhum ponto encontrado para este meridiano
              </Text>
            </View>
          ) : (
            filteredPoints.map((point) => (
              <TouchableOpacity
                key={point.id}
                style={[
                  styles.pointCard,
                  { borderLeftColor: meridianInfo.color },
                ]}
                onPress={() => handlePointPress(point.id)}
                activeOpacity={0.7}
              >
                <View style={styles.pointHeader}>
                  <Text style={styles.pointCode}>{point.code}</Text>
                  {point.isFavorite && (
                    <Ionicons name="heart" size={20} color={COLORS.error} />
                  )}
                </View>
                <Text style={styles.pointName}>{point.name}</Text>
                {point.chinese_name && (
                  <Text style={styles.pointChineseName}>
                    {point.chinese_name}
                  </Text>
                )}
                <Text style={styles.pointLocation} numberOfLines={2}>
                  {point.location}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  abbreviation: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  meridianName: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  chineseName: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  pointsSection: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  pointCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pointCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  pointName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  pointChineseName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pointLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
