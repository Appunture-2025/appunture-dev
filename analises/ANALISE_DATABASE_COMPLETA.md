# Análise Completa do Banco de Dados do Appunture

## 1. Visão Geral da Arquitetura de Dados

- **Fonte primária**: Cloud Firestore (coleções `points`, `symptoms`, `users`) manipuladas pelos serviços Spring Boot (`FirestorePointService`, `FirestoreSymptomService`, `FirestoreUserService`).
- **Suporte**: Firebase Storage para binários (imagens/anexos) via `FirebaseStorageService` e Firebase Auth para identidade.
- **Pipelines de seed**: scripts Python em `tools/` (`normalize_points.py`, `update_*_points.py`, `include_missing_meridians.py`, `validate_points_review.py`) geram `tools/output/points_review.csv`, `points_seed.json` e `points_seed.ndjson` usados para popular Firestore.
- **Persistência offline**: SQLite (Expo) em `frontend-mobile/appunture/services/database.ts` armazena réplicas de pontos/sintomas, favoritos e filas de sincronização para uso no app mobile.
- **Integração**: O backend expõe REST (vide `backend-java/README.md`) para CRUD e sincronização; o app mobile consome via `services/api.ts` e sincroniza com o cache SQLite.

```text
Firebase Auth ─┐
               │
           Firestore (users ↔ points ↔ symptoms) ────> Spring Boot REST ──> App Mobile
               │                                          ▲                  │
Firebase Storage (imagens)                                │                  │
               └───────────────────────> Seed scripts → Firestore           │
                                                         │                  │
                                SQLite offline (points, symptoms, favoritos, notas, filas)
```

## 2. Componentes de Dados

### 2.1 Firestore (Backend)

- Banco NoSQL em modo nativo, cada documento versionado com `createdAt`/`updatedAt` (`LocalDateTime`).
- Sem subcoleções hoje; relações são mantidas via arrays de IDs e contadores.
- Controle de consistência feito na camada de serviço (por exemplo, `addSymptomToPoint`, `addPointToSymptom`).

### 2.2 Firebase Storage

- Bucket padrão `appunture-tcc.appspot.com` (configurável). Arquivos são organizados por pastas lógicas (`points/{pointId}/...`).
- URLs públicas gravadas em `FirestorePoint.imageUrls` + `imageThumbnailMap`. Auditoria de mudanças em `imageAudit`.

### 2.3 Firebase Auth / Usuários

- Identidade federada; Firestore só replica metadados (nome, email, papel, favoritos). `firebaseUid` é chave de junção com Auth.
- RBAC simples (`USER`, `ADMIN`) usado na API.

### 2.4 SQLite Offline (App Mobile)

- Empacotado via `expo-sqlite`. Tabelas: `points`, `symptoms`, `symptom_points`, `favorites`, `notes`, `search_history`, `sync_status`, `sync_queue`, `image_sync_queue`.
- Suporta migração de esquemas, índices (meridiano, categoria, relacionamentos) e filas de sincronização (`SyncOperation`).

## 3. Modelo Lógico do Firestore

### 3.1 Coleção `points`

