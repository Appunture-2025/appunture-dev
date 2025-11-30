# Troubleshooting Guide

Guia de resolução de problemas comuns no desenvolvimento do Appunture.

## 📋 Índice

- [Backend (Java/Spring Boot)](#backend-javaspring-boot)
- [Frontend Mobile (Expo/React Native)](#frontend-mobile-exporeact-native)
- [Frontend Admin (React/Vite)](#frontend-admin-reactvite)
- [Firebase](#firebase)
- [Docker](#docker)
- [CI/CD](#cicd)

---

## Backend (Java/Spring Boot)

### ❌ "GOOGLE_APPLICATION_CREDENTIALS not set"

**Sintoma**: Aplicação não inicia, erro de credenciais Firebase.

**Solução**:
```bash
# Verifique se a variável está definida
echo $GOOGLE_APPLICATION_CREDENTIALS

# Se vazio, defina o caminho
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Verifique se o arquivo existe
ls -la $GOOGLE_APPLICATION_CREDENTIALS
```

### ❌ "Port 8080 already in use"

**Sintoma**: Erro ao iniciar a aplicação, porta ocupada.

**Solução**:
```bash
# Encontre o processo usando a porta
lsof -i :8080

# Mate o processo
kill -9 <PID>

# Ou use outra porta
mvn spring-boot:run -Dserver.port=8081
```

### ❌ "Unable to connect to Firestore"

**Sintoma**: Timeouts ou erros de conexão com Firestore.

**Solução**:
1. Verifique conectividade com internet
2. Confirme que o projeto Firebase está ativo
3. Verifique se as credenciais estão corretas:

```bash
# Teste de conectividade
curl https://firestore.googleapis.com

# Verifique o projeto ID
cat $GOOGLE_APPLICATION_CREDENTIALS | grep project_id
```

### ❌ "Maven build fails"

**Sintoma**: Erros durante `mvn compile` ou `mvn package`.

**Solução**:
```bash
# Limpe o cache do Maven
mvn clean

# Atualize dependências
mvn dependency:resolve

# Rebuild completo
mvn clean install -DskipTests

# Se persistir, limpe o repositório local
rm -rf ~/.m2/repository/com/appunture
mvn clean install
```

### ❌ "Tests failing with Firebase errors"

**Sintoma**: Testes falham com erros de Firebase.

**Solução**:
```bash
# Execute com perfil de teste (mocks Firebase)
mvn test -Dspring.profiles.active=test

# Verifique se application-test.yml está configurado
cat src/test/resources/application-test.yml
```

---

## Frontend Mobile (Expo/React Native)

### ❌ "Metro bundler failed to start"

**Sintoma**: Expo não inicia, erro no Metro bundler.

**Solução**:
```bash
# Limpe o cache do Expo
npx expo start --clear

# Se persistir, limpe node_modules
rm -rf node_modules
rm -rf .expo
npm install

# Limpe cache do npm
npm cache clean --force
```

### ❌ "Unable to resolve module"

**Sintoma**: Erro de importação de módulos.

**Solução**:
```bash
# Reinstale dependências
rm -rf node_modules
npm install

# Limpe cache do Metro
npx expo start --clear

# Verifique tsconfig.json
cat tsconfig.json
```

### ❌ "Network request failed" (API)

**Sintoma**: Chamadas à API falham no dispositivo/emulador.

**Solução**:

**Android Emulator**:
```typescript
// Use IP especial do emulador
const API_URL = 'http://10.0.2.2:8080/api';
```

**iOS Simulator**:
```typescript
// Use localhost
const API_URL = 'http://localhost:8080/api';
```

**Dispositivo físico**:
```typescript
// Use IP da máquina na rede local
const API_URL = 'http://192.168.1.100:8080/api';

// Encontre seu IP:
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows
ipconfig
```

### ❌ "Firebase token invalid"

**Sintoma**: Erro 401 nas chamadas à API.

**Solução**:
```typescript
// Force token refresh
const user = firebaseAuth.currentUser;
const token = await user?.getIdToken(true); // true = force refresh

// Verifique se o token está sendo enviado
console.log('Token:', token?.substring(0, 20) + '...');
```

### ❌ "Android Emulator not detected"

**Sintoma**: Expo não encontra emulador Android.

**Solução**:
```bash
# Verifique se ADB está funcionando
adb devices

# Se vazio, inicie o emulador manualmente
emulator -list-avds
emulator -avd <nome_do_avd>

# Reinicie o ADB
adb kill-server
adb start-server
```

### ❌ "iOS build fails on M1/M2 Mac"

**Sintoma**: Build iOS falha em Macs Apple Silicon.

**Solução**:
```bash
# Limpe pods
cd ios
rm -rf Pods
rm Podfile.lock

# Instale com Rosetta (se necessário)
arch -x86_64 pod install

# Ou para M1 nativo
pod install
```

### ❌ "SQLite database locked"

**Sintoma**: Erros ao acessar banco local.

**Solução**:
```bash
# Limpe dados do app
npx expo start --clear

# No dispositivo/emulador:
# Settings > Apps > Appunture > Clear Data
```

---

## Frontend Admin (React/Vite)

### ❌ "Vite HMR not working"

**Sintoma**: Hot reload não funciona.

**Solução**:
```bash
# Reinicie o servidor
npm run dev

# Limpe cache
rm -rf node_modules/.vite
npm run dev
```

### ❌ "CORS error"

**Sintoma**: Erros de CORS ao chamar API.

**Solução**:
1. Verifique se o backend está rodando
2. Confirme a URL da API no `.env.local`:

```bash
VITE_API_URL=http://localhost:8080/api
```

3. Verifique configuração CORS no backend:

```yaml
# application-dev.yml
app:
  security:
    cors:
      allowed-origin-patterns:
        - http://localhost:*
```

### ❌ "Firebase Auth popup blocked"

**Sintoma**: Popup de login Google/Apple bloqueado.

**Solução**:
- Permita popups no navegador para localhost
- Use redirect ao invés de popup:

```typescript
// Em vez de signInWithPopup, use:
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

await signInWithRedirect(auth, new GoogleAuthProvider());
```

---

## Firebase

### ❌ "Permission denied" no Firestore

**Sintoma**: Erro de permissão ao ler/escrever dados.

**Solução**:
1. Verifique as regras no Firebase Console
2. Confirme que o usuário está autenticado:

```typescript
const user = firebaseAuth.currentUser;
console.log('User:', user?.uid);
```

3. Verifique custom claims (role):

```typescript
const token = await user?.getIdTokenResult();
console.log('Claims:', token?.claims);
```

### ❌ "Storage quota exceeded"

**Sintoma**: Uploads falham, erro de quota.

**Solução**:
1. Verifique uso no Firebase Console > Storage
2. Delete arquivos não utilizados
3. Upgrade para plano Blaze se necessário

### ❌ "Invalid API Key"

**Sintoma**: Erro de API key inválida.

**Solução**:
1. Regenere a API key no Firebase Console
2. Atualize em todos os lugares:
   - `.env` (mobile)
   - `.env.local` (admin)
   - Variáveis de CI/CD

### ❌ "Auth domain not authorized"

**Sintoma**: Erro ao fazer login, domínio não autorizado.

**Solução**:
1. Firebase Console > Authentication > Settings
2. Adicione o domínio em "Authorized domains"
3. Para desenvolvimento local, adicione `localhost`

---

## Docker

### ❌ "Docker image build fails"

**Sintoma**: Erro durante docker build.

**Solução**:
```bash
# Build com logs detalhados
docker build --progress=plain -t appunture-backend .

# Se erro de memória
docker system prune -a
docker build --no-cache -t appunture-backend .
```

### ❌ "Container can't connect to Firebase"

**Sintoma**: Container não conecta ao Firebase.

**Solução**:
```bash
# Monte o arquivo de credenciais
docker run -v /path/to/service-account.json:/app/credentials.json \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  appunture-backend
```

---

## CI/CD

### ❌ "GitHub Actions workflow failing"

**Sintoma**: Workflow falha no GitHub Actions.

**Solução**:
1. Verifique os secrets configurados:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY`
   - `GOOGLE_APPLICATION_CREDENTIALS`

2. Verifique logs do workflow para detalhes

3. Execute localmente para debug:
```bash
# Simule o workflow localmente
mvn clean test
npm run lint
npm test
```

### ❌ "Deployment to Cloud Run fails"

**Sintoma**: Deploy no Cloud Run falha.

**Solução**:
1. Verifique permissões da service account
2. Confirme que a imagem Docker está no Container Registry
3. Verifique logs no Cloud Console

```bash
# Deploy manual para debug
gcloud run deploy appunture-backend \
  --image gcr.io/PROJECT_ID/appunture-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Comandos Úteis de Debug

### Backend

```bash
# Logs detalhados
mvn spring-boot:run -Dlogging.level.com.appunture=DEBUG

# Métricas
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

### Mobile

```bash
# Logs do React Native
npx react-native log-android
npx react-native log-ios

# Debug remoto
npx expo start --dev-client
```

### Firebase

```bash
# Logs do Firebase
firebase functions:log

# Emulador local
firebase emulators:start
```

---

## Recursos Adicionais

- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)
- [Spring Boot Troubleshooting](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html)
- [Firebase Troubleshooting](https://firebase.google.com/support/troubleshooter)
- [Expo Debugging](https://docs.expo.dev/debugging/tools/)

---

## Ainda com Problemas?

1. Busque na [documentação do projeto](../README.md)
2. Verifique issues existentes no GitHub
3. Abra uma nova issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs de erro
   - Ambiente (OS, versões)
