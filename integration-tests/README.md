# Integration Tests

This directory contains end-to-end integration tests for the Appunture API.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cd integration-tests
npm install
```

## Running Tests

### Health Check Only (No Auth Required)
```bash
npm run test:e2e:api:health
```

### Full E2E Tests (DEV Environment)
```bash
# Set your Firebase token first
export FIREBASE_ID_TOKEN="your_firebase_id_token_here"

# Run tests
npm run test:e2e:api:dev
```

### Full E2E Tests (HOMOLOG Environment)
```bash
npm run test:e2e:api:homolog
```

## Test Reports

Test results are exported to `./reports/` directory as JSON files.

## Environment Configuration

### DEV Environment
- **URL**: `http://localhost:8080`
- **Skip Upload**: `true` (to avoid storage costs)

### HOMOLOG Environment  
- **URL**: Cloud Run deployment URL
- **Skip Upload**: `false`

## Generating Firebase Token

To generate a Firebase ID token for testing:

```javascript
// Using Firebase Admin SDK
const admin = require('firebase-admin');
admin.initializeApp();

const customToken = await admin.auth().createCustomToken('test-user-uid');
// Then exchange for ID token using client SDK
```

Or use the Firebase Emulator for local development testing.
