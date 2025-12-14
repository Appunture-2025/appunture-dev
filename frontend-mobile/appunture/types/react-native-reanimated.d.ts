declare module "react-native-reanimated/mock" {
  const ReanimatedMock: any;
  export = ReanimatedMock;
}

declare module "react-native-reanimated" {
  import * as React from "react";
  const Reanimated: any;
  export default Reanimated;
  export function useSharedValue<T = any>(value: T): { value: T };
  export function useAnimatedStyle(fn: () => any): any;
  export function withSpring(value: any, config?: any): any;
  export function withTiming(value: any, config?: any): any;
  export const Easing: any;
}
