import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Svg, { Circle, Path, Text as SvgText, G } from "react-native-svg";
import { COLORS } from "../utils/constants";

interface BodyRegion {
  id: string;
  name: string;
  pointCount: number;
  center: { x: number; y: number };
}

interface BodyMapProps {
  regions: BodyRegion[];
  onRegionPress: (region: BodyRegion) => void;
  selectedRegion?: string;
}

export function BodyMap({
  regions,
  onRegionPress,
  selectedRegion,
}: BodyMapProps) {
  return (
    <View style={styles.container}>
      <Svg width="320" height="600" viewBox="0 0 320 600">
        {/* Body outline - front view */}
        <G>
          {/* Head */}
          <Circle
            cx="160"
            cy="60"
            r="35"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Neck */}
          <Path
            d="M145 95 L145 115 L175 115 L175 95"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Torso */}
          <Path
            d="M145 115 C135 115 125 125 125 135 L125 200 C125 220 135 240 145 250 L175 250 C185 240 195 220 195 200 L195 135 C195 125 185 115 175 115 Z"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Arms */}
          <Path
            d="M125 145 C115 145 105 155 105 165 L105 240 C105 250 115 260 125 260"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />
          <Path
            d="M195 145 C205 145 215 155 215 165 L215 240 C215 250 205 260 195 260"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Hands */}
          <Circle
            cx="105"
            cy="280"
            r="15"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />
          <Circle
            cx="215"
            cy="280"
            r="15"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Pelvis */}
          <Path
            d="M145 250 L145 280 C145 290 155 300 165 300 C175 300 185 290 175 280 L175 250"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Legs */}
          <Path
            d="M150 300 C145 300 140 310 140 320 L140 450 C140 460 150 470 160 470"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />
          <Path
            d="M170 300 C175 300 180 310 180 320 L180 450 C180 460 170 470 160 470"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />

          {/* Feet */}
          <Path
            d="M140 470 L140 490 L120 490 L120 485 L140 485"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />
          <Path
            d="M180 470 L180 490 L200 490 L200 485 L180 485"
            fill="none"
            stroke={COLORS.border}
            strokeWidth="2"
          />
        </G>

        {/* Interactive regions */}
        {regions.map((region) => (
          <G key={region.id}>
            <Circle
              cx={region.center.x}
              cy={region.center.y}
              r="12"
              fill={
                selectedRegion === region.id ? COLORS.primary : COLORS.accent
              }
              opacity="0.8"
              onPress={() => onRegionPress(region)}
              accessible={true}
              accessibilityLabel={`Região ${region.name}, ${region.pointCount} pontos. Toque para ver detalhes.`}
            />
            <SvgText
              x={region.center.x}
              y={region.center.y + 4}
              fontSize="10"
              fill={COLORS.surface}
              textAnchor="middle"
              fontWeight="bold"
            >
              {region.pointCount}
            </SvgText>
          </G>
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle} accessibilityRole="header">
          Regiões do Corpo
        </Text>
        <View style={styles.legendItems}>
          {regions.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.legendItem,
                selectedRegion === region.id && styles.selectedLegendItem,
              ]}
              onPress={() => onRegionPress(region)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar região ${region.name}, ${region.pointCount} pontos`}
              accessibilityState={{ selected: selectedRegion === region.id }}
            >
              <View
                style={[
                  styles.legendDot,
                  selectedRegion === region.id && styles.selectedLegendDot,
                ]}
              />
              <Text
                style={[
                  styles.legendText,
                  selectedRegion === region.id && styles.selectedLegendText,
                ]}
              >
                {region.name} ({region.pointCount})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    marginTop: 16,
    width: "100%",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  selectedLegendItem: {
    backgroundColor: COLORS.primary,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  selectedLegendDot: {
    backgroundColor: COLORS.surface,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
  },
  selectedLegendText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
