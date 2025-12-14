declare module "react-native-svg" {
  import * as React from "react";
  // Minimal, permissive typings to satisfy editor/TS checks.
  export const SvgXml: React.ComponentType<any>;
  export const SvgCss: React.ComponentType<any>;
  export const Svg: React.ComponentType<any>;
  export const Circle: React.ComponentType<any>;
  export const Rect: React.ComponentType<any>;
  export const Path: React.ComponentType<any>;
  export const G: React.ComponentType<any>;
  export default Svg;
}
