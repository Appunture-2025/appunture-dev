# 📋 Documentação Técnica Completa - Backend Appunture

> **Versão:** 1.0.0  
> **Data:** Dezembro 2025  
> **Autor:** Análise automatizada para validação de TCC

---

## 📌 Resumo Executivo

O **Appunture Backend** é uma API REST moderna desenvolvida em **Java 17** com **Spring Boot 3.2.5**, projetada para gerenciar dados de pontos de acupuntura, sintomas e usuários. A arquitetura foi concebida para integração total com o ecossistema **Firebase/Google Cloud**, eliminando a necessidade de servidores tradicionais de banco de dados e otimizando custos para o plano gratuito do TCC.

### Principais Características

| Aspecto            | Tecnologia/Abordagem           |
| ------------------ | ------------------------------ |
| **Linguagem**      | Java 17 (LTS)                  |
| **Framework**      | Spring Boot 3.2.5              |
| **Banco de Dados** | Google Cloud Firestore (NoSQL) |
| **Autenticação**   | Firebase Auth (JWT)            |
| **Armazenamento**  | Firebase Storage               |
| **Deploy**         | Docker + Cloud Run             |
| **Documentação**   | OpenAPI 3 (Swagger)            |

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Camadas

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Mobile/Web)                       │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                   CAMADA DE APRESENTAÇÃO                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Controllers    │  │ DTOs (Request/ │  │ Exception Handlers │  │
│  │ REST           │  │ Response)      │  │                    │  │
│  └────────────────┘  └────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CAMADA DE SEGURANÇA                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Firebase Auth  │  │ Rate Limiting  │  │ CORS Config        │  │
│  │ Filter         │  │ Filter         │  │                    │  │
│  └────────────────┘  └────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CAMADA DE NEGÓCIO                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Services       │  │ Business Rules │  │ Validations        │  │
│  │                │  │                │  │                    │  │
│  └────────────────┘  └────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CAMADA DE PERSISTÊNCIA                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Repositories   │  │ Firestore      │  │ Cache (Caffeine)   │  │
│  │ (Firestore)    │  │ Client         │  │                    │  │
│  └────────────────┘  └────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                  SERVIÇOS EXTERNOS (Firebase/GCP)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Firestore      │  │ Firebase       │  │ Firebase           │  │
│  │ (Database)     │  │ Auth           │  │ Storage            │  │
│  └────────────────┘  └────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Padrões Arquiteturais Utilizados

| Padrão                   | Descrição                                                | Implementação                                        |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------- |
| **Layered Architecture** | Separação em camadas (Controller → Service → Repository) | Pacotes organizados por função                       |
| **DTO Pattern**          | Transferência de dados entre camadas                     | Classes `*Request` e `*Response`                     |
| **Repository Pattern**   | Abstração do acesso a dados                              | `Firestore*Repository` classes                       |
| **Filter Chain**         | Processamento de requisições                             | `FirebaseAuthenticationFilter`, `RateLimitingFilter` |
| **Builder Pattern**      | Construção de objetos complexos                          | Lombok `@Builder` em entidades                       |
| **Dependency Injection** | Inversão de controle                                     | Spring IoC Container                                 |
| **Stateless API**        | Sem sessão no servidor                                   | JWT tokens para cada requisição                      |

---

## 📁 Estrutura do Projeto

