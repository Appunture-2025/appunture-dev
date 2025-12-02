# 🚀 Guia de Deploy - Appunture

> Guia completo para configurar e fazer deploy do aplicativo Appunture (Atlas Digital Educativo de Acupuntura).

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Firebase](#2-configuração-do-firebase)
3. [Configuração do Google Cloud](#3-configuração-do-google-cloud)
4. [Configuração do Vertex AI (Gemini)](#4-configuração-do-vertex-ai-gemini)
5. [Secrets do GitHub](#5-secrets-do-github)
6. [Deploy do Backend](#6-deploy-do-backend)
7. [Build do App Android](#7-build-do-app-android)
8. [Comunicação App ↔ API](#8-comunicação-app--api)
9. [Verificação Final](#9-verificação-final)
10. [Custos Detalhados](#10-custos-detalhados)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Pré-requisitos

### 1.1 Contas Necessárias

| Conta                 | URL                                                                | Obrigatório        |
| --------------------- | ------------------------------------------------------------------ | ------------------ |
| Google Cloud Platform | [console.cloud.google.com](https://console.cloud.google.com)       | ✅ Sim             |
| Firebase              | [console.firebase.google.com](https://console.firebase.google.com) | ✅ Sim             |
| Expo                  | [expo.dev](https://expo.dev)                                       | ✅ Sim (grátis)    |
| Google Play Console   | [play.google.com/console](https://play.google.com/console)         | ⚠️ Para publicação |

> 💡 **Dica**: O Google Cloud oferece **$300 de crédito grátis** para novos usuários (90 dias).

### 1.2 Ferramentas Locais

```bash
# Node.js 20+ (verificar versão)
node --version   # Esperado: v20.x.x ou superior

# Java 17+ (verificar versão)
java --version   # Esperado: openjdk 17.x.x ou superior

# Google Cloud CLI
gcloud --version # Se não tiver, instale: https://cloud.google.com/sdk/docs/install

# EAS CLI (Expo Application Services)
npm install -g eas-cli
eas --version    # Esperado: 5.x.x ou superior

# Firebase CLI (opcional, mas útil)
npm install -g firebase-tools
firebase --version
```

### 1.3 Estrutura do Projeto

```
appunture-dev/
├── backend-java/           # API REST (Spring Boot 3.2)
├── frontend-mobile/        # App Android (React Native + Expo)
│   └── appunture/
├── data/                   # Dados para seed do banco
│   └── processed/
│       └── 2025-11-28/
│           ├── points_seed.json
│           └── symptoms_seed.json
└── .github/workflows/      # CI/CD automatizado
```

---

## 2. Configuração do Firebase

### 2.1 Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. **Nome do projeto**: `appunture-tcc` (ou seu nome preferido)
4. **Google Analytics**: Desative (não é necessário para o TCC)
5. Clique em **"Criar projeto"** e aguarde

### 2.2 Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em **"Começar"** (ou "Get started")
3. Na aba **Sign-in method**, habilite:

| Provedor        | Configuração                      |
| --------------- | --------------------------------- |
| **Email/Senha** | Apenas ativar                     |
| **Google**      | Configurar OAuth (veja seção 3.3) |

### 2.3 Configurar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. **Escolha o modo**:

   - ✅ **Native mode** (Obrigatório para apps móveis com sync em tempo real)
   - ❌ Datastore mode (Apenas para apps legados)

4. **Escolha a edição**:

   - ✅ **Standard** (Recomendado para TCC) - Free tier generoso
   - ❌ Enterprise - Apenas para produção corporativa ($$$$)

5. **Selecione a região**:
   - `southamerica-east1` (São Paulo) - menor latência no Brasil
   - `us-central1` - alternativa estável

> ⚠️ **IMPORTANTE**: O modo e a região **NÃO podem ser alterados depois**. Escolha com cuidado!

#### Free Tier do Firestore (Standard Edition)

| Recurso   | Limite Gratuito |
| --------- | --------------- |
| Leituras  | 50.000/dia      |
| Escritas  | 20.000/dia      |
| Exclusões | 20.000/dia      |
| Storage   | 1 GB total      |
| Bandwidth | 10 GB/mês       |

> Para um TCC com ~100 usuários de teste, isso é mais que suficiente.

### 2.4 Configurar Cloud Storage

1. No menu lateral, clique em **Storage**
2. Clique em **"Começar"**
3. Selecione **Production mode**
4. Escolha a mesma região do Firestore

### 2.5 Configurar Security Rules

#### Firestore Rules

```javascript
// Firestore > Rules > Editar
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pontos e sintomas: leitura pública, escrita apenas admin
    match /points/{pointId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }

    match /symptoms/{symptomId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }

    // Dados do usuário: apenas o próprio usuário
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Favoritos e notas: apenas o próprio usuário
    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Storage Rules

```javascript
// Storage > Rules > Editar
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imagens dos pontos: leitura pública
    match /points/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Uploads do usuário
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2.6 Obter Configurações do Firebase

1. Vá em **Project Settings** (⚙️ no canto superior)
2. Role até **"Your apps"**
3. Clique em **"</>"** (Web) para adicionar um app web
4. **Nome**: `appunture-web-config`
5. Copie as configurações:

```javascript
// Guarde esses valores para usar depois:
const firebaseConfig = {
  apiKey: "AIza...", // FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // FIREBASE_AUTH_DOMAIN
  projectId: "xxx", // FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com", // FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...", // FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123...", // FIREBASE_APP_ID
};
```

### 2.7 Criar Service Account

1. Vá em **Project Settings** > **Service accounts**
2. Clique em **"Gerar nova chave privada"**
3. Salve o arquivo JSON (ex: `appunture-firebase-adminsdk.json`)

> ⚠️ **NUNCA commite esse arquivo no Git!** Adicione ao `.gitignore`

---

## 3. Configuração do Google Cloud

### 3.1 Inicializar o Google Cloud CLI

```bash
# Login no Google Cloud
gcloud auth login

# Listar projetos disponíveis
gcloud projects list

# Selecionar o projeto Firebase (mesmo ID)
gcloud config set project appunture-tcc

# Verificar projeto selecionado
gcloud config get-value project
```

### 3.2 Habilitar APIs Necessárias

```bash
# Habilitar todas as APIs necessárias de uma vez
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com \
  iam.googleapis.com

# Verificar APIs habilitadas
gcloud services list --enabled
```

### 3.3 Configurar OAuth para Google Sign-In

1. Acesse [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Clique em **"Criar credenciais"** > **"ID do cliente OAuth"**
3. Configure a **Tela de consentimento OAuth** primeiro (se solicitado):

   - Tipo: Externo
   - Nome do app: Appunture
   - Email de suporte: seu email
   - Domínios autorizados: (deixe vazio por enquanto)

4. Crie os Client IDs:

| Tipo        | Nome              | Configuração                                                     |
| ----------- | ----------------- | ---------------------------------------------------------------- |
| **Web**     | Appunture Web     | Redirect URI: `https://auth.expo.io/@SEU_USUARIO_EXPO/appunture` |
| **Android** | Appunture Android | Package: `com.appunture.mobile` + SHA-1 fingerprint              |

#### Obter SHA-1 Fingerprint (Android)

```bash
# Para debug (desenvolvimento)
cd frontend-mobile/appunture
eas credentials --platform android

# Ou manualmente via keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
```

### 3.4 Criar Secret no Secret Manager

```bash
# Criar secret com o JSON do service account
gcloud secrets create firebase-service-account --data-file=path/to/appunture-firebase-adminsdk.json

# Verificar se foi criado
gcloud secrets list

# Obter o número do projeto (para o próximo comando)
gcloud projects describe appunture-tcc --format='value(projectNumber)'

756244484248

# Dar permissão ao Cloud Run para acessar o secret
gcloud secrets add-iam-policy-binding firebase-service-account --member="serviceAccount:756244484248-compute@developer.gserviceaccount.com"  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Configuração do Vertex AI (Gemini)

O Appunture usa o **Google Gemini 1.5 Flash** via Vertex AI para o assistente de IA.

### 4.1 Habilitar Vertex AI

```bash
# Já habilitado no passo 3.2, mas verificar:
gcloud services list --enabled | grep aiplatform

# Se não estiver, habilitar:
gcloud services enable aiplatform.googleapis.com
```

### 4.2 Configurar Permissões

```bash
# Obter o service account padrão do Cloud Run

PROJECT_NUMBER=756244484248

# Dar permissão para usar Vertex AI

gcloud projects add-iam-policy-binding appunture-tcc --member="serviceAccount:${756244484248}-compute@developer.gserviceaccount.com" --role="roles/aiplatform.user"
```

### 4.3 Configuração no Backend

O arquivo `application-prod.yml` já está configurado:

```yaml
spring:
  ai:
    vertex:
      ai:
        gemini:
          project-id: ${GOOGLE_CLOUD_PROJECT}
          location: us-central1
          chat:
            options:
              model: gemini-1.5-flash
              temperature: 0.7
              max-output-tokens: 2048
```

### 4.4 Custos do Vertex AI (Gemini 1.5 Flash)

| Operação | Custo                       |
| -------- | --------------------------- |
| Input    | $0.00001875 / 1k caracteres |
| Output   | $0.000075 / 1k caracteres   |

| Uso Mensal     | Custo Estimado |
| -------------- | -------------- |
| 1.000 queries  | ~$1-3          |
| 5.000 queries  | ~$5-15         |
| 10.000 queries | ~$10-30        |

---

## 5. Secrets do GitHub

### 5.1 Acessar Configurações

1. Vá no repositório GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Clique em **"New repository secret"** para cada um

### 5.2 Secrets Obrigatórios

| Secret                    | Descrição                        | Onde obter                                           |
| ------------------------- | -------------------------------- | ---------------------------------------------------- |
| `GCP_PROJECT_ID`          | ID do projeto GCP                | Console GCP > Home                                   |
| `GCP_SERVICE_ACCOUNT`     | JSON completo do Service Account | Firebase > Project Settings > Service accounts       |
| `FIREBASE_PROJECT_ID`     | ID do projeto Firebase           | Firebase Console (mesmo que GCP_PROJECT_ID)          |
| `FIREBASE_STORAGE_BUCKET` | Bucket do Storage                | Firebase > Storage (ex: `appunture-tcc.appspot.com`) |
| `EXPO_TOKEN`              | Token de acesso do Expo          | expo.dev > Account Settings > Access Tokens          |

gcloud projects add-iam-policy-binding appunture-tcc --member="serviceAccount:firebase-adminsdk-fbsvc@appunture-tcc.iam.gserviceaccount.com"  --role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding firebase-adminsdk-fbsvc@appunture-tcc.iam.gserviceaccount.com --member="serviceAccount:firebase-adminsdk-fbsvc@appunture-tcc.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser" --project=appunture-tcc

gcloud iam service-accounts add-iam-policy-binding 756244484248-compute@developer.gserviceaccount.com --member="serviceAccount:firebase-adminsdk-fbsvc@appunture-tcc.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser" --project=appunture-tcc

### 5.3 Adicionar Secrets via GitHub CLI

```bash
# Login no GitHub CLI (se necessário)
gh auth login

# Adicionar secrets
gh secret set GCP_PROJECT_ID --body "appunture-tcc"
gh secret set FIREBASE_PROJECT_ID --body "appunture-tcc"
gh secret set FIREBASE_STORAGE_BUCKET --body "gs://appunture-tcc.firebasestorage.app"

# Para o service account (JSON):
gh secret set GCP_SERVICE_ACCOUNT < path/to/appunture-firebase-adminsdk.json

# Para o Expo Token:
gh secret set EXPO_TOKEN --body "t6PVS_q3gj3LjQuB8E6IvjRn5QygJm9pk312l1-c"
```

---

## 6. Deploy do Backend

### 6.1 Deploy Automático (Recomendado)

O deploy acontece automaticamente via GitHub Actions quando você faz push para `main`:

```bash
# Fazer push para main dispara o workflow
git add .
git commit -m "feat: atualização do backend"
git push origin main

# Acompanhar o workflow em:
# https://github.com/SEU_USUARIO/appunture-dev/actions
```

### 6.2 Deploy Manual

```bash
cd backend-java

# 1. Build local (testar se compila)
./mvnw clean package -DskipTests

# 2. Build e push da imagem Docker
gcloud builds submit --tag gcr.io/appunture-tcc/appunture-backend

# 3. Deploy no Cloud Run
gcloud run deploy appunture-backend \
  --image gcr.io/appunture-tcc/appunture-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "FIREBASE_PROJECT_ID=appunture-tcc" \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=appunture-tcc" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest"
```

### 6.3 Verificar Deploy

```bash
# Obter URL do serviço
BACKEND_URL=$(gcloud run services describe appunture-backend \
  --region us-central1 \
  --format='value(status.url)')

echo "Backend URL: $BACKEND_URL"

# Testar health check
curl "$BACKEND_URL/api/actuator/health"
# Esperado: {"status":"UP"}

# Testar endpoint de pontos
curl "$BACKEND_URL/api/points?page=0&size=5"
```

### 6.4 Seed Inicial dos Dados

Após o primeiro deploy, você precisa popular o Firestore com os dados dos pontos e sintomas:

```bash
# Via API (se implementado endpoint de seed)
curl -X POST "$BACKEND_URL/api/admin/seed" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"

# Ou manualmente via Firebase Console:
# 1. Acesse Firestore Database
# 2. Importe os dados de data/processed/2025-11-28/
```

---

## 7. Build do App Android

### 7.1 Configurar Expo

```bash
cd frontend-mobile/appunture

# 1. Login no Expo
eas login

# 2. Verificar/Criar projeto no Expo
eas init --id appunture

# 3. Configurar build (se primeira vez)
eas build:configure
```

### 7.2 Criar arquivo `.env`

```bash
# Copiar template
cp .env.example .env

# Editar com seus valores reais
```

**Conteúdo do `.env`:**

```dotenv
# URL da API no Cloud Run
EXPO_PUBLIC_API_BASE_URL=https://appunture-backend-xxxxx-uc.a.run.app/api

# Firebase Config
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=appunture-tcc.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-tcc
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

### 7.3 Configurar `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://appunture-backend-xxxxx-uc.a.run.app/api"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://appunture-backend-xxxxx-uc.a.run.app/api"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 7.4 Build APK para Testes

```bash
# Build APK de preview (para testes)
eas build --platform android --profile preview

# Aguarde ~10-20 minutos
# O link para download do APK será exibido ao final

# Baixar o APK
eas build:list --platform android
# Copie o URL e baixe
```

### 7.5 Build AAB para Play Store

```bash
# Build App Bundle para produção
eas build --platform android --profile production

# Após o build, submit para Play Store
eas submit --platform android --profile production
```

### 7.6 Build Local (Sem EAS)

Se preferir build local:

```bash
cd frontend-mobile/appunture

# 1. Gerar projeto Android nativo
npx expo prebuild --platform android --clean

# 2. Navegar para pasta Android
cd android

# 3. Build APK de debug
./gradlew assembleDebug

# 4. O APK estará em:
ls -la app/build/outputs/apk/debug/app-debug.apk

# Para release (precisa configurar signing):
./gradlew assembleRelease
```

---

## 8. Comunicação App ↔ API

### 8.1 Arquitetura de Comunicação

```
┌─────────────────────────────────────────────────────────────┐
│                     USUÁRIO (Android)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    APP MOBILE                                │
│              (React Native + Expo)                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   SQLite     │  │   Firebase   │  │    HTTP      │       │
│  │   (offline)  │  │     Auth     │  │   Client     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │               │
│         │    JWT Token    │                  │  HTTPS        │
└─────────┼─────────────────┼──────────────────┼───────────────┘
          │                 │                  │
          │                 ▼                  ▼
          │  ┌─────────────────────────────────────────────────┐
          │  │              GOOGLE CLOUD                        │
          │  │                                                  │
          │  │  ┌────────────────────────────────────────────┐ │
          │  │  │            CLOUD RUN                        │ │
          │  │  │        (Backend Spring Boot)                │ │
          │  │  │                                             │ │
          │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
          │  │  │  │ REST API │ │ Spring AI│ │ Firebase │    │ │
          │  │  │  │Endpoints │ │  (RAG)   │ │Admin SDK │    │ │
          │  │  │  └────┬─────┘ └────┬─────┘ └────┬─────┘    │ │
          │  │  └───────┼────────────┼────────────┼──────────┘ │
          │  │          │            │            │            │
          │  │          ▼            ▼            ▼            │
          │  │  ┌──────────────┐ ┌─────────┐ ┌──────────────┐  │
          │  │  │   VERTEX AI  │ │FIRESTORE│ │   STORAGE    │  │
          │  │  │(Gemini Flash)│ │(Database)│ │  (Imagens)   │  │
          │  │  └──────────────┘ └─────────┘ └──────────────┘  │
          │  └─────────────────────────────────────────────────┘
          │
          └──── Sync bidirectional (online/offline)
```

### 8.2 Fluxo de Sincronização

O app implementa uma arquitetura **offline-first**:

1. **Dados salvos localmente** (SQLite) imediatamente
2. **Fila de sincronização** guarda operações pendentes
3. **Quando online**, processa a fila automaticamente
4. **Resolução de conflitos**: last-write-wins por timestamp

```typescript
// Exemplo simplificado do fluxo
const syncStore = {
  // 1. Adicionar favorito (offline-first)
  addFavorite: async (pointId) => {
    // Salva local imediatamente
    await databaseService.saveFavorite(pointId);

    // Adiciona na fila de sync
    await databaseService.addToSyncQueue({
      type: "favorite",
      operation: "UPSERT",
      data: { pointId },
      timestamp: new Date().toISOString(),
    });

    // Se online, processa fila
    if (isOnline) {
      await processSyncQueue();
    }
  },

  // 2. Processar fila quando voltar online
  processSyncQueue: async () => {
    const pending = await databaseService.getPendingOperations();

    for (const op of pending) {
      try {
        await apiService.sync(op);
        await databaseService.markAsSynced(op.id);
      } catch (error) {
        // Retry com backoff exponencial
        await scheduleRetry(op);
      }
    }
  },
};
```

### 8.3 Endpoints da API

| Método | Endpoint                   | Descrição                   | Auth |
| ------ | -------------------------- | --------------------------- | ---- |
| GET    | `/api/points`              | Listar pontos (paginado)    | ❌   |
| GET    | `/api/points/{code}`       | Detalhes de um ponto        | ❌   |
| GET    | `/api/symptoms`            | Listar sintomas             | ❌   |
| GET    | `/api/meridians`           | Listar meridianos           | ❌   |
| POST   | `/api/assistant/query`     | Perguntar ao assistente IA  | ✅   |
| GET    | `/api/user/favorites`      | Listar favoritos do usuário | ✅   |
| POST   | `/api/user/favorites`      | Adicionar favorito          | ✅   |
| DELETE | `/api/user/favorites/{id}` | Remover favorito            | ✅   |
| POST   | `/api/sync`                | Sincronizar dados offline   | ✅   |

---

## 9. Verificação Final

### 9.1 Checklist Completo

```bash
# ====== BACKEND ======

# 1. Health check
curl https://YOUR_CLOUD_RUN_URL/api/actuator/health
# ✅ Esperado: {"status":"UP"}

# 2. Listar pontos
curl https://YOUR_CLOUD_RUN_URL/api/points?page=0&size=3
# ✅ Esperado: Lista de pontos ou []

# 3. Buscar ponto específico
curl https://YOUR_CLOUD_RUN_URL/api/points/LU-1
# ✅ Esperado: Dados do ponto LU-1

# 4. Testar IA (precisa de token)
curl -X POST https://YOUR_CLOUD_RUN_URL/api/assistant/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"question": "Quais pontos ajudam com dor de cabeça?"}'
# ✅ Esperado: Resposta da IA

# ====== APP MOBILE ======

# 5. Instalar APK no dispositivo
# 6. Abrir o app
# ✅ Tela de boas-vindas aparece

# 7. Fazer login com Google
# ✅ Login funciona, redireciona para home

# 8. Navegar pelos pontos
# ✅ Lista de pontos carrega

# 9. Testar offline
# - Ativar modo avião
# - Navegar pelo app
# ✅ Dados locais funcionam

# 10. Testar sync
# - Adicionar favorito offline
# - Desativar modo avião
# ✅ Favorito sincroniza automaticamente
```

### 9.2 Logs e Monitoramento

| Serviço        | URL                                                                          |
| -------------- | ---------------------------------------------------------------------------- |
| Cloud Run Logs | [console.cloud.google.com/run](https://console.cloud.google.com/run)         |
| Firestore      | [console.firebase.google.com](https://console.firebase.google.com)           |
| Firebase Auth  | [console.firebase.google.com/auth](https://console.firebase.google.com/auth) |
| Expo Builds    | [expo.dev/builds](https://expo.dev/builds)                                   |

---

## 10. Custos Detalhados

### 10.1 Tabela de Custos por Serviço

#### Firestore (Standard Edition)

| Operação  | Free Tier | Após Free Tier |
| --------- | --------- | -------------- |
| Leituras  | 50k/dia   | $0.06 / 100k   |
| Escritas  | 20k/dia   | $0.18 / 100k   |
| Exclusões | 20k/dia   | $0.02 / 100k   |
| Storage   | 1 GB      | $0.18 / GB/mês |

#### Cloud Run

| Recurso  | Free Tier       | Após Free Tier     |
| -------- | --------------- | ------------------ |
| Requests | 2M/mês          | $0.40 / 1M         |
| CPU      | 180k vCPU-s/mês | $0.00002400/vCPU-s |
| Memória  | 360k GiB-s/mês  | $0.00000250/GiB-s  |

#### Vertex AI (Gemini 1.5 Flash)

| Operação | Custo                  |
| -------- | ---------------------- |
| Input    | $0.00001875 / 1k chars |
| Output   | $0.000075 / 1k chars   |

#### Firebase Auth

| Recurso        | Custo                  |
| -------------- | ---------------------- |
| Usuários       | **Ilimitado e Grátis** |
| Email/Senha    | Grátis                 |
| Google Sign-In | Grátis                 |

#### EAS Build (Expo)

| Plano      | Builds/mês | Custo   |
| ---------- | ---------- | ------- |
| Free       | 30         | $0      |
| Production | Ilimitado  | $99/mês |

### 10.2 Estimativa por Cenário

| Cenário            | Usuários | Custo/Mês  |
| ------------------ | -------- | ---------- |
| 🟢 Desenvolvimento | 1-5      | **$0**     |
| 🟡 Testes TCC      | 10-50    | **$0-5**   |
| 🟠 Apresentação    | 50-100   | **$5-15**  |
| 🔴 Produção        | 500+     | **$15-50** |

> 💡 **Lembre-se**: Google Cloud oferece **$300 de crédito** para novos usuários!

---

## 11. Troubleshooting

### Erro: "Firebase: Error (auth/unauthorized-domain)"

**Causa**: Domínio não autorizado no Firebase Auth.

**Solução**:

1. Firebase Console > Authentication > Settings
2. Authorized domains > Add domain
3. Adicione: `auth.expo.io`

### Erro: "Cloud Run: Container failed to start"

**Causa**: Erro na inicialização do container.

**Solução**:

```bash
# Ver logs detalhados
gcloud run logs read appunture-backend --region us-central1 --limit 50

# Verificar se o secret está configurado
gcloud secrets versions access latest --secret=firebase-service-account

# Rebuild forçado
gcloud builds submit --tag gcr.io/PROJECT_ID/appunture-backend --no-cache
```

### Erro: "EAS Build failed"

**Causa**: Configuração incorreta do Expo.

**Solução**:

```bash
# Verificar credenciais
eas credentials --platform android

# Limpar cache
eas build --clear-cache --platform android

# Verificar eas.json
cat eas.json
```

### Erro: "Firestore permission denied"

**Causa**: Rules do Firestore bloqueando acesso.

**Solução**:

1. Verificar se o usuário está autenticado
2. Verificar as Security Rules no Firebase Console
3. Testar com rules em modo teste (temporário):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ APENAS PARA TESTE
    }
  }
}
```

### Erro: "Network request failed" no App

**Causa**: Problema de conectividade ou URL incorreta.

**Solução**:

```bash
# Verificar URL da API no .env
cat frontend-mobile/appunture/.env | grep API

# Testar conectividade
curl -I https://YOUR_CLOUD_RUN_URL/api/actuator/health

# Verificar se não é problema de CORS (não se aplica a apps nativos)
```

### Erro: "IA indisponível" no Assistente

**Causa**: Vertex AI não configurado ou sem permissões.

**Solução**:

```bash
# Verificar se Vertex AI está habilitado
gcloud services list --enabled | grep aiplatform

# Verificar permissões do service account
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.role:aiplatform"
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. **Verifique os logs** no Cloud Run/Firebase
2. **Consulte esta documentação** (Ctrl+F para buscar)
3. **Documentação oficial**:
   - [Firebase Docs](https://firebase.google.com/docs)
   - [Cloud Run Docs](https://cloud.google.com/run/docs)
   - [Expo Docs](https://docs.expo.dev)
   - [Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)

---

> 📅 **Última atualização**: Dezembro 2024  
> 📱 **Versão do App**: Android only  
> ☁️ **Backend**: Spring Boot 3.2 + Cloud Run  
> 🤖 **IA**: Gemini 1.5 Flash via Vertex AI
