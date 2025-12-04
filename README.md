# Appunture

Aplicativo móvel para consulta de pontos de acupuntura com assistente inteligente baseado em IA.

## Descrição

Appunture é um sistema desenvolvido como TCC que permite consultar pontos de acupuntura, suas indicações terapêuticas e localização anatômica. O aplicativo conta com um assistente de IA que sugere pontos com base nos sintomas relatados pelo usuário.

**Principais funcionalidades:**

- Consulta de pontos de acupuntura por nome, código ou meridiano
- Assistente de IA para recomendações baseadas em sintomas
- Sistema de favoritos
- Funcionamento offline com sincronização automática
- Modo escuro

## Tecnologias

- **Backend:** Spring Boot 3.2.5, Java 17, Spring AI com Vertex AI Gemini
- **Frontend:** React Native 0.79, Expo SDK 53
- **Banco de dados:** Firebase Firestore
- **Autenticação:** Firebase Auth
- **Deploy:** Google Cloud Run

## Estrutura

```
appunture-dev/
├── backend-java/           # API REST Spring Boot
├── frontend-mobile/
│   └── appunture/          # App React Native
└── doc/                    # Documentação do TCC
```

## Pré-requisitos

- Java 17+
- Node.js 20+
- Conta Firebase com projeto configurado
- Conta Google Cloud (para IA e deploy)

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/Appunture-2025/appunture-dev.git
cd appunture-dev
```

### 2. Configurar Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto ou use um existente
3. Habilite: Authentication (Email/Google), Firestore, Storage
4. Baixe o arquivo de credenciais do service account (JSON)
5. Salve como `backend-java/src/main/resources/firebase-service-account.json`

### 3. Configurar o Backend

```bash
cd backend-java

# Criar arquivo de configuração
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Editar application.properties com suas configurações:
# - spring.cloud.gcp.project-id=SEU_PROJECT_ID
# - spring.ai.vertex.ai.gemini.project-id=SEU_PROJECT_ID
```

**Variáveis importantes:**

```properties
spring.cloud.gcp.project-id=seu-projeto-firebase
spring.ai.vertex.ai.gemini.project-id=seu-projeto-gcp
app.firebase.enabled=true
```

### 4. Executar o Backend

```bash
cd backend-java

# Com Maven Wrapper
./mvnw spring-boot:run

# Ou com Maven instalado
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui.html`

### 5. Configurar o Frontend

```bash
cd frontend-mobile/appunture

# Instalar dependências
npm install

# Criar arquivo de configuração
cp .env.example .env
```

**Editar `.env` com as configurações do Firebase:**

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_API_URL=http://localhost:8080
```

### 6. Executar o Frontend

```bash
cd frontend-mobile/appunture

npm start
```

Escaneie o QR code com o app Expo Go (Android/iOS) ou pressione `a` para abrir no emulador Android.

## Testes

```bash
# Backend
cd backend-java
./mvnw test

# Frontend
cd frontend-mobile/appunture
npm test
```

## Deploy

O backend está configurado para deploy no Google Cloud Run via Cloud Build:

```bash
cd backend-java
gcloud builds submit --config=cloudbuild.yaml
```

## Licença

Todos os direitos reservados. Este software é proprietário e não pode ser copiado, modificado ou distribuído sem autorização prévia dos autores.
