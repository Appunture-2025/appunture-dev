import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import type {
  BodyAtlasLayer,
  BodyAtlasPlane,
} from "../static/body-map/manifest";
import type { NormalizedCoordinate } from "../utils/bodyMap";
import {
  BODY_MAP_VIEWBOX,
  getMarkerPosition,
} from "../utils/bodyMap";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";

// SVG original dimensions - PNG must match these for coordinate sync
const SVG_WIDTH = 1440;
const SVG_HEIGHT = 809.999993;

// Direct PNG imports - same approach as working PngTestComponent
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

// Container dimensions - we'll scale the SVG viewbox to fit
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

export function BodyMapInteractive({
  layer,
  plane,
  markers = [],
  selectedPointId,
  onMarkerPress,
}: BodyMapInteractiveProps) {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get PNG source directly from map
  const pngSource = PNG_MAP[layer.id] || null;

  // Calculate scaled dimensions maintaining aspect ratio
  // The PNG/SVG has aspect ratio of 1440:810 (roughly 16:9)
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

        // Scale from SVG coordinates to our scaled dimensions
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

  // Center content when image loads
  useEffect(() => {
    if (imageLoaded && scrollViewRef.current) {
      // Center the content initially
      const scrollX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const scrollY = Math.max(0, (scaledHeight - CONTAINER_HEIGHT) / 2);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollX,
          y: scrollY,
          animated: false,
        });
      }, 100);
    }
  }, [imageLoaded, scaledWidth, scaledHeight, containerWidth]);

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

      {/* Map Container - ScrollView with zoom support */}
      <View style={[styles.mapContainer, { backgroundColor: colors.background, height: CONTAINER_HEIGHT }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { width: scaledWidth, height: scaledHeight }
          ]}
          horizontal={true}
          maximumZoomScale={5}
          minimumZoomScale={0.5}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          bouncesZoom={true}
          bounces={true}
          scrollEnabled={true}
          pinchGestureEnabled={true}
          centerContent={true}
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
                  {`Imagem não disponível\n${layer.label}`}
                </Text>
              </View>
            )}

            {/* Markers overlay - positioned relative to scaled image */}
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
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View
                  style={[
                    styles.markerDot,
                    {
                      backgroundColor:
                        marker.pointId === selectedPointId
                          ? colors.primary
                          : colors.accent,
                      borderColor: colors.surface,
                    },
                  ]}
                />
                <View style={styles.markerLabelContainer}>
                  <Text style={styles.markerLabel}>{marker.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Dynamic size set inline
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
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  markerLabelContainer: {
    marginTop: 2,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  markerLabel: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
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
