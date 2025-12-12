#!/usr/bin/env node

/**
 * Upload body-map SVG assets to Firebase Cloud Storage
 * Usage: node scripts/upload-body-map-svgs.js
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, "../serviceAccount.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
if (!projectId) {
  console.error(
    "❌ FIREBASE_PROJECT_ID not set and not found in service account"
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${projectId}.appspot.com`,
});

const bucket = admin.storage().bucket();
const svgDir = path.resolve(
  __dirname,
  "../frontend-mobile/appunture/static/body-map"
);
const uploadPath = "body-map";

async function uploadSvgs() {
  try {
    const files = fs
      .readdirSync(svgDir)
      .filter((file) => file.endsWith(".svg"));

    if (!files.length) {
      console.error(`❌ No SVG files found in ${svgDir}`);
      process.exit(1);
    }

    console.log(`📦 Found ${files.length} SVG files. Starting upload...`);

    for (const file of files) {
      const filePath = path.join(svgDir, file);
      const destination = `${uploadPath}/${file}`;

      try {
        await bucket.upload(filePath, {
          destination,
          metadata: {
            cacheControl: "public, max-age=31536000",
            contentType: "image/svg+xml",
          },
        });
        console.log(`✅ Uploaded: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}: ${error.message}`);
      }
    }

    console.log(`\n✨ All SVGs uploaded to ${projectId}/${uploadPath}/`);
  } catch (error) {
    console.error(`❌ Error during upload:`, error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

uploadSvgs();
