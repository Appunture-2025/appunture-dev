# 🔧 Configuração IntelliJ para Rodar Localmente

## ✅ Configuração Rápida

### 1. Editar Run Configuration

1. **Abrir Edit Configurations:**

   - Menu: Run → Edit Configurations...
   - Ou: Clique na dropdown ao lado do botão Run (canto superior direito)

2. **Selecionar BackendApplication (ou criar nova):**

   - Se não existir: Clique em `+` → Spring Boot
   - Main class: `com.appunture.backend.BackendApplication`

3. **Configurar Environment:**

   **Opção A - Usar profile local (recomendado):**

   ```
   Active profiles: local
   ```

   **Opção B - Continuar com dev mas configurar caminho:**

   ```
   Active profiles: dev
   Environment variables: SERVICE_ACCOUNT_PATH=D:\_repos\appunture-dev\serviceAccount.json
   ```

4. **Apply → OK**

### 2. Verificar serviceAccount.json

O arquivo deve estar em uma destas localizações:

- `D:\_repos\appunture-dev\serviceAccount.json` (raiz do projeto)
- `D:\_repos\appunture-dev\backend-java\serviceAccount.json` (pasta backend)

**Verificar se existe:**

```powershell
Test-Path D:\_repos\appunture-dev\serviceAccount.json
```

### 3. Rodar o Backend

- Clique no botão ▶️ Run
- Ou: Shift+F10

**Aguardar até ver:**

```
Started BackendApplication in X.XXX seconds (process running for X.XXX)
```

## 🎯 Profiles Disponíveis

### Profile: `local`

- Arquivo: `application-local.yml`
- Firebase: `./serviceAccount.json`
- Storage: `appunture-tcc.firebasestorage.app`
- Vertex AI: Habilitado (gemini-1.5-flash)
- Logs: DEBUG level
- CORS: Permissivo (localhost, 192.168._._)

### Profile: `dev` (atualizado)

- Arquivo: `application-dev.yml`
- Firebase: `../serviceAccount.json` (ou SERVICE_ACCOUNT_PATH)
- Storage: `appunture-tcc.firebasestorage.app`
- Vertex AI: Habilitado
- Logs: DEBUG level
- CORS: Permissivo

### Profile: `prod`

- Arquivo: `application-prod.yml`
- Firebase: ADC (Application Default Credentials)
- Storage: `appunture-tcc.firebasestorage.app`
- Vertex AI: Habilitado
- Logs: INFO level
- CORS: Restritivo (domínios específicos)

## ⚠️ Troubleshooting

### Erro: "Your default credentials were not found"

**Solução:**

1. Verificar se `serviceAccount.json` existe
2. Adicionar variável de ambiente no IntelliJ:
   ```
   SERVICE_ACCOUNT_PATH=D:\_repos\appunture-dev\serviceAccount.json
   ```
3. Ou usar caminho absoluto no application-dev.yml

### Erro: "FirebaseAuth bean could not be found"

**Solução:**

- Firebase não foi inicializado corretamente
- Verificar logs para ver erro específico
- Confirmar que `app.firebase.enabled: true`

### Erro: "Port 8080 already in use"

**Solução:**

```powershell
# Ver o que está usando a porta
netstat -ano | findstr :8080

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### Erro: Vertex AI não inicializa

**Solução:**

- Verificar se Vertex AI API está habilitada no Google Cloud
- Service account precisa ter role `aiplatform.user`
- Verificar logs para erro específico

## 📝 Variáveis de Ambiente (Opcional)

Se preferir configurar via variáveis de ambiente no IntelliJ:

```
SPRING_PROFILES_ACTIVE=dev
SERVICE_ACCOUNT_PATH=D:\_repos\appunture-dev\serviceAccount.json
GOOGLE_CLOUD_PROJECT=appunture-tcc
GOOGLE_CLOUD_LOCATION=us-central1
```

**Como adicionar:**

1. Edit Configurations
2. Environment variables: [Edit]
3. Adicionar cada variável
4. Apply → OK

## ✅ Checklist de Startup Bem-Sucedido

Ao iniciar o backend, você deve ver nos logs:

```
✅ Using service account from: .../serviceAccount.json
✅ Firebase initialized successfully
✅ Firestore client initialized
✅ Firebase Storage initialized successfully
✅ Firebase Auth initialized
✅ ChatClient created successfully (Vertex AI)
✅ Started BackendApplication in X.XXX seconds
```

Se algum desses não aparecer, há um problema de configuração.

## 🧪 Testar Após Iniciar

```powershell
# 1. Health check
curl http://localhost:8080/api/health

# 2. Listar pontos
curl http://localhost:8080/api/points

# 3. Buscar ponto específico
curl http://localhost:8080/api/points/ST-1
```

Se algum retornar erro, verificar logs do IntelliJ.

## 🔄 Para Trocar de Profile

1. Parar o backend (Ctrl+F2)
2. Edit Configurations → Mudar Active profiles
3. Rodar novamente (Shift+F10)

---

**Configuração Atual:**

- ✅ application-dev.yml atualizado para usar serviceAccount.json
- ✅ application-local.yml criado para desenvolvimento local
- ✅ Ambos profiles habilitam Firebase e Vertex AI
- ✅ CORS permissivo para localhost e rede local
