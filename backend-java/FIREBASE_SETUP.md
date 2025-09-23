# Configuração Firebase e Firebase Storage - TCC

## Visão Geral

Este projeto utiliza **Firebase Authentication** e **Firebase Storage** (Cloud Storage for Firebase), aproveitando os planos gratuitos para desenvolvimento de TCC.

## Limites do Plano Gratuito

### Firebase Authentication
- ✅ **10.000 verificações de telefone/mês**
- ✅ **50.000 usuários ativos mensais**
- ✅ **Autenticação por email/senha ilimitada**
- ✅ **Login social (Google, Facebook, etc.)**

### Firebase Storage
- ✅ **5 GB de armazenamento gratuito**
- ✅ **1 GB de tráfego de download por dia**
- ✅ **20.000 operações de download por dia**
- ✅ **20.000 operações de upload por dia**

## Configuração

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `appunture-tcc` 
4. Desabilite Google Analytics (opcional para TCC)

### 2. Ativar Authentication

1. No console Firebase, vá em **Authentication**
2. Clique em **Começar**
3. Aba **Sign-in method**:
   - Ative **Email/senha**
   - Opcionalmente ative **Google** para login social

### 3. Configurar Firebase Storage

1. No console Firebase, vá em **Storage**
2. Clique em **Começar**
3. Escolha as regras de segurança:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permite upload para usuários autenticados na pasta do usuário
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Permite leitura geral para arquivos públicos
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Permite acesso geral para usuários autenticados
    match /general/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Escolha a localização: **us-central1** (região gratuita)

### 4. Gerar Service Account Key

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto Firebase
3. **IAM e Admin** > **Contas de serviço**
4. Clique na conta de serviço do Firebase
5. **Chaves** > **Adicionar chave** > **Criar nova chave**
6. Escolha **JSON** e baixe o arquivo

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env` ou configure as variáveis de ambiente:

```bash
# Firebase
FIREBASE_PROJECT_ID=appunture-tcc
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"appunture-tcc",...}

# Firebase Storage
FIREBASE_STORAGE_BUCKET=appunture-tcc.appspot.com

# Opcional - desabilitar Firebase para desenvolvimento local
FIREBASE_ENABLED=false
```

### 6. Configuração Local (Desenvolvimento)

Para desenvolvimento local sem Firebase:

```yaml
# application-dev.yml
firebase:
  enabled: false

app:
  firebase:
    enabled: false
```

## Uso

### Autenticação Frontend

#### Web (React)
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  // Sua configuração
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login
const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  
  // Enviar token para backend
  return token;
};
```

#### Mobile (React Native)
```javascript
import storage from '@react-native-firebase/storage';

// Upload de imagem
const uploadImage = async (uri, folder = 'general') => {
  const filename = `${Date.now()}_image.jpg`;
  const reference = storage().ref(`${folder}/${filename}`);
  
  // Upload com progress tracking
  const uploadTask = reference.putFile(uri);
  
  uploadTask.on('state_changed', (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log(`Upload ${progress}% done`);
  });

  await uploadTask;
  const downloadURL = await reference.getDownloadURL();
  return downloadURL;
};

// Download de arquivo
const downloadFile = async (url, localPath) => {
  const reference = storage().refFromURL(url);
  await reference.writeToFile(localPath);
  return localPath;
};
```

### Endpoints da API

#### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/verify-token` - Verificar token Firebase
- `POST /api/auth/send-email-verification` - Enviar verificação de email
- `POST /api/auth/send-password-reset` - Enviar reset de senha

#### Firebase Storage
- `POST /api/storage/upload` - Upload de arquivo
- `GET /api/storage/signed-url/{fileName}` - URL assinada temporária
- `DELETE /api/storage/{fileName}` - Deletar arquivo (admin)
- `GET /api/storage/list` - Listar arquivos (admin)
- `GET /api/storage/info/{fileName}` - Informações do arquivo
- `GET /api/storage/exists/{fileName}` - Verificar se arquivo existe

## Segurança

### Headers necessários
```
Authorization: Bearer <firebase-id-token>
```

### Roles
- `ROLE_USER` - Usuário padrão
- `ROLE_ADMIN` - Administrador

## Desenvolvimento Local

### Sem Firebase (modo offline)
```bash
# Definir variável de ambiente
export FIREBASE_ENABLED=false

# Executar aplicação
./mvnw spring-boot:run
```

### Com Firebase Emulator
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar emuladores
firebase init emulators

# Executar emuladores
firebase emulators:start
```

## Monitoramento

- **Health Check**: `GET /api/actuator/health`
- **Firebase Status**: `GET /api/auth/status`
- **Storage Status**: `GET /api/storage/status`

## Troubleshooting

### Erro: "Firebase Auth not configured"
- Verificar se `FIREBASE_SERVICE_ACCOUNT_KEY` está configurado
- Verificar se o arquivo de service account é válido

### Erro: "Firebase Storage not available"
- Verificar se Firebase Storage está habilitado no console
- Verificar se o bucket existe: `appunture-tcc.appspot.com`
- Verificar se as regras de segurança estão corretas

### Upload falha
- Verificar tamanho do arquivo (máximo 10MB)
- Verificar tipo de arquivo permitido
- Verificar se o bucket tem espaço disponível

## Custos Estimados (Plano Gratuito)

- **Authentication**: Gratuito até 50k usuários
- **Storage**: Gratuito até 5GB + 1GB tráfego/dia
- **Operações**: 20k uploads + 20k downloads por dia

Para um TCC, esses limites são mais que suficientes!