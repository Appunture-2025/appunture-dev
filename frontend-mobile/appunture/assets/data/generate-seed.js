/**
 * Script para gerar seed data otimizado para o SQLite do app
 * Executar: node generate-seed.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(
  __dirname,
  "../../../../data/processed/2025-11-28"
);
const OUTPUT_DIR = __dirname;

// Ler arquivos de seed
const pointsRaw = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "points_seed.json"), "utf8")
);
const symptomsRaw = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "symptoms_seed.json"), "utf8")
);

// Mapear pontos para formato SQLite (campos mínimos)
const points = pointsRaw.map((p) => ({
  id: p.id,
  code: p.code || "",
  name: p.name || p.namePT || "",
  chinese_name: p.chineseName || "",
  meridian: p.meridian || "",
  location: p.location || p.locationWHO || "",
  functions: p.functions || "",
  indications: p.indication || p.indications || "",
  contraindications: p.contraindications || "",
  image_path: p.imageUrls?.[0] || null,
  image_refs: p.imageRefs ? JSON.stringify(p.imageRefs) : null,
  coordinates: p.coordinates ? JSON.stringify(p.coordinates) : null,
  body_map_coords: p.bodyMapCoords ? JSON.stringify(p.bodyMapCoords) : null,
  favorite_count: p.favoriteCount || 0,
}));

// Mapear sintomas para formato SQLite
const symptoms = symptomsRaw.map((s) => ({
  id: s.id,
  name: s.name || "",
  synonyms: s.tags ? JSON.stringify(s.tags) : null,
  category: s.category || "",
  use_count: s.useCount || 0,
}));

// Mapear relações sintoma-ponto
const symptomPoints = [];
symptomsRaw.forEach((s) => {
  if (s.pointIds && Array.isArray(s.pointIds)) {
    s.pointIds.forEach((pointId) => {
      symptomPoints.push({
        symptom_id: s.id,
        point_id: pointId,
        efficacy_score: 1.0,
      });
    });
  }
});

// Criar objeto de seed
const seedData = {
  version: 1,
  generatedAt: new Date().toISOString(),
  points,
  symptoms,
  symptomPoints,
};

// Salvar arquivo
const outputPath = path.join(OUTPUT_DIR, "seed-data.json");
fs.writeFileSync(outputPath, JSON.stringify(seedData));

console.log(`Seed data generated successfully!`);
console.log(`  Points: ${points.length}`);
console.log(`  Symptoms: ${symptoms.length}`);
console.log(`  Symptom-Point relations: ${symptomPoints.length}`);
console.log(`  Output: ${outputPath}`);
console.log(`  Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
