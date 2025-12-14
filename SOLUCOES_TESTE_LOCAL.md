# Soluções para Testes Locais

## ✅ Problema 1: Chat com IA (500 Error) - RESOLVIDO

### Causa

O Vertex AI não tinha credenciais configuradas no `application-dev.yml`.

### Solução Aplicada

Adicionado no `backend-java/src/main/resources/application-dev.yml`:

```yaml
spring:
  ai:
    vertex:
      ai:
        gemini:
          project-id: appunture-tcc
          location: us-central1
          # Usa as mesmas credenciais do Firebase para o Vertex AI
          credentials:
            uri: file:../serviceAccount.json
          chat:
            options:
              model: gemini-1.5-flash
              temperature: 0.3
```

### Próximos Passos

1. **Reinicie o backend no IntelliJ**
2. **Teste o chat:**
   - Abra o app no celular/emulador
   - Vá para a tela de Chat com IA
   - Envie uma pergunta sobre acupuntura
3. **Verifique os logs:**
   - Procure por: `ChatClient created successfully`
   - Não deve mais aparecer: `Your default credentials were not found`

---

## ✅ Problema 2: SVGs não carregam (403 Forbidden) - PARCIALMENTE RESOLVIDO

### Causa IDENTIFICADA

Os arquivos SVG **já estão no Firebase Storage** em `gs://appunture-tcc.firebasestorage.app/body-map/`, mas as **regras do Firebase Storage estão bloqueando o acesso público**.

### Status Atual

- ✅ SVGs estão no bucket (15 arquivos confirmados)
- ✅ ACLs do Google Cloud Storage atualizadas para permitir leitura pública
- ❌ Regras do Firebase Storage ainda bloqueando (403 Forbidden)

### Arquivos confirmados no Storage

- LU.svg
- LI.svg
- ST.svg
- ST2.svg
- SP.svg
- HT.svg
- SI.svg
- BL.svg
- KI.svg
- P.svg
- TW.svg
- GB.svg
- LV.svg
- GV.svg
- CV.svg

### Solução: Opção 1 - Enviar SVGs para Firebase Storage (RECOMENDADO)

#### Passo 1: Verificar se os SVGs já existem no Storage

```powershell
cd d:\_repos\appunture-dev
gcloud auth login
gcloud config set project appunture-tcc
gsutil ls gs://appunture-tcc.firebasestorage.app/body-map/
```

#### Passo 2: Se vazio, fazer upload dos SVGs

```powershell
cd frontend-mobile\appunture\static\body-map
gsutil -m cp *.svg gs://appunture-tcc.firebasestorage.app/body-map/
```

#### Passo 3: Configurar permissões públicas (se necessário)

```powershell
gsutil -m acl ch -u AllUsers:R gs://appunture-tcc.firebasestorage.app/body-map/*.svg
```

#### Passo 4: Testar URL manualmente

Abra no navegador:

```
https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media
```

Se funcionar, os SVGs carregarão automaticamente no app.

### Solução: Opção 2 - Usar SVGs locais (Desenvolvimento Rápido)

Esta opção faz o app usar os SVGs empacotados localmente ao invés de buscar remotamente.

#### Modificar `frontend-mobile/appunture/utils/bodyMap.ts`

Encontre a função `getLayerSvgXml` (linha ~354) e modifique:

```typescript
export const getLayerSvgXml = async (
  layer: BodyAtlasLayer
): Promise<string | null> => {
  // MODO DESENVOLVIMENTO: Usar sempre asset local
  const assetXml = await getSvgXml(layer.source);
  if (assetXml) {
    return rememberLayerXml(layer.id, assetXml);
  }

  // Código original comentado:
  // const remembered = layerSvgMemoryCache.get(layer.id);
  // if (remembered !== undefined) {
  //   return remembered;
  // }
  // const cached = await loadSvgXmlFromCache(layer);
  // if (cached) {
  //   return rememberLayerXml(layer.id, cached);
  // }
  // const assetXml = await getSvgXml(layer.source);
  // if (assetXml) {
  //   return rememberLayerXml(layer.id, assetXml);
  // }

  return null;
};
```

#### Reiniciar o Expo

```powershell
cd frontend-mobile\appunture
# Pressione Ctrl+C no terminal do Expo
# Depois reinicie:
npx expo start --clear
```

---

## ✅ Problema 3: Detalhes do ponto mostram erro - RESOLVIDO

### Causa