| Campo                                                                     | Tipo                          | Descrição / Uso                                                                                                                      |
| ------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                                                      | string                        | ID do documento (gerado quando vazio). Muitas vezes o próprio código normalizado (`st-36 → st_36`).                                  |
| `code`                                                                    | string                        | Código padronizado (ex.: `LG-4`). Obrigatório e único (checado em `FirestorePointService.createPoint`).                              |
| `name`, `chineseName`                                                     | string                        | Nome ocidental e ideograma.                                                                                                          |
| `meridian`, `meridianName`, `meridianGroup`                               | string                        | Código, nome, grupo (Primário, Extraordinário etc.). Alimentado via `tables/acupuncture_points.csv`.                                 |
| `translation.*`                                                           | string                        | Pinyin, transliteração, coreano, vietnamita vindos dos CSVs.                                                                         |
| `description`, `location`, `indication`, `contraindications`, `functions` | string                        | Conteúdo clínico obrigatório (validado por `tools/validate_points_review.py`).                                                       |
| `coordinates`                                                             | mapa `{x: Double, y: Double}` | Coordenadas normalizadas do body map (atualizadas via `/points/{id}/coordinates`).                                                   |
| `bodyMapCoords`                                                           | lista                         | Estrutura para múltiplas camadas de mapa corporal (JSON serializado ao importar).                                                    |
| `imageUrls`                                                               | lista                         | URLs originais no Firebase Storage.                                                                                                  |
| `imageThumbnailMap`                                                       | mapa                          | Associação `original → thumbnail` criada pelo `ThumbnailGenerationService`.                                                          |
| `imageAudit`                                                              | lista de `ImageAuditEntry`    | Histórico com `imageUrl`, `thumbnailUrl`, `action`, `performedBy`, `performedByEmail`, `timestamp`, `notes`. Limite de 50 registros. |
| `symptomIds`                                                              | lista                         | Referências de sintomas (strings). Usadas por `/points/symptom/{id}`.                                                                |
| `favoriteCount`, `viewCount`                                              | inteiro                       | Atualizados por transações Firestore.                                                                                                |
| `tags`                                                                    | lista                         | Etiquetas livres (`seed_config.defaults.tags` inicia como `seed-pending`).                                                           |
| `category`                                                                | string                        | Categoria clínica; fallback `General`.                                                                                               |
| `createdAt`, `updatedAt`, `createdBy`                                     | `LocalDateTime` + string      | Auditoria.                                                                                                                           |
| `contentStatus`                                                           | string                        | Workflow editorial (`pending-review`, `approved`, etc.).                                                                             |

Consultas realizadas:

- `findByCode`, `findByMeridian`, `findBySymptomId` (array-contains), `findByNameContaining` (filtra em memória).
- Estatísticas derivadas em `/points/stats` (`count`, `meridianCount`, `withImages`, `withSymptoms`).

**Índices Firestore sugeridos:**

- Simples: `code`, `meridian`, `symptomIds` (array-contains), `category`, `tags`.
- Compostos: `meridian + category` (para filtros combinados futuros), `tags + createdAt` caso seja usado.

### 3.2 Coleção `symptoms`

| Campo                                 | Tipo               | Descrição                                                                   |
| ------------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `id`                                  | string             | ID do documento.                                                            |
| `name`, `description`                 | string             | Nome e descrição clínica.                                                   |
| `category`                            | string             | Grupos como "Dor", "Digestivo". `findByCategory` depende de índice simples. |
| `tags`                                | lista              | Etiquetas temáticas. Consultadas com `whereArrayContains`.                  |
| `pointIds`                            | lista              | Relacionamento inverso com pontos (IDs Firestore).                          |
| `severity`, `priority`                | inteiro            | Ranking de sintomas (padrões 5/0).                                          |
| `useCount`, `associatedPointsCount`   | inteiro            | Derivados de uso (`incrementUseCount`, `findTopUsed`).                      |
| `createdAt`, `updatedAt`, `createdBy` | data/hora + string | Auditoria (quem criou/atualizou).                                           |

### 3.3 Coleção `users`

| Campo                                | Tipo               | Descrição                                                      |
| ------------------------------------ | ------------------ | -------------------------------------------------------------- |
| `id`                                 | string             | ID do documento Firestore.                                     |
| `firebaseUid`                        | string             | UID do Firebase Auth (chave externa).                          |
| `email`, `name`, `role`              | string             | Perfil básico + RBAC.                                          |
| `enabled`, `emailVerified`           | boolean            | Flags de status.                                               |
| `profileImageUrl`, `phoneNumber`     | string             | Metadados opcionais.                                           |
| `favoritePointIds`                   | lista              | IDs de pontos favoritos (strings). Alimenta `/auth/favorites`. |
| `createdAt`, `updatedAt`, `password` | data/hora + string | Auditoria + compatibilidade legado (senha não usada).          |

### 3.4 Relacionamentos Firestore

