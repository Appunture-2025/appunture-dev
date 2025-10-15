# 🔧 Configuração do Ambiente - Appunture Backend

## 📋 Arquivo: .env.example

Copie este arquivo para `.env` e preencha com suas configurações:

```bash
# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-project-id.appspot.com

# Server Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# Logging Configuration
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_APPUNTURE=DEBUG

# Optional: Database URL for development
# (Firestore é usado por padrão)
```

## 🛠️ Setup Completo

### 1. Configuração Firebase

1. **Criar Projeto Firebase**:
   - Acesse [Firebase Console](https://console.firebase.google.com)
   - Clique em "Add project"
   - Nome do projeto: `appunture-tcc` (ou similar)
   - Desabilite Google Analytics (opcional para TCC)

2. **Habilitar Serviços**:
   ```bash
   # No Firebase Console:
   # - Authentication > Get started > Sign-in method > Email/Password (Enable)
   # - Firestore Database > Create database > Start in test mode
   # - Storage > Get started > Start in test mode
   ```

3. **Gerar Service Account**:
   - Project Settings > Service accounts
   - "Generate new private key"
   - Salvar como `service-account-key.json`
   - **NUNCA** commit este arquivo!

### 2. Configuração Local

```bash
# 1. Clone e navegue para o diretório
cd backend-java

# 2. Copie o arquivo de configuração
cp .env.example .env

# 3. Edite o .env com suas configurações
nano .env

# 4. Coloque o service account na pasta config
mkdir -p src/main/resources/config
cp /path/to/service-account-key.json src/main/resources/config/

# 5. Atualize o .env com o caminho correto
echo "GOOGLE_APPLICATION_CREDENTIALS=src/main/resources/config/service-account-key.json" >> .env
```

### 3. Configuração do Firestore

#### Regras de Segurança (Firebase Console > Firestore > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pontos são públicos para leitura, apenas admins podem escrever
    match /points/{pointId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'ADMIN';
    }
    
    // Sintomas são públicos para leitura, apenas admins podem escrever
    match /symptoms/{symptomId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'ADMIN';
    }
    
    // Favoritos do usuário
    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Índices Compostos (Firebase Console > Firestore > Indexes):

```json
[
  {
    "collectionGroup": "points",
    "queryScope": "COLLECTION",
    "fields": [
      {"fieldPath": "category", "order": "ASCENDING"},
      {"fieldPath": "usageCount", "order": "DESCENDING"}
    ]
  },
  {
    "collectionGroup": "symptoms",
    "queryScope": "COLLECTION", 
    "fields": [
      {"fieldPath": "category", "order": "ASCENDING"},
      {"fieldPath": "usageCount", "order": "DESCENDING"}
    ]
  },
  {
    "collectionGroup": "points",
    "queryScope": "COLLECTION",
    "fields": [
      {"fieldPath": "tags", "arrayConfig": "CONTAINS"},
      {"fieldPath": "usageCount", "order": "DESCENDING"}
    ]
  }
]
```

### 4. Configuração do Storage

#### Regras de Segurança (Firebase Console > Storage > Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imagens de perfil
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imagens de pontos (apenas admins)
    match /point-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'ADMIN';
    }
    
    // Uploads temporários
    match /temp-uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Scripts de Desenvolvimento

### start-dev.sh
```bash
#!/bin/bash
# Script para iniciar desenvolvimento local

echo "🚀 Iniciando Appunture Backend..."

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Java 17+ não encontrado!"
    exit 1
fi

# Verificar Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven não encontrado!"
    exit 1
fi

# Verificar configurações
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📋 Copie .env.example para .env e configure"
    exit 1
fi

# Carregar variáveis de ambiente
source .env

# Verificar service account
if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Service account não encontrado em: $GOOGLE_APPLICATION_CREDENTIALS"
    exit 1
fi

echo "✅ Configurações OK!"
echo "🔧 Compilando aplicação..."

# Build
mvn clean compile

echo "🎯 Iniciando servidor..."
mvn spring-boot:run
```

### build-docker.sh
```bash
#!/bin/bash
# Script para build Docker

echo "🐳 Building Docker image..."

# Build da aplicação
mvn clean package -DskipTests

# Build da imagem
docker build -t appunture-backend:latest .

echo "✅ Docker image criada: appunture-backend:latest"
echo "🚀 Para executar: docker run -p 8080:8080 appunture-backend:latest"
```

### deploy-cloud-run.sh
```bash
#!/bin/bash
# Script para deploy no Cloud Run

echo "☁️ Deploy para Google Cloud Run..."

# Verificar gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não encontrado!"
    exit 1
fi

# Configurações
PROJECT_ID=${FIREBASE_PROJECT_ID}
SERVICE_NAME="appunture-backend"
REGION="us-central1"

# Build e push para Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy no Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="FIREBASE_PROJECT_ID=$PROJECT_ID" \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10

echo "✅ Deploy concluído!"
```

## 🧪 Configuração de Testes

### test-local.sh
```bash
#!/bin/bash
# Script para testes locais

echo "🧪 Executando testes..."

# Verificar se Firebase Emulator está disponível
if command -v firebase &> /dev/null; then
    echo "🔥 Iniciando Firebase Emulators..."
    firebase emulators:start --only firestore,auth &
    EMULATOR_PID=$!
    sleep 5
    
    # Executar testes com emulator
    FIRESTORE_EMULATOR_HOST=localhost:8080 \
    FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
    mvn test
    
    # Parar emulators
    kill $EMULATOR_PID
else
    echo "⚠️  Firebase CLI não encontrado, executando testes sem emulator"
    mvn test
fi
```

## 📊 Monitoramento

### health-check.sh
```bash
#!/bin/bash
# Script para verificar saúde da aplicação

BASE_URL=${1:-"http://localhost:8080"}

echo "🏥 Verificando saúde da aplicação em $BASE_URL"

# Health check básico
echo "📍 Basic health..."
curl -s "$BASE_URL/health" | jq .

# Health check detalhado
echo "📍 Detailed health..."
curl -s "$BASE_URL/health/detailed" | jq .

# Métricas
echo "📍 Metrics..."
curl -s "$BASE_URL/health/metrics" | jq .
```

## 🔧 Utilitários

### create-admin.sh
```bash
#!/bin/bash
# Script para criar usuário admin inicial

EMAIL=${1:-"admin@appunture.com"}
PASSWORD=${2:-"AdminPass123!"}
NAME=${3:-"Admin Appunture"}

echo "👨‍💼 Criando usuário admin..."

curl -X POST "http://localhost:8080/admin/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }" | jq .
```

### backup-firestore.sh
```bash
#!/bin/bash
# Script para backup do Firestore

PROJECT_ID=${FIREBASE_PROJECT_ID}
BUCKET_NAME="${PROJECT_ID}-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "💾 Iniciando backup do Firestore..."

gcloud firestore export gs://$BUCKET_NAME/backups/$TIMESTAMP \
  --project=$PROJECT_ID

echo "✅ Backup salvo em: gs://$BUCKET_NAME/backups/$TIMESTAMP"
```

---

**💡 Dica**: Torne os scripts executáveis com `chmod +x *.sh`