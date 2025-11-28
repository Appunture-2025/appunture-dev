# Workflow Blueprint – Copilot Agent Nightly

## Objetivo

Automatizar a execução diária do `copilot workspace agent` usando GitHub Actions para aplicar o plano `automation/agent-plan.md`.

## Cronograma sugerido

- Frequência: diária às 02:00 UTC (antes do horário comercial no Brasil).
- Branch de trabalho: `automation/copilot-agent` (criada automaticamente se não existir).

## Estrutura do workflow (`.github/workflows/copilot-agent-nightly.yml`)

```yaml
name: Copilot Agent Nightly

on:
  schedule:
    - cron: "0 2 * * *"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  run-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Copilot Workspace CLI
        run: npm install -g @githubnext/copilot-workspace-cli

      - name: Authenticate Copilot Workspace
        env:
          COPILOT_WORKSPACE_TOKEN: ${{ secrets.COPILOT_WORKSPACE_TOKEN }}
        run: copilot workspace auth login --token "$COPILOT_WORKSPACE_TOKEN"

      - name: Configure Git user
        run: |
          git config user.name "copilot-agent"
          git config user.email "copilot-agent@users.noreply.github.com"

      - name: Run Copilot Agent
        env:
          COPILOT_WORKSPACE_TOKEN: ${{ secrets.COPILOT_WORKSPACE_TOKEN }}
          COPILOT_WORKSPACE_BRANCH: automation/copilot-agent
        run: copilot workspace agent --plan automation/agent-plan.md --apply

      - name: Upload logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: copilot-agent-logs
          path: ~/.config/copilot-workspace/logs
```

## Considerações adicionais

- Definir secrets necessários no repositório: `COPILOT_WORKSPACE_TOKEN`, `GCP_SERVICE_ACCOUNT`, `EAS_TOKEN`, etc.
- Habilitar branch protection para `main`; merges feitos via PR criado pelo agente.
- Adicionar etapa opcional de notificação (Slack/Teams) com status do workflow.

## Checklist para ativação

1. Criar arquivo real em `.github/workflows/copilot-agent-nightly.yml` baseado no blueprint acima.
2. Definir secrets no GitHub.
3. Testar `workflow_dispatch` manual antes de ativar cron.
4. Monitorar primeiras execuções e ajustar prompts conforme necessário.
