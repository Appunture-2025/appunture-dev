# ✅ Checklist de Deploy - Appunture

> **Preencha os valores abaixo antes do deploy. NÃO COMMITE ESTE ARQUIVO COM SECRETS!**

---

## 📋 1. Meus Dados do Projeto

```bash
# Preencha seus dados aqui:
PROJECT_ID=appunture-tcc
PROJECT_NUMBER=                    # Console GCP > Home > Número do projeto
EXPO_USERNAME=                     # Seu username no expo.dev
REGION=us-central1                 # ou southamerica-east1
```

---

## 🔥 2. Firebase (console.firebase.google.com)

### 2.1 Configurações do App Web

```javascript
// Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "", // ← PREENCHER
  authDomain: "appunture-tcc.firebaseapp.com",
  projectId: "appunture-tcc",
  storageBucket: "appunture-tcc.appspot.com",
  messagingSenderId: "", // ← PREENCHER
  appId: "", // ← PREENCHER
  measurementId: "", // ← PREENCHER (opcional)
};
```

### 2.2 Service Account JSON

```bash
# Firebase Console > Project Settings > Service accounts > Generate new private key
# Salve o arquivo em um local seguro (NÃO no repositório!)
SERVICE_ACCOUNT_PATH=~/Downloads/appunture-tcc-firebase-adminsdk-xxxxx.json
```

---

## ☁️ 3. Google Cloud (console.cloud.google.com)

### 3.1 OAuth Client IDs

```bash
# Console GCP > APIs & Services > Credentials > OAuth 2.0 Client IDs

# Web (para Expo Auth)
GOOGLE_WEB_CLIENT_ID=              # ← PREENCHER (termina em .apps.googleusercontent.com)

# Android (para APK)
GOOGLE_ANDROID_CLIENT_ID=          # ← PREENCHER
ANDROID_SHA1_FINGERPRINT=          # keytool -list -v -keystore ~/.android/debug.keystore

# iOS (opcional)
GOOGLE_IOS_CLIENT_ID=              # ← PREENCHER
```

---

## 📱 4. Expo (expo.dev)

### 4.1 Token de Acesso

```bash
# expo.dev > Account Settings > Access Tokens > Create
EXPO_TOKEN=                        # ← PREENCHER
```

---

## 🔐 5. Comandos de Setup (Execute em ordem)

### 5.1 Login nas ferramentas

```bash
# Login Google Cloud
gcloud auth login
gcloud config set project appunture-tcc

# Login Expo
eas login
```

### 5.2 Habilitar APIs do Google Cloud

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com
```

### 5.3 Criar Secret do Service Account

```bash
# Substitua pelo caminho do seu arquivo JSON
gcloud secrets create firebase-service-account \
  --data-file=$SERVICE_ACCOUNT_PATH

# Dar permissão ao Cloud Run
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 5.4 Configurar GitHub Secrets

```bash
# Secrets obrigatórios
gh secret set GCP_PROJECT_ID --body "appunture-tcc"
gh secret set FIREBASE_PROJECT_ID --body "appunture-tcc"
gh secret set FIREBASE_STORAGE_BUCKET --body "appunture-tcc.appspot.com"
gh secret set EXPO_TOKEN --body "$EXPO_TOKEN"

# Service Account (JSON completo)
gh secret set GCP_SERVICE_ACCOUNT < $SERVICE_ACCOUNT_PATH
```

---

## 📄 6. Arquivos para Criar/Editar

### 6.1 Frontend: `.env` (copie de `.env.example`)

```bash
cd frontend-mobile/appunture
cp .env.example .env
```

Edite `.env`:

```dotenv
# ===== PREENCHER =====
EXPO_PUBLIC_API_BASE_URL=https://appunture-backend-XXXXX-uc.a.run.app/api
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=appunture-tcc.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-tcc
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456-abc.apps.googleusercontent.com
```

### 6.2 EAS: Atualizar URL do Cloud Run

Edite `frontend-mobile/appunture/eas.json`:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://appunture-backend-XXXXX-uc.a.run.app/api"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://appunture-backend-XXXXX-uc.a.run.app/api"
      }
    }
  }
}
```

---

## 🚀 7. Comandos de Deploy

### 7.1 Deploy do Backend

```bash
cd backend-java

# Build e deploy
gcloud builds submit --tag gcr.io/appunture-tcc/appunture-backend

gcloud run deploy appunture-backend \
  --image gcr.io/appunture-tcc/appunture-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "FIREBASE_PROJECT_ID=appunture-tcc" \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com" \
  --set-env-vars "SPRING_PROFILES_ACTIVE=prod" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest"

# Obter URL gerada (copie para o eas.json e .env)
gcloud run services describe appunture-backend --region us-central1 --format='value(status.url)'
```

### 7.2 Build do APK

```bash
cd frontend-mobile/appunture

# APK para testes
eas build --platform android --profile preview

# APK de produção
eas build --platform android --profile production
```

---

## ✅ 8. Verificação Final

```bash
# 1. Testar backend
curl https://YOUR_CLOUD_RUN_URL/api/health
# Esperado: {"status":"UP"}

# 2. Testar listagem de pontos (público - modo visitante)
curl https://YOUR_CLOUD_RUN_URL/api/points
# Esperado: [...lista de pontos...]

# 3. Instalar APK e testar:
# - [ ] Tela de login aparece
# - [ ] "Continuar como visitante" funciona
# - [ ] Lista de pontos carrega
# - [ ] Mapa corporal funciona
# - [ ] Login com Google funciona
# - [ ] Favoritos funciona (após login)
```

---

## 🆘 Problemas Comuns

| Erro                          | Solução                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| `auth/unauthorized-domain`    | Adicionar domínio em Firebase > Auth > Settings > Authorized domains |
| `Container failed to start`   | Verificar logs: `gcloud run logs read appunture-backend`             |
| `CORS error`                  | Verificar `application-prod.yml` ou ignorar (não afeta APK)          |
| `Firestore permission denied` | Verificar Security Rules no Firebase Console                         |

---

## 📝 Anotações Pessoais

```
URL do Cloud Run:
URL do APK:
Data do último deploy:
```
