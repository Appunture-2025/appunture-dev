import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SvgXml } from "react-native-svg";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import type {
  BodyAtlasLayer,
  BodyAtlasPlane,
} from "../static/body-map/manifest";
import type { NormalizedCoordinate } from "../utils/bodyMap";
import {
  BODY_MAP_VIEWBOX,
  getLayerSvgXml,
  getMarkerPosition,
  prefetchBodyMapLayers,
} from "../utils/bodyMap";
import {
  getEmbeddedSvgXml,
  getSvgComponentFromModule,
} from "../utils/svgAssets";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const [svgModule, setSvgModule] = useState<any | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: SCREEN_WIDTH - 32,
    height: 400,
  });

  // Gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    console.log("[BodyMapInteractive] Prefetching atlas layers");
    prefetchBodyMapLayers().catch((error) => {
      console.warn(
        "[BodyMapInteractive] Failed to prefetch atlas layers",
        error
      );
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log(`[BodyMapInteractive] Loading layer: ${layer.id}`);
    setSvgXml(null);

    getLayerSvgXml(layer)
      .then((xml) => {
        if (!isMounted) return;
        if (xml) {
          // Ensure SVG has proper viewBox
          if (!xml.includes("viewBox=")) {
            xml = xml.replace(
              "<svg",
              `<svg viewBox="0 0 ${BODY_MAP_VIEWBOX.width} ${BODY_MAP_VIEWBOX.height}"`
            );
          }
          console.log(
            `[BodyMapInteractive] ✓ Loaded ${layer.id}, ${xml.length} bytes`
          );
          setSvgXml(xml);
          setSvgModule(null);
          return;
        }

        // No XML available: try to obtain the imported module to render as component
        const mod = getEmbeddedSvgXml(layer.id);
        if (mod && isMounted) {
          console.log(
            `[BodyMapInteractive] ✓ Found SVG module fallback for ${layer.id}`
          );
          setSvgModule(mod);
          setSvgXml(null);
          return;
        }

        console.warn(
          `[BodyMapInteractive] No SVG XML or module available for ${layer.id}`
        );
      })
      .catch((error) => {
        console.error("[BodyMapInteractive] Error loading SVG:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [layer.id, layer.source, layer.version]);

  // Reset zoom and pan when layer changes
  useEffect(() => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [layer.id]);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      // Limit zoom between 1x and 4x
      scale.value = Math.max(1, Math.min(4, newScale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const maxTranslateX = (containerSize.width * (scale.value - 1)) / 2;
      const maxTranslateY = (containerSize.height * (scale.value - 1)) / 2;

      const newTranslateX = savedTranslateX.value + event.translationX;
      const newTranslateY = savedTranslateY.value + event.translationY;

      // Limit pan to keep content visible
      translateX.value = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, newTranslateX)
      );
      translateY.value = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, newTranslateY)
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for the map
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Calculate marker positions
  const markersWithPosition = useMemo(() => {
    if (!containerSize.width || !containerSize.height) {
      return [] as Array<BodyMapMarker & { left: number; top: number }>;
    }

    return markers
      .map((marker) => {
        const absolutePosition = getMarkerPosition(marker.coordinates);
        if (!absolutePosition) {
          return null;
        }

        const left =
          (absolutePosition.x / BODY_MAP_VIEWBOX.width) * containerSize.width;
        const top =
          (absolutePosition.y / BODY_MAP_VIEWBOX.height) * containerSize.height;

        return {
          ...marker,
          left,
          top,
        };
      })
      .filter(Boolean) as Array<BodyMapMarker & { left: number; top: number }>;
  }, [containerSize, markers]);

  useEffect(() => {
    console.log(
      `[BodyMapInteractive] markers computed: total=${markers.length} positioned=${markersWithPosition.length}`
    );
  }, [markers.length, markersWithPosition.length]);

  // Reset zoom button
  const handleResetZoom = useCallback(() => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const LayerRenderer: React.FC<{
    layer: BodyAtlasLayer;
    xml?: string | null;
  }> = ({ layer, xml }) => {
    const SvgComp = getSvgComponentFromModule(layer.source);
    if (xml) {
      return (
        <SvgXml
          xml={xml}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      );
    }
    if (SvgComp) {
      // render transformer-produced component as fallback (works in Expo Go)
      // pass sizing props commonly supported by react-native-svg transformer
      return (
        <SvgComp
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      );
    }
    // final fallback: empty box / placeholder
    return <View style={{ flex: 1, backgroundColor: "transparent" }} />;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.layerTitle, { color: colors.text }]}>
            {layer.label}
          </Text>
          <Text style={[styles.layerSubtitle, { color: colors.textSecondary }]}>
            {plane === "front" ? "Plano frontal" : "Plano posterior"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
          onPress={handleResetZoom}
          accessibilityLabel="Resetar zoom"
          accessibilityRole="button"
        >
          <Text style={styles.resetButtonText}>⟲</Text>
        </TouchableOpacity>
      </View>

      <GestureHandlerRootView style={styles.gestureContainer}>
        <View
          style={[
            styles.mapWrapper,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.animatedContainer, animatedStyle]}>
              <LayerRenderer layer={layer} xml={svgXml} />
              {/* Markers */}
              {markersWithPosition.map((marker) => (
                <View
                  key={marker.id}
                  style={[
                    styles.marker,
                    {
                      left: marker.left,
                      top: marker.top,
                    },
                  ]}
                  pointerEvents="box-none"
                >
                  <TouchableOpacity
                    onPress={() => onMarkerPress?.(marker)}
                    accessibilityLabel={`Ponto ${marker.label}`}
                    accessibilityRole="button"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                    <Text
                      style={[
                        styles.markerLabel,
                        { backgroundColor: "rgba(0,0,0,0.7)" },
                      ]}
                    >
                      {marker.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>

      {!markers.length && svgXml && (
        <Text style={[styles.emptyState, { color: colors.textSecondary }]}>
          Nenhum ponto com coordenadas foi localizado para esta camada.
        </Text>
      )}

      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        💡 Dica: Use dois dedos para zoom e arraste para navegar
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
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 24,
    color: COLORS.surface,
    fontWeight: "bold",
  },
  gestureContainer: {
    flex: 1,
  },
  mapWrapper: {
    width: "100%",
    height: 500,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  animatedContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  markerLabel: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 11,
    color: COLORS.surface,
    fontWeight: "500",
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
