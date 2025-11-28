# Prompt – Backend Quality & Reliability

## Contexto

- Baseado nos diagnósticos `analises/ANALISE_BACKEND_27NOV2025.md` e `analises/PLANO_IMPLEMENTACAO_FINAL_27NOV2025.md`.
- Backend Spring Boot 3.2.5 (Java 17) já opera com Firebase Auth/Firestore/Storage, porém carece de testes (>80%), seed endpoint sólido, rate limiting e logging estruturado.
- Objetivo: elevar qualidade, segurança e automação do módulo `backend-java`.

## Objetivos específicos

1. Mapear lacunas de cobertura (services, repositories, security) e criar testes JUnit5 + Mockito, visando **>=80%**.
2. Implementar rate limiting e logs de auditoria (interceptor ou filtro) conforme TODOs em `TODO_PLANO_FINALIZACAO.md`.
3. Garantir endpoint `/admin/data/seed` funcional, consumindo artefatos `tools/output/*.ndjson`.
4. Atualizar documentação (`backend-java/README.md`, `STATUS_FINAL_MIGRACAO.md`) com métricas e novos passos.

## Passos sugeridos

1. Rodar `./mvnw test` e gerar relatório JaCoCo (`target/site/jacoco/index.html`). Anotar classes abaixo da meta.
2. Criar testes adicionais em `src/test/java/...` para services críticos (`AuthService`, `PointService`, `SeedService`, etc.). Utilizar `@DataJpaTest` ou mocks conforme necessário.
3. Implementar rate limiting simples (ex.: Bucket4j ou Spring `RateLimiter`) para endpoints sensíveis (`/auth/sync`, `/storage/*`). Registrar logs estruturados (`log.info` com JSON) contendo `firebaseUid` e IP.
4. Revisar `SeedController` garantindo leitura de arquivo configurável (ex.: `classpath:seed/points.ndjson`). Atualizar `application*.yml` com caminhos e instruções.
5. Executar `./mvnw clean test` e, se aplicável, `./mvnw -pl backend-java spring-boot:run` para smoke manual (`curl http://localhost:8080/api/health`).
6. Atualizar READMEs com:
   - Como rodar testes
   - Como subir rate limiting/seed
   - Novos indicadores de cobertura

## Critérios de aceitação

- JaCoCo report ≥ 0.80 para `instruction` e `branch` (ou justificar no PR).
- Rate limiting configurável via propriedades (`application.yml`).
- Endpoint `/api/admin/data/seed` aceita payload e popula Firestore/Firestore emulator (mockado nos testes).
- Documentação descreve novidades + instruções de rollback.

## Rollback / Segurança

- Não alterar credenciais reais. Usar emuladores/mocks.
- Evitar exclusão de dados em produção: qualquer script deve rodar apenas em ambiente DEV/CI (usar flags `firebase.enabled`).
- Em caso de regressão, reverter commit e restaurar `application.yml` anterior.
