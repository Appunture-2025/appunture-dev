# 🚀 Guia de Deploy - Appunture

> Guia completo para configurar e fazer deploy do aplicativo Appunture.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Firebase](#configuração-do-firebase)
3. [Configuração do Google Cloud](#configuração-do-google-cloud)
4. [Secrets do GitHub](#secrets-do-github)
5. [Deploy do Backend](#deploy-do-backend)
6. [Build do App Mobile](#build-do-app-mobile)
7. [Deploy do Admin Dashboard](#deploy-do-admin-dashboard)
8. [Verificação Final](#verificação-final)

---

## 1. Pré-requisitos

### Contas Necessárias

- [ ] **Google Cloud Platform** - [console.cloud.google.com](https://console.cloud.google.com)
- [ ] **Firebase** - [console.firebase.google.com](https://console.firebase.google.com)
- [ ] **Expo** - [expo.dev](https://expo.dev) (grátis)
- [ ] **Apple Developer** (opcional para iOS) - [developer.apple.com](https://developer.apple.com)
- [ ] **Google Play Console** (opcional para Android) - [play.google.com/console](https://play.google.com/console)

### Ferramentas Locais

```bash
# Node.js 20+
node --version

# Java 17+
java --version

# Google Cloud CLI
gcloud --version

# EAS CLI
npm install -g eas-cli
eas --version
```

---

## 2. Configuração do Firebase

### 2.1 Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `appunture-tcc` (ou seu nome preferido)
4. Desative Google Analytics (opcional para TCC)
5. Aguarde a criação do projeto

### 2.2 Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em **"Get started"**
3. Na aba **Sign-in method**, habilite:
   - [x] **Email/Password**
   - [x] **Google** (configure OAuth)
   - [x] **Apple** (obrigatório para App Store)

### 2.3 Configurar Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em **"Create database"**
3. Escolha **Production mode**
4. Selecione a região: `us-central1` (ou a mais próxima)

### 2.4 Configurar Storage

1. No menu lateral, clique em **Storage**
2. Clique em **"Get started"**
3. Aceite as regras padrão (ajustaremos depois)

### 2.5 Obter Configurações do Firebase

1. Vá em **Project Settings** (engrenagem no canto superior)
2. Role até **"Your apps"**
3. Clique em **"</> Web"** para adicionar um app web
4. Copie as configurações:

```javascript
// Estas são as configurações que você precisa:
const firebaseConfig = {
  apiKey: "AIza...", // FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx", // FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com", // FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...", // FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123...", // FIREBASE_APP_ID
  measurementId: "G-...", // FIREBASE_MEASUREMENT_ID (opcional)
};
```

### 2.6 Criar Service Account

1. Vá em **Project Settings** > **Service accounts**
2. Clique em **"Generate new private key"**
3. Salve o arquivo JSON gerado (NÃO COMMITE NO GIT!)
4. Este arquivo será usado como `GCP_SERVICE_ACCOUNT` no GitHub

---

## 3. Configuração do Google Cloud

### 3.1 Habilitar APIs

```bash
# Login no Google Cloud
gcloud auth login

# Selecionar projeto
gcloud config set project YOUR_PROJECT_ID

# Habilitar APIs necessárias
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com
```

### 3.2 Criar Secret Manager para Service Account

```bash
# Criar secret com o JSON do service account
gcloud secrets create firebase-service-account \
  --data-file=path/to/your-service-account.json

# Dar permissão ao Cloud Run para acessar
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3.3 Configurar OAuth para Google Sign-In

1. Acesse [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Clique em **"Create Credentials"** > **"OAuth client ID"**
3. Crie 3 client IDs:

| Tipo            | Nome              | Redirect URIs                                           |
| --------------- | ----------------- | ------------------------------------------------------- |
| Web application | Appunture Web     | `https://auth.expo.io/@YOUR_EXPO_USERNAME/appunture`    |
| iOS             | Appunture iOS     | Bundle ID: `com.appunture.mobile`                       |
| Android         | Appunture Android | Package: `com.appunture.mobile`, SHA-1: seu fingerprint |

4. Copie os Client IDs gerados

---

## 4. Secrets do GitHub

Vá em **Settings** > **Secrets and variables** > **Actions** no seu repositório e adicione:

### 4.1 Secrets Obrigatórios

| Secret                    | Descrição                        | Onde obter                                     |
| ------------------------- | -------------------------------- | ---------------------------------------------- |
| `GCP_PROJECT_ID`          | ID do projeto GCP                | Console GCP > Home                             |
| `GCP_SERVICE_ACCOUNT`     | JSON completo do Service Account | Firebase > Project Settings > Service accounts |
| `FIREBASE_PROJECT_ID`     | ID do projeto Firebase           | Firebase Console                               |
| `FIREBASE_STORAGE_BUCKET` | Bucket do Storage                | Firebase > Storage                             |
| `EXPO_TOKEN`              | Token de acesso do Expo          | expo.dev > Account Settings > Access Tokens    |

### 4.2 Secrets Opcionais (para produção)

| Secret              | Descrição                   |
| ------------------- | --------------------------- |
| `GOOGLE_AI_API_KEY` | API Key do Gemini (para IA) |
| `APPLE_ID`          | Apple ID para App Store     |
| `APPLE_TEAM_ID`     | Team ID da Apple            |
| `ASC_KEY_ID`        | App Store Connect Key ID    |
| `ASC_ISSUER_ID`     | App Store Connect Issuer ID |
| `ASC_KEY_P8`        | Conteúdo da chave .p8       |

### 4.3 Como adicionar os secrets

```bash
# Via GitHub CLI
gh secret set GCP_PROJECT_ID --body "appunture-tcc"
gh secret set FIREBASE_PROJECT_ID --body "appunture-tcc"
gh secret set FIREBASE_STORAGE_BUCKET --body "appunture-tcc.appspot.com"

# Para o service account (JSON):
gh secret set GCP_SERVICE_ACCOUNT < path/to/service-account.json
```

---

## 5. Deploy do Backend

### 5.1 Deploy Automático (CI/CD)

O deploy acontece automaticamente quando você faz push para `main`:

```bash
git push origin main
# O workflow backend-ci.yml será executado automaticamente
```

### 5.2 Deploy Manual

```bash
cd backend-java

# Build local
./mvnw clean package -DskipTests

# Build e push da imagem Docker
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/appunture-backend

# Deploy no Cloud Run
gcloud run deploy appunture-backend \
  --image gcr.io/YOUR_PROJECT_ID/appunture-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "FIREBASE_PROJECT_ID=appunture-tcc" \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest"
```

### 5.3 Verificar Deploy

```bash
# Obter URL do serviço
gcloud run services describe appunture-backend --region us-central1 --format='value(status.url)'

# Testar health check
curl https://YOUR_CLOUD_RUN_URL/api/actuator/health
```

---

## 6. Build do App Mobile

### 6.1 Configurar Expo

```bash
cd frontend-mobile/appunture

# Login no Expo
eas login

# Configurar projeto (primeira vez)
eas build:configure
```

### 6.2 Criar arquivo .env

```bash
# Copiar template
cp .env.example .env

# Editar com seus valores
code .env
```

Preencha o `.env`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://YOUR_CLOUD_RUN_URL/api
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=appunture-tcc.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-tcc
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123-abc.apps.googleusercontent.com
```

### 6.3 Build para Desenvolvimento

```bash
# Android APK (para testar)
eas build --platform android --profile development

# iOS Simulator
eas build --platform ios --profile development
```

### 6.4 Build para Produção

```bash
# Android (AAB para Play Store)
eas build --platform android --profile production

# iOS (IPA para App Store)
eas build --platform ios --profile production
```

### 6.5 Submit para Lojas

```bash
# Android - Play Store
eas submit --platform android --profile production

# iOS - App Store
eas submit --platform ios --profile production
```

---

## 7. Deploy do Admin Dashboard

### 7.1 Build Local

```bash
cd frontend-admin

# Instalar dependências
npm install

# Criar .env
cp .env.example .env
# Editar .env com suas configurações

# Build de produção
npm run build
```

### 7.2 Deploy no Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar hosting
firebase init hosting
# - Public directory: dist
# - Single-page app: yes
# - GitHub Actions: no

# Deploy
firebase deploy --only hosting
```

### 7.3 Deploy no Vercel (Alternativa)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 8. Verificação Final

### 8.1 Checklist de Verificação

```bash
# 1. Backend funcionando
curl https://YOUR_CLOUD_RUN_URL/api/actuator/health
# Esperado: {"status":"UP"}

# 2. Firestore conectado
curl https://YOUR_CLOUD_RUN_URL/api/points?page=0&size=10
# Esperado: Lista de pontos ou [] vazio

# 3. App Mobile
# - Instalar APK/IPA no dispositivo
# - Verificar login com Google/Apple
# - Verificar listagem de pontos
# - Verificar upload de imagem

# 4. Admin Dashboard
# - Acessar URL do hosting
# - Verificar login admin
# - Verificar CRUD de pontos
```

### 8.2 Monitoramento

- **Cloud Run Logs**: [console.cloud.google.com/run](https://console.cloud.google.com/run)
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **Expo Dashboard**: [expo.dev](https://expo.dev)

---

## 🆘 Troubleshooting

### Erro: "Firebase: Error (auth/unauthorized-domain)"

- Adicione o domínio em Firebase > Authentication > Settings > Authorized domains

### Erro: "Cloud Run: Container failed to start"

- Verifique os logs: `gcloud run logs read appunture-backend`
- Verifique se o secret está configurado corretamente

### Erro: "EAS Build failed"

- Verifique `eas.json` está correto
- Verifique se o `EXPO_TOKEN` está configurado no GitHub Secrets

### Erro: "Firestore permission denied"

- Verifique as Security Rules do Firestore
- Verifique se o token de autenticação está sendo enviado

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no Cloud Run/Firebase
2. Abra uma issue no GitHub
3. Consulte a documentação oficial:
   - [Firebase Docs](https://firebase.google.com/docs)
   - [Cloud Run Docs](https://cloud.google.com/run/docs)
   - [Expo Docs](https://docs.expo.dev)
