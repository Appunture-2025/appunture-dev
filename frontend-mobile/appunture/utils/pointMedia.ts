import {
  BODY_ATLAS_LAYER_MAP,
  DEFAULT_BODY_ATLAS_LAYER_ID,
} from "../assets/body-map/manifest";
import type { Point } from "../types/api";
import type { GalleryImageSource } from "../types/media";

const normalizeAtlasId = (ref: string): string => {
  if (!ref) {
    return "";
  }
  if (ref.startsWith("atlas:")) {
    return ref.replace("atlas:", "");
  }
  return ref;
};

const buildAtlasImage = (ref: string): GalleryImageSource | null => {
  const atlasId = normalizeAtlasId(ref);
  const layer = BODY_ATLAS_LAYER_MAP[atlasId];
  if (!layer) {
    return null;
  }

  return {
    id: `atlas-${atlasId}`,
    type: "local-svg",
    asset: layer.source,
    editable: false,
    label: layer.label,
  };
};

const buildRemoteImage = (
  uri: string,
  index: number
): GalleryImageSource | null => {
  if (!uri) {
    return null;
  }
  return {
    id: `remote-${index}-${uri}`,
    type: "remote",
    uri,
    editable: true,
    remoteIndex: index,
  };
};

const FALLBACK_ATLAS_IMAGE = buildAtlasImage(DEFAULT_BODY_ATLAS_LAYER_ID);

export const buildPointGallerySources = (
  point: Point
): GalleryImageSource[] => {
  const images: GalleryImageSource[] = [];

  if (point.imageRefs?.length) {
    point.imageRefs.forEach((ref) => {
      const atlasImage = ref ? buildAtlasImage(ref) : null;
      if (atlasImage) {
        images.push(atlasImage);
      }
    });
  }

  const remoteCandidates =
    point.imageUrls ?? (point.image_url ? [point.image_url] : []);
  remoteCandidates.forEach((uri, index) => {
    const remote = buildRemoteImage(uri, index);
    if (remote) {
      images.push(remote);
    }
  });

  if (!images.length && FALLBACK_ATLAS_IMAGE) {
    images.push({
      ...FALLBACK_ATLAS_IMAGE,
      id: `${FALLBACK_ATLAS_IMAGE.id}-fallback`,
    });
  }

  return images;
};

export const getPrimaryGalleryImage = (
  point: Point
): GalleryImageSource | null => {
  const images = buildPointGallerySources(point);
  return images[0] ?? null;
};