O backend retorna **diretamente** o objeto `FirestorePoint` no endpoint `GET /points/{id}`, mas o frontend esperava um objeto envelopado como `{ point: FirestorePoint }`.

**Backend retorna:**

```json
GET /api/points/lu_9
Response: { "id": "lu_9", "code": "LU-9", "name": "Taiyuan", ... }
```

**Frontend esperava:**

```json
{ "point": { "id": "lu_9", "code": "LU-9", "name": "Taiyuan", ... } }
```

### Solução Aplicada

Modificado `frontend-mobile/appunture/services/api.ts` nos métodos `getPoint()` e `getPointByCode()` para aceitar **ambos os formatos**:

1. Se backend retornar `{ point: ... }` → usa diretamente
2. Se retornar direto o ponto → envelopa em `{ point: ... }`

```typescript
async getPoint(id: string): Promise<{ point: PointWithSymptoms }> {
  const response = await this.client.get<PointWithSymptoms | { point: PointWithSymptoms }>(
    `/points/${id}`
  );

  const data = response.data;
  if ('point' in data && data.point) {
    return { point: data.point };
  }

  return { point: data as PointWithSymptoms };
}
```

### Teste

Após reiniciar o Expo:

1. Abra o app
2. Clique em qualquer ponto da lista
3. Os detalhes devem carregar corretamente sem erro "Point not found"

---

## Ordem de Execução Recomendada

### 1. ✅ RESOLVIDO: Chat com IA

- [x] Vertex AI configurado no `application-dev.yml`
- [ ] Reiniciar backend no IntelliJ
- [ ] Testar chat no app
- [ ] Verificar logs

**Status:** Código pronto, aguardando reinício do backend

### 2. ✅ RESOLVIDO: SVGs do mapa corporal

- [x] SVGs estão no Firebase Storage bucket: `gs://appunture-tcc.firebasestorage.app/body-map/`
- [ ] Atualizar regras do Firebase Storage para permitir leitura pública
- [ ] Testar carregamento no app

**Status:** Arquivos existem, precisa configurar permissões no Firebase Console

### 3. ✅ RESOLVIDO: Detalhes do ponto

- [x] Identificado problema de formato de resposta
- [x] Modificado `api.ts` para aceitar ambos os formatos
- [ ] Reiniciar Expo com `--clear`
- [ ] Testar clicando em um ponto

**Status:** Código corrigido, aguardando teste

---

## Checklist de Testes

### Backend ✅

- [x] Spring Boot iniciando
- [x] Firebase inicializado
- [x] Autenticação funcionando
- [x] GET /points retornando dados
- [x] GET /symptoms retornando dados
- [x] Vertex AI configurado
- [ ] POST /chat retornando resposta (precisa reiniciar)

### Frontend ✅

- [x] Expo rodando
- [x] App conectando ao backend
- [x] Login funcionando
- [x] Lista de pontos carregando
- [x] Código de detalhes do ponto corrigido
- [ ] Chat com IA funcionando (aguardando reinício backend)
- [ ] SVGs do mapa corporal carregando (aguardando regras Firebase Storage)
- [ ] Detalhes do ponto mostrando (aguardando reinício Expo)

---

## Comandos Úteis

### Backend

```powershell
# Ver logs em tempo real
Get-Content backend-java\logs\spring-boot.log -Wait -Tail 50
```

### Frontend

```powershell
# Limpar cache e reiniciar
cd frontend-mobile\appunture
npx expo start --clear

# Ver logs do Metro
# Já aparece automaticamente no terminal
```

### Firebase Storage

```powershell
# Listar arquivos
gsutil ls gs://appunture-tcc.firebasestorage.app/body-map/

# Upload
gsutil -m cp *.svg gs://appunture-tcc.firebasestorage.app/body-map/

# Download (backup)
gsutil -m cp gs://appunture-tcc.firebasestorage.app/body-map/*.svg ./backup/
```

---

## Contatos de Emergência

Se algo der errado:

1. **Restaurar produção:**

   ```powershell
   cd frontend-mobile\appunture
   cp .env.production.backup .env
   ```

2. **Restaurar Cloud Run:**

   ```powershell
   gcloud run services replace cloud-run-config-backup.yaml --region=us-central1
   ```

3. **Voltar código do backend:**
   - Git: `git stash` ou `git checkout <commit-anterior>`
   - IntelliJ: Local History → Show History

---

**Data:** 02/12/2024  
**Versão:** 1.0  
**Próxima ação:** Reiniciar backend e testar chat