```
backend-java/
├── src/
│   ├── main/
│   │   ├── java/com/appunture/backend/
│   │   │   ├── BackendApplication.java          # Ponto de entrada
│   │   │   ├── config/                          # Configurações
│   │   │   │   ├── CacheConfig.java             # Cache Caffeine
│   │   │   │   ├── FirebaseConfig.java          # Firebase Admin SDK
│   │   │   │   ├── FirestoreConfig.java         # Firestore client
│   │   │   │   ├── OpenApiConfig.java           # Swagger/OpenAPI
│   │   │   │   ├── SecurityConfig.java          # Spring Security
│   │   │   │   └── SecurityProperties.java      # Props de segurança
│   │   │   ├── controller/                      # REST Controllers
│   │   │   │   ├── AiChatController.java        # Chat IA
│   │   │   │   ├── FirebaseStorageController.java
│   │   │   │   ├── FirestoreAdminController.java
│   │   │   │   ├── FirestoreAuthController.java
│   │   │   │   ├── FirestoreHealthController.java
│   │   │   │   ├── FirestorePointController.java
│   │   │   │   ├── FirestoreSymptomController.java
│   │   │   │   └── NotificationController.java
│   │   │   ├── dto/                             # Data Transfer Objects
│   │   │   │   ├── common/                      # DTOs comuns
│   │   │   │   ├── point/                       # DTOs de pontos
│   │   │   │   ├── request/                     # DTOs de requisição
│   │   │   │   ├── response/                    # DTOs de resposta
│   │   │   │   ├── stats/                       # DTOs de estatísticas
│   │   │   │   └── symptom/                     # DTOs de sintomas
│   │   │   ├── exception/                       # Tratamento de exceções
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── RateLimitExceededException.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── ValidationException.java
│   │   │   ├── filter/                          # Filtros HTTP
│   │   │   │   └── CorrelationIdFilter.java
│   │   │   ├── model/firestore/                 # Entidades Firestore
│   │   │   │   ├── FirestorePoint.java
│   │   │   │   ├── FirestoreSymptom.java
│   │   │   │   └── FirestoreUser.java
│   │   │   ├── repository/firestore/            # Repositories
│   │   │   │   ├── FirestorePointRepository.java
│   │   │   │   ├── FirestoreSymptomRepository.java
│   │   │   │   └── FirestoreUserRepository.java
│   │   │   ├── security/                        # Segurança
│   │   │   │   ├── FirebaseAuthenticationFilter.java
│   │   │   │   └── RateLimitingFilter.java
│   │   │   └── service/                         # Serviços de negócio
│   │   │       ├── AiChatService.java
│   │   │       ├── EmailService.java
│   │   │       ├── FileUploadService.java
│   │   │       ├── FirebaseAuthService.java
│   │   │       ├── FirebaseStorageService.java
│   │   │       ├── FirestorePointService.java
│   │   │       ├── FirestoreSymptomService.java
│   │   │       ├── FirestoreUserService.java
│   │   │       ├── NotificationService.java
│   │   │       ├── SeedDataService.java
│   │   │       └── ThumbnailGenerationService.java
│   │   └── resources/
│   │       ├── application.yml                  # Config principal
│   │       ├── application-dev.yml              # Config desenvolvimento
│   │       ├── application-prod.yml             # Config produção
│   │       ├── logback-spring.xml               # Configuração de logs
│   │       └── seed/                            # Dados iniciais
│   │           ├── points_seed.ndjson           # 362+ pontos
│   │           └── symptoms_seed.ndjson         # Sintomas
│   └── test/                                    # Testes
├── Dockerfile                                   # Container config
├── pom.xml                                      # Dependências Maven
└── README.md                                    # Documentação
```

---

## 🗄️ Modelos de Dados

### FirestoreUser (Usuários)

```java
@Data @Builder
public class FirestoreUser {
    @DocumentId
    private String id;                    // ID do documento Firestore
    private String firebaseUid;           // UID do Firebase Auth
    private String email;                 // Email único
    private String name;                  // Nome do usuário
    private String role;                  // USER ou ADMIN
    private boolean enabled;              // Conta ativa
    private LocalDateTime createdAt;      // Criação
    private LocalDateTime updatedAt;      // Última atualização
    private List<String> favoritePointIds; // Pontos favoritos
    private String profileImageUrl;       // Foto de perfil
    private String phoneNumber;           // Telefone
    private boolean emailVerified;        // Email verificado
    private String fcmToken;              // Token push notifications
    private List<String> notificationTopics; // Tópicos de notificação
}
```

### FirestorePoint (Pontos de Acupuntura)

