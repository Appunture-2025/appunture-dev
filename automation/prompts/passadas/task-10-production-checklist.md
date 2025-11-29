# Prompt – Checklist de Produção

## Contexto

- App Appunture prestes a ir para produção
- Backend em Cloud Run
- Frontend em React Native (Expo)
- Firebase para Auth/Firestore

## Objetivo

Verificar e implementar todos os itens necessários para produção.

## Checklist Completo

### 1. Segurança

#### Backend

- [ ] **HTTPS obrigatório** - Cloud Run já força HTTPS
- [ ] **CORS configurado** - Apenas origens permitidas
- [ ] **Rate limiting** - Implementar no API Gateway ou Spring
- [ ] **Helmet headers** - Security headers configurados
- [ ] **Secrets em Secret Manager** - Não hardcoded
- [ ] **Firebase Admin SDK** - Service account com mínimo privilégio
- [ ] **Input validation** - Todas as entradas validadas
- [ ] **SQL/NoSQL injection** - Queries parametrizadas

Verificar em `SecurityConfig.java`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // API stateless
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.deny())
                .xssProtection(xss -> xss.enable())
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "https://appunture.com",
            "https://admin.appunture.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

#### Frontend

- [ ] **Expo Secure Store** - Tokens em storage seguro
- [ ] **Certificate pinning** - Para conexões críticas
- [ ] **Sem dados sensíveis em logs** - Remover console.log
- [ ] **Validação de inputs** - Forms validados
- [ ] **Deep link validation** - URLs validadas

### 2. Performance

#### Backend

- [ ] **Connection pooling** - HikariCP configurado
- [ ] **Cache** - Redis ou in-memory para dados frequentes
- [ ] **Pagination** - Todas as listas paginadas
- [ ] **Lazy loading** - Relacionamentos otimizados
- [ ] **Indexes no Firestore** - Índices compostos criados
- [ ] **Compressão gzip** - Habilitada no Spring

Verificar `application.yml`:

```yaml
server:
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/plain
    min-response-size: 1024

spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
```

#### Frontend

- [ ] **Lazy loading de telas** - React.lazy()
- [ ] **Image optimization** - expo-image com cache
- [ ] **Memoization** - useMemo/useCallback onde necessário
- [ ] **FlatList optimization** - windowSize, maxToRenderPerBatch
- [ ] **Bundle size** - Verificar tamanho do bundle

### 3. Observabilidade

#### Backend

- [ ] **Logging estruturado** - JSON logs
- [ ] **Tracing** - OpenTelemetry configurado
- [ ] **Métricas** - Prometheus/Micrometer
- [ ] **Health checks** - /actuator/health
- [ ] **Alertas** - Cloud Monitoring configurado

Verificar `logback-spring.xml`:

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdcKeyName>traceId</includeMdcKeyName>
            <includeMdcKeyName>spanId</includeMdcKeyName>
            <includeMdcKeyName>userId</includeMdcKeyName>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

#### Frontend

- [ ] **Crash reporting** - Sentry/Crashlytics configurado
- [ ] **Analytics** - Firebase Analytics
- [ ] **Performance monitoring** - Firebase Performance

### 4. Resiliência

#### Backend

- [ ] **Circuit breaker** - Resilience4j configurado
- [ ] **Retry policies** - Para chamadas externas
- [ ] **Timeout configuration** - Timeouts definidos
- [ ] **Graceful shutdown** - Spring configurado
- [ ] **Fallbacks** - Comportamento degradado definido

Exemplo Resilience4j:

```java
@CircuitBreaker(name = "firestore", fallbackMethod = "fallback")
@Retry(name = "firestore")
@TimeLimiter(name = "firestore")
public Mono<Point> getPoint(String id) {
    return firestoreRepository.findById(id);
}

public Mono<Point> fallback(String id, Throwable t) {
    return Mono.just(cachedPoints.get(id));
}
```

#### Frontend

- [ ] **Offline mode** - Dados cacheados localmente ✅
- [ ] **Sync queue** - Operações enfileiradas offline ✅
- [ ] **Error boundaries** - React error boundaries
- [ ] **Retry logic** - Para chamadas de API

### 5. CI/CD

- [ ] **Testes automatizados** - Mínimo 70% cobertura
- [ ] **Lint/Format** - ESLint/Prettier, Checkstyle
- [ ] **Security scan** - Dependabot, Snyk
- [ ] **Container scan** - Trivy/Grype
- [ ] **Staging environment** - Ambiente de teste
- [ ] **Rollback strategy** - Cloud Run revisions

### 6. App Store Readiness

