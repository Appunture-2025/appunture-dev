# Local Development Setup

Guia completo para configurar o ambiente de desenvolvimento local do Appunture.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração Firebase](#configuração-firebase)
- [Backend Setup](#backend-setup)
- [Frontend Mobile Setup](#frontend-mobile-setup)
- [Frontend Admin Setup](#frontend-admin-setup)
- [Verificação](#verificação)
- [Troubleshooting](#troubleshooting)

## Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Verificação |
|----------|---------------|-------------|
| Java | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| Git | 2.30+ | `git --version` |

### Instalação (macOS)

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Java 17 (Temurin/OpenJDK)
brew install openjdk@17
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc

# Maven
brew install maven

# Node.js
brew install node@18

# Expo CLI
npm install -g @expo/cli
```

### Instalação (Windows)

```powershell
# Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; 
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; 
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Java 17
choco install temurin17

# Maven
choco install maven

# Node.js
choco install nodejs-lts

# Expo CLI
npm install -g @expo/cli
```

### Instalação (Ubuntu/Debian)

```bash
# Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# Maven
sudo apt install maven

# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Expo CLI
npm install -g @expo/cli
```

## Configuração Firebase

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nome: `appunture-dev` (ou similar)
4. Desabilite Google Analytics (opcional para dev)
5. Clique em "Criar projeto"

### 2. Habilitar Serviços

**Firebase Authentication:**
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Habilite "E-mail/senha"
4. (Opcional) Habilite "Google" e "Apple"

**Firestore Database:**
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione modo de produção
4. Escolha uma região (us-central1 recomendado)

**Firebase Storage:**
1. No menu lateral, clique em "Storage"
2. Clique em "Começar"
3. Use as regras padrão de produção

### 3. Gerar Service Account Key

1. Vá em "Configurações do projeto" (engrenagem)
2. Aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Salve o arquivo como `service-account-key.json`
5. **⚠️ NUNCA commite este arquivo!**

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Firebase/Google Cloud
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
export FIREBASE_PROJECT_ID=your-project-id
export FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

Carregue as variáveis:

```bash
# Linux/macOS
source .env.local

# Windows PowerShell (run as Administrator if setting system-wide variables)
# Note: This sets variables for the current session only
Get-Content .env.local | ForEach-Object { 
    if ($_ -match '^\s*export\s+(.+)=(.+)') { 
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") 
    } 
}
# For permanent user-level variables, replace "Process" with "User"
```

## Backend Setup

### 1. Navegar para o diretório

```bash
cd backend-java
```

### 2. Verificar configuração

Crie/edite `src/main/resources/application-dev.yml`:

```yaml
spring:
  profiles:
    active: dev

firebase:
  project-id: ${FIREBASE_PROJECT_ID}
  storage-bucket: ${FIREBASE_STORAGE_BUCKET}

server:
  port: 8080

logging:
  level:
    com.appunture: DEBUG
```

### 3. Build e execução

```bash
# Build
mvn clean compile

# Executar testes
mvn test

# Executar aplicação
mvn spring-boot:run

# Ou com profile específico
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 4. Verificar funcionamento

```bash
# Health check
curl http://localhost:8080/health

# Resposta esperada:
# {"status":"UP","timestamp":"..."}

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

## Frontend Mobile Setup

### 1. Navegar para o diretório

```bash
cd frontend-mobile/appunture
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie e edite o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite `.env`:

```bash
# API Backend
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Firebase (obtenha do Firebase Console > Configurações do projeto > Apps da Web)
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Executar o app

```bash
# Iniciar Expo
npm start

# Ou específico por plataforma
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Navegador
```

### 5. Testar com Expo Go

1. Instale o app "Expo Go" no seu celular
2. Escaneie o QR code exibido no terminal
3. O app será carregado no seu dispositivo

**Nota:** Para Android físico, use o IP da máquina em vez de localhost:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api
```

## Frontend Admin Setup

### 1. Navegar para o diretório

```bash
cd frontend-admin
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie e edite o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```bash
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_STORAGE_BUCKET=seu-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Executar o admin

```bash
npm run dev

# Acesse: http://localhost:5173
```

## Verificação

### Checklist de Setup

- [ ] `java -version` mostra Java 17+
- [ ] `mvn -version` mostra Maven 3.8+
- [ ] `node -version` mostra Node 18+
- [ ] Firebase project criado
- [ ] Service account key baixada
- [ ] Variáveis de ambiente configuradas
- [ ] Backend responde em http://localhost:8080/health
- [ ] Swagger UI acessível em http://localhost:8080/swagger-ui.html
- [ ] App mobile carrega no Expo Go
- [ ] Admin carrega em http://localhost:5173

### Executar Stack Completa

Script para iniciar todos os serviços:

```bash
#!/bin/bash
# start-dev.sh

# Terminal 1: Backend
cd backend-java && mvn spring-boot:run &

# Terminal 2: Mobile
cd frontend-mobile/appunture && npm start &

# Terminal 3: Admin
cd frontend-admin && npm run dev &

echo "Stack iniciada!"
echo "Backend: http://localhost:8080"
echo "Mobile: QR code no terminal"
echo "Admin: http://localhost:5173"
```

## Troubleshooting

### Erros Comuns

#### "GOOGLE_APPLICATION_CREDENTIALS not set"

```bash
# Verifique se a variável está definida
echo $GOOGLE_APPLICATION_CREDENTIALS

# Recarregue o arquivo
source .env.local
```

#### "Port 8080 already in use"

```bash
# Encontre o processo
lsof -i :8080

# Mate o processo
kill -9 <PID>

# Ou use outra porta
mvn spring-boot:run -Dserver.port=8081
```

#### "Unable to connect to Firebase"

1. Verifique se o `service-account-key.json` existe
2. Confirme que o caminho está correto
3. Verifique se o projeto Firebase está ativo
4. Teste conectividade: `curl https://firestore.googleapis.com`

#### "Metro bundler failed to start"

```bash
# Limpe cache do Expo
npx expo start --clear

# Ou limpe node_modules
rm -rf node_modules
npm install
```

#### "Android Emulator not detected"

```bash
# Verifique se o emulador está rodando
adb devices

# Inicie o emulador manualmente
emulator -avd <nome_do_avd>
```

#### "iOS Simulator not available"

```bash
# Verifique Xcode instalado (macOS apenas)
xcode-select --install

# Aceite a licença
sudo xcodebuild -license accept
```

### Logs Úteis

```bash
# Backend logs detalhados
cd backend-java
mvn spring-boot:run -Dlogging.level.com.appunture=DEBUG

# Expo logs
npx expo start --verbose

# Limpar caches
# Maven
rm -rf ~/.m2/repository/com/appunture

# npm
npm cache clean --force

# Expo
npx expo start --clear
```

## Próximos Passos

1. [Variáveis de Ambiente](environment-variables.md) - Referência completa
2. [Troubleshooting](troubleshooting.md) - Problemas comuns
3. [Firebase Setup](firebase-setup.md) - Configuração avançada
