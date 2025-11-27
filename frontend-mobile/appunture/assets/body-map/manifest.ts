import type { ImageSourcePropType } from "react-native";

export type BodyAtlasPlane = "front" | "back";

export interface BodyAtlasLayer {
  id: string;
  label: string;
  plane: BodyAtlasPlane;
  source: ImageSourcePropType;
  viewBox: string;
}

const VIEW_BOX = "0 0 1440 809.999993";

const makeLayer = (
  id: string,
  label: string,
  plane: BodyAtlasPlane,
  source: ImageSourcePropType
): BodyAtlasLayer => ({ id, label, plane, source, viewBox: VIEW_BOX });

export const BODY_ATLAS_LAYERS: BodyAtlasLayer[] = [
  makeLayer("front-01", "Frontal · Atlas 01", "front", require("./1.svg")),
  makeLayer("front-02", "Frontal · Atlas 02", "front", require("./2.svg")),
  makeLayer("front-03", "Frontal · Atlas 03", "front", require("./3.svg")),
  makeLayer("front-04", "Frontal · Atlas 04", "front", require("./4.svg")),
  makeLayer("front-05", "Frontal · Atlas 05", "front", require("./5.svg")),
  makeLayer("front-06", "Frontal · Atlas 06", "front", require("./6.svg")),
  makeLayer("front-07", "Frontal · Atlas 07", "front", require("./7.svg")),
  makeLayer("front-08", "Frontal · Atlas 08", "front", require("./8.svg")),
  makeLayer("back-01", "Posterior · Atlas 01", "back", require("./9.svg")),
  makeLayer("back-02", "Posterior · Atlas 02", "back", require("./10.svg")),
  makeLayer("back-03", "Posterior · Atlas 03", "back", require("./11.svg")),
  makeLayer("back-04", "Posterior · Atlas 04", "back", require("./12.svg")),
  makeLayer("back-05", "Posterior · Atlas 05", "back", require("./13.svg")),
  makeLayer("back-06", "Posterior · Atlas 06", "back", require("./14.svg")),
  makeLayer("back-07", "Posterior · Atlas 07", "back", require("./15.svg")),
];

export const BODY_ATLAS_LAYER_MAP = BODY_ATLAS_LAYERS.reduce<
  Record<string, BodyAtlasLayer>
>((acc, layer) => {
  acc[layer.id] = layer;
  return acc;
}, {});

export const DEFAULT_BODY_ATLAS_LAYER_ID =
  BODY_ATLAS_LAYERS[0]?.id ?? "front-01";
