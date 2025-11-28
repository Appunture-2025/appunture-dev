# E2E Tests - Appunture Mobile

This directory contains end-to-end tests for the Appunture mobile application using Detox.

## Prerequisites

- Node.js 18+
- React Native development environment configured
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Android Emulator

## Setup

### Install Dependencies

```bash
cd frontend-mobile/appunture
npm install
```

### Build App for Testing

**Android:**
```bash
npm run build:e2e:android
```

**iOS:**
```bash
npm run build:e2e:ios
```

## Running Tests

### Android Emulator

```bash
# Start Android emulator first
# Then run tests:
npm run test:e2e:android
```

### iOS Simulator

```bash
npm run test:e2e:ios
```

### Debug Mode

```bash
# Android
npm run test:e2e:android:debug

# iOS
npm run test:e2e:ios:debug
```

## Test Files

| File | Description |
|------|-------------|
| `login.e2e.ts` | Login flow tests |
| `sync.e2e.ts` | Data synchronization tests |
| `upload.e2e.ts` | File upload tests |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `E2E_SKIP_UPLOAD` | Skip upload tests | `false` |

## Skipping Tests in CI

When running in CI environments without emulator support:

```bash
export E2E_SKIP=true
```

Or skip specific test types:

```bash
export E2E_SKIP_UPLOAD=true
```

## Troubleshooting

### Emulator Not Found

Make sure to create an AVD named `Pixel_6_API_34` for Android or use the default iPhone 15 simulator for iOS.

### Build Failures

1. Run `npx expo prebuild` to generate native projects
2. Check React Native environment setup
3. Verify Java/Xcode versions

### Test Timeouts

Tests have a default timeout of 120 seconds. Increase if needed:

```javascript
// In e2e/jest.config.js
testTimeout: 180000,
```

## Writing New Tests

1. Create a new file in `e2e/` with `.e2e.ts` extension
2. Import Detox utilities:
   ```typescript
   import { by, device, element, expect, waitFor } from 'detox';
   ```
3. Add `testID` props to components for easier targeting
4. Use `waitFor` for async operations

## CI Integration

See the pipeline configuration in `.github/workflows/` for CI setup examples.

For environments without emulator support, API-level tests can be run using Newman instead:

```bash
cd integration-tests
npm run test:e2e:api:health
```
