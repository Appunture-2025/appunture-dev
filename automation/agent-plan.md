# Copilot Workspace Agent – Plano Mestre

## 1. Contexto do Repositório

- **Nome**: `appunture-dev` · **Branch principal**: `main` · Subpastas chave: `backend-java`, `frontend-mobile/appunture`, `tools`, `tables`, `analises`.
- **Estado atual** (27/11/2025) segundo `analises/ANALISE_*_27NOV2025.md` e `analises/PLANO_IMPLEMENTACAO_FINAL_27NOV2025.md`:
  - Backend Java ≈85% concluído (faltam testes, seed endpoint, CI/CD, observabilidade real, rate limiting).
  - Frontend Mobile ≈70% (ajustes API, autenticação Firebase completa, upload de mídia, testes UI/e2e, branding/builds).
  - Integração ≈50% (contratos de autenticação, ambientes alinhados, upload real, testes ponta-a-ponta, observabilidade compartilhada).
  - Seed/Dados ≈60% (enriquecimento pontos, relacionamentos, pipeline import/export Firestore).
- **Objetivo global**: manter agentes rodando enquanto o time está offline para levar o produto a "pronto para produção" com qualidade, dados e automação alinhados.

## 2. Pré-Requisitos / Setup rápido

1. Instalar CLIs necessários:
   ```bash
   npm install -g @githubnext/copilot-workspace-cli gh firebase-tools
   gh auth login
   copilot workspace auth login
   ```
2. Garantir acesso ao repositório (permissões `repo`, `workflow` e `pull_request`).
3. Exportar variáveis antes de rodar o agente (local ou CI):
   ```bash
   export COPILOT_WORKSPACE_TOKEN=<token>
   export COPILOT_WORKSPACE_BRANCH="automation/copilot-agent"
   ```
4. Executar build rápido para validar ambiente antes de delegar:
   ```bash
   (cd backend-java && ./mvnw -q -DskipTests package)
   (cd frontend-mobile/appunture && npm install)
   ```

## 3. Guardrails Globais para o Agente

- **Sem resets de branch**: trabalhar sempre em branch dedicada `automation/copilot-agent` e criar PRs contra `main`.
- **Commits atômicos** com prefixo `chore(agent): <resumo>`.
- **Testes obrigatórios**: `npm test` no mobile + `./mvnw test` no backend + scripts Python relevantes antes de abrir PR.
- **Sem secrets hardcoded**: utilizar `.env.example` ou instruções na documentação.
- **Docs sempre atualizados**: quando tocar backend/frontend/seed, atualizar arquivos em `analises/` ou READMEs associados.
- **Falhas**: se build/teste falhar, registrar no corpo do PR e abrir issue `agent-broken-build`.

## 4. Rotina de Execução

### 4.1 Execução manual

1. Atualizar branch `automation/copilot-agent` a partir de `origin/main`.
2. Rodar agente:
   ```bash
   copilot workspace agent --plan automation/agent-plan.md --apply
   ```
3. Revisar PRs gerados, executar testes localmente para confirmar, fazer merge quando aprovado.

### 4.2 Execução automatizada (GitHub Actions)

- Ver blueprint em `automation/workflows/agent-nightly.md`.
- Agendar execução diária às 02:00 UTC. Workflow baixa repositório, instala CLIs, roda `copilot workspace agent --plan ...`, publica PR + artefatos (logs, cobertura, seed gerados).

## 5. Estrutura de Prompts

O plano inclui módulos especializados. O agente deve consumi-los em sequência configurável:

1. `prompts/backend-quality.md`
2. `prompts/frontend-integration.md`
3. `prompts/seed-data.md`
4. `prompts/e2e-integration.md`
5. `prompts/devops-observability.md`

> Recomenda-se rodar no máximo **dois prompts por execução** para facilitar revisão. Priorizar conforme pendências críticas do relatório diário.

## 6. Sequência Recomendada (Ciclo de 2 semanas)

| Dia          | Foco                                              | Prompt               | Observações                                                   |
| ------------ | ------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| Seg          | Backend qualidade                                 | Backend Quality      | Elevar cobertura >80%, validar rate limit/logs                |
| Ter          | Seed/Dados                                        | Seed Data            | Normalizar CSVs, exportar NDJSON, validar com backend         |
| Qua          | Frontend integração                               | Frontend Integration | Ajustar API_BASE_URL, remover endpoints legados, upload mídia |
| Qui          | Integração/E2E                                    | E2E Integration      | Postman + Detox + alinhamento contratos                       |
| Sex          | DevOps/Observabilidade                            | DevOps Observability | Workflow CI/CD, métricas, alertas                             |
| Próx. semana | Repetir ciclo avaliando pendências/pull requests. |

## 7. Critérios de Aceitação antes de encerrar execução

- Todos os testes declarados no prompt executado passam.
- Documentação pertinente atualizada (README, `analises/*.md`, `STATUS_FINAL_MIGRACAO.md`).
- Seed ou scripts gerados anexados como artefato ou commitados.
- Logs do agente salvos no job (GitHub Actions) ou `automation/logs/<data>.txt` se rodar localmente.

## 8. Plano de Contingência

- Se o agente travar em diff grande, abortar com `Ctrl+C`, fazer `git reset --hard HEAD` dentro do workspace temporário e relançar com prompt único.
- Para conflitos recorrentes, criar sub-branch `automation/copilot-agent/<data>-<prompt>` e abrir PR separado.
- Manter issue `#copilot-agent-ops` para registrar incidentes, lições e ajustes nos prompts.

## 9. Próximos Passos para o Operador Humano

1. Revisar os arquivos em `automation/prompts/` e ajustar prioridades.
2. Configurar workflow descrito em `automation/workflows/agent-nightly.md` (ou rodar manualmente conforme necessidade).
3. Monitorar PRs criados pelo agente, garantindo merge contínuo conforme validações.

---

**Comando principal**: `copilot workspace agent --plan automation/agent-plan.md --apply`
