#!/bin/bash
# =============================================================================
# Appunture Backend - Production Deployment Script
# =============================================================================
# Este script faz o deploy do backend para o Google Cloud Run
# 
# Pré-requisitos:
# 1. gcloud CLI instalado e configurado
# 2. Docker instalado
# 3. Projeto GCP configurado: appunture-tcc
# 4. Secret Manager com firebase-service-account configurado
#
# Uso: ./deploy-prod.sh
# =============================================================================

set -e

# Configurações
PROJECT_ID="appunture-tcc"
REGION="us-central1"
SERVICE_NAME="appunture-backend"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/appunture-backend/backend"

echo "=========================================="
echo "Appunture Backend - Production Deployment"
echo "=========================================="
echo ""
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Service: ${SERVICE_NAME}"
echo ""

# Verificar se está logado no gcloud
echo "1. Verificando autenticação GCP..."
gcloud auth print-identity-token > /dev/null 2>&1 || {
    echo "Erro: Não autenticado no gcloud. Execute: gcloud auth login"
    exit 1
}

# Configurar projeto
echo "2. Configurando projeto GCP..."
gcloud config set project ${PROJECT_ID}

# Build da imagem Docker
echo "3. Construindo imagem Docker..."
TIMESTAMP=$(date +%Y%m%d%H%M%S)
docker build -t ${IMAGE_NAME}:${TIMESTAMP} -t ${IMAGE_NAME}:latest .

# Push para Artifact Registry
echo "4. Enviando imagem para Artifact Registry..."
docker push ${IMAGE_NAME}:${TIMESTAMP}
docker push ${IMAGE_NAME}:latest

# Deploy no Cloud Run
echo "5. Fazendo deploy no Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:${TIMESTAMP} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --concurrency 80 \
    --max-instances 10 \
    --min-instances 0 \
    --port 8080 \
    --set-env-vars "SPRING_PROFILES_ACTIVE=prod,GOOGLE_CLOUD_PROJECT=${PROJECT_ID},FIREBASE_PROJECT_ID=${PROJECT_ID},FIREBASE_ENABLED=true,FIREBASE_STORAGE_BUCKET=${PROJECT_ID}.firebasestorage.app" \
    --set-secrets "GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest"

echo ""
echo "=========================================="
echo "Deploy concluído com sucesso!"
echo "=========================================="
echo ""
echo "URL do serviço:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
echo ""
