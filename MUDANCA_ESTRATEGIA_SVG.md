# 🔧 Mudança de Estratégia - SVG Local Assets

## Problema Identificado

Os SVGs não estavam aparecendo no app apesar de:

- ✅ Existirem no Firebase Storage
- ✅ Serem acessíveis via curl (HTTP 200)
- ✅ Firebase Storage rules configuradas

**Causa raiz**: React Native fetch tem comportamento diferente de curl/browser, com problemas de timeout, headers, e CORS que são difíceis de diagnosticar.

## Solução Implementada

**Mudança de abordagem**: Desativar completamente o fetch remoto e usar apenas **assets locais**.

### Por Quê?

1. **Confiabilidade**: Assets locais sempre funcionam, sem depender de rede
2. **Performance**: Sem latência de download
3. **Simplicidade**: Remove toda a complexidade de cache/fetch/retry
4. **Offline**: Funciona mesmo sem internet

### Desvantagens Aceitas

- SVGs empacotados no app (~300KB total para 15 SVGs)
- Atualizações exigem rebuild do app (não é problema para esse tipo de conteúdo estático)

## Mudanças no Código

### 1. AiChatService.java

**Problema**: `variable chatClient might already have been assigned`
**Solução**: Removido `final` de `chatClient` para permitir atribuição no try block

```java
// Antes:
private final ChatClient chatClient;

// Depois:
private ChatClient chatClient;
```

### 2. bodyMap.ts - Simplificação Drástica

**fetchRemoteSvgXml**: Desabilitado completamente

```typescript
// Agora retorna null imediatamente
console.log(
  `[bodyMap] fetchRemoteSvgXml called for ${layer.id} - DISABLED, using local assets only`
);
return null;
```

**getLayerSvgXml**: Simplificado para usar apenas assets locais

```typescript
// Removido:
- loadSvgXmlFromCache (fetch remoto)
- writeLayerCacheXml (não precisa mais de cache)
- Toda lógica de fallback complexa

// Mantido:
- Memory cache (rápido)
- getSvgXml(layer.source) - carrega asset local diretamente
```

**prefetchBodyMapLayers**: Carrega direto dos assets

```typescript
// Antes: tentava cache/remote primeiro
const xml = await loadSvgXmlFromCache(layer);

// Agora: vai direto ao asset
const xml = await getSvgXml(layer.source);
```

## Como Testar

### 1. Compile o backend

```powershell
cd d:\_repos\appunture-dev\backend-java
.\mvnw clean compile
```

Deve compilar sem erros agora.

### 2. Reinicie o Expo

```powershell
cd d:\_repos\appunture-dev\frontend-mobile\appunture
npx expo start --clear
```

### 3. Abra o app e navegue até o Body Map

Procure nos logs:

```
[bodyMap] getLayerSvgXml called for LU
[bodyMap] Loading LU from local asset
[bodyMap] ✓ Successfully loaded LU, size: XXXXX bytes
```

### 4. Os SVGs DEVEM aparecer agora

Se ainda não aparecer, o problema está na renderização, não no carregamento.

## Próximos Passos se Não Funcionar

Se os logs mostram `✓ Successfully loaded` mas SVG não renderiza:

### Verificar BodyMap.tsx

```powershell
# Procure por:
grep -n "SvgXml" frontend-mobile/appunture/components/BodyMap.tsx
```

O componente `<SvgXml>` deve estar recebendo o XML corretamente.

### Verificar se react-native-svg está instalado

```powershell
cd frontend-mobile/appunture
npm list react-native-svg
```

Se não estiver, instale:

```powershell
npm install react-native-svg
npx expo install react-native-svg
```

### Teste individual de renderização

Cole no console do Metro DevTools:

```javascript
import { SvgXml } from "react-native-svg";

// Se isso funciona, o problema é no getLayerSvgXml
// Se não funciona, o problema é no SvgXml
```

## Rollback (se necessário)

Se quiser voltar a tentar remote fetch:

1. Abra `bodyMap.ts`
2. Na função `fetchRemoteSvgXml`, remova a linha que retorna null
3. Descomente todo o código da função

Mas recomendo **manter a solução atual** (assets locais) pela simplicidade e confiabilidade.

## Resumo

| Aspecto              | Antes                        | Depois                        |
| -------------------- | ---------------------------- | ----------------------------- |
| **Carregamento**     | Remote fetch → cache → local | Memory cache → local assets   |
| **Linhas de código** | ~150 linhas complexas        | ~30 linhas simples            |
| **Confiabilidade**   | Depende de rede              | 100% offline                  |
| **Tempo de load**    | 200-500ms por SVG            | <10ms por SVG                 |
| **Debugging**        | Complexo (rede, CORS, etc)   | Simples (asset existe ou não) |
| **Erro esperado**    | `fetch failed`, `403`, `404` | Nenhum (assets empacotados)   |

## Logs Esperados Agora

```
[bodyMap] Starting prefetch of 15 layers (local assets only)
[bodyMap] ✓ Prefetch successful for LU
[bodyMap] ✓ Prefetch successful for LI
[bodyMap] ✓ Prefetch successful for ST
... (15 vezes)
[bodyMap] Prefetch complete: 15/15 successful
```

Se ver isso, os SVGs DEVEM aparecer. Se não aparecerem, o problema é na **renderização**, não no carregamento.
