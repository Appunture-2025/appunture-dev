# 🔍 Diagnóstico do Chat com IA

## Mudanças Implementadas

### 1. Logs Detalhados Adicionados

Adicionei logs extensivos com o prefixo `[AI]` e `[CHAT]` para rastrear toda a execução:

**AiChatService:**

- ✅ Logs de inicialização com verificação de cada dependência
- ✅ Logs ao receber requisição de chat
- ✅ Logs ao construir contexto de dados
- ✅ Logs ao chamar ChatClient.prompt()
- ✅ Logs de erro detalhados com tipo de exceção
- ✅ Logs de sucesso com tamanho da resposta

**AiChatController:**

- ✅ Log ao receber POST /chat
- ✅ Log de validação de mensagem
- ✅ Log de sucesso/erro na geração de resposta

### 2. Novo Endpoint de Health Check

**GET /api/chat/health**

Retorna status do serviço:

```json
{
  "service": "AiChatService",
  "chatClient": "OK",
  "pointService": "OK",
  "symptomService": "OK",
  "status": "READY",
  "testResponse": "..."
}
```

---

## Como Testar

### Passo 1: Reiniciar Backend

```powershell
# No IntelliJ:
# 1. Click Run → Stop 'BackendApplication'
# 2. Click Run → Run 'BackendApplication'
# Aguarde logs confirmarem:
# [AI] ChatClient created successfully
```

### Passo 2: Verificar Health

```powershell
# Terminal PowerShell
curl http://26.227.77.34:8080/api/chat/health
```

**Resposta esperada:**

```json
{
  "service": "AiChatService",
  "chatClient": "OK",
  "status": "READY"
}
```

**Se retornar erro:** Verifique logs do backend para mensagem `[AI] ChatClient created successfully`

### Passo 3: Testar Chat

```powershell
# POST com teste simples
curl -X POST http://26.227.77.34:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Qual é o meridiano do Pulmão?"}'
```

---

## Logs para Procurar

### Se funcionar ✅

```
2025-12-12 20:50:11.991 [main] INFO c.a.backend.service.AiChatService [] - [AI] ChatClient created successfully
2025-12-12 20:54:54.658 [http-nio-8080-exec-1] INFO c.a.b.c.AiChatController [] - [CHAT] POST /chat request received
2025-12-12 20:54:55.833 [http-nio-8080-exec-1] INFO c.a.backend.service.AiChatService [] - [AI] Chat request received
2025-12-12 20:54:56.000 [http-nio-8080-exec-1] INFO c.a.backend.service.AiChatService [] - [AI] Response generated successfully, length: XXX characters
```

### Se falhar ❌

**Procure por:**

```
[AI] ChatClient is null - Vertex AI not initialized
```

**Ou:**

```
[AI] NullPointerException in sendMessage
[AI] ChatClient: null, PointService: ...
```

**Ou:**

```
[AI] Error calling AI service: [Exception Type] - [Message]
```

---

## Verificação de Configuração

### 1. Verificar se arquivo serviceAccount.json existe

```powershell
Test-Path "d:\_repos\appunture-dev\serviceAccount.json"
# Deve retornar: True
```

### 2. Verificar variáveis de ambiente (se necessário)

```powershell
$env:GOOGLE_CLOUD_PROJECT
$env:GOOGLE_CLOUD_LOCATION
# Devem estar vazias (usando valores do application-dev.yml)
```

### 3. Verificar application-dev.yml

O arquivo deve conter:

```yaml
spring:
  ai:
    vertex:
      ai:
        gemini:
          project-id: appunture-tcc
          location: us-central1
          credentials:
            uri: file:../serviceAccount.json
          chat:
            options:
              model: gemini-1.5-flash
```

---

## Possíveis Problemas e Soluções

### Problema: "ChatClient is null"

**Causa:** Vertex AI não inicializou corretamente

**Solução:**

1. Verificar se `serviceAccount.json` existe e é válido
2. Verificar se `application-dev.yml` tem configuração correta
3. Verificar logs de inicialização para exceção real

### Problema: "Default credentials were not found"

**Causa:** Credenciais do Google Cloud não encontradas

**Solução:**

1. Confirmar que `serviceAccount.json` está em `d:\_repos\appunture-dev\`
2. Adicionar à `application-dev.yml`:
   ```yaml
   spring:
     ai:
       vertex:
         ai:
           gemini:
             credentials:
               uri: file:../serviceAccount.json
   ```

### Problema: Resposta vazia ou nula

**Causa:** ChatClient.prompt().call().content() retorna null

**Solução:**

1. Verificar logs `[AI] Response generated successfully`
2. Se não aparecer, há exceção silenciosa
3. Adicionar debug print no service

---

## Próximas Ações

1. **Reinicie o backend**
2. **Acesse GET /api/chat/health** para verificar status
3. **Teste POST /api/chat** com uma pergunta simples
4. **Verifique logs** para mensagens com `[AI]` e `[CHAT]`
5. **Reporte o log completo** se falhar

---

## Comando para Extrair Logs do Chat

```powershell
# PowerShell - filtrar apenas logs do Chat/AI
Get-Content backend-java/logback.txt | Select-String "\[AI\]|\[CHAT\]" | Tail -50
```

---

**Status:** Logs implementados e endpoint de health criado  
**Próximo:** Reiniciar backend e testar
