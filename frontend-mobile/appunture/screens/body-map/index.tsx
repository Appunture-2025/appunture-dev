import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BodyMap, BodyMapMarker } from "../../components/BodyMap";
import { usePointsStore } from "../../stores/pointsStore";
import {
  BODY_ATLAS_LAYERS,
  type BodyAtlasLayer,
} from "../../static/body-map/manifest";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";

// Agrupa os meridianos por sigla para fácil acesso
const MERIDIAN_MAP = BODY_ATLAS_LAYERS.reduce<Record<string, BodyAtlasLayer>>(
  (acc, layer) => {
    acc[layer.id] = layer;
    return acc;
  },
  {}
);

// Lista de meridianos ordenados (removendo ST2 duplicado)
const MERIDIAN_LIST = BODY_ATLAS_LAYERS.filter(
  (layer) => layer.id !== "ST2"
).map((layer) => ({
  id: layer.id,
  label: layer.label,
  plane: layer.plane,
}));

export default function BodyMapScreen() {
  const router = useRouter();
  const { points, loading, loadPoints } = usePointsStore((state) => ({
    points: state.points,
    loading: state.loading,
    loadPoints: state.loadPoints,
  }));

  const [selectedMeridianId, setSelectedMeridianId] = useState<string>(
    MERIDIAN_LIST[0]?.id ?? "LU"
  );
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  useEffect(() => {
    if (!points.length) {
      loadPoints();
    }
  }, [loadPoints, points.length]);

  // Layer ativo baseado no meridiano selecionado
  const activeLayer = useMemo(
    () => MERIDIAN_MAP[selectedMeridianId] ?? BODY_ATLAS_LAYERS[0],
    [selectedMeridianId]
  );

  // Filtra pontos do meridiano selecionado
  const meridianPoints = useMemo(() => {
    // Mapeia sigla do meridiano para possíveis nomes
    const meridianMatches: Record<string, string[]> = {
      LU: ["LU", "Pulmão", "Lung", "Pulmao"],
      LI: ["LI", "Intestino Grosso", "Large Intestine", "IG"],
      ST: ["ST", "Estômago", "Stomach", "E", "Estomago"],
      SP: ["SP", "Baço", "Spleen", "BP", "Baco"],
      HT: ["HT", "Coração", "Heart", "C", "Coracao"],
      SI: ["SI", "Intestino Delgado", "Small Intestine", "ID"],
      BL: ["BL", "Bexiga", "Bladder", "B"],
      KI: ["KI", "Rim", "Kidney", "R"],
      P: ["P", "PC", "Pericárdio", "Pericardium", "Pericardio", "CS"],
      TW: [
        "TW",
        "TA",
        "Triplo Aquecedor",
        "Triple Warmer",
        "SJ",
        "Triple Heater",
      ],
      GB: ["GB", "VB", "Vesícula Biliar", "Gallbladder", "Vesicula Biliar"],
      LV: ["LV", "Fígado", "Liver", "F", "Figado"],
      GV: ["GV", "VG", "Vaso Governador", "Governing Vessel", "Du Mai", "Du"],
      CV: [
        "CV",
        "VC",
        "Vaso Concepção",
        "Conception Vessel",
        "Ren Mai",
        "Ren",
        "Vaso Concepcao",
      ],
    };

    const matches = meridianMatches[selectedMeridianId] || [selectedMeridianId];

    return points.filter((point) => {
      // Verifica pelo meridiano do ponto
      if (point.meridian) {
        const meridianLower = point.meridian.toLowerCase();
        if (matches.some((m) => meridianLower.includes(m.toLowerCase()))) {
          return true;
        }
      }
      // Verifica pelo código do ponto (ex: LU1, LU2, etc.)
      if (point.code) {
        const codeLower = point.code.toLowerCase();
        if (matches.some((m) => codeLower.startsWith(m.toLowerCase()))) {
          return true;
        }
      }
      return false;
    });
  }, [points, selectedMeridianId]);

  // Cria markers para os pontos do meridiano, filtrando pela camada ativa
  const markers = useMemo<BodyMapMarker[]>(() => {
    return meridianPoints
      .filter((point) => point.bodyMapCoords?.length || point.coordinates)
      .flatMap((point) => {
        // Se tem bodyMapCoords, filtra pela camada ativa e usa elas
        if (point.bodyMapCoords?.length) {
          return point.bodyMapCoords
            .filter((coord) => coord.layerId === activeLayer.id)
            .map((coord, index) => ({
              id: `${point.id}-${index}`,
              pointId: point.id,
              label: point.code || point.name,
              coordinates: { x: coord.x, y: coord.y },
            }));
        }
        // Se tem coordinates simples, usa ela (fallback para compatibilidade)
        if (point.coordinates) {
          return [
            {
              id: point.id,
              pointId: point.id,
              label: point.code || point.name,
              coordinates: { x: point.coordinates.x, y: point.coordinates.y },
            },
          ];
        }
        return [];
      });
  }, [meridianPoints, activeLayer.id]);

  const handleMeridianSelect = useCallback((meridianId: string) => {
    setSelectedMeridianId(meridianId);
    setSelectedPointId(null);
  }, []);

  const handleMarkerPress = useCallback(
    (marker: BodyMapMarker) => {
      setSelectedPointId(marker.pointId);
      router.push({
        pathname: "/point-details",
        params: { id: marker.pointId },
      });
    },
    [router]
  );

  const handlePointPress = useCallback(
    (pointId: string) => {
      setSelectedPointId(pointId);
      router.push({
        pathname: "/point-details",
        params: { id: pointId },
      });
    },
    [router]
  );

  const renderMeridianItem = useCallback(
    ({ item }: { item: (typeof MERIDIAN_LIST)[0] }) => (
      <TouchableOpacity
        style={[
          styles.meridianChip,
          selectedMeridianId === item.id && styles.meridianChipActive,
        ]}
        onPress={() => handleMeridianSelect(item.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedMeridianId === item.id }}
      >
        <Text
          style={[
            styles.meridianChipText,
            selectedMeridianId === item.id && styles.meridianChipTextActive,
          ]}
        >
          {item.id}
        </Text>
      </TouchableOpacity>
    ),
    [selectedMeridianId, handleMeridianSelect]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header} accessibilityRole="header">
          <Text style={styles.title}>Mapa dos Meridianos</Text>
          <Text style={styles.subtitle}>
            Selecione um meridiano para visualizar seus pontos no mapa corporal
          </Text>
        </View>

        {/* Seletor de Meridianos */}
        <View style={styles.meridianSelector}>
          <Text style={styles.sectionLabel}>Meridianos</Text>
          <FlatList
            horizontal
            data={MERIDIAN_LIST}
            renderItem={renderMeridianItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.meridianList}
          />
        </View>

        {/* Info do Meridiano Selecionado */}
        <View style={styles.meridianInfo}>
          <Text style={styles.meridianTitle}>{activeLayer.label}</Text>
          <Text style={styles.meridianSubtitle}>
            {meridianPoints.length} ponto
            {meridianPoints.length !== 1 ? "s" : ""} •{markers.length} com
            coordenadas
          </Text>
        </View>

        {/* Mapa SVG */}
        <BodyMap
          layer={activeLayer}
          plane={activeLayer.plane}
          markers={markers}
          selectedPointId={selectedPointId}
          onMarkerPress={handleMarkerPress}
        />

        {loading && !meridianPoints.length ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando pontos...</Text>
          </View>
        ) : null}

        {/* Lista de Pontos do Meridiano */}
        <View style={styles.pointsSection}>
          <Text style={styles.sectionTitle}>
            Pontos do Meridiano {selectedMeridianId}
          </Text>
          {meridianPoints.length > 0 ? (
            meridianPoints.map((point) => (
              <TouchableOpacity
                key={point.id}
                style={[
                  styles.pointRow,
                  point.id === selectedPointId && styles.pointRowActive,
                ]}
                onPress={() => handlePointPress(point.id)}
                accessibilityRole="button"
              >
                <View style={styles.pointInfo}>
                  <Text style={styles.pointCode}>{point.code || "—"}</Text>
                  <View style={styles.pointDetails}>
                    <Text style={styles.pointName} numberOfLines={1}>
                      {point.name}
                    </Text>
                    {point.chineseName && (
                      <Text style={styles.pointChinese}>
                        {point.chineseName}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.pointStatus}>
                  {point.bodyMapCoords?.length || point.coordinates ? (
                    <Ionicons
                      name="location"
                      size={16}
                      color={COLORS.success}
                    />
                  ) : (
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={COLORS.textSecondary}
                    />
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyListText}>
              {loading
                ? "Carregando pontos..."
                : "Nenhum ponto encontrado para este meridiano."}
            </Text>
          )}
        </View>

        {/* Legenda */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legenda</Text>
          <View style={styles.legendItem}>
            <Ionicons name="location" size={16} color={COLORS.success} />
            <Text style={styles.legendText}>Ponto com coordenadas no mapa</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.legendText}>
              Ponto sem coordenadas cadastradas
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
