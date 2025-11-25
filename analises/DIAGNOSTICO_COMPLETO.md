# 🔍 Diagnóstico Completo do Projeto Appunture

**Data:** 03 de novembro de 2025  
**Versão:** 1.0  
**Tipo de Documento:** Diagnóstico Técnico Completo  
**Metodologia:** Varredura automática + análise manual de código, documentação, testes, CI/CD e artefatos

---

## 📊 Sumário Executivo

O projeto Appunture é uma plataforma acadêmica (TCC) de acupuntura com **70% de completude**. Backend Java (Spring Boot 3 + Firebase/Firestore) possui **67 endpoints funcionais** em 6 controllers, **5.261 linhas de código** em 40 arquivos Java. Frontend React Native possui **18 telas implementadas** com **6.815 linhas** de código TypeScript/TSX. Atualmente possui **45 testes automatizados (100% passando)** no backend. Principais lacunas: sincronização offline completa (frontend), testes frontend (0%), documentação de usuário final (0%). Estimativa para produção: **4-6 semanas** focando em qualidade, testes e segurança.

---

## 🎯 Objetivo do Diagnóstico

Produzir um diagnóstico claro e acionável respondendo:
1. ✅ **O que já foi implementado** (com evidências)
2. ❌ **O que falta implementar** (funcionalidades, testes, integrações)
3. 🔧 **O que precisa de ajustes** (bugs, melhorias de arquitetura, qualidade, performance)

---

## 📈 Métricas do Projeto

### Estatísticas Gerais
- **Backend Java:**
  - 40 arquivos `.java` principais
  - 5.261 linhas de código
  - 6 Controllers REST
  - 67 endpoints documentados
  - 45 testes (100% passando)
  - Cobertura de testes: ~15% (crítico)
  
- **Frontend Mobile:**
  - 19 arquivos `.tsx/.ts` no app
  - 6.815 linhas de código
  - 18 telas implementadas
  - 4 stores Zustand
  - 5 services
  - 0 testes (crítico)

- **Infraestrutura:**
  - Docker Compose configurado
  - Google Cloud Build (CI/CD)
  - Firebase Authentication
  - Firestore Database
  - Firebase Storage

### Progresso por Módulo
| Módulo | Implementado | Testado | Documentado | Status |
|--------|--------------|---------|-------------|--------|
| Backend Auth | 100% | 80% | 90% | ✅ Bom |
| Backend CRUD Points | 100% | 15% | 100% | ⚠️ Precisa testes |
| Backend CRUD Symptoms | 100% | 30% | 100% | ⚠️ Precisa testes |
| Backend Admin | 100% | 0% | 100% | ❌ Sem testes |
| Backend Storage | 100% | 0% | 90% | ❌ Sem testes |
| Frontend Auth | 100% | 0% | 70% | ❌ Sem testes |
| Frontend Navigation | 100% | 0% | 60% | ⚠️ Sem testes |
| Frontend Sync Offline | 60% | 0% | 50% | ❌ Incompleto |
| Frontend Symptoms UI | 100% | 0% | 70% | ⚠️ Sem testes |
| CI/CD Pipeline | 70% | N/A | 60% | ⚠️ Funcional |

---

## 🟢 BACKEND: O QUE ESTÁ IMPLEMENTADO

### 1. Sistema de Autenticação Firebase (100%)
**Arquivos:** 
- `src/main/java/com/appunture/backend/security/FirebaseAuthenticationFilter.java` (203 linhas)
- `src/main/java/com/appunture/backend/controller/FirestoreAuthController.java` (183 linhas)
- `src/main/java/com/appunture/backend/config/SecurityConfig.java` (141 linhas)

**Funcionalidades:**
- ✅ Autenticação via Firebase Auth Token (Bearer)
- ✅ Validação de email verificado (configurável)
- ✅ RBAC com roles (USER, ADMIN)
- ✅ Sincronização automática Firebase ↔ Firestore
- ✅ Rate limiting baseado em Bucket4j
- ✅ Correlation ID para rastreamento distribuído

**Endpoints (6):**
- `GET /auth/profile` - Obter perfil do usuário
- `PUT /auth/profile` - Atualizar perfil
- `POST /auth/sync` - Sincronizar usuário Firebase→Firestore
- `GET /auth/me` - Informações do token
- `POST /auth/favorites/{pointId}` - Adicionar favorito
- `DELETE /auth/favorites/{pointId}` - Remover favorito

**Evidências:**
- Commit: `68049ea` (testes adicionados)
- Testes: `FirebaseAuthenticationFilterTest.java` - 11 testes, 90% cobertura
- Documentação: Swagger completo em `/swagger-ui/index.html`

**Status:** ✅ **Produção-ready** com rate limiting e validação de email

---

### 2. CRUD de Pontos de Acupuntura (100%)
**Arquivos:**
- `src/main/java/com/appunture/backend/controller/FirestorePointController.java` (283 linhas)
- `src/main/java/com/appunture/backend/service/FirestorePointService.java` (450+ linhas)
- `src/main/java/com/appunture/backend/model/FirestorePoint.java` (150+ linhas)

**Funcionalidades:**
- ✅ Listar, buscar, criar, atualizar, deletar pontos
- ✅ Busca por código (ex: VG20), meridiano, sintoma
- ✅ Pontos populares (por uso)
- ✅ Múltiplas imagens por ponto (`imageUrls[]`)
- ✅ Coordenadas para mapa corporal
- ✅ Associação bidirecional ponto ↔ sintoma
- ✅ Estatísticas de pontos

**Endpoints (19):**
- `GET /points` - Listar todos
- `GET /points/{id}` - Buscar por ID
- `GET /points/code/{code}` - Buscar por código
- `GET /points/meridian/{meridian}` - Filtrar por meridiano
- `GET /points/symptom/{symptomId}` - Pontos por sintoma
- `GET /points/search?name=` - Buscar por nome
- `GET /points/popular?limit=` - Pontos populares
- `POST /points` - Criar ponto (Admin)
- `PUT /points/{id}` - Atualizar (Admin)
- `DELETE /points/{id}` - Deletar (Admin)
- `POST /points/{pointId}/symptoms/{symptomId}` - Associar sintoma
- `DELETE /points/{pointId}/symptoms/{symptomId}` - Remover sintoma
- `POST /points/{pointId}/images` - Adicionar imagem
- `PUT /points/{pointId}/coordinates` - Coordenadas
- `GET /points/stats` - Estatísticas
- + 4 endpoints auxiliares

