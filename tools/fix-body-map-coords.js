const fs = require("fs");
const path = require("path");

const seedPath = path.resolve(__dirname, "..", "frontend-mobile", "appunture", "assets", "data", "seed-data.json");

// Mapeamento de variações de código de meridiano para camada SVG correta
const MERIDIAN_TO_LAYER = {
  "LU": "LU", "LI": "LI", "ST": "ST", "SP": "SP",
  "HT": "HT", "HE": "HT", // HE é Heart, deve ser HT
  "SI": "SI", "BL": "BL", "KI": "KI",
  "P": "P", "PC": "P", // PC é Pericardium, deve ser P
  "TW": "TW", "TE": "TW", "TA": "TW", // TE/TA são Triple, devem ser TW
  "GB": "GB", 
  "LV": "LV", "LR": "LV", // LR é Liver, deve ser LV
  "GV": "GV", "CV": "CV"
};

console.log("[fix-coords] Loading seed-data.json...");
const rawData = fs.readFileSync(seedPath, "utf8");
const data = JSON.parse(rawData);

let fixedCount = 0;
let totalCoords = 0;

data.points.forEach((point) => {
  if (!point.body_map_coords) return;
  
  const coords = JSON.parse(point.body_map_coords);
  const pointMeridian = point.code.split("-")[0]; // Ex: "LU-1" -> "LU"
  const correctLayer = MERIDIAN_TO_LAYER[pointMeridian] || pointMeridian;
  
  coords.forEach((coord) => {
    totalCoords++;
    if (coord.view !== correctLayer) {
      console.log(`[fix-coords] Fixing ${point.code}: ${coord.view} -> ${correctLayer}`);
      coord.view = correctLayer;
      fixedCount++;
    }
  });
  
  point.body_map_coords = JSON.stringify(coords);
});

console.log(`\n[fix-coords] Fixed ${fixedCount} out of ${totalCoords} coordinates`);
console.log("[fix-coords] Saving corrected data...");

fs.writeFileSync(seedPath, JSON.stringify(data, null, 2), "utf8");
console.log("[fix-coords] ✓ Done!");
