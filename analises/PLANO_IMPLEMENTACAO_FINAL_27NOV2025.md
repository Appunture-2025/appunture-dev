# Plano Integrado de Finalização – 27/11/2025

## 1. Resumo Consolidado

| Pilar           | % Concluído | Fonte de Referência                        | Principais Lacunas                                                                                           |
| --------------- | ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Backend Java    | 85%         | `analises/ANALISE_BACKEND_27NOV2025.md`    | Cobertura de testes, seed endpoint, CI/CD, observabilidade real, rate limit/logs.                            |
| Frontend Mobile | 70%         | `analises/ANALISE_FRONTEND_27NOV2025.md`   | Ajustar API base, autenticação via Firebase, upload de mídia, testes UI/e2e, branding/builds.                |
| Integração      | 50%         | `analises/ANALISE_INTEGRACAO_27NOV2025.md` | Contratos login/sync, ambientes alinhados, upload real, testes ponta-a-ponta, observabilidade compartilhada. |
| Seed/Dados      | 60%         | `analises/ANALISE_SEED_27NOV2025.md`       | Enriquecimento de pontos, relacionamentos, seed de sintomas, pipeline de import, versionamento.              |

> **Status global**: média ponderada ≈ **66% entregue**, restando **34%** para declarar o app pronto para produção.

## 2. O Que Falta (visão agrupada)

1. **Qualidade & Segurança Backend** – aumentar testes (>80%), configurar rate limiting/logs de auditoria, automatizar deploy Cloud Run.
2. **Convergência Mobile ↔ Backend** – eliminar `/auth/login|register`, usar `firebaseAuth` + `/auth/sync`, apontar `API_BASE_URL` correto, concluir upload Firebase Storage.
3. **Dados Canônicos** – finalizar curadoria `points_review.csv`, produzir seed de sintomas/categorias, mapear `symptomIds` e coordenadas para body map.
4. **DevOps Integrado** – pipeline que execute testes (mvn + npm + jest), gere seed, rode integração (Postman/Detox) e faça deploy automatizado.
5. **Lançamento Mobile** – assets, versões EAS, builds Android/iOS, checklist de loja + monitoramento.

## 3. Plano de Execução (2 sprints)

### Sprint 1 (Semana 1)

- **Backend**: ampliar testes services/controllers, configurar GitHub Actions (build + test + docker push + deploy Cloud Run), habilitar rate limit/log auditing.
- **Seed**: rodar `normalize_points.py`, scripts `update_*.py`, preencher campos faltantes e validar; gerar `points_seed.ndjson` + guia de import.
- **Integração**: atualizar mobile para usar Firebase Auth-only, ajustar `API_BASE_URL`/CORS, criar coleção Postman e smoke test.

### Sprint 2 (Semana 2)

- **Frontend**: implementar upload real (Firebase Storage ou `/storage/upload`), finalizar UI/branding, adicionar testes UI/Detox e cobertura mínima.
- **Seed adicional**: produzir `symptoms_seed.*`, relacionar `symptomIds`, testar endpoint `/admin/data/seed` com dataset.
- **Operação**: montar observabilidade (Grafana/Cloud Monitoring + logs mobile) e checklists de lançamento (rollout EAS, monitoring, suporte).

## 4. Checklist para Subida à Produção

1. **Dados**: importar pontos + sintomas > validar via `/points` e `/symptoms`; snapshot do Firestore exportado.
2. **Backend**: execução bem-sucedida do pipeline CI/CD + smoke tests (`/health`, `/auth/profile`, `/points/search`).
3. **Mobile**: build Release (Android .aab, iOS .ipa), testes manuais (login Firebase, sync offline, upload imagem), publicação ou entrega via Expo Updates.
4. **Integração**: collection Postman + Detox rodando no CI com ambiente homolog.
5. **Observabilidade**: dashboards + alertas (erro 5xx>2%, latência>500ms, fila sync > 10 itens). Documentar no `README` e `STATUS_FINAL_MIGRACAO`.
6. **Go-Live**: plano de rollback, owners por área, comunicação com stakeholders.

## 5. Próximos Passos Prioritários

1. **Hoje**: ajustar `frontend-mobile/appunture/utils/constants.ts` e remover endpoints inexistentes em `services/api.ts`.
2. **Amanhã**: rodar `tools/normalize_points.py + validate_points_review.py` e subir PR apenas com dados.
3. **Até o fim da semana**: configurar GitHub Actions (backend + frontend + seed) e disponibilizar ambiente Cloud Run + URL final para squads.

Com essas entregas, o projeto alcança alinhamento completo entre backend, frontend e dados, abrindo caminho para homologação e lançamento em produção.
