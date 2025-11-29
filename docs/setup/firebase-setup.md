# Firebase Setup Guide

Guia completo para configuração do Firebase no projeto Appunture.

## 📋 Índice

- [Criar Projeto Firebase](#criar-projeto-firebase)
- [Configurar Serviços](#configurar-serviços)
- [Gerar Credenciais](#gerar-credenciais)
- [Configurar Regras de Segurança](#configurar-regras-de-segurança)
- [Configurar Apps](#configurar-apps)
- [Deploy de Regras](#deploy-de-regras)

---

## Criar Projeto Firebase

### 1. Acessar Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `appunture-{env}` (ex: `appunture-dev`, `appunture-prod`)
4. Opcional: Desabilite Google Analytics para ambiente de desenvolvimento
5. Clique em "Criar projeto"

### 2. Upgrade para Blaze (Recomendado)

Para usar Cloud Functions e Cloud Run:

1. No console, clique na engrenagem > "Uso e faturamento"
2. Clique em "Modificar plano"
3. Selecione "Blaze (pagamento por uso)"
4. Adicione forma de pagamento

> **Nota**: O free tier ainda se aplica. Você só paga pelo que exceder os limites gratuitos.

---

## Configurar Serviços

### Firebase Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Habilite os provedores:

#### E-mail/Senha

1. Clique em "E-mail/senha"
2. Ative "E-mail/senha"
3. Opcional: Ative "Link de e-mail (login sem senha)"
4. Clique em "Salvar"

#### Google Sign-In

1. Clique em "Google"
2. Ative o provedor
3. Configure o e-mail de suporte
4. Clique em "Salvar"

#### Apple Sign-In (iOS)

1. Clique em "Apple"
2. Ative o provedor
3. Configure o Service ID e Team ID
4. Faça upload da chave privada (P8)
5. Clique em "Salvar"

### Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione o modo:
   - **Produção**: Regras restritivas (recomendado)
   - **Teste**: Regras abertas (apenas desenvolvimento)
4. Escolha a localização:
   - `us-central1` - Baixa latência, boa disponibilidade
   - `southamerica-east1` - São Paulo, para usuários BR
5. Clique em "Criar"

### Firebase Storage

1. No menu lateral, clique em "Storage"
2. Clique em "Começar"
3. Aceite as regras padrão
4. Escolha a mesma região do Firestore
5. Clique em "Concluído"

---

## Gerar Credenciais

### Service Account Key (Backend)

1. Vá em "Configurações do projeto" (engrenagem)
2. Aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Confirme e baixe o arquivo JSON
5. Renomeie para `service-account-key.json`

**⚠️ Segurança:**
```bash
# Adicione ao .gitignore
echo "service-account-key.json" >> .gitignore
echo "*.json.bak" >> .gitignore

# Configure a variável de ambiente
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Web App Config (Frontend)

1. Vá em "Configurações do projeto" (engrenagem)
2. Role até "Seus apps"
3. Clique em "</>" (Web)
4. Registre o app com um nome (ex: "Appunture Web")
5. Copie o objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "appunture-dev.firebaseapp.com",
  projectId: "appunture-dev",
  storageBucket: "appunture-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Android App Config

1. Clique no ícone Android
2. Package name: `com.appunture.app`
3. Opcional: SHA-1 para Google Sign-In
4. Baixe `google-services.json`
5. Coloque em `android/app/`

### iOS App Config

1. Clique no ícone iOS
2. Bundle ID: `com.appunture.app`
3. Baixe `GoogleService-Info.plist`
4. Coloque em `ios/`

---

## Configurar Regras de Segurança

### Firestore Rules

Crie o arquivo `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funções auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.role == 'ADMIN';
    }
    
    // Pontos de acupuntura - leitura pública, escrita admin
    match /points/{pointId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Sintomas - leitura pública, escrita admin
    match /symptoms/{symptomId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Usuários - apenas o próprio usuário ou admin
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow write: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Favoritos - subcoleção do usuário
    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
    
    // Notas pessoais - subcoleção do usuário
    match /users/{userId}/notes/{noteId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

### Storage Rules

Crie o arquivo `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Imagens de pontos - leitura pública, escrita admin
    match /points/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.token.role == 'ADMIN';
    }
    
    // Imagens de perfil - apenas o próprio usuário
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // 5MB
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Uploads temporários
    match /temp/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Configurar Apps

### Expo/React Native

1. Instale as dependências:

```bash
cd frontend-mobile/appunture
npm install firebase @react-native-firebase/app @react-native-firebase/auth
```

2. Configure `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

3. Configure `.env`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=appunture-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=appunture-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Spring Boot Backend

1. Adicione a dependência ao `pom.xml`:

```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

2. Configure `application.yml`:

```yaml
firebase:
  project-id: ${FIREBASE_PROJECT_ID}
  storage-bucket: ${FIREBASE_STORAGE_BUCKET}
```

3. Defina variáveis de ambiente:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
export FIREBASE_PROJECT_ID=appunture-dev
export FIREBASE_STORAGE_BUCKET=appunture-dev.appspot.com
```

---

## Deploy de Regras

### Via Firebase CLI

1. Instale o Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Faça login:

```bash
firebase login
```

3. Inicialize o projeto:

```bash
firebase init
# Selecione: Firestore, Storage
# Escolha o projeto existente
```

4. Deploy das regras:

```bash
# Deploy de tudo
firebase deploy

# Apenas Firestore rules
firebase deploy --only firestore:rules

# Apenas Storage rules
firebase deploy --only storage
```

### Via Console (Alternativa)

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá para Firestore > Regras
3. Cole as regras e clique em "Publicar"

---

## Configuração de Índices

### Índices Compostos Firestore

Para queries complexas, crie índices em `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "points",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "meridian", "order": "ASCENDING" },
        { "fieldPath": "code", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "symptoms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "useCount", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy dos índices:

```bash
firebase deploy --only firestore:indexes
```

---

## Verificação Final

### Checklist

- [ ] Projeto Firebase criado
- [ ] Authentication configurado (Email, Google, Apple)
- [ ] Firestore Database criado
- [ ] Firebase Storage configurado
- [ ] Service Account Key baixada
- [ ] Web App registrado
- [ ] Regras de segurança publicadas
- [ ] Variáveis de ambiente configuradas

### Teste de Conectividade

```bash
# Backend
cd backend-java
mvn spring-boot:run
curl http://localhost:8080/health

# Se retornar {"status":"UP"}, Firebase está conectado

# Mobile
cd frontend-mobile/appunture
npm start
# Tente fazer login para verificar Auth
```

---

## Referências

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
