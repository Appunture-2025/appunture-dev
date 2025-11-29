import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { imageCacheService } from "../../services/imageCache";

// Mock dependencies
jest.mock("expo-file-system");
jest.mock("expo-crypto");
jest.mock("@react-native-async-storage/async-storage");

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockCrypto = Crypto as jest.Mocked<typeof Crypto>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("ImageCacheService", () => {
  // Use the same format as jest.setup.ts
  const mockCacheDir = "file:///mock/cache/";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks - ensure cacheDirectory matches global mock
    Object.defineProperty(mockFileSystem, "cacheDirectory", {
      value: mockCacheDir,
      writable: true,
    });
    mockCrypto.digestStringAsync.mockResolvedValue("mock-hash-123");
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe("getCachedImage", () => {
    it("should return cached image if exists", async () => {
      const remoteUri = "https://example.com/image.jpg";
      const cachedUri = `${mockCacheDir}image-cache/mock-hash-123.jpg`;

      // Cache index with existing entry
      const cacheIndex = {
        entries: {
          "mock-hash-123.jpg": {
            localUri: cachedUri,
            remoteUri,
            timestamp: Date.now(),
            size: 1024,
          },
        },
        totalSize: 1024,
        lastCleanup: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheIndex));
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1024,
        uri: cachedUri,
        modificationTime: Date.now(),
      } as any);

      const result = await imageCacheService.getCachedImage(remoteUri);

      expect(result).toBe(cachedUri);
    });

    it("should download and cache image if not cached", async () => {
      const remoteUri = "https://example.com/image.jpg";
      const cachedUri = `${mockCacheDir}image-cache/mock-hash-123.jpg`;

      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: false } as any) // Cache entry doesn't exist
        .mockResolvedValueOnce({ exists: true } as any) // Cache directory exists
        .mockResolvedValueOnce({ exists: true, size: 2048 } as any); // Downloaded file

      mockFileSystem.downloadAsync.mockResolvedValue({
        uri: cachedUri,
        status: 200,
        headers: { etag: "etag-123" },
      } as any);

      const result = await imageCacheService.getCachedImage(remoteUri);

      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      expect(result).toBe(cachedUri);
    });

    it("should return original URI on download failure", async () => {
      const remoteUri = "https://example.com/image.jpg";

      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
      mockFileSystem.downloadAsync.mockRejectedValue(
        new Error("Network error")
      );

      const result = await imageCacheService.getCachedImage(remoteUri);

      expect(result).toBe(remoteUri);
    });

    it("should throw error for empty URI", async () => {
      await expect(imageCacheService.getCachedImage("")).rejects.toThrow(
        "Remote URI is required"
      );
    });
  });

  describe("prefetchImages", () => {
    it("should prefetch multiple images", async () => {
      const uris = [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg",
      ];

      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.downloadAsync.mockResolvedValue({
        uri: "file://cached",
        status: 200,
        headers: {},
      } as any);

      const onProgress = jest.fn();

      await imageCacheService.prefetchImages(uris, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should continue prefetching on individual failures", async () => {
      const uris = [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ];

      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);
      mockFileSystem.downloadAsync
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({
          uri: "file://cached",
          status: 200,
          headers: {},
        } as any);

      const onProgress = jest.fn();

      // Should not throw
      await imageCacheService.prefetchImages(uris, onProgress);

      expect(onProgress).toHaveBeenCalledWith(2, 2);
    });
  });

  describe("isCached", () => {
    it("should return true for cached images", async () => {
      const remoteUri = "https://example.com/image.jpg";
      const cachedUri = `${mockCacheDir}image-cache/mock-hash-123.jpg`;

      const cacheIndex = {
        entries: {
          "mock-hash-123.jpg": {
            localUri: cachedUri,
            remoteUri,
            timestamp: Date.now(),
            size: 1024,
          },
        },
        totalSize: 1024,
        lastCleanup: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheIndex));
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
      } as any);

      const result = await imageCacheService.isCached(remoteUri);

      expect(result).toBe(true);
    });

    it("should return false for non-cached images", async () => {
      const remoteUri = "https://example.com/image.jpg";

      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await imageCacheService.isCached(remoteUri);

      expect(result).toBe(false);
    });
  });

  describe("removeFromCache", () => {
    it("should remove image from cache", async () => {
      const remoteUri = "https://example.com/image.jpg";
      const cachedUri = `${mockCacheDir}image-cache/mock-hash-123.jpg`;

      const cacheIndex = {
        entries: {
          "mock-hash-123.jpg": {
            localUri: cachedUri,
            remoteUri,
            timestamp: Date.now(),
            size: 1024,
          },
        },
        totalSize: 1024,
        lastCleanup: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheIndex));
      mockFileSystem.deleteAsync.mockResolvedValue();

      await imageCacheService.removeFromCache(remoteUri);

      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(cachedUri, {
        idempotent: true,
      });
    });

    it("should handle removal of non-cached image gracefully", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Should not throw
      await imageCacheService.removeFromCache(
        "https://example.com/not-cached.jpg"
      );
    });
  });

  describe("clearCache", () => {
    it("should clear entire cache", async () => {
      mockFileSystem.deleteAsync.mockResolvedValue();
      mockAsyncStorage.removeItem.mockResolvedValue();

      await imageCacheService.clearCache();

      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockFileSystem.deleteAsync.mockRejectedValue(new Error("Delete failed"));

      // Should not throw
      await imageCacheService.clearCache();
    });
  });

  describe("getCacheStats", () => {
    it("should return cache statistics", async () => {
      const cacheIndex = {
        entries: {
          "image1.jpg": { size: 1024 },
          "image2.jpg": { size: 2048 },
        },
        totalSize: 3072,
        lastCleanup: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheIndex));

      const stats = await imageCacheService.getCacheStats();

      expect(stats.entryCount).toBe(2);
      expect(stats.totalSize).toBe(3072);
      expect(stats.maxSizeMB).toBe(100);
    });

    it("should return zero stats for empty cache", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const stats = await imageCacheService.getCacheStats();

      expect(stats.entryCount).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });
});
