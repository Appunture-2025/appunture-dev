#!/usr/bin/env node

/**
 * Upload SVGs to Firebase Storage - Alternative approach
 * This script uploads files directly to Firebase Storage bucket
 *
 * Prerequisites:
 * 1. Firebase project must be created (appunture-tcc)
 * 2. Storage bucket must exist or be created via Firebase Console
 * 3. Service account must have Storage permissions
 *
 * Usage: node scripts/upload-svgs-simple.js
 */

const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

const projectId = "appunture-tcc";
// Firebase Storage uses firebasestorage.app format for newer projects
const bucketName = `${projectId}.firebasestorage.app`;
const serviceAccountPath = path.resolve(__dirname, "../serviceAccount.json");
const svgDir = path.resolve(
  __dirname,
  "../frontend-mobile/appunture/static/body-map"
);
const uploadPath = "body-map";

async function uploadSvgs() {
  try {
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`❌ Service account not found: ${serviceAccountPath}`);
      process.exit(1);
    }

    const storage = new Storage({
      projectId,
      keyFilename: serviceAccountPath,
    });

    const bucket = storage.bucket(bucketName);
    const svgFiles = fs.readdirSync(svgDir).filter((f) => f.endsWith(".svg"));

    if (!svgFiles.length) {
      console.error(`❌ No SVG files found in: ${svgDir}`);
      process.exit(1);
    }

    console.log(
      `🚀 Uploading ${svgFiles.length} SVG files to Firebase Storage`
    );
    console.log(`   Project: ${projectId}`);
    console.log(`   Bucket: ${bucketName}`);
    console.log(`   Path: ${uploadPath}/\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const file of svgFiles) {
      const filePath = path.join(svgDir, file);
      const destination = `${uploadPath}/${file}`;
      const stats = fs.statSync(filePath);

      try {
        const file_obj = bucket.file(destination);

        // Check if file already exists
        const [exists] = await file_obj.exists();

        // Upload with metadata
        await bucket.upload(filePath, {
          destination: destination,
          metadata: {
            cacheControl: "public, max-age=31536000", // 1 year
            contentType: "image/svg+xml",
          },
          skipIfExists: false, // Overwrite if exists
        });

        successCount++;
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`✅ ${file} (${sizeKB} KB)`);
      } catch (err) {
        failureCount++;
        console.error(`❌ ${file}: ${err.message}`);
      }
    }

    console.log(
      `\n📊 Results: ${successCount}/${svgFiles.length} uploaded successfully`
    );

    if (successCount > 0) {
      console.log(`\n✨ Upload successful!`);
      console.log(`\n🌐 Files accessible at:`);
      console.log(
        `   https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`
      );
      console.log(`\n📝 URL format for each file:`);
      console.log(
        `   https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${uploadPath}%2F{filename}.svg?alt=media`
      );
      console.log(`\n💾 Example for LU.svg:`);
      console.log(
        `   https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${uploadPath}%2FLU.svg?alt=media`
      );
    }

    if (failureCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Fatal error: ${err.message}`);
    process.exit(1);
  }
}

uploadSvgs();
