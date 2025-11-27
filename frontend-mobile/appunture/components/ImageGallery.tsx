import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SvgUri } from "react-native-svg";
import type { GalleryImageSource } from "../types/media";
import { getSvgAssetUriSync } from "../utils/bodyMap";
import { COLORS } from "../utils/constants";

export interface ImageGalleryProps {
  images: GalleryImageSource[];
  editable?: boolean;
  onAddImage?: () => void;
  onDeleteImage?: (remoteIndex: number) => void;
  onReorder?: (fromRemoteIndex: number, toRemoteIndex: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type RenderableGalleryImage = GalleryImageSource & {
  svgUri?: string | null;
};

const AnimatedContainer = Animated.createAnimatedComponent(View);

export function ImageGallery({
  images,
  editable = false,
  onAddImage,
  onDeleteImage,
  onReorder,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const scale = useSharedValue(1);
  const carouselRef = useRef<ICarouselInstance>(null);

  const resolvedImages = useMemo<RenderableGalleryImage[]>(
    () =>
      images.map((image) =>
        image.type === "local-svg"
          ? { ...image, svgUri: getSvgAssetUriSync(image.asset) }
          : image
      ),
    [images]
  );

  const remoteImageCount = useMemo(
    () =>
      resolvedImages.filter((item) => typeof item.remoteIndex === "number")
        .length,
    [resolvedImages]
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          "worklet";
          const nextScale = Math.max(1, Math.min(event.scale, 4));
          scale.value = nextScale;
        })
        .onEnd(() => {
          "worklet";
          scale.value = withSpring(1, { damping: 20, stiffness: 150 });
        }),
    [scale]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const thumbnails = useMemo(
    () =>
      resolvedImages.map((image, index) => ({
        image,
        index,
      })),
    [resolvedImages]
  );

  const openFullscreen = useCallback(() => {
    if (!resolvedImages.length) {
      return;
    }
    setFullscreenVisible(true);
  }, [resolvedImages.length]);

  const closeFullscreen = useCallback(() => {
    setFullscreenVisible(false);
    scale.value = 1;
  }, [scale]);

  const renderGalleryContent = useCallback(
    (
      item: RenderableGalleryImage,
      style: any,
      resizeMode: "cover" | "contain" = "cover"
    ) => {
      if (item.type === "remote") {
        return (
          <Image
            source={{ uri: item.uri }}
            style={style}
            resizeMode={resizeMode}
          />
        );
      }

      if (item.type === "local-image") {
        return (
          <Image source={item.asset} style={style} resizeMode={resizeMode} />
        );
      }

      return (
        <View style={[style, styles.svgWrapper]}>
          {item.svgUri ? (
            <SvgUri
              uri={item.svgUri}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <Ionicons
              name="image-outline"
              size={48}
              color={COLORS.textSecondary}
            />
          )}
        </View>
      );
    },
    []
  );

  if (!resolvedImages.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>Nenhuma imagem disponível</Text>
        {editable && (
          <TouchableOpacity
            testID="add-image-button"
            style={styles.emptyAddButton}
            onPress={onAddImage}
          >
            <Ionicons name="add-circle" size={36} color={COLORS.primary} />
            <Text style={styles.emptyAddButtonText}>Adicionar imagem</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        testID="image-gallery-carousel"
        width={SCREEN_WIDTH}
        height={280}
        data={resolvedImages}
        defaultIndex={0}
        loop={false}
        onSnapToItem={(index: number) => setCurrentIndex(index)}
        renderItem={({
          item,
          index,
        }: {
          item: RenderableGalleryImage;
          index: number;
        }) => {
          const remoteIndex =
            typeof item.remoteIndex === "number" ? item.remoteIndex : null;
          const canEditImage =
            editable && item.editable !== false && remoteIndex !== null;
          const disableMoveLeft = remoteIndex === null || remoteIndex <= 0;
          const disableMoveRight =
            remoteIndex === null ||
            remoteIndex >= remoteImageCount - 1 ||
            remoteImageCount <= 1;

          return (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              activeOpacity={0.9}
              onPress={openFullscreen}
              style={styles.carouselImageWrapper}
            >
              {renderGalleryContent(item, styles.carouselImage)}
              {canEditImage && (
                <View style={styles.editOverlay}>
                  <TouchableOpacity
                    testID={`delete-button-${index}`}
                    style={styles.overlayButton}
                    onPress={() =>
                      remoteIndex !== null
                        ? onDeleteImage?.(remoteIndex)
                        : undefined
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color={COLORS.surface}
                    />
                  </TouchableOpacity>
                  <View style={styles.reorderGroup}>
                    <TouchableOpacity
                      testID={`move-left-${index}`}
                      style={[
                        styles.overlayButton,
                        disableMoveLeft && styles.disabledOverlayButton,
                      ]}
                      onPress={() =>
                        remoteIndex !== null && !disableMoveLeft
                          ? onReorder?.(remoteIndex, remoteIndex - 1)
                          : undefined
                      }
                      disabled={disableMoveLeft}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={20}
                        color={COLORS.surface}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      testID={`move-right-${index}`}
                      style={[
                        styles.overlayButton,
                        disableMoveRight && styles.disabledOverlayButton,
                      ]}
                      onPress={() =>
                        remoteIndex !== null && !disableMoveRight
                          ? onReorder?.(remoteIndex, remoteIndex + 1)
                          : undefined
                      }
                      disabled={disableMoveRight}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={COLORS.surface}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.paginationContainer}>
        {resolvedImages.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <FlatList
        horizontal
        data={thumbnails}
        keyExtractor={(item) => `${item.image.id}-${item.index}`}
        contentContainerStyle={styles.thumbnailList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.thumbnailWrapper,
              item.index === currentIndex && styles.thumbnailWrapperActive,
            ]}
            onPress={() => {
              carouselRef.current?.scrollTo({
                index: item.index,
                animated: true,
              });
              setCurrentIndex(item.index);
            }}
          >
            {renderGalleryContent(item.image, styles.thumbnailImage, "cover")}
          </TouchableOpacity>
        )}
      />

      {editable && (
        <TouchableOpacity
          testID="add-image-floating-button"
          style={styles.addButton}
          onPress={onAddImage}
        >
          <Ionicons name="add" size={24} color={COLORS.surface} />
          <Text style={styles.addButtonText}>Adicionar imagem</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <GestureHandlerRootView style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFullscreen}
          >
            <Ionicons name="close" size={36} color={COLORS.surface} />
          </TouchableOpacity>

          {resolvedImages[currentIndex] && (
            <GestureDetector gesture={pinchGesture}>
              <AnimatedContainer
                style={[styles.fullscreenImage, animatedStyle]}
              >
                {renderGalleryContent(
                  resolvedImages[currentIndex],
                  styles.fullscreenImageContent,
                  "contain"
                )}
              </AnimatedContainer>
            </GestureDetector>
          )}
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 24,
  },
  carouselImageWrapper: {
    width: SCREEN_WIDTH,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  carouselImage: {
    width: "94%",
    height: "92%",
    borderRadius: 16,
  },
  svgWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  editOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "column",
    gap: 12,
  },
  reorderGroup: {
    flexDirection: "row",
    gap: 12,
    alignSelf: "flex-end",
  },
  overlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledOverlayButton: {
    opacity: 0.4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
  },
  thumbnailList: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 12,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailWrapperActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  addButtonText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullscreenImageContent: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 48,
    right: 24,
    zIndex: 2,
  },
  emptyContainer: {
    width: "100%",
    paddingVertical: 48,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyAddButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default ImageGallery;
