import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePointsStore } from "../stores/pointsStore";
import { LocalPoint } from "../types/database";
import { COLORS } from "../utils/constants";

export default function PointDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { points, favoritePoints, toggleFavorite } = usePointsStore();
  const [point, setPoint] = useState<LocalPoint | null>(null);

  useEffect(() => {
    if (id) {
      const foundPoint = points.find((p: LocalPoint) => p.id.toString() === id);
      setPoint(foundPoint || null);
    }
  }, [id, points]);

  const handleToggleFavorite = () => {
    if (point) {
      toggleFavorite(point.id.toString());
    }
  };

  const handleShare = async () => {
    if (!point) return;

    try {
      const message = `${point.name} (${point.meridian})\n\nLocalização: ${
        point.location
      }\n\nIndicações: ${point.indications || "Não informadas"}`;

      await Share.share({
        message,
        title: `Ponto de Acupuntura: ${point.name}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      Alert.alert("Erro", "Não foi possível compartilhar este ponto.");
    }
  };

  const handleReportError = () => {
    Alert.alert(
      "Reportar Erro",
      "Encontrou alguma informação incorreta neste ponto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reportar",
          onPress: () => {
            Alert.alert(
              "Obrigado!",
              "Seu feedback foi registrado e será analisado pela nossa equipe."
            );
          },
        },
      ]
    );
  };

  if (!point) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ponto não encontrado</Text>
        </View>
        <View style={styles.centerContent}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text style={styles.errorText}>
            Não foi possível encontrar as informações deste ponto.
          </Text>
        </View>
      </View>
    );
  }

  const isFavorite = favoritePoints.includes(point.id.toString());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {point.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.actionButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View style={styles.card}>
          <View style={styles.pointHeader}>
            <Text style={styles.pointName}>{point.name}</Text>
            <View style={styles.meridianBadge}>
              <Text style={styles.meridianText}>{point.meridian}</Text>
            </View>
          </View>

          {point.chinese_name && (
            <Text style={styles.chineseName}>{point.chinese_name}</Text>
          )}
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.sectionTitle}>Localização</Text>
          </View>
          <Text style={styles.sectionContent}>{point.location}</Text>
        </View>

        {/* Indications Card */}
        {point.indications && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="medical-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Indicações</Text>
            </View>
            <Text style={styles.sectionContent}>{point.indications}</Text>
          </View>
        )}

        {/* Functions Card */}
        {point.functions && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Funções</Text>
            </View>
            <Text style={styles.sectionContent}>{point.functions}</Text>
          </View>
        )}

        {/* Contraindications Card */}
        {point.contraindications && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="warning-outline"
                size={20}
                color={COLORS.warning}
              />
              <Text style={styles.sectionTitle}>Contraindicações</Text>
            </View>
            <Text style={styles.sectionContent}>{point.contraindications}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleReportError}
          >
            <Ionicons
              name="flag-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.actionText}>Reportar erro</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.footerText}>
            As informações apresentadas são baseadas na medicina tradicional
            chinesa. Sempre consulte um profissional qualificado.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  pointName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  meridianBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  meridianText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  chineseName: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  infoFooter: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
