# 🗂️ Plano de Tasks — 24/11/2025

> Estrutura dividida por área (Backend, Frontend, Integração) e prioridade (Alta, Média, Baixa). Cada item contém subtarefas objetivas. Prazo sugerido: 2 sprints (3 semanas cada).

## 📌 Convenções de Prioridade

| Prioridade | Critério                                                         | Janelas sugeridas |
| ---------- | ---------------------------------------------------------------- | ----------------- |
| 🔥 Alta    | Bloqueia release, corrige gap crítico entre camadas ou segurança | Sprint atual      |
| ⚙️ Média   | Melhora UX, desempenho ou reduz débito técnico relevante         | Próxima sprint    |
| 💤 Baixa   | Incrementos opcionais / nice-to-have                             | Backlog aberto    |

---

## 🛠️ Backend

### 🔥 Alta (Backend)

1. **Cobertura de Testes 60%+**
   - [ ] Criar suíte `@SpringBootTest` para `FirestorePointController`, `FirestoreSymptomController`, `FirestoreAuthController` cobrindo rotas felizes e erros.
   - [ ] Adicionar testes unitários para `FirestoreUserService`, `FirebaseStorageService` (mock StorageClient) e `LoggingEmailService`.
   - [ ] Habilitar relatório JaCoCo no pipeline e publicar badge em `README.md`.
2. **Seed de Dados Oficiais**
   - [ ] Implementar `CommandLineRunner` ou endpoint protegido em `FirestoreAdminController` que injeta: 30 pontos, 20 sintomas, usuário admin, 5 relacionamentos.
   - [ ] Criar scripts `.json`/`.csv` versionados em `src/main/resources/seed/`.
   - [ ] Documentar rotina no `README.md` + adicionar passo no checklist de deploy.
3. **Pipeline Automatizado**
   - [ ] Adicionar workflow GitHub Actions (build + testes) acionado em `push/pull_request`.
   - [ ] Configurar job opcional de deploy para Cloud Run usando substituição de variáveis.
   - [ ] Publicar artefatos (relatórios de testes/logs) para troubleshooting.

### ⚙️ Média (Backend)

1. **Dashboards & Alertas**
   - [ ] Provisionar dashboard Grafana (ou alternativa) consumindo `/actuator/prometheus`.
   - [ ] Criar alertas mínimos (latência, erro 5xx, bucket rate-limit).
   - [ ] Documentar URLs e procedimentos em `DECISOES_ARQUITETURA.md`.
2. **Workflow de Imagens**
   - [ ] Acrescentar auditoria/logs ao endpoint `/points/{id}/images` (quem adicionou/removeu).
   - [ ] Disponibilizar operação de geração de thumbnails (pode ser Cloud Function) e salvar referência em `imageUrls`.

### 💤 Baixa (Backend)

1. **Documentação OpenAPI enriquecida**
   - [ ] Adicionar schemas de request/response com exemplos (`@Schema(example=...)`).
   - [ ] Exportar coleção Postman/Insomnia alinhada com novas rotas.

---

## 📱 Frontend Mobile

### 🔥 Alta (Frontend)

1. **Modo Admin + RBAC visual**
   - [ ] Injetar claims/role no `authStore` (já vem do perfil) e esconder rotas `admin` quando role ≠ `ADMIN`.
   - [ ] Criar stack/tab `admin/` com cards para CRUD de pontos/sintomas e painel de usuários (consome `/admin/**`).
   - [ ] Cobrir fluxo com testes Jest (mock `apiService`).
2. **Galeria & Upload de Imagens**
   - [ ] Atualizar tipos (`Point.imageUrls`) e componentes (`PointCard`, `point-details.tsx`) para exibir múltiplas imagens com swipe/zoom.
   - [ ] Implementar uploader (camera/galeria) usando `apiService.uploadFile`, enviando `folder`=`points/{id}` e exibindo progresso/erros.
   - [ ] Conectar com endpoint `/points/{id}/images` para persistir URLs.
3. **Mapa Corporal Dinâmico**
   - [ ] Consumir `coordinates` da API e renderizar pontos via SVG posicionável.
   - [ ] Adicionar estados de carregamento, zoom, filtros por meridiano/região.
   - [ ] Salvar coordenadas offline junto com cache de pontos.

### ⚙️ Média (Frontend)

1. **Filtros e Estatísticas Avançadas**
   - [ ] Expor UI para `getPointsByMeridian`, `getPointsBySymptom`, `getPopularPoints` com chips/filtros persistidos.
   - [ ] Criar tela "Insights" com gráficos básicos usando `/points/stats` e `/symptoms/stats`.
2. **Perfil Completo**
   - [ ] Permitir edição de telefone, profissão, foto do usuário e refletir `profileImageUrl` vindo do backend.
   - [ ] Mostrar status de verificação de e-mail + botão para `resendVerificationEmail`.
3. **Limpeza de legado**
   - [ ] Remover métodos obsoletos `apiService.login/register` e endpoints inexistentes (`/notes`, `/search/history`).
   - [ ] Atualizar README e stores para refletir autenticação 100% Firebase.

### 💤 Baixa (Frontend)

1. **UX Consistente**
   - [ ] Consolidar design tokens (cores, tipografia) para SyncBanner, tabs e screens.
   - [ ] Adicionar mensagens localizadas PT-BR para erros comuns (estado vazio, falha de rede).

---

## 🔗 Integração / Contratos

### 🔥 Alta (Integração)

1. **Notas & Histórico — decisão**
   - [ ] Definir se backend Java implementará `/notes` e `/search/history` (especificar payload, segurança) ou se o frontend removerá a funcionalidade.
   - [ ] Caso mantenha, criar controller dedicado e atualizar `apiService`; caso contrário, apagar chamadas e dados locais legados.
2. **Favoritos eficientes**
   - [ ] Implementar endpoint paginado `/auth/favorites` que retorna objetos completos (evita baixar todos os pontos).
   - [ ] Atualizar `pointsStore` para usar o novo endpoint e sincronizar com cache local.

### ⚙️ Média (Integração)

1. **Uploads alinhados**
   - [ ] Padronizar contrato do `FormData` com campo `folder` obrigatório e documentação sobre tipos permitidos/content-type.
   - [ ] Ajustar tratamento de erro no app exibindo mensagem do backend (tamanho inválido, tipo proibido).
2. **Coordenadas & Seeds**
   - [ ] Após seed, disponibilizar endpoint auxiliar `/points/coordinates-template` ou export `.json` para alimentar o editor do body map.
   - [ ] Criar checklist de sincronização coordenada (quando backend atualizar, frontend aplica).

### 💤 Baixa (Integração)

1. **Documentação compartilhada**
   - [ ] Criar seção "Contratos API" em `frontend-mobile/README.md` com tabela rota>Status>Payload.
   - [ ] Automatizar geração do changelog de endpoints (pode reaproveitar OpenAPI + script).
