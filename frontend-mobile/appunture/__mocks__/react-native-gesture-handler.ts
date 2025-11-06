import React from 'react';
import { View } from 'react-native';

export const GestureHandlerRootView = View;
export const GestureDetector = ({ children }: { children: React.ReactNode }) => children as any;

export const Gesture = {
  Pinch: () => ({
    onUpdate() {
      return this;
    },
    onEnd() {
      return this;
    },
  }),
};

export const State = {};

export default {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  State,
};
