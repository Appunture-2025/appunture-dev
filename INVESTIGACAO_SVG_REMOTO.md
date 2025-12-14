# 🔍 Investigação de SVGs Remotos

## Mudanças Implementadas

Adicionei logs **detalhados** no `bodyMap.ts` para rastrear cada passo do download dos SVGs:

### Logs Adicionados:

1. **getStorageBucket()** - Verifica se bucket foi carregado

   ```
   [bodyMap] Resolved storage bucket: appunture-tcc.firebasestorage.app
   ```

2. **buildRemoteSvgUrl()** - Mostra URL sendo construída

   ```
   [bodyMap] Built remote URL for LU: https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media
   ```

3. **loadSvgXmlFromCache()** - Indica tentativa de cache local

   ```
   [bodyMap] Not in local cache, attempting remote fetch for LU
   ```

4. **fetchRemoteSvgXml()** - Rastreia o fetch

   ```
   [bodyMap] Starting fetch for LU from: https://...
   [bodyMap] Fetch response for LU: status=200
   [bodyMap] Successfully fetched SVG for LU, size: 12345 bytes
   ```

5. **getLayerSvgXml()** - Mostra qual fonte usada
   ```
   [bodyMap] getLayerSvgXml called for LU
   [bodyMap] Trying to load LU from cache or remote
   [bodyMap] Successfully loaded LU from cache
   ```

---

## Como Ver os Logs

### Opção 1: Expo CLI (Recomendado)

O Expo mostra logs automaticamente no terminal:

```powershell
cd frontend-mobile\appunture
npx expo start
```

Procure por logs com `[bodyMap]` - aparecerão em tempo real.

### Opção 2: React Native Debugger

1. Abra o app
2. Pressione `Cmd+D` (Mac) ou `Ctrl+M` (Android emulator)
3. Selecione "Debug with Chrome"
4. Abra DevTools (F12)
5. Vá para a aba "Console"
6. Procure por `[bodyMap]`

### Opção 3: Expo DevTools

1. Abra http://localhost:19002 no navegador
2. Selecione o dispositivo/emulador
3. Clique em "View logs"

---

## Como Reproduzir o Problema

1. **Reinicie o Expo:**

   ```powershell
   cd frontend-mobile\appunture
   npx expo start --clear
   ```

2. **Abra o app no emulador/celular**

3. **Navegue para o BodyMap:**

   - Vá para Home → Body Map (ou similar)

4. **Observe os logs:**
   - Procure por `[bodyMap]` no console
   - Especialmente `Built remote URL`, `Starting fetch`, `Fetch response`

---

## O Que Procurar

### Sucesso ✅

```
[bodyMap] Resolved storage bucket: appunture-tcc.firebasestorage.app
[bodyMap] Built remote URL for LU: https://firebasestorage.googleapis.com/...
[bodyMap] loadSvgXmlFromCache called for LU
[bodyMap] Not in local cache, attempting remote fetch for LU
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/...
[bodyMap] Fetch response for LU: status=200
[bodyMap] Successfully fetched SVG for LU, size: 12345 bytes
[bodyMap] Successfully loaded LU from cache
```

### Falha - Bucket não configurado ❌

```
[bodyMap] No storage bucket configured
[bodyMap] getLayerSvgXml called for LU
[bodyMap] Falling back to local asset for LU
[bodyMap] Successfully loaded LU from local asset
```

**Significado:** Firebase não carregou o bucket do `.env`

### Falha - Erro na URL ❌

```
[bodyMap] Built remote URL for LU: https://firebasestorage.googleapis.com/v0/b/null/o/...
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/v0/b/null/o/...
[bodyMap] Fetch response for LU: status=404
```

**Significado:** URL malformada ou encoding errado

### Falha - Erro de Rede ❌

```
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/...
[bodyMap] Error downloading SVG for LU: TypeError: Network error
[bodyMap] Error message: Network error
```

**Significado:** Problema de rede, CORS bloqueado, ou servidor indisponível

### Falha - Erro 403 (Permissão) ❌

```
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/...
[bodyMap] Fetch response for LU: status=403 Forbidden
[bodyMap] Remote SVG request failed for LU: 403 Forbidden
```

**Significado:** Regras do Firebase Storage bloqueando acesso

### Falha - Timeout ❌

```
[bodyMap] Starting fetch for LU from: https://firebasestorage.googleapis.com/...
[bodyMap] Error downloading SVG for LU: Error: timeout
```

**Significado:** Servidor demorou muito ou está offline

---

## Diagnóstico Adicional

### 1. Verificar se .env foi carregado

No console do React:

```javascript
console.log(require("../config/firebaseConfig").default);
```

Deve mostrar:

```javascript
{
  storageBucket: "appunture-tcc.firebasestorage.app",
  ...
}
```

### 2. Testar URL manualmente no app

No console:

```javascript
const url =
  "https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media";
fetch(url).then((r) => console.log(r.status, r.statusText));
```

Se retornar 200 → funciona
Se retornar 403 → permissões bloqueando
Se retornar 404 → arquivo não existe

### 3. Comparar com curl

Terminal (funciona):

```powershell
curl -v "https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media"
# Retorna HTTP 200
```

App (falha):

```
[bodyMap] Fetch response for LU: status=403
# Retorna HTTP 403?
```

**Se for diferente:** Há diferença em headers, cookies, ou context

---

## Possíveis Causas

| Causa                | Log                                                 | Solução                                    |
| -------------------- | --------------------------------------------------- | ------------------------------------------ |
| Bucket não carregado | `No storage bucket configured`                      | Verificar `.env` e reiniciar com `--clear` |
| URL malformada       | `Built remote URL for LU: ...null...`               | Verificar encoding do path                 |
| Permissão 403        | `status=403 Forbidden`                              | Atualizar regras do Firebase Storage       |
| Arquivo 404          | `status=404`                                        | Verificar se SVG existe com `gsutil ls`    |
| CORS bloqueado       | `Error: Network error` ou `TypeError: fetch failed` | Verificar headers de resposta              |
| Cache de browser     | Sucesso mas SVG não aparece                         | Limpar cache do emulador                   |
| Timeout              | `Error: timeout`                                    | Servidor offline ou muito lento            |

---

## Próximas Ações

1. **Reinicie Expo com `--clear`**
2. **Abra o app no emulador**
3. **Navegue até BodyMap**
4. **Procure por logs `[bodyMap]` no console**
5. **Compartilhe os logs de erro** (especialmente os 5 primeiros logs)

---

**Atualizado:** 12/12/2025  
**Versão:** 1.0  
**Próximo:** Executar testes e compartilhar logs