```text
users.favoritePointIds ─┬─> points.id
                        │
symptoms.pointIds ──────┘
points.symptomIds ──────┬─> symptoms.id
                        │
points.imageUrls ───────┘ (referência física no Firebase Storage)
```

- Não há enforcement automático; manutenção é feita via serviços (ex.: `addSymptomToPoint` atualiza arrays e contador manualmente).
- Operações que alteram favoritos/sintomas também atualizam contadores (`favoriteCount`, `associatedPointsCount`).

### 3.5 Fluxo de Consulta Principal

1. App autentica via Firebase Auth → ID token.
2. API valida token (`FirebaseAuthService`) e acessa Firestore.
3. Dados retornados são armazenados em cache local (SQLite) e sincronizados conforme conectividade.
4. `AiChatService` agrega todos os pontos/sintomas e gera contexto textual para LLM, sem coleção dedicada.

## 4. Pipelines de Seed e Governança de Conteúdo

1. **Normalização completa** (`tools/normalize_points.py`): lê `tables/*meridian.csv` + `tables/acupuncture_points.csv`, aplica aliases (`seed_config.json`) e gera `points_seed.json`, `points_seed.ndjson` e `points_review.csv` com colunas padronizadas.
2. **Scripts de enriquecimento por meridiano** (`tools/update_<meridian>_points.py`): preenchem campos clínicos (PT-BR). Cada script atualiza lotes específicos.
3. **Inclusão de meridianos extraordinários** (`include_missing_meridians.py`): garante presença de CV/GV e outros ainda não importados usando metadados originais.
4. **Validação** (`validate_points_review.py`): verifica campos obrigatórios, JSON válido e permite escopo por meridiano.
5. **Exportação final** (`tools/export_points_review.py`): converte `points_review.csv` enriquecido em `points_seed.json` e `points_seed.ndjson`, parseando campos JSON/lista e aplicando defaults de `seed_config.json`. Use `--meridian <código>` para gerar lotes menores (ex.: apenas `GV`) e `--allow-missing` somente para testes (pula a validação estrita).
6. **Carga no Firestore**: utilizar `points_seed.ndjson` com `gcloud firestore import` ou script customizado; manter `contentStatus` = `pending-review` até auditoria.
7. **Governança**: atualizar `tags`/`category` e bloquear alterações direto no app até aprovação manual.

## 5. Armazenamento de Imagens

- Upload via endpoint `/storage/upload` → `FirebaseStorageService.uploadFile`:
  - Valida tipo/tamanho (≤10 MB, imagens/pdfs/doc).
  - Cria nome único (`folder/uuid.ext`) e torna público com ACL Reader.
- Na atualização do ponto (`addImageToPoint`/`removeImageFromPoint`):
  - Atualiza `imageUrls`, `imageThumbnailMap`, `imageAudit` e `updatedAt`.
  - `ThumbnailGenerationService` gera miniaturas ou aceita URL informada.
- Recomenda-se padronizar pastas por ponto (`points/{code}/raw/...`).

## 6. Banco de Dados Local (SQLite)

### 6.1 Tabelas Principais (`frontend-mobile/appunture/services/database.ts`)

| Tabela             | Colunas-chave                                                                                                            | Relações                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `points`           | `id TEXT PRIMARY KEY`, `code`, `name`, `meridian`, `location`, `favorite_count`, `synced`, `last_sync`                   | Replica subset de Firestore; `coordinates` armazenado como JSON string.              |
| `symptoms`         | `id TEXT PRIMARY KEY`, `name`, `category`, `use_count`, `synced`, `last_sync`                                            | Replica Firestore.                                                                   |
| `symptom_points`   | `symptom_id`, `point_id`, `efficacy_score`                                                                               | Tabela de junção local para relacionamento N:N; `PRIMARY KEY(symptom_id, point_id)`. |
| `favorites`        | `id AUTOINCREMENT`, `point_id`, `user_id`, `synced`, `operation`, `created_at`, `updated_at`, `UNIQUE(point_id,user_id)` | Cache de favoritos do usuário para sync com `/auth/favorites`.                       |
| `notes`            | `id AUTOINCREMENT`, `point_id`, `user_id`, `content`, `synced`, timestamps                                               | Notas pessoais (ainda não refletidas no backend).                                    |
| `search_history`   | `id AUTOINCREMENT`, `query`, `type`, `created_at`                                                                        | Histórico local para sugestões e métricas offline.                                   |
| `sync_status`      | `table_name`, `last_sync`, `status`                                                                                      | Controle do último sync por entidade.                                                |
| `sync_queue`       | `id TEXT`, `entity_type`, `operation`, `data`, `reference`, `retry_count`, `status`                                      | Fila geral de operações offline (favoritos, notas, etc.).                            |
| `image_sync_queue` | `id AUTOINCREMENT`, `point_id`, `image_uri`, `payload`, `status`, `retry_count`                                          | Fila dedicada para uploads de imagens quando offline.                                |

