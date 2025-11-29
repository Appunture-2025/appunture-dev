/**
 * CachedImage Component
 *
 * A drop-in replacement for React Native Image that automatically
 * caches images locally for offline access and faster loading.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  ImageProps,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageStyle,
  ViewStyle,
} from "react-native";
import { imageCacheService } from "../services/imageCache";
import { COLORS } from "../utils/constants";

interface CachedImageProps extends Omit<ImageProps, "source"> {
  /**
   * The URL of the image to load and cache
   */
  uri: string;

  /**
   * Optional placeholder component to show while loading
   */
  placeholder?: React.ReactNode;

  /**
   * Optional fallback component to show on error
   */
  fallback?: React.ReactNode;

  /**
   * Whether to show a loading indicator while the image loads
   * @default true
   */
  showLoading?: boolean;

  /**
   * Custom loading indicator color
   */
  loadingColor?: string;

  /**
   * Container style for the wrapper view
   */
  containerStyle?: ViewStyle;
}

/**
 * CachedImage Component
 *
 * Automatically caches remote images for offline access.
 * Shows loading indicator while fetching and gracefully handles errors.
 *
 * @example
 * ```tsx
 * <CachedImage
 *   uri="https://example.com/image.jpg"
 *   style={{ width: 100, height: 100 }}
 * />
 * ```
 */
export function CachedImage({
  uri,
  placeholder,
  fallback,
  showLoading = true,
  loadingColor = COLORS.primary,
  containerStyle,
  style,
  onLoad,
  onError,
  ...props
}: CachedImageProps) {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load and cache the image
  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!uri) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);

        const localUri = await imageCacheService.getCachedImage(uri);

        if (isMounted) {
          setCachedUri(localUri);
        }
      } catch (error) {
        console.error("CachedImage: Failed to load image:", error);
        if (isMounted) {
          setHasError(true);
          // Still try to show the original URI
          setCachedUri(uri);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  // Handle image load complete
  const handleLoad = useCallback(
    (event: any) => {
      setIsLoading(false);
      onLoad?.(event);
    },
    [onLoad]
  );

  // Handle image load error
  const handleError = useCallback(
    (event: any) => {
      setHasError(true);
      setIsLoading(false);
      onError?.(event);
    },
    [onError]
  );

  // Extract width and height from style for container
  const styleObj = StyleSheet.flatten(style) as ImageStyle;
  const containerDimensions: ViewStyle = {
    width: styleObj?.width,
    height: styleObj?.height,
  };

  // Render error state
  if (hasError && fallback) {
    return (
      <View style={[styles.container, containerDimensions, containerStyle]}>
        {fallback}
      </View>
    );
  }

  // Render loading state
  if (isLoading && !cachedUri) {
    if (placeholder) {
      return (
        <View style={[styles.container, containerDimensions, containerStyle]}>
          {placeholder}
        </View>
      );
    }

    if (showLoading) {
      return (
        <View
          style={[
            styles.container,
            styles.loadingContainer,
            containerDimensions,
            containerStyle,
          ]}
        >
          <ActivityIndicator color={loadingColor} />
        </View>
      );
    }
  }

  // Render cached image
  return (
    <View style={[styles.container, containerDimensions, containerStyle]}>
      {cachedUri && (
        <Image
          {...props}
          source={{ uri: cachedUri }}
          style={[styles.image, style]}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {isLoading && showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={loadingColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});

export default CachedImage;
