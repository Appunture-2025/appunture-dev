import { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  ImageSourcePropType,
} from "react-native";
import type {
  BodyAtlasLayer,
  BodyAtlasPlane,
} from "../static/body-map/manifest";
import type { NormalizedCoordinate } from "../utils/bodyMap";
import { getMarkerPosition } from "../utils/bodyMap";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";
import { ZoomableView } from "./ZoomableView";

// SVG viewBox dimensions - coordinates are mapped to these values
// The PNG was exported from SVG with viewBox="0 0 1440 809.999993"
const SVG_WIDTH = 1440;
const SVG_HEIGHT = 809.999993;

// Direct PNG imports
import LU_PNG from "../static/body-map/LU.png";
import LI_PNG from "../static/body-map/LI.png";
import ST_PNG from "../static/body-map/ST.png";
import ST2_PNG from "../static/body-map/ST2.png";
import SP_PNG from "../static/body-map/SP.png";
import HT_PNG from "../static/body-map/HT.png";
import SI_PNG from "../static/body-map/SI.png";
import BL_PNG from "../static/body-map/BL.png";
import KI_PNG from "../static/body-map/KI.png";
import P_PNG from "../static/body-map/P.png";
import TW_PNG from "../static/body-map/TW.png";
import GB_PNG from "../static/body-map/GB.png";
import LV_PNG from "../static/body-map/LV.png";
import GV_PNG from "../static/body-map/GV.png";
import CV_PNG from "../static/body-map/CV.png";

