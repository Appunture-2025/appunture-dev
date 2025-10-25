# Appunture Backend - Firebase + Firestore + Cloud Run

## 🎯 **Nova Arquitetura (CUSTO ZERO para TCC)**

```
Firebase Auth + Firebase Storage + Firestore + Cloud Run
                                               ↳ R$ 0,00/mês
```

### **✅ Tecnologias Utilizadas:**
- **Spring Boot 3.2.5** - Framework backend
- **Java 17** - Linguagem de programação
- **Firebase Auth** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Cloud Run** - Deploy containerizado
- **Docker** - Containerização

### **💰 Custos TCC (Plano Gratuito):**
- **Firebase Auth**: 50k usuários/mês
- **Firestore**: 50k reads/dia + 20k writes/dia + 1GB storage
- **Firebase Storage**: 5GB + 1GB tráfego/dia
- **Cloud Run**: 2M requests/mês + 400k GB-segundos/mês

## 🚀 **Quick Start**

### **1. Pré-requisitos**
```bash
# Instalar Java 17
sdk install java 17.0.8-tem

# Instalar Maven 3.9+
sdk install maven 3.9.6

# Instalar Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login no Google Cloud
gcloud auth login
gcloud auth application-default login
```

### **2. Configurar Firebase**
```bash
# 1. Criar projeto Firebase
https://console.firebase.google.com/

# 2. Ativar Authentication (Email/Password)
# 3. Ativar Firestore (modo teste, região us-central1)
# 4. Ativar Storage (modo teste)
# 5. Gerar Service Account Key
#    IAM & Admin > Service Accounts > Create Key (JSON)
```

### **3. Configurar Ambiente Local**
```bash
# Clonar repositório
git clone <repo-url>
cd backend-java

# Configurar credenciais Firebase
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
export FIREBASE_PROJECT_ID="seu-projeto-firebase"
export FIREBASE_ENABLED="true"

# Executar aplicação
./mvnw spring-boot:run
```

### **4. Deploy para Cloud Run**
```bash
# Configurar projeto
gcloud config set project SEU_PROJECT_ID

# Deploy automático
chmod +x deploy.sh
./deploy.sh
```

## 📊 **Estrutura Firestore**

### **Collections:**

#### **users/**
```javascript
{
  id: "doc_id",
  firebaseUid: "firebase_user_uid",
  email: "user@example.com",
  name: "Nome do Usuário",
  role: "USER" | "ADMIN",
  enabled: true,
  emailVerified: false,
  profileImageUrl: "https://...",
  phoneNumber: "+5511999999999",
  favoritePointIds: ["point1", "point2"],
  createdAt: "2024-01-01T00:00:00",
  updatedAt: "2024-01-01T00:00:00"
}
```

#### **points/**
```javascript
{
  id: "doc_id",
  code: "VG20",
  name: "Baihui",
  description: "Ponto no topo da cabeça...",
  meridian: "Vaso Governador",
  location: "No topo da cabeça...",
  indication: "Indicado para...",
  coordinates: { x: 250.5, y: 100.2 },
  imageUrls: ["https://storage..."],
  symptomIds: ["symptom1", "symptom2"],
  tags: ["cabeça", "yang"],
  category: "principais",
  favoriteCount: 15,
  viewCount: 234,
  createdAt: "2024-01-01T00:00:00",
  updatedAt: "2024-01-01T00:00:00",
  createdBy: "admin_user_id"
}
```

#### **symptoms/**
```javascript
{
  id: "doc_id",
  name: "Dor de Cabeça",
  description: "Cefaleia tensional...",
  category: "Dor",
  tags: ["dor", "cabeça", "tensão"],
  pointIds: ["point1", "point2"],
  severity: 7,
  priority: 1,
  useCount: 45,
  associatedPointsCount: 8,
  createdAt: "2024-01-01T00:00:00",
  updatedAt: "2024-01-01T00:00:00",
  createdBy: "admin_user_id"
}
```

## 🔥 **Firebase Configuration**