**Evidências:**
- Testes: `FirestorePointServiceTest.java` - 6 testes, 100% passando
- Swagger: Documentação completa com exemplos
- Modelo: Compatível com Firestore (IDs string, timestamps)

**Status:** ✅ **Funcional** mas precisa mais testes de integração

---

### 3. CRUD de Sintomas (100%)
**Arquivos:**
- `src/main/java/com/appunture/backend/controller/FirestoreSymptomController.java` (343 linhas)
- `src/main/java/com/appunture/backend/service/FirestoreSymptomService.java` (500+ linhas)

**Funcionalidades:**
- ✅ CRUD completo de sintomas
- ✅ Busca por categoria, tag, severidade
- ✅ Sintomas populares
- ✅ Contador de uso (`useCount`)
- ✅ Tags dinâmicas
- ✅ Relacionamento com pontos
- ✅ Estatísticas

**Endpoints (18):**
- `GET /symptoms` - Listar todos
- `GET /symptoms/{id}` - Buscar por ID
- `GET /symptoms/name/{name}` - Por nome
- `GET /symptoms/category/{category}` - Por categoria
- `GET /symptoms/point/{pointId}` - De um ponto
- `GET /symptoms/search?name=` - Buscar
- `GET /symptoms/tag/{tag}` - Por tag
- `GET /symptoms/severity?min=&max=` - Por severidade
- `GET /symptoms/popular?limit=` - Populares
- `POST /symptoms` - Criar (Admin)
- `PUT /symptoms/{id}` - Atualizar (Admin)
- `DELETE /symptoms/{id}` - Deletar (Admin)
- `POST /symptoms/{symptomId}/points/{pointId}` - Associar ponto
- `DELETE /symptoms/{symptomId}/points/{pointId}` - Remover ponto
- `POST /symptoms/{symptomId}/tags` - Tags
- `POST /symptoms/{id}/use` - Incrementar uso
- `GET /symptoms/categories` - Categorias
- `GET /symptoms/tags` - Tags disponíveis

**Evidências:**
- Testes: `FirestoreSymptomServiceTest.java` - 14 testes, 100% passando
- Cobertura: 30% do service

**Status:** ✅ **Funcional** mas precisa testes de integração

---

### 4. Painel Administrativo (100%)
**Arquivos:**
- `src/main/java/com/appunture/backend/controller/FirestoreAdminController.java` (315 linhas)
- `src/main/java/com/appunture/backend/service/FirestoreUserService.java`

**Funcionalidades:**
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de usuários
- ✅ Alteração de roles
- ✅ Habilitar/desabilitar usuários
- ✅ Seed de dados para testes
- ✅ Health checks administrativos

**Endpoints (10):**
- `GET /admin/dashboard` - Dashboard
- `GET /admin/users` - Listar usuários
- `GET /admin/users/{userId}` - Detalhes
- `PUT /admin/users/{userId}/role` - Atualizar role
- `PUT /admin/users/{userId}/enabled` - Habilitar/desabilitar
- `DELETE /admin/users/{userId}` - Deletar
- `POST /admin/users` - Criar admin
- `GET /admin/stats/detailed` - Estatísticas
- `POST /admin/data/seed` - Seed
- `GET /admin/health` - Health check

**Proteção:** `@PreAuthorize("hasRole('ROLE_ADMIN')")` em todos os endpoints

**Status:** ✅ **Funcional** mas sem testes (0%)

---

### 5. Firebase Storage (100%)
**Arquivos:**
- `src/main/java/com/appunture/backend/controller/FirebaseStorageController.java` (216 linhas)
- `src/main/java/com/appunture/backend/service/FirebaseStorageService.java`

**Funcionalidades:**
- ✅ Upload de arquivos (imagens, PDFs)
- ✅ URLs assinadas (signed URLs)
- ✅ Listagem e deleção de arquivos
- ✅ Metadados de arquivos
- ✅ Verificação de existência

**Endpoints (7):**
- `POST /api/storage/upload` - Upload
- `GET /api/storage/signed-url/{fileName}` - URL assinada
- `DELETE /api/storage/{fileName}` - Deletar (Admin)
- `GET /api/storage/list` - Listar (Admin)
- `GET /api/storage/info/{fileName}` - Info
- `GET /api/storage/exists/{fileName}` - Verificar
- `GET /api/storage/status` - Status

**Status:** ✅ **Funcional** mas sem testes (0%)

---

### 6. Observabilidade (80%)
**Arquivos:**
- `src/main/java/com/appunture/backend/filter/CorrelationIdFilter.java` (89 linhas)
- `src/main/resources/logback-spring.xml` (120+ linhas)

**Funcionalidades:**
- ✅ Logs estruturados JSON (produção)
- ✅ Correlation ID para rastreamento
- ✅ Métricas Prometheus (`/actuator/prometheus`)
- ✅ Health checks (`/health`, `/health/detailed`)
- ✅ Async logging para performance

**Evidências:**
- Testes: `CorrelationIdFilterTest.java` - 5 testes, 100% cobertura
- Configuração: `logback-spring.xml` com profiles dev/prod

**Status:** ✅ **Produção-ready**

---

### 7. Segurança (85%)
**Arquivos:**
- `src/main/java/com/appunture/backend/security/RateLimitingFilter.java` (150+ linhas)
- `src/main/java/com/appunture/backend/config/SecurityConfig.java`

**Funcionalidades:**
- ✅ Rate limiting (Bucket4j 8.8.0)
- ✅ CORS configurável por ambiente
- ✅ RBAC (Role-Based Access Control)
- ✅ Validação de email verificado
- ✅ Spring Security integrado

**Configuração:**
- Dev: 200 req/min por IP
- Prod: 120 req/min por usuário
- CORS: domínios específicos (não `*`)

**Evidências:**
- Testes: `RateLimitingFilterTest.java` - 9 testes, 89% cobertura
- Documentação inline em `SecurityConfig.java`

**Status:** ✅ **Produção-ready** com ressalvas de CORS

---

## ❌ BACKEND: O QUE FALTA IMPLEMENTAR

### 1. Cobertura de Testes Completa (CRÍTICO - Prioridade ALTA)
**Status Atual:** 15% cobertura geral, 45 testes

