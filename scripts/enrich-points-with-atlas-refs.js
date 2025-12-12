#!/usr/bin/env node

/**
 * Enrich points_seed.ndjson with atlas layer references
 * Maps each point to its corresponding body-map atlas layer by meridian ID
 *
 * Usage: node scripts/enrich-points-with-atlas-refs.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Define mapping of meridian codes to atlas layer IDs
// Note: ST-1 has two layers (ST and ST2), so it gets both references
const MERIDIAN_TO_ATLAS_LAYER = {
  LU: ["LU"], // Lung
  LI: ["LI"], // Large Intestine
  ST: ["ST", "ST2"], // Stomach (has 2 layers: st1 and st2)
  SP: ["SP"], // Spleen
  HT: ["HT"], // Heart
  SI: ["SI"], // Small Intestine
  BL: ["BL"], // Bladder
  KI: ["KI"], // Kidney
  PC: ["PC"], // Pericardium
  TE: ["TW"], // Triple Energizer → maps to TW in atlas
  GB: ["GB"], // Gallbladder
  LV: ["LV"], // Liver
  GV: ["GV"], // Governing Vessel
  CV: ["CV"], // Conception Vessel
  LR: ["LV"], // Extra - maps to Liver
  P: ["P"], // Extra layer
};

const seedFile = path.resolve(
  __dirname,
  "../data/processed/2025-11-28/points_seed.ndjson"
);
const outputFile = path.resolve(
  __dirname,
  "../data/processed/2025-11-28/points_seed.enriched.ndjson"
);

let processedCount = 0;
let enrichedCount = 0;
let skippedCount = 0;

async function enrichPoints() {
  const rl = readline.createInterface({
    input: fs.createReadStream(seedFile),
    crlfDelay: Infinity,
  });

  const writeStream = fs.createWriteStream(outputFile, { encoding: "utf8" });

  return new Promise((resolve, reject) => {
    rl.on("line", (line) => {
      if (!line.trim()) {
        return; // Skip empty lines
      }

      try {
        const point = JSON.parse(line);
        processedCount++;

        // Get atlas layers from meridian code
        const atlasLayerIds = MERIDIAN_TO_ATLAS_LAYER[point.meridian];

        if (atlasLayerIds) {
          // Add atlas references to imageRefs
          if (!point.imageRefs) {
            point.imageRefs = [];
          }

          // Add all layers for this meridian (e.g., ST gets both ST and ST2)
          for (const layerId of atlasLayerIds) {
            const ref = `atlas:${layerId}`;
            if (!point.imageRefs.includes(ref)) {
              point.imageRefs.push(ref);
            }
          }

          enrichedCount++;

          // Update timestamp
          point.updatedAt = new Date().toISOString();
        } else {
          console.warn(
            `⚠️  No atlas layer found for meridian: ${point.meridian}`
          );
          skippedCount++;
        }

        // Write enriched point
        writeStream.write(JSON.stringify(point) + "\n");
      } catch (error) {
        console.error(
          `❌ Error parsing line ${processedCount}:`,
          error.message
        );
        reject(error);
      }
    });

    rl.on("close", () => {
      writeStream.end();
      resolve();
    });

    writeStream.on("error", reject);
  });
}

async function main() {
  console.log("📖 Reading points_seed.ndjson...");
  console.log(`   Source: ${seedFile}`);

  try {
    await enrichPoints();

    console.log("\n✨ Enrichment complete!");
    console.log(`   📊 Processed: ${processedCount}`);
    console.log(`   ✅ Enriched: ${enrichedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   💾 Output: ${outputFile}`);
    console.log("\n📝 Next steps:");
    console.log(`   1. Review the enriched file: ${outputFile}`);
    console.log("   2. If satisfied, replace original:");
    console.log(`      cp ${outputFile} ${seedFile}`);
    console.log("   3. Re-seed SQLite via app startup or backend API");
  } catch (error) {
    console.error("❌ Error during enrichment:", error.message);
    process.exit(1);
  }
}

main();
