# ADR-004: Estrutura da API REST

## Status

Accepted

## Context

O backend Appunture precisa expor uma API REST que seja:

1. **Consistente** - Padrões claros e previsíveis
2. **Documentada** - OpenAPI/Swagger para desenvolvedores
3. **Segura** - Autenticação em todos os endpoints sensíveis
4. **Performática** - Rate limiting e caching
5. **Versionável** - Suporte a evolução sem quebrar clientes

### Stack Escolhida

- Spring Boot 3.2.5
- Firebase Admin SDK
- OpenAPI 3.0 (SpringDoc)

## Decision

Estruturaremos a API REST seguindo convenções RESTful com as seguintes decisões específicas:

### 1. URL Structure

```
/api/{resource}              # Collection
/api/{resource}/{id}         # Singleton
/api/{resource}/{id}/{sub}   # Sub-resource
```

### 2. Endpoints Principais

```yaml
# Autenticação
POST   /auth/sync             # Sincronizar usuário Firebase → Firestore
GET    /auth/profile          # Perfil do usuário
PUT    /auth/profile          # Atualizar perfil
GET    /auth/me               # Token + Perfil combinados
POST   /auth/favorites/{id}   # Adicionar favorito
DELETE /auth/favorites/{id}   # Remover favorito

# Pontos
GET    /points                # Listar pontos
GET    /points/{id}           # Ponto por ID
GET    /points/code/{code}    # Ponto por código (VG20)
GET    /points/meridian/{m}   # Pontos por meridiano
GET    /points/search         # Buscar pontos
GET    /points/popular        # Pontos mais favoritados
POST   /points                # Criar ponto (admin)
PUT    /points/{id}           # Atualizar ponto (admin)
DELETE /points/{id}           # Deletar ponto (admin)

# Sintomas
GET    /symptoms              # Listar sintomas
GET    /symptoms/{id}         # Sintoma por ID
GET    /symptoms/category/{c} # Por categoria
GET    /symptoms/search       # Buscar sintomas
POST   /symptoms/{id}/use     # Incrementar uso

# Admin
GET    /admin/dashboard       # Dashboard
GET    /admin/users           # Listar usuários
PUT    /admin/users/{id}/role # Alterar role
POST   /admin/data/seed       # Carregar dados iniciais

# Health
GET    /health                # Health check básico
GET    /health/detailed       # Status detalhado
GET    /health/liveness       # Kubernetes liveness
GET    /health/readiness      # Kubernetes readiness
```

### 3. Response Format

```json
// Sucesso - Singleton
{
  "point": {
    "id": "abc123",
    "code": "VG20",
    "name": "Baihui",
    ...
  }
}

// Sucesso - Collection
{
  "points": [...],
  "total": 361,
  "page": 1,
  "limit": 20
}

// Erro
{
  "error": {
    "code": "POINT_NOT_FOUND",
    "message": "Ponto não encontrado: abc123",
    "status": 404
  }
}
```

### 4. HTTP Status Codes

| Code | Uso |
|------|-----|
| 200 | Sucesso (GET, PUT) |
| 201 | Criado (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validação) |
| 401 | Unauthorized (sem token) |
| 403 | Forbidden (sem permissão) |
| 404 | Not Found |
| 409 | Conflict (duplicado) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### 5. Rate Limiting

```yaml
app:
  security:
    rate-limit:
      enabled: true
      capacity: 200          # Max tokens
      refill-tokens: 200     # Tokens reabastecidos
      refill-duration: PT1M  # Por minuto
      excluded-paths:
        - /health/**
        - /swagger-ui/**
```

Headers de resposta:
- `X-RateLimit-Limit`: Limite total
- `X-RateLimit-Remaining`: Restantes
- `Retry-After`: Segundos para aguardar (quando bloqueado)

## Consequences

### Positivas

- ✅ **API previsível** - Convenções REST claras
- ✅ **Documentação automática** - Swagger/OpenAPI
- ✅ **Segurança em camadas** - Auth + Rate limiting
- ✅ **Paginação consistente** - `page`, `limit` padronizados
- ✅ **Erros estruturados** - Fácil de tratar no cliente
- ✅ **Health checks** - Kubernetes-ready

### Negativas

- ❌ **Múltiplas chamadas** para dados relacionados
  - Mitigação: Endpoints agregados quando necessário
- ❌ **Over-fetching** em alguns casos
  - Mitigação: Query params para campos específicos
- ❌ **Versioning não implementado** inicialmente
  - Mitigação: `/v1/` prefix quando necessário

## Implementation

### Controller Example

```java
@RestController
@RequestMapping("/points")
@RequiredArgsConstructor
@Tag(name = "Points", description = "Acupuncture Points API")
public class FirestorePointController {

    @GetMapping("/{id}")
    @Operation(summary = "Get point by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Point found"),
        @ApiResponse(responseCode = "404", description = "Point not found")
    })
    public ResponseEntity<PointResponse> getById(@PathVariable String id) {
        return pointService.findById(id)
            .map(point -> ResponseEntity.ok(new PointResponse(point)))
            .orElseThrow(() -> new ResourceNotFoundException("Point", id));
    }
}
```

### OpenAPI Config

```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Appunture API")
                .version("1.0.0")
                .description("API de pontos de acupuntura"))
            .addSecurityItem(new SecurityRequirement()
                .addList("Firebase"))
            .components(new Components()
                .addSecuritySchemes("Firebase", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

## Alternatives Considered

### GraphQL

**Prós:**
- Query flexível
- Sem over/under-fetching
- Tipos fortes

**Contras:**
- Complexidade adicional
- Caching mais difícil
- Overhead para API simples

**Rejeitado por:** Complexidade desnecessária para escopo atual

### gRPC

**Prós:**
- Performance superior
- Streaming
- Type-safe

**Contras:**
- Setup mais complexo
- Menos ferramentas de debug
- Não-web-friendly

**Rejeitado por:** Incompatível com web browsers

### JSON:API

**Prós:**
- Spec bem definida
- Relacionamentos incluídos

**Contras:**
- Mais verbose
- Curva de aprendizado
- Overhead para API simples

**Rejeitado por:** Overhead desnecessário

## Referências

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0)
- [SpringDoc OpenAPI](https://springdoc.org/)
- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
