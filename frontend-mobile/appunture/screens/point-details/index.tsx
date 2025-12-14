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

  const resolvedPoint: (Point & { function?: string }) | null = useMemo(() => {
    if (selectedPoint && selectedPoint.id === pointId) {
      return selectedPoint as Point & { function?: string };
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
    if (!resolvedPoint?.indications) {
      return [] as string[];
    }

    if (Array.isArray(resolvedPoint.indications)) {
      return resolvedPoint.indications;
    }

    return resolvedPoint.indications
      .split(/\n|;|•|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [resolvedPoint?.indications]);

  // Removed image management functions - focusing on map location only

  if (loading || localLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resolvedPoint) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Ponto não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        {/* Removed ImageGallery - using only map location for cleaner design */}

        <View style={styles.header}>
          <Text style={styles.pointName}>{resolvedPoint.name}</Text>
          <Text style={styles.pointCode}>{resolvedPoint.code}</Text>
          <Text style={styles.pointMeridian}>{resolvedPoint.meridian}</Text>

          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
            <Text
              style={[
                styles.favoriteButtonText,
                isFavorite && styles.favoriteButtonTextActive,
              ]}
            >
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Interactive map section - now prominently placed at the top */}
        {resolvedPoint.bodyMapCoords && resolvedPoint.bodyMapCoords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização no Mapa Corporal</Text>
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
          <Text style={styles.sectionTitle}>Posição Anatômica</Text>
          <View style={styles.card}>
            <Ionicons
              name="location"
              size={24}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Localização</Text>
            <Text style={styles.cardContent}>
              {resolvedPoint.location || "Localização não disponível"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicações</Text>
          <View style={styles.indicationsList}>
            {indicationsList.length > 0 ? (
              indicationsList.map((indication, index) => (
                <View key={index} style={styles.indicationItem}>
                  <Ionicons
                    name="medical"
                    size={16}
                    color={COLORS.primary}
                    style={styles.indicationIcon}
                  />
                  <Text style={styles.indicationText}>{indication}</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardContent}>
                  Indicações não disponíveis para este ponto.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnicas Aplicáveis</Text>
          <View style={styles.techniquesGrid}>
            {techniques.map((technique, index) => (
              <View key={index} style={styles.techniqueChip}>
                <Text style={styles.techniqueText}>{technique}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Função</Text>
          <View style={styles.card}>
            <Ionicons
              name="flash"
              size={24}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Ação Terapêutica</Text>
            <Text style={styles.cardContent}>
              {resolvedPoint.function || "Função terapêutica não especificada"}
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons
            name="warning"
            size={24}
            color={COLORS.error}
            style={styles.warningIcon}
          />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Aviso Importante</Text>
            <Text style={styles.warningText}>
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
