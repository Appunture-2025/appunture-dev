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
import { useRouter } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { useThemeColors } from "../../stores/themeStore";
import { COLORS } from "../../utils/constants";
import { MERIDIAN_DATA, getMeridianColor } from "../../utils/meridianData";

interface MeridianCardProps {
  meridianId: string;
  pointCount: number;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}

const MeridianCard: React.FC<MeridianCardProps> = ({
  meridianId,
  pointCount,
  onPress,
  colors,
}) => {
  const meridianInfo = MERIDIAN_DATA[meridianId];

  if (!meridianInfo) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: meridianInfo.color }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Meridiano ${meridianInfo.name}. ${meridianInfo.chineseName}. Elemento ${meridianInfo.element}. Horário ${meridianInfo.hours}. ${pointCount} pontos.`}
      accessibilityHint="Toque para ver detalhes do meridiano"
    >
      <View style={styles.cardHeader}>
        <View style={styles.meridianInfo}>
          <Text style={[styles.abbreviation, { color: colors.text }]}>
            {meridianInfo.abbreviation}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.surface }]}>
              {pointCount}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={colors.textSecondary}
          importantForAccessibility="no-hide-descendants"
        />
      </View>

      <Text style={[styles.meridianName, { color: colors.text }]}>
        {meridianInfo.name}
      </Text>
      <Text style={[styles.chineseName, { color: colors.textSecondary }]}>
        {meridianInfo.chineseName}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons
            name="water-outline"
            size={16}
            color={colors.textSecondary}
            importantForAccessibility="no-hide-descendants"
          />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {meridianInfo.element}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textSecondary}
            importantForAccessibility="no-hide-descendants"
          />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {meridianInfo.hours}
          </Text>
        </View>
      </View>

      <Text style={[styles.organ, { color: colors.text }]} numberOfLines={1}>
        {meridianInfo.organ}
      </Text>
    </TouchableOpacity>
  );
};

export default function MeridiansScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { meridians, loading, loadMeridians } = usePointsStore();
  const [expandedMeridian, setExpandedMeridian] = useState<string | null>(null);

  useEffect(() => {
    loadMeridians();
  }, []);

  const handleMeridianPress = (meridianId: string) => {
    // Navigate to filtered points by meridian
    router.push({
      pathname: "/meridian-details",
      params: { meridianId },
    });
  };

  const handleCardLongPress = (meridianId: string) => {
    setExpandedMeridian(expandedMeridian === meridianId ? null : meridianId);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando meridianos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Map backend meridians to our meridian data
  const meridiansWithInfo = meridians
    .map((m) => {
      // Try to find matching meridian info
      const meridianId = Object.keys(MERIDIAN_DATA).find(
        (id) =>
          MERIDIAN_DATA[id].name.toLowerCase() === m.meridian.toLowerCase() ||
          MERIDIAN_DATA[id].abbreviation.toLowerCase() ===
            m.meridian.toLowerCase()
      );

      return meridianId
        ? {
            id: meridianId,
            pointCount: m.point_count,
          }
        : null;
    })
    .filter((m) => m !== null);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Meridianos</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Explore os {meridiansWithInfo.length} meridianos principais da
            acupuntura
          </Text>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="information-circle"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Os meridianos são canais de energia (Qi) que percorrem o corpo. Cada
            meridiano está associado a um órgão e possui funções específicas.
          </Text>
        </View>

        {/* Meridian Cards */}
        <View style={styles.cardsContainer}>
          {meridiansWithInfo.map((meridian) => (
            <View key={meridian!.id}>
              <MeridianCard
                meridianId={meridian!.id}
                pointCount={meridian!.pointCount}
                onPress={() => handleMeridianPress(meridian!.id)}
                colors={colors}
              />

              {/* Expanded Info */}
              {expandedMeridian === meridian!.id && (
                <View
                  style={[
                    styles.expandedInfo,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.expandedTitle, { color: colors.text }]}>
                    Trajeto:
                  </Text>
                  <Text
                    style={[
                      styles.expandedText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {MERIDIAN_DATA[meridian!.id].path}
                  </Text>

                  <Text style={[styles.expandedTitle, { color: colors.text }]}>
                    Funções:
                  </Text>
                  {MERIDIAN_DATA[meridian!.id].functions.map((func, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.expandedText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • {func}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legenda:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E8F5E9" }]} />
            <Text style={styles.legendText}>Metal / Madeira</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FFEBEE" }]} />
            <Text style={styles.legendText}>Fogo</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FFF9C4" }]} />
            <Text style={styles.legendText}>Terra</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E3F2FD" }]} />
            <Text style={styles.legendText}>Água</Text>
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  meridianInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  abbreviation: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginRight: 12,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  meridianName: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  chineseName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  organ: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  expandedInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: -8,
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  expandedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  legend: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
