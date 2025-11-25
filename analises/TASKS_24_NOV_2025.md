# 🗂️ Plano de Tasks — 24/11/2025 (revisto em 25/11)

> Estrutura dividida por área (Backend, Frontend, Integração) e prioridade (Alta, Média, Baixa). Cada item agora possui objetivo claro, definição de pronto e estado atual para ajudar no plano de 2 semanas.

## ✅ Status geral — 25/11/2025

### Concluído desde a última revisão

- Backend Java migrado 100% (controllers, serviços, autenticação, rate limit).
- Correções de configuração (YAML, metadata, filtros de rate-limit) aplicadas e testadas.
- Documentação técnica consolidada (`DIAGNOSTICO_COMPLETO.md`, `STATUS_FINAL_MIGRACAO.md`).

### Em andamento

- Ajustes de observabilidade e alertas (métricas expostas, falta dashboard).
- Correções em stores do app móvel (role/claims em desenvolvimento).

### Pendentes críticos para o MVP

- Testes (backend + frontend) e seed oficial.
- Fluxo admin no app mobile, galeria de assets locais e decisão sobre notas/histórico.

## 📌 Convenções de Prioridade

| Prioridade | Critério                                                         | Janela sugerida    |
| ---------- | ---------------------------------------------------------------- | ------------------ |
| 🔥 Alta    | Bloqueia release, corrige gap crítico entre camadas ou segurança | Próximas 2 semanas |
| ⚙️ Média   | Melhora UX, desempenho ou reduz débito técnico relevante         | Sprint seguinte    |
| 💤 Baixa   | Incrementos opcionais / nice-to-have                             | Backlog aberto     |

## 📊 Painel rápido

| Área            | % Concluído | Itens críticos abertos    | Observações                                         |
| --------------- | ----------- | ------------------------- | --------------------------------------------------- |
| Backend         | 70%         | Testes, seed, CI/CD       | Código estável; faltam validações finais            |
| Frontend Mobile | 55%         | Admin, galeria, mapa      | UI implementada, mas faltam features chave e testes |
| Integração      | 50%         | Contratos notas/favoritos | Backend pronto, pendem decisões e ajustes de UX     |

---

## 🛠️ Backend

### 🔥 Alta (Backend)

1. **Cobertura de Testes ≥60%** _(Status: Não iniciado · Responsável: Backend · Esforço: 3 dias)_

   - **Objetivo:** Garantir confiança mínima no backend antes da entrega.
   - **Definição de pronto:** pipeline reportando ≥60% no JaCoCo + badge no `README.md` + testes `@SpringBootTest` para controladores principais.
   - **Subtarefas:**
     - [ ] Criar suíte `@SpringBootTest` para `FirestorePointController`, `FirestoreSymptomController`, `FirestoreAuthController` cobrindo rotas felizes/erros.
     - [ ] Adicionar testes unitários para `FirestoreUserService`, `FirebaseStorageService` (mock StorageClient) e `LoggingEmailService`.
     - [ ] Habilitar relatório JaCoCo (local + CI) e publicar badge no `README.md`.

2. **Seed de Dados Oficiais** _(Status: Em preparação · Responsável: Backend · Esforço: 1,5 dia)_

   - **Objetivo:** disponibilizar dataset consistente para demo, QA e sincronização com o app.
   - **Definição de pronto:** `CommandLineRunner` ou endpoint protegido injeta 30 pontos, 20 sintomas, usuário admin e 5 relacionamentos usando arquivos versionados.
   - **Subtarefas:**
     - [ ] Criar scripts `.json`/`.csv` em `src/main/resources/seed/` com os dados oficiais.
     - [ ] Implementar runner/endpoint `FirestoreAdminController` para importar os arquivos.
     - [ ] Documentar rotina no `README.md` e checklist de deploy.

3. **Pipeline Automatizado (GitHub Actions)** _(Status: Não iniciado · Responsável: DevOps) · Esforço: 1,5 dia)_
   - **Objetivo:** garantir build/test automatizado e opcionalmente deploy para Cloud Run.
   - **Definição de pronto:** workflow rodando em `push/pull_request`, com etapas de testes, relatório e job opcional de deploy.
   - **Subtarefas:**
     - [ ] Criar workflow (Java 17 + cache Maven) executando `mvn test` e publicando JaCoCo.
     - [ ] Adicionar job condicional de deploy para Cloud Run com substituição de variáveis/segredos.
     - [ ] Publicar artefatos (logs e relatórios) para troubleshooting.

### ⚙️ Média (Backend)

1. **Dashboards & Alertas** _(Status: Planejado · Esforço: 2 dias)_

   - [ ] Provisionar dashboard Grafana (ou alternativa) consumindo `/actuator/prometheus`.
   - [ ] Criar alertas mínimos (latência, erro 5xx, estouro do bucket rate-limit).
   - [ ] Documentar URLs e procedimentos em `DECISOES_ARQUITETURA.md`.

2. **Workflow de Imagens Auditável** _(Status: Pendente · Esforço: 1,5 dia)_
   - [ ] Acrescentar auditoria/logs ao endpoint `/points/{id}/images` (quem adicionou/removeu).
   - [ ] Disponibilizar geração de thumbnails (Cloud Function ou serviço dedicado) e salvar referência em `imageUrls`.

### 💤 Baixa (Backend)

1. **Documentação OpenAPI enriquecida** _(Status: Backlog)_
   - [ ] Adicionar schemas detalhados com `@Schema(example=...)` e exemplos por rota.
   - [ ] Exportar coleção Postman/Insomnia alinhada às rotas atuais.

