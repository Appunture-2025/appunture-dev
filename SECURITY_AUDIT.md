# Security Audit Report - Appunture

**Date:** 2025-11-29  
**Auditor:** Copilot Coding Agent  
**Scope:** Backend Java, Frontend Mobile, Frontend Admin

---

## Sumário Executivo

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 1 | Fixed |
| 🟠 High | 5 | 2 Fixed, 3 Recommended |
| 🟡 Medium | 6 | 3 Fixed, 3 Recommended |
| 🟢 Low | 4 | Recommendations Only |

---

## Vulnerabilidades Encontradas

### 🔴 [CRITICAL] NPM Dependency: form-data 4.0.x - Insecure Random Function (GHSA-fjxv-7rqg-78g4)

**Location:** `frontend-mobile/appunture/package.json`  
**Description:** The `form-data` package (4.0.0 - 4.0.3) uses an unsafe random function for choosing multipart boundary, which could lead to predictable boundaries in form data submissions.  
**Risk:** An attacker could predict multipart boundaries and potentially inject malicious content.  
**Status:** ✅ FIXED - Updated via npm audit fix

### 🟠 [HIGH] NPM Dependency: axios 1.0.0-1.11.0 - DoS Vulnerability (GHSA-4hjh-wcwx-xvwj)

**Location:** `frontend-mobile/appunture/package.json`  
**Description:** Axios versions below 1.12.0 are vulnerable to Denial of Service attacks due to lack of data size validation.  
**Risk:** Server/application can be overwhelmed with excessively large responses.  
**Status:** ✅ FIXED - Updated via npm audit fix

### 🟠 [HIGH] NPM Dependency: node-forge <=1.3.1 - Multiple Vulnerabilities

**Location:** `frontend-mobile/appunture/node_modules/node-forge`  
**CVEs:**
- GHSA-554w-wpv2-vw27: ASN.1 Unbounded Recursion
- GHSA-65ch-62r8-g69g: ASN.1 OID Integer Truncation
- GHSA-5gfm-wpxj-wjgq: ASN.1 Validator Desynchronization

**Risk:** Cryptographic operations may be compromised, leading to potential security bypasses.  
**Status:** ✅ FIXED - Updated via npm audit fix

### 🟠 [HIGH] NPM Dependency: glob 10.2.0-10.4.5 - Command Injection (GHSA-5j98-mcp5-4vw2)

**Location:** `frontend-mobile/appunture/node_modules/glob`  
**Description:** Command injection vulnerability via -c/--cmd flag in glob CLI.  
**Risk:** Code execution if user-controlled input reaches glob CLI.  
**Status:** ✅ FIXED - Updated via npm audit fix

### 🟠 [HIGH] Sensitive Field in Model - Password Field Retained

**Location:** `backend-java/src/main/java/com/appunture/backend/model/firestore/FirestoreUser.java:46`  
**Description:** The `password` field is still present in the FirestoreUser model, even though authentication is managed by Firebase Auth.  
**Risk:** Potential storage of plaintext passwords if not properly handled; unnecessary data exposure in API responses.  
**Status:** ✅ FIXED - Added @JsonIgnore annotation to exclude from serialization

### 🟠 [HIGH] Security Headers Missing

**Location:** `backend-java/src/main/java/com/appunture/backend/config/SecurityConfig.java`  
**Description:** Missing important security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-XSS-Protection.  
**Risk:** Browser-based attacks (clickjacking, MIME sniffing, XSS).  
**Status:** ✅ FIXED - Added security headers configuration

### 🟡 [MEDIUM] NPM Dependency: markdown-it <12.3.2 - Uncontrolled Resource Consumption (GHSA-6vfc-qv3f-vr6c)

**Location:** `frontend-mobile/appunture/node_modules/markdown-it`  
**Description:** ReDoS vulnerability in markdown-it parsing.  
**Risk:** Application can be made unresponsive with crafted markdown input.  
**Status:** ⚠️ No fix available - Dependency of react-native-markdown-display  
**Recommendation:** Monitor for updates to react-native-markdown-display; consider input size limits for markdown content.

### 🟡 [MEDIUM] NPM Dependency: js-yaml <3.14.2 - Prototype Pollution (GHSA-mh29-5h37-fv8m)