**Faltando:**
- ❌ Testes de integração com `@SpringBootTest` (0 testes)
- ❌ Testes de controllers (0 testes)
- ❌ Testes de repositories Firestore (0 testes)
- ❌ Testes E2E de autenticação (0 testes)
- ❌ Testes de performance (0 testes)

**Meta:** 60% cobertura mínima

**Tarefas:**
- [ ] T01.1: Criar testes de integração para AuthController
- [ ] T01.2: Criar testes de integração para PointController
- [ ] T01.3: Criar testes de integração para SymptomController
- [ ] T01.4: Criar testes de integração para AdminController
- [ ] T01.5: Criar testes de integração para StorageController
- [ ] T01.6: Adicionar testes de repositories Firestore
- [ ] T01.7: Configurar CI para falhar se cobertura < 60%

**Critérios de Aceitação:**
- [ ] Cobertura ≥ 60% em todos os services
- [ ] Todos os controllers têm testes de integração
- [ ] CI passa com 100% dos testes
- [ ] Relatório JaCoCo gerado automaticamente

**Estimativa:** 1-2 semanas (8 SP)  
**Dependências:** Nenhuma  
**Impacto:** ⚠️ CRÍTICO - Sem testes, risco alto de regressão

---

### 2. Endpoint de Reenvio de Email de Verificação (Prioridade MÉDIA)
**Status:** Email verification bloqueando login, mas sem reenvio

**Faltando:**
- ❌ `POST /auth/resend-verification` - Reenviar email
- ❌ Throttling de reenvios (max 3x/hora)
- ❌ Tratamento de erros do Firebase

**Tarefas:**
- [ ] T06.1: Implementar endpoint de reenvio
- [ ] T06.2: Adicionar rate limiting específico
- [ ] T06.3: Documentar no Swagger
- [ ] T06.4: Criar testes unitários

**Critérios de Aceitação:**
- [ ] Endpoint funcional e documentado
- [ ] Rate limiting: max 3 reenvios/hora
- [ ] Retorna 429 se exceder limite
- [ ] Testes cobrem casos de sucesso e falha

