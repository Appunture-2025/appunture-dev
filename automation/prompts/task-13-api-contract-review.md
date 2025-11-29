# Task 13: API Contract Review & Documentation

## Objetivo
Revisar contratos de API, garantir consistência entre backend e frontend, e melhorar documentação OpenAPI.

## Escopo

### 1. Análise de Endpoints Existentes

#### Backend (`backend-java/src/main/java/.../controller/`)
- [ ] Listar todos os endpoints públicos
- [ ] Verificar consistência de nomenclatura (REST conventions)
- [ ] Analisar responses (status codes, error format)
- [ ] Revisar DTOs de request/response

#### Endpoints a Revisar
```
GET    /api/v1/points
GET    /api/v1/points/{id}
GET    /api/v1/points/search?q=
GET    /api/v1/meridians
GET    /api/v1/meridians/{code}
GET    /api/v1/symptoms
POST   /api/v1/auth/verify
GET    /api/v1/users/me
PATCH  /api/v1/users/me
POST   /api/v1/users/me/favorites/{pointId}
DELETE /api/v1/users/me/favorites/{pointId}
POST   /api/v1/storage/upload
GET    /admin/...
```

### 2. Consistência Backend ↔ Frontend

#### Comparar Tipos
- [ ] `Point` - backend DTO vs frontend type
- [ ] `Meridian` - backend DTO vs frontend type
- [ ] `User` - backend DTO vs frontend type
- [ ] `Pagination` - formato consistente

#### Verificar
```typescript
// Frontend espera:
interface Point {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  namePt?: string;
  // ...
}

// Backend retorna o mesmo formato?
```

### 3. Documentação OpenAPI

#### Atualizar `openapi/openapi.yaml`
- [ ] Todos os endpoints documentados
- [ ] Schemas atualizados
- [ ] Examples adicionados
- [ ] Error responses documentados

#### Validação
```bash
# Validar OpenAPI spec
npx @redocly/cli lint openapi/openapi.yaml
```

### 4. Error Handling Consistente

#### Formato Padrão de Erro
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Point with id 'xyz' not found",
    "timestamp": "2025-11-28T10:00:00Z",
    "path": "/api/v1/points/xyz"
  }
}
```

#### Verificar
- [ ] Todos os controllers usam formato padrão
- [ ] Frontend trata todos os códigos de erro
- [ ] Mensagens são user-friendly

### 5. Paginação & Filtering

#### Padrão de Paginação
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Verificar
- [ ] Todos os endpoints de lista suportam paginação
- [ ] Query params consistentes (`page`, `pageSize`, `sort`)
- [ ] Defaults sensatos (pageSize=20, max=100)

## Critérios de Aceitação

1. **Documentação Atualizada**:
   - `openapi/openapi.yaml` completo e validado
   - README com exemplos de uso da API
   - Postman collection sincronizada

2. **Tipos Sincronizados**:
   - Script de geração de tipos do OpenAPI
   - Frontend types gerados automaticamente
   - Zero mismatches backend/frontend

3. **Error Handling**:
   - Formato padronizado em todos os endpoints
   - Tratamento consistente no frontend

## Comandos Úteis

```bash
# Gerar tipos TypeScript do OpenAPI
npx openapi-typescript openapi/openapi.yaml -o frontend-mobile/appunture/types/api.generated.ts

# Validar spec
npx @redocly/cli lint openapi/openapi.yaml

# Gerar docs HTML
npx @redocly/cli build-docs openapi/openapi.yaml -o docs/api.html
```

## Output Esperado

```markdown
# API_CONTRACT_REVIEW.md

## Endpoints Analisados
| Endpoint | Status | Issues |
|----------|--------|--------|
| GET /points | ✅ | - |
| POST /auth | ⚠️ | Missing error schema |

## Inconsistências Encontradas
1. `Point.location` vs `Point.anatomicalLocation`
2. Pagination format differs on /admin endpoints

## Correções Aplicadas
- Padronizado todos os endpoints
- Gerado types automáticos

## OpenAPI Diff
+50 linhas de documentação
+12 schemas
+8 examples
```

## Labels
`api`, `documentation`, `contracts`, `copilot-agent`, `priority:medium`
