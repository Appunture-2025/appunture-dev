// SVG Assets - Direct imports for embedded rendering
// This eliminates the need for dynamic loading and database storage

import { Asset } from "expo-asset";

// Import SVG modules directly (they are already bundled)
const LU_SVG = require("../static/body-map/LU.svg");
const LI_SVG = require("../static/body-map/LI.svg");
const ST_SVG = require("../static/body-map/ST.svg");
const ST2_SVG = require("../static/body-map/ST2.svg");
const SP_SVG = require("../static/body-map/SP.svg");
const HT_SVG = require("../static/body-map/HT.svg");
const SI_SVG = require("../static/body-map/SI.svg");
const BL_SVG = require("../static/body-map/BL.svg");
const KI_SVG = require("../static/body-map/KI.svg");
const P_SVG = require("../static/body-map/P.svg");
const TW_SVG = require("../static/body-map/TW.svg");
const GB_SVG = require("../static/body-map/GB.svg");
const LV_SVG = require("../static/body-map/LV.svg");
const GV_SVG = require("../static/body-map/GV.svg");
const CV_SVG = require("../static/body-map/CV.svg");

// Map of layer IDs to their SVG modules
const SVG_ASSETS = {
  LU: LU_SVG,
  LI: LI_SVG,
  ST: ST_SVG,
  ST2: ST2_SVG,
  SP: SP_SVG,
  HT: HT_SVG,
  SI: SI_SVG,
  BL: BL_SVG,
  KI: KI_SVG,
  P: P_SVG,
  TW: TW_SVG,
  GB: GB_SVG,
  LV: LV_SVG,
  GV: GV_SVG,
  CV: CV_SVG,
} as const;

// Cache for loaded SVG XML strings
const svgXmlCache = new Map<string, string>();

/**
 * Load SVG XML directly from bundled asset
 * This is much faster than database loading and more reliable
 */
export const getEmbeddedSvgXml = async (
  assetModule: any
): Promise<string | null> => {
  console.log(`[svgAssets] Loading embedded SVG`);

  if (svgXmlCache.has(assetModule)) {
    return svgXmlCache.get(assetModule)!;
  }

  const svgModule = SVG_ASSETS[assetModule as keyof typeof SVG_ASSETS];
  if (!svgModule) {
    console.error(`[svgAssets] ✗ No SVG asset found`);
    return null;
  }

  try {
    // Direct string (raw XML)
    if (typeof svgModule === "string") {
      svgXmlCache.set(assetModule, svgModule);
      return svgModule;
    }

    // Module with default export that is a string
    const maybeDefault = (svgModule as any)?.default;
    if (typeof maybeDefault === "string") {
      svgXmlCache.set(assetModule, maybeDefault);
      return maybeDefault;
    }

    // Try interpreting as numeric module id first
    const numericId = Number(svgModule as any);
    if (!Number.isNaN(numericId)) {
      const asset = Asset.fromModule(numericId as any);
      if (!asset.localUri && !asset.uri) {
        await asset.downloadAsync();
      }

      const uri = asset.localUri ?? asset.uri;
      if (!uri) {
        console.error(`[svgAssets] ✗ No URI available`);
        return null;
      }

      const { FileSystem } = require("expo-file-system");
      const xml =
        uri.startsWith("file://") || uri.startsWith("content://")
          ? await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.UTF8,
            })
          : await (await fetch(uri)).text();

      const finalXml = xml.includes("viewBox=")
        ? xml
        : xml.replace("<svg", '<svg viewBox="0 0 1440 809.999993"');
      svgXmlCache.set(assetModule, finalXml);
      return finalXml;
    }

    // Fallback: try using Asset.fromModule with the module itself
    try {
      const asset = Asset.fromModule(svgModule as any);
      if (!asset.localUri && !asset.uri) {
        await asset.downloadAsync();
      }

      const uri = asset.localUri ?? asset.uri;
      if (!uri) {
        console.error(`[svgAssets] ✗ No URI available`);
        return null;
      }

      const { FileSystem } = require("expo-file-system");
      const xml =
        uri.startsWith("file://") || uri.startsWith("content://")
          ? await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.UTF8,
            })
          : await (await fetch(uri)).text();

      const finalXml = xml.includes("viewBox=")
        ? xml
        : xml.replace("<svg", '<svg viewBox="0 0 1440 809.999993"');
      svgXmlCache.set(assetModule, finalXml);
      return finalXml;
    } catch (inner) {
      console.warn(
        `[svgAssets] SVG module cannot be read as asset; it may be a React component.`,
        inner
      );
      return null;
    }
  } catch (error) {
    console.error(`[svgAssets] ✗ Error loading SVG:`, error);
    return null;
  }

  // new: no xml available -> return null so caller can fallback to component
  return null;
};

/**
 * Return the raw imported module for a layer (may be a React component, numeric id or raw string).
 */
export const getEmbeddedSvgModule = (layerId: string): any | null => {
  return SVG_ASSETS[layerId as keyof typeof SVG_ASSETS] ?? null;
};

/**
 * Preload all SVG assets into memory for instant access
 */
export const preloadAllSvgAssets = async (): Promise<void> => {
  console.log("[svgAssets] Preloading all SVG assets...");

  const results = await Promise.all(
    Object.keys(SVG_ASSETS).map(async (layerId) => {
      try {
        const xml = await getEmbeddedSvgXml(layerId);
        return { layerId, success: xml !== null };
      } catch (error) {
        console.error(`[svgAssets] Failed to preload ${layerId}:`, error);
        return { layerId, success: false };
      }
    })
  );

  const successful = results.filter((r) => r.success).length;
  console.log(
    `[svgAssets] Preload complete: ${successful}/${results.length} successful`
  );

  if (successful < results.length) {
    console.warn(
      "[svgAssets] Some SVGs failed to preload, but app will still work"
    );
  }
};

/**
 * Get SVG XML synchronously if already cached
 */
export const getEmbeddedSvgXmlSync = (layerId: string): string | null => {
  return svgXmlCache.get(layerId) ?? null;
};

/**
 * Clear the SVG cache (useful for development/testing)
 */
export const clearSvgCache = (): void => {
  svgXmlCache.clear();
  console.log("[svgAssets] SVG cache cleared");
};

// NEW helper: return React component exported by the SVG module (if transformer produced a component)
export const getSvgComponentFromModule = (
  assetModule: any
): React.ComponentType<any> | null => {
  if (!assetModule) return null;
  // common transformer outputs:
  // - module is a React component (default export is function/class)
  // - module.default is the component
  const candidate = assetModule.default ?? assetModule;
  if (typeof candidate === "function" || typeof candidate === "object") {
    return candidate as React.ComponentType<any>;
  }
  return null;
};
