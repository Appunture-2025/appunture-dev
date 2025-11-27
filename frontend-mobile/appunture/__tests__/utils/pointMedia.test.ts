import {
  buildPointGallerySources,
  getPrimaryGalleryImage,
} from "../../utils/pointMedia";
import type { Point } from "../../types/api";

jest.mock("../../assets/body-map/manifest", () => {
  const makeLayer = (id: string) => ({
    id,
    label: `Layer ${id}`,
    plane: "front" as const,
    source: { uri: `${id}.svg` } as any,
    viewBox: "0 0 10 10",
  });

  const layers = [makeLayer("front-01"), makeLayer("front-02")];
  const map = layers.reduce<Record<string, any>>((acc, layer) => {
    acc[layer.id] = layer;
    return acc;
  }, {});

  return {
    BODY_ATLAS_LAYERS: layers,
    BODY_ATLAS_LAYER_MAP: map,
    DEFAULT_BODY_ATLAS_LAYER_ID: layers[0].id,
  };
});

const basePoint = (overrides: Partial<Point> = {}): Point => ({
  id: "point-1",
  code: "P1",
  name: "Test Point",
  meridian: "LU",
  location: "Forearm",
  isFavorite: false,
  ...overrides,
});

describe("pointMedia helpers", () => {
  it("builds gallery sources prioritizing atlas assets", () => {
    const point = basePoint({
      imageRefs: ["front-01", "atlas:front-02", "missing"],
      imageUrls: ["https://cdn.example/a.jpg", "https://cdn.example/b.jpg"],
    });

    const sources = buildPointGallerySources(point);

    expect(sources).toHaveLength(4);
    expect(sources[0].id).toBe("atlas-front-01");
    expect(sources[1].id).toBe("atlas-front-02");
    const remoteEntries = sources.filter((item) => item.type === "remote");
    expect(remoteEntries.map((entry) => entry.remoteIndex)).toEqual([0, 1]);
  });

  it("falls back to default atlas layer when no media provided", () => {
    const point = basePoint();
    const sources = buildPointGallerySources(point);

    expect(sources).toHaveLength(1);
    expect(sources[0].id).toContain("fallback");
    expect(sources[0].type).toBe("local-svg");
  });

  it("supports legacy image_url fields and exposes first item as primary", () => {
    const point = basePoint({
      imageRefs: ["front-02"],
      image_url: "https://cdn.example/legacy.jpg",
    });

    const sources = buildPointGallerySources(point);
    expect(sources.some((item) => item.remoteIndex === 0)).toBe(true);

    const primary = getPrimaryGalleryImage(point);
    expect(primary?.id).toBe("atlas-front-02");
  });
});
