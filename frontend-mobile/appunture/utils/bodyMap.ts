import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import type { ImageSourcePropType } from "react-native";
import { getFirebaseConfig } from "../config/firebaseConfig";
import {
  BODY_ATLAS_LAYER_MAP,
  BODY_ATLAS_LAYERS,
  DEFAULT_BODY_ATLAS_LAYER_ID,
  type BodyAtlasLayer,
  type BodyAtlasPlane,
} from "../static/body-map/manifest";

export const BODY_MAP_VIEWBOX = {
  width: 1440,
  height: 809.999993,
};

const svgAssetCache = new Map<number, string>();
const svgXmlCache = new Map<number, string>();
const layerSvgMemoryCache = new Map<string, string>();
const layerDownloadPromises = new Map<string, Promise<string | null>>();
const CACHE_ROOT =
  FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? null;
const BODY_MAP_CACHE_DIR = CACHE_ROOT ? `${CACHE_ROOT}body-map/` : null;
let cacheDirEnsured = false;
let resolvedStorageBucket: string | null | undefined;

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

const getStorageBucket = (): string | null => {
  if (resolvedStorageBucket !== undefined) {
    return resolvedStorageBucket;
  }
  try {
    const config = getFirebaseConfig();
    resolvedStorageBucket = config.storageBucket || null;
  } catch (error) {
    console.warn(
      "[bodyMap] Unable to resolve Firebase storage bucket. Remote SVG delivery disabled.",
      error
    );
    resolvedStorageBucket = null;
  }
  return resolvedStorageBucket ?? null;
};

const ensureCacheDir = async (): Promise<boolean> => {
  if (!BODY_MAP_CACHE_DIR) {
    return false;
  }
  if (cacheDirEnsured) {
    return true;
  }
  try {
    const info = await FileSystem.getInfoAsync(BODY_MAP_CACHE_DIR);
    if (!info?.exists) {
      await FileSystem.makeDirectoryAsync(BODY_MAP_CACHE_DIR, {
        intermediates: true,
      });
    }
    cacheDirEnsured = true;
    return true;
  } catch (error) {
    console.warn("[bodyMap] Failed to prepare cache directory", error);
    return false;
  }
};

const getLayerCacheFileName = (layer: BodyAtlasLayer): string => {
  const version = layer.version || "v1";
  return `${layer.id.toLowerCase()}-${version}.svg`;
};

const getLayerCachePath = (layer: BodyAtlasLayer): string | null => {
  if (!BODY_MAP_CACHE_DIR) {
    return null;
  }
  return `${BODY_MAP_CACHE_DIR}${getLayerCacheFileName(layer)}`;
};

const purgeStaleLayerFiles = async (
  layer: BodyAtlasLayer,
  keepFile: string
): Promise<void> => {
  if (!BODY_MAP_CACHE_DIR) {
    return;
  }
  try {
    const entries = await FileSystem.readDirectoryAsync(BODY_MAP_CACHE_DIR);
    const prefix = `${layer.id.toLowerCase()}-`;
    await Promise.all(
      entries
        .filter((name) => name.startsWith(prefix) && name !== keepFile)
        .map((name) =>
          FileSystem.deleteAsync(`${BODY_MAP_CACHE_DIR}${name}`, {
            idempotent: true,
          })
        )
    );
  } catch (error) {
    // Directory may not exist yet or deletion can fail silently; log for debugging only
    console.warn(
      `[bodyMap] Unable to purge cache for layer ${layer.id}:`,
      error
    );
  }
};

