# Environment Variables Reference

Referência completa de todas as variáveis de ambiente utilizadas no projeto Appunture.

## Backend (Java/Spring Boot)

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho para o arquivo service-account-key.json | `/path/to/service-account-key.json` |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase | `appunture-dev` |
| `FIREBASE_STORAGE_BUCKET` | Bucket do Firebase Storage | `appunture-dev.appspot.com` |

### Variáveis Opcionais

| Variável | Descrição | Default | Exemplo |
|----------|-----------|---------|---------|
| `SERVER_PORT` | Porta do servidor | `8080` | `8081` |
| `SPRING_PROFILES_ACTIVE` | Profile Spring ativo | `dev` | `prod` |
| `LOGGING_LEVEL_ROOT` | Nível de log global | `INFO` | `DEBUG` |
| `LOGGING_LEVEL_COM_APPUNTURE` | Nível de log do app | `DEBUG` | `TRACE` |

### Variáveis de Rate Limiting

| Variável | Descrição | Default |
|----------|-----------|---------|
| `APP_SECURITY_RATE_LIMIT_ENABLED` | Habilitar rate limiting | `true` |
| `APP_SECURITY_RATE_LIMIT_CAPACITY` | Tokens no bucket | `200` |
| `APP_SECURITY_RATE_LIMIT_REFILL_TOKENS` | Tokens reabastecidos | `200` |
| `APP_SECURITY_RATE_LIMIT_REFILL_DURATION` | Período de refill | `PT1M` |

### Exemplo Completo (backend)

```bash
# .env.local
export GOOGLE_APPLICATION_CREDENTIALS=/home/user/keys/service-account-key.json
export FIREBASE_PROJECT_ID=appunture-dev
export FIREBASE_STORAGE_BUCKET=appunture-dev.appspot.com
export SERVER_PORT=8080
export SPRING_PROFILES_ACTIVE=dev
export LOGGING_LEVEL_COM_APPUNTURE=DEBUG
```

---

## Frontend Mobile (React Native/Expo)

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | URL base da API backend | `http://localhost:8080/api` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Chave da API Firebase | `AIzaSy...` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação | `app.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID do projeto Firebase | `appunture-dev` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket do Storage | `appunture-dev.appspot.com` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID do sender FCM | `123456789` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | ID do app Firebase | `1:123:web:abc` |

### Variáveis Opcionais

| Variável | Descrição | Default |
|----------|-----------|---------|
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | ID do Google Analytics | - |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL` | URL do Realtime Database | - |
| `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD` | Habilitar upload de imagens | `true` |

### Variáveis de Social Login

| Variável | Descrição | Necessário |
|----------|-----------|------------|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID Google (Web) | Para Google Sign-In |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Client ID Google (iOS) | Para iOS |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Client ID Google (Android) | Para Android |
| `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` | Client ID Google (Expo) | Para Expo Go |

### Exemplo Completo (mobile)

```bash
# frontend-mobile/appunture/.env

# API
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Firebase Config (obtenha no Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAbcDefGhIjKlMnOpQrStUvWxYz123456
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=appunture-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=appunture-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Opcional - Analytics
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Feature Flags
EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=true

# Google Sign-In (optional)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789012-abcdef.apps.googleusercontent.com
```

---

## Frontend Admin (React/Vite)

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API backend | `http://localhost:8080/api` |
| `VITE_FIREBASE_API_KEY` | Chave da API Firebase | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação | `app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase | `appunture-dev` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket do Storage | `appunture-dev.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do sender FCM | `123456789` |
| `VITE_FIREBASE_APP_ID` | ID do app Firebase | `1:123:web:abc` |

### Exemplo Completo (admin)

```bash
# frontend-admin/.env.local

VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=AIzaSyAbcDefGhIjKlMnOpQrStUvWxYz123456
VITE_FIREBASE_AUTH_DOMAIN=appunture-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=appunture-dev
VITE_FIREBASE_STORAGE_BUCKET=appunture-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## Configuração por Ambiente

### Desenvolvimento Local

```bash
# Backend
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Mobile
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Admin
VITE_API_URL=http://localhost:8080/api
```

### Staging/Preview

```bash
# Backend
SPRING_PROFILES_ACTIVE=staging

# Mobile
EXPO_PUBLIC_API_BASE_URL=https://staging-api.appunture.com/api

# Admin
VITE_API_URL=https://staging-api.appunture.com/api
```

### Produção

```bash
# Backend (Cloud Run)
SPRING_PROFILES_ACTIVE=prod

# Mobile
EXPO_PUBLIC_API_BASE_URL=https://api.appunture.com/api

# Admin
VITE_API_URL=https://api.appunture.com/api
```

---

## Onde Obter os Valores

### Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Clique na engrenagem > "Configurações do projeto"
4. Role até "Seus apps" > clique em "</>" (Web)
5. Copie os valores de `firebaseConfig`

```javascript
// Firebase config (o que você copia)
const firebaseConfig = {
  apiKey: "AIzaSy...",          // FIREBASE_API_KEY
  authDomain: "app.firebaseapp.com",  // FIREBASE_AUTH_DOMAIN
  projectId: "appunture-dev",   // FIREBASE_PROJECT_ID
  storageBucket: "app.appspot.com",   // FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",     // FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"        // FIREBASE_APP_ID
};
```

### Service Account Key

1. Firebase Console > Configurações > Contas de serviço
2. Clique em "Gerar nova chave privada"
3. Salve o arquivo JSON
4. Defina `GOOGLE_APPLICATION_CREDENTIALS` com o caminho

---

## Segurança

### ⚠️ Nunca Faça

- ❌ Commitar arquivos `.env` ou `service-account-key.json`
- ❌ Compartilhar chaves em chats/emails
- ❌ Usar chaves de produção em desenvolvimento
- ❌ Expor `GOOGLE_APPLICATION_CREDENTIALS` em logs

### ✅ Boas Práticas

- ✅ Use `.env.example` como template (sem valores reais)
- ✅ Adicione `.env*` e `*.json` ao `.gitignore`
- ✅ Use secret managers em CI/CD (GitHub Secrets, etc.)
- ✅ Rotacione chaves periodicamente
- ✅ Use projetos Firebase separados por ambiente
