# API Contract Review

Este documento resume a análise de contratos de API entre o backend Spring Boot e o frontend React Native do Appunture.

## Endpoints Analisados

| Endpoint | Método | Status | Notas |
|----------|--------|--------|-------|
| `/health` | GET | ✅ | Sem autenticação |
| `/health/detailed` | GET | ✅ | Sem autenticação |
| `/health/readiness` | GET | ✅ | Kubernetes probe |
| `/health/liveness` | GET | ✅ | Kubernetes probe |
| `/auth/profile` | GET | ✅ | Retorna UserProfileResponse |
| `/auth/profile` | PUT | ✅ | Atualiza perfil |
| `/auth/sync` | POST | ✅ | Sincroniza com Firebase |
| `/auth/me` | GET | ✅ | Retorna info completa |
| `/auth/favorites` | GET | ✅ | Lista paginada |
| `/auth/favorites/{pointId}` | POST | ✅ | Adiciona favorito |
| `/auth/favorites/{pointId}` | DELETE | ✅ | Remove favorito |
| `/auth/resend-verification` | POST | ✅ | Rate limited |
| `/points` | GET | ✅ | Lista todos |
| `/points` | POST | ✅ | Admin only |
| `/points/{id}` | GET | ✅ | Por ID Firestore |
| `/points/{id}` | PUT | ✅ | Admin only |
| `/points/{id}` | DELETE | ✅ | Admin only |
| `/points/code/{code}` | GET | ✅ | Por código (VG20) |
| `/points/meridian/{meridian}` | GET | ✅ | Por meridiano |
| `/points/symptom/{symptomId}` | GET | ✅ | Por sintoma |
| `/points/search` | GET | ✅ | Busca por nome |
| `/points/popular` | GET | ✅ | Top favoritos |
| `/points/stats` | GET | ✅ | Estatísticas |
| `/points/{pointId}/symptoms/{symptomId}` | POST/DELETE | ✅ | Associações |
| `/points/{pointId}/images` | POST/DELETE | ✅ | Gerenciamento de imagens |
| `/points/{pointId}/coordinates` | PUT | ✅ | Atualiza mapa |
| `/symptoms` | GET | ✅ | Lista todos |
| `/symptoms` | POST | ✅ | Admin only |
| `/symptoms/{id}` | GET/PUT/DELETE | ✅ | CRUD completo |
| `/symptoms/name/{name}` | GET | ✅ | Busca por nome exato |
| `/symptoms/category/{category}` | GET | ✅ | Por categoria |
| `/symptoms/point/{pointId}` | GET | ✅ | Por ponto |
| `/symptoms/search` | GET | ✅ | Busca parcial |
| `/symptoms/tag/{tag}` | GET | ✅ | Por tag |
| `/symptoms/severity` | GET | ✅ | Por faixa de severidade |
| `/symptoms/popular` | GET | ✅ | Top usados |
| `/symptoms/categories` | GET | ✅ | Lista categorias |
| `/symptoms/tags` | GET | ✅ | Lista tags |
| `/symptoms/stats` | GET | ✅ | Estatísticas |
| `/symptoms/{id}/use` | POST | ✅ | Incrementa contador |
| `/symptoms/{symptomId}/points/{pointId}` | POST/DELETE | ✅ | Associações |
| `/symptoms/{symptomId}/tags` | POST | ✅ | Adiciona tag |
| `/storage/upload` | POST | ✅ | Upload arquivo |
| `/storage/signed-url/{fileName}` | GET | ✅ | URL temporária |
| `/storage/{fileName}` | DELETE | ✅ | Admin only |
| `/storage/list` | GET | ✅ | Admin only |
| `/storage/info/{fileName}` | GET | ✅ | Metadados |
| `/storage/exists/{fileName}` | GET | ✅ | Verifica existência |
| `/storage/status` | GET | ✅ | Sem autenticação |
| `/admin/dashboard` | GET | ✅ | Admin only |
| `/admin/users` | GET/POST | ✅ | Admin only |
| `/admin/users/{userId}` | GET/DELETE | ✅ | Admin only |
| `/admin/users/{userId}/role` | PUT | ✅ | Admin only |
| `/admin/users/{userId}/enabled` | PUT | ✅ | Admin only |
| `/admin/stats/detailed` | GET | ✅ | Admin only |
| `/admin/data/seed` | POST | ✅ | Admin only |
| `/admin/health` | GET | ✅ | Admin only |
| `/notifications/register-token` | POST | ✅ | FCM token |
| `/notifications/unregister-token` | DELETE | ✅ | Remove token |
| `/notifications/subscribe/{topic}` | POST | ✅ | Inscreve tópico |
| `/notifications/unsubscribe/{topic}` | DELETE | ✅ | Cancela inscrição |
| `/notifications/settings` | GET | ✅ | Configurações |
| `/chat` | POST | ✅ | IA Gemini |

## Inconsistências Identificadas

### 1. Naming Conventions - Backend vs Frontend