### **Regras Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     resource.data.role == 'ADMIN' && 
                     request.auth.token.role == 'ADMIN';
    }
    
    // Pontos: todos podem ler, apenas admins podem escrever
    match /points/{pointId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'ADMIN';
    }
    
    // Sintomas: todos podem ler, apenas admins podem escrever
    match /symptoms/{symptomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'ADMIN';
    }
  }
}
```

### **Regras Storage**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Pasta do usuário
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pasta pública
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'ADMIN';
    }
    
    // Validações
    match /{allPaths=**} {
      allow write: if request.resource.size < 10 * 1024 * 1024 && // 10MB
                      request.resource.contentType.matches('image/.*|application/pdf');
    }
  }
}
```

## 🛠️ **Desenvolvimento**

### **Executar Localmente**
```bash
# Backend
./mvnw spring-boot:run

# Testes
./mvnw test

# Build
./mvnw clean package
```

### **APIs Disponíveis**
- **Swagger UI**: http://localhost:8080/api/swagger-ui/index.html
- **Health Check**: `GET /api/health`, `GET /api/health/detailed`
- **Auth (Firebase ID Token obrigatório)**:
  - `GET /api/auth/profile`
  - `PUT /api/auth/profile`
  - `POST /api/auth/sync`
  - `GET /api/auth/me`
  - `POST /api/auth/favorites/{pointId}`
  - `DELETE /api/auth/favorites/{pointId}`
- **Points**: CRUD em `/api/points/**` (leituras públicas autenticadas, criação/edição exclusivas ROLE_ADMIN)
- **Symptoms**: CRUD em `/api/symptoms/**` (leituras públicas autenticadas, criação/edição exclusivas ROLE_ADMIN)
- **Storage**: `/api/storage/**` (upload, signed URLs, metadados via Firebase Storage)
- **Admin**: `/api/admin/**` (ROLE_ADMIN)

### **Variáveis de Ambiente**
```bash
# Firebase
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
FIREBASE_PROJECT_ID=appunture-tcc
FIREBASE_ENABLED=true

# Cloud Run (produção)
GOOGLE_CLOUD_PROJECT=appunture-tcc
SPRING_PROFILES_ACTIVE=prod
```

## 📱 **Integração Frontend**

### **React Native**
```javascript
// Instalar SDKs
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/storage @react-native-firebase/firestore

// Usar APIs
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Login
const user = await auth().signInWithEmailAndPassword(email, password);
const token = await user.getIdToken();

// API Backend
fetch('https://your-backend-url/api/points', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **React Web**
```javascript
// Instalar SDKs
npm install firebase

// Configurar
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 🔄 **Migração de Dados**

### **Script de Migração (PostgreSQL → Firestore)**
```bash
# Executar apenas uma vez para migrar dados existentes
./mvnw exec:java -Dexec.mainClass="com.appunture.backend.migration.DataMigration"
```

## ⚡ **Performance e Monitoramento**

### **Cloud Run Metrics**
- **CPU**: 1 core (suficiente para TCC)
- **Memory**: 1Gi
- **Concurrency**: 100 requests
- **Auto-scaling**: 0-10 instâncias

### **Firestore Optimization**
- **Composite Indexes**: Criados automaticamente
- **Collection Group Queries**: Para busca avançada
- **Offline Support**: Cache local automático

## 🎓 **Para TCC**

### **Vantagens:**
- ✅ **Custo Zero** para desenvolvimento e apresentação
- ✅ **Escalabilidade** automática do Google
- ✅ **Tecnologia Moderna** (Firebase, Firestore, Cloud Run)
- ✅ **Foco no Desenvolvimento** (não na infraestrutura)
- ✅ **Mobile-First** (offline-first com sincronização)
- ✅ **Security** integrada com Firebase Auth

### **Limitações Gratuitas:**
- Firestore: 50k reads/dia (suficiente para demos)
- Storage: 5GB (suficiente para imagens de acupuntura)
- Cloud Run: 2M requests/mês (mais que suficiente)

---

## 📞 **Suporte**

Para dúvidas sobre implementação ou deploy, consulte:
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Spring Boot Firebase Integration](https://spring.io/guides)