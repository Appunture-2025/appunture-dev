# 🐛 Problemas Identificados e Soluções

## Análise dos Logs

### ✅ O que funciona:

- Backend inicializando corretamente
- Firebase conectado
- Autenticação funcionando
- Endpoints /points, /symptoms respondendo
- Requisições chegando ao backend

### ❌ O que NÃO funciona:

## 1. Chat IA retorna 500

**Problema:** Vertex AI não inicializa no profile `dev`

**Causa:** `application-dev.yml` não tem configuração do Vertex AI

**Solução:**

```yaml
# Adicionar em application-dev.yml:
spring:
  ai:
    vertex:
      ai:a
        gemini:
          project-id: appunture-tcc
          location: us-central1
          chat:
            options:
              model: gemini-1.5-flash
              temperature: 0.3
```

**Ou usar variable de ambiente:**

```
GOOGLE_CLOUD_PROJECT=appunture-tcc
GOOGLE_CLOUD_LOCATION=us-central1
```

---

## 2. SVGs retornam 404

**Problema:** Firebase Storage não encontra arquivos

**Causas possíveis:**

1. Arquivos não estão no Firebase Storage
2. URLs mal formatadas
3. Regras do Storage bloqueando acesso

**Testar diretamente:**

```
https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FST.svg?alt=media
```

**Verificar se existe:**

```bash
gsutil ls gs://appunture-tcc.firebasestorage.app/body-map/
```

**Se não existir, fazer upload:**

```bash
gsutil -m cp coordenadas/svgs/*.svg gs://appunture-tcc.firebasestorage.app/body-map/
```

---

## 3. Point not found

**Problema:** Frontend procura ponto mas não encontra no response

**Causa:** ID format mismatch

- Backend: `lu_9`
- Frontend: procura `LU-9` ou outro formato

**Ver logs:**

```
Load point error: [Error: Point not found in API response]
```

Mas backend mostra:

```
GET /points/lu_9  ✅ Funcionou
```

**Solução:** Verificar no código do frontend como está buscando o ponto no array retornado.

---

## 🔧 Ações Imediatas

### 1. Vertex AI - Configure no IntelliJ:

**Edit Configurations → Environment variables:**

```
GOOGLE_CLOUD_PROJECT=appunture-tcc
GOOGLE_CLOUD_LOCATION=us-central1
```

**Ou adicione em application-dev.yml** (já configurei no local.yml, mas dev não tem)

### 2. SVGs - Verificar se estão no Storage:

```powershell
# Listar arquivos
gsutil ls gs://appunture-tcc.firebasestorage.app/body-map/

# Se vazio, fazer upload
cd d:\_repos\appunture-dev\coordenadas
gsutil -m cp *.svg gs://appunture-tcc.firebasestorage.app/body-map/
```

### 3. Point API - Verificar response:

```powershell
# Testar endpoint
curl http://26.227.77.34:8080/api/points/lu_9

# Ver se tem image_refs no response
```

---

## 📝 Status Atual

| Componente    | Status          | Ação                               |
| ------------- | --------------- | ---------------------------------- |
| Backend Start | ✅ OK           | -                                  |
| Firebase      | ✅ OK           | -                                  |
| Autenticação  | ✅ OK           | -                                  |
| GET /points   | ✅ OK           | -                                  |
| Vertex AI     | ❌ FALTA CONFIG | Adicionar env vars                 |
| Chat IA       | ❌ 500 ERROR    | Depende do Vertex AI               |
| SVGs Storage  | ❌ 404          | Verificar arquivos                 |
| Point Details | ⚠️ PARCIAL      | Funciona mas frontend não encontra |

---

## 🎯 Próximo Passo

**1. Configure Vertex AI no IntelliJ:**

- Edit Configurations
- Environment variables
- Adicionar `GOOGLE_CLOUD_PROJECT` e `GOOGLE_CLOUD_LOCATION`
- Reiniciar backend

**2. Verifique SVGs:**

```bash
gsutil ls gs://appunture-tcc.firebasestorage.app/body-map/
```

**3. Se SVGs não existirem:**

```bash
gsutil -m cp coordenadas/*.svg gs://appunture-tcc.firebasestorage.app/body-map/
```

Me avise quando configurar o Vertex AI para testarmos o chat! 🚀