| Campo Backend (FirestorePoint) | Campo Frontend (Point) | Status |
|-------------------------------|------------------------|--------|
| `id` | `id` | ✅ Match |
| `code` | `code` | ✅ Match |
| `name` | `name` | ✅ Match |
| `description` | N/A | ⚠️ Backend only |
| `meridian` | `meridian` | ✅ Match |
| `location` | `location` | ✅ Match |
| `indication` | `indications` | ⚠️ Singular vs Plural |
| `coordinates` | `coordinates` | ✅ Match |
| `imageUrls` | `imageUrls` | ✅ Match |
| N/A | `image_url` | ⚠️ Legacy frontend field |
| N/A | `chinese_name` | ⚠️ Frontend uses snake_case |
| N/A | `chineseName` | ⚠️ Frontend also has camelCase |
| `symptomIds` | N/A | ⚠️ Backend only |
| `tags` | N/A | ⚠️ Backend only |
| `category` | N/A | ⚠️ Backend only |
| `favoriteCount` | `favoriteCount` | ✅ Match |
| N/A | `viewCount` | ⚠️ Backend only |
| `createdAt` | `createdAt` / `created_at` | ⚠️ Mixed case |
| `updatedAt` | `updatedAt` / `updated_at` | ⚠️ Mixed case |
| `createdBy` | N/A | ⚠️ Backend only |
| N/A | `isFavorite` | ⚠️ Frontend only (computed) |
| N/A | `contraindications` | ⚠️ Frontend only |
| N/A | `functions` | ⚠️ Frontend only |

### 2. Response Format Differences

**Backend retorna direto:**
```json
// GET /points
[
  { "id": "...", "code": "VG20", ... },
  { "id": "...", "code": "E36", ... }
]
```

**Frontend espera wrapper:**
```typescript
interface PointsResponse {
  points: Point[];
  count: number;
}
```

**Recomendação:** O frontend `api.ts` trata isso corretamente usando o response direto.

### 3. Paginação

**Backend (GET /auth/favorites):**
```json
{
  "points": [...],
  "total": 100,
  "page": 0,
  "limit": 10,
  "hasMore": true
}
```

**Frontend tipos esperados:** ✅ Consistente

### 4. Error Handling

**Backend atual (GlobalExceptionHandler):**
```json
{
  "timestamp": "2025-11-28T10:00:00.000Z",
  "status": 400,
  "message": "Descrição do erro"
}
```

**Frontend (ApiError):**
```typescript
interface ApiError {
  error: string;
  message?: string;
  status?: number;
}
```

**Recomendação:** Unificar para formato mais estruturado.

## Correções Recomendadas

### Frontend (types/api.ts)

1. ~~Remover campos legacy `image_url`, `chinese_name` (snake_case)~~
   - **Decisão:** Manter para compatibilidade, mas marcar como deprecated
   
2. ~~Adicionar campos faltantes do backend~~
   - `description` 
   - `indication` (singular)
   - `category`
   - `tags`
   - `symptomIds`

3. ~~Unificar timestamp format~~
   - Usar apenas `createdAt`, `updatedAt` (camelCase)

### Backend

1. ✅ Todos os controllers usam Swagger/OpenAPI annotations
2. ✅ GlobalExceptionHandler atualizado para usar ErrorResponse padronizado
3. ✅ ErrorResponse DTO criado em `/backend-java/src/main/java/.../dto/common/ErrorResponse.java`
4. ⚠️ Considerar adicionar campos que frontend espera:
   - `contraindications` em FirestorePoint
   - `functions` em FirestorePoint (descrição funcional)

## OpenAPI Specification

A especificação OpenAPI completa foi criada em:
- `/openapi/openapi.yaml`

### Validação

```bash
# Instalar validador
npm install -g @redocly/cli

# Validar spec
npx @redocly/cli lint openapi/openapi.yaml

# Gerar documentação HTML
npx @redocly/cli build-docs openapi/openapi.yaml -o docs/api.html

# Gerar tipos TypeScript
npx openapi-typescript openapi/openapi.yaml -o frontend-mobile/appunture/types/api.generated.ts
```

### Estatísticas

- **Total de endpoints:** 65
- **Schemas definidos:** 23
- **Tags/Categorias:** 8 (Health, Auth, Points, Symptoms, Storage, Notifications, Admin, Chat)
- **Endpoints públicos (sem auth):** 6
- **Endpoints admin-only:** 15

## Postman Collection

A collection Postman foi atualizada em:
- `/backend-java/openapi/appunture-backend.postman_collection.json`

## Sumário de Mudanças

### Arquivos Criados

1. `/openapi/openapi.yaml` - Especificação OpenAPI 3.0.3 completa
2. `/API_CONTRACT_REVIEW.md` - Este documento
3. `/backend-java/src/main/java/.../dto/common/ErrorResponse.java` - DTO padronizado para erros

### Arquivos Atualizados

1. `/backend-java/openapi/appunture-backend.postman_collection.json` - Collection completa com todos os endpoints organizados
2. `/backend-java/src/main/java/.../exception/GlobalExceptionHandler.java` - Atualizado para usar ErrorResponse

## Próximos Passos

1. **Geração de Tipos:** Configurar CI/CD para gerar tipos TypeScript automaticamente
2. **Documentação Interativa:** Deploy do Swagger UI ou Redoc
3. **Validação em Runtime:** Adicionar validação de request/response contra OpenAPI spec
4. **Versioning:** Implementar versionamento de API (v1, v2)
5. **Deprecation:** Marcar campos legacy como deprecated na spec
