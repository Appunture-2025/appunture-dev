# 🚀 Guia de Deploy - Appunture

> Guia completo para configurar e fazer deploy do aplicativo Appunture.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Firebase](#configuração-do-firebase)
3. [Configuração do Google Cloud](#configuração-do-google-cloud)
4. [Secrets do GitHub](#secrets-do-github)
5. [Deploy do Backend](#deploy-do-backend)
6. [Build do App Mobile](#build-do-app-mobile)
7. [Verificação Final](#verificação-final)

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

## 7. Verificação Final

### 7.1 Checklist de Verificação

```bash
# 1. Backend funcionando
curl https://YOUR_CLOUD_RUN_URL/api/actuator/health
# Esperado: {"status":"UP"}

# 2. Firestore conectado
curl https://YOUR_CLOUD_RUN_URL/api/points?page=0&size=10
# Esperado: Lista de pontos ou [] vazio

# 3. App Mobile
# - Instalar APK/IPA no dispositivo
# - Verificar login com Google
# - Verificar listagem de pontos
# - Verificar sincronização offline
```

### 7.2 Monitoramento

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

## 8. Configuração do Vertex AI (Google Gemini)

### 8.1 Habilitar Vertex AI

```bash
# Habilitar API do Vertex AI
gcloud services enable aiplatform.googleapis.com

# Verificar se está habilitado
gcloud services list --enabled | grep aiplatform
```

### 8.2 Configurar Permissões para o Backend

```bash
# Dar permissão ao service account para usar Vertex AI
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 8.3 Configuração no Backend (application-prod.yml)

```yaml
spring:
  ai:
    vertex:
      ai:
        gemini:
          project-id: ${GOOGLE_CLOUD_PROJECT}
          location: us-central1 # ou southamerica-east1
          chat:
            options:
              model: gemini-1.5-flash
              temperature: 0.7
              max-output-tokens: 2048
```

### 8.4 Custos Estimados

| Uso Mensal     | Custo Aproximado |
| -------------- | ---------------- |
| 1.000 queries  | ~$1-3            |
| 10.000 queries | ~$10-30          |
| 50.000 queries | ~$50-100         |

> **Dica**: O Gemini 1.5 Flash é mais barato que o Pro e suficiente para o caso de uso educacional.

---

## 9. Build Detalhado do APK

### 9.1 Pré-requisitos para Build Local

```bash
# Instalar Android Studio (para builds locais)
# Download: https://developer.android.com/studio

# Configurar variáveis de ambiente
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Verificar instalação
adb --version
```

### 9.2 Build via EAS (Recomendado)

```bash
cd frontend-mobile/appunture

# 1. Login no Expo
eas login

# 2. Verificar configuração
eas build:configure

# 3. Build APK para testes (preview)
eas build --platform android --profile preview

# Aguarde o build (~10-20 minutos)
# O link para download será exibido ao final
```

### 9.3 Build APK Local (Sem EAS)

```bash
cd frontend-mobile/appunture

# 1. Gerar projeto Android nativo
npx expo prebuild --platform android

# 2. Navegar para pasta Android
cd android

# 3. Build APK de release
./gradlew assembleRelease

# 4. O APK estará em:
# android/app/build/outputs/apk/release/app-release.apk
```

### 9.4 Assinar o APK para Produção

```bash
# 1. Gerar keystore (primeira vez)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore appunture-release.keystore \
  -alias appunture \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# 2. Configurar no gradle (android/app/build.gradle)
# Adicionar dentro de android { }:
signingConfigs {
    release {
        storeFile file('appunture-release.keystore')
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias 'appunture'
        keyPassword System.getenv("KEY_PASSWORD")
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 9.5 Profiles do EAS Build (eas.json)

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://YOUR_CLOUD_RUN_URL/api"
      }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://YOUR_CLOUD_RUN_URL/api"
      }
    }
  }
}
```

---

## 10. Comunicação App ↔ API na Nuvem

### 10.1 Arquitetura de Comunicação

```
┌─────────────────────────────────────────────────────────────┐
│                        USUÁRIO                               │
│                      (Smartphone)                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    APP MOBILE                                │
│              (React Native + Expo)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   SQLite    │  │  Firebase   │  │   HTTP      │          │
│  │   (Local)   │  │    Auth     │  │   Client    │          │
│  └─────────────┘  └──────┬──────┘  └──────┬──────┘          │
└──────────────────────────┼────────────────┼─────────────────┘
                           │                │
            JWT Token      │                │  HTTPS
                           ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE CLOUD                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    CLOUD RUN                          │   │
│  │              (Backend Spring Boot)                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │   REST API  │  │  Spring AI  │  │  Firebase   │   │   │
│  │  │  Endpoints  │  │   (RAG)     │  │  Admin SDK  │   │   │
│  │  └─────────────┘  └──────┬──────┘  └──────┬──────┘   │   │
│  └───────────────────────────┼───────────────┼──────────┘   │
│                              │               │               │
│              ┌───────────────┴───────────────┴───────────┐   │
│              ▼                                           ▼   │
│  ┌─────────────────────┐              ┌─────────────────────┐│
│  │     VERTEX AI       │              │     FIRESTORE       ││
│  │  (Gemini 1.5 Flash) │              │    (Database)       ││
│  └─────────────────────┘              └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Configurar URL da API no App

**Arquivo: `frontend-mobile/appunture/.env.production`**

```bash
# URL da API no Cloud Run
EXPO_PUBLIC_API_BASE_URL=https://appunture-backend-xxxxx-uc.a.run.app/api

# Firebase Config
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=appunture-tcc.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-tcc
```

### 10.3 Cliente HTTP com Autenticação

**Arquivo: `lib/api.ts`**

```typescript
import { auth } from "@/config/firebase";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Obter token do Firebase Auth
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Endpoints públicos (sem auth)
  getPoints: () => api.request("/points"),
  getPointByCode: (code: string) => api.request(`/points/${code}`),
  getMeridians: () => api.request("/meridians"),

  // Endpoints protegidos (com auth)
  syncData: (data: SyncPayload) =>
    api.request("/sync", { method: "POST", body: JSON.stringify(data) }),

  askAssistant: (question: string) =>
    api.request("/assistant/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  getFavorites: () => api.request("/user/favorites"),
  addFavorite: (pointId: string) =>
    api.request("/user/favorites", {
      method: "POST",
      body: JSON.stringify({ pointId }),
    }),
};
```

### 10.4 Fluxo de Autenticação Completo

```typescript
// 1. Login do usuário
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";

const login = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  // Firebase gera automaticamente um JWT token
  return credential.user;
};

// 2. O token é enviado automaticamente nas requisições
const points = await api.getPoints();

// 3. O backend valida o token via Firebase Admin SDK
// SecurityConfig.java verifica o header Authorization: Bearer <token>
```

### 10.5 Tratamento de Erros de Conexão

```typescript
// hooks/useApi.ts
import { useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useApi<T>(apiCall: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Verificar conexão
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setError("Sem conexão com a internet. Usando dados offline.");
      // Carregar do SQLite local
      return;
    }

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, loading, error, execute };
}
```

### 10.6 CORS no Backend (Produção)

**Arquivo: `backend-java/src/main/resources/application-prod.yml`**

```yaml
cors:
  allowed-origins:
    # Domínios permitidos (ajuste conforme necessário)
    - https://appunture.com.br
    - https://admin.appunture.com.br
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers:
    - Authorization
    - Content-Type
    - X-Requested-With
  allow-credentials: true
```

> **Nota**: Para apps móveis nativos (APK/IPA), CORS não se aplica. Apenas para Web.

---

## 💰 Resumo de Custos Estimados

| Serviço            | Uso Médio    | Custo/Mês     |
| ------------------ | ------------ | ------------- |
| Cloud Run          | 50k requests | $0-10         |
| Firestore          | 100k reads   | $0-5          |
| Vertex AI (Gemini) | 5k queries   | $5-15         |
| Firebase Auth      | 10k users    | $0 (grátis)   |
| EAS Build          | 30 builds    | $0 (grátis)   |
| **Total Estimado** |              | **$5-30/mês** |

> O Google Cloud oferece $300 de crédito para novos usuários. Para TCC, provavelmente ficará dentro do free tier.

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no Cloud Run/Firebase
2. Abra uma issue no GitHub
3. Consulte a documentação oficial:
   - [Firebase Docs](https://firebase.google.com/docs)
   - [Cloud Run Docs](https://cloud.google.com/run/docs)
   - [Expo Docs](https://docs.expo.dev)
