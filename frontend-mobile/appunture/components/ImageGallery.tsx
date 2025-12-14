import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
import type { ImageSourcePropType } from "react-native";
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
import { SvgXml } from "react-native-svg";
import type { GalleryImageSource } from "../types/media";
import { findAtlasLayer, getLayerSvgXml } from "../utils/bodyMap";
import {
  getEmbeddedSvgXmlSync,
  getSvgComponentForLayer,
  getSvgRenderableForLayer,
} from "../utils/svgAssets";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";

export interface ImageGalleryProps {
  images: GalleryImageSource[];
  editable?: boolean;
  onAddImage?: () => void;
  onDeleteImage?: (remoteIndex: number) => void;
  onReorder?: (fromRemoteIndex: number, toRemoteIndex: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedContainer = Animated.createAnimatedComponent(View);

export function ImageGallery({
  images,
  editable = false,
  onAddImage,
  onDeleteImage,
  onReorder,
}: ImageGalleryProps) {
  const colors = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const scale = useSharedValue(1);
  const carouselRef = useRef<ICarouselInstance>(null);

  const resolvedImages = useMemo<GalleryImageSource[]>(() => images, [images]);

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
      item: GalleryImageSource,
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

      if (item.type === "local-svg") {
        return (
          <SvgAssetRenderer
            asset={item.asset}
            atlasLayerId={item.atlasLayerId}
            style={style}
            iconColor={colors.textSecondary}
          />
        );
      }

      return (
        <View style={[style, styles.svgWrapper]}>
          <Ionicons
            name="image-outline"
            size={48}
            color={colors.textSecondary}
          />
        </View>
      );
    },
    [colors]
  );

