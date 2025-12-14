# 📤 SVG Upload & Database Sync Guide

## Overview

You have 3 delivery/artifact layers for the atlas assets:

1. **Bundled (PNG + SVG)** - each atlas layer in `static/body-map/` is packaged
   as a PNG (visual) and an SVG (interaction) included in the app bundle;
2. **Firebase Remote (SVG)** - the SVG interaction files may be uploaded to
   Cloud Storage to serve as a remote source or CDN fallback (the upload script
   handles SVG files);
3. **FileSystem Cache** - local cache on device (offline fallback) used to speed
   up loading when needed.

This guide covers uploading to Firebase Storage and syncing database references.

---

## Step 1: Upload SVGs to Firebase Storage

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js with `firebase-admin` SDK
- Service account key at `serviceAccount.json` (already in repo)

### Method 1: Using Node.js Script (Recommended)

```bash
cd d:\_repos\appunture-dev\frontend-mobile\appunture

# Install dependencies (if needed)
npm install firebase-admin

# Run upload script
node ../../scripts/upload-body-map-svgs.js
```

**What it does:**

- Reads the atlas interaction SVG files from `static/body-map/` (the PNG visuals
  remain bundled);
- Uploads each SVG to Firebase Storage at
  `gs://appunture-tcc.appspot.com/body-map/{filename}.svg` (if configured);
- Sets cache headers to 1 year (immutable CDN);
- Sets MIME type to `image/svg+xml`.

**Expected output:**

```
📦 Found 15 SVG files. Starting upload...
✅ Uploaded: BL.svg
✅ Uploaded: CV.svg
...
✨ All SVGs uploaded to appunture-tcc/body-map/
```

### Method 2: Using Firebase CLI

```bash
cd d:\_repos\appunture-dev\frontend-mobile\appunture

# Authenticate (if needed)
firebase login

# Deploy storage rules (creates bucket structure)
firebase deploy --only storage:rules --project appunture-tcc

# Manual upload using gsutil
# First, set project
gcloud config set project appunture-tcc

# Upload all SVGs with cache headers
gsutil -h "Cache-Control:public, max-age=31536000" -h "Content-Type:image/svg+xml" -m cp static/body-map/*.svg gs://appunture-tcc.appspot.com/body-map/
```

### Verify Upload

```bash
# List uploaded files
gsutil ls gs://appunture-tcc.appspot.com/body-map/

# Check specific file
gsutil stat gs://appunture-tcc.appspot.com/body-map/LU.svg
```

**Expected result:**

```
gs://appunture-tcc.appspot.com/body-map/BL.svg
gs://appunture-tcc.appspot.com/body-map/CV.svg
gs://appunture-tcc.appspot.com/body-map/GB.svg
...
```

---

## Step 2: Enrich Points Database with Atlas References

Your `points_seed.ndjson` currently has empty `imageRefs: []`. We need to
populate them with atlas layer IDs so the app knows which SVG to load for each
point.

### Run Enrichment Script

```bash
cd d:\_repos\appunture-dev

# Install dependencies (if needed)
npm install

# Run enrichment script
node scripts/enrich-points-with-atlas-refs.js
```

**What it does:**

- Reads `data/processed/2025-11-28/points_seed.ndjson`
- Maps each point to its atlas layer by meridian code (LU → atlas:LU, etc.)
- Adds `atlas:{MERIDIAN}` to `imageRefs` array
- Writes enriched version to `points_seed.enriched.ndjson`

**Example transformation:**

```jsonl
# Before
{"code": "LU-1", "meridian": "LU", "imageRefs": [], ...}

# After
{"code": "LU-1", "meridian": "LU", "imageRefs": ["atlas:LU"], ...}
```

### Review & Apply

```bash
# View a sample of enriched data
head -5 data/processed/2025-11-28/points_seed.enriched.ndjson | jq '.imageRefs'

# If satisfied, replace original
cp data/processed/2025-11-28/points_seed.enriched.ndjson data/processed/2025-11-28/points_seed.ndjson

# Verify replacement
head -1 data/processed/2025-11-28/points_seed.ndjson | jq '.imageRefs'
# Should output: ["atlas:LU"]
```

