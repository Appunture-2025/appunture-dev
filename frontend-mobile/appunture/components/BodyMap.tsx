import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SvgXml } from "react-native-svg";
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
  getSvgRenderableForLayer,
  getSvgComponentForLayer,
  getPngForLayer,
} from "../utils/svgAssets";
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
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const [SvgComponent, setSvgComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [pngSource, setPngSource] = useState<any | null>(null);

  useEffect(() => {
    console.log("[BodyMap] Prefetching atlas layers");
    prefetchBodyMapLayers().catch((error) => {
      console.warn("[BodyMap] Failed to prefetch atlas layers", error);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log(`[BodyMap] useEffect triggered for layer: ${layer.id}`);
    setSvgXml(null);

    (async () => {
      try {
        const renderable = await getSvgRenderableForLayer(layer.id);
        if (!isMounted) return;

        if (renderable?.Component) {
          setSvgXml(null);
          setSvgComponent(renderable.Component ?? null);
          return;
        }

        // ensure png visual source is available
        try {
          const png = getPngForLayer(layer.id);
          setPngSource(png ?? null);
        } catch (e) {
          setPngSource(null);
        }

        let xml = renderable?.xml ?? null;
        if (xml) {
          const hasViewBox = xml.includes("viewBox=");
          if (!hasViewBox) {
            xml = xml.replace(
              "<svg",
              `<svg viewBox="0 0 ${BODY_MAP_VIEWBOX.width} ${BODY_MAP_VIEWBOX.height}"`
            );
          }
          if (!xml.includes('style="opacity')) {
            xml = xml.replace("<svg", `<svg style="opacity:0"`);
          }
        }
        if (isMounted) {
          if (xml) {
            setSvgXml(xml);
            setSvgComponent(null);
          } else {
            setSvgXml(null);
          }
        }
      } catch (err) {
        console.error("[BodyMap] Error loading SVG:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [layer.id, layer.source, layer.version]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMapSize({ width, height });
  }, []);

  const markersWithPosition = useMemo(() => {
    if (!mapSize.width || !mapSize.height)
      return [] as Array<BodyMapMarker & { left: number; top: number }>;

    return markers
      .map((marker) => {
        const absolutePosition = getMarkerPosition(marker.coordinates);
        if (!absolutePosition) return null;

        const left =
          (absolutePosition.x / BODY_MAP_VIEWBOX.width) * mapSize.width;
        const top =
          (absolutePosition.y / BODY_MAP_VIEWBOX.height) * mapSize.height;

        return { ...marker, left, top };
      })
      .filter(Boolean) as Array<BodyMapMarker & { left: number; top: number }>;
  }, [mapSize, markers]);

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
        {SvgComponent &&
        (typeof SvgComponent === "function" ||
          (SvgComponent &&
            typeof SvgComponent === "object" &&
            !React.isValidElement(SvgComponent))) ? (
          <SvgComponent
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        ) : svgXml ? (
          <SvgXml
            xml={svgXml}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={styles.svgLayer}
            onError={(error: any) => {
              console.error("[BodyMap] SvgXml render error:", error);
            }}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando mapa corporal...
            </Text>
            {/* Debug: Add a colored background to verify positioning */}
            <View style={styles.debugBackground} />
          </View>
        )}

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

      {!markers.length && (
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
  svgLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pngLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  debugBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 0, 0, 0.1)", // Light red background for debugging
    zIndex: -1,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 2,
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