### 6.2 Migrações e Índices

- `applyMigrations` detecta esquema legado; se necessário, faz dump, dropa tabelas e recria com colunas atualizadas (IDs TEXT para Firestore).
- Índices criados: `idx_points_meridian`, `idx_points_name`, `idx_symptoms_category`, `idx_symptom_points_*`, `idx_favorites_*`, `idx_notes_point`, `idx_sync_queue_*`, `idx_image_sync_queue_*`.
- Filas suportam estados `pending`, `in_progress`, `retry`, `failed` e limitam `MAX_QUEUE_RETRIES = 5`.

### 6.3 Sincronização

1. `ApiService` baixa dados → `database.upsertPoint/ upsertSymptom`.
2. Ações offline (favoritar, nota, upload) geram registros em `sync_queue`/`image_sync_queue`.
3. Worker local processa filas, chama API e marca operações como concluídas (`synced = 1`).
4. Falhas persistentes mudam `status` para `retry` ou `failed` para análise posterior.

## 7. Segurança e Governança

- **Autenticação**: Firebase ID token obrigatório; `SecurityConfig` garante autorização por role.
- **Autorização**: Endpoints admin (CRUD completo) exigem `ADMIN`; usuários comuns manipulam apenas seus favoritos/perfil.
- **Firestore Rules (recomendação)**: mesmo com backend privilegiado, definir regras para evitar uso direto.
- **Proteção de dados**: `contentStatus` distingue conteúdo aprovado; `seed-pending` impede exibição antes da revisão.
- **Auditoria**: `imageAudit` e timestamps; recomenda-se criar Cloud Logging sink para mutações críticas (pontos/sintomas).

## 8. Observabilidade e Métricas

- Endpoints `/points/stats`, `/symptoms/stats`, `/admin/stats/detailed` fornecem contagens, meridianos, pontos com imagens, sintomas mais usados.
- Arquivos prontos em `backend-java/observability/` configuram Prometheus + Grafana (dashboards, alertas).
- Logs estruturados (`Slf4j`) em todos os repositórios/serviços para rastrear consultas Firestore.

## 9. Próximos Passos Recomendados

1. **Publicar regras Firestore** que reflitam o RBAC da API e restrinjam gravações diretas às coleções (`users`, `points`, `symptoms`).
2. **Automatizar importação** do `points_review.csv` → Firestore (Cloud Run job ou script Maven) e registrar snapshots.
3. **Implementar coleção `notes` ou subcoleções** para sincronizar notas do SQLite com Firestore, usando `user/{id}/notes/{noteId}`.
4. **Configurar índices Firestore** sugeridos para evitar erros de consulta ao filtrar por meridiano + tags.
5. **Monitorar quotas** (Firestore reads/writes, Storage) e ajustar o cache do aplicativo conforme limites citados no README.
6. **Normalizar favoritos** para evitar arrays grandes; alternativa: subcoleção `users/{id}/favorites/{pointId}` se o volume crescer.
7. **Documentar pipeline de revisão** (responsáveis e checklists) para mover `contentStatus` de `pending-review` → `approved`.

---

_Documentação baseada na análise dos arquivos `backend-java/src/main/java/com/appunture/backend/**`, `frontend-mobile/appunture/**` e `tools/**` em 27/11/2025._
