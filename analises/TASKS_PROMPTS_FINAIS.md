# Tasks com Prompts para Finalizar o App – 27/11/2025

Cada item abaixo descreve uma tarefa crítica, acompanhada de um prompt sugerido para ser usado com assistentes de IA ou na abertura de issues. Ajuste detalhes específicos (branch, responsável, datas) conforme o contexto do time.

## 1. Backend – Qualidade, Segurança e Deploy

### Tarefa 1 – Aumentar cobertura de testes e configurar Firestore Emulator

**Objetivo**: Cobertura >80% em services/controllers, validando autenticação Firebase e Firestore.
**Prompt sugerido**:

```
Preciso ampliar os testes automatizados do backend Spring Boot. Gere testes unitários e de integração para os serviços Firestore (User, Point, Symptom) usando Firestore Emulator/local mocks, garantindo cobertura acima de 80%. Inclua testes para SecurityConfig (filtros Firebase) e controllers principais. Mostre como rodar os testes com Maven.
```

### Tarefa 2 – Implementar rate limiting, auditoria e logs estruturados

**Prompt**:

```
Implemente rate limiting por IP/UID usando Bucket4j ou Spring RateLimiter nos endpoints /auth/** e /admin/**, registrando violações em logs estruturados. Adicione auditoria centralizada (controller advice + logger) para mudanças de dados críticos. Atualize README com instruções de configuração.
```

### Tarefa 3 – Pipeline CI/CD para Cloud Run

**Prompt**:

```
Crie workflow GitHub Actions que rode mvn verify, gere imagem Docker, publique no Artifact Registry e faça deploy no Cloud Run (ambiente dev e prod). Inclua etapas para rodar testes, validar seed e executar smoke test (/health). Documente variáveis necessárias.
```

## 2. Frontend Mobile – Integração e UX

### Tarefa 4 – Ajustar API_BASE_URL e remover endpoints legados

**Prompt**:

```
No app Expo, atualize utils/constants.ts para usar EXPO_PUBLIC_API_BASE_URL (fallback http://localhost:8080/api). Remova métodos /auth/login e /auth/register em services/api.ts, usando apenas Firebase Auth + /auth/sync. Garanta que hooks/stores reflitam essa mudança e adicione testes unitários.
```

### Tarefa 5 – Implementar upload real de imagens no syncStore

**Prompt**:

```
Complete o TODO em stores/syncStore.ts para fazer upload real de imagens. Utilize firebaseStorage (putFile/putString) ou o endpoint /storage/upload do backend. Trate backoff, atualize databaseService para salvar URLs retornadas e cubra com testes Jest simulando falhas e sucesso.
```

### Tarefa 6 – Preparar builds EAS + branding

**Prompt**:

```
Configure app.json/eas.json com pacote definitivo (bundleId, androidPackage), ícones, splash screen e permissões. Crie scripts para `eas build --profile preview` e `--profile production`, incluindo setup das variáveis Firebase. Documente passos de assinatura Android/iOS.
```

## 3. Integração & QA

### Tarefa 7 – Coleção Postman/Newman + Detox smoke test

**Prompt**:

```
Monte uma coleção Postman cobrindo login Firebase (token), /auth/sync, /points/search, /symptoms. Crie pipeline Newman para rodar após deploy. Em paralelo, configure Detox smoke test (login → listar pontos → abrir mapa) integrado ao CI.
```

### Tarefa 8 – Observabilidade compartilhada

**Prompt**:

```
Provisionar dashboards Grafana/Cloud Monitoring exibindo métricas do backend (latência, erro 5xx) e contadores enviados pelo app (sync pendente, uploads). Expor endpoint /health/detailed com status de dependências e integrar alertas (error_rate>2%, latency>500ms).
```

## 4. Seed/Dados

### Tarefa 9 – Finalizar pontos e relacionamentos

**Prompt**:

```
Execute tools/normalize_points.py para gerar novo points_review.csv. Aplique scripts update_*.py, complete campos faltantes (descrição, localização, funções) e preencha bodyMapCoords/coordinates. Valide com validate_points_review.py e gere points_seed.(json|ndjson).
```

### Tarefa 10 – Criar seed de sintomas/categorias e automatizar import

**Prompt**:

```
Produza arquivos symptoms_seed.json e categories_seed.json a partir das planilhas em tables/. Atualize backend para aceitar upload via /admin/data/seed e documente comando gcloud firestore import para pontos, sintomas e relacionamentos. Crie script único (PowerShell) que roda normalize → update scripts → validate → export → import.
```

## 5. Go-Live

### Tarefa 11 – Checklist final e rollback plan

**Prompt**:

```
Monte checklist de lançamento com: validação de dados (points/symptoms), execução CI/CD, builds mobile assinados, testes manuais críticos, monitoramento ativo e plano de rollback (Cloud Run revisions + revert mobile). Documente responsáveis e tempos de resposta.
```
