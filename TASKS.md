# 📋 Arquivo de Tasks do Projeto Appunture

**Data de Geração:** 04 de novembro de 2025  
**Última Atualização:** 12 de novembro de 2025  
**Versão:** 1.1  
**Baseado em:** ANALISE_ATUALIZADA.md e DIAGNOSTICO_COMPLETO.md  

Este documento contém todas as tarefas identificadas na análise completa do projeto Appunture, organizadas por prioridade. Cada task inclui um **prompt pronto** para ser usado em execução futura, permitindo implementação rápida e padronizada.

---

## 📝 Changelog

### Versão 1.1 - 12 de novembro de 2025
**Atualizações de Status:**
- ✅ **TASK-004** - CORS configurado corretamente (100% concluído)
- ✅ **TASK-005** - Logs estruturados JSON + Correlation ID implementados (100% concluído)
- ✅ **TASK-007** - Rate limiting com Bucket4j implementado (100% concluído)
- ✅ **TASK-008** - Galeria de imagens múltiplas implementada (100% concluído - commit 49f94a4)
- 🔄 **TASK-001** - Testes backend atualizados: 45 testes unitários (100% passando)
- 🔄 **TASK-006** - Validação de email verificado: 70% concluído (bloqueio implementado)

**Métricas Atualizadas:**
- Backend: 45 testes unitários, 100% passando ✅
- Frontend: ImageGallery component implementado com testes ✅
- Cobertura de testes: ~15% (meta: 60%)

**Commits Relevantes:**
- `49f94a4` - feat: add image gallery component with upload and delete functionality

---

## 📊 Índice Rápido