  if (!resolvedImages.length) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        accessibilityRole="none"
      >
        <Ionicons
          name="image-outline"
          size={64}
          color={colors.textSecondary}
          accessibilityElementsHidden
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Nenhuma imagem disponível
        </Text>
        {editable && (
          <TouchableOpacity
            testID="add-image-button"
            style={[styles.emptyAddButton, { borderColor: colors.primary }]}
            onPress={onAddImage}
            accessibilityRole="button"
            accessibilityLabel="Adicionar imagem"
            accessibilityHint="Toque para adicionar uma nova imagem à galeria"
          >
            <Ionicons
              name="add-circle"
              size={36}
              color={colors.primary}
              accessibilityElementsHidden
            />
            <Text
              style={[styles.emptyAddButtonText, { color: colors.primary }]}
            >
              Adicionar imagem
            </Text>
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
          item: GalleryImageSource;
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
              style={[
                styles.carouselImageWrapper,
                { backgroundColor: colors.surface },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Imagem ${index + 1} de ${
                resolvedImages.length
              }`}
              accessibilityHint="Toque para ver em tela cheia"
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
                    accessibilityRole="button"
                    accessibilityLabel="Excluir imagem"
                    accessibilityHint="Remove esta imagem da galeria"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color={colors.surface}
                      accessibilityElementsHidden
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
                      accessibilityRole="button"
                      accessibilityLabel="Mover para esquerda"
                      accessibilityHint="Move esta imagem para a posição anterior"
                      accessibilityState={{ disabled: disableMoveLeft }}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={20}
                        color={colors.surface}
                        accessibilityElementsHidden
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
                      accessibilityRole="button"
                      accessibilityLabel="Mover para direita"
                      accessibilityHint="Move esta imagem para a próxima posição"
                      accessibilityState={{ disabled: disableMoveRight }}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={colors.surface}
                        accessibilityElementsHidden
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View
        style={styles.paginationContainer}
        accessibilityLabel={`Imagem ${currentIndex + 1} de ${
          resolvedImages.length
        }`}
      >
        {resolvedImages.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.paginationDot,
              { backgroundColor: colors.border },
              index === currentIndex && {
                backgroundColor: colors.primary,
                width: 16,
              },
            ]}
            accessibilityElementsHidden
          />
        ))}
      </View>

      <FlatList
        horizontal
        data={thumbnails}
        keyExtractor={(item) => `${item.image.id}-${item.index}`}
        contentContainerStyle={styles.thumbnailList}
        accessibilityLabel="Miniaturas das imagens"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.thumbnailWrapper,
              item.index === currentIndex && { borderColor: colors.primary },
            ]}
            onPress={() => {
              carouselRef.current?.scrollTo({
                index: item.index,
                animated: true,
              });
              setCurrentIndex(item.index);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Ir para imagem ${item.index + 1}`}
            accessibilityState={{ selected: item.index === currentIndex }}
          >
            {renderGalleryContent(item.image, styles.thumbnailImage, "cover")}
          </TouchableOpacity>
        )}
      />

      {editable && (
        <TouchableOpacity
          testID="add-image-floating-button"
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddImage}
          accessibilityRole="button"
          accessibilityLabel="Adicionar imagem"
          accessibilityHint="Adiciona uma nova imagem à galeria"
        >
          <Ionicons
            name="add"
            size={24}
            color={colors.surface}
            accessibilityElementsHidden
          />
          <Text style={[styles.addButtonText, { color: colors.surface }]}>
            Adicionar imagem
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
        accessibilityViewIsModal
      >
        <GestureHandlerRootView style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFullscreen}
            accessibilityRole="button"
            accessibilityLabel="Fechar visualização em tela cheia"
          >
            <Ionicons
              name="close"
              size={36}
              color={colors.surface}
              accessibilityElementsHidden
            />
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

interface SvgAssetRendererProps {
  asset: ImageSourcePropType;
  atlasLayerId?: string;
  style: any;
  iconColor: string;
}

const SvgAssetRenderer = ({
  asset,
  atlasLayerId,
  style,
  iconColor,
}: SvgAssetRendererProps) => {
  const atlasLayer = useMemo(
    () => (atlasLayerId ? findAtlasLayer(atlasLayerId) : null),
    [atlasLayerId]
  );
  const [svgXmlContent, setSvgXmlContent] = useState<string | null>(() => {
    if (atlasLayer) {
      return getEmbeddedSvgXmlSync(atlasLayer.id);
    }
    return null;
  });
  const [SvgComponent, setSvgComponent] =
    useState<React.ComponentType<any> | null>(() => {
      if (atlasLayer) {
        return getSvgComponentForLayer(atlasLayer.id);
      }
      return null;
    });

  useEffect(() => {
    const syncXml = atlasLayer ? getEmbeddedSvgXmlSync(atlasLayer.id) : null;
    const syncComp = atlasLayer ? getSvgComponentForLayer(atlasLayer.id) : null;
    setSvgXmlContent((current) => {
      const nextValue = syncXml ?? null;
      return current === nextValue ? current : nextValue;
    });
    setSvgComponent((current) => (current === syncComp ? current : syncComp));
  }, [asset, atlasLayer]);

  useEffect(() => {
    let isMounted = true;

    if (!svgXmlContent && !SvgComponent) {
      const loadPromise = atlasLayer
        ? getSvgRenderableForLayer(atlasLayer.id)
        : Promise.resolve(null);

      loadPromise
        .then((renderable) => {
          if (!isMounted) return;
          if (!renderable) return;
          if (renderable.Component) {
            setSvgComponent(() => renderable.Component);
          } else if (renderable.xml) {
            setSvgXmlContent(renderable.xml);
          }
        })
        .catch((error) => {
          console.error("[ImageGallery] Error loading SVG asset:", error);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [asset, atlasLayer, svgXmlContent]);

  return (
    <View style={[style, styles.svgWrapper]}>
      {SvgComponent ? (
        <SvgComponent
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      ) : svgXmlContent ? (
        <SvgXml
          xml={svgXmlContent}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <Ionicons name="image-outline" size={48} color={iconColor} />
      )}
    </View>
  );
};

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
