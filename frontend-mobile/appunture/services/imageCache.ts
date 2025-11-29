/**
 * Image Cache Service
 *
 * Provides offline caching for images using expo-file-system.
 * Caches images to local storage for offline access and faster loading.
 */

import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLogger } from "../utils/logger";

const imageCacheLogger = createLogger("ImageCache");

// Cache configuration
const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}image-cache/`;
const CACHE_INDEX_KEY = "@appunture/image-cache-index";
const MAX_CACHE_SIZE_MB = 100; // Maximum cache size in megabytes
const MAX_CACHE_AGE_DAYS = 30; // Maximum age of cached images in days

/**
 * Cache entry metadata
 */
interface CacheEntry {
  localUri: string;
  remoteUri: string;
  timestamp: number;
  size: number;
  etag?: string;
}

/**
 * Cache index storing all cache entries
 */
interface CacheIndex {
  entries: Record<string, CacheEntry>;
  totalSize: number;
  lastCleanup: number;
}

/**
 * Generate a unique cache key for a URL
 */
async function generateCacheKey(url: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    url
  );
  // Get file extension from URL if present
  const extension = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)?.[1] || "jpg";
  return `${hash}.${extension}`;
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, {
      intermediates: true,
    });
  }
}

/**
 * Load the cache index from AsyncStorage
 */
async function loadCacheIndex(): Promise<CacheIndex> {
  try {
    const indexJson = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (indexJson) {
      return JSON.parse(indexJson);
    }
  } catch (error) {
    imageCacheLogger.warn("Failed to load cache index:", error);
  }
  return {
    entries: {},
    totalSize: 0,
    lastCleanup: Date.now(),
  };
}

/**
 * Save the cache index to AsyncStorage
 */
async function saveCacheIndex(index: CacheIndex): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    imageCacheLogger.warn("Failed to save cache index:", error);
  }
}

/**
 * Remove expired and excess cache entries
 */
async function cleanupCache(index: CacheIndex): Promise<CacheIndex> {
  const now = Date.now();
  const maxAge = MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
  const maxSize = MAX_CACHE_SIZE_MB * 1024 * 1024;

  // Sort entries by timestamp (oldest first)
  const entries = Object.entries(index.entries).sort(
    ([, a], [, b]) => a.timestamp - b.timestamp
  );

  const toDelete: string[] = [];
  let newTotalSize = index.totalSize;

  for (const [key, entry] of entries) {
    // Check if entry is expired
    if (now - entry.timestamp > maxAge) {
      toDelete.push(key);
      newTotalSize -= entry.size;
      continue;
    }

    // Check if we need to free up space
    if (newTotalSize > maxSize) {
      toDelete.push(key);
      newTotalSize -= entry.size;
    }
  }

  // Delete files and remove from index
  for (const key of toDelete) {
    const entry = index.entries[key];
    try {
      await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
    } catch (error) {
      imageCacheLogger.warn(
        `Failed to delete cached file: ${entry.localUri}`,
        error
      );
    }
    delete index.entries[key];
  }

  index.totalSize = newTotalSize;
  index.lastCleanup = now;

  return index;
}

/**
 * Image Cache Service
 */
export const imageCacheService = {
  /**
   * Get a cached image, downloading if necessary
   *
   * @param remoteUri - The remote URL of the image
   * @returns The local URI of the cached image
   */
  async getCachedImage(remoteUri: string): Promise<string> {
    if (!remoteUri) {
      throw new Error("Remote URI is required");
    }

    // Skip caching for local files
    if (remoteUri.startsWith("file://")) {
      return remoteUri;
    }

    await ensureCacheDirectory();
    const cacheKey = await generateCacheKey(remoteUri);
    const localUri = `${CACHE_DIRECTORY}${cacheKey}`;

    // Check if already cached
    let index = await loadCacheIndex();
    const existingEntry = index.entries[cacheKey];

    if (existingEntry) {
      // Verify file still exists
      const fileInfo = await FileSystem.getInfoAsync(existingEntry.localUri);
      if (fileInfo.exists) {
        // Update timestamp to mark as recently used
        existingEntry.timestamp = Date.now();
        await saveCacheIndex(index);
        return existingEntry.localUri;
      }
      // File was deleted externally, remove from index
      delete index.entries[cacheKey];
      index.totalSize -= existingEntry.size;
    }

    // Download the image
    try {
      const downloadResult = await FileSystem.downloadAsync(
        remoteUri,
        localUri
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      const fileSize = (fileInfo as any).size || 0;

      // Add to cache index
      index.entries[cacheKey] = {
        localUri,
        remoteUri,
        timestamp: Date.now(),
        size: fileSize,
        etag: downloadResult.headers["etag"],
      };
      index.totalSize += fileSize;

      // Run cleanup if needed (once per hour)
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - index.lastCleanup > oneHour) {
        index = await cleanupCache(index);
      }

      await saveCacheIndex(index);
      return localUri;
    } catch (error) {
      imageCacheLogger.error("Failed to download and cache image:", error);
      // Return original URL as fallback
      return remoteUri;
    }
  },

  /**
   * Prefetch and cache multiple images
   *
   * @param uris - Array of image URLs to prefetch
   * @param onProgress - Optional callback for progress updates
   */
  async prefetchImages(
    uris: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<void> {
    const total = uris.length;
    let completed = 0;

    const promises = uris.map(async (uri) => {
      try {
        await this.getCachedImage(uri);
      } catch (error) {
        imageCacheLogger.warn(`Failed to prefetch image: ${uri}`, error);
      } finally {
        completed++;
        onProgress?.(completed, total);
      }
    });

    // Process in batches of 5 to avoid overwhelming the network
    const batchSize = 5;
    for (let i = 0; i < promises.length; i += batchSize) {
      await Promise.all(promises.slice(i, i + batchSize));
    }
  },

  /**
   * Check if an image is cached
   *
   * @param remoteUri - The remote URL of the image
   * @returns true if the image is cached and file exists
   */
  async isCached(remoteUri: string): Promise<boolean> {
    if (!remoteUri || remoteUri.startsWith("file://")) {
      return false;
    }

    try {
      const cacheKey = await generateCacheKey(remoteUri);
      const index = await loadCacheIndex();
      const entry = index.entries[cacheKey];

      if (!entry) {
        return false;
      }

      const fileInfo = await FileSystem.getInfoAsync(entry.localUri);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  },

  /**
   * Remove a specific image from cache
   *
   * @param remoteUri - The remote URL of the image to remove
   */
  async removeFromCache(remoteUri: string): Promise<void> {
    const cacheKey = await generateCacheKey(remoteUri);
    const index = await loadCacheIndex();
    const entry = index.entries[cacheKey];

    if (entry) {
      try {
        await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
      } catch (error) {
        imageCacheLogger.warn("Failed to delete cached file:", error);
      }
      index.totalSize -= entry.size;
      delete index.entries[cacheKey];
      await saveCacheIndex(index);
    }
  },

  /**
   * Clear all cached images
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIRECTORY, { idempotent: true });
      await AsyncStorage.removeItem(CACHE_INDEX_KEY);
    } catch (error) {
      imageCacheLogger.warn("Failed to clear image cache:", error);
    }
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalSize: number;
    totalSizeMB: string;
    entryCount: number;
    maxSizeMB: number;
  }> {
    const index = await loadCacheIndex();
    return {
      totalSize: index.totalSize,
      totalSizeMB: (index.totalSize / (1024 * 1024)).toFixed(2),
      entryCount: Object.keys(index.entries).length,
      maxSizeMB: MAX_CACHE_SIZE_MB,
    };
  },
};

export default imageCacheService;
