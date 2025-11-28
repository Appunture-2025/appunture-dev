# 🔍 Análise Final - O que Falta para Terminar o App

> **Data**: 28/11/2025  
> **Objetivo**: Identificar todos os itens pendentes para finalização do MVP

---

## 📊 Resumo Executivo

| Módulo          | Progresso | Itens Pendentes                                     |
| --------------- | --------- | --------------------------------------------------- |
| Backend Java    | 90%       | Testes >80%, Cache, Índices Firestore               |
| Frontend Mobile | 85%       | Google/Apple Sign-In, Upload foto perfil, Testes UI |
| Integração      | 75%       | Testes E2E automatizados, Newman CI                 |
| DevOps          | 95%       | Secrets produção, Alertas                           |

---

## 🔴 BACKEND - Itens Pendentes

### 1. Testes (Prioridade Alta)

- [ ] **Cobertura JaCoCo < 80%** - Atualmente ~60-70%
  - Faltam testes: `FileUploadService`, `ThumbnailGenerationService`
  - Faltam testes de integração com Firestore Emulator
  - Faltam testes de controller `FirebaseStorageController`

### 2. Performance (Prioridade Média)

- [ ] **Cache Strategy** - Não implementado

  - Cache in-memory para pontos/sintomas frequentes (Spring Cache + Caffeine)
  - Cache de consultas Firestore
  - TTL configurável por tipo de dado

- [ ] **Índices Firestore** - Parcialmente configurado
  - Índices compostos para queries complexas
  - Otimização de paginação

### 3. Features Faltantes (Prioridade Média)

- [ ] **Usuário Admin Padrão** - Seed não cria admin
- [ ] **Notificações Push** - Firebase Cloud Messaging não integrado
- [ ] **Resize de Imagens** - ThumbnailGenerationService existe mas não está completo

### 4. Observabilidade (Prioridade Baixa)

- [ ] **Alertas Produção** - Prometheus/Grafana configurados, mas alertas não testados
- [ ] **Dashboard Analytics** - Tracking de uso de pontos não implementado

---

## 🔴 FRONTEND - Itens Pendentes

### 1. Autenticação Social (Prioridade Alta)

- [ ] **Google Sign-In** - Placeholder com `throw new Error`

  - Requer: `@react-native-google-signin/google-signin`
  - Configurar OAuth no Firebase Console

- [ ] **Apple Sign-In** - Placeholder com `throw new Error`
  - Requer: `expo-apple-authentication`
  - Disponível apenas iOS

### 2. Upload de Mídia (Prioridade Alta)

- [ ] **Foto de Perfil** - TODO em `profile-edit.tsx` linha 88

  - Integrar Image picker
  - Upload para Firebase Storage via `/storage/upload`
  - Atualizar `profileImageUrl` no perfil

- [ ] **Galeria de Imagens nos Pontos** - Parcial
  - `ImageGallery.tsx` existe mas depende de upload funcional

### 3. Testes UI (Prioridade Média)

- [ ] **Testes de Componentes** - Poucos testes

  - `ImageGallery.test.tsx` existe
  - Faltam: `PointCard`, `SearchBar`, `SyncBanner`, `BodyMap`

- [ ] **Testes de Telas** - Não existem
  - Telas principais: Home, Search, Profile, Point Details

### 4. UX/Polish (Prioridade Baixa)

- [ ] **Loading States** - Alguns componentes sem skeleton
- [ ] **Error Boundaries** - Não implementados
- [ ] **Accessibility** - Labels parciais (alguns `accessibilityLabel` existem)
- [ ] **Internacionalização** - Hardcoded em português

### 5. Console.log/warn para Produção

- [ ] **Remover logs de debug** - ~20+ `console.warn/error` em produção
  - `syncStore.ts` - 14 ocorrências
  - `storage.ts` - 7 ocorrências
  - Implementar logger condicional (`__DEV__`)

---

## 🔴 INTEGRAÇÃO - Itens Pendentes

### 1. Testes E2E (Prioridade Alta)

- [ ] **Newman CI** - Collection Postman existe mas não roda em CI

  - Script `npm run test:e2e:api` não está no workflow
  - Falta configurar ambiente de teste

- [ ] **Detox CI** - Configurado mas não executa com sucesso
  - Dependências iOS (applesimutils)
  - Build do app para testes

### 2. Contratos API (Prioridade Média)

- [ ] **Validação de Schemas** - Não automatizada
- [ ] **Versionamento API** - Não implementado

---

## 🔴 DEVOPS - Itens Pendentes

### 1. Secrets Produção (Prioridade Alta)

- [ ] **GitHub Secrets não configurados**:
  - `GCP_SERVICE_ACCOUNT`
  - `GCP_PROJECT_ID`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `EXPO_TOKEN`
  - `API_BASE_URL`

### 2. Deploy (Prioridade Média)

- [ ] **Health Check pós-deploy** - Implementado mas não testado
- [ ] **Rollback automático** - Documentado mas não testado

---

## ✅ O que JÁ ESTÁ FUNCIONANDO

### Backend

- ✅ CRUD completo (Users, Points, Symptoms)
- ✅ Firebase Auth integrado
- ✅ Firebase Storage upload
- ✅ Rate Limiting (Bucket4j)
- ✅ Logs estruturados (Logstash)
- ✅ Prometheus metrics
- ✅ Seed de dados (NDJSON)
- ✅ Swagger/OpenAPI

### Frontend

- ✅ Firebase Auth (email/password)
- ✅ Offline sync com fila
- ✅ Conflict resolution (last-write-wins)
- ✅ Expo Router navigation
- ✅ Zustand stores
- ✅ Detox E2E config
- ✅ Jest unit tests

### DevOps

- ✅ Workflows CI/CD (backend, frontend, seed)
- ✅ Docker/Cloud Run ready
- ✅ Postman collection

---

## 🎯 Priorização para MVP

### Sprint 1 (Crítico - 3 dias)

1. Aumentar cobertura testes backend >80%
2. Implementar Google Sign-In
3. Implementar upload foto de perfil
4. Configurar secrets GitHub

### Sprint 2 (Importante - 2 dias)

5. Implementar Apple Sign-In (iOS)
6. Remover console.logs de produção
7. Newman CI no workflow
8. Testes componentes React Native

### Sprint 3 (Nice-to-have - 2 dias)

9. Cache strategy backend
10. Índices Firestore
11. Error boundaries frontend
12. Notificações push

---

## 📁 Arquivos Chave para Editar

| Arquivo               | O que falta                                     |
| --------------------- | ----------------------------------------------- |
| `authStore.ts`        | Implementar `loginWithGoogle`, `loginWithApple` |
| `profile-edit.tsx`    | Upload de foto de perfil                        |
| `constants.ts`        | Logger condicional                              |
| `syncStore.ts`        | Remover console.logs                            |
| `storage.ts`          | Remover console.logs                            |
| `backend-ci.yml`      | Adicionar Newman                                |
| `SecurityConfig.java` | Cache headers                                   |

---

_Análise gerada automaticamente em 28/11/2025_
