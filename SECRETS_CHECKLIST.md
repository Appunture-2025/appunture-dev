# 📋 Checklist de Secrets - Appunture

> Este arquivo lista TODOS os secrets que você precisa configurar para fazer o deploy.

## 🔑 GitHub Secrets (Obrigatórios)

Vá em: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret                    | Valor                        | Onde obter                                                                |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`          | `seu-projeto-id`             | Console GCP → Home → Project ID                                           |
| `GCP_SERVICE_ACCOUNT`     | (JSON completo)              | Firebase → Project Settings → Service accounts → Generate new private key |
| `FIREBASE_PROJECT_ID`     | `seu-projeto-id`             | Firebase Console → Project Settings                                       |
| `FIREBASE_STORAGE_BUCKET` | `seu-projeto-id.appspot.com` | Firebase → Storage                                                        |
| `EXPO_TOKEN`              | `expo_xxx...`                | [expo.dev](https://expo.dev) → Account Settings → Access Tokens           |

---

## 📱 Frontend Mobile (.env)

Arquivo: `frontend-mobile/appunture/.env`

```dotenv
# URL do backend (ajuste para sua URL do Cloud Run)
EXPO_PUBLIC_API_BASE_URL=https://appunture-backend-XXXXX-uc.a.run.app/api

# Firebase (copiar do Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# Google Sign-In (obter do Google Cloud Console)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

## 🖥️ Frontend Admin (.env)

Arquivo: `frontend-admin/.env`

```dotenv
# URL do backend
VITE_API_BASE_URL=https://appunture-backend-XXXXX-uc.a.run.app/api

# Firebase (mesmos valores do mobile)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## ⚙️ Backend Java (.env - apenas local)

Arquivo: `backend-java/.env`

```dotenv
# Firebase
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_ENABLED=true

# Google AI (opcional)
GOOGLE_AI_API_KEY=seu-api-key-gemini

# Para desenvolvimento local, use ADC:
# gcloud auth application-default login
```

---

## 🚀 Passos para Deploy

### 1. Configurar Firebase

```bash
# Criar projeto em console.firebase.google.com
# Habilitar: Authentication, Firestore, Storage
```

### 2. Configurar Google Cloud

```bash
# Habilitar APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com

# Criar secret com service account
gcloud secrets create firebase-service-account --data-file=service-account.json
```

### 3. Configurar GitHub Secrets

```bash
# Via CLI
gh secret set GCP_PROJECT_ID --body "seu-projeto"
gh secret set FIREBASE_PROJECT_ID --body "seu-projeto"
gh secret set FIREBASE_STORAGE_BUCKET --body "seu-projeto.appspot.com"
gh secret set GCP_SERVICE_ACCOUNT < service-account.json
gh secret set EXPO_TOKEN --body "seu-token-expo"
```

### 4. Fazer Push

```bash
git push origin main
# Os workflows vão executar automaticamente
```

### 5. Obter URL do Backend

```bash
# Após o deploy
gcloud run services describe appunture-backend --region us-central1 --format='value(status.url)'
# Ex: https://appunture-backend-xyz123-uc.a.run.app
```

### 6. Atualizar .env com URL do Backend

```bash
# Editar os .env com a URL correta
# Fazer commit e push novamente
```

### 7. Build do App

```bash
cd frontend-mobile/appunture
eas build --platform all --profile production
```

---

## 📞 Suporte

Consulte `DEPLOY_GUIDE.md` para instruções detalhadas.
