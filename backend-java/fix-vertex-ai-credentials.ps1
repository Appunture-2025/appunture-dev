# Script para corrigir credenciais do Vertex AI no Cloud Run
# Usa Application Default Credentials (ADC) ao invés de GOOGLE_APPLICATION_CREDENTIALS

Write-Host "🔧 Corrigindo configuração do Vertex AI no Cloud Run..." -ForegroundColor Cyan

$PROJECT_ID = "appunture-tcc"
$REGION = "us-central1"
$SERVICE_NAME = "appunture-backend"
$SERVICE_ACCOUNT = "756244484248-compute@developer.gserviceaccount.com"

# 1. Verificar permissões do service account
Write-Host "`n✅ Passo 1: Verificando permissões do service account..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/aiplatform.user" `
  --condition=None

# 2. Atualizar Cloud Run para usar ADC (remover GOOGLE_APPLICATION_CREDENTIALS)
Write-Host "`n✅ Passo 2: Atualizando Cloud Run para usar ADC..." -ForegroundColor Yellow
gcloud run services update $SERVICE_NAME `
  --region=$REGION `
  --service-account=$SERVICE_ACCOUNT `
  --update-env-vars=GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION `
  --remove-env-vars=GOOGLE_APPLICATION_CREDENTIALS

Write-Host "`n✅ Configuração concluída!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Aguardar 30-60 segundos para o Cloud Run reiniciar"
Write-Host "2. Testar o endpoint: POST /api/chat"
Write-Host "3. Verificar logs: gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50"
Write-Host "`n🔍 Verificar se não há mais erros de GOOGLE_APPLICATION_CREDENTIALS nos logs" -ForegroundColor Yellow
