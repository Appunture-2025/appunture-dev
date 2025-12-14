# 🧪 Checklist de Teste Local

## ✅ Configuração Concluída

- ✅ Backend: Rodando no IntelliJ (localhost:8080)
- ✅ Frontend: Configurado para http://localhost:8080/api
- ✅ .env.production.backup: Salvo para restaurar depois
- ✅ Expo: Iniciando com cache limpo

## 📋 Próximos Passos de Teste

### 1. Verificar Backend no IntelliJ

Certifique-se que no IntelliJ:

- ✅ Profile ativo: `local` (ou editar Run Configuration para usar `-Dspring.profiles.active=local`)
- ✅ serviceAccount.json: Na raiz do projeto ou variável `SERVICE_ACCOUNT_PATH` definida
- ✅ Console mostra: "Started AppuntureBackendApplication"
- ✅ Porta 8080 está livre

### 2. Testar Endpoint Backend

Enquanto o Expo inicia, teste se o backend responde:

```powershell
# Health check
curl http://localhost:8080/api/health

# Listar pontos
curl http://localhost:8080/api/points
```

### 3. Quando o Expo estiver pronto

O terminal deve mostrar algo como:

```
› Metro waiting on exp://192.168.X.X:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
```

### 4. Abrir o App

**Opção A - Web (mais rápido para debug):**

- Pressione `w` no terminal
- Abre no browser: http://localhost:8081

**Opção B - Expo Go (celular):**

- Escaneie o QR code
- ⚠️ Se não conectar, seu celular precisa estar na mesma rede WiFi

**Opção C - Emulador Android:**

- Pressione `a` no terminal

## 🐛 Testes Específicos

### Teste 1: SVG Body Map

1. Login no app
2. Aba "Explorar" → Selecionar ponto (ex: ST-1)
3. **Verificar:**
   - Imagens SVG aparecem na galeria?
   - Console do IntelliJ mostra GET /points/ST-1?
   - Response tem `image_refs`?

**Se falhar:**

- Backend logs: Ver se Firebase Storage foi inicializado
- Frontend: F12 → Network tab → Ver erro nas requisições
- Testar URL direta: https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FST.svg?alt=media

### Teste 2: Chat IA

1. Aba "Chatbot"
2. Enviar mensagem: "O que é acupuntura?"
3. **Verificar:**
   - IA responde?
   - Console do IntelliJ mostra POST /api/chat?
   - Logs mostram "Sending message to Vertex AI"?

**Se falhar:**

- Ver console IntelliJ para erros de Vertex AI
- Verificar se ChatClient foi criado no startup
- Ver se serviceAccount.json está acessível

### Teste 3: Login

1. Tentar fazer login com Google
2. **Verificar:**
   - Firebase Auth funciona?
   - Token é enviado para backend?
   - Backend valida o token?

## 📊 Endpoints para Testar Manualmente

```powershell
# 1. Health (sem auth)
curl http://localhost:8080/api/health

# 2. Listar pontos (sem auth)
curl http://localhost:8080/api/points

# 3. Buscar ponto específico
curl http://localhost:8080/api/points/ST-1

# 4. Chat (precisa de auth - pegar token do app)
curl -X POST http://localhost:8080/api/chat `
  -H "Authorization: Bearer SEU_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"message": "teste"}'
```

## 🔍 Onde Ver Erros

### Backend (IntelliJ Console):

- Erros de Firebase Storage
- Erros de Vertex AI
- Erros de autenticação
- Stacktraces completas

### Frontend (Browser DevTools - F12):

- Console: Erros JavaScript
- Network: Requisições HTTP falhando
- Sources: Breakpoints no código

### Frontend (Terminal Expo):

- Erros de build
- Warnings de dependências
- Metro bundler errors

## 💡 Dicas de Debug

1. **Backend lento?**

   - Primeira requisição ao Vertex AI pode demorar
   - Firebase Storage pode ter cold start

2. **SVGs não aparecem?**

   - Verificar se bucket está público
   - Testar URL direta no browser
   - Ver se image_refs está no response

3. **Chat não responde?**

   - Ver logs do IntelliJ para erro específico do Vertex AI
   - Verificar se API está habilitada no Google Cloud
   - Confirmar permissões do service account

4. **Frontend não conecta?**
   - Verificar se backend está realmente em localhost:8080
   - Testar com curl primeiro
   - Ver se .env tem URL correta

## ⚠️ Problemas Comuns

### "Network Error" no app:

- Backend não está rodando
- Porta 8080 bloqueada por firewall
- .env com URL errada

### "403 Forbidden":

- Token expirado (fazer logout/login)
- Token não sendo enviado (ver Network tab)
- Backend não está validando token corretamente

### "500 Internal Server Error":

- Ver console do IntelliJ para stacktrace
- Geralmente erro no código backend
- Pode ser Firebase/Vertex AI não inicializados

### SVG aparece quebrado:

- Arquivo SVG corrompido
- URL incorreta (ver image_refs)
- CORS bloqueando (mas Firebase Storage permite)

## 📝 Logs Importantes

### IntelliJ deve mostrar (startup):

```
✓ Firebase initialized
✓ Firestore connected
✓ Firebase Storage initialized
✓ ChatClient created (Vertex AI)
✓ Started AppuntureBackendApplication in X seconds
```

### Frontend deve mostrar (console):

```
✓ API Base URL: http://localhost:8080/api
✓ Storage Bucket: appunture-tcc.firebasestorage.app
```

---

**Status Atual:**

- ⏳ Aguardando Expo inicializar...
- 🟢 Backend deve estar rodando no IntelliJ
- 📱 Pronto para testar no browser/celular
