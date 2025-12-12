const fs = require("fs");
const path = require("path");

const frontendSeedPath = path.resolve(
  __dirname,
  "..",
  "frontend-mobile",
  "appunture",
  "assets",
  "data",
  "seed-data.json"
);
const backendSeedPath = path.resolve(
  __dirname,
  "..",
  "backend-java",
  "src",
  "main",
  "resources",
  "seed",
  "points_seed.ndjson"
);

function safeParseJson(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("[sync-body-map-coords] Failed to parse value", value);
    return null;
  }
}

function extractPoints(payload) {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.points)) {
    return payload.points;
  }

  if (payload.data) {
    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.data.points)) {
      return payload.data.points;
    }
  }

  return null;
}

function loadFrontendSeed() {
  const raw = fs.readFileSync(frontendSeedPath, "utf8");
  const parsed = JSON.parse(raw);
  const points = extractPoints(parsed);

  if (!Array.isArray(points)) {
    throw new Error(
      "[sync-body-map-coords] Could not locate 'points' array in frontend seed file."
    );
  }

  return points;
}

function mapBodyCoords(rawCoords) {
  const parsed = safeParseJson(rawCoords);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((coord) => {
      if (!coord) {
        return null;
      }

      const layerId = coord.layerId || coord.view;
      const x = typeof coord.x === "number" ? coord.x : Number(coord.x);
      const y = typeof coord.y === "number" ? coord.y : Number(coord.y);

      if (!layerId || Number.isNaN(x) || Number.isNaN(y)) {
        return null;
      }

      const mapped = {
        layerId,
        x,
        y,
      };

      if (coord.mappedAt) {
        mapped.mappedAt = coord.mappedAt;
      }

      if (coord.view && coord.view !== layerId) {
        mapped.view = coord.view;
      }

      if (coord.plane) {
        mapped.plane = coord.plane;
      }

      return mapped;
    })
    .filter(Boolean);
}

function buildCoordinateMap(points) {
  const map = new Map();

  points.forEach((point) => {
    if (!point || !point.id) {
      return;
    }

    const coordinates = safeParseJson(point.coordinates);
    const bodyMapCoords = mapBodyCoords(point.body_map_coords);

    map.set(point.id, {
      coordinates,
      bodyMapCoords,
    });
  });

  return map;
}

function mergeCoords(backendLine, coordsMap) {
  const trimmed = backendLine.trim();
  if (!trimmed) {
    return backendLine;
  }

  const payload = JSON.parse(trimmed);
  const update = coordsMap.get(payload.id);

  if (!update) {
    return JSON.stringify(payload);
  }

  if (update.coordinates && typeof update.coordinates === "object") {
    payload.coordinates = update.coordinates;
  }

  if (Array.isArray(update.bodyMapCoords) && update.bodyMapCoords.length) {
    payload.bodyMapCoords = update.bodyMapCoords;
  }

  return JSON.stringify(payload);
}

function main() {
  const frontendPoints = loadFrontendSeed();
  const coordsMap = buildCoordinateMap(frontendPoints);

  const backendRaw = fs.readFileSync(backendSeedPath, "utf8");
  const updatedLines = backendRaw
    .split(/\r?\n/)
    .map((line) => mergeCoords(line, coordsMap));

  fs.writeFileSync(backendSeedPath, `${updatedLines.join("\n").trim()}\n`);

  console.info(
    `[sync-body-map-coords] Updated coordinates for ${coordsMap.size} points.`
  );
}

main();
