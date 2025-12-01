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
  // 12 Meridianos Primários
  makeLayer("LU", "Lung · Pulmão", "front", require("./LU.svg")),
  makeLayer("LI", "Large Intestine · Intestino Grosso", "front", require("./LI.svg")),
  makeLayer("ST", "Stomach · Estômago (1)", "front", require("./ST.svg")),
  makeLayer("ST2", "Stomach · Estômago (2)", "front", require("./ST2.svg")),
  makeLayer("SP", "Spleen · Baço", "front", require("./SP.svg")),
  makeLayer("HT", "Heart · Coração", "front", require("./HT.svg")),
  makeLayer("SI", "Small Intestine · Intestino Delgado", "back", require("./SI.svg")),
  makeLayer("BL", "Bladder · Bexiga", "back", require("./BL.svg")),
  makeLayer("KI", "Kidney · Rim", "front", require("./KI.svg")),
  makeLayer("P", "Pericardium · Pericárdio", "front", require("./P.svg")),
  makeLayer("TW", "Triple Warmer · Triplo Aquecedor", "back", require("./TW.svg")),
  makeLayer("GB", "Gallbladder · Vesícula Biliar", "back", require("./GB.svg")),
  makeLayer("LV", "Liver · Fígado", "front", require("./LV.svg")),
  // 2 Vasos Extraordinários
  makeLayer("GV", "Governing Vessel · Vaso Governador", "back", require("./GV.svg")),
  makeLayer("CV", "Conception Vessel · Vaso Concepção", "front", require("./CV.svg")),
];

export const BODY_ATLAS_LAYER_MAP = BODY_ATLAS_LAYERS.reduce<
  Record<string, BodyAtlasLayer>
>((acc, layer) => {
  acc[layer.id] = layer;
  return acc;
}, {});

export const DEFAULT_BODY_ATLAS_LAYER_ID =
  BODY_ATLAS_LAYERS[0]?.id ?? "front-01";
