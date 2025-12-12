#!/usr/bin/env node

/**
 * Create Firebase Storage bucket and upload body-map SVG assets
 * Usage: node scripts/setup-firebase-storage.js
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, "../serviceAccount.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

const projectId = serviceAccount.project_id;
if (!projectId) {
  console.error("❌ Project ID not found in service account");
  process.exit(1);
}

// Firebase Storage uses firebasestorage.app format for newer projects
const bucketName = `${projectId}.firebasestorage.app`;

async function setupAndUpload() {
  try {
    // Initialize Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName,
    });

    // Initialize Cloud Storage client
    const storage = new Storage({
      projectId,
      keyFilename: serviceAccountPath,
    });

    console.log(`🔧 Setting up Firebase Storage for project: ${projectId}`);
    console.log(`📦 Target bucket: ${bucketName}\n`);

    // Check if bucket exists and create if needed
    const bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();

    if (!exists) {
      console.log(`📝 Creating bucket: ${bucketName}...`);
      try {
        await storage.createBucket(bucketName, {
          location: "us-central1",
        });
        console.log(`✅ Bucket created successfully\n`);
      } catch (error) {
        if (error.code === 409 || error.message?.includes("already exists")) {
          console.log(`✅ Bucket already exists\n`);
        } else if (error.message?.includes("verify site")) {
          console.log(
            `⚠️  Bucket may require verification. Proceeding with upload...\n`
          );
        } else {
          console.warn(`⚠️  Warning creating bucket:`, error.message);
          console.log(`   Proceeding with upload attempt...\n`);
        }
      }
    } else {
      console.log(`✅ Bucket already exists\n`);
    }

    // Now upload SVGs
    const svgDir = path.resolve(
      __dirname,
      "../frontend-mobile/appunture/static/body-map"
    );
    const uploadPath = "body-map";

    const files = fs
      .readdirSync(svgDir)
      .filter((file) => file.endsWith(".svg"));

    if (!files.length) {
      console.error(`❌ No SVG files found in ${svgDir}`);
      process.exit(1);
    }

    console.log(`📤 Found ${files.length} SVG files. Starting upload...\n`);

    const adminBucket = admin.storage().bucket();
    let uploadedCount = 0;

    for (const file of files) {
      const filePath = path.join(svgDir, file);
      const destination = `${uploadPath}/${file}`;
      const fileStats = fs.statSync(filePath);

      try {
        await adminBucket.upload(filePath, {
          destination,
          metadata: {
            cacheControl: "public, max-age=31536000",
            contentType: "image/svg+xml",
          },
        });
        uploadedCount++;
        console.log(
          `✅ Uploaded: ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`
        );
      } catch (error) {
        console.error(`❌ Failed to upload ${file}: ${error.message}`);
      }
    }

    console.log(`\n✨ Upload complete!`);
    console.log(`   📊 Uploaded: ${uploadedCount}/${files.length} files`);
    console.log(
      `   🌐 Base URL: https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${uploadPath}%2F`
    );
    console.log(`   📁 Files are accessible at: .../{filename}.svg?alt=media`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    if (admin.apps.length) {
      await admin.app().delete();
    }
  }
}

setupAndUpload();