```java
@Data @Builder
public class FirestorePoint {
    @DocumentId
    private String id;                    // ID documento
    private String code;                  // Código único (VG20, ST36)
    private String name;                  // Nome popular
    private String description;           // Descrição completa
    private String meridian;              // Meridiano associado
    private String location;              // Localização anatômica
    private String indication;            // Indicações terapêuticas
    private Map<String, Double> coordinates; // {x, y} no mapa corporal
    private List<String> imageUrls;       // URLs das imagens
    private Map<String, String> imageThumbnailMap; // Thumbnails
    private List<ImageAuditEntry> imageAudit; // Auditoria de imagens
    private List<String> symptomIds;      // Sintomas relacionados
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;             // UID do criador
    private Integer favoriteCount;        // Contador de favoritos
    private Integer viewCount;            // Contador de visualizações
    private List<String> tags;            // Tags para busca
    private String category;              // Categoria
}
```

### FirestoreSymptom (Sintomas)

```java
@Data @Builder
public class FirestoreSymptom {
    @DocumentId
    private String id;
    private String name;                  // Nome do sintoma
    private String description;           // Descrição
    private String category;              // Categoria (Dor, Digestivo, etc)
    private List<String> tags;            // Tags de busca
    private List<String> pointIds;        // Pontos relacionados
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private Integer useCount;             // Vezes usado em buscas
    private Integer associatedPointsCount;
    private Integer severity;             // 1-10
    private Integer priority;             // Ordenação
}
```

### Relacionamentos

```
┌─────────────────┐       N:M        ┌──────────────────┐
│  FirestorePoint │◄────────────────►│  FirestoreSymptom │
│                 │  (symptomIds/    │                  │
│                 │   pointIds)      │                  │
└────────┬────────┘                  └──────────────────┘
         │
         │ 1:N (favoritePointIds)
         ▼
┌─────────────────┐
│  FirestoreUser  │
│                 │
└─────────────────┘
```

---

## 🛣️ Rotas e Endpoints

### Autenticação (`/auth`)

| Método   | Endpoint                    | Descrição                              | Auth        |
| -------- | --------------------------- | -------------------------------------- | ----------- |
| `GET`    | `/auth/profile`             | Obter perfil do usuário                | ✅ Firebase |
| `PUT`    | `/auth/profile`             | Atualizar perfil                       | ✅ Firebase |
| `POST`   | `/auth/sync`                | Sincronizar usuário Firebase→Firestore | ✅ Firebase |
| `GET`    | `/auth/me`                  | Informações do token + perfil          | ✅ Firebase |
| `POST`   | `/auth/favorites/{pointId}` | Adicionar favorito                     | ✅ Firebase |
| `DELETE` | `/auth/favorites/{pointId}` | Remover favorito                       | ✅ Firebase |
| `GET`    | `/auth/favorites`           | Listar favoritos (paginado)            | ✅ Firebase |
| `POST`   | `/auth/resend-verification` | Reenviar email de verificação          | ✅ Firebase |

### Pontos de Acupuntura (`/points`)

| Método   | Endpoint                            | Descrição                | Auth        |
| -------- | ----------------------------------- | ------------------------ | ----------- |
| `GET`    | `/points`                           | Listar todos os pontos   | Público     |
| `GET`    | `/points/{id}`                      | Buscar por ID            | Público     |
| `GET`    | `/points/code/{code}`               | Buscar por código (VG20) | Público     |
| `GET`    | `/points/meridian/{meridian}`       | Pontos por meridiano     | Público     |
| `GET`    | `/points/symptom/{symptomId}`       | Pontos por sintoma       | Público     |
| `GET`    | `/points/search?name=`              | Busca por nome           | Público     |
| `GET`    | `/points/popular?limit=`            | Pontos populares         | Público     |
| `GET`    | `/points/stats`                     | Estatísticas             | ✅ Firebase |
| `POST`   | `/points`                           | Criar ponto              | ✅ ADMIN    |
| `PUT`    | `/points/{id}`                      | Atualizar ponto          | ✅ ADMIN    |
| `DELETE` | `/points/{id}`                      | Deletar ponto            | ✅ ADMIN    |
| `POST`   | `/points/{id}/symptoms/{symptomId}` | Associar sintoma         | ✅ ADMIN    |
| `DELETE` | `/points/{id}/symptoms/{symptomId}` | Remover sintoma          | ✅ ADMIN    |
| `POST`   | `/points/{id}/images`               | Adicionar imagem         | ✅ ADMIN    |
| `DELETE` | `/points/{id}/images`               | Remover imagem           | ✅ ADMIN    |
| `PUT`    | `/points/{id}/coordinates`          | Atualizar coordenadas    | ✅ ADMIN    |

