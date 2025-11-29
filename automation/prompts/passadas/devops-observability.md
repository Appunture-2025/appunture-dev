# Prompt – DevOps, CI/CD e Observabilidade

## Contexto

- Lacunas apontadas em `analises/ANALISE_BACKEND_27NOV2025.md`, `ANALISE_FRONTEND_27NOV2025.md` e plano final.
- Objetivo: automatizar builds/tests/deploys e ativar monitoramento mínimo (logs, métricas, alertas) para backend e mobile.

## Objetivos específicos

1. Criar pipelines GitHub Actions (ou Cloud Build) que executem:
   - Backend: `./mvnw test`, build Docker, deploy Cloud Run.
   - Frontend: `npm ci`, `npm test`, `npx expo export --platform web` ou builds EAS (quando aplicável).
   - Seed: rodar scripts Python e anexar artefatos.
2. Publicar relatórios (JaCoCo, Jest, Newman, Detox) como artefatos e badges.
3. Configurar observabilidade (Grafana/Prometheus ou Cloud Monitoring) com dashboards para `auth`, `sync`, `storage` e alertas (latência, erros 5xx, fila offline >10).
4. Documentar runbooks e procedimentos de rollback/deploy.

## Passos sugeridos

1. Criar arquivo `automation/workflows/agent-nightly.yml` baseado no blueprint (ver `automation/workflows/agent-nightly.md`).
2. Adicionar pipelines específicos em `.github/workflows/`:
   - `backend-ci.yml`
   - `frontend-ci.yml`
   - `seed-pipeline.yml`
3. Em cada workflow: configurar caching (`actions/setup-java`, `actions/setup-node`), executar testes, salvar artefatos (`actions/upload-artifact`).
4. Adicionar estágio opcional para deploy Cloud Run (usar `gcloud auth`) e Expo EAS builds (usar tokens). Colocar proteção via `if: github.ref == 'refs/heads/main'`.
5. Provisionar observabilidade:
   - Backend: exportar métricas Micrometer → Prometheus; criar dashboard (JSON) em `observability/`.
   - Mobile: usar Expo/Segment ou log custom (Sentry) registrando falhas de sync/upload.
6. Atualizar documentação (`backend-java/README.md`, `frontend-mobile/appunture/README.md`, `observability/README.md`) com instruções de CI/CD + links para dashboards.

## Critérios de aceitação

- Workflows verdes no GitHub Actions executando testes completos.
- Artefatos (relatórios, seed) disponíveis para download após job.
- Dashboards e alertas descritos, com arquivos de configuração versionados.
- Runbook descrevendo como rodar pipeline manualmente e como fazer rollback.

## Rollback / Segurança

- Usar secrets GitHub (`GCP_SERVICE_ACCOUNT`, `EAS_TOKEN`, `EXPO_TOKEN`). Não commitar credenciais.
- Habilitar `concurrency` em workflows para evitar deploy simultâneo.
- Em caso de falha no deploy, travar job com `continue-on-error: false` e abrir issue automática.