**Location:** `frontend-mobile/appunture/node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml`  
**Description:** Prototype pollution in YAML merge (<<) operation.  
**Risk:** Object prototype pollution could lead to property injection.  
**Status:** ✅ FIXED - Updated via npm audit fix (dev dependency)

### 🟡 [MEDIUM] NPM Dependency: esbuild <=0.24.2 - Development Server Request Bypass (GHSA-67mh-4wv8-2f99)

**Location:** `frontend-admin/node_modules/esbuild`  
**Description:** Development server allows any website to send requests and read responses.  
**Risk:** Cross-origin data leakage during development.  
**Status:** ⚠️ Requires major version update to vite 7.x  
**Recommendation:** Only affects development environment; upgrade when stable.

### 🟡 [MEDIUM] NPM Dependency: undici 6.0.0-6.21.1 - Multiple Vulnerabilities

**Location:** `frontend-admin/node_modules/undici` (via Firebase)  
**CVEs:**
- GHSA-c76h-2ccp-4975: Insufficiently Random Values
- GHSA-cxrh-j4jr-qwg3: DoS via bad certificate data

**Risk:** Potential security issues in HTTP client operations.  
**Status:** ⚠️ Indirect dependency via Firebase  
**Recommendation:** Update Firebase to latest version when available.

### 🟡 [MEDIUM] Rate Limiting Bypass - X-Forwarded-For Header Trust

**Location:** `backend-java/src/main/java/com/appunture/backend/security/RateLimitingFilter.java:147-152`  
**Description:** The rate limiter trusts X-Forwarded-For header without validation, which could be spoofed.  
**Risk:** Rate limiting could be bypassed by rotating IP addresses in the header.  
**Status:** ⚠️ RECOMMENDATION  
**Recommendation:** Configure trusted proxies or use alternative identification strategies.

### 🟡 [MEDIUM] Placeholder Values in app.json

**Location:** `frontend-mobile/appunture/app.json:43-52`  
**Description:** Firebase configuration contains placeholder values like "your-firebase-api-key".  
**Risk:** Application won't work if deployed without proper configuration; potential exposure of configuration structure.  
**Status:** ⚠️ RECOMMENDATION  
**Recommendation:** Remove placeholders or move to environment variables only.

### 🟢 [LOW] CSRF Protection Disabled

**Location:** `backend-java/src/main/java/com/appunture/backend/config/SecurityConfig.java:114`  
**Description:** CSRF protection is disabled (`.csrf(csrf -> csrf.disable())`).  
**Risk:** Cross-site request forgery attacks on state-changing operations.  
**Justification:** ✅ ACCEPTABLE - Using stateless JWT authentication with Firebase tokens; CSRF is not applicable for API-only backends with Bearer token auth.

### 🟢 [LOW] Swagger/OpenAPI Exposed in Production

**Location:** `backend-java/src/main/java/com/appunture/backend/config/SecurityConfig.java:122`  
**Description:** Swagger UI and API docs are publicly accessible.  
**Risk:** API structure exposed to potential attackers.  
**Status:** ⚠️ RECOMMENDATION  
**Recommendation:** Consider restricting Swagger access in production or enabling only for authenticated users.

### 🟢 [LOW] Actuator Endpoints Exposure

**Location:** `backend-java/src/main/resources/application.yml:99-102`  
**Description:** Actuator endpoints (health, info, prometheus, metrics) are exposed.  
**Risk:** Information disclosure about application internals.  
**Status:** ⚠️ RECOMMENDATION  
**Justification:** Health endpoint is needed for Kubernetes/Cloud Run probes. Prometheus metrics should be restricted to internal network.

### 🟢 [LOW] Debug Logging in Production Profile

**Location:** `backend-java/src/main/resources/logback-spring.xml:54`  
**Description:** Application logger is set to DEBUG level even in prod profile section.  
**Risk:** Excessive logging could expose sensitive information.  
**Status:** ⚠️ RECOMMENDATION  
**Recommendation:** Change to INFO or WARN for production.

---

## Análise de Segurança Detalhada

### Backend Java - Autenticação & Autorização

| Check | Status | Notes |
|-------|--------|-------|
| Firebase Auth Token Validation | ✅ Pass | Proper token verification in FirebaseAuthenticationFilter |
| Email Verification Enforcement | ✅ Pass | Configurable via `require-email-verified` property |
| Role-Based Access Control | ✅ Pass | ADMIN/USER roles with @PreAuthorize |
| Rate Limiting | ✅ Pass | Bucket4j implementation with per-user/IP strategies |
| Session Management | ✅ Pass | Stateless with JWT tokens |

