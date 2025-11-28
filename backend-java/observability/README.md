# 📊 Appunture Observability

Este diretório contém a configuração de observabilidade para o backend Appunture, incluindo métricas Prometheus, dashboards Grafana e regras de alertas.

## 📁 Estrutura

```
observability/
├── prometheus.yml              # Configuração do Prometheus
├── alert-rules.yml             # Regras de alertas
├── grafana-datasource.yml      # Datasource do Grafana (Prometheus)
├── grafana-dashboard-provisioning.yml  # Provisionamento de dashboards
├── grafana-dashboard.json      # Dashboard principal do backend
├── grafana-sync-dashboard.json # Dashboard de sincronização e storage
└── README.md                   # Este arquivo
```

## 🚀 Quick Start

### 1. Executar localmente com Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d prometheus grafana backend-java

# Acessar dashboards
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
```

### 2. Métricas Disponíveis

O backend expõe métricas via Spring Boot Actuator + Micrometer:

| Endpoint | Descrição |
|----------|-----------|
| `/actuator/prometheus` | Métricas no formato Prometheus |
| `/actuator/health` | Health check básico |
| `/actuator/health/liveness` | Liveness probe |
| `/actuator/health/readiness` | Readiness probe |
| `/actuator/metrics` | Lista de métricas disponíveis |

### 3. Principais Métricas Monitoradas

| Métrica | Descrição | Threshold |
|---------|-----------|-----------|
| `http_server_requests_seconds` | Latência de requisições HTTP | P95 < 1s |
| `http_server_requests_seconds_count{status=~"5.."}` | Taxa de erros 5xx | < 0.5 req/s |
| `app_rate_limit_rejections_total` | Rejeições por rate limiting | < 0.2 req/s |
| `jvm_memory_used_bytes` | Uso de memória JVM | < 80% do max |
| `process_cpu_usage` | Uso de CPU | < 80% |

## 📈 Dashboards

### Dashboard Principal (`grafana-dashboard.json`)

- **HTTP P95 Latency**: Latência percentil 95 das requisições
- **5xx Error Rate**: Taxa de erros de servidor
- **Rate Limit Rejections**: Rejeições por rate limiting
- **Requests per Endpoint**: Distribuição de requisições por endpoint

### Dashboard de Sync/Storage (`grafana-sync-dashboard.json`)

- **Auth Sync Operations**: Operações de sincronização de usuários
- **Storage Upload Latency**: Latência de uploads para Firebase Storage
- **Offline Queue Size**: Tamanho da fila de operações offline (mobile)
- **Sync Failures**: Taxa de falhas de sincronização

## 🚨 Alertas Configurados

### Críticos

| Alerta | Condição | Ação |
|--------|----------|------|
| `AppuntureErrorSpike` | 5xx > 0.5 req/s por 3min | Verificar logs, escalar instâncias |
| `HighOfflineQueueSize` | Fila offline > 10 por 5min | Verificar conectividade, processar fila |

### Warnings

| Alerta | Condição | Ação |
|--------|----------|------|
| `AppuntureHighLatencyP95` | P95 > 1s por 5min | Otimizar queries Firestore |
| `RateLimitRejections` | Rejeições > 0.2 req/s por 2min | Aumentar capacidade ou investigar abuso |
| `StorageUploadSlow` | Upload > 5s por 3min | Verificar rede, redimensionar imagens |

## 📋 Runbook de Operações

> **Nota:** Nos comandos abaixo, substitua `PROJECT_ID` pelo ID real do seu projeto GCP (ex: `appunture-tcc`) e `XXXXX` pelo hash gerado pelo Cloud Run.

### Deploy Manual do Backend

```bash
# 1. Defina seu PROJECT_ID (substitua pelo seu ID real)
export PROJECT_ID=seu-projeto-gcp

# 2. Build da imagem
cd backend-java
docker build -t gcr.io/$PROJECT_ID/appunture-backend:latest .

# 3. Push para Container Registry
docker push gcr.io/$PROJECT_ID/appunture-backend:latest

# 4. Deploy no Cloud Run
gcloud run deploy appunture-backend \
  --image gcr.io/$PROJECT_ID/appunture-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# 5. Verificar saúde (substitua XXXXX pelo hash do seu serviço)
curl https://appunture-backend-XXXXX.run.app/health
```

### Rollback de Emergência

```bash
# 1. Listar revisões disponíveis
gcloud run revisions list --service appunture-backend --region us-central1

# 2. Redirecionar tráfego para revisão anterior
gcloud run services update-traffic appunture-backend \
  --to-revisions=appunture-backend-XXXXXX=100 \
  --region us-central1