### Sintomas (`/symptoms`)

| Método   | Endpoint                        | Descrição       | Auth        |
| -------- | ------------------------------- | --------------- | ----------- |
| `GET`    | `/symptoms`                     | Listar todos    | Público     |
| `GET`    | `/symptoms/{id}`                | Buscar por ID   | Público     |
| `GET`    | `/symptoms/name/{name}`         | Buscar por nome | Público     |
| `GET`    | `/symptoms/category/{category}` | Por categoria   | Público     |
| `GET`    | `/symptoms/point/{pointId}`     | Por ponto       | Público     |
| `GET`    | `/symptoms/search?name=`        | Busca           | Público     |
| `GET`    | `/symptoms/tag/{tag}`           | Por tag         | Público     |
| `GET`    | `/symptoms/severity?min=&max=`  | Por severidade  | Público     |
| `GET`    | `/symptoms/popular?limit=`      | Mais usados     | Público     |
| `POST`   | `/symptoms`                     | Criar           | ✅ ADMIN    |
| `PUT`    | `/symptoms/{id}`                | Atualizar       | ✅ ADMIN    |
| `DELETE` | `/symptoms/{id}`                | Deletar         | ✅ ADMIN    |
| `POST`   | `/symptoms/{id}/use`            | Incrementar uso | ✅ Firebase |

### Administração (`/admin`)

| Método   | Endpoint                    | Descrição           | Auth     |
| -------- | --------------------------- | ------------------- | -------- |
| `GET`    | `/admin/dashboard`          | Dashboard admin     | ✅ ADMIN |
| `GET`    | `/admin/users`              | Listar usuários     | ✅ ADMIN |
| `GET`    | `/admin/users/{id}`         | Detalhes usuário    | ✅ ADMIN |
| `PUT`    | `/admin/users/{id}/role`    | Alterar role        | ✅ ADMIN |
| `PUT`    | `/admin/users/{id}/enabled` | Ativar/desativar    | ✅ ADMIN |
| `DELETE` | `/admin/users/{id}`         | Deletar usuário     | ✅ ADMIN |
| `POST`   | `/admin/users`              | Criar admin         | ✅ ADMIN |
| `POST`   | `/admin/seed`               | Importar dados seed | ✅ ADMIN |

### Health Checks (`/health`)

| Método | Endpoint            | Descrição           | Auth    |
| ------ | ------------------- | ------------------- | ------- |
| `GET`  | `/health`           | Status básico       | Público |
| `GET`  | `/health/detailed`  | Status detalhado    | Público |
| `GET`  | `/health/readiness` | Pronto para tráfego | Público |
| `GET`  | `/health/liveness`  | Aplicação viva      | Público |

### Notificações (`/notifications`)

| Método   | Endpoint               | Descrição              | Auth        |
| -------- | ---------------------- | ---------------------- | ----------- |
| `POST`   | `/notifications/token` | Registrar FCM token    | ✅ Firebase |
| `POST`   | `/notifications/topic` | Inscrever em tópico    | ✅ Firebase |
| `DELETE` | `/notifications/topic` | Desinscrever de tópico | ✅ Firebase |

---

## 🔐 Segurança

### Fluxo de Autenticação

