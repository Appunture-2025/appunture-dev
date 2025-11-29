# Copilot Coding Agent – Plano Mestre

> **Última atualização**: 28/11/2025 - Code Review completo realizado

## 1. Contexto do Repositório

- **Nome**: `appunture-dev` · **Branch principal**: `main`
- **Subpastas chave**: `backend-java`, `frontend-mobile/appunture`, `tools`, `tables`, `analises`

### Estado Atual (28/11/2025)

| Módulo          | Progresso | Status                                           |
| --------------- | --------- | ------------------------------------------------ |
| Backend Java    | ≈90%      | ✅ CI/CD criado, JaCoCo, deploy Cloud Run        |
| Frontend Mobile | ≈85%      | ✅ Firebase Auth, upload mídia, E2E Detox        |
| Integração      | ≈70%      | ✅ Contratos alinhados, Postman collections      |
| Seed/Dados      | ≈80%      | ✅ Pipeline automatizado, NDJSON gerado          |
| DevOps          | ✅        | Workflows backend-ci, frontend-ci, seed-pipeline |

## 2. Como Funciona o Copilot Coding Agent

> ⚠️ **IMPORTANTE**: O Copilot CLI NÃO funciona em CI/CD headless.  
> Usamos o **Copilot Coding Agent** via Issues do GitHub.

### Fluxo de Execução

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Workflow cria   │ --> │ Copilot Coding   │ --> │ PR criado       │
│ Issues com      │     │ Agent detecta e  │     │ automaticamente │
│ label           │     │ processa         │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Pré-Requisitos

1. **Habilitar Copilot Coding Agent**:

   - `Settings` → `Copilot` → `Coding Agent` → Habilitar

2. **Executar workflow**:
   ```bash
   gh workflow run copilot-agent-nightly.yml
   # Ou com filtro:
   gh workflow run copilot-agent-nightly.yml -f prompt_filter=backend
   ```

## 3. Workflows CI/CD Criados

| Arquivo                     | Trigger                 | Função                                  |
| --------------------------- | ----------------------- | --------------------------------------- |
| `backend-ci.yml`            | push/PR backend-java    | Build, testes, JaCoCo, deploy Cloud Run |
| `frontend-ci.yml`           | push/PR frontend-mobile | Jest, TypeScript, EAS, Detox            |
| `seed-pipeline.yml`         | push tools/tables       | Normalização, validação, NDJSON         |
| `copilot-agent-nightly.yml` | cron 02:00 UTC          | Cria issues para Copilot Agent          |

## 4. Estrutura de Prompts

### Prompts Originais (Gerais)

```text
automation/prompts/
├── backend-quality.md      # Testes JUnit, cobertura, rate limiting
├── frontend-integration.md # Firebase Auth, upload, testes
├── seed-data.md            # Pipeline dados, NDJSON, Firestore
├── e2e-integration.md      # Postman, Detox, contratos
└── devops-observability.md # CI/CD, métricas, alertas
```

### Tasks Específicas (Novas - 28/11/2025)

| Task | Arquivo | Descrição | Prioridade |
|------|---------|-----------|------------|
| 01 | `task-01-backend-test-coverage.md` | Aumentar cobertura JUnit para 80%+ | P0 |
| 02 | `task-02-google-signin.md` | Implementar Google Sign-In no frontend | P0 |
| 03 | `task-03-apple-signin.md` | Implementar Apple Sign-In (obrigatório App Store) | P0 |
| 04 | `task-04-profile-photo-upload.md` | Upload de foto de perfil com expo-image-picker | P1 |
| 05 | `task-05-remove-console-logs.md` | Criar logger condicional, remover console.* | P1 |
| 06 | `task-06-frontend-test-coverage.md` | Aumentar cobertura Jest para 70%+ | P1 |
| 07 | `task-07-postman-newman-ci.md` | Integrar Postman/Newman no CI | P2 |
| 08 | `task-08-fcm-notifications.md` | Implementar Push Notifications FCM | P2 |
| 09 | `task-09-admin-dashboard.md` | Dashboard web para administradores | P2 |
| 10 | `task-10-production-checklist.md` | Checklist completo de produção | P0 |

### Tasks de Análise & Code Review (28/11/2025)

| Task | Arquivo | Descrição | Prioridade |
|------|---------|-----------|------------|
| 11 | `task-11-security-audit.md` | Auditoria de segurança e vulnerabilidades | P0 |
| 12 | `task-12-code-quality-review.md` | Análise de qualidade e refatoração | P1 |
| 13 | `task-13-api-contract-review.md` | Revisão de contratos API e documentação | P1 |
| 14 | `task-14-performance-analysis.md` | Análise de performance e otimização | P1 |
| 15 | `task-15-accessibility-review.md` | Revisão de acessibilidade (a11y/WCAG) | P2 |
| 16 | `task-16-error-handling-review.md` | Revisão de tratamento de erros | P1 |
| 17 | `task-17-documentation-review.md` | Melhoria da documentação | P2 |
| 18 | `task-18-test-quality-review.md` | Revisão de qualidade dos testes | P1 |

### Executar Tasks Específicas

```bash
# Executar todas as tasks (cria múltiplas issues)
gh workflow run copilot-agent-nightly.yml -f prompt_filter=task

# Executar task específica (manual - criar issue)
gh issue create --title "Task 02: Google Sign-In" \
  --body-file automation/prompts/task-02-google-signin.md \
  --label "copilot-agent"

# Executar tasks de análise
gh issue create --title "Task 11: Security Audit" \
  --body-file automation/prompts/task-11-security-audit.md \
  --label "copilot-agent,security,audit"

gh issue create --title "Task 12: Code Quality Review" \
  --body-file automation/prompts/task-12-code-quality-review.md \
  --label "copilot-agent,code-quality"
```

## 5. Sequência Recomendada

| Dia | Foco     | Comando                                                               |
| --- | -------- | --------------------------------------------------------------------- |
| Seg | Backend  | `gh workflow run copilot-agent-nightly.yml -f prompt_filter=backend`  |
| Ter | Seed     | `gh workflow run copilot-agent-nightly.yml -f prompt_filter=seed`     |
| Qua | Frontend | `gh workflow run copilot-agent-nightly.yml -f prompt_filter=frontend` |
| Qui | E2E      | `gh workflow run copilot-agent-nightly.yml -f prompt_filter=e2e`      |
| Sex | DevOps   | `gh workflow run copilot-agent-nightly.yml -f prompt_filter=devops`   |

## 6. Troubleshooting

### Issue criada mas Copilot não responde

1. Verifique se Copilot Coding Agent está habilitado
2. Comente `@github-copilot please implement this` na issue

### Workflow falha

```bash
# Verificar logs
gh run list --workflow=copilot-agent-nightly.yml
gh run view <run-id> --log
```

### PR com erros

Comente na PR: `@github-copilot please fix the failing tests`

## 7. Guardrails

- ✅ Commits atômicos com prefixo descritivo
- ✅ Testes obrigatórios antes de merge
- ✅ Sem secrets hardcoded (usar `.env.example`)
- ✅ Documentação sempre atualizada

## 8. Métricas de Sucesso

- [ ] Backend: Cobertura JaCoCo >= 80%
- [ ] Frontend: Jest passa, TypeScript sem erros
- [ ] E2E: Detox login.e2e.ts, sync.e2e.ts, upload.e2e.ts passam
- [ ] Seed: NDJSON gerado e validado
- [ ] CI/CD: Todos os workflows verdes

---
