# Plano Integrado de Implementação Appunture

## 1. Visão Geral e Objetivos

- Consolidar backend Java (Spring Boot + Firebase Admin), apps Expo e pipeline de dados em um fluxo único para TCC e produção.
- Garantir consistência dos dados (pontos, sintomas, favoritos) em Firestore, incluindo seeds reprodutíveis e auditoria mínima.
- Preparar release MVP com critérios claros: testes backend >80%, mobile com offline sync estável, seeds importados em projeto Firebase dedicado e deploy Cloud Run automatizado.

## 2. Arquitetura Unificada

```text
Expo App (React Native / Offline Sync)
        ↓ REST (HTTPS + Firebase Auth Bearer tokens)
Spring Boot API (Cloud Run)
        ↓ Admin SDK
Firestore + Storage + Auth
```

- **Camada Mobile:** usa Firebase Auth diretamente, mantém cache SQLite e fila de sync (favoritos, imagens, notas).
- **Camada Backend:** valida tokens, aplica regras de negócio, expõe endpoints REST e interage com Firestore/Storage/FCM.
- **Camada Dados:** scripts Python (tools/) para normalizar CSV, validar e exportar JSON/NDJSON consumido pelo backend ou importado via `gcloud firestore import`.
- **Ferramentas auxiliares:** GitHub Actions para CI/CD, Google Cloud Build para containerização, Expo EAS para builds móveis, Firestore Emulator para testes.

## 3. Pipeline de Dados e Seeds Firestore

- **Fontes:** CSV enriquecido `tools/output/points_review.csv`, futuras tabelas de sintomas/tags e usuários admin.
- **Scripts chave:**
  - `normalize_points.py` → assegura consistência de campos brutos.
  - `update_lu_points.py` (e demais)
  - `validate_points_review.py` → bloqueia campos obrigatórios vazios.
  - `export_points_review.py` → gera `points_seed.json` e `points_seed.ndjson` com IDs estáveis.
- **Fluxo recomendado:**
  1. Atualizar/curar CSVs (meridianos específicos via scripts por canal).
  2. Rodar `python tools/validate_points_review.py` (sem warnings).
  3. Exportar com `python tools/export_points_review.py --allow-missing` somente se preciso (preferir modo estrito).
  4. Versionar artefatos gerados em `tools/output/` com hash no commit.
  5. Importar no Firebase usando `gcloud firestore import` (ambiente dev) e validar via backend `/points/search`.
- **Checklist pré-import:** schema válido, campos `location`, `techniques`, `indications` preenchidos, IDs sem espaços, total esperado (361 pontos) batendo com contagem pós-import.
- **Extensões previstas:** seeds para sintomas, categorias, usuário admin (`firebase auth:import`), índices automáticos (`firestore.indexes.json`).

## 4. Backend Java (Cloud Run)

- **Status atual:** integração completa com Firebase Auth/Firestore/Storage, controllers e serviços concluídos, dockerização pronta (`Dockerfile` + Cloud Build).
- **Pendências críticas (referência `backend-java/TODO_PLANO_FINALIZACAO.md`):**
  - Testes unitários e integração com cobertura >80% (MockMvc + Firestore Emulator) e smoke tests no CI.
  - Refinar segurança: custom claims, rate limiting, auditoria de operações críticas em Cloud Logging.
  - Seeds iniciais consumidos pela API (pontos/sintomas/categorias) e usuário admin gerenciado via Admin SDK.
  - OpenAPI final com exemplos, published no Cloud Run + ReDoc estático para o time mobile.
- **Observabilidade:** habilitar Structured Logging, métricas com Cloud Monitoring, alertas de erro (>10% falhas 5xx) e tracing básico via OpenTelemetry exporter.
- **CI/CD:** pipeline GitHub Actions → testes → docker build → push Artifact Registry → deploy Cloud Run (com tráfego gradual). Incluir rollback automático usando `gcloud run services update-traffic` em caso de health-check falhar.

## 5. Apps Mobile (Expo + Offline Sync)

- **Status:** estrutura reorganizada (`ESTRUTURA_NOVA.md`), sync offline 100% (fila SQLite, imagem, backoff), stores de sintomas/pontos atualizados para Firestore IDs.
- **Lacunas:**
  - Implementar tela de perfil completo (upload foto via Firebase Storage, edição de dados) e fluxo de verificação de e-mail.
  - Body Map interativo com coordenadas vindas do backend, galeria de imagens por ponto, navegação por meridiano.
  - Ajustar integrações que dependem de novos endpoints (`/points/popular`, `/symptoms/popular`, etc.) e garantir contratos com backend.