# 3. Verificar rollback
curl https://appunture-backend-XXXXX.run.app/health
curl https://appunture-backend-XXXXX.run.app/actuator/info
```

### Investigação de Incidentes

#### Alta Latência (P95 > 1s)

1. **Verificar métricas por endpoint**:
   ```promql
   histogram_quantile(0.95, 
     sum(rate(http_server_requests_seconds_bucket{application="appunture-backend"}[5m])) by (le, uri)
   )
   ```

2. **Identificar endpoints lentos**:
   - `/points/search` → Verificar índices Firestore
   - `/auth/sync` → Verificar consultas de usuário
   - `/storage/upload` → Verificar tamanho de arquivos

3. **Ações**:
   - Criar índices compostos no Firestore
   - Aumentar CPU/memória do Cloud Run
   - Implementar cache para consultas frequentes

#### Taxa de Erros 5xx Alta

1. **Verificar logs estruturados**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND severity>=ERROR' \
     --project=PROJECT_ID --limit=50
   ```

2. **Identificar padrões**:
   - Erros de autenticação Firebase → Verificar configuração
   - Erros Firestore → Verificar quotas e permissões
   - Erros de memória → Aumentar recursos

3. **Ações corretivas**:
   - Reiniciar instâncias: `gcloud run services update appunture-backend --clear-revision`
   - Escalar: `gcloud run services update appunture-backend --max-instances=20`

#### Fila Offline Crescendo (Mobile)

1. **Verificar status de conectividade**:
   - App está online? Verificar NetInfo
   - Backend está acessível? Ping `/health`

2. **Processar fila manualmente**:
   - Usuário: Abrir tela de Sync Status
   - Clicar em "Sincronizar Agora"

3. **Limpar operações falhadas**:
   - Abrir `/sync-status`
   - Revisar erros
   - Tentar novamente ou limpar

### Manutenção Programada

#### Atualização de Dependências

```bash
# Backend
cd backend-java
./mvnw versions:display-dependency-updates

# Frontend
cd frontend-mobile/appunture
npm outdated
```

#### Renovação de Tokens/Secrets

1. **Firebase Service Account**:
   - Gerar nova chave no Console Firebase
   - Atualizar secret no GitHub Actions
   - Atualizar secret no Cloud Run

2. **Expo Token**:
   - Gerar novo token em expo.dev
   - Atualizar `EXPO_TOKEN` no GitHub Secrets

### Monitoramento Contínuo

#### Verificações Diárias

- [ ] Dashboard Grafana sem alertas
- [ ] Logs sem erros críticos
- [ ] Métricas de latência dentro do SLO
- [ ] Fila de sync mobile < 5 itens

#### Verificações Semanais

- [ ] Revisão de usage do Firebase (quotas)
- [ ] Análise de tendências de erros
- [ ] Backup do Firestore
- [ ] Atualização de dependências de segurança

## 🔧 Configuração Cloud Monitoring (GCP)

Para usar Cloud Monitoring ao invés de Prometheus/Grafana:

### 1. Habilitar APIs

```bash
gcloud services enable monitoring.googleapis.com cloudprofiler.googleapis.com
```

### 2. Configurar Alertas no Console

1. Acesse Cloud Monitoring → Alerting → Create Policy
2. Configure condições baseadas nas métricas descritas acima
3. Configure notificações (email, Slack, PagerDuty)

### 3. Métricas Customizadas

O backend exporta métricas customizadas via Micrometer que são automaticamente coletadas pelo Cloud Monitoring quando executando no Cloud Run.

## 📱 Observabilidade Mobile

O app mobile pode reportar métricas de sincronização e erros via:

1. **Sentry** (recomendado): Captura erros e performance
2. **Expo/Segment**: Analytics e eventos customizados
3. **Custom logging**: Logs estruturados enviados ao backend

### Configuração Sentry (Opcional)

```typescript
// app.json
{
  "expo": {
    "plugins": ["sentry-expo"],
    "hooks": {
      "postPublish": [{
        "file": "sentry-expo/upload-sourcemaps"
      }]
    }
  }
}
```

### Métricas Mobile Recomendadas

| Evento | Descrição |
|--------|-----------|
| `sync_started` | Início de sincronização |
| `sync_completed` | Sincronização bem-sucedida |
| `sync_failed` | Falha de sincronização (com erro) |
| `upload_started` | Início de upload de imagem |
| `upload_completed` | Upload concluído |
| `offline_queue_size` | Tamanho da fila offline |

## 🔗 Links Úteis

- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Micrometer Prometheus](https://micrometer.io/docs/registry/prometheus)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Cloud Run Monitoring](https://cloud.google.com/run/docs/monitoring)
- [Firebase Quotas](https://firebase.google.com/docs/firestore/quotas)