### 🔴 Prioridade ALTA (Sprint 1)
- [TASK-001](#task-001-implementar-testes-backend-completos) - Implementar testes backend completos
- [TASK-002](#task-002-implementar-testes-frontend-completos) - Implementar testes frontend completos
- [TASK-003](#task-003-completar-sincronização-offline) - Completar sincronização offline
- [TASK-004](#task-004-corrigir-configuração-cors) - Corrigir configuração CORS
- [TASK-005](#task-005-logs-estruturados-e-correlation-id) - Logs estruturados e Correlation ID
- [TASK-006](#task-006-validação-e-reenvio-de-email) - Validação e reenvio de email
- [TASK-007](#task-007-rate-limiting-completo) - Rate limiting completo

### 🟡 Prioridade MÉDIA (Sprint 2)
- [TASK-008](#task-008-galeria-de-imagens-múltiplas) - Galeria de imagens múltiplas
- [TASK-009](#task-009-mapa-corporal-interativo) - Mapa corporal interativo
- [TASK-010](#task-010-upload-de-foto-de-perfil) - Upload de foto de perfil
- [TASK-011](#task-011-sistema-de-auditoria) - Sistema de auditoria
- [TASK-012](#task-012-exceções-customizadas) - Exceções customizadas
- [TASK-013](#task-013-validação-completa-de-dtos) - Validação completa de DTOs
- [TASK-014](#task-014-otimizar-n1-queries) - Otimizar N+1 queries
- [TASK-015](#task-015-otimizar-renderização-de-listas) - Otimizar renderização de listas
- [TASK-016](#task-016-acessibilidade-completa) - Acessibilidade completa
- [TASK-017](#task-017-error-handling-melhorado) - Error handling melhorado
- [TASK-018](#task-018-validação-de-formulários) - Validação de formulários
- [TASK-019](#task-019-migrar-tokens-para-securestore) - Migrar tokens para SecureStore

### 🟢 Prioridade BAIXA (Sprint 3)
- [TASK-020](#task-020-login-social) - Login social
- [TASK-021](#task-021-notificações-push) - Notificações push
- [TASK-022](#task-022-modo-escuro) - Modo escuro
- [TASK-023](#task-023-internacionalização) - Internacionalização
- [TASK-024](#task-024-histórico-de-buscas) - Histórico de buscas
- [TASK-025](#task-025-paginação-cursor-based) - Paginação cursor-based
- [TASK-026](#task-026-documentação-completa) - Documentação completa
- [TASK-027](#task-027-backup-e-disaster-recovery) - Backup e disaster recovery
- [TASK-028](#task-028-otimização-de-bundle-size) - Otimização de bundle size

---

## 🔴 SPRINT 1 - Prioridade ALTA

---

### [TASK-001] Implementar Testes Backend Completos

**Área:** Backend  
**Estimativa:** 10 story points (1-2 semanas)  
**Status Atual:** 🔄 40% concluído (45 testes existentes, 100% passando, ~15% cobertura)  
**Prioridade:** 🔴 CRÍTICA  
**Dependências:** Nenhuma

#### Descrição
Expandir a cobertura de testes do backend Java de 15% para no mínimo 60%, incluindo testes de integração para todos os controllers e testes de segurança para autenticação e autorização.

#### Contexto
Atualmente o projeto possui 45 testes unitários (100% passando) focados em filtros e services básicos:
- CorrelationIdFilterTest: 5 testes (100% cobertura) ✅
- RateLimitingFilterTest: 9 testes (89% cobertura) ✅
- FirebaseAuthenticationFilterTest: 11 testes (89% cobertura) ✅
- FirestorePointServiceTest: 6 testes (100% passando) ✅
- FirestoreSymptomServiceTest: 14 testes (100% passando) ✅

Faltam testes de integração com `@SpringBootTest`, testes de repositories Firestore, e testes end-to-end de autenticação.

#### Critérios de Aceitação
- [ ] Cobertura mínima de 60% em todos os services
- [ ] Testes de integração para AuthController (mínimo 10 testes)
- [ ] Testes de integração para PointController (mínimo 15 testes)
- [ ] Testes de integração para SymptomController (mínimo 15 testes)
- [ ] Testes de integração para AdminController (mínimo 8 testes)
- [ ] Testes de integração para StorageController (mínimo 5 testes)
- [ ] Testes de segurança (autenticação válida/inválida, RBAC)
- [ ] JaCoCo configurado para falhar build se cobertura < 60%
- [ ] Relatórios JaCoCo gerados automaticamente
- [ ] 100% dos testes passando no CI

#### Arquivos Principais
- `backend-java/src/test/java/com/appunture/backend/controller/`
- `backend-java/src/test/java/com/appunture/backend/service/`
- `backend-java/src/test/java/com/appunture/backend/repository/`
- `backend-java/pom.xml` (configuração JaCoCo)

#### Prompt Sugerido

```
Implemente testes completos para o backend Java Spring Boot do projeto Appunture.

CONTEXTO:
- Projeto: Appunture (TCC - plataforma de acupuntura)
- Stack: Spring Boot 3 + Java 17 + Firebase/Firestore
- Status atual: 45 testes unitários, ~15% cobertura
- Meta: 60% cobertura mínima

REQUISITOS:

1. TESTES DE INTEGRAÇÃO PARA CONTROLLERS
   - Use @SpringBootTest e @AutoConfigureMockMvc
   - Mock do Firebase Authentication com tokens válidos
   - Teste todos os endpoints de cada controller
   - Inclua casos de sucesso e falha
   - Verifique status HTTP, response body e headers

2. CONTROLLERS A TESTAR:
   a) FirestoreAuthController (/auth):
      - GET /auth/profile (200, 401, 404)
      - PUT /auth/profile (200, 400, 401)
      - POST /auth/sync (200, 400, 401)
      - POST /auth/favorites/{pointId} (200, 404, 401)
      - DELETE /auth/favorites/{pointId} (200, 404, 401)
   
   b) FirestorePointController (/points):
      - GET /points (200)
      - GET /points/{id} (200, 404)
      - GET /points/code/{code} (200, 404)
      - POST /points (201 Admin, 403 User, 401)
      - PUT /points/{id} (200 Admin, 403 User, 404)
      - DELETE /points/{id} (204 Admin, 403 User)
   
   c) FirestoreSymptomController (/symptoms):
      - Similar ao PointController
      - Mínimo 15 testes cobrindo todos os endpoints
   
   d) FirestoreAdminController (/admin):
      - Todos os endpoints requerem ROLE_ADMIN
      - Testar rejeição de ROLE_USER
      - Dashboard, users, stats, seed
   
   e) FirebaseStorageController (/api/storage):
      - Upload, signed URLs, delete
      - Mock do Firebase Storage

3. TESTES DE SEGURANÇA:
   - Criar `SecurityIntegrationTest.java`
   - Testar autenticação sem token (401)
   - Testar token inválido (401)
   - Testar token expirado (401)
   - Testar acesso admin com role user (403)
   - Testar rate limiting (429 após limite)
   - Testar email não verificado (403)

4. TESTES DE REPOSITORIES:
   - Criar testes para FirestorePointRepository
   - Criar testes para FirestoreSymptomRepository
   - Usar Firebase Emulator ou mocks

5. CONFIGURAÇÃO JACOCO:
   - Atualizar pom.xml com:
     <execution>
       <id>jacoco-check</id>
       <goals><goal>check</goal></goals>
       <configuration>
         <rules>
           <rule>
             <element>BUNDLE</element>
             <limits>
               <limit>
                 <counter>LINE</counter>
                 <value>COVEREDRATIO</value>
                 <minimum>0.60</minimum>
               </limit>
             </limits>
           </rule>
         </rules>
       </configuration>
     </execution>

6. PADRÕES A SEGUIR:
   - Usar padrão AAA (Arrange-Act-Assert)
   - Nomes descritivos: `whenCondition_thenExpectedBehavior`
   - @DisplayName com descrição clara
   - Use @BeforeEach para setup comum
   - Mock lenient() para mocks opcionais
   - Assertions claras com mensagens

7. EXECUTAR E VALIDAR:
   - mvn clean test
   - mvn verify (deve passar com cobertura >= 60%)
   - Verificar relatório em target/site/jacoco/index.html
   - CI deve passar com todos os testes

ARQUIVOS A CRIAR/MODIFICAR:
- src/test/java/com/appunture/backend/controller/*IntegrationTest.java (5 novos)
- src/test/java/com/appunture/backend/security/SecurityIntegrationTest.java (novo)
- src/test/java/com/appunture/backend/repository/*Test.java (2 novos)
- pom.xml (atualizar configuração JaCoCo)

RESULTADO ESPERADO:
- 60%+ cobertura
- 100+ testes passando
- Build falhando se cobertura < 60%
- Relatórios JaCoCo gerados
- Documentação de como rodar testes no README
```

---

### [TASK-002] Implementar Testes Frontend Completos

**Área:** Frontend Mobile  
**Estimativa:** 10 story points (2 semanas)  
**Status Atual:** 0% (nenhum teste implementado)  
**Prioridade:** 🔴 CRÍTICA  
**Dependências:** Nenhuma

#### Descrição
Implementar suite completa de testes para o frontend React Native, incluindo testes unitários de stores Zustand, testes de componentes com React Native Testing Library, e testes de integração da API.

#### Contexto
O frontend mobile não possui nenhum teste automatizado, criando alto risco de regressão a cada mudança. É necessário estabelecer infraestrutura de testes e atingir cobertura mínima de 50%.

#### Critérios de Aceitação
- [ ] Jest e React Native Testing Library configurados
- [ ] Cobertura mínima de 50% em stores
- [ ] Cobertura mínima de 40% em componentes
- [ ] Testes unitários para authStore (15+ testes)
- [ ] Testes unitários para pointsStore (15+ testes)
- [ ] Testes unitários para symptomsStore (10+ testes)
- [ ] Testes unitários para syncStore (10+ testes)
- [ ] Testes de componentes: Login (5+ testes)
- [ ] Testes de componentes: Search (5+ testes)
- [ ] Testes de componentes: PointDetails (5+ testes)
- [ ] Testes de integração da API (mock axios)
- [ ] CI configurado para rodar testes
- [ ] Relatórios de cobertura gerados

#### Arquivos Principais
- `frontend-mobile/appunture/__tests__/` (novo diretório)
- `frontend-mobile/appunture/jest.config.js` (novo)
- `frontend-mobile/appunture/package.json` (atualizar scripts)

#### Prompt Sugerido

```
Implemente suite completa de testes para o frontend React Native (Expo) do projeto Appunture.

CONTEXTO:
- Projeto: Appunture Mobile (React Native + Expo 53)
- Stack: TypeScript, Zustand, Axios, SQLite
- Status atual: 0 testes (CRÍTICO)
- Meta: 50% cobertura mínima

REQUISITOS:

1. CONFIGURAR INFRAESTRUTURA DE TESTES:
   - Instalar dependências:
     npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
     npm install --save-dev @types/jest jest-expo
   
   - Criar jest.config.js:
     module.exports = {
       preset: 'jest-expo',
       transformIgnorePatterns: [
         'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
       ],
       setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
       collectCoverageFrom: [
         'stores/**/*.{ts,tsx}',
         'services/**/*.{ts,tsx}',
         'app/**/*.{ts,tsx}',
         '!**/*.d.ts',
         '!**/node_modules/**'
       ],
       coverageThreshold: {
         global: {
           statements: 50,
           branches: 40,
           functions: 50,
           lines: 50
         }
       }
     };
   
   - Criar jest-setup.js:
     import '@testing-library/jest-native/extend-expect';
     jest.mock('expo-router');
     jest.mock('@react-native-community/netinfo');

2. TESTES DE STORES (ZUSTAND):
   
   a) __tests__/stores/authStore.test.ts:
      - Teste inicial state
      - Teste login success
      - Teste login failure
      - Teste logout
      - Teste setUser
      - Teste setLoading
      - Teste updateProfile
      - Teste token refresh
      - Teste persistence (AsyncStorage)
      - Teste sync com backend
      - Mock Firebase Authentication
   
   b) __tests__/stores/pointsStore.test.ts:
      - Teste fetchPoints
      - Teste fetchPointById
      - Teste searchPoints
      - Teste addToFavorites (online)
      - Teste addToFavorites (offline - queue)
      - Teste removeFromFavorites
      - Teste loadFavorites
      - Teste filters
      - Teste pagination
      - Mock API calls
   
   c) __tests__/stores/symptomsStore.test.ts:
      - Similar ao pointsStore
      - Mínimo 10 testes
   
   d) __tests__/stores/syncStore.test.ts:
      - Teste addToQueue
      - Teste processSyncQueue
      - Teste quando online/offline
      - Teste retry logic
      - Teste conflict resolution
      - Mock connectivity

3. TESTES DE COMPONENTES:
   
   a) __tests__/app/login.test.tsx:
      - Renderiza form corretamente
      - Valida email inválido
      - Valida senha curta
      - Submete form com dados válidos
      - Exibe erro de autenticação
      - Navega para register
   
   b) __tests__/app/(tabs)/search.test.tsx:
      - Renderiza search bar
      - Filtra pontos ao digitar
      - Exibe loading state
      - Exibe empty state
      - Navega para detalhes ao clicar
   
   c) __tests__/app/point-details.test.tsx:
      - Renderiza detalhes do ponto
      - Exibe imagens
      - Adiciona/remove favorito
      - Exibe sintomas relacionados
      - Exibe loading/error states

4. TESTES DE INTEGRAÇÃO DA API:
   - __tests__/services/api.test.ts
   - Mock axios responses
   - Teste getPoints, getSymptoms
   - Teste error handling
   - Teste retry logic
   - Teste authentication headers

5. MOCKS NECESSÁRIOS:
   - Mock Firebase: __mocks__/firebase.ts
   - Mock AsyncStorage: __mocks__/@react-native-async-storage/async-storage.ts
   - Mock expo-router: __mocks__/expo-router.ts
   - Mock NetInfo: __mocks__/@react-native-community/netinfo.ts

6. ATUALIZAR package.json:
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage",
     "test:ci": "jest --ci --coverage --maxWorkers=2"
   }

7. CONFIGURAR CI (.github/workflows/test-frontend.yml):
   - Rodar testes em pull requests
   - Gerar relatório de cobertura
   - Falhar se cobertura < 50%

8. EXECUTAR E VALIDAR:
   - npm test
   - npm run test:coverage
   - Verificar coverage/lcov-report/index.html
   - CI deve passar

ESTRUTURA DE DIRETÓRIOS:
frontend-mobile/appunture/
├── __tests__/
│   ├── stores/
│   │   ├── authStore.test.ts
│   │   ├── pointsStore.test.ts
│   │   ├── symptomsStore.test.ts
│   │   └── syncStore.test.ts
│   ├── app/
│   │   ├── login.test.tsx
│   │   ├── (tabs)/
│   │   │   └── search.test.tsx
│   │   └── point-details.test.tsx
│   └── services/
│       └── api.test.ts
├── __mocks__/
│   ├── firebase.ts
│   └── expo-router.ts
├── jest.config.js
├── jest-setup.js
└── package.json

RESULTADO ESPERADO:
- 50%+ cobertura
- 60+ testes passando
- Build falhando se cobertura < 50%
- Relatórios de cobertura gerados
- Documentação no README
```

---

### [TASK-003] Completar Sincronização Offline

**Área:** Frontend Mobile  
**Estimativa:** 6 story points (1 semana)  
**Status Atual:** 60% (apenas favoritos implementados)  
**Prioridade:** 🔴 ALTA  
**Dependências:** Nenhuma

#### Descrição
Estender a sincronização offline para todas as entidades (pontos, sintomas, notas, histórico de buscas), implementar resolução de conflitos, retry exponencial backoff, e adicionar indicadores visuais de sincronização na UI.

#### Contexto
Atualmente apenas favoritos são sincronizados offline. É necessário estender para todas as operações e adicionar feedback visual para o usuário.

#### Critérios de Aceitação
- [ ] Fila de operações estendida para pontos, sintomas, notas e histórico
- [ ] Sincronização automática ao voltar online
- [ ] Retry exponencial backoff (1s, 2s, 4s, 8s, 16s, max 60s)
- [ ] Resolução de conflitos (last-write-wins + timestamp)
- [ ] Indicador visual "Sincronizando..." na UI
- [ ] Badge com número de operações pendentes
- [ ] Tela de status de sincronização acessível
- [ ] Notificação quando sincronização completa
- [ ] Testes E2E simulando offline→online
- [ ] Documentação do fluxo de sync

#### Arquivos Principais
- `frontend-mobile/appunture/stores/syncStore.ts`
- `frontend-mobile/appunture/services/database.ts`
- `frontend-mobile/appunture/services/connectivity.ts`
- `frontend-mobile/appunture/app/(tabs)/_layout.tsx` (indicador visual)

#### Prompt Sugerido

```
Complete a implementação de sincronização offline para o app mobile React Native do Appunture.

CONTEXTO:
- Status: Apenas favoritos sincronizam offline (60%)
- Necessário: Estender para todas as entidades
- Stack: React Native + Expo, SQLite, Zustand

SITUAÇÃO ATUAL:
- syncStore.ts: Implementado para favoritos
- pointsStore.ts: Integrado com queue para favoritos
- Falta: Pontos, sintomas, notas, histórico de buscas

REQUISITOS:

1. ESTENDER FILA DE SINCRONIZAÇÃO:
   
   a) Atualizar services/database.ts:
      - Adicionar tabela sync_queue se não existir:
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          operation TEXT NOT NULL,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          retry_count INTEGER DEFAULT 0,
          last_error TEXT
        );
      
      - Funções genéricas:
        enqueueOperation(entityType, operation, data)
        getQueuedOperations()
        removeFromQueue(id)
        updateRetryCount(id, count, error)
   
   b) Entity types suportados:
      - 'point' (criar/atualizar ponto)
      - 'symptom' (criar/atualizar sintoma)
      - 'favorite' (add/remove - já existe)
      - 'note' (criar/atualizar/deletar nota pessoal)
      - 'search_history' (adicionar busca)

2. INTEGRAR COM STORES:
   
   a) pointsStore.ts:
      - createPoint: se offline, adicionar à fila
      - updatePoint: se offline, adicionar à fila
      - Persistir localmente no SQLite
      - Marcar como "pending sync" na UI
   
   b) symptomsStore.ts:
      - Similar ao pointsStore
   
   c) notesStore.ts (novo - se implementado):
      - CRUD de notas pessoais offline

3. RETRY EXPONENCIAL BACKOFF:
   
   Atualizar syncStore.ts:
   
   const MAX_RETRIES = 5;
   const BASE_DELAY = 1000; // 1 segundo
   const MAX_DELAY = 60000; // 60 segundos
   
   processSyncQueue: async () => {
     const queue = await databaseService.getQueuedOperations();
     
     for (const item of queue) {
       try {
         const delay = Math.min(
           BASE_DELAY * Math.pow(2, item.retry_count),
           MAX_DELAY
         );
         
         if (item.retry_count > 0) {
           await new Promise(resolve => setTimeout(resolve, delay));
         }
         
         await syncOperation(item);
         await databaseService.removeFromQueue(item.id);
         
       } catch (error) {
         if (item.retry_count < MAX_RETRIES) {
           await databaseService.updateRetryCount(
             item.id,
             item.retry_count + 1,
             error.message
           );
         } else {
           // Mover para dead letter queue ou notificar usuário
           set({ failedOperations: [...get().failedOperations, item] });
         }
       }
     }
   }

4. RESOLUÇÃO DE CONFLITOS:
   
   Estratégia: Last-Write-Wins com timestamps
   
   async function resolveConflict(localData, serverData) {
     if (!serverData) return localData; // Server não tem, usar local
     
     const localTime = new Date(localData.updatedAt).getTime();
     const serverTime = new Date(serverData.updatedAt).getTime();
     
     if (localTime > serverTime) {
       // Local mais recente, fazer PUT no servidor
       return await api.updatePoint(localData.id, localData);
     } else {
       // Server mais recente, atualizar local
       await databaseService.updatePoint(serverData);
       return serverData;
     }
   }

5. INDICADORES VISUAIS:
   
   a) Badge no Ícone de Perfil (app/(tabs)/_layout.tsx):
      - Mostrar número de operações pendentes
      - Ícone de "sincronizando" quando processando
      - Usar syncStore.pendingCount
   
   b) Banner de Sincronização (components/SyncBanner.tsx - novo):
      <View>
        {syncStore.isSyncing && (
          <View style={styles.banner}>
            <ActivityIndicator />
            <Text>Sincronizando {syncStore.pendingCount} itens...</Text>
          </View>
        )}
        {syncStore.failedOperations.length > 0 && (
          <TouchableOpacity onPress={() => router.push('/sync-status')}>
            <Text>⚠️ {syncStore.failedOperations.length} falhas</Text>
          </TouchableOpacity>
        )}
      </View>
   
   c) Tela de Status (app/sync-status.tsx - novo):
      - Listar operações pendentes
      - Listar operações falhadas
      - Botão "Tentar Novamente"
      - Botão "Limpar Fila"
      - Último sync bem-sucedido

6. MONITORAMENTO DE CONECTIVIDADE:
   
   Atualizar services/connectivity.ts:
   - Já existe, apenas garantir que trigga processSyncQueue
   - Adicionar listener no App.tsx:
     useEffect(() => {
       const unsubscribe = NetInfo.addEventListener(state => {
         if (state.isConnected) {
           syncStore.getState().processSyncQueue();
         }
       });
       return unsubscribe;
     }, []);

7. TESTES E2E:
   - Usar Detox ou Maestro
   - Cenário 1: Add favorito offline → voltar online → verificar sync
   - Cenário 2: Criar ponto offline → voltar online → verificar no servidor
   - Cenário 3: Conflito (editar no app e web) → resolver com last-write-wins

8. DOCUMENTAÇÃO:
   - Atualizar README com fluxo de sincronização
   - Diagramas de sequência (opcional)
   - Troubleshooting comum

ARQUIVOS A CRIAR/MODIFICAR:
- stores/syncStore.ts (expandir)
- services/database.ts (funções genéricas de queue)
- components/SyncBanner.tsx (novo)
- app/sync-status.tsx (novo)
- app/(tabs)/_layout.tsx (adicionar badge)
- App.tsx (listener de conectividade)

RESULTADO ESPERADO:
- Todas as entidades sincronizam offline
- Retry automático com backoff
- UI mostra status de sincronização
- Conflitos resolvidos automaticamente
- Testes E2E passando
```

---

### [TASK-004] Corrigir Configuração CORS ✅

**Área:** Backend  
**Estimativa:** 0.5 story points (1 hora)  
**Status Atual:** ✅ 100% CONCLUÍDO  
**Prioridade:** ✅ CONCLUÍDO  
**Dependências:** Nenhuma

#### Descrição
✅ **CONCLUÍDO** - Configuração CORS validada e documentada. A aplicação usa CORS restritivo por ambiente, permitindo apenas domínios conhecidos, sem uso de `allowedOrigins("*")` em produção.

#### Contexto
Configuração CORS permissiva pode levar a ataques CSRF e XSS. É crítico garantir que apenas domínios autorizados possam acessar a API.

#### Critérios de Aceitação
- [x] CORS configurado apenas para domínios conhecidos ✅
- [x] Nenhum `allowedOrigins("*")` em produção ✅
- [x] application-prod.yml com lista de domínios permitidos ✅
- [x] Testado com request de domínio não autorizado (deve bloquear) ✅
- [x] Documentação inline alertando sobre riscos ✅

#### Arquivos Principais
- `backend-java/src/main/java/com/appunture/backend/config/SecurityConfig.java`
- `backend-java/src/main/resources/application-prod.yml`

#### Prompt Sugerido

```
Valide e corrija (se necessário) a configuração CORS no backend Spring Boot do Appunture para garantir segurança em produção.

CONTEXTO:
- Backend: Spring Boot 3 + Firebase Auth
- Risco: CORS permissivo pode levar a CSRF/XSS
- Deve funcionar: Dev permite localhost, Prod apenas domínios conhecidos

REQUISITOS:

1. REVISAR SecurityConfig.java:
   
   Localizar método de configuração CORS (provavelmente em SecurityConfig):
   
   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
     CorsConfiguration configuration = new CorsConfiguration();
     
     // ❌ NUNCA USAR EM PRODUÇÃO:
     // configuration.addAllowedOrigin("*");
     
     // ✅ CORRETO: Lista específica por ambiente
     if (environment.acceptsProfiles(Profiles.of("dev"))) {
       configuration.setAllowedOrigins(Arrays.asList(
         "http://localhost:3000",
         "http://localhost:19006",
         "http://localhost:8081"
       ));
     } else {
       // Produção: domínios específicos
       configuration.setAllowedOrigins(Arrays.asList(
         "https://appunture.com",
         "https://app.appunture.com",
         "https://admin.appunture.com"
       ));
     }
     
     configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
     configuration.setAllowedHeaders(Arrays.asList("*"));
     configuration.setAllowCredentials(true);
     configuration.setMaxAge(3600L);
     
     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
     source.registerCorsConfiguration("/**", configuration);
     return source;
   }

2. ALTERNATIVA: USAR application.yml:
   
   Se preferir externalizar configuração, adicionar em application-prod.yml:
   
   app:
     cors:
       allowed-origins:
         - https://appunture.com
         - https://app.appunture.com
         - https://admin.appunture.com
   
   E em SecurityConfig:
   
   @Value("${app.cors.allowed-origins}")
   private List<String> allowedOrigins;
   
   configuration.setAllowedOrigins(allowedOrigins);

3. ADICIONAR DOCUMENTAÇÃO INLINE:
   
   No SecurityConfig.java, adicionar comentário de WARNING:
   
   /**
    * ⚠️ SEGURANÇA CRÍTICA - CORS CONFIGURATION
    * 
    * NUNCA usar allowedOrigins("*") em produção!
    * Isso permite qualquer site fazer requests à API, abrindo brecha para:
    * - CSRF (Cross-Site Request Forgery)
    * - XSS (Cross-Site Scripting)
    * - Data leakage
    * 
    * Sempre especificar domínios permitidos explicitamente.
    * Em produção, usar apenas HTTPS.
    */

4. VALIDAR EM application-dev.yml E application-prod.yml:
   
   Garantir que não há configurações conflitantes.

5. CRIAR TESTE DE INTEGRAÇÃO:
   
   Criar src/test/java/com/appunture/backend/security/CorsTest.java:
   
   @SpringBootTest
   @AutoConfigureMockMvc
   @ActiveProfiles("prod")
   class CorsTest {
     
     @Test
     void shouldAllowAuthorizedOrigin() throws Exception {
       mockMvc.perform(options("/api/points")
         .header("Origin", "https://appunture.com")
         .header("Access-Control-Request-Method", "GET"))
         .andExpect(status().isOk())
         .andExpect(header().string("Access-Control-Allow-Origin", "https://appunture.com"));
     }
     
     @Test
     void shouldBlockUnauthorizedOrigin() throws Exception {
       mockMvc.perform(options("/api/points")
         .header("Origin", "https://malicious-site.com")
         .header("Access-Control-Request-Method", "GET"))
         .andExpect(status().isForbidden());
     }
   }

6. TESTAR MANUALMENTE:
   
   # Dev (deve permitir localhost)
   curl -X OPTIONS http://localhost:8080/api/points \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -v
   
   # Prod (deve bloquear domínios não autorizados)
   curl -X OPTIONS https://api.appunture.com/api/points \
     -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: GET" \
     -v

7. DOCUMENTAR NO README:
   
   Adicionar seção sobre CORS:
   
   ## Segurança - CORS
   
   Em desenvolvimento, CORS permite localhost.
   Em produção, apenas domínios autorizados:
   - https://appunture.com
   - https://app.appunture.com
   
   Para adicionar novo domínio, editar application-prod.yml.

RESULTADO ESPERADO:
- CORS configurado por ambiente
- Testes de integração passando
- Bloqueio de domínios não autorizados
- Documentação clara sobre riscos
```

---

### [TASK-005] Logs Estruturados e Correlation ID ✅

**Área:** Backend  
**Estimativa:** 5 story points  
**Status Atual:** ✅ 100% CONCLUÍDO  
**Prioridade:** ✅ CONCLUÍDO  
**Dependências:** Nenhuma

#### Descrição
✅ **CONCLUÍDO** - Sistema completo de observabilidade implementado com logs estruturados JSON, Correlation ID para rastreamento distribuído, e métricas Prometheus expostas. Todos os testes passando (5/5, 100% cobertura no filter).

#### Contexto
Observabilidade é crítica para produção. Logs estruturados facilitam agregação e análise, Correlation ID permite rastreamento distribuído.

#### Critérios de Aceitação
- [x] Logs em formato JSON (produção) ✅
- [x] Correlation ID em todos os requests ✅
- [x] Métricas Prometheus expostas em `/actuator/prometheus` ✅
- [x] CorrelationIdFilter implementado e testado (100% cobertura) ✅
- [x] logback-spring.xml configurado (dev: legível, prod: JSON) ✅
- [ ] Dashboard Grafana criado (opcional)
- [ ] Documentação de como consultar logs
- [ ] Alertas configurados (CPU, memory, error rate)

#### Arquivos Principais
- `backend-java/src/main/java/com/appunture/backend/filter/CorrelationIdFilter.java`
- `backend-java/src/main/resources/logback-spring.xml`
- `backend-java/pom.xml` (dependências)

#### Prompt Sugerido

```
Valide e documente a implementação de observabilidade (logs estruturados, Correlation ID, métricas) no backend Spring Boot do Appunture.

CONTEXTO:
- Status: CorrelationIdFilter e logback-spring.xml já implementados
- Objetivo: Validar funcionamento e criar documentação completa

REQUISITOS:

1. VALIDAR CORRELATION ID:
   
   a) Testar manualmente:
      curl -X GET http://localhost:8080/api/points -H "X-Correlation-ID: test-123" -v
      
      # Verificar nos logs:
      grep "test-123" logs/spring-boot-logger.log
   
   b) Se não funcionar, revisar CorrelationIdFilter:
      - Deve adicionar UUID se não presente
      - Deve adicionar ao MDC (Mapped Diagnostic Context)
      - Deve adicionar ao response header

2. VALIDAR LOGS JSON:
   
   a) Rodar em profile prod:
      SPRING_PROFILES_ACTIVE=prod java -jar target/appunture-backend.jar
   
   b) Verificar formato JSON:
      tail -f logs/spring-boot-logger.log | jq
   
   c) Campos esperados:
      {
        "@timestamp": "2025-11-04T12:00:00.000Z",
        "level": "INFO",
        "logger_name": "com.appunture.backend",
        "message": "Processing request",
        "thread_name": "http-nio-8080-exec-1",
        "correlation_id": "uuid-here",
        "method": "GET",
        "uri": "/api/points"
      }

3. VALIDAR MÉTRICAS PROMETHEUS:
   
   a) Acessar:
      curl http://localhost:8080/actuator/prometheus
   
   b) Métricas esperadas:
      - http_server_requests_seconds_count
      - http_server_requests_seconds_sum
      - jvm_memory_used_bytes
      - system_cpu_usage
      - custom metrics (se houver)

4. CRIAR DASHBOARD GRAFANA (OPCIONAL):
   
   a) Docker compose com Grafana + Prometheus:
      
      # docker-compose.monitoring.yml
      services:
        prometheus:
          image: prom/prometheus:latest
          volumes:
            - ./prometheus.yml:/etc/prometheus/prometheus.yml
          ports:
            - "9090:9090"
        
        grafana:
          image: grafana/grafana:latest
          ports:
            - "3001:3000"
          environment:
            - GF_SECURITY_ADMIN_PASSWORD=admin
   
   b) prometheus.yml:
      global:
        scrape_interval: 15s
      
      scrape_configs:
        - job_name: 'appunture-backend'
          static_configs:
            - targets: ['host.docker.internal:8080']
          metrics_path: '/actuator/prometheus'
   
   c) Importar dashboard no Grafana:
      - Spring Boot 2.1 Statistics (ID: 10280)
      - JVM (Micrometer) (ID: 4701)
   
   d) Ou criar dashboard custom:
      - Request rate (req/s)
      - Response time (p50, p95, p99)
      - Error rate (%)
      - JVM memory usage
      - CPU usage

5. CONFIGURAR ALERTAS (GOOGLE CLOUD MONITORING):
   
   Se usando GCP, criar alertas:
   
   a) CPU > 80% por 5 minutos:
      gcloud alpha monitoring policies create \
        --notification-channels=CHANNEL_ID \
        --display-name="High CPU Usage" \
        --condition="CPU usage > 80%"
   
   b) Memory > 90% por 5 minutos
   
   c) Error rate > 5% por 1 minuto
   
   d) Response time p95 > 1s

6. DOCUMENTAR NO README:
   
   Adicionar seção "Observabilidade":
   
   ## Observabilidade
   
   ### Logs Estruturados
   
   Em produção, logs são gerados em formato JSON para facilitar agregação.
   
   **Localização:** `logs/spring-boot-logger.json`
   
   **Campos principais:**
   - `@timestamp`: Data/hora do log
   - `level`: INFO, WARN, ERROR
   - `correlation_id`: ID para rastreamento distribuído
   - `message`: Mensagem do log
   
   **Consultar logs:**
   ```bash
   # Filtrar por correlation ID
   cat logs/spring-boot-logger.json | jq 'select(.correlation_id == "abc-123")'
   
   # Filtrar erros
   cat logs/spring-boot-logger.json | jq 'select(.level == "ERROR")'
   ```
   
   ### Correlation ID
   
   Todas as requests têm um Correlation ID único para rastreamento.
   
   **Como usar:**
   - Frontend envia `X-Correlation-ID` header (opcional)
   - Backend gera UUID se não presente
   - ID aparece em todos os logs da request
   - ID retornado no response header
   
   **Exemplo:**
   ```bash
   curl -H "X-Correlation-ID: my-custom-id" http://localhost:8080/api/points
   ```
   
   ### Métricas Prometheus
   
   **Endpoint:** http://localhost:8080/actuator/prometheus
   
   **Principais métricas:**
   - `http_server_requests_seconds`: Tempo de resposta
   - `jvm_memory_used_bytes`: Uso de memória
   - `system_cpu_usage`: Uso de CPU
   
   **Dashboard Grafana:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   # Acessar: http://localhost:3001 (admin/admin)
   ```

7. EXECUTAR E VALIDAR:
   - Iniciar app em profile prod
   - Fazer requests e verificar logs JSON
   - Verificar Correlation ID nos logs
   - Acessar /actuator/prometheus
   - Importar dashboard Grafana (opcional)

RESULTADO ESPERADO:
- Logs JSON funcionando em prod
- Correlation ID em todos os requests
- Métricas Prometheus expostas
- Dashboard Grafana configurado (opcional)
- Documentação completa no README
```

---

### [TASK-006] Validação e Reenvio de Email

**Área:** Backend  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 70% (bloqueio implementado, falta reenvio)  
**Prioridade:** 🔴 ALTA  
**Dependências:** Nenhuma

#### Descrição
Implementar endpoint para reenvio de email de verificação, adicionar rate limiting específico (máx 3 reenvios/hora), e criar feedback no app mobile orientando usuário a verificar email.

#### Contexto
Validação de email já bloqueia login, mas usuário não consegue reenviar email de verificação se não receber. É necessário endpoint de reenvio com proteção contra abuso.

#### Critérios de Aceitação
- [ ] Endpoint `POST /auth/resend-verification` implementado
- [ ] Rate limiting: máximo 3 reenvios por hora por usuário
- [ ] Retorna 429 se exceder limite
- [ ] Tratamento de erros do Firebase
- [ ] Documentado no Swagger
- [ ] Testes unitários (sucesso, rate limit, erro Firebase)
- [ ] Frontend mobile com botão "Reenviar email"
- [ ] Toast/modal orientando usuário a verificar email

#### Arquivos Principais
- `backend-java/src/main/java/com/appunture/backend/controller/FirestoreAuthController.java`
- `backend-java/src/main/java/com/appunture/backend/service/FirebaseAuthService.java` (criar se necessário)
- `frontend-mobile/appunture/app/login.tsx`

#### Prompt Sugerido

```
Implemente endpoint de reenvio de email de verificação com rate limiting no backend Spring Boot do Appunture, e integre com frontend React Native.

CONTEXTO:
- Firebase Authentication já configurado
- FirebaseAuthenticationFilter bloqueia emails não verificados
- Falta: Endpoint para reenviar email de verificação

REQUISITOS BACKEND:

1. CRIAR SERVIÇO DE REENVIO:
   
   Criar (ou atualizar) FirebaseAuthService.java:
   
   @Service
   public class FirebaseAuthService {
     
     private final FirebaseAuth firebaseAuth;
     private final Map<String, RateLimiter> verificationLimiters = new ConcurrentHashMap<>();
     
     public void resendVerificationEmail(String uid) throws FirebaseAuthException {
       // Rate limiting: 3 reenvios/hora
       RateLimiter limiter = verificationLimiters.computeIfAbsent(
         uid,
         k -> RateLimiter.create(3.0 / 3600.0) // 3 permits por hora
       );
       
       if (!limiter.tryAcquire()) {
         throw new RateLimitExceededException(
           "Limite de reenvios atingido. Tente novamente em 1 hora."
         );
       }
       
       UserRecord user = firebaseAuth.getUser(uid);
       
       if (user.isEmailVerified()) {
         throw new IllegalStateException("Email já verificado");
       }
       
       // Firebase Admin SDK não tem método direto para reenviar
       // Alternativa: Usar Firebase REST API
       String actionLink = firebaseAuth.generateEmailVerificationLink(user.getEmail());
       
       // Enviar email via serviço de email (SendGrid, Firebase Email Extension, etc)
       emailService.sendVerificationEmail(user.getEmail(), actionLink);
       
       log.info("Verification email resent to {}", user.getEmail());
     }
   }

2. CRIAR ENDPOINT NO CONTROLLER:
   
   Em FirestoreAuthController.java:
   
   @PostMapping("/resend-verification")
   @Operation(summary = "Reenviar email de verificação")
   @ApiResponses({
     @ApiResponse(responseCode = "200", description = "Email reenviado com sucesso"),
     @ApiResponse(responseCode = "429", description = "Limite de reenvios atingido"),
     @ApiResponse(responseCode = "400", description = "Email já verificado"),
     @ApiResponse(responseCode = "401", description = "Não autenticado")
   })
   public ResponseEntity<MessageResponse> resendVerificationEmail(
     @AuthenticationPrincipal FirebaseToken token
   ) {
     try {
       String uid = token.getUid();
       firebaseAuthService.resendVerificationEmail(uid);
       
       return ResponseEntity.ok(new MessageResponse(
         "Email de verificação reenviado. Verifique sua caixa de entrada."
       ));
       
     } catch (RateLimitExceededException e) {
       return ResponseEntity.status(429).body(new MessageResponse(e.getMessage()));
       
     } catch (IllegalStateException e) {
       return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
       
     } catch (Exception e) {
       log.error("Error resending verification email", e);
       return ResponseEntity.status(500).body(new MessageResponse(
         "Erro ao reenviar email. Tente novamente mais tarde."
       ));
     }
   }

3. CRIAR EXCEÇÃO CUSTOMIZADA:
   
   public class RateLimitExceededException extends RuntimeException {
     public RateLimitExceededException(String message) {
       super(message);
     }
   }

4. CONFIGURAR ENVIO DE EMAIL:
   
   Opções:
   
   a) Firebase Email Extension (recomendado):
      - Instalar extension no Firebase Console
      - Configurar template de verificação
   
   b) SendGrid:
      - Adicionar dependência sendgrid-java
      - Configurar API key
   
   c) SMTP (Gmail, AWS SES):
      - Usar Spring Boot Mail

5. CRIAR TESTES:
   
   @SpringBootTest
   class FirebaseAuthServiceTest {
     
     @Test
     void resendVerificationEmail_Success() {
       // Arrange
       String uid = "test-uid";
       // Mock FirebaseAuth
       
       // Act
       service.resendVerificationEmail(uid);
       
       // Assert
       verify(emailService).sendVerificationEmail(any(), any());
     }
     
     @Test
     void resendVerificationEmail_RateLimitExceeded() {
       // Arrange: Send 3 times
       for (int i = 0; i < 3; i++) {
         service.resendVerificationEmail("test-uid");
       }
       
       // Act & Assert: 4th time should throw
       assertThrows(RateLimitExceededException.class, () -> {
         service.resendVerificationEmail("test-uid");
       });
     }
     
     @Test
     void resendVerificationEmail_AlreadyVerified() {
       // Arrange: User with verified email
       when(firebaseAuth.getUser(any())).thenReturn(verifiedUser);
       
       // Act & Assert
       assertThrows(IllegalStateException.class, () -> {
         service.resendVerificationEmail("test-uid");
       });
     }
   }

REQUISITOS FRONTEND:

1. DETECTAR EMAIL NÃO VERIFICADO:
   
   Em app/login.tsx:
   
   const handleLogin = async () => {
     try {
       await authStore.login(email, password);
       router.replace('/(tabs)');
       
     } catch (error) {
       if (error.response?.status === 403) {
         const message = error.response?.data?.message;
         
         if (message?.includes('email not verified')) {
           // Mostrar modal de verificação
           setShowVerificationModal(true);
         } else {
           Alert.alert('Erro', message);
         }
       } else {
         Alert.alert('Erro', 'Falha ao fazer login');
       }
     }
   };

2. CRIAR MODAL DE VERIFICAÇÃO:
   
   const [showVerificationModal, setShowVerificationModal] = useState(false);
   const [resendingEmail, setResendingEmail] = useState(false);
   
   const handleResendEmail = async () => {
     try {
       setResendingEmail(true);
       await api.resendVerificationEmail();
       
       Alert.alert(
         'Email Enviado',
         'Verifique sua caixa de entrada e clique no link de verificação.'
       );
       
     } catch (error) {
       if (error.response?.status === 429) {
         Alert.alert('Limite Atingido', error.response.data.message);
       } else {
         Alert.alert('Erro', 'Falha ao reenviar email');
       }
     } finally {
       setResendingEmail(false);
     }
   };
   
   return (
     <Modal visible={showVerificationModal}>
       <View style={styles.modal}>
         <Ionicons name="mail-outline" size={64} color={COLORS.primary} />
         
         <Text style={styles.title}>Verifique seu Email</Text>
         
         <Text style={styles.message}>
           Enviamos um link de verificação para {email}.
           Clique no link para ativar sua conta.
         </Text>
         
         <Button
           title={resendingEmail ? "Enviando..." : "Reenviar Email"}
           onPress={handleResendEmail}
           disabled={resendingEmail}
         />
         
         <Button
           title="Fechar"
           onPress={() => setShowVerificationModal(false)}
         />
       </View>
     </Modal>
   );

3. ADICIONAR MÉTODO NO API SERVICE:
   
   Em services/api.ts:
   
   async resendVerificationEmail() {
     const response = await this.client.post('/auth/resend-verification');
     return response.data;
   }

RESULTADO ESPERADO:
- Backend: Endpoint funcionando com rate limiting
- Frontend: Modal orientando usuário
- Botão "Reenviar Email" funcional
- Testes passando
- Documentação no Swagger
```

---

### [TASK-007] Rate Limiting Completo ✅

**Área:** Backend  
**Estimativa:** 3 story points  
**Status Atual:** ✅ 100% CONCLUÍDO  
**Prioridade:** ✅ CONCLUÍDO  
**Dependências:** Nenhuma

#### Descrição
✅ **CONCLUÍDO** - RateLimitingFilter com Bucket4j implementado e configurável por ambiente (dev: 200/min, prod: 120/min). Suporta estratégias PER_IP, PER_USER e AUTO. Testes unitários implementados (9/9, 89% cobertura). Headers de resposta incluem X-RateLimit-Limit, X-RateLimit-Remaining e Retry-After.

#### Contexto
RateLimitingFilter com Bucket4j implementado e funcionando. Configurável via SecurityProperties com diferentes limites por ambiente.

#### Critérios de Aceitação
- [x] `RateLimitingFilter` com Bucket4j registrado ✅
- [x] Limites configuráveis por ambiente ✅
- [x] Testes unitários implementados (9 testes, 89% cobertura) ✅
- [x] Headers de rate limit no response ✅
- [ ] Métricas de rate limiting expostas
- [ ] Dashboard mostrando requests bloqueados
- [ ] Testes de carga documentados
- [ ] Testes de abuso documentados

#### Arquivos Principais
- `backend-java/src/main/java/com/appunture/backend/security/RateLimitingFilter.java`
- `backend-java/src/main/java/com/appunture/backend/config/SecurityProperties.java`

#### Prompt Sugerido

```
Valide e adicione observabilidade ao rate limiting implementado no backend Spring Boot do Appunture.

CONTEXTO:
- RateLimitingFilter com Bucket4j já implementado
- Configurável por ambiente (dev: 200/min, prod: 120/min)
- Falta: Métricas, monitoramento, testes de carga

REQUISITOS:

1. EXPOR MÉTRICAS DE RATE LIMITING:
   
   Atualizar RateLimitingFilter.java para registrar métricas:
   
   @Component
   public class RateLimitingFilter extends OncePerRequestFilter {
     
     private final MeterRegistry meterRegistry;
     private final Counter blockedRequests;
     private final Counter allowedRequests;
     
     public RateLimitingFilter(MeterRegistry meterRegistry, SecurityProperties props) {
       this.meterRegistry = meterRegistry;
       this.blockedRequests = Counter.builder("rate_limit_blocked_requests")
         .description("Number of requests blocked by rate limiter")
         .tag("strategy", props.getRateLimit().getStrategy().toString())
         .register(meterRegistry);
       
       this.allowedRequests = Counter.builder("rate_limit_allowed_requests")
         .description("Number of requests allowed by rate limiter")
         .register(meterRegistry);
     }
     
     @Override
     protected void doFilterInternal(...) {
       ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
       
       if (probe.isConsumed()) {
         allowedRequests.increment();
         
         // Adicionar headers de rate limit
         response.addHeader("X-RateLimit-Limit", String.valueOf(limit));
         response.addHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
         
         chain.doFilter(request, response);
       } else {
         blockedRequests.increment();
         
         long waitTime = probe.getNanosToWaitForRefill() / 1_000_000_000;
         response.addHeader("Retry-After", String.valueOf(waitTime));
         response.setStatus(429);
         response.getWriter().write(
           "{\"error\":\"Rate limit exceeded. Try again in " + waitTime + " seconds.\"}"
         );
       }
     }
   }

2. CRIAR DASHBOARD NO GRAFANA:
   
   Adicionar painel com:
   
   a) Requests Bloqueados:
      sum(rate(rate_limit_blocked_requests_total[1m]))
   
   b) Requests Permitidos:
      sum(rate(rate_limit_allowed_requests_total[1m]))
   
   c) Taxa de Bloqueio (%):
      (sum(rate(rate_limit_blocked_requests_total[1m])) / 
       sum(rate(rate_limit_allowed_requests_total[1m]))) * 100
   
   d) Top IPs Bloqueados (se PER_IP):
      topk(10, sum by (ip) (rate(rate_limit_blocked_requests_total[5m])))

3. CRIAR TESTES DE CARGA:
   
   Usar Apache Bench ou K6 para testar:
   
   a) Teste básico (Apache Bench):
      # 1000 requests, 10 concorrentes
      ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
         http://localhost:8080/api/points
      
      # Espera-se: ~120 requests/min permitidos, resto bloqueado (429)
   
   b) Teste com K6 (recomendado):
      
      # load-test.js
      import http from 'k6/http';
      import { check, sleep } from 'k6';
      
      export let options = {
        vus: 10, // 10 usuários virtuais
        duration: '30s',
      };
      
      export default function () {
        const res = http.get('http://localhost:8080/api/points', {
          headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
        });
        
        check(res, {
          'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
          'has rate limit headers': (r) => r.headers['X-Ratelimit-Limit'] !== undefined,
        });
        
        if (res.status === 429) {
          const retryAfter = parseInt(res.headers['Retry-After'] || '1');
          sleep(retryAfter);
        }
      }
      
      # Executar:
      k6 run load-test.js

4. CRIAR TESTES DE ABUSO:
   
   Simular ataque de força bruta:
   
   # abuse-test.sh
   #!/bin/bash
   
   echo "Testing rate limiter abuse protection..."
   
   # Fazer 200 requests rápidas (excede limite de 120/min)
   for i in {1..200}; do
     curl -s -o /dev/null -w "%{http_code}\n" \
       -H "Authorization: Bearer $TOKEN" \
       http://localhost:8080/api/points &
   done
   
   wait
   
   echo "Check logs for blocked requests (status 429)"

5. ADICIONAR ALERTAS:
   
   Configurar alerta no Google Cloud Monitoring:
   
   a) Taxa de Bloqueio > 50% por 5 minutos:
      - Pode indicar ataque DDoS
      - Pode indicar limite muito restritivo
   
   b) IP específico bloqueado > 100 vezes/minuto:
      - Possível bot malicioso
      - Banir IP no firewall

6. DOCUMENTAR NO README:
   
   ## Rate Limiting
   
   A API possui rate limiting para proteger contra abuso.
   
   ### Limites
   
   - **Desenvolvimento:** 200 requests/minuto por IP
   - **Produção:** 120 requests/minuto por usuário autenticado
   
   ### Headers de Resposta
   
   - `X-RateLimit-Limit`: Limite total
   - `X-RateLimit-Remaining`: Requests restantes
   - `Retry-After`: Segundos até próxima tentativa (se 429)
   
   ### Testando Rate Limiting
   
   ```bash
   # Instalar K6
   brew install k6  # macOS
   
   # Rodar teste de carga
   k6 run tests/load-test.js
   ```
   
   ### Métricas
   
   - `rate_limit_blocked_requests_total`: Requests bloqueados
   - `rate_limit_allowed_requests_total`: Requests permitidos
   
   Acesse: http://localhost:8080/actuator/prometheus

7. VALIDAR FUNCIONAMENTO:
   
   a) Testar manualmente:
      # Request 1-120: deve retornar 200
      for i in {1..120}; do
        curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/points
      done
      
      # Request 121+: deve retornar 429
      curl -v -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/points
   
   b) Verificar métricas:
      curl http://localhost:8080/actuator/prometheus | grep rate_limit

RESULTADO ESPERADO:
- Métricas de rate limiting expostas
- Dashboard Grafana mostrando bloqueios
- Testes de carga documentados e funcionais
- Alertas configurados
- Documentação completa no README
```


---

## 🟡 SPRINT 2 - Prioridade MÉDIA

---

### [TASK-008] Galeria de Imagens Múltiplas ✅

**Área:** Frontend Mobile  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** ✅ 100% CONCLUÍDO  
**Prioridade:** ✅ CONCLUÍDO  
**Dependências:** Backend `/api/storage/upload` ✅
**Commit:** `49f94a4` - feat: add image gallery component with upload and delete functionality

#### Descrição
✅ **CONCLUÍDO** - Componente ImageGallery completamente implementado com carousel, visualizador full-screen, upload de imagens (câmera e galeria), delete, reordenação, indicadores de loading e testes. Integrado com Firebase Storage e ponto-details screen.

#### Contexto
Backend suporta array de `imageUrls[]`, e agora o frontend possui componente completo de galeria para UX profissional.

#### Critérios de Aceitação
- [x] Exibe múltiplas imagens em carousel/grid ✅
- [x] Visualizador full-screen com zoom/pinch ✅
- [x] Seletor de imagem (câmera e galeria) funciona ✅
- [x] Upload para Firebase Storage com progress bar ✅
- [x] Suporta PNG, JPG, WEBP ✅
- [x] Delete de imagem (Admin) ✅
- [x] Reordenação de imagens (Admin) ✅
- [x] Compressão de imagem antes do upload ✅
- [x] Testes do componente ✅
- [x] Integrado com point-details screen ✅
- [x] API service refatorado para uploads e deleções ✅

#### Arquivos Principais
- `frontend-mobile/appunture/components/ImageGallery.tsx` (novo)
- `frontend-mobile/appunture/services/storage.ts` (novo)
- `frontend-mobile/appunture/app/point-details.tsx`

#### Prompt Sugerido

```
Implemente galeria completa de imagens múltiplas para pontos de acupuntura no app React Native do Appunture.

CONTEXTO:
- Backend: Suporta imageUrls[] e upload em /api/storage/upload
- Frontend: Mostra apenas uma imagem
- Necessário: Galeria completa com upload

REQUISITOS:

1. INSTALAR DEPENDÊNCIAS:
   npm install expo-image-picker expo-image-manipulator
   npm install react-native-reanimated-carousel

2. CRIAR SERVIÇO DE STORAGE:
   
   services/storage.ts:
   
   import * as ImagePicker from 'expo-image-picker';
   import * as ImageManipulator from 'expo-image-manipulator';
   import api from './api';
   
   export const storageService = {
     
     async pickImage(allowsMultiple = false) {
       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
       
       if (status !== 'granted') {
         throw new Error('Permissão negada');
       }
       
       const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsMultipleSelection: allowsMultiple,
         quality: 0.8,
       });
       
       if (!result.canceled) {
         return result.assets;
       }
       return [];
     },
     
     async takePicture() {
       const { status } = await ImagePicker.requestCameraPermissionsAsync();
       
       if (status !== 'granted') {
         throw new Error('Permissão de câmera negada');
       }
       
       const result = await ImagePicker.launchCameraAsync({
         quality: 0.8,
       });
       
       if (!result.canceled) {
         return result.assets[0];
       }
       return null;
     },
     
     async compressImage(uri: string, maxWidth = 1200, maxHeight = 1200) {
       const manipResult = await ImageManipulator.manipulateAsync(
         uri,
         [{ resize: { width: maxWidth, height: maxHeight } }],
         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
       );
       
       return manipResult.uri;
     },
     
     async uploadImage(
       uri: string,
       onProgress?: (progress: number) => void
     ): Promise<string> {
       // Comprimir antes de enviar
       const compressedUri = await this.compressImage(uri);
       
       // Converter para blob/FormData
       const response = await fetch(compressedUri);
       const blob = await response.blob();
       
       const formData = new FormData();
       formData.append('file', blob, 'image.jpg');
       
       // Upload com progress tracking
       const uploadResponse = await api.client.post('/api/storage/upload', formData, {
         headers: {
           'Content-Type': 'multipart/form-data',
         },
         onUploadProgress: (progressEvent) => {
           const percentCompleted = Math.round(
             (progressEvent.loaded * 100) / progressEvent.total
           );
           onProgress?.(percentCompleted);
         },
       });
       
       return uploadResponse.data.url; // URL da imagem no Firebase Storage
     },
     
     async uploadMultipleImages(
       uris: string[],
       onProgress?: (index: number, progress: number) => void
     ): Promise<string[]> {
       const urls: string[] = [];
       
       for (let i = 0; i < uris.length; i++) {
         const url = await this.uploadImage(uris[i], (progress) => {
           onProgress?.(i, progress);
         });
         urls.push(url);
       }
       
       return urls;
     },
   };

3. CRIAR COMPONENTE ImageGallery:
   
   components/ImageGallery.tsx:
   
   import { View, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
   import { Ionicons } from '@expo/vector-icons';
   import Carousel from 'react-native-reanimated-carousel';
   import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
   import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
   
   interface ImageGalleryProps {
     images: string[];
     editable?: boolean;
     onAddImage?: () => void;
     onDeleteImage?: (index: number) => void;
     onReorder?: (fromIndex: number, toIndex: number) => void;
   }
   
   export function ImageGallery({ images, editable, onAddImage, onDeleteImage }: ImageGalleryProps) {
     const [currentIndex, setCurrentIndex] = useState(0);
     const [fullscreenVisible, setFullscreenVisible] = useState(false);
     const scale = useSharedValue(1);
     
     const { width, height } = Dimensions.get('window');
     
     if (images.length === 0) {
       return (
         <View style={styles.emptyContainer}>
           <Ionicons name="image-outline" size={64} color="#ccc" />
           <Text>Nenhuma imagem disponível</Text>
           {editable && (
             <Button title="Adicionar Imagem" onPress={onAddImage} />
           )}
         </View>
       );
     }
     
     return (
       <View style={styles.container}>
         {/* Carousel */}
         <Carousel
           width={width}
           height={300}
           data={images}
           onSnapToItem={setCurrentIndex}
           renderItem={({ item, index }) => (
             <TouchableOpacity
               onPress={() => setFullscreenVisible(true)}
               style={styles.imageContainer}
             >
               <Image
                 source={{ uri: item }}
                 style={styles.image}
                 resizeMode="cover"
               />
               
               {editable && (
                 <TouchableOpacity
                   style={styles.deleteButton}
                   onPress={() => onDeleteImage?.(index)}
                 >
                   <Ionicons name="trash-outline" size={24} color="white" />
                 </TouchableOpacity>
               )}
             </TouchableOpacity>
           )}
         />
         
         {/* Indicadores */}
         <View style={styles.indicators}>
           {images.map((_, index) => (
             <View
               key={index}
               style={[
                 styles.indicator,
                 index === currentIndex && styles.indicatorActive
               ]}
             />
           ))}
         </View>
         
         {/* Botão Adicionar (Admin) */}
         {editable && (
           <TouchableOpacity style={styles.addButton} onPress={onAddImage}>
             <Ionicons name="add-circle" size={48} color={COLORS.primary} />
           </TouchableOpacity>
         )}
         
         {/* Modal Fullscreen */}
         <Modal
           visible={fullscreenVisible}
           transparent={true}
           animationType="fade"
           onRequestClose={() => setFullscreenVisible(false)}
         >
           <View style={styles.fullscreenContainer}>
             <TouchableOpacity
               style={styles.closeButton}
               onPress={() => setFullscreenVisible(false)}
             >
               <Ionicons name="close" size={32} color="white" />
             </TouchableOpacity>
             
             {/* Zoom com Pinch Gesture */}
             <PinchGestureHandler
               onGestureEvent={(event) => {
                 scale.value = event.nativeEvent.scale;
               }}
             >
               <Animated.Image
                 source={{ uri: images[currentIndex] }}
                 style={[
                   styles.fullscreenImage,
                   useAnimatedStyle(() => ({
                     transform: [{ scale: scale.value }]
                   }))
                 ]}
                 resizeMode="contain"
               />
             </PinchGestureHandler>
           </View>
         </Modal>
       </View>
     );
   }

4. INTEGRAR NO POINT DETAILS:
   
   app/point-details.tsx:
   
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<{[key: number]: number}>({});
   
   const handleAddImages = async () => {
     try {
       const assets = await storageService.pickImage(true); // Múltiplas
       
       if (assets.length === 0) return;
       
       setUploading(true);
       
       const urls = await storageService.uploadMultipleImages(
         assets.map(a => a.uri),
         (index, progress) => {
           setUploadProgress(prev => ({ ...prev, [index]: progress }));
         }
       );
       
       // Adicionar URLs ao ponto
       await api.addImagesToPoint(pointId, urls);
       
       // Recarregar ponto
       await pointsStore.fetchPointById(pointId);
       
       Alert.alert('Sucesso', 'Imagens adicionadas!');
       
     } catch (error) {
       Alert.alert('Erro', 'Falha ao adicionar imagens');
     } finally {
       setUploading(false);
       setUploadProgress({});
     }
   };
   
   const handleDeleteImage = async (index: number) => {
     Alert.alert(
       'Confirmar',
       'Deseja deletar esta imagem?',
       [
         { text: 'Cancelar', style: 'cancel' },
         {
           text: 'Deletar',
           style: 'destructive',
           onPress: async () => {
             try {
               const imageUrl = point.imageUrls[index];
               await api.deleteImage(imageUrl);
               
               // Recarregar ponto
               await pointsStore.fetchPointById(pointId);
               
               Toast.show({ type: 'success', text1: 'Imagem deletada' });
             } catch (error) {
               Alert.alert('Erro', 'Falha ao deletar imagem');
             }
           }
         }
       ]
     );
   };
   
   return (
     <ScrollView>
       <ImageGallery
         images={point.imageUrls}
         editable={user.role === 'ADMIN'}
         onAddImage={handleAddImages}
         onDeleteImage={handleDeleteImage}
       />
       
       {/* Upload Progress */}
       {uploading && (
         <View style={styles.uploadProgress}>
           <ActivityIndicator />
           <Text>Enviando imagens...</Text>
           {Object.entries(uploadProgress).map(([index, progress]) => (
             <Text key={index}>Imagem {parseInt(index) + 1}: {progress}%</Text>
           ))}
         </View>
       )}
       
       {/* Resto dos detalhes */}
     </ScrollView>
   );

5. ADICIONAR MÉTODOS NA API:
   
   services/api.ts:
   
   async addImagesToPoint(pointId: string, imageUrls: string[]) {
     const response = await this.client.post(`/points/${pointId}/images`, {
       imageUrls
     });
     return response.data;
   }
   
   async deleteImage(imageUrl: string) {
     const fileName = imageUrl.split('/').pop();
     await this.client.delete(`/api/storage/${fileName}`);
   }

6. CRIAR TESTES:
   
   __tests__/components/ImageGallery.test.tsx:
   
   describe('ImageGallery', () => {
     it('renders images correctly', () => {
       const { getByTestId } = render(
         <ImageGallery images={['url1', 'url2', 'url3']} />
       );
       expect(getByTestId('carousel')).toBeTruthy();
     });
     
     it('shows add button when editable', () => {
       const { getByText } = render(
         <ImageGallery images={[]} editable onAddImage={jest.fn()} />
       );
       expect(getByText('Adicionar Imagem')).toBeTruthy();
     });
     
     it('calls onDeleteImage when delete button pressed', () => {
       const onDelete = jest.fn();
       const { getByTestId } = render(
         <ImageGallery
           images={['url1']}
           editable
           onDeleteImage={onDelete}
         />
       );
       fireEvent.press(getByTestId('delete-button-0'));
       expect(onDelete).toHaveBeenCalledWith(0);
     });
   });

RESULTADO ESPERADO:
- Galeria funcional com múltiplas imagens
- Upload com progress bar
- Fullscreen com zoom
- Admin pode adicionar/deletar imagens
- Testes passando
```

---

### [TASK-009] Mapa Corporal Interativo

**Área:** Frontend Mobile  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 25% (componente existe, não integrado)  
**Prioridade:** 🟡 MÉDIA-ALTA  
**Dependências:** Backend `PUT /points/{id}/coordinates` ✅

#### Descrição
Integrar o componente de mapa corporal com coordenadas do backend, renderizar pontos de acupuntura nas posições corretas usando SVG, tornar pontos clicáveis com navegação para detalhes, implementar filtros por meridiano, e adicionar zoom/pan.

#### Contexto
Componente `BodyMap` existe mas não está integrado com dados reais. É necessário carregar coordenadas do backend e renderizar pontos interativos.

#### Critérios de Aceitação
- [ ] Carrega coordenadas do backend
- [ ] Renderiza pontos nas posições corretas (SVG)
- [ ] Pontos são clicáveis (navegação para detalhes)
- [ ] Filtros por meridiano funcionam
- [ ] Zoom e pan implementados
- [ ] Legenda de meridianos
- [ ] Loading state durante carregamento
- [ ] Testes do componente

#### Arquivos Principais
- `frontend-mobile/appunture/app/body-map.tsx`
- `frontend-mobile/appunture/components/BodyMapSVG.tsx` (novo)
- `frontend-mobile/appunture/stores/pointsStore.ts`

#### Prompt Sugerido

```
Implemente mapa corporal interativo de pontos de acupuntura no app React Native do Appunture.

CONTEXTO:
- Backend: Pontos têm coordenadas (x, y) em formato relativo (0-100%)
- Frontend: Componente BodyMap existe mas não integrado
- Necessário: Renderizar pontos em SVG com interatividade

REQUISITOS:

1. INSTALAR DEPENDÊNCIAS:
   npm install react-native-svg
   npm install react-native-gesture-handler react-native-reanimated

2. CRIAR COMPONENTE SVG DO CORPO:
   
   components/BodyMapSVG.tsx:
   
   import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
   import { Dimensions } from 'react-native';
   
   interface Point {
     id: string;
     code: string;
     name: string;
     coordinates: { x: number; y: number };
     meridian: string;
   }
   
   interface BodyMapSVGProps {
     points: Point[];
     onPointPress: (pointId: string) => void;
     selectedMeridian?: string;
   }
   
   const MERIDIAN_COLORS = {
     'Vaso Governador': '#FF6B6B',
     'Vaso Conceção': '#4ECDC4',
     'Pulmão': '#45B7D1',
     'Intestino Grosso': '#FFA07A',
     'Estômago': '#98D8C8',
     'Baço-Pâncreas': '#F7DC6F',
     'Coração': '#E74C3C',
     'Intestino Delgado': '#3498DB',
     'Bexiga': '#9B59B6',
     'Rim': '#1ABC9C',
     'Pericárdio': '#E67E22',
     'Triplo Aquecedor': '#95A5A6'
   };
   
   export function BodyMapSVG({ points, onPointPress, selectedMeridian }: BodyMapSVGProps) {
     const { width, height } = Dimensions.get('window');
     const viewBox = `0 0 ${width} ${height}`;
     
     // Filtrar pontos por meridiano (se selecionado)
     const filteredPoints = selectedMeridian
       ? points.filter(p => p.meridian === selectedMeridian)
       : points;
     
     return (
       <Svg width={width} height={height} viewBox={viewBox}>
         {/* Desenhar corpo humano (outline básico) */}
         <G>
           {/* Cabeça */}
           <Circle
             cx={width / 2}
             cy={100}
             r={60}
             fill="none"
             stroke="#ccc"
             strokeWidth={2}
           />
           
           {/* Tronco */}
           <Path
             d={`M ${width / 2 - 50} 160 
                 L ${width / 2 - 60} 400 
                 L ${width / 2 + 60} 400 
                 L ${width / 2 + 50} 160 Z`}
             fill="none"
             stroke="#ccc"
             strokeWidth={2}
           />
           
           {/* Braços */}
           <Path
             d={`M ${width / 2 - 50} 200 L ${width / 2 - 150} 350`}
             stroke="#ccc"
             strokeWidth={2}
           />
           <Path
             d={`M ${width / 2 + 50} 200 L ${width / 2 + 150} 350`}
             stroke="#ccc"
             strokeWidth={2}
           />
           
           {/* Pernas */}
           <Path
             d={`M ${width / 2 - 40} 400 L ${width / 2 - 50} 650`}
             stroke="#ccc"
             strokeWidth={2}
           />
           <Path
             d={`M ${width / 2 + 40} 400 L ${width / 2 + 50} 650`}
             stroke="#ccc"
             strokeWidth={2}
           />
         </G>
         
         {/* Renderizar pontos de acupuntura */}
         {filteredPoints.map((point) => {
           const x = (point.coordinates.x / 100) * width;
           const y = (point.coordinates.y / 100) * height;
           const color = MERIDIAN_COLORS[point.meridian] || '#000';
           
           return (
             <G key={point.id}>
               {/* Círculo do ponto */}
               <Circle
                 cx={x}
                 cy={y}
                 r={8}
                 fill={color}
                 stroke="white"
                 strokeWidth={2}
                 onPress={() => onPointPress(point.id)}
               />
               
               {/* Label do código */}
               <SvgText
                 x={x}
                 y={y - 12}
                 fontSize={10}
                 fill="#333"
                 textAnchor="middle"
               >
                 {point.code}
               </SvgText>
             </G>
           );
         })}
       </Svg>
     );
   }

3. IMPLEMENTAR ZOOM E PAN:
   
   app/body-map.tsx:
   
   import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
   import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler } from 'react-native-reanimated';
   
   export default function BodyMapScreen() {
     const [points, setPoints] = useState<Point[]>([]);
     const [selectedMeridian, setSelectedMeridian] = useState<string>();
     const [loading, setLoading] = useState(true);
     
     const scale = useSharedValue(1);
     const translateX = useSharedValue(0);
     const translateY = useSharedValue(0);
     
     useEffect(() => {
       loadPoints();
     }, []);
     
     const loadPoints = async () => {
       try {
         setLoading(true);
         const data = await api.getPoints();
         
         // Filtrar apenas pontos com coordenadas
         const pointsWithCoords = data.filter(
           p => p.coordinates && p.coordinates.x && p.coordinates.y
         );
         
         setPoints(pointsWithCoords);
       } catch (error) {
         Alert.alert('Erro', 'Falha ao carregar pontos');
       } finally {
         setLoading(false);
       }
     };
     
     const handlePointPress = (pointId: string) => {
       router.push({
         pathname: '/point-details',
         params: { id: pointId }
       });
     };
     
     // Pinch gesture handler
     const pinchHandler = useAnimatedGestureHandler({
       onActive: (event) => {
         scale.value = Math.max(1, Math.min(event.scale, 3));
       },
     });
     
     // Pan gesture handler
     const panHandler = useAnimatedGestureHandler({
       onStart: (_, context) => {
         context.startX = translateX.value;
         context.startY = translateY.value;
       },
       onActive: (event, context) => {
         translateX.value = context.startX + event.translationX;
         translateY.value = context.startY + event.translationY;
       },
     });
     
     const animatedStyle = useAnimatedStyle(() => ({
       transform: [
         { scale: scale.value },
         { translateX: translateX.value },
         { translateY: translateY.value }
       ]
     }));
     
     if (loading) {
       return (
         <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" />
           <Text>Carregando mapa...</Text>
         </View>
       );
     }
     
     return (
       <View style={styles.container}>
         {/* Filtros por Meridiano */}
         <ScrollView horizontal style={styles.filterBar}>
           <TouchableOpacity
             style={[styles.filterChip, !selectedMeridian && styles.filterChipActive]}
             onPress={() => setSelectedMeridian(undefined)}
           >
             <Text>Todos</Text>
           </TouchableOpacity>
           
           {Object.keys(MERIDIAN_COLORS).map(meridian => (
             <TouchableOpacity
               key={meridian}
               style={[
                 styles.filterChip,
                 selectedMeridian === meridian && styles.filterChipActive
               ]}
               onPress={() => setSelectedMeridian(meridian)}
             >
               <View
                 style={[styles.colorDot, { backgroundColor: MERIDIAN_COLORS[meridian] }]}
               />
               <Text>{meridian}</Text>
             </TouchableOpacity>
           ))}
         </ScrollView>
         
         {/* Mapa Interativo */}
         <GestureHandlerRootView style={styles.mapContainer}>
           <PanGestureHandler onGestureEvent={panHandler}>
             <Animated.View style={animatedStyle}>
               <PinchGestureHandler onGestureEvent={pinchHandler}>
                 <Animated.View>
                   <BodyMapSVG
                     points={points}
                     onPointPress={handlePointPress}
                     selectedMeridian={selectedMeridian}
                   />
                 </Animated.View>
               </PinchGestureHandler>
             </Animated.View>
           </PanGestureHandler>
         </GestureHandlerRootView>
         
         {/* Controles de Zoom */}
         <View style={styles.zoomControls}>
           <TouchableOpacity
             style={styles.zoomButton}
             onPress={() => { scale.value = Math.min(scale.value + 0.5, 3); }}
           >
             <Ionicons name="add" size={24} />
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.zoomButton}
             onPress={() => { scale.value = Math.max(scale.value - 0.5, 1); }}
           >
             <Ionicons name="remove" size={24} />
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.zoomButton}
             onPress={() => {
               scale.value = 1;
               translateX.value = 0;
               translateY.value = 0;
             }}
           >
             <Ionicons name="refresh" size={24} />
           </TouchableOpacity>
         </View>
         
         {/* Legenda */}
         <View style={styles.legend}>
           <Text style={styles.legendTitle}>Legenda</Text>
           <Text>{points.length} pontos de acupuntura</Text>
           {selectedMeridian && (
             <Text>Filtrado: {selectedMeridian}</Text>
           )}
         </View>
       </View>
     );
   }

4. CRIAR TESTES:
   
   __tests__/components/BodyMapSVG.test.tsx:
   
   describe('BodyMapSVG', () => {
     const mockPoints = [
       {
         id: '1',
         code: 'VG20',
         name: 'Baihui',
         coordinates: { x: 50, y: 10 },
         meridian: 'Vaso Governador'
       }
     ];
     
     it('renders points correctly', () => {
       const { getByText } = render(
         <BodyMapSVG points={mockPoints} onPointPress={jest.fn()} />
       );
       expect(getByText('VG20')).toBeTruthy();
     });
     
     it('filters points by meridian', () => {
       const { queryByText } = render(
         <BodyMapSVG
           points={mockPoints}
           onPointPress={jest.fn()}
           selectedMeridian="Pulmão"
         />
       );
       expect(queryByText('VG20')).toBeNull();
     });
   });

RESULTADO ESPERADO:
- Mapa corporal renderizado com SVG
- Pontos de acupuntura nas posições corretas
- Clicável e navega para detalhes
- Filtros por meridiano funcionam
- Zoom e pan suaves
- Testes passando
```

---

### [TASK-010] Upload de Foto de Perfil

**Área:** Frontend Mobile  
**Estimativa:** 3 story points (3 dias)  
**Status Atual:** 0%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** TASK-008 (Galeria de Imagens)

#### Descrição
Implementar funcionalidade de upload de foto de perfil do usuário, com seletor de imagem (câmera/galeria), crop/resize, upload para Firebase Storage, e atualização no backend via `PUT /auth/profile`.

#### Contexto
Tela `profile-edit.tsx` não permite upload de foto. É necessário integrar com Firebase Storage e permitir usuário personalizar avatar.

#### Critérios de Aceitação
- [ ] Seletor de imagem (câmera e galeria) funciona
- [ ] Crop/resize de imagem antes do upload
- [ ] Upload para Firebase Storage com progress
- [ ] Atualização de `profileImageUrl` no backend
- [ ] Avatar atualizado em todo o app
- [ ] Fallback para avatar padrão se sem foto
- [ ] Testes do fluxo

#### Arquivos Principais
- `frontend-mobile/appunture/app/profile-edit.tsx`
- `frontend-mobile/appunture/services/storage.ts` (já criado em TASK-008)
- `frontend-mobile/appunture/stores/authStore.ts`

#### Prompt Sugerido

```
Implemente upload de foto de perfil no app React Native do Appunture.

CONTEXTO:
- storageService já implementado (TASK-008)
- Backend: PUT /auth/profile aceita profileImageUrl
- Necessário: UI para selecionar e fazer upload de foto

REQUISITOS:

1. INSTALAR DEPENDÊNCIA DE CROP (se não instalado):
   npm install expo-image-manipulator

2. ADICIONAR FUNÇÃO DE CROP NO storageService:
   
   services/storage.ts:
   
   async cropAndCompressProfileImage(uri: string): Promise<string> {
     // Crop em círculo (perfil) e resize para 300x300
     const manipResult = await ImageManipulator.manipulateAsync(
       uri,
       [
         { resize: { width: 300, height: 300 } }
       ],
       { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
     );
     
     return manipResult.uri;
   }

3. ATUALIZAR TELA DE EDIÇÃO DE PERFIL:
   
   app/profile-edit.tsx:
   
   export default function ProfileEditScreen() {
     const { user, updateProfile } = useAuthStore();
     const [name, setName] = useState(user?.displayName || '');
     const [phone, setPhone] = useState(user?.phone || '');
     const [profileImage, setProfileImage] = useState(user?.profileImageUrl);
     const [uploadingImage, setUploadingImage] = useState(false);
     const [uploadProgress, setUploadProgress] = useState(0);
     
     const handleSelectProfileImage = async () => {
       Alert.alert(
         'Foto de Perfil',
         'Escolha uma opção',
         [
           {
             text: 'Câmera',
             onPress: async () => {
               const image = await storageService.takePicture();
               if (image) await handleImageSelected(image.uri);
             }
           },
           {
             text: 'Galeria',
             onPress: async () => {
               const images = await storageService.pickImage(false);
               if (images.length > 0) await handleImageSelected(images[0].uri);
             }
           },
           { text: 'Cancelar', style: 'cancel' }
         ]
       );
     };
     
     const handleImageSelected = async (uri: string) => {
       try {
         setUploadingImage(true);
         
         // Crop e comprimir
         const croppedUri = await storageService.cropAndCompressProfileImage(uri);
         
         // Upload
         const imageUrl = await storageService.uploadImage(
           croppedUri,
           (progress) => setUploadProgress(progress)
         );
         
         // Atualizar estado local
         setProfileImage(imageUrl);
         
         Toast.show({
           type: 'success',
           text1: 'Foto atualizada!',
           text2: 'Não esqueça de salvar as alterações.'
         });
         
       } catch (error) {
         Alert.alert('Erro', 'Falha ao fazer upload da foto');
       } finally {
         setUploadingImage(false);
         setUploadProgress(0);
       }
     };
     
     const handleSave = async () => {
       try {
         await api.updateProfile({
           displayName: name,
           phone,
           profileImageUrl: profileImage
         });
         
         // Atualizar store
         authStore.setUser({
           ...user,
           displayName: name,
           phone,
           profileImageUrl: profileImage
         });
         
         Toast.show({ type: 'success', text1: 'Perfil atualizado!' });
         router.back();
         
       } catch (error) {
         Alert.alert('Erro', 'Falha ao salvar perfil');
       }
     };
     
     return (
       <ScrollView style={styles.container}>
         {/* Avatar */}
         <View style={styles.avatarSection}>
           <TouchableOpacity onPress={handleSelectProfileImage}>
             {profileImage ? (
               <Image
                 source={{ uri: profileImage }}
                 style={styles.avatar}
               />
             ) : (
               <View style={[styles.avatar, styles.avatarPlaceholder]}>
                 <Ionicons name="person" size={64} color="#ccc" />
               </View>
             )}
             
             <View style={styles.cameraIcon}>
               <Ionicons name="camera" size={24} color="white" />
             </View>
           </TouchableOpacity>
           
           {uploadingImage && (
             <View style={styles.uploadProgress}>
               <ActivityIndicator />
               <Text>Enviando: {uploadProgress}%</Text>
             </View>
           )}
         </View>
         
         {/* Campos de Edição */}
         <TextInput
           label="Nome"
           value={name}
           onChangeText={setName}
         />
         
         <TextInput
           label="Telefone"
           value={phone}
           onChangeText={setPhone}
           keyboardType="phone-pad"
         />
         
         {/* Botão Salvar */}
         <Button
           title="Salvar Alterações"
           onPress={handleSave}
           disabled={uploadingImage}
         />
       </ScrollView>
     );
   }

4. ATUALIZAR COMPONENTE DE AVATAR GLOBAL:
   
   components/UserAvatar.tsx:
   
   interface UserAvatarProps {
     imageUrl?: string;
     name?: string;
     size?: number;
   }
   
   export function UserAvatar({ imageUrl, name, size = 40 }: UserAvatarProps) {
     if (imageUrl) {
       return (
         <Image
           source={{ uri: imageUrl }}
           style={{ width: size, height: size, borderRadius: size / 2 }}
         />
       );
     }
     
     // Fallback: Iniciais
     const initials = name
       ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
       : '?';
     
     return (
       <View
         style={{
           width: size,
           height: size,
           borderRadius: size / 2,
           backgroundColor: COLORS.primary,
           justifyContent: 'center',
           alignItems: 'center'
         }}
       >
         <Text style={{ color: 'white', fontSize: size / 2.5, fontWeight: 'bold' }}>
           {initials}
         </Text>
       </View>
     );
   }

5. USAR UserAvatar EM TODO O APP:
   
   app/(tabs)/profile.tsx:
   <UserAvatar imageUrl={user.profileImageUrl} name={user.displayName} size={100} />
   
   components/Header.tsx:
   <UserAvatar imageUrl={user.profileImageUrl} name={user.displayName} size={40} />

6. ADICIONAR NO API SERVICE:
   
   services/api.ts:
   
   async updateProfile(data: {
     displayName?: string;
     phone?: string;
     profileImageUrl?: string;
   }) {
     const response = await this.client.put('/auth/profile', data);
     return response.data;
   }

7. CRIAR TESTES:
   
   __tests__/app/profile-edit.test.tsx:
   
   describe('ProfileEditScreen', () => {
     it('allows selecting profile image', async () => {
       const { getByTestId } = render(<ProfileEditScreen />);
       
       const avatarButton = getByTestId('avatar-button');
       fireEvent.press(avatarButton);
       
       // Verificar que modal de seleção aparece
       await waitFor(() => {
         expect(getByText('Câmera')).toBeTruthy();
         expect(getByText('Galeria')).toBeTruthy();
       });
     });
     
     it('uploads and updates profile image', async () => {
       // Mock storageService
       jest.spyOn(storageService, 'uploadImage').mockResolvedValue('https://new-image.jpg');
       
       const { getByTestId } = render(<ProfileEditScreen />);
       
       // Simular seleção de imagem
       await act(async () => {
         // ... trigger image selection
       });
       
       // Verificar upload
       await waitFor(() => {
         expect(storageService.uploadImage).toHaveBeenCalled();
       });
     });
   });

RESULTADO ESPERADO:
- Usuário pode selecionar foto (câmera/galeria)
- Foto é cropada e comprimida
- Upload para Firebase Storage
- Perfil atualizado no backend
- Avatar exibido em todo o app
- Testes passando
```

---

*Continua na próxima parte...*

### [TASK-011] Sistema de Auditoria

**Área:** Backend  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 20%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Implementar sistema completo de auditoria com campos `createdBy`, `updatedBy`, `createdAt`, `updatedAt` em todos os modelos, log de ações administrativas, e collection `audit_logs` no Firestore para trilha de auditoria completa.

#### Prompt Sugerido

```
Implemente sistema de auditoria completo no backend Spring Boot do Appunture.

CONTEXTO:
- Firestore não tem hooks automáticos como JPA
- Necessário: Adicionar campos de auditoria manualmente
- Objetivo: Rastreabilidade completa de todas as operações

REQUISITOS:

1. ADICIONAR CAMPOS DE AUDITORIA NOS MODELOS:
   
   Atualizar FirestorePoint.java, FirestoreSymptom.java, FirestoreUser.java:
   
   @Data
   public class FirestorePoint {
     private String id;
     private String code;
     private String name;
     // ... outros campos
     
     // Campos de auditoria
     private String createdBy; // UID do usuário
     private Instant createdAt;
     private String updatedBy; // UID do usuário
     private Instant updatedAt;
   }

2. CRIAR INTERCEPTOR DE AUDITORIA:
   
   config/AuditInterceptor.java:
   
   @Aspect
   @Component
   public class AuditInterceptor {
     
     @Before("execution(* com.appunture.backend.service.Firestore*Service.create*(..)) || " +
             "execution(* com.appunture.backend.service.Firestore*Service.update*(..))")
     public void addAuditFields(JoinPoint joinPoint) {
       Object[] args = joinPoint.getArgs();
       
       for (Object arg : args) {
         if (arg instanceof FirestorePoint || arg instanceof FirestoreSymptom) {
           addAuditInfo(arg);
         }
       }
     }
     
     private void addAuditInfo(Object entity) {
       String currentUser = getCurrentUserId();
       Instant now = Instant.now();
       
       try {
         if (entity instanceof FirestorePoint) {
           FirestorePoint point = (FirestorePoint) entity;
           if (point.getCreatedAt() == null) {
             point.setCreatedBy(currentUser);
             point.setCreatedAt(now);
           }
           point.setUpdatedBy(currentUser);
           point.setUpdatedAt(now);
         }
         // Similar para outros models
       } catch (Exception e) {
         log.error("Error adding audit info", e);
       }
     }
     
     private String getCurrentUserId() {
       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
       if (auth != null && auth.getPrincipal() instanceof FirebaseToken) {
         return ((FirebaseToken) auth.getPrincipal()).getUid();
       }
       return "SYSTEM";
     }
   }

3. CRIAR MODEL DE AUDIT LOG:
   
   model/AuditLog.java:
   
   @Data
   @Builder
   public class AuditLog {
     private String id;
     private String userId;
     private String userName;
     private String action; // CREATE, UPDATE, DELETE
     private String entityType; // POINT, SYMPTOM, USER
     private String entityId;
     private Map<String, Object> changes; // Before/after values
     private Instant timestamp;
     private String ipAddress;
     private String userAgent;
   }

4. CRIAR REPOSITORY DE AUDIT LOG:
   
   repository/AuditLogRepository.java:
   
   @Repository
   public class AuditLogRepository {
     
     @Autowired
     private Firestore firestore;
     
     private static final String COLLECTION = "audit_logs";
     
     public void log(AuditLog auditLog) {
       try {
         firestore.collection(COLLECTION)
           .document(auditLog.getId())
           .set(auditLog);
       } catch (Exception e) {
         log.error("Error saving audit log", e);
       }
     }
     
     public List<AuditLog> findByUserId(String userId, int limit) {
       // Query Firestore
     }
     
     public List<AuditLog> findByEntityId(String entityId, int limit) {
       // Query Firestore
     }
   }

5. ADICIONAR LOGGING EM SERVICES:
   
   service/FirestorePointService.java:
   
   @Autowired
   private AuditLogRepository auditLogRepository;
   
   public FirestorePoint createPoint(PointRequest request) {
     // ... criar ponto
     
     // Log audit
     auditLogRepository.log(AuditLog.builder()
       .id(UUID.randomUUID().toString())
       .userId(getCurrentUserId())
       .userName(getCurrentUserName())
       .action("CREATE")
       .entityType("POINT")
       .entityId(point.getId())
       .changes(Map.of("data", point))
       .timestamp(Instant.now())
       .build());
     
     return point;
   }
   
   public FirestorePoint updatePoint(String id, PointRequest request) {
     FirestorePoint oldPoint = getPointById(id);
     // ... atualizar ponto
     
     // Log audit
     auditLogRepository.log(AuditLog.builder()
       .id(UUID.randomUUID().toString())
       .userId(getCurrentUserId())
       .action("UPDATE")
       .entityType("POINT")
       .entityId(id)
       .changes(Map.of("before", oldPoint, "after", updatedPoint))
       .timestamp(Instant.now())
       .build());
     
     return updatedPoint;
   }

6. ENDPOINT ADMIN PARA CONSULTA:
   
   controller/FirestoreAdminController.java:
   
   @GetMapping("/audit-logs")
   @PreAuthorize("hasRole('ROLE_ADMIN')")
   public ResponseEntity<List<AuditLog>> getAuditLogs(
     @RequestParam(required = false) String userId,
     @RequestParam(required = false) String entityId,
     @RequestParam(defaultValue = "100") int limit
   ) {
     List<AuditLog> logs;
     
     if (userId != null) {
       logs = auditLogRepository.findByUserId(userId, limit);
     } else if (entityId != null) {
       logs = auditLogRepository.findByEntityId(entityId, limit);
     } else {
       logs = auditLogRepository.findAll(limit);
     }
     
     return ResponseEntity.ok(logs);
   }

7. CRIAR TESTES:
   
   @Test
   void createPoint_ShouldAddAuditFields() {
     PointRequest request = new PointRequest("VG20", "Baihui");
     
     FirestorePoint point = pointService.createPoint(request);
     
     assertNotNull(point.getCreatedBy());
     assertNotNull(point.getCreatedAt());
     assertNotNull(point.getUpdatedBy());
     assertNotNull(point.getUpdatedAt());
   }
   
   @Test
   void updatePoint_ShouldLogAudit() {
     FirestorePoint point = createTestPoint();
     PointRequest update = new PointRequest("VG20", "Baihui Updated");
     
     pointService.updatePoint(point.getId(), update);
     
     List<AuditLog> logs = auditLogRepository.findByEntityId(point.getId(), 10);
     assertEquals(2, logs.size()); // CREATE + UPDATE
   }

RESULTADO ESPERADO:
- Todos os modelos têm campos de auditoria
- Audit logs salvos no Firestore
- Endpoint admin para consulta
- Testes passando
```

---

### [TASK-012] Exceções Customizadas

**Área:** Backend  
**Estimativa:** 3 story points (3 dias)  
**Status Atual:** 20%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Criar exceções customizadas para substituir exceções genéricas (500 Internal Server Error) por códigos HTTP apropriados (404, 400, 422) com mensagens descritivas para o cliente.

#### Contexto
Atualmente muitos catch blocks retornam `500 Internal Server Error` genérico. É necessário criar exceções de negócio específicas para melhorar a experiência do desenvolvedor e debugging.

#### Critérios de Aceitação
- [ ] Todas as exceções de negócio são customizadas
- [ ] Códigos HTTP corretos (404, 400, 422, 409, etc)
- [ ] Mensagens de erro descritivas e padronizadas
- [ ] GlobalExceptionHandler trata todas as exceções customizadas
- [ ] Documentado no Swagger com exemplos
- [ ] Testes unitários para cada exceção

#### Arquivos Principais
- `backend-java/src/main/java/com/appunture/backend/exception/` (novos)
- `backend-java/src/main/java/com/appunture/backend/exception/GlobalExceptionHandler.java`

#### Prompt Sugerido

```
Implemente exceções customizadas no backend Spring Boot do projeto Appunture para melhorar tratamento de erros.

CONTEXTO:
- Muitos catch blocks retornam 500 genérico
- Necessário: Exceções específicas com códigos HTTP corretos
- Objetivo: Melhorar debugging e UX

REQUISITOS:

1. CRIAR EXCEÇÕES DE NEGÓCIO:
   
   exception/PointNotFoundException.java:
   
   @ResponseStatus(HttpStatus.NOT_FOUND)
   public class PointNotFoundException extends RuntimeException {
     public PointNotFoundException(String id) {
       super(String.format("Ponto de acupuntura não encontrado: %s", id));
     }
     
     public PointNotFoundException(String field, String value) {
       super(String.format("Ponto não encontrado com %s: %s", field, value));
     }
   }
   
   exception/SymptomNotFoundException.java:
   
   @ResponseStatus(HttpStatus.NOT_FOUND)
   public class SymptomNotFoundException extends RuntimeException {
     public SymptomNotFoundException(String id) {
       super(String.format("Sintoma não encontrado: %s", id));
     }
   }
   
   exception/InvalidPointDataException.java:
   
   @ResponseStatus(HttpStatus.BAD_REQUEST)
   public class InvalidPointDataException extends RuntimeException {
     public InvalidPointDataException(String message) {
       super(message);
     }
   }
   
   exception/DuplicatePointException.java:
   
   @ResponseStatus(HttpStatus.CONFLICT)
   public class DuplicatePointException extends RuntimeException {
     public DuplicatePointException(String code) {
       super(String.format("Ponto com código %s já existe", code));
     }
   }
   
   exception/UnauthorizedOperationException.java:
   
   @ResponseStatus(HttpStatus.FORBIDDEN)
   public class UnauthorizedOperationException extends RuntimeException {
     public UnauthorizedOperationException(String operation) {
       super(String.format("Operação não autorizada: %s", operation));
     }
   }
   
   exception/InvalidSymptomAssociationException.java:
   
   @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
   public class InvalidSymptomAssociationException extends RuntimeException {
     public InvalidSymptomAssociationException(String message) {
       super(message);
     }
   }

2. CRIAR DTO DE ERRO PADRONIZADO:
   
   dto/ErrorResponse.java:
   
   @Data
   @Builder
   public class ErrorResponse {
     private int status;
     private String error;
     private String message;
     private String path;
     private LocalDateTime timestamp;
     private Map<String, String> details;
   }

3. ATUALIZAR GlobalExceptionHandler:
   
   exception/GlobalExceptionHandler.java:
   
   @RestControllerAdvice
   @Slf4j
   public class GlobalExceptionHandler {
     
     @ExceptionHandler(PointNotFoundException.class)
     public ResponseEntity<ErrorResponse> handlePointNotFound(
       PointNotFoundException ex,
       WebRequest request
     ) {
       ErrorResponse error = ErrorResponse.builder()
         .status(HttpStatus.NOT_FOUND.value())
         .error("Point Not Found")
         .message(ex.getMessage())
         .path(request.getDescription(false).replace("uri=", ""))
         .timestamp(LocalDateTime.now())
         .build();
       
       log.warn("Point not found: {}", ex.getMessage());
       return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
     }
     
     @ExceptionHandler(DuplicatePointException.class)
     public ResponseEntity<ErrorResponse> handleDuplicatePoint(
       DuplicatePointException ex,
       WebRequest request
     ) {
       ErrorResponse error = ErrorResponse.builder()
         .status(HttpStatus.CONFLICT.value())
         .error("Duplicate Point")
         .message(ex.getMessage())
         .path(request.getDescription(false).replace("uri=", ""))
         .timestamp(LocalDateTime.now())
         .build();
       
       log.warn("Duplicate point: {}", ex.getMessage());
       return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
     }
     
     @ExceptionHandler(InvalidPointDataException.class)
     public ResponseEntity<ErrorResponse> handleInvalidPointData(
       InvalidPointDataException ex,
       WebRequest request
     ) {
       ErrorResponse error = ErrorResponse.builder()
         .status(HttpStatus.BAD_REQUEST.value())
         .error("Invalid Data")
         .message(ex.getMessage())
         .path(request.getDescription(false).replace("uri=", ""))
         .timestamp(LocalDateTime.now())
         .build();
       
       log.warn("Invalid point data: {}", ex.getMessage());
       return ResponseEntity.badRequest().body(error);
     }
     
     @ExceptionHandler(MethodArgumentNotValidException.class)
     public ResponseEntity<ErrorResponse> handleValidationErrors(
       MethodArgumentNotValidException ex,
       WebRequest request
     ) {
       Map<String, String> errors = new HashMap<>();
       ex.getBindingResult().getFieldErrors().forEach(error ->
         errors.put(error.getField(), error.getDefaultMessage())
       );
       
       ErrorResponse error = ErrorResponse.builder()
         .status(HttpStatus.BAD_REQUEST.value())
         .error("Validation Error")
         .message("Dados inválidos")
         .path(request.getDescription(false).replace("uri=", ""))
         .timestamp(LocalDateTime.now())
         .details(errors)
         .build();
       
       log.warn("Validation errors: {}", errors);
       return ResponseEntity.badRequest().body(error);
     }
     
     @ExceptionHandler(Exception.class)
     public ResponseEntity<ErrorResponse> handleGeneralException(
       Exception ex,
       WebRequest request
     ) {
       ErrorResponse error = ErrorResponse.builder()
         .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
         .error("Internal Server Error")
         .message("Erro interno do servidor")
         .path(request.getDescription(false).replace("uri=", ""))
         .timestamp(LocalDateTime.now())
         .build();
       
       log.error("Unexpected error", ex);
       return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
     }
   }

4. USAR EXCEÇÕES NOS SERVICES:
   
   service/FirestorePointService.java:
   
   public FirestorePoint getPointById(String id) {
     return firestorePointRepository.findById(id)
       .orElseThrow(() -> new PointNotFoundException(id));
   }
   
   public FirestorePoint getPointByCode(String code) {
     return firestorePointRepository.findByCode(code)
       .orElseThrow(() -> new PointNotFoundException("code", code));
   }
   
   public FirestorePoint createPoint(PointRequest request) {
     // Verificar duplicação
     if (firestorePointRepository.existsByCode(request.getCode())) {
       throw new DuplicatePointException(request.getCode());
     }
     
     // Validar dados
     if (request.getName() == null || request.getName().trim().isEmpty()) {
       throw new InvalidPointDataException("Nome do ponto é obrigatório");
     }
     
     // ... criar ponto
   }

5. DOCUMENTAR NO SWAGGER:
   
   controller/FirestorePointController.java:
   
   @Operation(summary = "Buscar ponto por ID")
   @ApiResponses({
     @ApiResponse(
       responseCode = "200",
       description = "Ponto encontrado",
       content = @Content(schema = @Schema(implementation = PointResponse.class))
     ),
     @ApiResponse(
       responseCode = "404",
       description = "Ponto não encontrado",
       content = @Content(schema = @Schema(implementation = ErrorResponse.class))
     ),
     @ApiResponse(
       responseCode = "401",
       description = "Não autenticado",
       content = @Content(schema = @Schema(implementation = ErrorResponse.class))
     )
   })
   @GetMapping("/{id}")
   public ResponseEntity<PointResponse> getPointById(@PathVariable String id) {
     // ...
   }

6. CRIAR TESTES:
   
   @Test
   void getPointById_NotFound_ShouldThrowException() {
     when(repository.findById("invalid-id")).thenReturn(Optional.empty());
     
     assertThrows(PointNotFoundException.class, () -> {
       service.getPointById("invalid-id");
     });
   }
   
   @Test
   void createPoint_DuplicateCode_ShouldThrowException() {
     when(repository.existsByCode("VG20")).thenReturn(true);
     
     PointRequest request = new PointRequest("VG20", "Baihui");
     
     assertThrows(DuplicatePointException.class, () -> {
       service.createPoint(request);
     });
   }
   
   @Test
   void handlePointNotFound_ShouldReturn404() throws Exception {
     when(service.getPointById(any())).thenThrow(new PointNotFoundException("123"));
     
     mockMvc.perform(get("/api/points/123"))
       .andExpect(status().isNotFound())
       .andExpect(jsonPath("$.status").value(404))
       .andExpect(jsonPath("$.error").value("Point Not Found"))
       .andExpect(jsonPath("$.message").exists());
   }

RESULTADO ESPERADO:
- Exceções específicas para cada erro de negócio
- Códigos HTTP corretos
- Mensagens descritivas
- GlobalExceptionHandler atualizado
- Testes passando
```

---

### [TASK-013] Validação Completa de DTOs

**Área:** Backend  
**Estimativa:** 3 story points (3 dias)  
**Status Atual:** 40%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Adicionar Bean Validation completa em todos os DTOs para garantir que dados inválidos não entrem no sistema, incluindo validações de tamanho, formato, ranges numéricos e lógica de negócio.

#### Contexto
Alguns DTOs não usam `@Valid`, `@NotNull`, `@Size`, etc. É necessário validação consistente em toda a API.

#### Critérios de Aceitação
- [ ] 100% dos DTOs têm validação completa
- [ ] Validações testadas
- [ ] Erros de validação retornam 400 com detalhes
- [ ] Mensagens de erro em português
- [ ] Documentado no Swagger

#### Arquivos Principais
- `backend-java/src/main/java/com/appunture/backend/dto/`
- `backend-java/src/main/resources/ValidationMessages.properties`

#### Prompt Sugerido

```
Implemente validação completa de DTOs usando Bean Validation no backend Spring Boot do Appunture.

CONTEXTO:
- DTOs com validação inconsistente
- Necessário: Validação completa em todos os request DTOs
- Objetivo: Prevenir dados inválidos no sistema

REQUISITOS:

1. ADICIONAR VALIDAÇÕES NOS DTOs:
   
   dto/PointRequest.java:
   
   @Data
   @NoArgsConstructor
   @AllArgsConstructor
   public class PointRequest {
     
     @NotBlank(message = "Código do ponto é obrigatório")
     @Size(min = 2, max = 10, message = "Código deve ter entre 2 e 10 caracteres")
     @Pattern(regexp = "^[A-Z]{1,3}[0-9]{1,3}$", message = "Código inválido (ex: VG20, E36)")
     private String code;
     
     @NotBlank(message = "Nome do ponto é obrigatório")
     @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
     private String name;
     
     @Size(max = 500, message = "Descrição não pode exceder 500 caracteres")
     private String description;
     
     @NotNull(message = "Meridiano é obrigatório")
     @Size(min = 2, max = 50, message = "Meridiano deve ter entre 2 e 50 caracteres")
     private String meridian;
     
     @Size(max = 200, message = "Localização não pode exceder 200 caracteres")
     private String location;
     
     @Valid
     private CoordinatesDto coordinates;
     
     @Size(max = 10, message = "Máximo de 10 imagens por ponto")
     private List<@URL(message = "URL de imagem inválida") String> imageUrls;
   }
   
   dto/SymptomRequest.java:
   
   @Data
   public class SymptomRequest {
     
     @NotBlank(message = "Nome do sintoma é obrigatório")
     @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
     private String name;
     
     @Size(max = 1000, message = "Descrição não pode exceder 1000 caracteres")
     private String description;
     
     @NotNull(message = "Categoria é obrigatória")
     private String category;
     
     @Min(value = 1, message = "Severidade mínima é 1")
     @Max(value = 10, message = "Severidade máxima é 10")
     private Integer severity;
     
     @Size(max = 20, message = "Máximo de 20 tags por sintoma")
     private List<@NotBlank(message = "Tag não pode ser vazia") String> tags;
   }
   
   dto/CoordinatesDto.java:
   
   @Data
   public class CoordinatesDto {
     
     @NotNull(message = "Coordenada X é obrigatória")
     @DecimalMin(value = "0.0", message = "X deve ser maior ou igual a 0")
     @DecimalMax(value = "100.0", message = "X deve ser menor ou igual a 100")
     private Double x;
     
     @NotNull(message = "Coordenada Y é obrigatória")
     @DecimalMin(value = "0.0", message = "Y deve ser maior ou igual a 0")
     @DecimalMax(value = "100.0", message = "Y deve ser menor ou igual a 100")
     private Double y;
   }
   
   dto/UserProfileUpdateRequest.java:
   
   @Data
   public class UserProfileUpdateRequest {
     
     @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
     private String displayName;
     
     @Pattern(
       regexp = "^\\+?[1-9]\\d{1,14}$",
       message = "Telefone inválido (formato internacional)"
     )
     private String phone;
     
     @URL(message = "URL de imagem de perfil inválida")
     private String profileImageUrl;
   }

2. CRIAR VALIDADOR CUSTOMIZADO:
   
   validation/ValidMeridian.java:
   
   @Target({ElementType.FIELD, ElementType.PARAMETER})
   @Retention(RetentionPolicy.RUNTIME)
   @Constraint(validatedBy = MeridianValidator.class)
   public @interface ValidMeridian {
     String message() default "Meridiano inválido";
     Class<?>[] groups() default {};
     Class<? extends Payload>[] payload() default {};
   }
   
   validation/MeridianValidator.java:
   
   public class MeridianValidator implements ConstraintValidator<ValidMeridian, String> {
     
     private static final Set<String> VALID_MERIDIANS = Set.of(
       "Vaso Governador", "Vaso Concepção", "Pulmão", "Intestino Grosso",
       "Estômago", "Baço-Pâncreas", "Coração", "Intestino Delgado",
       "Bexiga", "Rim", "Pericárdio", "Triplo Aquecedor"
     );
     
     @Override
     public boolean isValid(String value, ConstraintValidatorContext context) {
       if (value == null) return true; // @NotNull já trata isso
       return VALID_MERIDIANS.contains(value);
     }
   }
   
   // Usar no DTO:
   @ValidMeridian
   private String meridian;

3. MENSAGENS PERSONALIZADAS:
   
   src/main/resources/ValidationMessages.properties:
   
   # Mensagens de validação em português
   javax.validation.constraints.NotBlank.message=Campo obrigatório
   javax.validation.constraints.NotNull.message=Campo não pode ser nulo
   javax.validation.constraints.Size.message=Tamanho inválido
   javax.validation.constraints.Min.message=Valor mínimo não atingido
   javax.validation.constraints.Max.message=Valor máximo excedido
   javax.validation.constraints.Email.message=Email inválido
   javax.validation.constraints.Pattern.message=Formato inválido

4. ATIVAR VALIDAÇÃO NOS CONTROLLERS:
   
   controller/FirestorePointController.java:
   
   @PostMapping
   public ResponseEntity<PointResponse> createPoint(
     @Valid @RequestBody PointRequest request // @Valid ativa validação
   ) {
     // Se validação falhar, GlobalExceptionHandler trata
     FirestorePoint point = firestorePointService.createPoint(request);
     return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(point));
   }

5. TRATAMENTO DE ERROS (já no TASK-012):
   
   Garanta que GlobalExceptionHandler trata MethodArgumentNotValidException
   e retorna detalhes dos erros de validação.

6. CRIAR TESTES DE VALIDAÇÃO:
   
   @Test
   void createPoint_InvalidCode_ShouldReturn400() throws Exception {
     PointRequest request = new PointRequest();
     request.setCode(""); // Código vazio (inválido)
     request.setName("Baihui");
     
     mockMvc.perform(post("/api/points")
         .contentType(MediaType.APPLICATION_JSON)
         .content(objectMapper.writeValueAsString(request)))
       .andExpect(status().isBadRequest())
       .andExpect(jsonPath("$.details.code").value("Código do ponto é obrigatório"));
   }
   
   @Test
   void createPoint_InvalidMeridian_ShouldReturn400() throws Exception {
     PointRequest request = new PointRequest();
     request.setCode("VG20");
     request.setName("Baihui");
     request.setMeridian("Meridiano Inexistente");
     
     mockMvc.perform(post("/api/points")
         .contentType(MediaType.APPLICATION_JSON)
         .content(objectMapper.writeValueAsString(request)))
       .andExpect(status().isBadRequest())
       .andExpect(jsonPath("$.details.meridian").value("Meridiano inválido"));
   }
   
   @Test
   void updateProfile_InvalidPhone_ShouldReturn400() throws Exception {
     UserProfileUpdateRequest request = new UserProfileUpdateRequest();
     request.setPhone("123"); // Telefone inválido
     
     mockMvc.perform(put("/api/auth/profile")
         .contentType(MediaType.APPLICATION_JSON)
         .content(objectMapper.writeValueAsString(request)))
       .andExpect(status().isBadRequest());
   }

7. DOCUMENTAR NO SWAGGER:
   
   @Schema(description = "Request para criar ponto de acupuntura")
   public class PointRequest {
     
     @Schema(
       description = "Código do ponto",
       example = "VG20",
       required = true,
       pattern = "^[A-Z]{1,3}[0-9]{1,3}$"
     )
     private String code;
     
     // ...
   }

RESULTADO ESPERADO:
- Todos os DTOs validados
- Validações customizadas funcionando
- Mensagens de erro claras
- Testes de validação passando
- Documentação Swagger atualizada
```

---

### [TASK-014] Otimizar N+1 Queries

**Área:** Backend  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 20%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Otimizar queries do Firestore para eliminar problema de N+1, implementando batch gets e denormalização estratégica para melhorar performance.

#### Contexto
Buscar sintomas de pontos gera múltiplas queries (1 para o ponto + N para cada sintoma). Necessário usar batch gets do Firestore.

#### Critérios de Aceitação
- [ ] Máximo 2 queries por listagem (1 pontos + 1 batch sintomas)
- [ ] Latência reduzida em 50%+
- [ ] Benchmark antes/depois documentado
- [ ] Testes de performance passando

#### Prompt Sugerido

```
Otimize N+1 queries no backend Spring Boot do Appunture usando batch gets do Firestore.

CONTEXTO:
- Problema: Buscar sintomas de pontos gera N+1 queries
- Impacto: Latência alta em listas com muitos relacionamentos
- Solução: Batch gets do Firestore

REQUISITOS:

1. REFATORAR FirestorePointService:
   
   service/FirestorePointService.java:
   
   public List<PointWithSymptomsDto> getPointsWithSymptoms() {
     // 1. Buscar todos os pontos (1 query)
     List<FirestorePoint> points = firestorePointRepository.findAll();
     
     // 2. Coletar IDs únicos de sintomas
     Set<String> symptomIds = points.stream()
       .flatMap(p -> p.getSymptomIds().stream())
       .collect(Collectors.toSet());
     
     // 3. Batch get de sintomas (1 query) ✅
     Map<String, FirestoreSymptom> symptomsMap = batchGetSymptoms(symptomIds);
     
     // 4. Montar resposta
     return points.stream()
       .map(point -> {
         List<FirestoreSymptom> symptoms = point.getSymptomIds().stream()
           .map(symptomsMap::get)
           .filter(Objects::nonNull)
           .collect(Collectors.toList());
         
         return new PointWithSymptomsDto(point, symptoms);
       })
       .collect(Collectors.toList());
   }
   
   private Map<String, FirestoreSymptom> batchGetSymptoms(Set<String> ids) {
     if (ids.isEmpty()) return Collections.emptyMap();
     
     try {
       // Firestore getAll() faz batch get otimizado
       List<DocumentReference> refs = ids.stream()
         .map(id -> firestore.collection("symptoms").document(id))
         .collect(Collectors.toList());
       
       List<DocumentSnapshot> snapshots = firestore.getAll(
         refs.toArray(new DocumentReference[0])
       ).get();
       
       return snapshots.stream()
         .filter(DocumentSnapshot::exists)
         .map(snap -> snap.toObject(FirestoreSymptom.class))
         .filter(Objects::nonNull)
         .collect(Collectors.toMap(
           FirestoreSymptom::getId,
           Function.identity()
         ));
         
     } catch (Exception e) {
       log.error("Error batch getting symptoms", e);
       return Collections.emptyMap();
     }
   }

2. REFATORAR FirestoreSymptomService:
   
   service/FirestoreSymptomService.java:
   
   public List<SymptomWithPointsDto> getSymptomsWithPoints() {
     // 1. Buscar todos os sintomas (1 query)
     List<FirestoreSymptom> symptoms = firestoreSymptomRepository.findAll();
     
     // 2. Coletar IDs únicos de pontos
     Set<String> pointIds = symptoms.stream()
       .flatMap(s -> s.getPointIds().stream())
       .collect(Collectors.toSet());
     
     // 3. Batch get de pontos (1 query) ✅
     Map<String, FirestorePoint> pointsMap = batchGetPoints(pointIds);
     
     // 4. Montar resposta
     return symptoms.stream()
       .map(symptom -> {
         List<FirestorePoint> points = symptom.getPointIds().stream()
           .map(pointsMap::get)
           .filter(Objects::nonNull)
           .collect(Collectors.toList());
         
         return new SymptomWithPointsDto(symptom, points);
       })
       .collect(Collectors.toList());
   }

3. CRIAR MÉTODO GENÉRICO DE BATCH GET:
   
   util/FirestoreBatchUtil.java:
   
   @Component
   @Slf4j
   public class FirestoreBatchUtil {
     
     @Autowired
     private Firestore firestore;
     
     public <T> Map<String, T> batchGet(
       String collection,
       Set<String> ids,
       Class<T> clazz
     ) {
       if (ids.isEmpty()) return Collections.emptyMap();
       
       try {
         // Firestore tem limite de 500 docs por batch
         List<List<String>> batches = Lists.partition(
           new ArrayList<>(ids),
           500
         );
         
         Map<String, T> results = new HashMap<>();
         
         for (List<String> batch : batches) {
           List<DocumentReference> refs = batch.stream()
             .map(id -> firestore.collection(collection).document(id))
             .collect(Collectors.toList());
           
           List<DocumentSnapshot> snapshots = firestore.getAll(
             refs.toArray(new DocumentReference[0])
           ).get();
           
           snapshots.stream()
             .filter(DocumentSnapshot::exists)
             .forEach(snap -> {
               T obj = snap.toObject(clazz);
               if (obj != null) {
                 results.put(snap.getId(), obj);
               }
             });
         }
         
         log.debug("Batch get: {} documents from {} in {} batches",
           results.size(), collection, batches.size());
         
         return results;
         
       } catch (Exception e) {
         log.error("Error batch getting from " + collection, e);
         return Collections.emptyMap();
       }
     }
   }
   
   // Uso simplificado:
   Map<String, FirestoreSymptom> symptoms = firestoreBatchUtil.batchGet(
     "symptoms",
     symptomIds,
     FirestoreSymptom.class
   );

4. DENORMALIZAÇÃO ESTRATÉGICA (opcional):
   
   Para casos críticos, denormalizar dados:
   
   model/FirestorePoint.java:
   
   @Data
   public class FirestorePoint {
     private String id;
     private String code;
     private String name;
     // ...
     
     private List<String> symptomIds; // IDs apenas
     
     // Denormalização: dados básicos dos sintomas
     private List<SymptomSummary> symptomSummaries;
   }
   
   @Data
   public static class SymptomSummary {
     private String id;
     private String name;
     private String category;
     private Integer severity;
   }
   
   // Atualizar ao associar/desassociar sintomas

5. BENCHMARK DE PERFORMANCE:
   
   test/PerformanceTest.java:
   
   @SpringBootTest
   @Slf4j
   class PerformanceTest {
     
     @Test
     void benchmarkGetPointsWithSymptoms() {
       // Antes (N+1):
       long start1 = System.currentTimeMillis();
       List<Point> pointsOld = getPointsWithSymptomsN1();
       long time1 = System.currentTimeMillis() - start1;
       
       // Depois (Batch):
       long start2 = System.currentTimeMillis();
       List<Point> pointsNew = getPointsWithSymptomsBatch();
       long time2 = System.currentTimeMillis() - start2;
       
       log.info("N+1: {}ms, Batch: {}ms, Improvement: {}%",
         time1, time2, ((time1 - time2) * 100.0 / time1));
       
       assertTrue(time2 < time1 * 0.5, "Batch deve ser 50% mais rápido");
     }
   }

6. ADICIONAR CACHE (opcional):
   
   Para queries muito frequentes, adicionar cache:
   
   @Cacheable(value = "symptoms", key = "#id")
   public FirestoreSymptom getSymptomById(String id) {
     // ...
   }
   
   @CacheEvict(value = "symptoms", key = "#id")
   public void updateSymptom(String id, SymptomRequest request) {
     // ...
   }

7. DOCUMENTAR MELHORIAS:
   
   Criar doc/PERFORMANCE.md:
   
   ## Otimizações de Performance
   
   ### N+1 Queries (Resolvido)
   
   **Antes:**
   - getPointsWithSymptoms(): 1 + N queries (N = número de pontos)
   - Latência: ~500ms para 50 pontos
   
   **Depois:**
   - getPointsWithSymptoms(): 2 queries (1 pontos + 1 batch sintomas)
   - Latência: ~150ms para 50 pontos
   - **Melhoria: 70%**

RESULTADO ESPERADO:
- N+1 eliminado
- Batch gets implementados
- Performance 50%+ melhor
- Testes de performance documentados
```

---

## 📊 SUMÁRIO DE TAREFAS

### Total de Story Points por Sprint

| Sprint | Story Points | Duração Estimada | Status |
|--------|--------------|------------------|--------|
| Sprint 1 (Alta) | 34.5 SP | 4 semanas | 25% concluído |
| Sprint 2 (Média) | 41 SP | 3 semanas | 0% concluído |
| Sprint 3 (Baixa) | 32 SP | 2 semanas | 0% concluído |
| **TOTAL** | **107.5 SP** | **9 semanas** | **8% concluído** |

### Tarefas por Estado

- ✅ **Concluídas:** 4 tarefas (T04, T05, T06 parcial, T07)
- 🔄 **Em Andamento:** 2 tarefas (T01 40%, T03 60%)
- ❌ **Não Iniciadas:** 22 tarefas

### Tarefas por Área

| Área | Quantidade | Story Points |
|------|------------|--------------|
| Backend | 11 tasks | 46 SP |
| Frontend | 14 tasks | 53 SP |
| Full-stack | 2 tasks | 7 SP |
| Docs | 1 task | 2 SP |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Semana 1-2: Finalizar Sprint 1 (Alta Prioridade)
1. ✅ **TASK-001** (Backend Tests) - PRIORIDADE MÁXIMA
2. ✅ **TASK-002** (Frontend Tests) - PRIORIDADE MÁXIMA
3. ✅ **TASK-003** (Offline Sync) - PRIORIDADE ALTA
4. ✅ **TASK-006** (Email Resend) - PRIORIDADE ALTA

### Semana 3-5: Sprint 2 (Média Prioridade)
5. **TASK-008** (Image Gallery) - UX importante
6. **TASK-009** (Body Map) - Feature diferencial
7. **TASK-011** (Audit System) - Compliance
8. **TASK-014** (N+1 Optimization) - Performance

### Semana 6-9: Sprint 3 (Baixa Prioridade)
9. **TASK-020** (Social Login) - Nice to have
10. **TASK-022** (Dark Mode) - UX
11. **TASK-023** (i18n) - Internacionalização
12. **TASK-026** (Documentation) - Onboarding

---

## 📋 CHECKLIST DE QA POR SPRINT

### Sprint 1 - Checklist Mínimo
- [ ] 60%+ cobertura de testes backend
- [ ] 50%+ cobertura de testes frontend
- [ ] Sincronização offline funciona para todas as entidades
- [ ] CORS restritivo em produção
- [ ] Logs estruturados JSON funcionando
- [ ] Email verification com reenvio
- [ ] Rate limiting ativo e monitorado

### Sprint 2 - Checklist Mínimo
- [ ] Galeria de imagens funcional
- [ ] Mapa corporal interativo
- [ ] Upload de foto de perfil
- [ ] Sistema de auditoria logging
- [ ] Exceções customizadas com códigos HTTP corretos
- [ ] Performance otimizada (sem N+1)
- [ ] Acessibilidade mínima (labels ARIA)

### Sprint 3 - Checklist Mínimo
- [ ] Login social (Google + Apple iOS)
- [ ] Notificações push funcionando
- [ ] Modo escuro implementado
- [ ] Suporte a inglês (i18n)
- [ ] Documentação completa
- [ ] Bundle size otimizado

---

## ⚠️ RISCOS E MITIGAÇÕES

### Riscos Identificados

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Sem testes → Alta regressão | 🔴 Crítico | Priorizar T01 e T02 |
| Firebase quotas excedidas | 🔴 Alto | Monitorar uso, implementar cache |
| CORS permissivo | 🔴 Alto | Validar T04 antes de produção |
| Sync offline incompleto | 🟡 Médio | Completar T03 antes de Sprint 2 |
| Performance (N+1 queries) | 🟡 Médio | Monitorar, implementar T14 |
| Tokens em AsyncStorage | 🟡 Médio | Migrar para SecureStore (T19) |

---

## 📚 REFERÊNCIAS E DOCUMENTAÇÃO

### Documentos de Análise
- **ANALISE_ATUALIZADA.md** - Análise completa do projeto (1118 linhas)
- **DIAGNOSTICO_COMPLETO.md** - Diagnóstico técnico detalhado (1280 linhas)
- **FRONTEND_MOBILE_GAP_ANALYSIS.md** - Lacunas frontend vs backend (943 linhas)
- **IMPLEMENTACAO_RELATORIO.md** - Relatórios de implementação (587 linhas)

### Documentação Técnica
- **README.md** - Documentação principal do projeto
- **backend-java/README.md** - Setup e configuração backend
- **frontend-mobile/appunture/README.md** - Setup frontend mobile

### Padrões e Boas Práticas
- **Backend:** Clean Architecture, SOLID, DDD patterns
- **Frontend:** Component-driven development, Atomic Design
- **Testes:** AAA pattern (Arrange-Act-Assert)
- **Git:** Conventional Commits, Feature branches

---

## 🔍 COMO USAR ESTE DOCUMENTO

### Para Desenvolvedores
1. Escolha uma task do sprint atual
2. Copie o prompt sugerido
3. Cole no terminal/IDE do GitHub Copilot ou outro assistente IA
4. Revise e adapte conforme necessário
5. Implemente seguindo os critérios de aceitação
6. Rode testes e valide
7. Abra PR com referência à task

### Para Product Owners
1. Use o sumário para priorização
2. Consulte estimativas para planejamento
3. Acompanhe progresso por sprint
4. Revise critérios de aceitação antes de aprovar

### Para QA
1. Use checklists de QA por sprint
2. Valide todos os critérios de aceitação
3. Execute testes de regressão
4. Reporte bugs com referência à task

---

## 📝 LOG DE ATUALIZAÇÕES

### 2025-11-04 - Criação Inicial
- **Autor:** Sistema Automatizado de Diagnóstico
- **Ações:**
  - Gerado arquivo TASKS.md completo
  - 28 tarefas documentadas com prompts prontos
  - Organizadas em 3 sprints (Alta, Média, Baixa)
  - Incluídos critérios de aceitação para todas as tasks
  - Adicionados checklists de QA
  - Documentadas dependências e riscos

---

## 🆘 SUPORTE

Para dúvidas sobre este arquivo de tasks:
1. Consulte a documentação de análise correspondente
2. Revise os arquivos de código mencionados
3. Execute os testes existentes para entender o padrão
4. Abra issue no GitHub para discussão técnica

---

**Documento Gerado:** 2025-11-04T12:46:00Z  
**Versão:** 1.0  
**Próxima Revisão:** Após conclusão de Sprint 1  
**Contato:** Equipe Appunture / TCC Sistema de Informação

### [TASK-015] Otimizar Renderização de Listas

**Área:** Frontend Mobile  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 30%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Otimizar renderização de `FlatList` para listas com 100+ itens usando `getItemLayout`, `removeClippedSubviews`, e considerar `FlashList` para melhor performance.

#### Prompt Sugerido

```
Otimize renderização de listas longas no app React Native do Appunture.

CONTEXTO:
- FlatList sem otimizações para 100+ itens
- Necessário: Melhorar performance de scroll

REQUISITOS:

1. OTIMIZAR FlatList EM search.tsx:
   
   app/(tabs)/search.tsx:
   
   const ITEM_HEIGHT = 120; // Altura fixa dos cards
   
   <FlatList
     data={filteredPoints}
     renderItem={renderPointCard}
     keyExtractor={(item) => item.id} // Otimizado
     
     // Performance optimizations
     getItemLayout={(data, index) => ({
       length: ITEM_HEIGHT,
       offset: ITEM_HEIGHT * index,
       index,
     })}
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     updateCellsBatchingPeriod={50}
     initialNumToRender={10}
     windowSize={21}
     
     // Pull to refresh
     refreshControl={
       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
     }
     
     // Empty state
     ListEmptyComponent={<EmptyState message="Nenhum ponto encontrado" />}
   />

2. CONSIDERAR FlashList (Shopify):
   
   npm install @shopify/flash-list
   
   import { FlashList } from "@shopify/flash-list";
   
   <FlashList
     data={filteredPoints}
     renderItem={renderPointCard}
     estimatedItemSize={ITEM_HEIGHT}
     keyExtractor={(item) => item.id}
   />

3. MEMOIZAR COMPONENTES:
   
   const renderPointCard = useCallback(({ item }) => (
     <PointCard point={item} onPress={() => handlePress(item.id)} />
   ), [handlePress]);
   
   // PointCard.tsx
   export const PointCard = React.memo(({ point, onPress }) => {
     // ...
   });

RESULTADO ESPERADO:
- Scroll suave em listas longas
- Uso de memória otimizado
- FPS consistente durante scroll
```

---

### [TASK-016] Acessibilidade Completa

**Área:** Frontend Mobile  
**Estimativa:** 3 story points (3 dias)  
**Status Atual:** 40%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Adicionar `accessibilityLabel`, `accessibilityRole`, e `accessibilityHint` em todos os componentes para suporte completo a leitores de tela (TalkBack, VoiceOver).

#### Prompt Sugerido

```
Implemente acessibilidade completa no app React Native do Appunture.

CONTEXTO:
- Muitos componentes sem accessibilityLabel
- Necessário: Suporte completo a leitores de tela

REQUISITOS:

1. ADICIONAR LABELS EM BOTÕES:
   
   <TouchableOpacity
     onPress={handleLogin}
     accessible={true}
     accessibilityRole="button"
     accessibilityLabel="Fazer login"
     accessibilityHint="Toque para entrar na sua conta"
   >
     <Text>Login</Text>
   </TouchableOpacity>

2. ADICIONAR LABELS EM INPUTS:
   
   <TextInput
     placeholder="Email"
     value={email}
     onChangeText={setEmail}
     accessible={true}
     accessibilityLabel="Campo de email"
     accessibilityHint="Digite seu endereço de email"
   />

3. ADICIONAR ROLES APROPRIADOS:
   
   <View accessibilityRole="header">
     <Text>Bem-vindo ao Appunture</Text>
   </View>
   
   <FlatList
     accessibilityRole="list"
     data={points}
     renderItem={({ item }) => (
       <View accessibilityRole="listitem">
         <PointCard point={item} />
       </View>
     )}
   />

4. TESTAR COM LEITORES DE TELA:
   
   # Android (TalkBack)
   - Ativar nas Configurações > Acessibilidade
   - Navegar com gestos de deslizar
   
   # iOS (VoiceOver)
   - Ativar nas Configurações > Acessibilidade
   - Testar navegação por elementos

RESULTADO ESPERADO:
- Todos os elementos interativos têm labels
- Leitores de tela funcionam corretamente
- Navegação por teclado funcional
```

---

### [TASK-017] Error Handling Melhorado

**Área:** Frontend Mobile  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 30%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Substituir `Alert.alert` genéricos por Toast messages com mensagens amigáveis mapeadas de erros HTTP, incluindo ações de retry.

#### Prompt Sugerido

```
Melhore error handling no app React Native do Appunture.

CONTEXTO:
- Alertas genéricos "Algo deu errado"
- Necessário: Mensagens específicas e ações de retry

REQUISITOS:

1. INSTALAR react-native-toast-message:
   
   npm install react-native-toast-message
   
   App.tsx:
   import Toast from 'react-native-toast-message';
   
   export default function App() {
     return (
       <>
         {/* App content */}
         <Toast />
       </>
     );
   }

2. CRIAR MAPEAMENTO DE ERROS:
   
   utils/errorMessages.ts:
   
   export const ERROR_MESSAGES = {
     400: 'Dados inválidos. Verifique as informações.',
     401: 'Sessão expirada. Faça login novamente.',
     403: 'Você não tem permissão para esta ação.',
     404: 'Recurso não encontrado.',
     409: 'Este item já existe.',
     429: 'Muitas tentativas. Aguarde um momento.',
     500: 'Erro no servidor. Tente novamente mais tarde.',
     503: 'Serviço temporariamente indisponível.',
     default: 'Erro inesperado. Tente novamente.',
   };
   
   export function getErrorMessage(error: any): string {
     if (error.response) {
       const status = error.response.status;
       const serverMessage = error.response.data?.message;
       
       return serverMessage || ERROR_MESSAGES[status] || ERROR_MESSAGES.default;
     }
     
     if (error.message === 'Network Error') {
       return 'Sem conexão. Verifique sua internet.';
     }
     
     return ERROR_MESSAGES.default;
   }

3. CRIAR HOOK DE ERROR HANDLING:
   
   hooks/useErrorHandler.ts:
   
   import Toast from 'react-native-toast-message';
   import { getErrorMessage } from '@/utils/errorMessages';
   
   export function useErrorHandler() {
     const handleError = useCallback((error: any, options?: {
       onRetry?: () => void;
       silent?: boolean;
     }) => {
       const message = getErrorMessage(error);
       
       if (options?.silent) {
         console.error('Silent error:', error);
         return;
       }
       
       Toast.show({
         type: 'error',
         text1: 'Erro',
         text2: message,
         visibilityTime: 4000,
         position: 'bottom',
         props: options?.onRetry ? {
           onPress: () => {
             Toast.hide();
             options.onRetry?.();
           }
         } : undefined
       });
       
       console.error('Error:', error);
     }, []);
     
     return { handleError };
   }

4. USAR EM COMPONENTES:
   
   app/(tabs)/search.tsx:
   
   const { handleError } = useErrorHandler();
   
   const loadPoints = async () => {
     try {
       setLoading(true);
       const data = await api.getPoints();
       setPoints(data);
     } catch (error) {
       handleError(error, {
         onRetry: loadPoints
       });
     } finally {
       setLoading(false);
     }
   };

5. SUCCESS E INFO TOASTS:
   
   Toast.show({
     type: 'success',
     text1: 'Sucesso!',
     text2: 'Ponto adicionado aos favoritos',
   });
   
   Toast.show({
     type: 'info',
     text1: 'Atenção',
     text2: 'Sincronizando dados...',
   });

RESULTADO ESPERADO:
- Toast messages ao invés de alerts
- Mensagens específicas por erro
- Ações de retry quando apropriado
- UX melhorada
```

---

### [TASK-018] Validação de Formulários

**Área:** Frontend Mobile  
**Estimativa:** 3 story points (3 dias)  
**Status Atual:** 30%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Implementar validação consistente de formulários usando Yup ou Zod, com validação antes de enviar para API e exibição de erros inline.

#### Prompt Sugerido

```
Implemente validação de formulários consistente no app React Native do Appunture.

CONTEXTO:
- Validação inconsistente nos formulários
- Necessário: Validação padronizada com Yup

REQUISITOS:

1. INSTALAR YUP:
   
   npm install yup

2. CRIAR SCHEMAS DE VALIDAÇÃO:
   
   validation/schemas.ts:
   
   import * as Yup from 'yup';
   
   export const loginSchema = Yup.object().shape({
     email: Yup.string()
       .email('Email inválido')
       .required('Email é obrigatório'),
     password: Yup.string()
       .min(6, 'Senha deve ter no mínimo 6 caracteres')
       .required('Senha é obrigatória'),
   });
   
   export const registerSchema = Yup.object().shape({
     email: Yup.string()
       .email('Email inválido')
       .required('Email é obrigatório'),
     password: Yup.string()
       .min(8, 'Senha deve ter no mínimo 8 caracteres')
       .matches(/[A-Z]/, 'Senha deve conter letra maiúscula')
       .matches(/[0-9]/, 'Senha deve conter número')
       .required('Senha é obrigatória'),
     confirmPassword: Yup.string()
       .oneOf([Yup.ref('password')], 'Senhas não coincidem')
       .required('Confirme a senha'),
     displayName: Yup.string()
       .min(2, 'Nome deve ter no mínimo 2 caracteres')
       .required('Nome é obrigatório'),
   });
   
   export const profileSchema = Yup.object().shape({
     displayName: Yup.string()
       .min(2, 'Nome deve ter no mínimo 2 caracteres'),
     phone: Yup.string()
       .matches(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido'),
   });

3. CRIAR HOOK DE VALIDAÇÃO:
   
   hooks/useFormValidation.ts:
   
   import { useState } from 'react';
   import { Schema } from 'yup';
   
   export function useFormValidation<T>(schema: Schema<T>) {
     const [errors, setErrors] = useState<Record<string, string>>({});
     
     const validate = async (data: T): Promise<boolean> => {
       try {
         await schema.validate(data, { abortEarly: false });
         setErrors({});
         return true;
       } catch (err) {
         if (err instanceof Yup.ValidationError) {
           const newErrors: Record<string, string> = {};
           err.inner.forEach((error) => {
             if (error.path) {
               newErrors[error.path] = error.message;
             }
           });
           setErrors(newErrors);
         }
         return false;
       }
     };
     
     const clearError = (field: string) => {
       setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
       });
     };
     
     const clearAllErrors = () => setErrors({});
     
     return { errors, validate, clearError, clearAllErrors };
   }

4. USAR EM LOGIN:
   
   app/login.tsx:
   
   export default function LoginScreen() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const { errors, validate } = useFormValidation(loginSchema);
     
     const handleLogin = async () => {
       const isValid = await validate({ email, password });
       
       if (!isValid) {
         Toast.show({
           type: 'error',
           text1: 'Erro de Validação',
           text2: 'Verifique os campos do formulário',
         });
         return;
       }
       
       try {
         await authStore.login(email, password);
         router.replace('/(tabs)');
       } catch (error) {
         handleError(error);
       }
     };
     
     return (
       <View>
         <TextInput
           placeholder="Email"
           value={email}
           onChangeText={setEmail}
           autoCapitalize="none"
           keyboardType="email-address"
         />
         {errors.email && (
           <Text style={styles.errorText}>{errors.email}</Text>
         )}
         
         <TextInput
           placeholder="Senha"
           value={password}
           onChangeText={setPassword}
           secureTextEntry
         />
         {errors.password && (
           <Text style={styles.errorText}>{errors.password}</Text>
         )}
         
         <Button title="Entrar" onPress={handleLogin} />
       </View>
     );
   }

5. COMPONENTE DE INPUT COM ERRO:
   
   components/FormInput.tsx:
   
   interface FormInputProps {
     label: string;
     value: string;
     onChangeText: (text: string) => void;
     error?: string;
     // ... outros props
   }
   
   export function FormInput({ label, error, ...props }: FormInputProps) {
     return (
       <View style={styles.container}>
         <Text style={styles.label}>{label}</Text>
         <TextInput
           style={[styles.input, error && styles.inputError]}
           {...props}
         />
         {error && (
           <View style={styles.errorContainer}>
             <Ionicons name="alert-circle" size={16} color="red" />
             <Text style={styles.errorText}>{error}</Text>
           </View>
         )}
       </View>
     );
   }

RESULTADO ESPERADO:
- Validação consistente em todos os formulários
- Erros inline com mensagens claras
- Previne submit com dados inválidos
- UX melhorada
```

---

### [TASK-019] Migrar Tokens para SecureStore

**Área:** Frontend Mobile  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 0%  
**Prioridade:** 🟡 MÉDIA  
**Dependências:** Nenhuma

#### Descrição
Migrar armazenamento de tokens Firebase de AsyncStorage para `expo-secure-store` (keychain/keystore) para maior segurança.

#### Prompt Sugerido

```
Migre armazenamento de tokens para SecureStore no app React Native do Appunture.

CONTEXTO:
- Tokens em AsyncStorage não é seguro
- Necessário: Usar keychain/keystore do dispositivo

REQUISITOS:

1. INSTALAR expo-secure-store:
   
   npx expo install expo-secure-store

2. CRIAR SERVIÇO DE SECURE STORAGE:
   
   services/secureStorage.ts:
   
   import * as SecureStore from 'expo-secure-store';
   
   const KEYS = {
     AUTH_TOKEN: 'auth_token',
     REFRESH_TOKEN: 'refresh_token',
     USER_ID: 'user_id',
   };
   
   export const secureStorage = {
     async setAuthToken(token: string): Promise<void> {
       await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
     },
     
     async getAuthToken(): Promise<string | null> {
       return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
     },
     
     async deleteAuthToken(): Promise<void> {
       await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
     },
     
     async setRefreshToken(token: string): Promise<void> {
       await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
     },
     
     async getRefreshToken(): Promise<string | null> {
       return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
     },
     
     async clearAll(): Promise<void> {
       await Promise.all([
         SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
         SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
         SecureStore.deleteItemAsync(KEYS.USER_ID),
       ]);
     },
   };

3. ATUALIZAR authStore:
   
   stores/authStore.ts:
   
   import { secureStorage } from '@/services/secureStorage';
   
   export const useAuthStore = create<AuthState>((set, get) => ({
     user: null,
     token: null,
     loading: true,
     
     initialize: async () => {
       try {
         // Carregar token do SecureStore
         const token = await secureStorage.getAuthToken();
         
         if (token) {
           // Validar token e carregar usuário
           const user = await api.getCurrentUser();
           set({ user, token, loading: false });
         } else {
           set({ loading: false });
         }
       } catch (error) {
         console.error('Failed to initialize auth', error);
         set({ loading: false });
       }
     },
     
     login: async (email: string, password: string) => {
       const { user, token } = await api.login(email, password);
       
       // Salvar no SecureStore
       await secureStorage.setAuthToken(token);
       
       set({ user, token });
     },
     
     logout: async () => {
       // Limpar SecureStore
       await secureStorage.clearAll();
       
       set({ user: null, token: null });
     },
   }));

4. MIGRAÇÃO DE DADOS EXISTENTES:
   
   services/migration.ts:
   
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { secureStorage } from './secureStorage';
   
   export async function migrateToSecureStore() {
     try {
       // Verificar se já migrou
       const migrated = await AsyncStorage.getItem('migrated_to_secure');
       if (migrated === 'true') return;
       
       // Migrar tokens do AsyncStorage para SecureStore
       const oldToken = await AsyncStorage.getItem('auth_token');
       if (oldToken) {
         await secureStorage.setAuthToken(oldToken);
         await AsyncStorage.removeItem('auth_token');
       }
       
       const oldRefresh = await AsyncStorage.getItem('refresh_token');
       if (oldRefresh) {
         await secureStorage.setRefreshToken(oldRefresh);
         await AsyncStorage.removeItem('refresh_token');
       }
       
       // Marcar como migrado
       await AsyncStorage.setItem('migrated_to_secure', 'true');
       
       console.log('Migration to SecureStore completed');
     } catch (error) {
       console.error('Migration failed', error);
     }
   }
   
   // Chamar no App.tsx ao inicializar
   useEffect(() => {
     migrateToSecureStore();
   }, []);

5. TESTES:
   
   # Testar em dispositivo real (SecureStore não funciona em emuladores antigos)
   # Verificar que tokens são salvos e recuperados corretamente
   # Testar logout e limpeza de tokens

RESULTADO ESPERADO:
- Tokens salvos no keychain/keystore
- Maior segurança
- Migração transparente de dados existentes
- Funciona em iOS e Android
```

---

## 🟢 SPRINT 3 - Prioridade BAIXA

---

### [TASK-020] Login Social

**Área:** Frontend Mobile  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Configuração Firebase Console

#### Descrição
Implementar login com Google e Apple (obrigatório para iOS), configurando Firebase Authentication providers e fluxo OAuth.

#### Prompt Sugerido

```
Implemente login social (Google e Apple) no app React Native do Appunture.

CONTEXTO:
- Apenas login email/senha disponível
- Necessário: Google (iOS/Android) e Apple (iOS obrigatório)

REQUISITOS:

1. CONFIGURAR FIREBASE CONSOLE:
   
   # Google Sign-In
   - Habilitar em Authentication > Sign-in method
   - Adicionar SHA-1 do app Android
   - Baixar google-services.json atualizado
   
   # Apple Sign-In
   - Habilitar em Authentication > Sign-in method
   - Configurar Service ID e Key ID
   - Adicionar domínios autorizados

2. INSTALAR DEPENDÊNCIAS:
   
   npx expo install @react-native-google-signin/google-signin
   npx expo install expo-apple-authentication

3. CONFIGURAR GOOGLE SIGN-IN:
   
   services/googleAuth.ts:
   
   import { GoogleSignin } from '@react-native-google-signin/google-signin';
   import auth from '@react-native-firebase/auth';
   
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
   });
   
   export async function signInWithGoogle() {
     try {
       await GoogleSignin.hasPlayServices();
       const { idToken } = await GoogleSignin.signIn();
       
       const googleCredential = auth.GoogleAuthProvider.credential(idToken);
       const userCredential = await auth().signInWithCredential(googleCredential);
       
       return userCredential.user;
     } catch (error) {
       console.error('Google Sign-In error', error);
       throw error;
     }
   }

4. CONFIGURAR APPLE SIGN-IN:
   
   services/appleAuth.ts:
   
   import * as AppleAuthentication from 'expo-apple-authentication';
   import { getAuth, signInWithCredential, OAuthProvider } from 'firebase/auth';
   
   export async function signInWithApple() {
     try {
       const credential = await AppleAuthentication.signInAsync({
         requestedScopes: [
           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
           AppleAuthentication.AppleAuthenticationScope.EMAIL,
         ],
       });
       
       const { identityToken, nonce } = credential;
       
       const provider = new OAuthProvider('apple.com');
       const oauthCredential = provider.credential({
         idToken: identityToken!,
         rawNonce: nonce,
       });
       
       const auth = getAuth();
       const userCredential = await signInWithCredential(auth, oauthCredential);
       
       return userCredential.user;
     } catch (error) {
       if (error.code === 'ERR_CANCELED') {
         console.log('User canceled Apple Sign-In');
       } else {
         console.error('Apple Sign-In error', error);
       }
       throw error;
     }
   }

5. ATUALIZAR TELA DE LOGIN:
   
   app/login.tsx:
   
   import { Platform } from 'react-native';
   import * as AppleAuthentication from 'expo-apple-authentication';
   
   export default function LoginScreen() {
     const handleGoogleLogin = async () => {
       try {
         setLoading(true);
         const firebaseUser = await signInWithGoogle();
         
         // Sincronizar com backend
         await api.syncUser(firebaseUser.uid);
         
         // Atualizar store
         authStore.setUser(firebaseUser);
         
         router.replace('/(tabs)');
       } catch (error) {
         handleError(error);
       } finally {
         setLoading(false);
       }
     };
     
     const handleAppleLogin = async () => {
       try {
         setLoading(true);
         const firebaseUser = await signInWithApple();
         
         await api.syncUser(firebaseUser.uid);
         authStore.setUser(firebaseUser);
         
         router.replace('/(tabs)');
       } catch (error) {
         if (error.code !== 'ERR_CANCELED') {
           handleError(error);
         }
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <View style={styles.container}>
         {/* Email/Password login */}
         
         <View style={styles.divider}>
           <View style={styles.dividerLine} />
           <Text style={styles.dividerText}>OU</Text>
           <View style={styles.dividerLine} />
         </View>
         
         {/* Google Sign-In Button */}
         <TouchableOpacity
           style={styles.socialButton}
           onPress={handleGoogleLogin}
         >
           <Ionicons name="logo-google" size={24} color="#DB4437" />
           <Text style={styles.socialButtonText}>Continuar com Google</Text>
         </TouchableOpacity>
         
         {/* Apple Sign-In Button (iOS only) */}
         {Platform.OS === 'ios' && (
           <AppleAuthentication.AppleAuthenticationButton
             buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
             buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
             cornerRadius={8}
             style={styles.appleButton}
             onPress={handleAppleLogin}
           />
         )}
       </View>
     );
   }

6. TESTAR:
   
   # Android (Google)
   - Gerar release APK ou AAB
   - Extrair SHA-1: keytool -list -v -keystore my-release-key.keystore
   - Adicionar ao Firebase Console
   - Testar login
   
   # iOS (Apple)
   - Configurar Sign in with Apple capability no Xcode
   - Testar em dispositivo real (não funciona em simulador)

RESULTADO ESPERADO:
- Login com Google funciona (iOS/Android)
- Login com Apple funciona (iOS)
- Sincroniza com backend
- UX consistente com login email/senha
```

---


### [TASK-021] Notificações Push

**Área:** Full-stack  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Implementar Firebase Cloud Messaging (FCM) para notificações push, solicitando permissões no app e salvando token no backend para envio de notificações.

#### Prompt Sugerido

```
Implemente notificações push com FCM no projeto Appunture.

REQUISITOS FRONTEND:

1. INSTALAR DEPENDÊNCIAS:
   
   npx expo install expo-notifications

2. CONFIGURAR NOTIFICAÇÕES:
   
   services/notifications.ts:
   
   import * as Notifications from 'expo-notifications';
   import * as Device from 'expo-device';
   import { Platform } from 'react-native';
   
   Notifications.setNotificationHandler({
     handleNotification: async () => ({
       shouldShowAlert: true,
       shouldPlaySound: true,
       shouldSetBadge: true,
     }),
   });
   
   export async function registerForPushNotifications() {
     let token;
     
     if (Device.isDevice) {
       const { status: existingStatus } = await Notifications.getPermissionsAsync();
       let finalStatus = existingStatus;
       
       if (existingStatus !== 'granted') {
         const { status } = await Notifications.requestPermissionsAsync();
         finalStatus = status;
       }
       
       if (finalStatus !== 'granted') {
         throw new Error('Permission not granted for push notifications');
       }
       
       token = (await Notifications.getExpoPushTokenAsync()).data;
     } else {
       console.log('Must use physical device for Push Notifications');
     }
     
     if (Platform.OS === 'android') {
       Notifications.setNotificationChannelAsync('default', {
         name: 'default',
         importance: Notifications.AndroidImportance.MAX,
         vibrationPattern: [0, 250, 250, 250],
         lightColor: '#FF231F7C',
       });
     }
     
     return token;
   }

3. USAR NO APP:
   
   App.tsx:
   
   useEffect(() => {
     registerForPushNotifications().then(token => {
       if (token && authStore.user) {
         api.updatePushToken(token);
       }
     });
     
     // Listener para notificações recebidas
     const subscription = Notifications.addNotificationReceivedListener(notification => {
       console.log('Notification received:', notification);
     });
     
     // Listener para quando usuário toca na notificação
     const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
       console.log('Notification tapped:', response);
       // Navegar para tela específica baseado no payload
     });
     
     return () => {
       subscription.remove();
       responseSubscription.remove();
     };
   }, []);

REQUISITOS BACKEND:

1. ADICIONAR CAMPO NO MODEL:
   
   model/FirestoreUser.java:
   
   @Data
   public class FirestoreUser {
     // ... outros campos
     private String fcmToken; // Token FCM
     private List<String> fcmTokens; // Múltiplos dispositivos
   }

2. ENDPOINT PARA SALVAR TOKEN:
   
   controller/FirestoreAuthController.java:
   
   @PutMapping("/push-token")
   public ResponseEntity<Void> updatePushToken(
     @AuthenticationPrincipal FirebaseToken token,
     @RequestBody Map<String, String> request
   ) {
     String uid = token.getUid();
     String pushToken = request.get("token");
     
     firestoreUserService.updatePushToken(uid, pushToken);
     return ResponseEntity.ok().build();
   }

3. SERVIÇO PARA ENVIAR NOTIFICAÇÕES:
   
   service/NotificationService.java:
   
   @Service
   @Slf4j
   public class NotificationService {
     
     @Autowired
     private FirebaseMessaging firebaseMessaging;
     
     public void sendToUser(String userId, String title, String body, Map<String, String> data) {
       FirestoreUser user = userRepository.findById(userId)
         .orElseThrow(() -> new UserNotFoundException(userId));
       
       if (user.getFcmToken() == null) {
         log.warn("User {} has no FCM token", userId);
         return;
       }
       
       Message message = Message.builder()
         .setToken(user.getFcmToken())
         .setNotification(Notification.builder()
           .setTitle(title)
           .setBody(body)
           .build())
         .putAllData(data)
         .build();
       
       try {
         String response = firebaseMessaging.send(message);
         log.info("Sent notification to user {}: {}", userId, response);
       } catch (FirebaseMessagingException e) {
         log.error("Error sending notification", e);
       }
     }
     
     public void sendToAll(String title, String body) {
       List<FirestoreUser> users = userRepository.findAll();
       
       users.stream()
         .filter(u -> u.getFcmToken() != null)
         .forEach(u -> sendToUser(u.getId(), title, body, Map.of()));
     }
   }

RESULTADO ESPERADO:
- Notificações push funcionando
- Tokens salvos no backend
- Backend pode enviar notificações
```

---

### [TASK-022] Modo Escuro

**Área:** Frontend Mobile  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Implementar tema escuro completo no app, com toggle nas configurações e persistência da preferência do usuário.

#### Prompt Sugerido

```
Implemente modo escuro no app React Native do Appunture.

REQUISITOS:

1. CRIAR THEME PROVIDER:
   
   contexts/ThemeContext.tsx:
   
   import { createContext, useContext, useState, useEffect } from 'react';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { useColorScheme } from 'react-native';
   
   type Theme = 'light' | 'dark' | 'auto';
   
   interface ThemeContextType {
     theme: Theme;
     isDark: boolean;
     setTheme: (theme: Theme) => void;
     colors: typeof lightColors | typeof darkColors;
   }
   
   const lightColors = {
     background: '#FFFFFF',
     text: '#000000',
     primary: '#007AFF',
     secondary: '#5856D6',
     card: '#F2F2F7',
     border: '#C6C6C8',
     error: '#FF3B30',
     success: '#34C759',
   };
   
   const darkColors = {
     background: '#000000',
     text: '#FFFFFF',
     primary: '#0A84FF',
     secondary: '#5E5CE6',
     card: '#1C1C1E',
     border: '#38383A',
     error: '#FF453A',
     success: '#30D158',
   };
   
   const ThemeContext = createContext<ThemeContextType>(null!);
   
   export function ThemeProvider({ children }) {
     const systemColorScheme = useColorScheme();
     const [theme, setThemeState] = useState<Theme>('auto');
     
     useEffect(() => {
       AsyncStorage.getItem('theme').then(saved => {
         if (saved) setThemeState(saved as Theme);
       });
     }, []);
     
     const setTheme = async (newTheme: Theme) => {
       setThemeState(newTheme);
       await AsyncStorage.setItem('theme', newTheme);
     };
     
     const isDark = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');
     const colors = isDark ? darkColors : lightColors;
     
     return (
       <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
         {children}
       </ThemeContext.Provider>
     );
   }
   
   export const useTheme = () => useContext(ThemeContext);

2. USAR EM COMPONENTES:
   
   app/(tabs)/index.tsx:
   
   import { useTheme } from '@/contexts/ThemeContext';
   
   export default function HomeScreen() {
     const { colors, isDark } = useTheme();
     
     return (
       <View style={[styles.container, { backgroundColor: colors.background }]}>
         <Text style={{ color: colors.text }}>Bem-vindo</Text>
       </View>
     );
   }

3. TOGGLE NAS CONFIGURAÇÕES:
   
   app/(tabs)/profile.tsx:
   
   import { useTheme } from '@/contexts/ThemeContext';
   
   export default function ProfileScreen() {
     const { theme, setTheme, isDark } = useTheme();
     
     return (
       <View>
         <Text>Tema</Text>
         
         <TouchableOpacity onPress={() => setTheme('light')}>
           <Text>☀️ Claro</Text>
           {theme === 'light' && <Ionicons name="checkmark" />}
         </TouchableOpacity>
         
         <TouchableOpacity onPress={() => setTheme('dark')}>
           <Text>🌙 Escuro</Text>
           {theme === 'dark' && <Ionicons name="checkmark" />}
         </TouchableOpacity>
         
         <TouchableOpacity onPress={() => setTheme('auto')}>
           <Text>🔄 Automático</Text>
           {theme === 'auto' && <Ionicons name="checkmark" />}
         </TouchableOpacity>
       </View>
     );
   }

RESULTADO ESPERADO:
- Modo escuro completo
- Toggle funcional
- Preferência persistida
- Modo automático baseado no sistema
```

---

### [TASK-023] Internacionalização

**Área:** Frontend Mobile  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Implementar suporte a múltiplos idiomas (português e inglês) usando react-i18next, extraindo textos hardcoded e criando arquivos de tradução.

#### Prompt Sugerido

```
Implemente internacionalização (pt/en) no app React Native do Appunture.

REQUISITOS:

1. INSTALAR DEPENDÊNCIAS:
   
   npm install i18next react-i18next

2. CONFIGURAR i18n:
   
   i18n/config.ts:
   
   import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import * as Localization from 'expo-localization';
   
   import pt from './locales/pt.json';
   import en from './locales/en.json';
   
   const LANGUAGE_KEY = 'app_language';
   
   i18n
     .use(initReactI18next)
     .init({
       resources: {
         pt: { translation: pt },
         en: { translation: en },
       },
       lng: Localization.locale.split('-')[0], // 'pt' ou 'en'
       fallbackLng: 'pt',
       interpolation: {
         escapeValue: false,
       },
     });
   
   // Carregar idioma salvo
   AsyncStorage.getItem(LANGUAGE_KEY).then(lang => {
     if (lang) i18n.changeLanguage(lang);
   });
   
   export default i18n;

3. CRIAR ARQUIVOS DE TRADUÇÃO:
   
   i18n/locales/pt.json:
   
   {
     "common": {
       "welcome": "Bem-vindo",
       "loading": "Carregando...",
       "error": "Erro",
       "success": "Sucesso",
       "cancel": "Cancelar",
       "save": "Salvar"
     },
     "auth": {
       "login": "Entrar",
       "logout": "Sair",
       "email": "Email",
       "password": "Senha",
       "forgotPassword": "Esqueci minha senha"
     },
     "points": {
       "title": "Pontos de Acupuntura",
       "search": "Buscar pontos...",
       "addToFavorites": "Adicionar aos favoritos",
       "details": "Detalhes do Ponto"
     }
   }
   
   i18n/locales/en.json:
   
   {
     "common": {
       "welcome": "Welcome",
       "loading": "Loading...",
       "error": "Error",
       "success": "Success",
       "cancel": "Cancel",
       "save": "Save"
     },
     "auth": {
       "login": "Sign In",
       "logout": "Sign Out",
       "email": "Email",
       "password": "Password",
       "forgotPassword": "Forgot password"
     },
     "points": {
       "title": "Acupuncture Points",
       "search": "Search points...",
       "addToFavorites": "Add to favorites",
       "details": "Point Details"
     }
   }

4. USAR NOS COMPONENTES:
   
   app/login.tsx:
   
   import { useTranslation } from 'react-i18next';
   
   export default function LoginScreen() {
     const { t } = useTranslation();
     
     return (
       <View>
         <Text>{t('common.welcome')}</Text>
         <TextInput placeholder={t('auth.email')} />
         <TextInput placeholder={t('auth.password')} />
         <Button title={t('auth.login')} />
       </View>
     );
   }

5. SELETOR DE IDIOMA:
   
   app/(tabs)/profile.tsx:
   
   import { useTranslation } from 'react-i18next';
   
   export default function ProfileScreen() {
     const { i18n } = useTranslation();
     
     const changeLanguage = async (lang: string) => {
       await i18n.changeLanguage(lang);
       await AsyncStorage.setItem('app_language', lang);
     };
     
     return (
       <View>
         <Text>Idioma / Language</Text>
         
         <TouchableOpacity onPress={() => changeLanguage('pt')}>
           <Text>🇧🇷 Português</Text>
           {i18n.language === 'pt' && <Ionicons name="checkmark" />}
         </TouchableOpacity>
         
         <TouchableOpacity onPress={() => changeLanguage('en')}>
           <Text>🇺🇸 English</Text>
           {i18n.language === 'en' && <Ionicons name="checkmark" />}
         </TouchableOpacity>
       </View>
     );
   }

RESULTADO ESPERADO:
- Suporte a português e inglês
- Seletor de idioma funcional
- Preferência persistida
- Textos centralizados em arquivos JSON
```

---

### [TASK-024] Histórico de Buscas

**Área:** Frontend Mobile  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Implementar histórico de buscas salvando queries no SQLite, exibindo sugestões na tela de busca, com opção de limpar histórico.

#### Prompt Sugerido

```
Implemente histórico de buscas no app React Native do Appunture.

REQUISITOS:

1. ATUALIZAR DATABASE SERVICE:
   
   services/database.ts:
   
   export const databaseService = {
     // ... métodos existentes
     
     async saveSearch(query: string) {
       const db = await this.getDb();
       
       // Evitar duplicatas recentes
       await db.runAsync(
         'DELETE FROM search_history WHERE query = ? AND timestamp > ?',
         [query, Date.now() - 86400000] // 24h
       );
       
       await db.runAsync(
         'INSERT INTO search_history (query, timestamp) VALUES (?, ?)',
         [query, Date.now()]
       );
       
       // Limitar a 50 entradas
       await db.runAsync(
         'DELETE FROM search_history WHERE id NOT IN (SELECT id FROM search_history ORDER BY timestamp DESC LIMIT 50)'
       );
     },
     
     async getSearchHistory(limit: number = 10): Promise<string[]> {
       const db = await this.getDb();
       const rows = await db.getAllAsync<{query: string}>(
         'SELECT DISTINCT query FROM search_history ORDER BY timestamp DESC LIMIT ?',
         [limit]
       );
       return rows.map(r => r.query);
     },
     
     async clearSearchHistory() {
       const db = await this.getDb();
       await db.runAsync('DELETE FROM search_history');
     },
   };

2. ATUALIZAR TELA DE BUSCA:
   
   app/(tabs)/search.tsx:
   
   export default function SearchScreen() {
     const [searchQuery, setSearchQuery] = useState('');
     const [searchHistory, setSearchHistory] = useState<string[]>([]);
     
     useEffect(() => {
       loadSearchHistory();
     }, []);
     
     const loadSearchHistory = async () => {
       const history = await databaseService.getSearchHistory();
       setSearchHistory(history);
     };
     
     const handleSearch = async (query: string) => {
       if (query.trim()) {
         await databaseService.saveSearch(query);
         // Executar busca...
         setSearchQuery(query);
       }
     };
     
     const clearHistory = async () => {
       await databaseService.clearSearchHistory();
       setSearchHistory([]);
     };
     
     return (
       <View>
         <TextInput
           placeholder="Buscar pontos..."
           value={searchQuery}
           onChangeText={setSearchQuery}
           onSubmitEditing={() => handleSearch(searchQuery)}
         />
         
         {searchQuery === '' && searchHistory.length > 0 && (
           <View style={styles.historyContainer}>
             <View style={styles.historyHeader}>
               <Text style={styles.historyTitle}>Buscas Recentes</Text>
               <TouchableOpacity onPress={clearHistory}>
                 <Text style={styles.clearButton}>Limpar</Text>
               </TouchableOpacity>
             </View>
             
             {searchHistory.map((item, index) => (
               <TouchableOpacity
                 key={index}
                 style={styles.historyItem}
                 onPress={() => handleSearch(item)}
               >
                 <Ionicons name="time-outline" size={20} />
                 <Text style={styles.historyText}>{item}</Text>
               </TouchableOpacity>
             ))}
           </View>
         )}
         
         {/* Resultados da busca */}
       </View>
     );
   }

RESULTADO ESPERADO:
- Histórico de buscas salvo
- Sugestões exibidas na busca
- Opção de limpar histórico
- Limite de 50 entradas
```

---

### [TASK-025] Paginação Cursor-Based

**Área:** Backend  
**Estimativa:** 5 story points (1 semana)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Implementar paginação nativa do Firestore usando cursores, com parâmetros `?cursor=` e `?limit=`, retornando metadados de paginação (hasNext, nextCursor).

#### Prompt Sugerido

```
Implemente paginação cursor-based no backend Spring Boot do Appunture.

REQUISITOS:

1. CRIAR DTO DE PAGINAÇÃO:
   
   dto/PageResponse.java:
   
   @Data
   @Builder
   public class PageResponse<T> {
     private List<T> data;
     private String nextCursor;
     private boolean hasNext;
     private int limit;
     private long total;
   }

2. IMPLEMENTAR NO SERVICE:
   
   service/FirestorePointService.java:
   
   public PageResponse<FirestorePoint> getPointsPaginated(String cursor, int limit) {
     try {
       CollectionReference collection = firestore.collection("points");
       Query query = collection.orderBy("createdAt", Query.Direction.DESCENDING).limit(limit + 1);
       
       // Se cursor fornecido, começar depois dele
       if (cursor != null) {
         DocumentSnapshot lastDoc = firestore.collection("points").document(cursor).get().get();
         query = query.startAfter(lastDoc);
       }
       
       List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();
       
       boolean hasNext = docs.size() > limit;
       if (hasNext) {
         docs = docs.subList(0, limit);
       }
       
       List<FirestorePoint> points = docs.stream()
         .map(doc -> doc.toObject(FirestorePoint.class))
         .collect(Collectors.toList());
       
       String nextCursor = hasNext && !docs.isEmpty() 
         ? docs.get(docs.size() - 1).getId()
         : null;
       
       return PageResponse.<FirestorePoint>builder()
         .data(points)
         .nextCursor(nextCursor)
         .hasNext(hasNext)
         .limit(limit)
         .build();
         
     } catch (Exception e) {
       throw new RuntimeException("Error paginating points", e);
     }
   }

3. ATUALIZAR CONTROLLER:
   
   controller/FirestorePointController.java:
   
   @GetMapping
   public ResponseEntity<PageResponse<PointResponse>> getPoints(
     @RequestParam(required = false) String cursor,
     @RequestParam(defaultValue = "20") int limit
   ) {
     PageResponse<FirestorePoint> page = firestorePointService.getPointsPaginated(cursor, limit);
     
     PageResponse<PointResponse> response = PageResponse.<PointResponse>builder()
       .data(page.getData().stream().map(this::toResponse).collect(Collectors.toList()))
       .nextCursor(page.getNextCursor())
       .hasNext(page.isHasNext())
       .limit(page.getLimit())
       .build();
     
     return ResponseEntity.ok(response);
   }

4. USAR NO FRONTEND:
   
   stores/pointsStore.ts:
   
   export const usePointsStore = create<PointsState>((set, get) => ({
     points: [],
     nextCursor: null,
     hasMore: true,
     loading: false,
     
     fetchPoints: async (refresh = false) => {
       const { nextCursor, hasMore, loading } = get();
       
       if (loading || (!refresh && !hasMore)) return;
       
       set({ loading: true });
       
       try {
         const cursor = refresh ? null : nextCursor;
         const response = await api.getPointsPaginated(cursor, 20);
         
         set({
           points: refresh ? response.data : [...get().points, ...response.data],
           nextCursor: response.nextCursor,
           hasMore: response.hasNext,
           loading: false,
         });
       } catch (error) {
         console.error('Failed to fetch points', error);
         set({ loading: false });
       }
     },
     
     loadMore: () => get().fetchPoints(false),
     refresh: () => get().fetchPoints(true),
   }));

RESULTADO ESPERADO:
- Paginação eficiente com cursores
- hasNext e nextCursor retornados
- Frontend carrega mais dados no scroll
- Performance melhorada
```

---

### [TASK-026] Documentação Completa

**Área:** Documentação  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 50%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Expandir documentação do projeto incluindo setup completo, variáveis de ambiente, processo de deploy, troubleshooting, e CONTRIBUTING.md.

#### Prompt Sugerido

```
Complete a documentação do projeto Appunture.

REQUISITOS:

1. EXPANDIR README.md:
   
   Adicionar seções:
   
   ## 🚀 Setup Completo
   
   ### Pré-requisitos
   - Node.js 18+
   - Java 17+
   - Docker Desktop
   - Conta Firebase
   
   ### Configuração Firebase
   1. Criar projeto no Firebase Console
   2. Baixar service account key
   3. Salvar em `backend-java/src/main/resources/firebase-service-account.json`
   
   ### Variáveis de Ambiente
   
   Backend (`application.yml`):
   ```yaml
   firebase:
     service-account: classpath:firebase-service-account.json
     project-id: your-project-id
   ```
   
   Frontend (`app.json`):
   ```json
   {
     "expo": {
       "extra": {
         "firebaseApiKey": "YOUR_API_KEY"
       }
     }
   }
   ```
   
   ## 📦 Deploy
   
   ### Backend (Google Cloud Run)
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```
   
   ### Frontend (EAS Build)
   ```bash
   eas build --platform android
   eas build --platform ios
   ```
   
   ## 🐛 Troubleshooting
   
   ### Firebase Authentication Error
   - Verificar service account key
   - Conferir permissões no IAM
   
   ### Build Failed
   - Limpar cache: `mvn clean` ou `npm cache clean --force`

2. CRIAR CONTRIBUTING.md:
   
   # Contribuindo para Appunture
   
   ## Fluxo de Trabalho
   
   1. Fork o repositório
   2. Crie uma branch: `git checkout -b feature/minha-feature`
   3. Commit: `git commit -m "feat: minha feature"`
   4. Push: `git push origin feature/minha-feature`
   5. Abra um Pull Request
   
   ## Padrões de Código
   
   - Backend: Google Java Style Guide
   - Frontend: Airbnb React/React Native Style Guide
   - Commits: Conventional Commits
   
   ## Testes
   
   Todos os PRs devem incluir testes:
   - Backend: `mvn test`
   - Frontend: `npm test`

3. CRIAR API.md:
   
   # Documentação da API
   
   Base URL: `https://api.appunture.com`
   
   ## Autenticação
   
   Todas as rotas requerem Firebase Auth Token:
   ```
   Authorization: Bearer <firebase-token>
   ```
   
   ## Endpoints
   
   ### GET /api/points
   Lista pontos de acupuntura
   
   **Parâmetros:**
   - `cursor` (opcional): Cursor de paginação
   - `limit` (opcional): Limite de resultados (default: 20)
   
   **Resposta:**
   ```json
   {
     "data": [...],
     "nextCursor": "abc123",
     "hasNext": true
   }
   ```

RESULTADO ESPERADO:
- Documentação completa e clara
- Setup passo a passo
- Troubleshooting comum
- Contribuição facilitada
```

---

### [TASK-027] Backup e Disaster Recovery

**Área:** Backend  
**Estimativa:** 2 story points (2 dias)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Documentar estratégia de backup do Firestore, configurar exports automáticos para Google Cloud Storage, e testar processo de restore.

#### Prompt Sugerido

```
Documente e configure estratégia de backup para o projeto Appunture.

REQUISITOS:

1. CRIAR BACKUP.md:
   
   # Estratégia de Backup e Disaster Recovery
   
   ## Backup Automático (Firestore)
   
   O Firestore possui backup automático integrado, mas configuramos exports adicionais.
   
   ### Configuração de Exports
   
   ```bash
   # Cloud Scheduler para export diário
   gcloud scheduler jobs create http firestore-export \
     --schedule="0 2 * * *" \
     --uri="https://firestore.googleapis.com/v1/projects/PROJECT_ID:exportDocuments" \
     --message-body='{
       "outputUriPrefix": "gs://BUCKET_NAME/firestore-backups",
       "collectionIds": []
     }'
   ```
   
   ## RTO e RPO
   
   - **RTO (Recovery Time Objective):** 2 horas
   - **RPO (Recovery Point Objective):** 24 horas
   
   ## Processo de Restore
   
   ### Restore Completo
   ```bash
   gcloud firestore import gs://BUCKET_NAME/firestore-backups/EXPORT_FOLDER
   ```
   
   ### Restore de Collection Específica
   ```bash
   gcloud firestore import \
     --collection-ids=points,symptoms \
     gs://BUCKET_NAME/firestore-backups/EXPORT_FOLDER
   ```
   
   ## Testes de Restore
   
   - Frequência: Trimestral
   - Ambiente: Staging
   - Validação: Integridade de dados

2. CONFIGURAR EXPORTS NO GCP:
   
   Criar Cloud Function para exports:
   
   ```javascript
   // functions/scheduled-export.js
   const { Firestore } = require('@google-cloud/firestore');
   
   exports.scheduledFirestoreExport = async (req, res) => {
     const client = new Firestore();
     const bucket = 'gs://your-backup-bucket';
     
     try {
       const [response] = await client.exportDocuments({
         outputUriPrefix: bucket,
         collectionIds: []
       });
       console.log(`Operation Name: ${response.name}`);
       res.status(200).send('Export started');
     } catch (error) {
       console.error(error);
       res.status(500).send(error);
     }
   };
   ```

RESULTADO ESPERADO:
- Estratégia de backup documentada
- Exports automáticos configurados
- Processo de restore testado
- RTO/RPO definidos
```

---

### [TASK-028] Otimização de Bundle Size

**Área:** Frontend Mobile  
**Estimativa:** 1 story point (1 dia)  
**Status Atual:** 0%  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Nenhuma

#### Descrição
Analisar e otimizar tamanho do bundle do app React Native, removendo dependências não utilizadas e configurando code splitting.

#### Prompt Sugerido

```
Otimize bundle size do app React Native do Appunture.

REQUISITOS:

1. ANALISAR DEPENDÊNCIAS:
   
   npm install -g depcheck
   depcheck
   
   # Remover dependências não utilizadas
   npm uninstall <package-name>

2. ANALISAR BUNDLE SIZE:
   
   # Gerar bundle report
   npx expo export --dump-assetmap
   
   # Analisar tamanho das dependências
   npm install -g bundle-phobia-cli
   bundle-phobia [package-name]

3. OTIMIZAÇÕES:
   
   # Import apenas o necessário
   
   # ❌ Errado
   import _ from 'lodash';
   
   # ✅ Correto
   import debounce from 'lodash/debounce';
   
   # ❌ Errado
   import { Ionicons } from '@expo/vector-icons';
   
   # ✅ Correto (tree-shaking)
   import Ionicons from '@expo/vector-icons/Ionicons';

4. LAZY LOADING:
   
   # Carregar telas sob demanda
   const PointDetails = lazy(() => import('./point-details'));

5. REDUZIR IMAGENS:
   
   # Usar formatos otimizados
   - PNG → WebP
   - Comprimir imagens
   - Usar CDN para assets

RESULTADO ESPERADO:
- Bundle size reduzido em 20%+
- Dependências não utilizadas removidas
- Imports otimizados
- Análise documentada
```

---

## 📊 Resumo de Progresso

### Estatísticas Atualizadas (12/11/2025)

**Tasks Concluídas:** 4/28 (14.3%)
- ✅ TASK-004: CORS configurado corretamente
- ✅ TASK-005: Logs estruturados JSON + Correlation ID
- ✅ TASK-007: Rate limiting com Bucket4j
- ✅ TASK-008: Galeria de imagens múltiplas

**Tasks em Progresso:** 2/28 (7.1%)
- 🔄 TASK-001: Testes backend (40% - 45 testes, 100% passando)
- 🔄 TASK-006: Validação de email (70% - bloqueio implementado)

**Story Points Concluídos:** 13.5/113.5 (11.9%)
- Sprint 1 (Alta): 9/40.5 SP concluídos (22.2%)
- Sprint 2 (Média): 5/41 SP concluídos (12.2%)
- Sprint 3 (Baixa): 0/32 SP concluídos (0%)

**Métricas de Qualidade:**
- Backend: 45 testes unitários, 100% passando ✅
- Cobertura de testes: ~15% (meta: 60%)
- Frontend: ImageGallery component com testes ✅
- Zero falhas de build ✅

**Próximas Prioridades:**
1. 🔴 TASK-001: Completar testes backend (restantes 60%)
2. 🔴 TASK-002: Implementar testes frontend (0%)
3. 🔴 TASK-003: Completar sincronização offline (60%)
4. 🔴 TASK-006: Endpoint de reenvio de email (30%)

**Estimativa de Conclusão:**
- Sprint 1 restante: ~3 semanas
- MVP completo: ~8 semanas (de ~9 semanas originais)

---

## 📚 Referências

**Documentos do Projeto:**
- [ANALISE_ATUALIZADA.md](./ANALISE_ATUALIZADA.md) - Análise completa do projeto (1147 linhas)
- [DIAGNOSTICO_COMPLETO.md](./DIAGNOSTICO_COMPLETO.md) - Diagnóstico técnico detalhado (1280 linhas)
- [RESUMO_TRABALHO_REALIZADO.md](./RESUMO_TRABALHO_REALIZADO.md) - Resumo do trabalho (328 linhas)
- [IMPLEMENTACAO_T01_T02_T04_T05.md](./IMPLEMENTACAO_T01_T02_T04_T05.md) - Relatório Sprint 1

**Commits Relevantes:**
- `49f94a4` - feat: add image gallery component with upload and delete functionality (T08)
- Implementações de T04, T05, T06, T07 em commits anteriores

---

**Última Atualização:** 12 de novembro de 2025  
**Próxima Revisão:** Após conclusão de Sprint 1  
**Contato:** Equipe Appunture / TCC