**Estimativa:** 2 dias (2 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟡 MÉDIO - UX prejudicada sem reenvio

---

### 3. Sistema de Auditoria (Prioridade MÉDIA)
**Status:** Sem rastreamento de quem criou/modificou dados

**Faltando:**
- ❌ Campos `createdBy`, `updatedBy` nos modelos
- ❌ Timestamps automáticos
- ❌ Log de ações administrativas
- ❌ Collection `audit_logs` no Firestore

**Tarefas:**
- [ ] T11.1: Adicionar campos de auditoria em `FirestorePoint`
- [ ] T11.2: Adicionar campos de auditoria em `FirestoreSymptom`
- [ ] T11.3: Criar `AuditLog` model
- [ ] T11.4: Implementar interceptor para auditoria automática
- [ ] T11.5: Endpoint `GET /admin/audit-logs`

**Critérios de Aceitação:**
- [ ] Todos os modelos têm campos de auditoria
- [ ] Auditoria automática via interceptor
- [ ] Logs armazenados no Firestore
- [ ] Endpoint admin para consulta

**Estimativa:** 1 semana (5 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟡 MÉDIO - Importante para compliance

---

### 4. Paginação Cursor-Based (Prioridade BAIXA)
**Status:** Endpoints retornam todos os resultados

**Faltando:**
- ❌ Paginação nativa do Firestore
- ❌ Parâmetros `?cursor=` e `?limit=`
- ❌ Metadados de paginação (hasNext, nextCursor)

**Tarefas:**
- [ ] T25.1: Implementar paginação em `PointService`
- [ ] T25.2: Implementar paginação em `SymptomService`
- [ ] T25.3: Atualizar DTOs de resposta
- [ ] T25.4: Documentar no Swagger

**Critérios de Aceitação:**
- [ ] Suporta paginação com cursor
- [ ] Limite padrão: 20 itens
- [ ] Retorna `nextCursor` se houver mais dados
- [ ] Compatível com frontend atual

**Estimativa:** 1 semana (5 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟢 BAIXO - Performance futura

---

### 5. Backup e Disaster Recovery (Prioridade BAIXA)
**Status:** Sem estratégia documentada

**Faltando:**
- ❌ Documentação de backup do Firestore
- ❌ Exports automáticos para GCS
- ❌ Plano de disaster recovery
- ❌ Testes de restore

**Tarefas:**
- [ ] T27.1: Documentar estratégia de backup
- [ ] T27.2: Configurar exports automáticos (Cloud Scheduler)
- [ ] T27.3: Criar runbook de disaster recovery
- [ ] T27.4: Testar restore completo

**Critérios de Aceitação:**
- [ ] Documentação completa em `BACKUP.md`
- [ ] Backups automáticos diários
- [ ] Restore testado e documentado
- [ ] RTO/RPO definidos

**Estimativa:** 2 dias (2 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟢 BAIXO - Firebase tem backup automático

---

## 🔧 BACKEND: O QUE PRECISA DE AJUSTES

### 1. Performance: N+1 Queries (Prioridade MÉDIA)
**Problema:** Buscar sintomas de pontos gera múltiplas queries

**Evidência:**
```java
// FirestorePointService.java, linha ~200
for (String symptomId : point.getSymptomIds()) {
    symptomRepository.findById(symptomId); // N+1!
}
```

**Impacto:** Latência alta em listas com muitos relacionamentos

**Solução:**
- Usar batch gets do Firestore (`getAll()`)
- Denormalizar dados críticos
- Implementar cache com Redis (futuro)

**Tarefas:**
- [ ] T14.1: Refatorar `getPointWithSymptoms()` para batch get
- [ ] T14.2: Refatorar `getSymptomWithPoints()` para batch get
- [ ] T14.3: Benchmark antes/depois
- [ ] T14.4: Adicionar testes de performance

**Critérios de Aceitação:**
- [ ] Máximo 2 queries por listagem (1 pontos + 1 batch sintomas)
- [ ] Latência reduzida em 50%+
- [ ] Testes de performance passando

**Estimativa:** 1 semana (5 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟡 MÉDIO - Performance atual aceitável

---

### 2. Tratamento de Erros: Exceções Customizadas (Prioridade MÉDIA)
**Problema:** Muitos `500 Internal Server Error` genéricos

**Evidência:**
```java
// Vários controllers
catch (Exception e) {
    return ResponseEntity.status(500).body("Erro interno");
}
```

**Solução:**
- Criar exceções customizadas (`PointNotFoundException`, `InvalidSymptomException`)
- Retornar códigos HTTP apropriados (404, 400, 422)
- Mensagens descritivas para clientes

**Tarefas:**
- [ ] T12.1: Criar exceções customizadas
- [ ] T12.2: Atualizar `GlobalExceptionHandler`
- [ ] T12.3: Refatorar controllers para usar exceções customizadas
- [ ] T12.4: Testes de tratamento de erros

**Critérios de Aceitação:**
- [ ] Todas as exceções de negócio são customizadas
- [ ] Códigos HTTP corretos (404, 400, 422, etc)
- [ ] Mensagens de erro descritivas
- [ ] Documentado no Swagger

**Estimativa:** 3 dias (3 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟡 MÉDIO - UX melhor

---

### 3. Validação: DTOs Incompletos (Prioridade MÉDIA)
**Problema:** Alguns DTOs não usam Bean Validation

**Evidência:**
```java
// Alguns DTOs sem validação
public class PointRequest {
    private String name; // Sem @NotNull, @Size
    private String description;
}
```

**Solução:**
- Adicionar `@Valid`, `@NotNull`, `@Size`, `@Email` em todos os DTOs
- Validar ranges numéricos, formatos de email
- Testes de validação

**Tarefas:**
- [ ] T13.1: Auditar todos os DTOs
- [ ] T13.2: Adicionar validações faltantes
- [ ] T13.3: Criar testes de validação
- [ ] T13.4: Documentar regras de validação

**Critérios de Aceitação:**
- [ ] 100% dos DTOs têm validação
- [ ] Validação testada
- [ ] Erros de validação retornam 400 com detalhes

**Estimativa:** 3 dias (3 SP)  
**Dependências:** Nenhuma  
**Impacto:** 🟡 MÉDIO - Dados inválidos podem entrar

---

### 4. Documentação: README Incompleto (Prioridade BAIXA)
**Problema:** README não documenta setup completo

**Faltando:**
- Setup do Firebase (service account)
- Variáveis de ambiente obrigatórias
- Processo de deploy detalhado
- Troubleshooting

**Tarefas:**
- [ ] T26.1: Expandir README com Setup detalhado
- [ ] T26.2: Documentar variáveis de ambiente
- [ ] T26.3: Adicionar seção de Deployment
- [ ] T26.4: Criar CONTRIBUTING.md
- [ ] T26.5: Adicionar badges (build, coverage)

**Estimativa:** 2 dias (2 SP)  
**Impacto:** 🟢 BAIXO - Onboarding de devs

---

## 🟢 FRONTEND: O QUE ESTÁ IMPLEMENTADO

### 1. Autenticação Firebase (100%)
**Arquivos:**
- `stores/authStore.ts` (200+ linhas)
- `services/firebase.ts` (150+ linhas)
- `app/login.tsx`, `app/register.tsx`

**Funcionalidades:**
- ✅ Login/registro com email/senha
- ✅ Firebase Authentication integrado
- ✅ Sincronização com backend (`/auth/sync`)
- ✅ Refresh automático de tokens
- ✅ Persistência de sessão (AsyncStorage)
- ✅ Logout com limpeza de cache

**Evidências:**
- Integração completa com Firebase SDK 11
- Telas de login e registro funcionais
- Store gerencia estado global de autenticação

**Status:** ✅ **Funcional**

---

### 2. Navegação e Estrutura (100%)
**Arquivos:**
- `app/_layout.tsx` - Layout principal
- `app/(tabs)/_layout.tsx` - Tabs
- 18 arquivos de telas `.tsx`

**Telas Implementadas (18):**
1. `app/index.tsx` - Home/Dashboard
2. `app/welcome.tsx` - Onboarding
3. `app/login.tsx` - Login
4. `app/register.tsx` - Registro
5. `app/(tabs)/search.tsx` - Busca de pontos
6. `app/(tabs)/symptoms.tsx` - Lista de sintomas
7. `app/(tabs)/meridians.tsx` - Navegação por meridianos
8. `app/(tabs)/chatbot.tsx` - Assistente IA
9. `app/(tabs)/favorites.tsx` - Favoritos
10. `app/(tabs)/profile.tsx` - Perfil
11. `app/point-details.tsx` - Detalhes do ponto
12. `app/symptom-details.tsx` - Detalhes do sintoma
13. `app/meridian-details.tsx` - Detalhes do meridiano
14. `app/body-map.tsx` - Mapa corporal
15. `app/profile-edit.tsx` - Editar perfil
16. + 3 telas auxiliares

**Status:** ✅ **Completo** - Navegação fluida

---

### 3. State Management com Zustand (90%)
**Arquivos:**
- `stores/authStore.ts` - Autenticação
- `stores/pointsStore.ts` - Pontos e favoritos
- `stores/symptomsStore.ts` - Sintomas
- `stores/syncStore.ts` - Sincronização offline

**Funcionalidades:**
- ✅ 4 stores implementadas
- ✅ Persistência com AsyncStorage
- ✅ Tipos TypeScript corretos
- ✅ Actions bem definidas

**Status:** ✅ **Bem estruturado**

---

### 4. Integração com API Backend (75%)
**Arquivos:**
- `services/api.ts` (600+ linhas)

**Métodos Implementados (40+):**
- ✅ Autenticação: login, register, profile, sync
- ✅ Pontos: getPoints, getById, getByCode, getByMeridian, search, popular
- ✅ Sintomas: getSymptoms, getById, getByCategory, search, popular
- ✅ Favoritos: toggle, list
- ✅ Admin: create, update, delete (pontos e sintomas)
- ✅ Storage: upload (preparado)

**Interceptor:**
- ✅ Bearer token automático
- ✅ Error handling global
- ✅ Retry logic básico

**Status:** ✅ **Funcional** - Integração sólida

---

### 5. Banco de Dados Local SQLite (60%)
**Arquivos:**
- `services/database.ts` (250+ linhas)

**Tabelas:**
- ✅ `points` - Cache de pontos
- ✅ `symptoms` - Cache de sintomas
- ✅ `favorites` - Favoritos locais
- ⚠️ `notes` - Estrutura criada, não usada
- ⚠️ `search_history` - Estrutura criada, não usada

**Status:** ✅ **Infraestrutura pronta**, precisa uso completo

---

### 6. UI/UX (85%)
**Componentes:**
- ✅ Cards de pontos e sintomas
- ✅ Barra de busca com debounce
- ✅ Filtros por categoria
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Empty states

**Design System:**
- ✅ Cores consistentes (`utils/constants.ts`)
- ✅ Typography hierarchy
- ✅ Spacing padronizado
- ✅ Ícones Ionicons

**Status:** ✅ **Profissional** mas falta acessibilidade

---

### 7. Sincronização Offline (60%)
**Arquivos:**
- `stores/syncStore.ts` (200+ linhas)
- `services/connectivity.ts`

**Funcionalidades:**
- ✅ Fila de operações pendentes
- ✅ Sincronização automática ao voltar online
- ✅ Monitoramento de conectividade (`@react-native-community/netinfo`)
- ✅ Favoritos funcionam offline
- ⚠️ Apenas favoritos, não pontos/sintomas
- ❌ Sem indicador visual de sync

**Status:** ⚠️ **Parcial** - Precisa extensão

---

## ❌ FRONTEND: O QUE FALTA IMPLEMENTAR

### 1. Testes (CRÍTICO - Prioridade ALTA)
**Status:** 0 testes implementados

**Faltando:**
- ❌ Testes unitários de stores (0 testes)
- ❌ Testes de componentes com RNTL (0 testes)
- ❌ Testes de integração API (0 testes)
- ❌ Testes E2E com Detox/Maestro (0 testes)

**Tarefas:**
- [ ] T02.1: Configurar Jest + React Native Testing Library
- [ ] T02.2: Criar testes para authStore
- [ ] T02.3: Criar testes para pointsStore
- [ ] T02.4: Criar testes para symptomsStore
- [ ] T02.5: Testes de componentes (Login, Search, PointDetails)
- [ ] T02.6: Configurar CI para rodar testes
- [ ] T02.7: Cobertura mínima 50%

**Critérios de Aceitação:**
- [ ] Cobertura ≥ 50% em stores
- [ ] Componentes críticos têm testes
- [ ] CI passa com 100% dos testes
- [ ] Relatório de cobertura gerado

**Estimativa:** 2 semanas (10 SP)  
**Dependências:** Nenhuma  
**Impacto:** ⚠️ CRÍTICO - Sem testes, risco alto

---

### 2. Sincronização Offline Completa (Prioridade ALTA)
**Status:** 60% - Apenas favoritos

**Faltando:**
- ❌ Sincronização de pontos criados offline
- ❌ Sincronização de sintomas
- ❌ Sincronização de notas pessoais
- ❌ Sincronização de histórico de buscas
- ❌ Resolução de conflitos
- ❌ Retry exponencial backoff
- ❌ Indicador visual de "sincronizando..."
- ❌ Tela de status de sincronização

**Tarefas:**
- [ ] T03.1: Estender fila para pontos e sintomas
- [ ] T03.2: Implementar conflict resolution (last-write-wins)
- [ ] T03.3: Retry exponencial com backoff
- [ ] T03.4: Indicador visual na UI
- [ ] T03.5: Tela de status de sincronização
- [ ] T03.6: Testes E2E offline→online

**Critérios de Aceitação:**
- [ ] Todas as entidades sincronizam offline
- [ ] Conflitos resolvidos automaticamente
- [ ] Usuário vê status de sincronização
- [ ] Testes E2E passando

**Estimativa:** 1 semana (6 SP)  
**Dependências:** Nenhuma  
**Impacto:** ⚠️ CRÍTICO - Funcionalidade core

---

### 3. Galeria de Imagens (Prioridade MÉDIA-ALTA)
**Status:** 40% - Backend pronto, frontend não

**Faltando:**
- ❌ Componente de galeria (carousel/grid)
- ❌ Visualizador full-screen com zoom
- ❌ Seletor de imagem (câmera/galeria)
- ❌ Upload via Firebase Storage
- ❌ Progress bar de upload

**Tarefas:**
- [ ] T08.1: Criar componente `ImageGallery.tsx`
- [ ] T08.2: Integrar `expo-image-picker`
- [ ] T08.3: Implementar upload em `services/storage.ts`
- [ ] T08.4: Progress bar durante upload
- [ ] T08.5: Testes do componente

**Critérios de Aceitação:**
- [ ] Exibe múltiplas imagens em carousel
- [ ] Full-screen com zoom/pinch
- [ ] Upload funciona (câmera e galeria)
- [ ] Progress bar visível

**Estimativa:** 1 semana (5 SP)  
**Dependências:** Backend `/api/storage/upload` ✅  
**Impacto:** 🟡 MÉDIO - UX melhorada

---

### 4. Mapa Corporal Interativo (Prioridade MÉDIA-ALTA)
**Status:** 25% - Componente existe, não integrado

**Faltando:**
- ❌ Carregar coordenadas do backend
- ❌ Renderizar pontos nas posições corretas
- ❌ Pontos clicáveis (navegação)
- ❌ Filtros por meridiano no mapa
- ❌ Zoom e pan

**Tarefas:**
- [ ] T09.1: Integrar `GET /points` com coordenadas
- [ ] T09.2: Renderizar com SVG
- [ ] T09.3: Implementar interatividade (onPress)
- [ ] T09.4: Adicionar zoom/pan
- [ ] T09.5: Filtros por meridiano

**Critérios de Aceitação:**
- [ ] Carrega coordenadas do backend
- [ ] Pontos renderizados corretamente
- [ ] Clicável e navega para detalhes
- [ ] Filtros funcionam

**Estimativa:** 1 semana (5 SP)  
**Dependências:** Backend `PUT /points/{id}/coordinates` ✅  
**Impacto:** 🟡 MÉDIO - Feature diferencial

---

### 5. Upload de Foto de Perfil (Prioridade MÉDIA)
**Status:** 0%

**Faltando:**
- ❌ Seletor de imagem (câmera/galeria)
- ❌ Crop/resize
- ❌ Upload para Firebase Storage
- ❌ Atualizar `profileImageUrl` no backend

**Tarefas:**
- [ ] T10.1: Integrar `expo-image-picker`
- [ ] T10.2: Adicionar `expo-image-manipulator` para crop
- [ ] T10.3: Upload via `/api/storage/upload`
- [ ] T10.4: Update via `PUT /auth/profile`

**Critérios de Aceitação:**
- [ ] Seletor funciona (câmera e galeria)
- [ ] Crop/resize antes do upload
- [ ] Upload bem-sucedido
- [ ] Perfil atualizado no backend

**Estimativa:** 3 dias (3 SP)  
**Dependências:** T08 (Galeria)  
**Impacto:** 🟡 MÉDIO - UX

---

### 6. Login Social (Prioridade MÉDIA)
**Status:** 0%

**Faltando:**
- ❌ Login com Google
- ❌ Login com Apple (obrigatório iOS)
- ❌ Login com Facebook (opcional)

**Tarefas:**
- [ ] T20.1: Configurar Firebase Authentication providers
- [ ] T20.2: Adicionar botões de login social
- [ ] T20.3: Implementar fluxo OAuth
- [ ] T20.4: Testar em iOS e Android
- [ ] T20.5: Sincronizar com backend

**Critérios de Aceitação:**
- [ ] Login com Google funciona (iOS/Android)
- [ ] Login com Apple funciona (iOS)
- [ ] Sincroniza com `/auth/sync`
- [ ] Erros tratados

**Estimativa:** 1 semana (5 SP)  
**Dependências:** Configuração Firebase Console  
**Impacto:** 🟡 MÉDIO - UX melhorada

---

### 7. Notificações Push (Prioridade BAIXA)
**Status:** 0%

**Faltando:**
- ❌ Firebase Cloud Messaging
- ❌ Permissões de notificação
- ❌ Token salvando no backend
- ❌ Backend: endpoint para enviar notificações

**Tarefas:**
- [ ] T21.1: Configurar FCM
- [ ] T21.2: Solicitar permissões
- [ ] T21.3: Salvar token via `PUT /auth/profile`
- [ ] T21.4: Backend: criar `NotificationService`
- [ ] T21.5: Testar notificações

**Estimativa:** 1 semana (5 SP)  
**Impacto:** 🟢 BAIXO - Nice to have

---

### 8. Modo Escuro (Prioridade BAIXA)
**Status:** 0%

**Tarefas:**
- [ ] T22.1: Criar `ThemeContext` ou Zustand store
- [ ] T22.2: Definir paleta dark mode
- [ ] T22.3: Aplicar cores dinâmicas
- [ ] T22.4: Toggle nas configurações
- [ ] T22.5: Persistir preferência

**Estimativa:** 1 semana (5 SP)  
**Impacto:** 🟢 BAIXO - UX

---

### 9. Internacionalização (Prioridade BAIXA)
**Status:** 0%

**Tarefas:**
- [ ] T23.1: Configurar `react-i18next`
- [ ] T23.2: Extrair textos para `locales/pt.json` e `locales/en.json`
- [ ] T23.3: Traduzir interface
- [ ] T23.4: Seletor de idioma

**Estimativa:** 1 semana (5 SP)  
**Impacto:** 🟢 BAIXO - Internacionalização

---

## 🔧 FRONTEND: O QUE PRECISA DE AJUSTES

### 1. Performance: Renderização de Listas (Prioridade MÉDIA)
**Problema:** `FlatList` sem otimizações para 100+ itens

**Solução:**
- Usar `getItemLayout` para cálculo de altura
- Adicionar `removeClippedSubviews={true}`
- Considerar `FlashList` (Shopify)

**Tarefas:**
- [ ] T15.1: Otimizar `FlatList` em `search.tsx`
- [ ] T15.2: Otimizar `FlatList` em `symptoms.tsx`
- [ ] T15.3: Benchmark antes/depois

**Estimativa:** 2 dias (2 SP)  
**Impacto:** 🟡 MÉDIO - Performance atual OK

---

### 2. Acessibilidade (Prioridade MÉDIA)
**Problema:** Muitos componentes sem `accessibilityLabel`

**Solução:**
- Adicionar `accessibilityLabel` em todos os botões e inputs
- Adicionar `accessibilityRole`
- Testar com leitor de tela

**Tarefas:**
- [ ] T16.1: Auditar todos os componentes
- [ ] T16.2: Adicionar labels faltantes
- [ ] T16.3: Testar com TalkBack/VoiceOver

**Estimativa:** 3 dias (3 SP)  
**Impacto:** 🟡 MÉDIO - Acessibilidade importante

---

### 3. Error Handling (Prioridade MÉDIA)
**Problema:** Alertas genéricos "Algo deu errado"

**Solução:**
- Criar componente `Toast` ou usar `react-native-toast-message`
- Mapear erros HTTP para mensagens amigáveis
- Exibir ações de retry

**Tarefas:**
- [ ] T17.1: Integrar `react-native-toast-message`
- [ ] T17.2: Mapear erros HTTP
- [ ] T17.3: Adicionar retry actions

**Estimativa:** 2 dias (2 SP)  
**Impacto:** 🟡 MÉDIO - UX

---

### 4. Validação de Formulários (Prioridade MÉDIA)
**Problema:** Validação inconsistente

**Solução:**
- Usar Yup ou Zod
- Validar antes de enviar
- Erros inline

**Tarefas:**
- [ ] T18.1: Integrar Yup
- [ ] T18.2: Validar login, registro, perfil
- [ ] T18.3: Exibir erros inline

**Estimativa:** 3 dias (3 SP)  
**Impacto:** 🟡 MÉDIO - UX

---

### 5. Segurança: Tokens em AsyncStorage (Prioridade MÉDIA)
**Problema:** Tokens em AsyncStorage não é seguro

**Solução:**
- Migrar para `expo-secure-store` (keychain/keystore)

**Tarefas:**
- [ ] T19.1: Integrar `expo-secure-store`
- [ ] T19.2: Migrar tokens para SecureStore
- [ ] T19.3: Testes de segurança

**Estimativa:** 2 dias (2 SP)  
**Impacto:** 🟡 MÉDIO - Segurança

---

## ⚠️ RISCOS E RECOMENDAÇÕES

### Riscos Identificados

| ID | Risco | Impacto | Probabilidade | Mitigação |
|----|-------|---------|---------------|-----------|
| R01 | Firebase Quotas Exceeded | 🔴 Alto | 🟡 Média | Monitorar uso, alertas, cache Redis |
| R02 | Sem testes = alta regressão | 🔴 Alto | 🔴 Alta | Implementar T01 e T02 imediatamente |
| R03 | CORS permissivo = CSRF | 🔴 Alto | 🟡 Média | Validar CORS antes de produção |
| R04 | Rate limiting mal calibrado | 🟡 Médio | 🟢 Baixa | Monitorar métricas, ajustar limites |
| R05 | N+1 queries = latência | 🟡 Médio | 🟡 Média | Implementar T14, batch gets |
| R06 | Tokens em AsyncStorage | 🟡 Médio | 🟢 Baixa | Implementar T19, SecureStore |
| R07 | Sem auditoria = compliance | 🟢 Baixo | 🟢 Baixa | Implementar T11 se necessário |
| R08 | Sem backup documentado | 🟢 Baixo | 🟢 Baixa | Documentar estratégia |

### Recomendações Arquiteturais

#### 1. Cache com Redis (Futuro)
- **Problema:** Firestore cobra por leitura
- **Solução:** Adicionar Redis como cache
- **Benefícios:** Reduz custo 70-80%, melhora latência 50%
- **Estimativa:** 1 semana (5 SP)

#### 2. GraphQL (Longo Prazo)
- **Problema:** REST gera overfetching
- **Solução:** Migrar para GraphQL
- **Benefícios:** Reduz tráfego 40%, melhora UX
- **Estimativa:** 3-4 semanas (15 SP)

#### 3. BFF para Mobile
- **Problema:** Mobile e Web têm necessidades diferentes
- **Solução:** Criar BFF específico (Node.js/NestJS)
- **Benefícios:** Performance mobile, flexibilidade
- **Estimativa:** 2 semanas (10 SP)

#### 4. Search Engine (Algolia/Elasticsearch)
- **Problema:** Busca do Firestore é limitada
- **Solução:** Integrar Algolia ou Elasticsearch
- **Benefícios:** Busca profissional com typo tolerance
- **Estimativa:** 1 semana (5 SP)

#### 5. CI/CD Completo
- **Situação:** Cloud Build configurado, sem testes
- **Recomendação:** GitHub Actions para CI completo
- **Benefícios:** Reduz erros, acelera deploys
- **Estimativa:** 3 dias (3 SP)

#### 6. Monitoramento e Alertas
- **Situação:** Sem monitoramento de produção
- **Recomendação:** Google Cloud Monitoring + Alertas
- **Benefícios:** Detecção proativa de problemas
- **Estimativa:** 2 dias (2 SP)

---

## 🧪 CHECKLIST DE QA (Homologação)

### Smoke Tests (Mínimo para Homologação)

#### Backend
- [ ] **Health Check:** `GET /health` retorna 200 OK
- [ ] **Autenticação:** Login com Firebase retorna token válido
- [ ] **Listagem:** `GET /points` retorna lista de pontos
- [ ] **Busca:** `GET /points/search?name=VG` retorna resultados
- [ ] **CRUD Admin:** Admin pode criar, editar e deletar ponto
- [ ] **Favoritos:** User pode adicionar/remover favorito
- [ ] **Storage:** Upload de arquivo funciona
- [ ] **Swagger:** Documentação acessível em `/swagger-ui`
- [ ] **Métricas:** `/actuator/prometheus` retorna métricas
- [ ] **Logs:** Correlation ID presente em todos os logs

#### Frontend
- [ ] **Login:** Login com email/senha funciona
- [ ] **Home:** Exibe pontos populares e sintomas comuns
- [ ] **Busca:** Buscar "VG20" retorna resultado correto
- [ ] **Detalhes:** Clicar em ponto exibe detalhes completos
- [ ] **Favoritos:** Adicionar/remover favorito sincroniza
- [ ] **Offline:** Abrir app offline exibe dados em cache
- [ ] **Perfil:** Editar nome e salvar funciona
- [ ] **Navegação:** Todas as tabs navegam corretamente
- [ ] **Sintomas:** Lista de sintomas carrega e filtra
- [ ] **Sincronização:** Favorito offline sincroniza ao voltar online

### Testes de Integração

- [ ] **E2E:** Fluxo completo (Login → Buscar → Favoritar → Ver Perfil)
- [ ] **Sync:** Criar ponto no admin aparece no mobile em tempo real
- [ ] **Offline → Online:** Operações pendentes sincronizam
- [ ] **Rate Limiting:** Bloqueia após exceder limite
- [ ] **Email Verificado:** Bloqueia login sem email verificado
- [ ] **Roles:** Admin pode criar, User não pode

### Testes de Regressão

- [ ] Nenhuma feature existente quebrou
- [ ] Endpoints antigos ainda funcionam
- [ ] Dados migrados corretamente

### Reproduzir Problemas Identificados

#### Problema 1: CORS Permissivo (Resolvido)
1. Fazer request de domínio não autorizado
2. Verificar se CORS bloqueia (deve bloquear em prod)
3. ✅ Validado: CORS configurado corretamente

#### Problema 2: Email Não Verificado (Resolvido)
1. Criar conta Firebase sem verificar email
2. Tentar acessar endpoint protegido
3. ✅ Confirma resposta 403 com mensagem
4. ⚠️ Pendente: UI para reenviar email

#### Problema 3: N+1 Queries (Pendente)
1. Buscar ponto com 10 sintomas
2. Monitorar logs do Firestore
3. ❌ Verificar se faz N+1 queries
4. Após T14: Deve fazer 1 batch get

#### Problema 4: Sincronização Offline (Parcial)
1. Adicionar favorito offline
2. Voltar online
3. ✅ Favorito sincroniza
4. ⚠️ Pendente: Pontos, sintomas, notas

#### Problema 5: Teste Falho (Resolvido)
1. Executar `mvn test`
2. ✅ Todos os 45 testes passam
3. Corrigido: `FirestorePointServiceTest` timing issue

---

## 📋 BACKLOG CONSOLIDADO

### 🔴 Sprint 1 - Prioridade ALTA (4 semanas)

| ID | Tarefa | Área | Est. | Dependências | Status |
|----|--------|------|------|--------------|--------|
| T01 | Implementar testes backend | Backend | 8 SP | Nenhuma | 🔄 40% |
| T02 | Implementar testes frontend | Frontend | 10 SP | Nenhuma | ❌ 0% |
| T03 | Sincronização offline completa | Frontend | 6 SP | Nenhuma | 🔄 60% |
| T04 | Corrigir CORS | Backend | 0.5 SP | Nenhuma | ✅ 100% |
| T05 | Logs estruturados + Correlation ID | Backend | 5 SP | Nenhuma | ✅ 100% |
| T06 | Validação email + reenvio | Backend | 2 SP | Nenhuma | 🔄 70% |
| T07 | Rate limiting | Backend | 3 SP | Nenhuma | ✅ 100% |

**Total:** 34.5 SP (~4 semanas para 1 dev)  
**Concluído:** 8.5 SP (25%)  
**Restante:** 26 SP

---

### 🟡 Sprint 2 - Prioridade MÉDIA (3 semanas)

| ID | Tarefa | Área | Est. | Dependências |
|----|--------|------|------|--------------|
| T08 | Galeria de imagens | Frontend | 5 SP | Nenhuma |
| T09 | Mapa corporal interativo | Frontend | 5 SP | Nenhuma |
| T10 | Upload foto de perfil | Frontend | 3 SP | T08 |
| T11 | Sistema de auditoria | Backend | 5 SP | Nenhuma |
| T12 | Exceções customizadas | Backend | 3 SP | Nenhuma |
| T13 | Validação DTOs completa | Backend | 3 SP | Nenhuma |
| T14 | Otimizar N+1 queries | Backend | 5 SP | Nenhuma |
| T15 | Otimizar renderização listas | Frontend | 2 SP | Nenhuma |
| T16 | Acessibilidade completa | Frontend | 3 SP | Nenhuma |
| T17 | Error handling melhorado | Frontend | 2 SP | Nenhuma |
| T18 | Validação formulários | Frontend | 3 SP | Nenhuma |
| T19 | Migrar para SecureStore | Frontend | 2 SP | Nenhuma |

**Total:** 41 SP (~3 semanas)

---

### 🟢 Sprint 3 - Prioridade BAIXA (2 semanas)

| ID | Tarefa | Área | Est. | Dependências |
|----|--------|------|------|--------------|
| T20 | Login social | Frontend | 5 SP | Nenhuma |
| T21 | Notificações push | Full-stack | 5 SP | Nenhuma |
| T22 | Modo escuro | Frontend | 5 SP | Nenhuma |
| T23 | Internacionalização | Frontend | 5 SP | Nenhuma |
| T24 | Histórico de buscas | Frontend | 2 SP | Nenhuma |
| T25 | Paginação cursor-based | Backend | 5 SP | Nenhuma |
| T26 | Documentação completa | Docs | 2 SP | Nenhuma |
| T27 | Backup e DR | Backend | 2 SP | Nenhuma |
| T28 | Bundle size optimization | Frontend | 1 SP | Nenhuma |

**Total:** 32 SP (~2 semanas)

---

## 📝 EVIDÊNCIAS E ARTEFATOS

### Commits Relevantes
- `68049ea` - Adicionados testes para services (FirestorePointService, FirestoreSymptomService)
- `5f4387f` - Initial plan (este branch)

### Arquivos de Análise
- **ANALISE_ATUALIZADA.md** - Análise completa (1083 linhas)
- **FRONTEND_MOBILE_GAP_ANALYSIS.md** - Análise de lacunas frontend (932 linhas)
- **IMPLEMENTACAO_RELATORIO.md** - Relatório de implementação (587 linhas)
- **IMPLEMENTACAO_T01_T02_T04_T05.md** - Sprint 1 detalhada
- **LEIA-ME_ANALISE.md** - Resumo executivo (230 linhas)

### Documentação Técnica
- **README.md** - Documentação principal (164 linhas)
- **backend-java/README.md** - Setup backend
- **frontend-mobile/appunture/README.md** - Setup frontend
- **DECISOES_ARQUITETURA.md** - Decisões arquiteturais
- **STATUS_FINAL_MIGRACAO.md** - Migração PostgreSQL → Firestore

### Pipelines e Infraestrutura
- **docker-compose.yml** - Orquestração de containers
- **cloudbuild.yaml** - Google Cloud Build
- **Dockerfile** (backend e frontend)

### Testes
- **Backend:** 5 arquivos de teste, 45 testes, 100% passando
- **Frontend:** 0 arquivos de teste (CRÍTICO)

### Relatórios de Cobertura
- JaCoCo configurado: `backend-java/target/site/jacoco/`
- Cobertura atual: ~15% (meta: 60%)

---

## 🎯 CONCLUSÃO

### Situação Atual
O projeto Appunture está em **estágio avançado** (70% completo) com:
- ✅ Backend sólido e funcional (Spring Boot + Firebase)
- ✅ Frontend com navegação completa e UI moderna
- ✅ Integração API funcional (75%)
- ✅ Observabilidade implementada (logs, métricas)
- ✅ Segurança básica (autenticação, rate limiting)
- ❌ Falta de testes (CRÍTICO - apenas backend tem 45 testes)
- ⚠️ Sincronização offline parcial (60%)
- ❌ Sem documentação de usuário final

### Recomendação Final
**Priorizar Sprint 1** (testes + segurança + sync offline) antes de produção.

### Estimativa para Produção
- **Sprint 1 (Alta):** 4 semanas → **Staging-ready**
- **Sprint 2 (Média):** +3 semanas → **Beta-ready**
- **Sprint 3 (Baixa):** +2 semanas → **Production-ready**
- **Total:** 9 semanas (~2 meses) → **MVP Completo**

### Próximos Passos Imediatos
1. ✅ Fixar teste falho (`FirestorePointServiceTest`) - **CONCLUÍDO**
2. ⏭️ Implementar T01 (testes backend) - **40% concluído**
3. ⏭️ Implementar T02 (testes frontend)
4. ⏭️ Completar T03 (sync offline)
5. ⏭️ Implementar T06 (reenvio de email)
6. ⏭️ Executar checklist de QA completo

---

**Documento gerado em:** 2025-11-03 09:50:00 UTC  
**Próxima revisão:** Após conclusão de Sprint 1  
**Contato:** Equipe Appunture / TCC Sistema de Informação

---

## 📞 Suporte

Para dúvidas sobre este diagnóstico:
1. Consulte os arquivos de análise detalhados
2. Revise a documentação técnica no repositório
3. Execute o checklist de QA para validação
4. Priorize tarefas conforme Sprint 1 → 2 → 3