### Backend Java - Input Validation

| Check | Status | Notes |
|-------|--------|-------|
| DTO Validation Annotations | ✅ Pass | @NotBlank, @Email, @Size in all DTOs |
| File Upload Validation | ✅ Pass | Type, size, and extension validation |
| File Path Traversal Protection | ✅ Pass | Extension validation prevents traversal |
| Firestore Query Parameters | ✅ Pass | Using SDK methods, not raw queries |

### Backend Java - Secrets Management

| Check | Status | Notes |
|-------|--------|-------|
| No Hardcoded Secrets | ✅ Pass | Uses environment variables |
| .gitignore Configuration | ✅ Pass | Covers build artifacts and env files |
| Service Account Key Handling | ✅ Pass | Supports ADC and env vars |
| Commented Password in Config | ⚠️ Warning | `password123` visible but commented |

### Frontend Mobile - Security

| Check | Status | Notes |
|-------|--------|-------|
| SecureStore for Tokens | ✅ Pass | Uses expo-secure-store for auth tokens |
| Axios Token Interceptor | ✅ Pass | Proper token refresh handling |
| Session Manager | ✅ Pass | Token expiry monitoring and refresh |
| Permissions in app.json | ✅ Pass | Minimal permissions requested |

### Frontend Admin - Security

| Check | Status | Notes |
|-------|--------|-------|
| Environment Variables | ✅ Pass | Uses VITE_ prefix for client env vars |
| Firebase SDK | ⚠️ Warning | Outdated with known vulnerabilities |

---

## Ações Tomadas

- [x] Fixed critical form-data vulnerability (npm audit fix)
- [x] Fixed axios DoS vulnerability (npm audit fix)  
- [x] Fixed node-forge vulnerabilities (npm audit fix)
- [x] Fixed glob command injection vulnerability (npm audit fix)
- [x] Fixed js-yaml prototype pollution (npm audit fix)
- [x] Added @JsonIgnore to password field in FirestoreUser model
- [x] Added security headers configuration (X-Content-Type-Options, X-Frame-Options, etc.)

---

## Recomendações Futuras

### Prioritário (Próximos 30 dias)

1. **Update Firebase SDK** - Both frontend-admin (10.7.1) and frontend-mobile (11.0.1) should be updated to latest versions to address undici vulnerabilities.

2. **X-Forwarded-For Validation** - Configure trusted proxy list in rate limiting to prevent IP spoofing:
   ```java
   // Consider validating X-Forwarded-For against known proxies
   private static final List<String> TRUSTED_PROXIES = List.of("10.0.0.0/8", "172.16.0.0/12");
   ```

3. **Remove Placeholder Values** - Update app.json to not include placeholder Firebase configuration; use environment variables exclusively.

### Médio Prazo (60-90 dias)

4. **Implement WAF (Web Application Firewall)** - Add Cloud Armor or similar WAF in front of the API.

5. **Add Security Logging** - Implement dedicated security audit logging for:
   - Failed authentication attempts
   - Authorization failures
   - Rate limit violations
   - Admin operations

6. **Consider Secret Rotation** - Implement automated rotation for Firebase service account keys.

### Longo Prazo

7. **Penetration Testing** - Consider third-party penetration testing before production launch.

8. **SAST/DAST Integration** - Add CodeQL or similar security scanning to CI/CD pipeline.

9. **Dependency Scanning Automation** - Implement Dependabot or Renovate for automatic security updates.

---

## Compliance Notes

- ✅ OWASP Top 10 considerations addressed
- ✅ Authentication via industry-standard Firebase Auth
- ✅ Data validation at API boundaries
- ✅ Secure storage for sensitive data in mobile app
- ⚠️ LGPD/GDPR considerations: Ensure proper user data handling policies

---

## Appendix: Dependency Audit Summary

### Frontend Mobile (after fixes)
```
1 moderate vulnerability (markdown-it - no fix available)
```

### Frontend Admin
```
12 moderate vulnerabilities (Firebase/esbuild related)
```

### Backend Java
```
No known CVEs in direct dependencies as of audit date
Spring Boot 3.2.5 - Current stable version
```
