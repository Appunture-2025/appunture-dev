#!/bin/bash
# Script de deploy Appunture Backend para Cloud Run (Firebase + Firestore)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Deploy Appunture Backend para Cloud Run (Firebase + Firestore)${NC}"

# Verificar se está logado no gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Você precisa estar logado no gcloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

# Obter PROJECT_ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ PROJECT_ID não configurado${NC}"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}📋 Projeto: $PROJECT_ID${NC}"

# Habilitar APIs necessárias
echo -e "${YELLOW}🔧 Habilitando APIs necessárias...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    container.googleapis.com \
    firebase.googleapis.com \
    firestore.googleapis.com

echo -e "${GREEN}✅ APIs habilitadas${NC}"

# Verificar se Firebase/Firestore está configurado
echo -e "${YELLOW}🔥 Verificando configuração Firebase...${NC}"
if ! gcloud alpha firestore databases describe --database="(default)" --quiet 2>/dev/null; then
    echo -e "${YELLOW}📊 Criando banco Firestore...${NC}"
    gcloud alpha firestore databases create --region=us-central1 --database="(default)"
    echo -e "${GREEN}✅ Firestore criado${NC}"
else
    echo -e "${GREEN}✅ Firestore já configurado${NC}"
fi

# Build e Deploy
echo -e "${YELLOW}🔨 Iniciando build...${NC}"
gcloud builds submit --config cloudbuild.yaml ../

echo -e "${YELLOW}🌐 Obtendo URL do serviço...${NC}"
SERVICE_URL=$(gcloud run services describe appunture-backend --region=us-central1 --format="value(status.url)")

echo -e "${GREEN}🎉 Deploy concluído!${NC}"
echo -e "${GREEN}📱 Backend URL: $SERVICE_URL${NC}"
echo -e "${GREEN}📊 Swagger UI: $SERVICE_URL/api/swagger-ui/index.html${NC}"
echo -e "${GREEN}🔥 Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore${NC}"

# Configurar domínio customizado (opcional)
read -p "Deseja configurar domínio customizado? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Digite o domínio (ex: api.meuapp.com): " DOMAIN
    gcloud run domain-mappings create \
        --service appunture-backend \
        --domain $DOMAIN \
        --region us-central1
    echo -e "${GREEN}✅ Domínio configurado: https://$DOMAIN${NC}"
fi

echo -e "${GREEN}💰 Custos TCC: R$ 0,00 (Firebase + Firestore + Cloud Run gratuitos!)${NC}"