- **Build Strategy:**
  - Dev/Test: `npm run start` com Expo Go + backend local (env `EXPO_PUBLIC_API_URL`).
  - QA: EAS Build (Android internal testing) usando credenciais de serviço Firebase, Storage bucket QA.
  - Prod: EAS Submit para Play Store/TestFlight após checklist (sync queue vazia, testes e2e Detox opcionais).
- **Qualidade:** manter suíte Jest (syncStore + novos módulos), incluir smoke tests para telas críticas e monitorar crash via Sentry (planejado).

## 6. Integrações Cruzadas

- **Autenticação:** mobile autentica direto no Firebase, tokens repassados ao backend (Bearer). Backend valida assinatura, checa claims (`role`, `plan`) e adiciona contexto para autorização fina.
- **Favoritos/Sincronização:** mobile mantém queue local e consome `/auth/favorites/{pointId}`; backend garante idempotência e atualiza contadores agregados. Pendente endpoint para métricas offline (ex: `pendingFavorites`).
- **Uploads:** imagens de pontos e perfil sob Storage; mobile envia para bucket, backend apenas referencia URL assinada ou valida metadata. Precisamos padronizar pasta (`points/{pointId}/images/{uuid}.jpg`).
- **Eventos/Admin:** criação de pontos/sintomas via backend admin endpoints, notificações (FCM) orquestradas pelo backend; mobile somente recebe topics relevantes.
- **Contratos:** manter `types/api.ts` sincronizado com `backend-java` DTOs (MapStruct). Toda mudança deve gerar PR conjunto (backend + atualização no pacote `frontend-mobile/appunture/types`).

## 7. Deploy, Releases e Governança

- **Ambientes:**
  - `dev`: Firestore dev, Cloud Run dev, Expo dev builds (debug logging liberado).
  - `qa`: recursos separados, seeds pré-carregados, builds internos sem debugger.
  - `prod`: acesso restrito, Cloud Run com escalonamento auto e limite mínimo 1 instância.
- **Automação:**
  - GitHub Actions: `test-backend`, `lint-mobile`, `seed-validate`, `deploy-cloud-run`, `eas-build` (gatilho manual).
  - Cloud Build opcional para imagens; gcloud Artifact Registry como fonte única.
- **Release Checklist:**
  - Dados: scripts rodados, validação OK, import log anexado.
  - Backend: testes verdes, cobertura >80%, deploy canário validado, logs limpos por 24h.
  - Mobile: build EAS instalada, smoke tests (login, sync, mapa) e verificação de versão no backend (`/health` respondendo commit hash).
- **Rollback:** manter último snapshot do banco (Firestore export) + imagem anterior no Cloud Run com tráfego reservado 10%. Para mobile, usar feature flags em Remote Config.

## 8. Roadmap e Próximos Passos

- **Curto prazo (Semana 1-2):**
  - Finalizar seeds (pontos + sintomas) e publicar guia de import (`analises/ANALISE_DATABASE_COMPLETA.md` append).
  - Configurar Firestore Emulator nos testes backend + cobertura >80%.
  - Documentar endpoints atualizados (OpenAPI) e alinhar `types/api.ts`.
- **Médio prazo (Semana 3-4):**
  - Implementar perfil completo, body map com coordenadas e galeria de imagens no mobile.
  - Habilitar CI/CD completo (GitHub Actions → Cloud Run) com pré-checagens de segurança.
  - Criar painéis de observabilidade (Logging + Monitoring) e alertas básicos.
- **Longo prazo (Semana 5+):**
  - Recursos avançados: notificações FCM, analytics customizados, cache server-side.
  - Harden infra (rate limiting, backup automático Firestore, testes performance).
- **Riscos:** dependência de dados manuais (CSV), falta de testes e2e, divergência de contratos API. Mitigar com automação dos seeds, suites de contrato e revisão semanal.
- **Premissas:** uso contínuo do Firebase (sem migração para SQL), equipe alinhada com GitHub Flow, orçamentos Cloud Run dentro do free tier.
