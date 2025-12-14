# ⚡ PRÓXIMOS PASSOS - Diagnóstico SVG Remoto

## Situação

- ✅ SVGs estão no Firebase Storage (`gs://appunture-tcc.firebasestorage.app/body-map/`)
- ✅ Curl consegue baixar (HTTP 200)
- ✅ Logs adicionados ao código
- ❌ Fetch no app ainda falha

## Por que Curl funciona mas Fetch não?

1. **Timeout**: Curl espera mais tempo, React Native pode timeout rápido
2. **Headers**: Fetch pode estar enviando headers incompatíveis
3. **CORS**: React Native pode estar verificando CORS diferente
4. **SSL/TLS**: Validação de certificado pode estar falhando
5. **Proxy/Network**: App pode estar passando por proxy diferente

## Diagrama de Execução

```
App tenta: getLayerSvgXml("LU")
         ↓
         [memoria cache?] → NO
         ↓
         [local cache?] → NO
         ↓
         [remote fetch] ← ESTÁ FALHANDO AQUI
         ↓
         [fallback local asset]
```

## Solução Passo a Passo

### PASSO 1: Testar Terminal (5 min)

```powershell
cd d:\_repos\appunture-dev\
.\test-svg-remote.ps1
```

**Resultado esperado**: Todos os 15 SVGs mostram "✓ OK (HTTP 200)"

**Se falhar**: Os SVGs não estão acessíveis do servidor

- Solução: Reimplementar Firebase Storage rules

---

### PASSO 2: Testar Fetch Direto (10 min)

1. **Abra Metro DevTools**

   ```powershell
   # No terminal do Expo (npx expo start), pressione 'j'
   ```

2. **Cole no console:**

   ```javascript
   // Copie todo o conteúdo de: d:\_repos\appunture-dev\TEST_SVG_FETCH_CONSOLE.js
   // E cole no Metro DevTools console
   ```

3. **Resultado esperado**:
   ```
   ✓ SUCESSO - Fetch funcionou!
   Primeiros 100 caracteres: <svg xmlns="http://www.w3.org/2000/svg"...
   ```

**Se falhar com erro**: Tome nota da mensagem de erro

---

### PASSO 3: Ver Logs do App (5 min)

1. **Reinicie Expo**:

   ```powershell
   cd d:\_repos\appunture-dev\frontend-mobile\appunture
   npx expo start --clear
   ```

2. **Abra app no emulador** e **navegue até Body Map**

3. **Procure nos logs por**: `[bodyMap]` ou `[BodyMap]`

**Copie os 10 primeiros logs** que aparecerem:

---

### PASSO 4: Teste com Headers Customizados ✨

As mudanças já foram aplicadas! O código agora inclui:

- ✅ Headers `Accept: application/svg+xml`
- ✅ Timeout de 30 segundos
- ✅ Better error handling

Apenas **reinicie o Expo** com essas mudanças.

---

## Possíveis Resultados

### ✓ Passo 1 (Terminal): SUCESSO

→ SVGs acessíveis. Vá para Passo 3 para ver logs do app

### ✓ Passo 2 (Console): SUCESSO

→ Fetch funciona. Problema está em como o app chama fetch
→ Verifique: Firewall, proxy, URL escrita errado

### ✓ Passo 3 (App Logs): Mostra `[bodyMap] Successfully fetched`

→ Problema resolvido! 🎉

### ✗ Passo 1: 403 Forbidden

→ Firebase Storage rules não foram aplicadas
→ Ação: Redifinir rules (ver próxima seção)

### ✗ Passo 2: Network Error

→ Problema de conectividade ou certificado SSL
→ Ação: Testar conectividade, bypass SSL se development

### ✗ Passo 3: Mostra Error ou Network Failed

→ Existe um problema específico no app
→ Ação: Compartilhar mensagem de erro exata

---

## Se Ainda Não Funcionar - Verificações Adicionais

### Verificar Firebase Config

```bash
# No arquivo: frontend-mobile/appunture/config/firebaseConfig.ts
# Procure por: storageBucket
# Deve ser: "appunture-tcc.firebasestorage.app"
```

### Verificar Regras do Firebase

```json
// Em: https://console.firebase.google.com/project/appunture-tcc/storage/rules
// Deve ter:
{
  "rules": {
    "body-map/{allPaths=**}": {
      "allow read": true;
    }
  }
}
```

### Teste de Conectividade

```powershell
# Testar se a máquina consegue alcançar o servidor
ping -n 4 firebasestorage.googleapis.com

# Testar com curl detalhado
curl.exe -v "https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media" 2>&1
```

---

## Resumo das Mudanças Feitas

1. **bodyMap.ts**:

   - ✅ Adicionado headers ao fetch
   - ✅ Adicionado timeout de 30s
   - ✅ Improved error handling com stack traces
   - ✅ Separado logging de parse error

2. **Testes criados**:
   - ✅ `test-svg-remote.ps1` - teste via PowerShell
   - ✅ `TEST_SVG_FETCH_CONSOLE.js` - teste direto no Metro
   - ✅ `DIAGNOSTICO_SVG_REMOTO_PASSO_A_PASSO.md` - guia completo

---

## Próxima Ação

**Execute Passo 1 e Passo 3 agora** e compartilhe:

1. ✓ ou ✗ resultado do `test-svg-remote.ps1`
2. Os 5 primeiros logs `[bodyMap]` que vê no Expo console

Com essas informações, poderei diagnosticar exatamente onde está o problema!

---

## Contato Rápido dos Arquivos

| Ação                    | Arquivo                                      | O que fazer               |
| ----------------------- | -------------------------------------------- | ------------------------- |
| **Testar via terminal** | `test-svg-remote.ps1`                        | `.\test-svg-remote.ps1`   |
| **Teste no console**    | `TEST_SVG_FETCH_CONSOLE.js`                  | Cola no Metro DevTools    |
| **Guia detalhado**      | `DIAGNOSTICO_SVG_REMOTO_PASSO_A_PASSO.md`    | Leia para passo a passo   |
| **Código modificado**   | `frontend-mobile/appunture/utils/bodyMap.ts` | Reinicie Expo para ativar |