#### iOS (App Store Connect)

- [ ] **App Icon** - Todas as resoluções
- [ ] **Screenshots** - iPhone e iPad
- [ ] **Privacy Policy URL** - Obrigatório
- [ ] **Support URL** - Obrigatório
- [ ] **App Review Information** - Credenciais de teste
- [ ] **Content Rating** - Questionário respondido
- [ ] **In-App Purchases** - Se houver
- [ ] **Push Notification entitlement** - Configurado
- [ ] **Apple Sign-In** - Obrigatório se tiver social login

#### Android (Google Play Console)

- [ ] **App Icon** - 512x512
- [ ] **Feature Graphic** - 1024x500
- [ ] **Screenshots** - Phone e Tablet
- [ ] **Privacy Policy URL** - Obrigatório
- [ ] **Content Rating** - IARC
- [ ] **Target SDK** - Mínimo 33 (Android 13)
- [ ] **64-bit support** - Obrigatório
- [ ] **App Bundle** - .aab ao invés de .apk

### 7. Configurações de Produção

#### Firebase

- [ ] **Firestore Rules** - Regras de segurança restritas
- [ ] **Storage Rules** - Acesso controlado
- [ ] **Auth providers** - Apenas os necessários habilitados
- [ ] **Quotas** - Alertas configurados
- [ ] **Backups** - Exportação diária configurada

Firestore Rules exemplo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Points are read-only for authenticated users
    match /points/{pointId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }

    // Favorites belong to users
    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Cloud Run

- [ ] **Min instances** - 1 para evitar cold start
- [ ] **Max instances** - Definir limite
- [ ] **Memory** - 512MB-1GB
- [ ] **CPU** - 1-2 vCPU
- [ ] **Concurrency** - 80-100
- [ ] **Timeout** - 300s
- [ ] **VPC connector** - Se necessário

#### Environment Variables

```bash
# Produção
SPRING_PROFILES_ACTIVE=prod
GOOGLE_CLOUD_PROJECT=appunture-prod
FIREBASE_PROJECT_ID=appunture-prod
LOG_LEVEL=INFO
```

### 8. Documentação

- [ ] **README atualizado** - Instruções de setup
- [ ] **API documentation** - OpenAPI/Swagger
- [ ] **Architecture diagram** - Diagrama atualizado
- [ ] **Runbook** - Procedimentos operacionais
- [ ] **Incident response** - Plano de resposta

### 9. Legal

- [ ] **Privacy Policy** - LGPD/GDPR compliant
- [ ] **Terms of Service** - Termos de uso
- [ ] **Cookie Policy** - Se aplicável
- [ ] **Data retention policy** - Definido
- [ ] **User data export** - GDPR right to portability
- [ ] **User data deletion** - GDPR right to be forgotten

### 10. Testes Finais

- [ ] **Smoke tests** - Funcionalidades críticas
- [ ] **Load testing** - k6/Artillery
- [ ] **Security testing** - OWASP ZAP
- [ ] **Accessibility** - a11y testing
- [ ] **Device testing** - iOS e Android reais

## Comandos de Verificação

```bash
# Backend - Build produção
cd backend-java
./mvnw clean package -Pprod -DskipTests

# Frontend - Build produção
cd frontend-mobile/appunture
eas build --platform all --profile production

# Verificar vulnerabilidades
npm audit
./mvnw dependency-check:check

# Verificar tamanho do bundle
npx expo-cli bundle-size
```

## Prioridade de Implementação

### P0 - Bloqueadores (antes do lançamento)

1. Security config completa
2. Firestore rules
3. Privacy Policy
4. Apple Sign-In (se Google Sign-In existir)
5. Crash reporting

### P1 - Alta Prioridade (primeira semana)

1. Rate limiting
2. Logging estruturado
3. Alertas Cloud Monitoring
4. Load testing

### P2 - Média Prioridade (primeiro mês)

1. Circuit breaker
2. Redis cache
3. Performance optimization
4. A/B testing setup

## Rollback Plan

1. **Cloud Run**: Reverter para revision anterior

   ```bash
   gcloud run services update-traffic appunture-backend \
     --to-revisions=REVISION_ID=100
   ```

2. **App Store**: Não é possível rollback - nova versão necessária

3. **Firestore**: Restaurar de backup
   ```bash
   gcloud firestore import gs://backup-bucket/backup-name
   ```

## Post-Launch

- [ ] Monitor métricas por 24h
- [ ] Verificar logs de erro
- [ ] Responder reviews na App Store
- [ ] Coletar feedback de usuários
- [ ] Planejar próxima release
