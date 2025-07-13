import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { usePointsStore } from "../stores/pointsStore";
import { LocalPoint } from "../types/database";
import { COLORS } from "../utils/constants";

interface BodyRegion {
  id: string;
  name: string;
  points: LocalPoint[];
  center: { x: number; y: number };
}

export default function BodyMapScreen() {
  const { points, favoritePoints, toggleFavorite } = usePointsStore();
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<LocalPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bodyRegions, setBodyRegions] = useState<BodyRegion[]>([]);

  useEffect(() => {
    generateBodyRegions();
  }, [points]);

  const generateBodyRegions = () => {
    // Simplified body regions mapping
    const regions: BodyRegion[] = [
      {
        id: "head",
        name: "Cabeça",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("cabeça") ||
            p.location?.toLowerCase().includes("testa") ||
            p.location?.toLowerCase().includes("têmpora") ||
            p.meridian?.includes("VG") ||
            p.meridian?.includes("EX-HN")
        ),
        center: { x: 150, y: 80 },
      },
      {
        id: "neck",
        name: "Pescoço",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("pescoço") ||
            p.location?.toLowerCase().includes("cervical")
        ),
        center: { x: 150, y: 120 },
      },
      {
        id: "chest",
        name: "Tórax",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("tórax") ||
            p.location?.toLowerCase().includes("peito") ||
            p.meridian?.includes("PC") ||
            p.meridian?.includes("CS")
        ),
        center: { x: 150, y: 180 },
      },
      {
        id: "abdomen",
        name: "Abdômen",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("abdômen") ||
            p.location?.toLowerCase().includes("abdomen") ||
            p.meridian?.includes("VC")
        ),
        center: { x: 150, y: 240 },
      },
      {
        id: "arms",
        name: "Braços",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("braço") ||
            p.location?.toLowerCase().includes("antebraço") ||
            p.meridian?.includes("IG") ||
            p.meridian?.includes("P") ||
            p.meridian?.includes("TA")
        ),
        center: { x: 100, y: 180 },
      },
      {
        id: "hands",
        name: "Mãos",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("mão") ||
            p.location?.toLowerCase().includes("punho") ||
            p.location?.toLowerCase().includes("dedo")
        ),
        center: { x: 80, y: 280 },
      },
      {
        id: "legs",
        name: "Pernas",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("perna") ||
            p.location?.toLowerCase().includes("coxa") ||
            p.location?.toLowerCase().includes("joelho") ||
            p.meridian?.includes("E") ||
            p.meridian?.includes("BP") ||
            p.meridian?.includes("VB")
        ),
        center: { x: 130, y: 350 },
      },
      {
        id: "feet",
        name: "Pés",
        points: points.filter(
          (p) =>
            p.location?.toLowerCase().includes("pé") ||
            p.location?.toLowerCase().includes("tornozelo") ||
            p.meridian?.includes("R") ||
            p.meridian?.includes("B")
        ),
        center: { x: 150, y: 450 },
      },
    ];

    setBodyRegions(regions.filter((region) => region.points.length > 0));
  };

  const handleRegionPress = (region: BodyRegion) => {
    setSelectedRegion(region);
    setModalVisible(true);
  };

  const handlePointPress = (point: LocalPoint) => {
    setSelectedPoint(point);
  };

  const handleToggleFavorite = (pointId: string | number) => {
    toggleFavorite(pointId.toString());
  };

  const renderBodyMap = () => {
    return (
      <Svg width="300" height="500" viewBox="0 0 300 500">
        {/* Simple body outline */}
        <Path
          d="M150 50 C140 50 130 60 130 70 L130 100 C120 110 110 120 110 140 L110 200 C110 220 120 240 120 260 L120 300 C110 310 100 320 100 340 L100 400 C100 420 110 440 120 450 L180 450 C190 440 200 420 200 400 L200 340 C200 320 190 310 180 300 L180 260 C180 240 190 220 190 200 L190 140 C190 120 180 110 170 100 L170 70 C170 60 160 50 150 50 Z"
          fill={COLORS.background}
          stroke={COLORS.border}
          strokeWidth="2"
        />

        {/* Body regions as clickable areas */}
        {bodyRegions.map((region) => (
          <Circle
            key={region.id}
            cx={region.center.x}
            cy={region.center.y}
            r="15"
            fill={COLORS.primary}
            opacity="0.7"
            onPress={() => handleRegionPress(region)}
          />
        ))}

        {/* Region labels */}
        {bodyRegions.map((region) => (
          <SvgText
            key={`label-${region.id}`}
            x={region.center.x + 20}
            y={region.center.y + 5}
            fontSize="12"
            fill={COLORS.text}
            textAnchor="start"
          >
            {region.name} ({region.points.length})
          </SvgText>
        ))}
      </Svg>
    );
  };

  const renderPointModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedRegion?.name} - {selectedRegion?.points.length} pontos
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedRegion?.points.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={styles.pointItem}
              onPress={() => handlePointPress(point)}
            >
              <View style={styles.pointHeader}>
                <Text style={styles.pointName}>{point.name}</Text>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(point.id)}
                  style={styles.favoriteButton}
                >
                  <Ionicons
                    name={
                      favoritePoints.includes(point.id)
                        ? "heart"
                        : "heart-outline"
                    }
                    size={20}
                    color={
                      favoritePoints.includes(point.id)
                        ? COLORS.error
                        : COLORS.textSecondary
                    }
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.pointMeridian}>{point.meridian}</Text>
              <Text style={styles.pointLocation}>{point.location}</Text>

              {point.indications && (
                <Text style={styles.pointIndications} numberOfLines={2}>
                  {point.indications}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderPointDetailModal = () => (
    <Modal
      visible={!!selectedPoint}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setSelectedPoint(null)}
    >
      {selectedPoint && (
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedPoint.name}</Text>
            <TouchableOpacity
              onPress={() => setSelectedPoint(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.pointDetail}>
              <Text style={styles.detailTitle}>Nome Chinês</Text>
              <Text style={styles.detailText}>
                {selectedPoint.chinese_name || "Não informado"}
              </Text>

              <Text style={styles.detailTitle}>Meridiano</Text>
              <Text style={styles.detailText}>{selectedPoint.meridian}</Text>

              <Text style={styles.detailTitle}>Localização</Text>
              <Text style={styles.detailText}>{selectedPoint.location}</Text>

              {selectedPoint.indications && (
                <>
                  <Text style={styles.detailTitle}>Indicações</Text>
                  <Text style={styles.detailText}>
                    {selectedPoint.indications}
                  </Text>
                </>
              )}

              {selectedPoint.functions && (
                <>
                  <Text style={styles.detailTitle}>Funções</Text>
                  <Text style={styles.detailText}>
                    {selectedPoint.functions}
                  </Text>
                </>
              )}

              {selectedPoint.contraindications && (
                <>
                  <Text style={styles.detailTitle}>Contraindicações</Text>
                  <Text style={styles.detailText}>
                    {selectedPoint.contraindications}
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={styles.favoriteButtonLarge}
                onPress={() => handleToggleFavorite(selectedPoint.id)}
              >
                <Ionicons
                  name={
                    favoritePoints.includes(selectedPoint.id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={24}
                  color={COLORS.surface}
                />
                <Text style={styles.favoriteButtonText}>
                  {favoritePoints.includes(selectedPoint.id)
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa Corporal</Text>
        <Text style={styles.subtitle}>
          Toque nas regiões para ver os pontos
        </Text>
      </View>

      <ScrollView
        style={styles.mapContainer}
        contentContainerStyle={styles.mapContent}
        showsVerticalScrollIndicator={false}
      >
        {renderBodyMap()}
      </ScrollView>

      {renderPointModal()}
      {renderPointDetailModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
  mapContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  pointItem: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pointName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  pointMeridian: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  pointLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pointIndications: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  pointDetail: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  favoriteButtonLarge: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  favoriteButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