// Direct mapping of layer IDs to PNG imports
const PNG_MAP: Record<string, ImageSourcePropType> = {
  LU: LU_PNG,
  LI: LI_PNG,
  ST: ST_PNG,
  ST2: ST2_PNG,
  SP: SP_PNG,
  HT: HT_PNG,
  SI: SI_PNG,
  BL: BL_PNG,
  KI: KI_PNG,
  P: P_PNG,
  TW: TW_PNG,
  GB: GB_PNG,
  LV: LV_PNG,
  GV: GV_PNG,
  CV: CV_PNG,
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTAINER_HEIGHT = 500;

export interface BodyMapMarker {
  id: string;
  pointId: string;
  label: string;
  coordinates: NormalizedCoordinate;
}

interface BodyMapInteractiveProps {
  layer: BodyAtlasLayer;
  plane: BodyAtlasPlane;
  markers?: BodyMapMarker[];
  selectedPointId?: string | null;
  onMarkerPress?: (marker: BodyMapMarker) => void;
}


// Base marker size at scale 1
const BASE_MARKER_SIZE = 20;
const MIN_MARKER_SIZE = 6;

// Calculate marker size based on zoom scale (smaller when zoomed in)
const getMarkerSize = (scale: number): number => {
  // Inverse relationship: as scale increases, marker size decreases
  const size = BASE_MARKER_SIZE / scale;
  return Math.max(size, MIN_MARKER_SIZE);
};

export function BodyMapInteractive({
  layer,
  plane,
  markers = [],
  selectedPointId,
  onMarkerPress,
}: BodyMapInteractiveProps) {
  const colors = useThemeColors();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  // Get PNG source directly from map
  const pngSource = PNG_MAP[layer.id] || null;
  
  // Calculate marker size based on current zoom
  const markerSize = getMarkerSize(currentScale);

  // Calculate scaled dimensions maintaining aspect ratio
  // Use SVG viewBox dimensions for aspect ratio (1440:810)
  const aspectRatio = SVG_WIDTH / SVG_HEIGHT;
  const containerWidth = SCREEN_WIDTH - 64; // Account for padding
  
  // Scale to fit container width, maintaining aspect ratio
  const scaledWidth = containerWidth;
  const scaledHeight = containerWidth / aspectRatio;

  // Calculate marker positions based on scaled dimensions
  const markersWithPosition = useMemo(() => {
    return markers
      .map((marker) => {
        const absolutePosition = getMarkerPosition(marker.coordinates);
        if (!absolutePosition) {
          return null;
        }

        // Scale from SVG viewBox coordinates to our scaled dimensions
        const left = (absolutePosition.x / SVG_WIDTH) * scaledWidth;
        const top = (absolutePosition.y / SVG_HEIGHT) * scaledHeight;

        return {
          ...marker,
          left,
          top,
        };
      })
      .filter(Boolean) as Array<BodyMapMarker & { left: number; top: number }>;
  }, [scaledWidth, scaledHeight, markers]);

  useEffect(() => {
    console.log(`[BodyMapInteractive] Layer: ${layer.id}, PNG: ${!!pngSource}`);
    console.log(`[BodyMapInteractive] Markers: ${markers.length} -> ${markersWithPosition.length} positioned`);
  }, [layer.id, pngSource, markers.length, markersWithPosition.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.layerTitle, { color: colors.text }]}>
            {layer.label}
          </Text>
          <Text style={[styles.layerSubtitle, { color: colors.textSecondary }]}>
            {plane === "front" ? "Plano frontal" : "Plano posterior"} • {markersWithPosition.length} pontos
          </Text>
        </View>
      </View>

      {/* Map Container - ZoomableView with native pinch-to-zoom */}
      <View style={[styles.mapContainer, { backgroundColor: colors.background, height: CONTAINER_HEIGHT }]}>
        <ZoomableView
          contentWidth={scaledWidth}
          contentHeight={scaledHeight}
          containerHeight={CONTAINER_HEIGHT}
          minScale={0.5}
          maxScale={4}
          onScaleChange={setCurrentScale}
        >
          {/* Content wrapper with exact SVG dimensions scaled */}
          <View style={{ width: scaledWidth, height: scaledHeight, position: 'relative' }}>
            {/* PNG Image - exact size to match coordinates */}
            {pngSource ? (
              <Image
                source={pngSource}
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                resizeMode="stretch"
                onLoad={() => {
                  console.log(`[BodyMapInteractive] ✅ PNG rendered: ${layer.id}`);
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.error(`[BodyMapInteractive] ❌ PNG error: ${layer.id}`, e.nativeEvent.error);
                }}
              />
            ) : (
              <View style={[styles.noImageContainer, { width: scaledWidth, height: scaledHeight }]}>
                <Text style={[styles.noImageText, { color: colors.textSecondary }]}>
                  Imagem não disponível{"\n"}{layer.label}
                </Text>
              </View>
            )}

            {/* Markers overlay - size adjusts based on zoom level */}
            {markersWithPosition.map((marker) => (
              <TouchableOpacity
                key={marker.id}
                style={[
                  styles.marker,
                  {
                    left: marker.left,
                    top: marker.top,
                    transform: [
                      { translateX: -markerSize / 2 },
                      { translateY: -markerSize / 2 },
                    ],
                  },
                ]}
                onPress={() => onMarkerPress?.(marker)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View
                  style={[
                    styles.markerDot,
                    {
                      width: markerSize,
                      height: markerSize,
                      borderRadius: markerSize / 2,
                      borderWidth: Math.max(1, 2 / currentScale),
                      backgroundColor:
                        marker.pointId === selectedPointId
                          ? colors.primary
                          : colors.accent,
                      borderColor: colors.surface,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ZoomableView>
      </View>

      {/* Empty state */}
      {!markers.length && (
        <Text style={[styles.emptyState, { color: colors.textSecondary }]}>
          Nenhum ponto localizado para esta camada.
        </Text>
      )}

      {/* Help text */}
      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        💡 Pinça para zoom, arraste para navegar
      </Text>
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
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
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
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200,200,200,0.2)",
  },
  noImageText: {
    fontSize: 14,
    textAlign: "center",
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    // transform is now set dynamically based on marker size
  },
  markerDot: {
    // width, height, borderRadius, borderWidth are now set dynamically
    borderColor: COLORS.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  emptyState: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  helpText: {
    marginTop: 12,
    fontSize: 12,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});

export default BodyMapInteractive;
