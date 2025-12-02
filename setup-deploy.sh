#!/bin/bash
# =============================================================================
# Appunture - Script de Setup para Deploy
# =============================================================================
# Execute: ./setup-deploy.sh
# 
# Este script ajuda a configurar o ambiente para deploy.
# Você ainda precisará preencher os valores manualmente.

set -e

echo "🚀 Appunture - Setup de Deploy"
echo "=============================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar ferramentas instaladas
echo "📋 Verificando ferramentas instaladas..."

check_tool() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

check_tool "gcloud" || echo "  Instale: https://cloud.google.com/sdk/docs/install"
check_tool "node" || echo "  Instale: https://nodejs.org/"
check_tool "npm" || echo "  Instale junto com node"
check_tool "gh" || echo "  Instale: https://cli.github.com/"

echo ""

# Verificar EAS CLI
if command -v eas &> /dev/null; then
    echo -e "${GREEN}✓${NC} eas-cli instalado"
else
    echo -e "${YELLOW}!${NC} eas-cli não encontrado. Instalando..."
    npm install -g eas-cli
fi

echo ""

# Solicitar informações do projeto
echo "📝 Configuração do Projeto"
echo "--------------------------"

read -p "Project ID do Firebase/GCP [appunture-tcc]: " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-appunture-tcc}

read -p "Região do Cloud Run [us-central1]: " REGION
REGION=${REGION:-us-central1}

read -p "Seu username do Expo: " EXPO_USERNAME

echo ""
echo "📄 Configurações informadas:"
echo "  - Project ID: $PROJECT_ID"
echo "  - Região: $REGION"
echo "  - Expo Username: $EXPO_USERNAME"
echo ""

read -p "Continuar com estas configurações? (y/n): " CONFIRM
if [[ $CONFIRM != "y" ]]; then
    echo "Cancelado."
    exit 1
fi

echo ""
echo "☁️ Configurando Google Cloud..."
echo "--------------------------------"

# Login no gcloud (se necessário)
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "Fazendo login no Google Cloud..."
    gcloud auth login
fi

# Selecionar projeto
gcloud config set project $PROJECT_ID

# Habilitar APIs
echo "Habilitando APIs necessárias..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    aiplatform.googleapis.com \
    2>/dev/null || true

echo -e "${GREEN}✓${NC} APIs habilitadas"

echo ""
echo "📱 Configurando arquivos do Frontend..."
echo "---------------------------------------"

# Criar .env se não existir
ENV_FILE="frontend-mobile/appunture/.env"
if [[ ! -f $ENV_FILE ]]; then
    cp frontend-mobile/appunture/.env.example $ENV_FILE
    echo -e "${GREEN}✓${NC} Arquivo .env criado"
    echo -e "${YELLOW}!${NC} Edite $ENV_FILE com suas credenciais do Firebase"
else
    echo -e "${YELLOW}!${NC} Arquivo .env já existe"
fi

echo ""
echo "🔐 Próximos passos manuais:"
echo "=========================="
echo ""
echo "1. Configure o Firebase Console:"
echo "   - Crie o projeto em: https://console.firebase.google.com"
echo "   - Habilite Authentication (Email/Password + Google)"
echo "   - Crie o Firestore Database"
echo "   - Gere o Service Account JSON"
echo ""
echo "2. Configure os OAuth Client IDs:"
echo "   - Acesse: https://console.cloud.google.com/apis/credentials"
echo "   - Crie OAuth Client ID para Web"
echo "   - Adicione redirect URI: https://auth.expo.io/@${EXPO_USERNAME}/appunture"
echo ""
echo "3. Preencha o arquivo .env:"
echo "   code frontend-mobile/appunture/.env"
echo ""
echo "4. Configure o Service Account no Secret Manager:"
echo "   gcloud secrets create firebase-service-account --data-file=/path/to/service-account.json"
echo ""
echo "5. Configure os GitHub Secrets:"
echo "   gh secret set GCP_PROJECT_ID --body \"$PROJECT_ID\""
echo "   gh secret set EXPO_TOKEN --body \"SEU_TOKEN\""
echo "   gh secret set GCP_SERVICE_ACCOUNT < /path/to/service-account.json"
echo ""
echo "6. Faça o deploy do backend:"
echo "   cd backend-java"
echo "   gcloud builds submit --tag gcr.io/$PROJECT_ID/appunture-backend"
echo "   gcloud run deploy appunture-backend --image gcr.io/$PROJECT_ID/appunture-backend --region $REGION"
echo ""
echo "7. Atualize a URL no eas.json e .env com a URL do Cloud Run"
echo ""
echo "8. Faça o build do APK:"
echo "   cd frontend-mobile/appunture"
echo "   eas build --platform android --profile preview"
echo ""
echo -e "${GREEN}✅ Setup inicial concluído!${NC}"
echo ""
echo "📖 Consulte DEPLOY_CHECKLIST.md para o passo a passo completo."
