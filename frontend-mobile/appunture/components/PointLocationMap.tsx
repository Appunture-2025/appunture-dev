import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";
import type { BodyAtlasLayer } from "../static/body-map/manifest";
import { BODY_ATLAS_LAYER_MAP } from "../static/body-map/manifest";
import {
  BODY_MAP_VIEWBOX,
  getMarkerPosition,
  type NormalizedCoordinate,
} from "../utils/bodyMap";
import {
  getSvgRenderableForLayer,
  getPngForLayer,
} from "../utils/svgAssets";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Default height for the map container (can be made configurable)
const DEFAULT_MAP_HEIGHT = 300;

/**
 * Helper component to render SVG transformer components
 */
const SvgComponent: React.FC<{
  Component: React.ComponentType<any>;
  style?: any;
}> = ({ Component, style }) => (
  <Component
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid meet"
    style={style}
  />
);

interface PointLocationMapProps {
  /** Height of the map container in pixels (optional, defaults to 300) */
  height?: number;
  /** Normalized coordinates (0-1) for the point */
  coordinates: NormalizedCoordinate;
  /** Layer ID (e.g., "LU", "ST", etc.) */
  layerId: string;
  /** Optional label for the point */
  label?: string;
}

/**
 * Compact map component that displays a single point on its corresponding body map layer.
 * Shows PNG background + SVG overlay + marker for the specific point.
 * Used in point details screens to show exact anatomical location.
 */
export function PointLocationMap({
  coordinates,
  layerId,
  label,
  height = DEFAULT_MAP_HEIGHT,
}: PointLocationMapProps) {
  const colors = useThemeColors();
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const [svgModule, setSvgModule] = useState<React.ComponentType<any> | null>(null);
  const [pngSource, setPngSource] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const layer: BodyAtlasLayer | null = useMemo(
    () => BODY_ATLAS_LAYER_MAP[layerId.toUpperCase()] ?? null,
    [layerId]
  );

  // Load layer assets
  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      if (!layer) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Load PNG (visual base)
        const png = getPngForLayer(layer.id);
        if (isMounted) {
          setPngSource(png ?? null);
        }

        // Load SVG (interaction/detail overlay)
        const renderable = await getSvgRenderableForLayer(layer.id);
        if (!isMounted) return;

        if (renderable.Component) {
          setSvgModule(renderable.Component ?? null);
          setSvgXml(null);
        } else if (renderable.xml) {
          let finalXml = renderable.xml;
          if (!finalXml.includes("viewBox=")) {
            finalXml = finalXml.replace(
              "<svg",
              `<svg viewBox="0 0 ${BODY_MAP_VIEWBOX.width} ${BODY_MAP_VIEWBOX.height}"`
            );
          }
          setSvgXml(finalXml);
          setSvgModule(null);
        }
      } catch (error) {
        console.error("[PointLocationMap] Error loading assets:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [layer]);

  // Calculate marker position
  const markerPosition = useMemo(() => {
    if (!coordinates) return null;

    const absolutePosition = getMarkerPosition(coordinates);
    if (!absolutePosition) return null;

    const containerWidth = SCREEN_WIDTH - 32;
    const containerHeight = height;

    const left =
      (absolutePosition.x / BODY_MAP_VIEWBOX.width) * containerWidth;
    const top =
      (absolutePosition.y / BODY_MAP_VIEWBOX.height) * containerHeight;

    return { left, top };
  }, [coordinates, height]);

  if (!layer) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Mapa não disponível para este ponto
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Localização no Mapa
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {layer.label}
        </Text>
      </View>

      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            height,
          },
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando mapa...
            </Text>
          </View>
        ) : (
          <>
            {/* PNG Visual Base */}
            {pngSource && (
              <Image
                source={pngSource}
                style={StyleSheet.absoluteFill}
                resizeMode="stretch"
              />
            )}

            {/* SVG Overlay for precision */}
            {svgXml && (
              <SvgXml
                xml={svgXml}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
              />
            )}
            {svgModule && (
              <SvgComponent
                Component={svgModule}
                style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
              />
            )}

            {/* Point Marker */}
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
                <View
                  style={[
                    styles.markerDot,
                    {
                      backgroundColor: colors.error,
                      borderColor: colors.surface,
                    },
                  ]}
                />
                {label && (
                  <View
                    style={[
                      styles.markerLabelContainer,
                      { backgroundColor: "rgba(0,0,0,0.8)" },
                    ]}
                  >
                    <Text style={styles.markerLabel}>{label}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </View>

      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        💡 O ponto destacado mostra a localização anatômica exata
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
    width: "100%",
    // Height is set dynamically via style prop
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
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
    zIndex: 10,
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
  markerLabelContainer: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  markerLabel: {
    fontSize: 12,
    color: COLORS.surface,
    fontWeight: "600",
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
