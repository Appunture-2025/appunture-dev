import { Asset } from "expo-asset";
import type { ImageSourcePropType } from "react-native";
import {
  BODY_ATLAS_LAYER_MAP,
  BODY_ATLAS_LAYERS,
  DEFAULT_BODY_ATLAS_LAYER_ID,
  type BodyAtlasLayer,
  type BodyAtlasPlane,
} from "../assets/body-map/manifest";

export const BODY_MAP_VIEWBOX = {
  width: 1440,
  height: 809.999993,
};

const svgAssetCache = new Map<number, string>();

export const getAtlasLayerById = (layerId?: string): BodyAtlasLayer => {
  if (layerId && BODY_ATLAS_LAYER_MAP[layerId]) {
    return BODY_ATLAS_LAYER_MAP[layerId];
  }

  return (
    BODY_ATLAS_LAYER_MAP[DEFAULT_BODY_ATLAS_LAYER_ID] ?? BODY_ATLAS_LAYERS[0]
  );
};

export const getLayersByPlane = (plane?: BodyAtlasPlane): BodyAtlasLayer[] => {
  if (!plane) {
    return BODY_ATLAS_LAYERS;
  }

  return BODY_ATLAS_LAYERS.filter((layer) => layer.plane === plane);
};

export const getSvgAssetUri = async (
  source: ImageSourcePropType
): Promise<string | null> => {
  if (typeof source !== "number") {
    return null;
  }

  if (svgAssetCache.has(source)) {
    return svgAssetCache.get(source) ?? null;
  }

  const asset = Asset.fromModule(source);
  if (!asset.localUri && !asset.uri) {
    await asset.downloadAsync();
  }
  const uri = asset.localUri ?? asset.uri ?? null;
  if (uri) {
    svgAssetCache.set(source, uri);
  }
  return uri;
};

export const getSvgAssetUriSync = (
  source: ImageSourcePropType
): string | null => {
  if (typeof source !== "number") {
    return null;
  }
  if (svgAssetCache.has(source)) {
    return svgAssetCache.get(source) ?? null;
  }
  const asset = Asset.fromModule(source);
  const uri = asset.localUri ?? asset.uri ?? null;
  if (uri) {
    svgAssetCache.set(source, uri);
  }
  return uri;
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

  const x = Math.max(0, Math.min(1, coordinates.x));
  const y = Math.max(0, Math.min(1, coordinates.y));

  return {
    x: x * BODY_MAP_VIEWBOX.width,
    y: y * BODY_MAP_VIEWBOX.height,
  };
};
