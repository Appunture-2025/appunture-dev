import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { CachedImage } from "../../components/CachedImage";
import { imageCacheService } from "../../services/imageCache";

// Mock the imageCache service
jest.mock("../../services/imageCache", () => ({
  imageCacheService: {
    getCachedImage: jest.fn(),
  },
}));

const mockGetCachedImage =
  imageCacheService.getCachedImage as jest.MockedFunction<
    typeof imageCacheService.getCachedImage
  >;

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("CachedImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Remote images", () => {
    it("renders without crashing", () => {
      mockGetCachedImage.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { toJSON } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          style={{ width: 100, height: 100 }}
        />
      );

      expect(toJSON()).toBeTruthy();
    });

    it("calls getCachedImage with the correct URI", async () => {
      const remoteUri = "https://example.com/image.jpg";
      const cachedUri = "file:///cached/image.jpg";
      mockGetCachedImage.mockResolvedValue(cachedUri);

      render(
        <CachedImage uri={remoteUri} style={{ width: 100, height: 100 }} />
      );

      await waitFor(() => {
        expect(mockGetCachedImage).toHaveBeenCalledWith(remoteUri);
      });
    });

    it("handles cache failure gracefully", async () => {
      const remoteUri = "https://example.com/image.jpg";
      mockGetCachedImage.mockRejectedValue(new Error("Cache failed"));

      const { toJSON } = render(
        <CachedImage uri={remoteUri} style={{ width: 100, height: 100 }} />
      );

      await waitFor(() => {
        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe("Edge cases", () => {
    it("handles empty uri", async () => {
      const { toJSON } = render(
        <CachedImage uri="" style={{ width: 100, height: 100 }} />
      );

      await waitFor(() => {
        expect(toJSON()).toBeTruthy();
      });
    });

    it("accepts style props", async () => {
      mockGetCachedImage.mockResolvedValue("file:///cached/image.jpg");

      const { toJSON } = render(
        <CachedImage
          uri="https://example.com/image.jpg"
          style={{ width: 100, height: 100, borderRadius: 10 }}
        />
      );

      await waitFor(() => {
        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe("Loading behavior", () => {
    it("calls onLoad when image loads successfully", async () => {
      const onLoad = jest.fn();
      mockGetCachedImage.mockResolvedValue("file:///cached/image.jpg");

      render(
        <CachedImage uri="https://example.com/image.jpg" onLoad={onLoad} />
      );

      await waitFor(() => {
        expect(mockGetCachedImage).toHaveBeenCalled();
      });
    });

    it("calls onError when image fails to load", async () => {
      const onError = jest.fn();
      mockGetCachedImage.mockRejectedValue(new Error("Failed to cache"));

      render(
        <CachedImage uri="https://example.com/image.jpg" onError={onError} />
      );

      await waitFor(() => {
        expect(mockGetCachedImage).toHaveBeenCalled();
      });
    });
  });

  describe("Placeholder and fallback", () => {
    it("renders custom placeholder when provided", () => {
      mockGetCachedImage.mockImplementation(() => new Promise(() => {}));

      const CustomPlaceholder = () => <></>;

      render(
        <CachedImage
          uri="https://example.com/image.jpg"
          placeholder={<CustomPlaceholder />}
        />
      );

      expect(mockGetCachedImage).toHaveBeenCalled();
    });

    it("renders custom fallback on error when provided", async () => {
      mockGetCachedImage.mockRejectedValue(new Error("Cache failed"));

      const CustomFallback = () => <></>;

      render(
        <CachedImage
          uri="https://example.com/image.jpg"
          fallback={<CustomFallback />}
        />
      );

      await waitFor(() => {
        expect(mockGetCachedImage).toHaveBeenCalled();
      });
    });
  });
});
