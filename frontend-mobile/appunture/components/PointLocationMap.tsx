import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";
import type { BodyAtlasLayer } from "../static/body-map/manifest";
import { BODY_ATLAS_LAYER_MAP } from "../static/body-map/manifest";
import {
  getMarkerPosition,
  type NormalizedCoordinate,
} from "../utils/bodyMap";

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

// SVG viewBox dimensions - coordinates are mapped to these values
const SVG_WIDTH = 1440;
const SVG_HEIGHT = 809.999993;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_MAP_HEIGHT = 350;

interface PointLocationMapProps {
  height?: number;
  coordinates: NormalizedCoordinate;
  layerId: string;
}


export function PointLocationMap({
  coordinates,
  layerId,
  height = DEFAULT_MAP_HEIGHT,
}: PointLocationMapProps) {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const layer: BodyAtlasLayer | null = useMemo(
    () => BODY_ATLAS_LAYER_MAP[layerId.toUpperCase()] ?? null,
    [layerId]
  );

  // Get PNG source directly from map
  const pngSource = layer ? PNG_MAP[layer.id] : null;

  // Calculate scaled dimensions maintaining aspect ratio
  const aspectRatio = SVG_WIDTH / SVG_HEIGHT;
  const containerWidth = SCREEN_WIDTH - 64;
  const scaledWidth = containerWidth;
  const scaledHeight = containerWidth / aspectRatio;

  // Calculate marker position
  const markerPosition = useMemo(() => {
    if (!coordinates) return null;

    const absolutePosition = getMarkerPosition(coordinates);
    if (!absolutePosition) return null;

    const left = (absolutePosition.x / SVG_WIDTH) * scaledWidth;
    const top = (absolutePosition.y / SVG_HEIGHT) * scaledHeight;

    return { left, top };
  }, [coordinates, scaledWidth, scaledHeight]);

  // Scroll to center on marker when image loads
  useEffect(() => {
    if (imageLoaded && markerPosition && scrollViewRef.current) {
      const scrollX = Math.max(0, markerPosition.left - containerWidth / 2);
      const scrollY = Math.max(0, markerPosition.top - height / 2);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollX,
          y: scrollY,
          animated: true,
        });
      }, 100);
    }
  }, [imageLoaded, markerPosition, containerWidth, height]);

  if (!layer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Mapa não disponível para este ponto
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Localização no Mapa
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {layer.label}
        </Text>
      </View>

      <View style={[styles.mapContainer, { backgroundColor: colors.background, height }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={{ width: scaledWidth, height: scaledHeight }}
          horizontal={true}
          maximumZoomScale={5}
          minimumZoomScale={0.8}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          bouncesZoom={true}
          bounces={true}
          scrollEnabled={true}
          pinchGestureEnabled={true}
          centerContent={false}
        >
          <View style={{ width: scaledWidth, height: scaledHeight, position: 'relative' }}>
            {/* PNG Image */}
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
                  console.log(`[PointLocationMap] ✅ PNG loaded: ${layer.id}`);
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.error(`[PointLocationMap] ❌ PNG error: ${layer.id}`, e.nativeEvent.error);
                }}
              />
            ) : (
              <View style={[styles.noImageContainer, { width: scaledWidth, height: scaledHeight }]}>
                <Text style={[styles.noImageText, { color: colors.textSecondary }]}>
                  Imagem não disponível
                </Text>
              </View>
            )}

            {/* Point Marker - only dot, no label */}
            {markerPosition && (
              <View
                style={[
                  styles.marker,
                  {
                    left: markerPosition.left,
                    top: markerPosition.top,
                  },
                ]}
              >
                <View style={[styles.markerDot, { backgroundColor: colors.error, borderColor: colors.surface }]} />
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        💡 Pinça para zoom, arraste para navegar
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200,200,200,0.2)",
  },
  noImageText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.error,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  helpText: {
    marginTop: 12,
    fontSize: 12,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});

export default PointLocationMap;
