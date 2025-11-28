# Appunture Integration Guide

## Overview

This document describes the integration between the Appunture mobile application and the backend API. It covers authentication contracts, API endpoints, environment configuration, and testing procedures.

## Authentication Contracts

### Firebase Authentication Flow

The Appunture application uses Firebase Authentication for user management. The flow is:

1. **Client-side Authentication**: Mobile app authenticates directly with Firebase Auth SDK
2. **Token Generation**: Firebase provides an ID token after successful authentication
3. **Backend Sync**: App calls `/auth/sync` to create/update user profile in Firestore
4. **API Authorization**: All subsequent API calls include the Firebase ID token in the Authorization header

### Available Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/sync` | POST | Sync Firebase user to Firestore | Yes |
| `/auth/profile` | GET | Get user profile | Yes |
| `/auth/profile` | PUT | Update user profile | Yes |
| `/auth/me` | GET | Get current user info (Firebase + Firestore) | Yes |
| `/auth/favorites` | GET | Get user's favorite points | Yes |
| `/auth/favorites/{pointId}` | POST | Add point to favorites | Yes |
| `/auth/favorites/{pointId}` | DELETE | Remove point from favorites | Yes |
| `/auth/resend-verification` | POST | Resend email verification | Yes |

### ⚠️ Important: Deprecated Endpoints

The following endpoints do **NOT** exist in the backend and should **NOT** be called:
- `/auth/login` - Use Firebase Auth SDK client-side instead
- `/auth/register` - Use Firebase Auth SDK client-side instead

### Token Usage

```typescript
// Mobile app should get Firebase ID token like this:
const currentUser = firebaseAuth.currentUser;
const token = await currentUser.getIdToken();

// Include in API requests:
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## API Endpoints

### Points API (`/api/points`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/points` | GET | List all acupuncture points |
| `/points/{id}` | GET | Get point by ID |
| `/points/code/{code}` | GET | Get point by code (e.g., VG20) |
| `/points/meridian/{meridian}` | GET | List points by meridian |
| `/points/symptom/{symptomId}` | GET | List points for a symptom |
| `/points/search?name={query}` | GET | Search points by name |
| `/points/popular?limit={n}` | GET | Get most favorited points |
| `/points/stats` | GET | Get points statistics |

### Symptoms API (`/api/symptoms`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/symptoms` | GET | List all symptoms |
| `/symptoms/{id}` | GET | Get symptom by ID |
| `/symptoms/name/{name}` | GET | Get symptom by exact name |
| `/symptoms/category/{category}` | GET | List symptoms by category |
| `/symptoms/point/{pointId}` | GET | List symptoms for a point |
| `/symptoms/search?name={query}` | GET | Search symptoms by name |
| `/symptoms/tag/{tag}` | GET | List symptoms by tag |
| `/symptoms/popular?limit={n}` | GET | Get most used symptoms |
| `/symptoms/categories` | GET | Get list of categories |
| `/symptoms/stats` | GET | Get symptoms statistics |
| `/symptoms/{id}/use` | POST | Increment usage counter |

### Storage API (`/api/storage`)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/storage/upload` | POST | Upload file | USER |
| `/storage/signed-url/{fileName}` | GET | Get signed URL | USER |
| `/storage/{fileName}` | DELETE | Delete file | ADMIN |
| `/storage/list` | GET | List files | ADMIN |
| `/storage/info/{fileName}` | GET | Get file info | USER |
| `/storage/exists/{fileName}` | GET | Check if file exists | USER |
| `/storage/status` | GET | Get storage status | No |

### Health API (`/health`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/health/liveness` | GET | Liveness probe |
| `/health/readiness` | GET | Readiness probe |
| `/health/detailed` | GET | Detailed health with component status |
| `/health/metrics` | GET | Basic metrics |

## Environment Configuration

### Mobile App Configuration

The mobile app reads the API base URL from environment variables:

```typescript
// Priority order for API_BASE_URL:
// 1. process.env.EXPO_PUBLIC_API_BASE_URL
// 2. app.json extra.apiBaseUrl
// 3. Default: "http://localhost:8080/api"
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL | `https://api.appunture.com/api` |
| `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD` | Enable file uploads | `true` |

### Backend CORS Configuration

The backend must allow CORS from the following origins:

**Development:**
- `http://localhost:8081` (Expo CLI)
- `http://localhost:19006` (Expo Web)
- `http://192.168.x.x:*` (Local network for Expo Go)

**Production:**
- Mobile app deep links
- Web dashboard URL

CORS is configured in `application-dev.yml` and `application-prod.yml`.

## Running E2E Tests

### API Tests with Newman

```bash
cd integration-tests
npm install
npm run test:e2e:api
```

### Health Check Only

```bash
npm run test:e2e:api:health
```

### With Custom Token

```bash
export FIREBASE_ID_TOKEN="your_token"
npm run test:e2e:api:dev
```

## Checklist: Environment Validation

Before deploying, verify:

- [ ] `API_BASE_URL` points to correct backend
- [ ] Firebase project ID matches in mobile and backend
- [ ] CORS allows mobile app origins
- [ ] Firebase Storage bucket is configured
- [ ] Health endpoint responds with status UP
- [ ] Authentication flow works end-to-end

## Rollback Procedures

### If Integration Breaks

1. Revert to last working Postman collection version
2. Check CORS configuration in backend
3. Verify Firebase project configuration
4. Review API contracts in `services/api.ts`

### For Upload Issues

- Use `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=false` to disable uploads
- Check Firebase Storage bucket permissions
- Verify service account has storage access

## Security Considerations

- Never commit Firebase tokens to version control
- Use environment-specific Firebase projects (dev/staging/prod)
- Validate all user input server-side
- Use signed URLs for sensitive file access
- Rate limiting is enabled on auth endpoints