---

## 📱 Frontend Mobile

### 🔥 Alta (Frontend)

1. **Modo Admin + RBAC visual** _(Status: Em andamento · Responsável: Mobile · Esforço: 3 dias)_

   - **Objetivo:** permitir que somente administradores acessem fluxos críticos e tenham UI dedicada.
   - **Definição de pronto:** `authStore` com claims/role econdicionando rotas/tabs, telas admin consumindo `/admin/**` e testes Jest cobrindo RBAC.
   - **Subtarefas:**
     - [ ] Persistir claims/role no `authStore` e esconder rotas `admin` quando `role ≠ ADMIN`.
     - [ ] Criar stack/tab `admin/` com cards para CRUD de pontos/sintomas e painel de usuários.
     - [ ] Cobrir fluxo com testes Jest (mock `apiService`).

2. **Galeria & Assets Embutidos** _(Status: Pendente · Esforço: 2,5 dias)_

   - [ ] Versionar o atlas de imagens do corpo/pontos dentro do bundle (`assets/body-map/**`) e mapear naming por `pointId`/meridiano.
   - [ ] Atualizar tipos (`Point.imageRefs`) e componentes (`PointCard`, `point-details.tsx`, `ImageGallery`) para consumir assets locais com swipe/zoom e fallback offline.
   - [ ] Sincronizar o body map com as coordenadas vindas da API para apontar para as imagens certas (sem chamadas de upload).

3. **Mapa Corporal Dinâmico** _(Status: Pendente · Esforço: 3 dias)_
   - [ ] Consumir `coordinates` da API e renderizar pontos via SVG posicionável.
   - [ ] Adicionar estados de carregamento, zoom e filtros por meridiano/região.
   - [ ] Salvar coordenadas offline junto com cache dos pontos.

### ⚙️ Média (Frontend)

1. **Filtros e Estatísticas Avançadas** _(Status: Backlog imediato)_

   - [ ] UI para `getPointsByMeridian`, `getPointsBySymptom`, `getPopularPoints` com chips persistentes.
   - [ ] Tela "Insights" com gráficos básicos usando `/points/stats` e `/symptoms/stats`.

2. **Perfil Completo** _(Status: Planejado)_

   - [ ] Edição de telefone, profissão, foto do usuário & sincronização de `profileImageUrl`.
   - [ ] Mostrar status de verificação de e-mail + botão `resendVerificationEmail`.

3. **Limpeza de legado** _(Status: Planejado)_
   - [ ] Remover métodos obsoletos (`apiService.login/register`) e chamadas para `/notes`, `/search/history`.
   - [ ] Atualizar README, stores e onboarding para refletir fluxo 100% Firebase.

### 💤 Baixa (Frontend)

1. **UX Consistente** _(Status: Backlog)_
   - [ ] Consolidar design tokens (cores, tipografia) para SyncBanner, tabs e principais screens.
   - [ ] Adicionar mensagens localizadas PT-BR para erros comuns (estado vazio, falha de rede, offline).

---

## 🔗 Integração / Contratos

### 🔥 Alta (Integração)

1. **Notas & Histórico — decisão** _(Status: Precisa de decisão · Esforço: 0,5 dia)_

   - [ ] Decidir se backend Java implementará `/notes` e `/search/history` ou se o frontend removerá a funcionalidade.
   - [ ] Caso mantenha, criar controller dedicado e atualizar `apiService`; caso contrário, remover chamadas e dados locais legados.

2. **Favoritos eficientes** _(Status: Pendente · Esforço: 1,5 dia)_
   - [ ] Implementar endpoint paginado `/auth/favorites` retornando objetos completos.
   - [ ] Atualizar `pointsStore` para consumir o endpoint e sincronizar com cache local.

### ⚙️ Média (Integração)

1. **Atlas de imagens alinhado** _(Status: Em análise)_

   - [ ] Definir convenção única (`pointId`, meridiano, versão) para referenciar assets embarcados no app e nas respostas da API.
   - [ ] Documentar no contrato como o frontend resolve o asset local a partir do payload sem depender de upload/URLs do backend.

2. **Coordenadas & Seeds** _(Status: Dependente do seed oficial)_
   - [ ] Após seed, disponibilizar endpoint `/points/coordinates-template` ou export `.json` para alimentar o editor do body map.
   - [ ] Criar checklist de sincronização coordenada (quando backend atualizar, frontend aplica).

### 💤 Baixa (Integração)

1. **Documentação compartilhada** _(Status: Backlog)_
   - [ ] Criar seção "Contratos API" em `frontend-mobile/README.md` com tabela rota>Status>Payload.
   - [ ] Automatizar geração do changelog de endpoints (pode reaproveitar OpenAPI + script).

---

## 🧮 Prognóstico para 2 semanas

- **Capacidade estimada:** ~10 dias úteis ⇒ ~60-70h efetivas.
- **Carga crítica:** ~6,5 dias (testes backend, seed, pipeline, admin flow, galeria de assets, decisão notas/favoritos). Cabe no prazo se as frentes trabalharem em paralelo.
- **Riscos:** indefinição sobre `/notes`/`/search/history`, falta de testes automatizados no mobile e tempo para QA integrado.
- **Plano sugerido:**
  1. Semana 1 → finalizar backend (testes, seed, pipeline) + decisão de contratos.
  2. Semana 2 → concluir features mobile críticas (admin, galeria, mapa) e fazer QA conjunto.
- **Go/No-Go:** liberar release apenas após rodar suíte de testes + smoke manual cobrindo galeria offline, admin e favoritos.
