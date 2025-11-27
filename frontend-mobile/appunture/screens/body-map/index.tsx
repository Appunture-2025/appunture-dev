import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BodyMap, BodyMapMarker } from "../../components/BodyMap";
import { usePointsStore } from "../../stores/pointsStore";
import type { BodyAtlasPlane } from "../../assets/body-map/manifest";
import { getAtlasLayerById, getLayersByPlane } from "../../utils/bodyMap";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";

export default function BodyMapScreen() {
  const router = useRouter();
  const { points, loading, loadPoints } = usePointsStore((state) => ({
    points: state.points,
    loading: state.loading,
    loadPoints: state.loadPoints,
  }));
  const [plane, setPlane] = useState<BodyAtlasPlane>("front");
  const [layerIndex, setLayerIndex] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  useEffect(() => {
    if (!points.length) {
      loadPoints();
    }
  }, [loadPoints, points.length]);

  useEffect(() => {
    setLayerIndex(0);
    setSelectedPointId(null);
  }, [plane]);

  const layers = useMemo(() => getLayersByPlane(plane), [plane]);
  const activeLayer = layers[layerIndex] ?? getAtlasLayerById();
  const pointMap = useMemo(
    () => new Map(points.map((point) => [point.id, point])),
    [points]
  );

  const markers = useMemo<BodyMapMarker[]>(() => {
    if (!activeLayer) {
      return [];
    }
    const isDefaultLayer = layerIndex === 0;

    return points.flatMap((point) => {
      if (!point.bodyMapCoords?.length) {
        return [];
      }

      return point.bodyMapCoords
        .filter((coord) => {
          if (!coord.layerId) {
            return isDefaultLayer;
          }
          return coord.layerId === activeLayer.id;
        })
        .map((coord, coordIndex) => ({
          id: `${point.id}-${coord.layerId ?? coordIndex}`,
          pointId: point.id,
          label: point.code || point.name,
          coordinates: { x: coord.x, y: coord.y },
        }));
    });
  }, [activeLayer, layerIndex, points]);

  const visiblePoints = useMemo(() => {
    const seen = new Set<string>();
    const subset = [] as typeof points;

    markers.forEach((marker) => {
      if (seen.has(marker.pointId)) {
        return;
      }
      const point = pointMap.get(marker.pointId);
      if (point) {
        seen.add(marker.pointId);
        subset.push(point);
      }
    });

    return subset;
  }, [markers, pointMap]);

  const handlePlaneChange = useCallback((nextPlane: BodyAtlasPlane) => {
    setPlane(nextPlane);
  }, []);

  const handleLayerStep = useCallback(
    (direction: "prev" | "next") => {
      setLayerIndex((current) => {
        if (direction === "prev") {
          return Math.max(0, current - 1);
        }
        return Math.min(layers.length - 1, current + 1);
      });
    },
    [layers.length]
  );

  const handleMarkerPress = useCallback(
    (marker: BodyMapMarker) => {
      setSelectedPointId(marker.pointId);
      router.push(`/point/${marker.pointId}`);
    },
    [router]
  );

  const handlePointPress = useCallback(
    (pointId: string) => {
      setSelectedPointId(pointId);
      router.push(`/point/${pointId}`);
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header} accessibilityRole="header">
          <Text style={styles.title}>Mapa Corporal</Text>
          <Text style={styles.subtitle}>
            Visualize os pontos registrados diretamente sobre as camadas do
            atlas oficial.
          </Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.planeToggle}>
            {(["front", "back"] as BodyAtlasPlane[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.planeButton,
                  plane === option && styles.planeButtonActive,
                ]}
                onPress={() => handlePlaneChange(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: plane === option }}
              >
                <Text
                  style={[
                    styles.planeButtonText,
                    plane === option && styles.planeButtonTextActive,
                  ]}
                >
                  {option === "front" ? "Frente" : "Costas"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.layerControls}>
            <TouchableOpacity
              style={[
                styles.layerButton,
                layerIndex === 0 && styles.layerButtonDisabled,
              ]}
              onPress={() => handleLayerStep("prev")}
              disabled={layerIndex === 0}
              accessibilityLabel="Camada anterior"
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.surface} />
            </TouchableOpacity>
            <View style={styles.layerInfo}>
              <Text style={styles.layerInfoTitle}>{activeLayer.label}</Text>
              <Text style={styles.layerInfoSubtitle}>
                Camada {layerIndex + 1} de {layers.length}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.layerButton,
                layerIndex === layers.length - 1 && styles.layerButtonDisabled,
              ]}
              onPress={() => handleLayerStep("next")}
              disabled={layerIndex === layers.length - 1}
              accessibilityLabel="Próxima camada"
            >
              <Ionicons name="arrow-forward" size={18} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </View>

        <BodyMap
          layer={activeLayer}
          plane={plane}
          markers={markers}
          selectedPointId={selectedPointId}
          onMarkerPress={handleMarkerPress}
        />

        {loading && !markers.length ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando pontos...</Text>
          </View>
        ) : null}

        <View style={styles.pointsSection}>
          <Text style={styles.sectionTitle}>Pontos nesta camada</Text>
          {visiblePoints.length ? (
            visiblePoints.map((point) => (
              <TouchableOpacity
                key={point.id}
                style={[
                  styles.pointRow,
                  point.id === selectedPointId && styles.pointRowActive,
                ]}
                onPress={() => handlePointPress(point.id)}
                accessibilityRole="button"
              >
                <View>
                  <Text style={styles.pointName}>{point.name}</Text>
                  <Text style={styles.pointMeta}>
                    {(point.code && point.code.trim()) || "Sem código"} ·{" "}
                    {point.meridian}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textSecondary}
                  importantForAccessibility="no-hide-descendants"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyListText}>
              Ainda não há coordenadas cadastradas para esta camada.
            </Text>
          )}
        </View>

        <View style={styles.instructionsCard} accessibilityRole="summary">
          <Ionicons
            name="information-circle"
            size={24}
            color={COLORS.primary}
            style={styles.instructionsIcon}
            importantForAccessibility="no-hide-descendants"
          />
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsTitle}>Dicas rápidas</Text>
            <Text style={styles.instructionsText}>
              Use o seletor de plano para alternar entre frente e costas. Cada
              camada agrupa uma faixa específica do atlas. Toque em um marcador
              ou na lista para abrir os detalhes completos do ponto.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
