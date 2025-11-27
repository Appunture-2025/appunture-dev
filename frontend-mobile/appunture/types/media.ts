import type { ImageSourcePropType } from "react-native";

export type GallerySourceType = "remote" | "local-image" | "local-svg";

export interface BaseGalleryImage {
  id: string;
  type: GallerySourceType;
  editable?: boolean;
  label?: string;
  remoteIndex?: number;
}

export interface RemoteGalleryImage extends BaseGalleryImage {
  type: "remote";
  uri: string;
}

export interface LocalGalleryImage extends BaseGalleryImage {
  type: "local-image" | "local-svg";
  asset: ImageSourcePropType;
}

export type GalleryImageSource = RemoteGalleryImage | LocalGalleryImage;
