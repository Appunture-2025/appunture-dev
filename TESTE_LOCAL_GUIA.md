# 🧪 Guia de Teste Local - Appunture

## 📋 Pré-requisitos

- ✅ Java 17+ instalado
- ✅ Node.js 18+ instalado
- ✅ Maven configurado
- ✅ serviceAccount.json na raiz do projeto
- ✅ Expo CLI instalado (`npm install -g expo-cli`)

## 🚀 Como Iniciar

### 1. Backend (Terminal 1)

```powershell
cd d:\_repos\appunture-dev\backend-java
.\run-local.ps1
```

**O que acontece:**

- Compila o projeto Java
- Inicia servidor Spring Boot em http://localhost:8080
- Profile: `local` (application-local.yml)
- Logs detalhados (DEBUG level)

**Aguarde até ver:**

```
Started AppuntureBackendApplication in X.XXX seconds
```

### 2. Frontend (Terminal 2)

```powershell
cd d:\_repos\appunture-dev\frontend-mobile\appunture
.\run-local.ps1
```

**O que acontece:**

- Instala dependências (se necessário)
- Inicia Expo Dev Server em http://localhost:8081
- Aponta para backend local (localhost:8080)

**Aguarde até ver:**

```
Metro waiting on exp://192.168.X.X:8081
```

### 3. Abrir App

**Opção A - Expo Go (Celular):**

1. Instale Expo Go no celular
2. Escaneie o QR code que aparece no terminal
3. ⚠️ **IMPORTANTE:** Se o celular não conectar, atualize o IP no .env:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.X.X:8080/api
   ```

**Opção B - Emulador Android:**

- Pressione `a` no terminal do Expo

**Opção C - Simulador iOS:**

- Pressione `i` no terminal do Expo

**Opção D - Web Browser:**

- Pressione `w` no terminal do Expo
- Abre em http://localhost:8081

## 🧪 Cenários de Teste

### Teste 1: SVG Body Map

1. Fazer login no app
2. Ir para aba "Explorar"
3. Selecionar um ponto (ex: ST-1)
4. Verificar se as imagens SVG aparecem na galeria

**Debug:**

- Backend logs devem mostrar: `GET /points/ST-1`
- Verificar `image_refs` no response
- URLs devem ser: `gs://appunture-tcc.firebasestorage.app/body-map/ST.svg`

### Teste 2: Chat com IA

1. Fazer login no app
2. Ir para aba "Chatbot"
3. Enviar mensagem: "Olá, me explique sobre acupuntura"
4. Verificar resposta da IA Gemini

**Debug:**

- Backend logs devem mostrar:
  ```
  POST /api/chat
  Sending message to Vertex AI: Olá...
  Received response from Vertex AI
  ```
- Se erro, verificar:
  - `serviceAccount.json` está na pasta backend-java
  - Permissão `aiplatform.user` no service account
  - Vertex AI API habilitada no projeto

### Teste 3: Firebase Storage

1. Verificar se imagens SVG carregam
2. Se não carregar, testar URL direta:
   ```
   https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FST.svg?alt=media
   ```

**Debug:**

- Backend logs: `Firebase Storage initialized`
- Frontend: Abrir DevTools (F12) e verificar Network tab

## 🔍 Logs Importantes

### Backend - Sucesso:

```
✅ Firebase initialized successfully
✅ Firestore connected
✅ Vertex AI ChatClient created
✅ Started AppuntureBackendApplication
```

### Backend - Erros Comuns:

```
❌ Error initializing Firebase: ... (serviceAccount.json inválido)
❌ Error reading credential file ... (caminho errado)
❌ Permission denied on Vertex AI ... (sem permissão aiplatform.user)
```

### Frontend - Sucesso:

```
✅ API connected: 200
✅ Points loaded: 361
✅ User authenticated
```

### Frontend - Erros Comuns:

```
❌ Network Error: ... (backend não está rodando)
❌ 403 Forbidden: ... (token expirado, fazer login novamente)
❌ 500 Internal Server Error: ... (erro no backend, ver logs)
```

## 📝 Arquivos Modificados

Durante o setup local, os seguintes arquivos foram criados/modificados:

**Backend:**

- ✅ `backend-java/src/main/resources/application-local.yml` (criado)
- ✅ `backend-java/run-local.ps1` (criado)
- ✅ `backend-java/CLOUD_RUN_BACKUP_README.md` (backup de prod)

**Frontend:**

- ✅ `frontend-mobile/appunture/.env` (modificado para localhost)
- ✅ `frontend-mobile/appunture/.env.production.backup` (backup)
- ✅ `frontend-mobile/appunture/.env.README.md` (documentação)
- ✅ `frontend-mobile/appunture/run-local.ps1` (criado)

## 🔄 Restaurar Produção

Quando terminar os testes locais:

**Backend:**

```powershell
# Não precisa restaurar, Cloud Run mantém config original
```

**Frontend:**

```powershell
cd frontend-mobile/appunture
Copy-Item ".env.production.backup" ".env" -Force
npx expo start --clear
```

## 🐛 Troubleshooting

### Backend não inicia

1. Verificar Java version:

   ```powershell
   java -version  # Deve ser 17+
   ```

2. Verificar serviceAccount.json:

   ```powershell
   Test-Path .\serviceAccount.json
   ```

3. Limpar e recompilar:
   ```powershell
   .\mvnw.cmd clean package -DskipTests
   ```

### Frontend não conecta

1. Verificar se backend está rodando:

   ```powershell
   curl http://localhost:8080/api/health
   ```

2. Se usar celular, atualizar IP no .env:

   ```powershell
   ipconfig | Select-String "IPv4"
   # Atualizar EXPO_PUBLIC_API_BASE_URL com o IP encontrado
   ```

3. Limpar cache do Expo:
   ```powershell
   npx expo start --clear
   ```

### SVGs não carregam

1. Verificar se Firebase Storage está configurado:

   - Bucket: `appunture-tcc.firebasestorage.app`
   - Regras: permitir leitura pública

2. Testar URL direta no browser:

   ```
   https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FST.svg?alt=media
   ```

3. Verificar image_refs no response:
   ```powershell
   curl http://localhost:8080/api/points/ST-1
   ```

### Chat IA não responde

1. Verificar logs do backend para:

   - `ChatClient created`
   - `Sending message to Vertex AI`
   - Erros de permissão

2. Verificar se Vertex AI API está habilitada:

   ```powershell
   gcloud services list --enabled | Select-String "aiplatform"
   ```

3. Verificar permissões do service account:
   ```powershell
   gcloud projects get-iam-policy appunture-tcc --flatten="bindings[].members" --filter="bindings.members:*compute*"
   ```

## 📊 Endpoints para Testar

### Health Check:

```
GET http://localhost:8080/api/health
```

### Pontos:

```
GET http://localhost:8080/api/points
GET http://localhost:8080/api/points/ST-1
```

### Chat (requer autenticação):

```
POST http://localhost:8080/api/chat
Headers: Authorization: Bearer <token>
Body: {"message": "teste"}
```

### Sintomas:

```
GET http://localhost:8080/api/symptoms
```

## 💡 Dicas

1. **Use 2 terminais:** Um para backend, outro para frontend
2. **Logs detalhados:** Profile `local` tem DEBUG level
3. **Hot Reload:** Frontend recarrega automaticamente, backend precisa reiniciar
4. **DevTools:** Use F12 no browser para debug do frontend
5. **Postman/Insomnia:** Para testar endpoints do backend isoladamente
