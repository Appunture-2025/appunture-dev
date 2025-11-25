# 📊 Análise Produto Appunture — 24/11/2025

## Situação Atual do Backend

### Tecnologias Utilizadas (Backend)

- **Java 17 + Spring Boot 3.2.5** com stack modular (config, controller, service, repository, dto).
- **Firebase** (Auth, Firestore, Storage) como backend-as-a-service principal e deploy direcionado ao **Cloud Run**.
- **MapStruct**, **Bucket4j**, **Logback JSON**, **Micrometer/Prometheus** e **OpenAPI 3** para DTOs, rate limiting, observabilidade e documentação.
- Pipelines descritos em `cloudbuild.yaml` e contêiner único via `Dockerfile`.

### Funcionalidades Já Implementadas (Backend)

- **Autenticação** com validação de e-mail verificado, sync de perfis e favoritos (`FirestoreAuthController`).
- **CRUD completo** de pontos e sintomas, incluindo filtros por código, meridiano, categoria, tags, severidade e buscas (`FirestorePointController`, `FirestoreSymptomController`).
- **Administração** com gerenciamento de usuários, seeds e estatísticas (`FirestoreAdminController`).
- **Observabilidade e segurança**: CORS por ambiente, rate limiting, correlation-id filter, logs estruturados e 57 testes automatizados cobrindo filtros e serviços críticos.
- **Storage** pronto para uploads/URLs assinadas (Firebase Storage Controller) e health checks detalhados.

### Funcionalidades Pendentes (Backend)

- **Cobertura de testes** ainda ~20%; faltam integrações para controllers de Admin/Storage/Health e serviços como `FirestoreUserService`.
- **Seeds e dados de demonstração** ainda não implementados; dependem do plano descrito em `TODO_PLANO_FINALIZACAO.md`.
- **Documentação OpenAPI** precisa exemplos e schemas finais (itens pendentes no plano de finalização).
- **Monitoring avançado/alertas** não automatizados (Prometheus expõe métricas, mas não há dashboards configurados).
- **CI/CD** descrito, porém ausência de pipeline GitHub Actions executável no repo.

### Problemas Técnicos ou Gargalos (Backend)

- **Testes**: meta de cobertura >60% não foi atingida, o que atrasa homologação.
- **Dados**: ausência de seed dificulta QA/frontend ao exigir dados manuais no Firestore.
- **Processos**: falta pipeline automatizado garante risco de regressões antes do deploy em Cloud Run.
- **Storage**: apesar do serviço pronto, não há fluxo completo validado com o frontend (campo `imageUrls` nunca preenchido a partir do app).

## Situação Atual do Frontend Mobile

### Tecnologias Utilizadas (Frontend)

- **React Native 0.79 / Expo SDK 53** com Expo Router, TypeScript e Jest/RTL.
- **Estado** via Zustand (`authStore`, `pointsStore`, `symptomsStore`, `syncStore`).
- **Offline-first** com SQLite/WA-SQLite e fila de sincronização (`services/database.ts`, `SYNC_IMPLEMENTATION_COMPLETE.md`).
- **Firebase JS SDK** para autenticação e storage client-side.

### Funcionalidades Já Implementadas (Frontend)

- Flows de **login/registro** usando Firebase, sincronização do perfil e favoritos.
- **Busca de pontos e sintomas**, detalhe de ponto, body map básico, chatbot local e seção de favoritos.
- **Fila offline** completa (favoritos, entidades, imagens) com banner, tela `sync-status` e testes e2e.
- **Components reutilizáveis** (cards, banners, body map, search bar) e abordagem offline-first (retry exponencial, conflict resolution, indicadores visuais).

### Funcionalidades Pendentes (Frontend)

- **Filtros avançados**: UI carece de busca por meridiano/sintoma combinados, popular e histórico persistente (métodos existem mas não expostos).
- **Admin mode** inexistente: app não diferencia roles para acessar operações `/points`/`/symptoms` administrativas ou `/admin/**`.
- **Gestão de imagens**: tela de ponto usa `image_url` único, não renderiza múltiplas `imageUrls` nem faz upload usando `/storage/upload`.
- **Mapa corporal**: coordenadas continuam hardcoded/local; não consome `coordinates` do Firestore.
- **Notas pessoais e histórico de busca**: stores e endpoints locais existem (`createNote`, `/search/history`), porém backend não provê endpoints equivalentes.
- **UX**: telas de perfil e sincronização usam estilos distintos; falta modo escuro e responsividade descritos em README mas não implementados.

### Problemas de Usabilidade ou Inconsistências Visuais

- Navegação principal mistura telas antigas (`app/login.tsx`) e novas (`app/login_new.tsx`), causando caminhos duplicados.
- Banner/Tela de sync seguem design Material, enquanto tabs usam ícones simples sem tokens de design; não há guideline unificado.
- Body map não mostra estados de carregamento e possui pontos fixos (não responde aos dados reais do backend).
- Falta feedback quando filtros avançados retornam vazio; mensagens de erro genéricas "Failed to load" permanecem em inglês.

## Inconsistências entre Backend e Frontend

1. **Administração**: Backend oferece CRUD completo com RBAC e seeds; frontend não possui qualquer UI para roles ADMIN nem validação de claims.
2. **Notas e histórico**: Frontend chama `/notes` e `/search/history`, mas não existem controllers equivalentes no backend Java (resto legado do Node antigo).
3. **Login REST**: `apiService.login/register` envia requisições para `/auth/login`/`/auth/register`, porém autenticação real usa somente Firebase ID token. Funções permanecem mortas ou caso alguém tente usá-las falharão.
4. **Imagens**: Backend aceita múltiplas `imageUrls` por ponto, upload com pasta parametrizada e reorder, enquanto frontend aceita apenas um `image_url` e não expõe upload via storage.
5. **Coordenadas de pontos**: Backend permite atualizar/consultar `coordinates`, mas BodyMap no app não consome esses dados; pontos continuam fixos.
6. **Pontos populares / estatísticas**: Endpoints prontos (`/points/popular`, `/points/stats`, `/symptoms/stats`), enquanto frontend ainda calcula meridianos localmente (`getMeridians()` faz fetch completo e agrupa client-side) e não mostra dashboards.
7. **Favoritos sincronizados**: Backend retorna lista em `FirestoreUser.favoritePoints`, mas app sempre baixa todos os pontos e filtra por IDs, onerando rede e sofrendo em bases grandes.
8. **Storage**: Backend exige `folder` para upload e validação de content-type, mas frontend `uploadFile` não envia `folder`, nem trata erros específicos.
9. **Campos do perfil**: Backend armazena `phoneNumber`, `profileImageUrl`, `role`, `enabled`; UI só mostra nome/email e não permite editar telefone/foto.

## Recomendações Gerais

- Consolidar autenticação exclusivamente via Firebase (remover endpoints legados no app e ajustar documentação).
- Priorizar camadas de dados compartilhadas (coordenadas, imagens, estatísticas) antes de novas features visuais.
- Criar trilha de tarefas que alinhe três frentes: **backend (qualidade e dados)**, **frontend (UX funcional)** e **integração (contratos e RBAC)**.

> O arquivo `TASKS_24_NOV_2025.md` (vide mesmo diretório) organiza as pendências priorizadas por área e descreve subtarefas objetivas para execução.
