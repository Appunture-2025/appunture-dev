# Análise de Integração Backend ↔ Frontend – 27/11/2025

## 1. Estado Atual

- **Backend** (Spring Boot + Firebase) declara-se pronto e documentado (`backend-java/STATUS_FINAL_MIGRACAO.md`) com endpoints `/auth/*`, `/points`, `/symptoms`, `/admin`, `/health` e segurança via Firebase ID tokens.
- **Frontend mobile** consome API via `services/api.ts`, controla autenticação com Firebase SDK e sincronização offline. Estrutura Expo limpa e stores estáveis.
- **Integração formal** (contratos, ambientes e testes ponta-a-ponta) ainda não finalizada; inexistem pipelines automáticos validando o handshake.

## 2. Aderência de Contratos

| Fluxo             | Situação          | Evidências                                                                                                                                                                                                                              |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticação      | **Quebra**        | Mobile chama `/auth/login` e `/auth/register` (`services/api.ts`), porém backend só expõe `/auth/profile`, `/auth/sync`, `/auth/me`. Precisa alinhar para usar apenas Firebase Auth client-side + `/auth/sync` para provisionar perfil. |
| Profile/Favorites | **OK parcial**    | Endpoints existentes nos dois lados, mas payloads no mobile assumem `{ user: ... }` wrappers; backend devolve `UserProfileResponse`. Necessário testar e ajustar parsing.                                                               |
| Points/Symptoms   | **OK**            | Mesmos endpoints documentados; mobile já usa rotas `/points/*`, `/symptoms/*`.                                                                                                                                                          |
| Storage/Uploads   | **Em aberto**     | Mobile possui `uploadFile` → `/storage/upload`, backend tem `FirebaseStorageController`. Contudo fila offline (`syncStore.ts`) ainda marca TODO para upload real, não exercitando endpoint.                                             |
| Admin APIs        | **Sem validação** | Mobile contém métodos CRUD em `api.ts`, porém não há telas conectadas; precisa validar roles/custom claims para evitar 403.                                                                                                             |

## 3. Ambientes e Configuração

- `utils/constants.ts` mantém `http://localhost:3000` como default, enquanto backend roda em `:8080`/Cloud Run. Sem ajuste, builds mobile apontam para backend inválido.
- Backends definem CORS específicos em `application-dev.yml`/`application-prod.yml`. Necessário garantir que domínios Expo (por ex. `http://192.168.x.x:19006`) estejam cobertos.
- Firebase configs exigidos no app (via `app.json` ou `EXPO_PUBLIC_*`) ainda não versionados para cada ambiente.

## 4. Testes & Observabilidade

- Não existe suíte automatizada cobrindo chamadas reais (Postman/Newman ou Detox). Apenas testes unitários isolados no mobile.
- Backend possui health endpoints e arquivos Prometheus/Grafana, mas integração não está monitorando do ponto de vista do app (não há ping/health gating no mobile além de `healthCheck()` manual).

## 5. Riscos/Dependências

1. **Falha de Login** – Enquanto `/auth/login` continuar sendo chamado, usuários nunca se autenticarão no backend final e sincronização quebrará.
2. **Seed inconsistentes** – Mobile precisa do mesmo dataset (meridianos, sintomas) para que caches SQLite tenham correspondência. Dependente do plano de seed.
3. **Uploads Offline** – Sem implementação real de upload (TODO em `syncStore.ts`), fila de imagens nunca sai do status pending, travando UX.
4. **CORS/Origins** – Expo Go usa HTTP dinâmico; se não for incluído em `application-dev.yml`, requests serão bloqueadas.
5. **Gestão de perfis/admin** – Necessita alinhamento de custom claims Firebase para liberar endpoints `/admin/**` ao app admin.

## 6. Plano de Integração Recomendado

| Ordem | Entrega                           | Descrição                                                                                                                                        |
| ----- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | **Contratos Autenticação**        | Remover chamadas `login/register` do mobile, usar Firebase Auth SDK e reforçar `/auth/sync` + `/auth/profile`. Atualizar documentação/API types. |
| 2     | **Configuração de Ambientes**     | Definir `API_BASE_URL` por `.env`/`app.json`, revisar CORS no backend e criar guia único com URLs por ambiente.                                  |
| 3     | **Seed/Data Alignment**           | Executar scripts do backend (`/admin/data/seed`) e validar que mobile recebe mesmos campos (meridianos, coordinates, tags).                      |
| 4     | **Upload/Mídia**                  | Implementar upload real no mobile (usar `firebaseStorage` ou endpoint backend) e testar fila offline.                                            |
| 5     | **Testes End-to-End**             | Criar collection Postman + teste Detox simples (login Firebase, sync, listar pontos) rodado em CI antes de liberar builds.                       |
| 6     | **Observabilidade Compartilhada** | Ativar métricas/alertas backend para operações mobile (favoritos, sync) e surface status no app (exibir fallback se health falhar).              |

## 7. Percentual e Timeline

- Integração considerada em **50% concluída**: contratos principais existem, porém falta validar/ajustar autenticação, uploads e ambientes.
- Estimativa de 4–5 dias úteis para fechar as etapas acima (sem contar publicação mobile), desde que seed + backend estável estejam disponíveis.