```
┌──────────┐     1. Login        ┌───────────────┐
│  Cliente │────────────────────►│ Firebase Auth │
│  Mobile  │                     │   (Google)    │
└──────────┘                     └───────┬───────┘
     │                                   │
     │ 2. ID Token (JWT)                 │
     ◄───────────────────────────────────┘
     │
     │ 3. Request + Bearer Token
     ▼
┌────────────────────────────────────────────────┐
│              Backend Spring Boot               │
│  ┌──────────────────────────────────────────┐ │
│  │     FirebaseAuthenticationFilter         │ │
│  │  - Extrai token do header Authorization  │ │
│  │  - Valida com Firebase Admin SDK         │ │
│  │  - Extrai UID, email, claims (role)      │ │
│  │  - Cria SecurityContext                  │ │
│  └──────────────────────────────────────────┘ │
│                      │                         │
│                      ▼                         │
│  ┌──────────────────────────────────────────┐ │
│  │          @PreAuthorize("hasRole")        │ │
│  │  - Verifica permissões por endpoint      │ │
│  │  - ROLE_USER para endpoints protegidos   │ │
│  │  - ROLE_ADMIN para administrativos       │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### Configuração CORS

```yaml
# Desenvolvimento (application-dev.yml)
app.security.cors:
  allowed-origin-patterns:
    - http://localhost:*
    - http://127.0.0.1:*
    - http://192.168.*.*

# Produção (application-prod.yml)
app.security.cors:
  allowed-origins:
    - https://appunture.com
    - https://appunture-tcc.web.app
    - https://appunture-tcc.firebaseapp.com
```

### Rate Limiting

| Configuração      | Valor Padrão | Descrição                             |
| ----------------- | ------------ | ------------------------------------- |
| `capacity`        | 200          | Máximo de tokens por bucket           |
| `refill-tokens`   | 200          | Tokens adicionados por período        |
| `refill-duration` | 1 minuto     | Período de recarga                    |
| `strategy`        | AUTO         | Per-user se autenticado, per-IP senão |

**Headers de resposta:**

- `X-RateLimit-Limit`: Limite total
- `X-RateLimit-Remaining`: Requisições restantes
- `Retry-After`: Segundos até próxima tentativa (se bloqueado)

### Headers de Segurança

```java
// SecurityConfig.java
.headers(headers -> headers
    .contentTypeOptions()         // X-Content-Type-Options: nosniff
    .frameOptions().deny()        // X-Frame-Options: DENY
    .httpStrictTransportSecurity() // HSTS: 1 ano
    .referrerPolicy()             // Referrer-Policy: strict-origin
    .permissionsPolicy()          // Permissions-Policy
)
```

---

## ⚙️ Fluxo de Processamento

### Requisição GET /points/{id}

```
1. REQUISIÇÃO CHEGA
   │
   ▼
2. CorrelationIdFilter
   │ - Gera/extrai X-Correlation-ID
   │ - Adiciona ao MDC para logs
   │
   ▼
