import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { useAuthStore } from "../../stores/authStore";
import { COLORS } from "../../utils/constants";
import { useThemeColors } from "../../stores/themeStore";
import { styles } from "./styles";
import { Point } from "../../types/api";
import PointLocationMap from "../../components/PointLocationMap";

const techniques = [
  "Agulha fina",
  "Eletroacupuntura",
  "Moxabustão",
  "Ventosa",
  "Auriculoterapia",
  "Acupressão",
];

export default function PointDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const {
    points,
    favorites,
    selectedPoint,
    loadPoint,
    toggleFavorite,
    loading,
  } = usePointsStore((state) => ({
    points: state.points,
    favorites: state.favorites,
    selectedPoint: state.selectedPoint,
    loadPoint: state.loadPoint,
    toggleFavorite: state.toggleFavorite,
    loading: state.loading,
  }));
  const { user } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(true);

  const pointId = useMemo(() => (Array.isArray(id) ? id[0] : id) ?? "", [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchPoint = async () => {
      if (!pointId) {
        setLocalLoading(false);
        return;
      }

      setLocalLoading(true);

      try {
        await loadPoint(pointId);
      } catch (error) {
        console.warn("Falha ao carregar ponto", error);
      } finally {
        if (isMounted) {
          setLocalLoading(false);
        }
      }
    };

    fetchPoint();

    return () => {
      isMounted = false;
    };
  }, [pointId, loadPoint]);

  const resolvedPoint: (Point & { function?: string; indication?: string }) | null = useMemo(() => {
    if (selectedPoint && selectedPoint.id === pointId) {
      return selectedPoint as Point & { function?: string; indication?: string };
    }

    return (
      points.find((p) => p.id === pointId) ||
      favorites.find((p) => p.id === pointId) ||
      null
    );
  }, [favorites, pointId, points, selectedPoint]);

  // Removed gallerySources - no longer using image gallery

  const handleToggleFavorite = async () => {
    if (!resolvedPoint) return;

    try {
      await toggleFavorite(resolvedPoint.id);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar favorito");
    }
  };

  const isFavorite = favorites.some((p) => p.id === resolvedPoint?.id);
  const indicationsList = useMemo(() => {
    // Backend uses 'indication' (singular), frontend may have 'indications'
    const indicationsText = resolvedPoint?.indication || resolvedPoint?.indications;
    
    if (!indicationsText) {
      return [] as string[];
    }

    if (Array.isArray(indicationsText)) {
      return indicationsText;
    }

    return indicationsText
      .split(/\n|;|•|,/)
      .map((item: string) => item.trim())
      .filter(Boolean);
  }, [resolvedPoint?.indication, resolvedPoint?.indications]);

  // Removed image management functions - focusing on map location only

  if (loading || localLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={{ color: colors.text }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resolvedPoint) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={{ color: colors.text }}>Ponto não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        {/* Removed ImageGallery - using only map location for cleaner design */}

        <View style={styles.header}>
          <Text style={[styles.pointName, { color: colors.text }]}>{resolvedPoint.name}</Text>
          <Text style={[styles.pointCode, { color: colors.primary, backgroundColor: `${colors.primary}15` }]}>{resolvedPoint.code}</Text>
          <Text style={[styles.pointMeridian, { color: colors.textSecondary }]}>{resolvedPoint.meridian}</Text>

          <TouchableOpacity
            style={[
              styles.favoriteButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isFavorite && [styles.favoriteButtonActive, { backgroundColor: `${colors.error}15`, borderColor: colors.error }],
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? colors.error : colors.text}
            />
            <Text
              style={[
                styles.favoriteButtonText,
                { color: colors.text },
                isFavorite && [styles.favoriteButtonTextActive, { color: colors.error }],
              ]}
            >
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Interactive map section - now prominently placed at the top */}
        {resolvedPoint.bodyMapCoords && resolvedPoint.bodyMapCoords.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Localização no Mapa Corporal</Text>
            <PointLocationMap
              coordinates={{
                x: resolvedPoint.bodyMapCoords[0].x,
                y: resolvedPoint.bodyMapCoords[0].y,
              }}
              layerId={resolvedPoint.bodyMapCoords[0].layerId || "default"}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Posição Anatômica</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="location"
              size={24}
              color={colors.primary}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Localização</Text>
            <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
              {resolvedPoint.location || "Localização não disponível"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Indicações</Text>
          <View style={styles.indicationsList}>
            {indicationsList.length > 0 ? (
              indicationsList.map((indication, index) => (
                <View key={index} style={[styles.indicationItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons
                    name="medical"
                    size={16}
                    color={colors.primary}
                    style={styles.indicationIcon}
                  />
                  <Text style={[styles.indicationText, { color: colors.text }]}>{indication}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
                  Indicações não disponíveis para este ponto.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Técnicas Aplicáveis</Text>
          <View style={styles.techniquesGrid}>
            {techniques.map((technique, index) => (
              <View key={index} style={[styles.techniqueChip, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.techniqueText, { color: colors.primary }]}>{technique}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Função</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="flash"
              size={24}
              color={colors.primary}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ação Terapêutica</Text>
            <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
              {resolvedPoint.functions || resolvedPoint.function || "Função terapêutica não especificada"}
            </Text>
          </View>
        </View>

        <View style={[styles.warningCard, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
          <Ionicons
            name="warning"
            size={24}
            color={colors.error}
            style={styles.warningIcon}
          />
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: colors.error }]}>Aviso Importante</Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              Este aplicativo é apenas para fins educacionais. Sempre consulte
              um profissional qualificado antes de aplicar qualquer técnica de
              acupuntura.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
