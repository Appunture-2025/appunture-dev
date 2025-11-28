# Copilot Coding Agent – Plano Mestre

## 1. Contexto do Repositório

- **Nome**: `appunture-dev` · **Branch principal**: `main` · Subpastas chave: `backend-java`, `frontend-mobile/appunture`, `tools`, `tables`, `analises`.
- **Estado atual** (27/11/2025) segundo `analises/ANALISE_*_27NOV2025.md` e `analises/PLANO_IMPLEMENTACAO_FINAL_27NOV2025.md`:
  - Backend Java ≈85% concluído (faltam testes, seed endpoint, CI/CD, observabilidade real, rate limiting).
  - Frontend Mobile ≈70% (ajustes API, autenticação Firebase completa, upload de mídia, testes UI/e2e, branding/builds).
  - Integração ≈50% (contratos de autenticação, ambientes alinhados, upload real, testes ponta-a-ponta, observabilidade compartilhada).
  - Seed/Dados ≈60% (enriquecimento pontos, relacionamentos, pipeline import/export Firestore).
- **Objetivo global**: manter agentes rodando enquanto o time está offline para levar o produto a "pronto para produção" com qualidade, dados e automação alinhados.

## 2. Como Funciona

### Abordagem: GitHub Copilot Coding Agent via Issues

O **Copilot CLI** (`@github/copilot`) **NÃO funciona em CI/CD** pois requer autenticação OAuth interativa.

A solução é usar o **GitHub Copilot Coding Agent**, que funciona assim:

1. **Workflow cria Issues** com label `copilot-agent` contendo prompts de desenvolvimento
2. **Você menciona `@github-copilot`** na issue (ou o Agent detecta automaticamente)
3. **Copilot Coding Agent** processa a issue e cria um PR com as alterações
4. **Você revisa e faz merge** do PR

### Pré-Requisitos

1. **Habilitar Copilot Coding Agent no repositório**:

   - Vá em: `Settings` → `Copilot` → `Coding Agent` → Habilitar
   - [Documentação oficial](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent)

2. **Permissões do workflow** (já configuradas):
   - `issues: write` para criar issues
   - `contents: read` para ler os prompts

## 3. Execução

### Execução Manual (Recomendado inicialmente)

```bash
# Dispara o workflow manualmente
gh workflow run copilot-agent-nightly.yml

# Ou com filtro para rodar apenas um prompt
gh workflow run copilot-agent-nightly.yml -f prompt_filter=backend
```

### Execução Automática

O workflow roda automaticamente às **02:00 UTC** todos os dias (configurável no cron).

### Após a Execução

1. Acesse as issues criadas com label `copilot-agent`
2. Se o Copilot não iniciar automaticamente, comente: `@github-copilot please implement this`
3. Aguarde o PR ser criado
4. Revise e faça merge

## 4. Guardrails Globais para o Agente

- **Commits atômicos** com prefixo descritivo
- **Testes obrigatórios**: PRs devem incluir testes
- **Sem secrets hardcoded**: usar variáveis de ambiente
- **Docs atualizados**: quando tocar backend/frontend/seed, atualizar READMEs

## 5. Estrutura de Prompts

Os prompts estão em `automation/prompts/`:

1. `backend-quality.md` - Testes JUnit, cobertura, rate limiting
2. `frontend-integration.md` - Firebase Auth, upload de mídia, testes
3. `seed-data.md` - Pipeline de dados, normalização, enriquecimento
4. `e2e-integration.md` - Testes ponta-a-ponta, contratos
5. `devops-observability.md` - CI/CD, métricas, alertas

## 6. Sequência Recomendada (Ciclo Semanal)

| Dia | Foco                   | Prompt               |
| --- | ---------------------- | -------------------- |
| Seg | Backend qualidade      | Backend Quality      |
| Ter | Seed/Dados             | Seed Data            |
| Qua | Frontend integração    | Frontend Integration |
| Qui | Integração/E2E         | E2E Integration      |
| Sex | DevOps/Observabilidade | DevOps Observability |

> Use o filtro `prompt_filter` para rodar apenas um prompt por vez:
>
> ```bash
> gh workflow run copilot-agent-nightly.yml -f prompt_filter=backend
> ```

## 7. Troubleshooting

### Issue criada mas Copilot não responde

- Verifique se o Copilot Coding Agent está habilitado
- Comente `@github-copilot` na issue para ativar manualmente

### Workflow falha ao criar issue

- Verifique se o label `copilot-agent` existe
- Verifique permissões do GITHUB_TOKEN

### Copilot cria PR com erros

- Faça review e solicite alterações via comentários
- Comente `@github-copilot please fix the failing tests`

## 8. Próximos Passos

1. ✅ Workflow criado em `.github/workflows/copilot-agent-nightly.yml`
2. ⏳ Habilitar Copilot Coding Agent nas configurações do repo
3. ⏳ Executar workflow manualmente para testar
4. ⏳ Monitorar issues e PRs criados

---

**Comando principal**: `copilot workspace agent --plan automation/agent-plan.md --apply`
