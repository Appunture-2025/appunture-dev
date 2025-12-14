# Diagnóstico SVGs Remotos - Guia Passo a Passo

## Problema

Os SVGs funcionam quando testados via `curl` do terminal, mas falham quando o app tenta baixá-los via JavaScript fetch.

## Por Que Curl e Fetch Podem Ter Comportamentos Diferentes

1. **CORS**: Curl não verifica CORS, fetch sim (pode bloquear com erro no navegador)
2. **Headers**: Curl vs fetch podem enviar headers diferentes
3. **Certificados SSL**: Diferenças de validação
4. **Caching HTTP**: Navegador pode ter cacheado resposta anterior como erro
5. **Contexto de execução**: App pode ter limitações de rede

## Passo 1: Testar SVGs pelo Terminal

```powershell
# Abra PowerShell em d:\_repos\appunture-dev\ e execute:
.\test-svg-remote.ps1
```

**Resultado esperado:**

- Todos os 15 SVGs mostrem "✓ OK (HTTP 200)"

**Se resultado foi diferente:**

- Se bloqueados (403): As regras do Firebase Storage não foram aplicadas
- Se não encontrados (404): Os SVGs não estão no bucket
- Se erro: Problema de rede ou servidor

---

## Passo 2: Verificar o Console do Expo

### No Android Emulator:

1. **Abra um novo terminal PowerShell**
2. **Navegue para a pasta do frontend:**

   ```powershell
   cd d:\_repos\appunture-dev\frontend-mobile\appunture
   ```

3. **Reinicie o Expo com limpeza:**

   ```powershell
   npx expo start --clear
   ```

4. **Abra o app no emulador:**

   - Pressione `a` para Android
   - Se o emulador não abrir automaticamente, ele abrirá em alguns segundos

5. **Navegue até o Body Map** no app

6. **Volte ao terminal onde rodou `npx expo start`** e procure por logs que começam com:
   - `[bodyMap]`
   - `[BodyMap]`
   - `fetch failed`
   - `error`

### Alternativa: Metro DevTools

```powershell
# No mesmo terminal do Expo, pressione:
# Pressione 'j' para abrir o DevTools
# Abra a aba "Console" ou "Logs"
```

---

## Passo 3: O Que Procurar nos Logs

### Cenário 1: Bucket não carregado

```
[bodyMap] Resolved storage bucket: null
```

**Diagnóstico**: Firebase não foi inicializado no app
**Solução**: Verificar `frontend-mobile/appunture/services/firebase.ts`

### Cenário 2: URL não construída

```
[bodyMap] Starting fetch for LU from: null
```

**Diagnóstico**: A função `buildRemoteSvgUrl()` retornou null
**Solução**: Verificar se bucket está sendo passado corretamente

### Cenário 3: Fetch falha na rede

```
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media
[error] [bodyMap] Error fetching SVG for LU: TypeError: fetch failed
```

**Diagnóstico**: Problema de rede, CORS, ou timeout
**Solução**: Verificar conectividade, CORS headers, ou timeout

### Cenário 4: HTTP 403 ou 404 do servidor

```
[bodyMap] Fetch response for LU: status=403
[error] [bodyMap] Error fetching SVG for LU: HTTP 403 - Forbidden
```

**Diagnóstico**: Permissão negada (403) ou arquivo não encontrado (404)
**Solução**: Verificar Firebase Storage rules ou se SVG existe

### Cenário 5: Response parsing falha

```
[bodyMap] Fetch response for LU: status=200
[error] [bodyMap] Error fetching SVG for LU: TypeError: response.text is not a function
```

**Diagnóstico**: Response está em formato inesperado
**Solução**: Verificar se a resposta é realmente texto XML

### Cenário 6: Funciona! (SVG baixado)

```
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media
[bodyMap] Fetch response for LU: status=200
[bodyMap] Successfully fetched SVG for LU, size: 12345 bytes
```

**Diagnóstico**: SVG baixado com sucesso!
**Próximo passo**: Verificar se renderiza no mapa

---

## Passo 4: Testar Direto no Navegador (React Native Debugger)

Se tiver React Native Debugger instalado:

1. **No terminal do Expo, pressione `d`** para abrir debugger
2. **Abra Console** (CMD+Option+I no Mac, F12 no Windows)
3. **Execute manualmente:**
   ```javascript
   // Teste fetch direto
   fetch(
     "https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media"
   )
     .then((r) => console.log("Status:", r.status, "Headers:", r.headers))
     .then((r) => r.text())
     .then((text) =>
       console.log(
         "Tamanho:",
         text.length,
         "Primeiros 100 chars:",
         text.substring(0, 100)
       )
     )
     .catch((e) => console.error("Erro:", e.message));
   ```

Se funcionar aqui mas não no app, o problema está na forma como o app chama fetch.

---

## Passo 5: Comparar com curl

Para entender a diferença exata, execute curl com verbosidade:

```powershell
$url = "https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media"

# Teste 1: Headers
curl.exe -i -X HEAD $url

# Teste 2: Com seguir redirecionamentos
curl.exe -i -L $url

# Teste 3: Verbose para ver headers
curl.exe -v $url 2>&1 | Select-String "Accept", "User-Agent", "HTTP/"
```

Compare os headers do curl com os do fetch (use DevTools para ver).

---

## Próximas Ações

### Se Teste 1 (terminal) falhar:

- SVGs não estão acessíveis - verificar Firebase Storage bucket
- Rodar: `.\test-svg-remote.ps1`

### Se Teste 2 (Expo logs) mostrar null:

- Firebase não inicializado no frontend
- Verificar: `services/firebase.ts` ou `App.tsx`

### Se Teste 2 mostrar fetch com erro:

- Problema de rede ou CORS
- Tentar teste 4 (browser console)

### Se Teste 4 funcionar mas app não:

- Há um problema específico na forma como o app chama fetch
- Possível: AbortController, headers, timeout

### Se Teste 5 mostrar headers diferentes:

- Ajustar fetch no frontend para incluir headers do curl

---

## Informações para Contexto

**Bucket**: `appunture-tcc.firebasestorage.app`
**Pasta**: `body-map/`
**SVGs**: LU, LI, ST, ST2, SP, HT, SI, BL, KI, P, TW, GB, LV, GV, CV
**Regras Atuais**: Todos os arquivos em body-map/\* podem ser lidos publicamente

**Arquivo de Código Chave**:

- `frontend-mobile/appunture/utils/bodyMap.ts` - Funções de fetch
- `frontend-mobile/appunture/components/BodyMap.tsx` - Componente que usa SVG
- `frontend-mobile/appunture/services/firebase.ts` - Inicialização Firebase

---

## Resumo Rápido

1. **Terminal**: ✓ ou ✗ Teste com `.\test-svg-remote.ps1`
2. **Logs Expo**: Procure `[bodyMap]` ao abrir app
3. **Console Browser**: Teste fetch diretamente
4. **Headers**: Compare curl vs fetch
5. **Próxima ação**: Compartilhe os logs `[bodyMap]` encontrados
