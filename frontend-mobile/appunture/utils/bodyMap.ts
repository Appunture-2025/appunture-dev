import {
  BODY_ATLAS_LAYER_MAP,
  BODY_ATLAS_LAYERS,
  DEFAULT_BODY_ATLAS_LAYER_ID,
  type BodyAtlasLayer,
  type BodyAtlasPlane,
} from "../static/body-map/manifest";
import {
  getEmbeddedSvgXml,
  preloadAllSvgAssets,
  preloadAllPngAssets,
  getEmbeddedSvgXmlSync,
  getSvgRenderableForLayer,
  getSvgComponentForLayer,
} from "./svgAssets";

export const BODY_MAP_VIEWBOX = {
  width: 1440,
  height: 809.999993,
};

const layerSvgMemoryCache = new Map<string, string>();

export const findAtlasLayer = (layerId?: string): BodyAtlasLayer | null => {
  if (layerId && BODY_ATLAS_LAYER_MAP[layerId]) {
    return BODY_ATLAS_LAYER_MAP[layerId];
  }
  return null;
};

export const getAtlasLayerById = (layerId?: string): BodyAtlasLayer => {
  return (
    findAtlasLayer(layerId) ??
    BODY_ATLAS_LAYER_MAP[DEFAULT_BODY_ATLAS_LAYER_ID] ??
    BODY_ATLAS_LAYERS[0]
  );
};

export const getLayersByPlane = (plane?: BodyAtlasPlane): BodyAtlasLayer[] => {
  if (!plane) {
    return BODY_ATLAS_LAYERS;
  }

  return BODY_ATLAS_LAYERS.filter((layer) => layer.plane === plane);
};

export const getLayerSvgXml = async (
  layer: BodyAtlasLayer
): Promise<string | null> => {
  console.log(`[bodyMap] getLayerSvgXml called for ${layer.id}`);

  // Check memory cache first
  if (layerSvgMemoryCache.has(layer.id)) {
    console.log(`[bodyMap] ✓ Found ${layer.id} in memory cache`);
    return layerSvgMemoryCache.get(layer.id) ?? null;
  }

  // Load directly from embedded SVG asset
  console.log(`[bodyMap] Loading ${layer.id} from embedded asset`);
  const renderable = await getSvgRenderableForLayer(layer.id);
  const xml = renderable?.xml ?? null;
  const comp = renderable?.Component ?? null;
  if (xml) {
    console.log(
      `[bodyMap] ✓ Successfully loaded ${layer.id}, size: ${xml.length} bytes`
    );
    layerSvgMemoryCache.set(layer.id, xml);
    return xml;
  }

  // If we have a transformer-produced component, consider this a success
  if (comp) {
    console.log(`[bodyMap] ✓ Transformer component available for ${layer.id}`);
    return null;
  }

  console.error(`[bodyMap] ✗ Failed to load SVG for ${layer.id}`);
  return null;
};

export const prefetchBodyMapLayers = async (): Promise<void> => {
  console.log(
    `[bodyMap] Starting prefetch of ${BODY_ATLAS_LAYERS.length} layers (embedded assets)`
  );

  // Preload PNG assets first for visual layer
  await preloadAllPngAssets();
  
  // Use the new embedded SVG loading
  await preloadAllSvgAssets();

  // Skip SVG prefetch to prevent crashes - only PNG is loaded
  const results = BODY_ATLAS_LAYERS.map((layer) => {
    console.log(`[bodyMap] ✓ Skipped SVG prefetch for ${layer.id} (crash prevention)`);
    return { id: layer.id, status: "skipped" };
  });

  console.log(
    `[bodyMap] Prefetch complete: ${results.length}/${BODY_ATLAS_LAYERS.length} layers processed (SVG disabled)`
  );
};

export interface NormalizedCoordinate {
  x: number;
  y: number;
}

export const getMarkerPosition = (
  coordinates?: NormalizedCoordinate | null
): NormalizedCoordinate | null => {
  if (!coordinates) {
    return null;
  }

  // Coordinates can be in percentage (0-100) or normalized (0-1)
  // If values are > 1, assume they are percentages
  let x = coordinates.x;
  let y = coordinates.y;
  
  // Convert percentage to normalized if needed
  if (x > 1 || y > 1) {
    x = x / 100;
    y = y / 100;
  }
  
  // Clamp to valid range
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));

  return {
    x: x * BODY_MAP_VIEWBOX.width,
    y: y * BODY_MAP_VIEWBOX.height,
  };
};