---

## Step 3: Sync Database

The SQLite database will be repopulated via the backend seed endpoint or app
startup.

### Option A: Backend Seed Endpoint (Java)

```bash
# From backend-java directory
cd d:\_repos\appunture-dev\backend-java

# Build if needed
mvn clean package

# Start backend
mvn spring-boot:run

# In another terminal, trigger seed endpoint
curl -X POST http://localhost:8080/api/seed/points \
  -H "Content-Type: application/json" \
  -d @../data/processed/2025-11-28/points_seed.ndjson
```

### Option B: App Startup Seed

The React Native app will automatically re-seed on startup if it detects version
changes:

1. Update `BODY_ATLAS_ASSET_VERSION` in
   [static/body-map/manifest.ts](frontend-mobile/appunture/static/body-map/manifest.ts#L8)
   if you changed atlas SVG content
2. Increment the version number in the manifest
3. On next app start, the seed sync will:
   - Detect version mismatch
   - Download enriched seed data
   - Update SQLite with new imageRefs
   - Prefetch atlas SVGs to FileSystem cache

**Example manifest update:**

```typescript
// Before
export const BODY_ATLAS_ASSET_VERSION = "2025-12-11";

// After
export const BODY_ATLAS_ASSET_VERSION = "2025-12-12";
```

### Option C: Direct SQL Patch (Development Only)

If you need to quickly test locally:

```sql
-- In SQLite (via app or direct access)
UPDATE points
SET imageRefs = json_array('atlas:' || meridian)
WHERE imageRefs = '[]';
```

---

## Step 4: Verify Integration

### Check Local Bundled Assets

```bash
cd d:\_repos\appunture-dev\frontend-mobile\appunture

# List all bundled SVGs
ls -lh static/body-map/*.svg

# Should show 15 files, each 0.5–1.1 MB
```

### Test in App

1. **With Bundled Assets** (no network):

   - Navigate to a body area (e.g., "Lung")
   - SVG should load instantly from bundle
   - Points should be visible

2. **With Firebase Remote** (network required):

   - App will check Firebase Storage
   - URL pattern:
     `https://firebasestorage.googleapis.com/v0/b/appunture-tcc.appspot.com/o/body-map%2F{LAYER}.svg?alt=media`
   - Falls back to bundled if fetch fails

3. **With FileSystem Cache**:
   - First remote fetch caches to device
   - Offline mode uses cache automatically
   - Check cache invalidation with version bumps

### Verify Database References

```bash
# Query points with image refs (via app or API)
curl http://localhost:8080/api/points?fields=code,meridian,imageRefs \
  | head -5 | jq '.[] | {code, meridian, imageRefs}'

# Expected output
{
  "code": "LU-1",
  "meridian": "LU",
  "imageRefs": ["atlas:LU"]
}
```

---

## Troubleshooting

### SVG Upload Fails

**Error: "firebase-admin" not found**

```bash
npm install firebase-admin --save-dev
```

**Error: "Permission denied"**

- Check service account permissions in Firebase Console
- Ensure GOOGLE_APPLICATION_CREDENTIALS is set (script auto-detects from
  serviceAccount.json)

**Error: "Bucket not found"**

- Verify bucket name in script: `${projectId}.appspot.com`
- Create bucket: `gsutil mb gs://appunture-tcc.appspot.com`

### Enrichment Script Fails

**Error: "File not found"**

```bash
# Verify seed file exists
ls data/processed/2025-11-28/points_seed.ndjson
```

**Error: "Invalid JSON"**

- Ensure NDJSON format (one JSON object per line, no trailing commas)
- Use `npm install ndjson` and validate: `cat file.ndjson | ndjson-parse`

### App Not Loading SVGs

1. **Check manifest version**:

   - Open `frontend-mobile/appunture/static/body-map/manifest.ts`
   - Verify `BODY_ATLAS_ASSET_VERSION` matches backend

2. **Check cache**:

   - Delete app cache: `rm -rf AppData/Local/Expo/...`
   - Or from app settings: Settings → Storage → Clear Cache

3. **Check database**:

   - Verify `imageRefs` are populated: `SELECT imageRefs FROM points LIMIT 1;`
   - If empty, re-run enrichment script and reseed

4. **Check Firebase URL**:
   - Inspect network requests in DevTools
   - URL should be:
     `https://firebasestorage.googleapis.com/v0/b/appunture-tcc.appspot.com/o/body-map%2F{LAYER}.svg`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ BodyMap / ImageGallery Components                    │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│                  Needs SVG for layer "LU"                   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                  ┌─────────┴──────────┐
                  │                    │
        ┌─────────▼────────┐   ┌──────▼────────┐
        │ FileSystem Cache │   │ SQLite Points │
        │ (Offline Ready)  │   │ (imageRefs)   │
        └────────┬─────────┘   └──────┬────────┘
                 │                    │
         1. Check cache        2. Query "atlas:LU"
         2. If miss/stale     3. Load with getLayerSvgXml()
         3. Fetch remote      4. Render in carousel
         4. Cache result
                 │
                 └──────────┬────────────┐
                            │            │
                  ┌─────────▼──┐   ┌────▼─────────┐
                  │ Static /   │   │ Firebase     │
                  │ static/    │   │ Storage      │
                  │ body-map/  │   │ body-map/    │
                  │ (bundled)  │   │ (remote CDN) │
                  └────────────┘   └──────────────┘

Data Flow:
1. App starts → reads SQLite
2. Point "LU-1" has imageRefs: ["atlas:LU"]
3. ImageGallery calls findAtlasLayer("atlas:LU") → resolves to BODY_ATLAS_LAYERS[0]
4. getLayerSvgXml(layer) → tries:
   a. FileSystem cache (if exists & valid version)
   b. Firebase Storage (remote CDN with cache headers)
   c. Static bundled asset (fallback, always works)
5. Renders SVG in carousel with markers
```

---

## Timeline & Dependencies

```
Week 1 (Current):
├─ Step 1: Upload SVGs to Firebase ✓ (Bundled assets already work)
├─ Step 2: Enrich seed data with atlas refs ✓
└─ Step 3: Re-seed SQLite ✓

Week 2+:
├─ Deploy app with updated manifest version
├─ Verify cache prefetch on first load
├─ Monitor Firebase Storage costs
└─ Collect user metrics on load times
```

---

## Notes

- **Bundled Assets**: Always available, included in app binary (~15 MB impact)
- **Firebase Remote**: Fast CDN, requires internet, cached locally after first
  fetch
- **FileSystem Cache**: Persists between app restarts, version-based
  invalidation
- **Database**: Stores references only, not SVG content (reduces SQLite size)
- **Version Pinning**: Bump BODY_ATLAS_ASSET_VERSION to invalidate cache, force
  re-download

---

## Quick Start (TL;DR)

```bash
# 1. Upload SVGs
cd frontend-mobile/appunture
npm install firebase-admin
node ../../scripts/upload-body-map-svgs.js

# 2. Enrich database
cd ../..
node scripts/enrich-points-with-atlas-refs.js
cp data/processed/2025-11-28/points_seed.enriched.ndjson data/processed/2025-11-28/points_seed.ndjson

# 3. Verify
head -1 data/processed/2025-11-28/points_seed.ndjson | jq '.imageRefs'
# Output: ["atlas:LU"]

# 4. Re-seed (choose one)
# Option A: Via backend API
curl -X POST http://localhost:8080/api/seed/points \
  -H "Content-Type: application/json" \
  -d @data/processed/2025-11-28/points_seed.ndjson

# Option B: Via app restart (automatic)
# Just update BODY_ATLAS_ASSET_VERSION in manifest.ts and rebuild
```

Done! 🎉
