import React, { ReactNode } from "react";
import { StyleSheet, Dimensions } from "react-native";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ZoomableViewProps {
  children: ReactNode | ((scale: number) => ReactNode);
  contentWidth: number;
  contentHeight: number;
  containerHeight: number;
  minScale?: number;
  maxScale?: number;
  onScaleChange?: (scale: number) => void;
}

/**
 * A simple zoomable container using native gestures.
 * Works on both iOS and Android.
 * Supports render prop pattern: children can be a function that receives current scale.
 */
export function ZoomableView({
  children,
  contentWidth,
  contentHeight,
  containerHeight,
  minScale = 0.5,
  maxScale = 4,
  onScaleChange,
}: ZoomableViewProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Notify parent of scale changes
  useDerivedValue(() => {
    if (onScaleChange) {
      runOnJS(onScaleChange)(scale.value);
    }
  }, [scale]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(newScale, minScale), maxScale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Reset to 1 if zoomed out too much
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow pan when zoomed in
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      // Limit pan to content bounds
      const maxX = (contentWidth * scale.value - SCREEN_WIDTH) / 2;
      const maxY = (contentHeight * scale.value - containerHeight) / 2;

      if (Math.abs(translateX.value) > maxX) {
        translateX.value = withSpring(translateX.value > 0 ? maxX : -maxX);
        savedTranslateX.value = translateX.value > 0 ? maxX : -maxX;
      }
      if (Math.abs(translateY.value) > maxY) {
        translateY.value = withSpring(translateY.value > 0 ? maxY : -maxY);
        savedTranslateY.value = translateY.value > 0 ? maxY : -maxY;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        // Reset zoom
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in to 2x
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView
      style={[styles.container, { height: containerHeight }]}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.content,
            { width: contentWidth, height: contentHeight },
            animatedStyle,
          ]}
        >
          {typeof children === "function" ? children(1) : children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ZoomableView;