3. FirebaseAuthenticationFilter
   │ - Verifica se endpoint é público
   │ - /points/** é público para GET
   │ - Não bloqueia
   │
   ▼
4. RateLimitingFilter
   │ - Verifica bucket do IP
   │ - Consome 1 token
   │ - Adiciona headers X-RateLimit-*
   │
   ▼
5. SecurityFilterChain
   │ - Permite acesso (público)
   │
   ▼
6. FirestorePointController.getPointById(id)
   │ - Log: "Buscando ponto por ID: {id}"
   │
   ▼
7. FirestorePointService.findById(id)
   │ - Verifica cache Caffeine
   │ - Se cache miss → Firestore
   │
   ▼
8. FirestorePointRepository.findById(id)
   │ - firestore.collection("points").document(id).get()
   │ - Converte para FirestorePoint
   │
   ▼
9. RESPOSTA
   │ - Status: 200 OK / 404 Not Found
   │ - Headers: X-Correlation-ID, X-RateLimit-*
   │ - Body: JSON do ponto
```

### Requisição POST /points (Admin)

```
1. REQUISIÇÃO CHEGA
   │ Header: Authorization: Bearer <firebase-token>
   │
   ▼
2. CorrelationIdFilter
   │
   ▼
3. FirebaseAuthenticationFilter
   │ - Extrai token do header
   │ - firebaseAuth.verifyIdToken(token)
   │ - Extrai claims: {role: "ADMIN"}
   │ - Cria UsernamePasswordAuthenticationToken
   │ - SecurityContext.setAuthentication()
   │
   ▼
4. RateLimitingFilter
   │ - Usa UID do usuário como chave do bucket
   │
   ▼
5. SecurityFilterChain
   │ - @PreAuthorize("hasRole('ADMIN')")
   │ - Verifica ROLE_ADMIN no SecurityContext
   │
   ▼
6. FirestorePointController.createPoint(token, point)
   │ - point.setCreatedBy(token.getUid())
   │
   ▼
7. FirestorePointService.createPoint(point)
   │ - Valida: código único?
   │ - Sets: createdAt, updatedAt, favoriteCount=0
   │ - @CacheEvict: limpa caches relacionados
   │
   ▼
8. FirestorePointRepository.save(point)
   │ - firestore.collection("points").document().set(point)
   │
   ▼
9. RESPOSTA
   │ - Status: 201 Created
   │ - Body: JSON do ponto criado com ID
```

---

## 📦 Dependências e Bibliotecas

### Spring Boot Starters

| Dependência                      | Versão | Justificativa                    |
| -------------------------------- | ------ | -------------------------------- |
| `spring-boot-starter-web`        | 3.2.5  | Framework REST, Tomcat embedded  |
| `spring-boot-starter-security`   | 3.2.5  | Autenticação e autorização       |
| `spring-boot-starter-validation` | 3.2.5  | Jakarta Bean Validation (@Valid) |
| `spring-boot-starter-actuator`   | 3.2.5  | Health checks, métricas          |
| `spring-boot-starter-cache`      | 3.2.5  | Abstração de cache               |

### Firebase/Google Cloud

| Dependência              | Versão | Justificativa                        |
| ------------------------ | ------ | ------------------------------------ |
| `firebase-admin`         | 9.2.0  | SDK oficial Firebase (Auth, Storage) |
| `google-cloud-firestore` | 3.17.0 | Cliente Firestore nativo             |

### Utilitários

| Dependência                      | Versão  | Justificativa            |
| -------------------------------- | ------- | ------------------------ |
| `lombok`                         | 1.18.32 | Redução de boilerplate   |
| `springdoc-openapi-starter`      | 2.5.0   | Swagger UI automático    |
| `bucket4j-core`                  | 8.8.0   | Rate limiting em memória |
| `caffeine`                       | -       | Cache high-performance   |
| `logstash-logback-encoder`       | 7.4     | Logs JSON estruturados   |
| `micrometer-registry-prometheus` | -       | Métricas Prometheus      |

### Testes

| Dependência                | Versão | Justificativa                |
| -------------------------- | ------ | ---------------------------- |
| `spring-boot-starter-test` | 3.2.5  | JUnit 5, Mockito             |
| `spring-security-test`     | -      | Testes de segurança          |
| `h2`                       | -      | Banco em memória para testes |
| `mockito-inline`           | 5.2.0  | Mock de classes finais       |

---

## 🔄 Cache

### Estratégia de Cache (Caffeine)

```java
@Configuration
@EnableCaching
public class CacheConfig {
    // Caches configurados
    public static final String CACHE_POINTS = "points";
    public static final String CACHE_POINTS_BY_MERIDIAN = "pointsByMeridian";
    public static final String CACHE_POINT_BY_CODE = "pointByCode";
    public static final String CACHE_POPULAR_POINTS = "popularPoints";
    public static final String CACHE_POINTS_COUNT = "pointsCount";

    // Configuração: 30 min TTL, máx 1000 entradas
}
```

### Invalidação de Cache

Operações de escrita (CREATE, UPDATE, DELETE) invalidam caches relevantes:

```java
@Caching(evict = {
    @CacheEvict(value = CACHE_POINTS, allEntries = true),
    @CacheEvict(value = CACHE_POINTS_BY_MERIDIAN, allEntries = true),
    @CacheEvict(value = CACHE_POINT_BY_CODE, allEntries = true),
    @CacheEvict(value = CACHE_POPULAR_POINTS, allEntries = true)
})
public FirestorePoint createPoint(FirestorePoint point) { ... }
```

---

## 📊 Observabilidade

### Logs Estruturados

**Desenvolvimento (Console legível):**

```
2025-12-03 14:30:00.123 [http-nio-8080-exec-1] DEBUG FirestorePointController [abc-123] - Buscando ponto por ID: lu_4
```

**Produção (JSON para Cloud Logging):**

```json
{
  "timestamp": "2025-12-03T14:30:00.123Z",
  "level": "DEBUG",
  "logger": "FirestorePointController",
  "correlationId": "abc-123",
  "message": "Buscando ponto por ID: lu_4",
  "app": "appunture-backend",
  "profile": "prod"
}
```

### Métricas (Prometheus)

Endpoints expostos:

- `/actuator/prometheus` - Métricas em formato Prometheus
- `/actuator/health` - Health check detalhado
- `/actuator/info` - Informações da aplicação

Métricas customizadas:

- `app_rate_limit_rejections_total` - Requisições bloqueadas por rate limit
- `app_rate_limit_allowed_total` - Requisições permitidas

---

## 🐳 Containerização

### Dockerfile (Multi-stage)

```dockerfile
# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn -DskipTests package

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:8080/api/actuator/health || exit 1
USER app
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","/app/app.jar"]
```

### Otimizações de Imagem

- **Multi-stage build**: Separa build e runtime
- **Alpine base**: Imagem mínima (~200MB total)
- **Non-root user**: Segurança (usuário `app`)
- **Container support**: JVM reconhece limites de memória
- **Health check nativo**: Docker/Kubernetes monitoramento

---

## 🔌 Integrações Externas

### Firebase Auth

| Funcionalidade     | Método                                              |
| ------------------ | --------------------------------------------------- |
| Verificar token    | `firebaseAuth.verifyIdToken(token)`                 |
| Buscar usuário     | `firebaseAuth.getUser(uid)`                         |
| Criar usuário      | `firebaseAuth.createUser(request)`                  |
| Custom claims      | `firebaseAuth.setCustomUserClaims(uid, claims)`     |
| Email verification | `firebaseAuth.generateEmailVerificationLink(email)` |
| Password reset     | `firebaseAuth.generatePasswordResetLink(email)`     |

### Firebase Storage

| Funcionalidade  | Método                                        |
| --------------- | --------------------------------------------- |
| Upload arquivo  | `bucket.create(fileName, bytes, contentType)` |
| URL pública     | Construída via padrão Firebase                |
| URL assinada    | `blob.signUrl(duration, TimeUnit.MINUTES)`    |
| Deletar arquivo | `blob.delete()`                               |
| Listar arquivos | `bucket.list(prefix)`                         |

### Firebase Cloud Messaging (FCM)

| Funcionalidade         | Método                                          |
| ---------------------- | ----------------------------------------------- |
| Notificação individual | `FirebaseMessaging.getInstance().send(message)` |
| Notificação em massa   | `sendEachForMulticast(multicastMessage)`        |
| Tópico                 | `subscribeToTopic(tokens, topic)`               |

---

## ✅ Boas Práticas Implementadas

### Segurança

- ✅ Autenticação stateless com JWT
- ✅ RBAC (Role-Based Access Control)
- ✅ CORS restritivo por ambiente
- ✅ Rate limiting por usuário/IP
- ✅ Headers de segurança (HSTS, X-Frame-Options, etc)
- ✅ Validação de entrada com Jakarta Validation
- ✅ Logs sem dados sensíveis

### Performance

- ✅ Cache em memória (Caffeine)
- ✅ Compressão de resposta habilitada
- ✅ Async logging em produção
- ✅ Container otimizado (Alpine)
- ✅ JVM tuning para containers

### Manutenibilidade

- ✅ Separação clara de camadas
- ✅ DTOs para transferência de dados
- ✅ Exception handler global
- ✅ Documentação OpenAPI automática
- ✅ Correlation ID para rastreamento
- ✅ Profiles por ambiente (dev/prod)

### Observabilidade

- ✅ Health checks (liveness/readiness)
- ✅ Métricas Prometheus
- ✅ Logs estruturados (JSON em prod)
- ✅ Tracing via correlation ID

---

## ⚠️ Pontos de Melhoria Identificados

### Alta Prioridade

1. **Busca de texto**: Firestore não suporta LIKE nativo; buscas são feitas client-side após carregar todos os registros. Considerar Algolia ou Elasticsearch para escala.

2. **Testes de integração**: Cobertura pode ser expandida para testar fluxos completos com Firestore emulado.

3. **AI Service**: Dependências do Spring AI estão comentadas no pom.xml por problemas de repositório. Serviço retorna fallback message.

### Média Prioridade

4. **Paginação**: Endpoints de listagem não implementam paginação nativa do Firestore (startAfter/limit).

5. **Thumbnails**: `ThumbnailGenerationService` preparado mas função Cloud Function não implementada.

6. **Validação de imagens**: `FirebaseStorageService` valida tipos mas não verifica conteúdo real do arquivo.

### Baixa Prioridade

7. **Rate limit distribuído**: Atual é in-memory; para múltiplas instâncias, considerar Redis.

8. **Circuit breaker**: Não implementado para chamadas ao Firestore/Firebase.

---

## 🔗 Relação Backend ↔ Frontend

### Fluxo de Autenticação

```
┌─────────────────┐                  ┌─────────────────┐                  ┌─────────────────┐
│   Flutter App   │                  │  Firebase Auth  │                  │  Spring Backend │
│   (Frontend)    │                  │                 │                  │                 │
└────────┬────────┘                  └────────┬────────┘                  └────────┬────────┘
         │                                    │                                    │
         │ 1. signInWithEmail()               │                                    │
         │───────────────────────────────────►│                                    │
         │                                    │                                    │
         │ 2. ID Token (JWT)                  │                                    │
         │◄───────────────────────────────────│                                    │
         │                                    │                                    │
         │ 3. POST /auth/sync                 │                                    │
         │    Header: Authorization: Bearer <token>                                │
         │────────────────────────────────────────────────────────────────────────►│
         │                                    │                                    │
         │                                    │    4. verifyIdToken(token)         │
         │                                    │◄───────────────────────────────────│
         │                                    │                                    │
         │                                    │    5. Token válido + claims        │
         │                                    │───────────────────────────────────►│
         │                                    │                                    │
         │                                    │    6. Criar/buscar user Firestore  │
         │                                    │                                    │
         │ 7. UserProfileResponse             │                                    │
         │◄────────────────────────────────────────────────────────────────────────│
```

### Contratos de API

O frontend consome:

- **Pontos**: `GET /points`, `GET /points/search`, `GET /points/meridian/{m}`
- **Sintomas**: `GET /symptoms`, `GET /symptoms/category/{c}`
- **Perfil**: `GET/PUT /auth/profile`, `GET /auth/me`
- **Favoritos**: `POST/DELETE /auth/favorites/{id}`, `GET /auth/favorites`

Formato de resposta padronizado:

```json
// Sucesso
{
  "id": "lu_4",
  "code": "LU-4",
  "name": "Supporting the Lung",
  ...
}

// Erro
{
  "error": "VALIDATION_ERROR",
  "message": "Point code is required",
  "path": "/api/points",
  "timestamp": "2025-12-03T14:30:00Z"
}
```

---

## 📚 Referências

- [Spring Boot 3.2 Documentation](https://docs.spring.io/spring-boot/docs/3.2.x/reference/html/)
- [Firebase Admin Java SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Firestore](https://cloud.google.com/firestore/docs)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Bucket4j Rate Limiting](https://bucket4j.com/)

---

> **Documento gerado para validação de TCC - Dezembro 2025**