const readLayerCacheXml = async (
  layer: BodyAtlasLayer
): Promise<string | null> => {
  const cachePath = getLayerCachePath(layer);
  if (!cachePath) {
    return null;
  }
  try {
    const info = await FileSystem.getInfoAsync(cachePath);
    if (!info?.exists) {
      return null;
    }
    return FileSystem.readAsStringAsync(cachePath, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    console.warn(`[bodyMap] Failed to read cached SVG for ${layer.id}:`, error);
    return null;
  }
};

const writeLayerCacheXml = async (
  layer: BodyAtlasLayer,
  xml: string
): Promise<void> => {
  const cachePath = getLayerCachePath(layer);
  if (!cachePath) {
    return;
  }
  const ready = await ensureCacheDir();
  if (!ready) {
    return;
  }
  try {
    const fileName = getLayerCacheFileName(layer);
    await purgeStaleLayerFiles(layer, fileName);
    await FileSystem.writeAsStringAsync(cachePath, xml, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    console.warn(`[bodyMap] Failed to cache SVG for layer ${layer.id}:`, error);
  }
};

const buildRemoteSvgUrl = (layer: BodyAtlasLayer): string | null => {
  if (!layer.remoteObject) {
    return null;
  }
  const bucket = getStorageBucket();
  if (!bucket) {
    return null;
  }
  const objectPath = encodeURIComponent(layer.remoteObject);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${objectPath}?alt=media`;
};

const fetchRemoteSvgXml = async (
  layer: BodyAtlasLayer
): Promise<string | null> => {
  if (typeof fetch !== "function") {
    return null;
  }
  const remoteUrl = buildRemoteSvgUrl(layer);
  if (!remoteUrl) {
    return null;
  }

  if (layerDownloadPromises.has(layer.id)) {
    return layerDownloadPromises.get(layer.id)!;
  }

  const downloadPromise = (async () => {
    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        console.warn(
          `[bodyMap] Remote SVG request failed for ${layer.id}: ${response.status}`
        );
        return null;
      }
      const xml = await response.text();
      await writeLayerCacheXml(layer, xml);
      return xml;
    } catch (error) {
      console.warn(`[bodyMap] Error downloading SVG for ${layer.id}:`, error);
      return null;
    } finally {
      layerDownloadPromises.delete(layer.id);
    }
  })();

  layerDownloadPromises.set(layer.id, downloadPromise);
  return downloadPromise;
};

const loadSvgXmlFromCache = async (
  layer: BodyAtlasLayer
): Promise<string | null> => {
  const cached = await readLayerCacheXml(layer);
  if (cached) {
    return cached;
  }
  return fetchRemoteSvgXml(layer);
};

const rememberLayerXml = (layerId: string, xml: string): string => {
  layerSvgMemoryCache.set(layerId, xml);
  return xml;
};

export const getSvgAssetUri = async (
  source: ImageSourcePropType
): Promise<string | null> => {
  if (typeof source !== "number") {
    console.warn("[bodyMap] getSvgAssetUri: source is not a number", source);
    return null;
  }

  if (svgAssetCache.has(source)) {
    return svgAssetCache.get(source) ?? null;
  }

  try {
    const asset = Asset.fromModule(source);

    // Download the asset if not already available
    if (!asset.localUri && !asset.uri) {
      await asset.downloadAsync();
    }

    const uri = asset.localUri ?? asset.uri ?? null;

    if (uri) {
      svgAssetCache.set(source, uri);
    } else {
      console.warn("[bodyMap] getSvgAssetUri: No URI found for asset", source);
    }

    return uri;
  } catch (error) {
    console.error("[bodyMap] getSvgAssetUri error:", error);
    return null;
  }
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

const readSvgContent = async (uri: string): Promise<string> => {
  if (uri.startsWith("file://") || uri.startsWith("content://")) {
    return FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }

  const response = await fetch(uri);
  return response.text();
};

export const getSvgXml = async (
  source: ImageSourcePropType
): Promise<string | null> => {
  if (typeof source !== "number") {
    console.warn("[bodyMap] getSvgXml: source is not a number", source);
    return null;
  }

  if (svgXmlCache.has(source)) {
    return svgXmlCache.get(source) ?? null;
  }

  try {
    const asset = Asset.fromModule(source);
    if (!asset.localUri && !asset.uri) {
      await asset.downloadAsync();
    }

    const uri = asset.localUri ?? asset.uri;
    if (!uri) {
      console.warn("[bodyMap] getSvgXml: No URI found for asset", source);
      return null;
    }

    const xml = await readSvgContent(uri);
    svgXmlCache.set(source, xml);
    return xml;
  } catch (error) {
    console.error("[bodyMap] getSvgXml error:", error);
    return null;
  }
};

export const getSvgXmlSync = (source: ImageSourcePropType): string | null => {
  if (typeof source !== "number") {
    return null;
  }
  return svgXmlCache.get(source) ?? null;
};

export const getLayerSvgXmlSync = (layer: BodyAtlasLayer): string | null => {
  if (layerSvgMemoryCache.has(layer.id)) {
    return layerSvgMemoryCache.get(layer.id) ?? null;
  }
  const xml = getSvgXmlSync(layer.source);
  if (xml) {
    return rememberLayerXml(layer.id, xml);
  }
  return null;
};

export const getLayerSvgXml = async (
  layer: BodyAtlasLayer
): Promise<string | null> => {
  if (layerSvgMemoryCache.has(layer.id)) {
    return layerSvgMemoryCache.get(layer.id) ?? null;
  }

  const cachedXml = await loadSvgXmlFromCache(layer);
  if (cachedXml) {
    return rememberLayerXml(layer.id, cachedXml);
  }

  const assetXml = await getSvgXml(layer.source);
  if (assetXml) {
    return rememberLayerXml(layer.id, assetXml);
  }

  return null;
};

export const prefetchBodyMapLayers = async (): Promise<void> => {
  await Promise.all(
    BODY_ATLAS_LAYERS.map(async (layer) => {
      const xml = await loadSvgXmlFromCache(layer);
      if (xml) {
        rememberLayerXml(layer.id, xml);
      }
    })
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

  const x = Math.max(0, Math.min(1, coordinates.x));
  const y = Math.max(0, Math.min(1, coordinates.y));

  return {
    x: x * BODY_MAP_VIEWBOX.width,
    y: y * BODY_MAP_VIEWBOX.height,
  };
};
