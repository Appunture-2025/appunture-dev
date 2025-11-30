import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgUri } from "react-native-svg";
import type {
  BodyAtlasLayer,
  BodyAtlasPlane,
} from "../assets/body-map/manifest";
import type { NormalizedCoordinate } from "../utils/bodyMap";
import {
  BODY_MAP_VIEWBOX,
  getMarkerPosition,
  getSvgAssetUri,
} from "../utils/bodyMap";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";

export interface BodyMapMarker {
  id: string;
  pointId: string;
  label: string;
  coordinates: NormalizedCoordinate;
}

interface BodyMapProps {
  layer: BodyAtlasLayer;
  plane: BodyAtlasPlane;
  markers?: BodyMapMarker[];
  selectedPointId?: string | null;
  onMarkerPress?: (marker: BodyMapMarker) => void;
}

export function BodyMap({
  layer,
  plane,
  markers = [],
  selectedPointId,
  onMarkerPress,
}: BodyMapProps) {
  const colors = useThemeColors();
  const [svgUri, setSvgUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getSvgAssetUri(layer.source)
      .then((uri) => {
        if (isMounted) {
          setSvgUri(uri);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [layer.source]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMapSize({ width, height });
  }, []);

  const markersWithPosition = useMemo(() => {
    if (!mapSize.width || !mapSize.height) {
      return [] as Array<BodyMapMarker & { left: number; top: number }>;
    }

    return markers
      .map((marker) => {
        const absolutePosition = getMarkerPosition(marker.coordinates);
        if (!absolutePosition) {
          return null;
        }

        const left =
          (absolutePosition.x / BODY_MAP_VIEWBOX.width) * mapSize.width;
        const top =
          (absolutePosition.y / BODY_MAP_VIEWBOX.height) * mapSize.height;

        return {
          ...marker,
          left,
          top,
        };
      })
      .filter(Boolean) as Array<BodyMapMarker & { left: number; top: number }>;
  }, [mapSize.height, mapSize.width, markers]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.layerHeader}>
        <View>
          <Text style={[styles.layerTitle, { color: colors.text }]}>
            {layer.label}
          </Text>
          <Text style={[styles.layerSubtitle, { color: colors.textSecondary }]}>
            {plane === "front" ? "Plano frontal" : "Plano posterior"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.mapWrapper,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
        onLayout={handleLayout}
      >
        {isLoading && (
          <ActivityIndicator
            style={styles.loader}
            color={colors.primary}
            accessibilityLabel="Carregando camada do atlas"
          />
        )}
        {svgUri ? (
          <SvgUri
            uri={svgUri}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}

        {markersWithPosition.map((marker) => (
          <TouchableOpacity
            key={marker.id}
            style={[
              styles.marker,
              {
                left: marker.left,
                top: marker.top,
              },
            ]}
            onPress={() => onMarkerPress?.(marker)}
            accessibilityLabel={`Ponto ${marker.label}`}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.markerDot,
                { backgroundColor: colors.accent, borderColor: colors.surface },
                marker.pointId === selectedPointId && {
                  backgroundColor: colors.primary,
                  borderColor: colors.surface,
                },
              ]}
            />
            <Text style={[styles.markerLabel, { color: colors.surface }]}>
              {marker.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!markers.length && !isLoading && (
        <Text style={[styles.emptyState, { color: colors.textSecondary }]}>
          Nenhum ponto com coordenadas foi localizado para esta camada.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  layerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  layerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  layerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mapWrapper: {
    width: "100%",
    aspectRatio: BODY_MAP_VIEWBOX.width / BODY_MAP_VIEWBOX.height,
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
    zIndex: 2,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  markerDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.surface,
  },
  markerLabel: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 11,
    color: COLORS.surface,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  emptyState: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
});

export default BodyMap;
