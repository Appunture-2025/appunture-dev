# ✅ Plano Final de Tasks (25/11/2025)

> Lista priorizada de prompts prontos para delegar a uma IA/desenvolvedor. Execute cada bloco na ordem indicada para concluir o app em até 2 semanas.

## 🔥 Prioridade Máxima — Semana 1 (Qualidade & Fundamentos)

1. **Backend · Cobertura de Testes ≥60%**  
   _Prompt:_ "No projeto `backend-java`, escreva suites `@SpringBootTest` para `FirestorePointController`, `FirestoreSymptomController` e `FirestoreAuthController`, além de testes unitários para `FirestoreUserService`, `FirebaseStorageService` (mockando `StorageClient`) e `LoggingEmailService`. Configure o JaCoCo no `pom.xml`, gere o relatório localmente e adicione um badge de cobertura no `README.md`."
   feito

2. **Backend · Seed Oficial Versionado**  
   _Prompt:_ "Implemente um seed oficial no Spring Boot: crie arquivos `.json` em `src/main/resources/seed/` contendo 30 pontos, 20 sintomas, um usuário admin e 5 relacionamentos. Adicione um `CommandLineRunner` ou endpoint protegido em `FirestoreAdminController` que importe esses dados e documente o passo no `README.md` e no checklist de deploy."

3. **DevOps · Pipeline GitHub Actions**  
   _Prompt:_ "Crie um workflow GitHub Actions para `backend-java` que rode `mvn test` com cache de dependências, publique relatório JaCoCo como artefato e contenha um job opcional de deploy para Cloud Run usando segredos. Inclua instruções de rollback no `README.md`."

4. **Frontend · RBAC Visual + Stack Admin**  
   _Prompt:_ "No app Expo (`frontend-mobile/appunture`), persista claims/role no `authStore`, esconda tabs/rotas admin para `role ≠ ADMIN` e crie uma stack `admin/` com cards para CRUD de pontos/sintomas e painel de usuários consumindo `/admin/**`. Cubra o fluxo com testes Jest."

5. **Frontend · Atlas Local + Body Map Dinâmico**  
   _Prompt:_ "Versione o atlas de imagens em `assets/body-map/**`, ajuste os tipos (`Point.imageRefs`) e componentes (`PointCard`, `point-details.tsx`, `ImageGallery`, `BodyMap.tsx`) para carregar múltiplas imagens locais com swipe/zoom e renderizar coordenadas reais vindas da API. Adicione smoke tests garantindo navegação offline."

## ⚙️ Prioridade Média — Semana 2 (Experiência & Observabilidade)

1. **Frontend · Suite de Testes + Modo Offline**  
   _Prompt:_ "Configure Jest/RTL para o app mobile, crie pelo menos 10 testes cobrindo `authStore`, `pointsStore`, RBAC e favoritos, e finalize o `syncStore` com fila de operações, indicador offline e reconcile automático. Documente como rodar os testes no `README.md`."

2. **Backend · Observabilidade e Auditoria**  
   _Prompt:_ "Provisionar dashboards Grafana usando os manifests em `backend-java/observability/`, criar alertas (latência, 5xx, estouro de rate-limit) e adicionar auditoria ao endpoint `/points/{id}/images` registrando usuário/ação/arquivo. Atualizar `DECISOES_ARQUITETURA.md` com URLs e procedimentos."

3. **Integração · Decisão Notas/Histórico & Contratos**  
   _Prompt:_ "Registrar, em `ANALISE_INTEGRACAO_25NOV2025.md`, a decisão final sobre `/notes` e `/search/history` (implementar endpoints ou remover feature). Atualizar `frontend-mobile` (stores/UI/API) e o backend conforme a decisão, e documentar os contratos resultantes em `README.md` do frontend."

4. **Integração · Convenção Atlas & Coordenadas**  
   _Prompt:_ "Padronize a forma como o backend envia `pointId`, `meridianCode` e `imageRefVersion`, exponha (se necessário) um endpoint `/points/coordinates-template` e atualize o frontend para resolver assets locais usando essa convenção. Documente a tabela de mapeamento no `README.md` e em `openapi/appunture-backend.postman_collection.json`."

5. **Favoritos Paginados & Tratamento de Erros**  
   _Prompt:_ "Implemente paginação em `/auth/favorites`, ajuste `pointsStore` para sincronizar cache local/offline e crie um middleware no app que traduza respostas de erro do backend (`timestamp`, `path`, `errorCode`) em mensagens PT-BR com indicador de health (`/health`)."

## 💤 Prioridade Baixa — Pós-homologação / Polimento

1. **Documentação Compartilhada + Changelog de API**  
   _Prompt:_ "Adicione uma seção "Contratos API" ao `frontend-mobile/README.md` com tabela rota → método → payload → status. Automatize um changelog de endpoints (pode ser script Node que compara OpenAPI anterior vs atual) e integre-o ao pipeline."

2. **Cache & Performance Backend**  
   _Prompt:_ "Desenhe uma estratégia de cache (Redis ou Firestore batch) para as consultas de pontos/sintomas mais custosas, atualize os índices compostos necessários e documente ganhos esperados em `DECISOES_ARQUITETURA.md`."

3. **UX Consistente & Acessibilidade**  
   _Prompt:_ "No app mobile, consolide tokens de design (cores, tipografia) para SyncBanner, tabs e telas; adicione mensagens PT-BR para estados vazios/falha de rede e revise acessibilidade (labels, contraste, suporte a screen readers)."

4. **Testes Integrados Automatizados**  
   _Prompt:_ "Crie um pequeno conjunto de smoke tests (Node/TypeScript) que consome o backend real ou mockado via `api.ts` para validar login → favoritos → admin flow. Integre esses testes ao pipeline para rodar após cada deploy em staging."
