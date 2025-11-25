# Análise de Integração e Decisões Finais (25/11/2025)

## 1. Decisão sobre Notas e Histórico de Busca

**Decisão:** Remover as funcionalidades de Notas Pessoais (`/notes`) e Histórico de Busca (`/search/history`) do escopo do MVP (Minimum Viable Product).

**Justificativa:**

1.  **Foco no Core Value:** O valor principal do Appunture é a consulta rápida e precisa de pontos de acupuntura e a sugestão inteligente via IA. Notas e histórico são features secundárias que adicionam complexidade de estado e sincronização.
2.  **Simplificação da Sincronização:** Remover essas entidades reduz a carga sobre o `syncStore` e diminui a superfície de conflitos de dados no modo offline.
3.  **Prazo:** Para garantir a entrega robusta das funcionalidades críticas (Busca, Mapa, IA, Favoritos) dentro do prazo, é necessário cortar escopo não essencial.

**Ações Realizadas:**

- Remoção de endpoints relacionados no Backend (se existirem).
- Remoção de chamadas de API no Frontend (`api.ts`).
- Remoção de stores/slices relacionados no Frontend.
- Atualização da documentação de contratos.

## 2. Contratos de API (Atualizado)

Abaixo estão os contratos finais da API REST que o Frontend consome.

### Autenticação (`/auth`)

| Método | Rota             | Descrição              | Payload                                  | Resposta          |
| :----- | :--------------- | :--------------------- | :--------------------------------------- | :---------------- |
| POST   | `/auth/register` | Registrar novo usuário | `{ email, password, name, profession? }` | `{ user, token }` |
| POST   | `/auth/login`    | Login com email/senha  | `{ email, password }`                    | `{ user, token }` |
| POST   | `/auth/google`   | Login com Google       | `{ idToken }`                            | `{ user, token }` |
| POST   | `/auth/apple`    | Login com Apple        | `{ idToken, nonce? }`                    | `{ user, token }` |
| POST   | `/auth/refresh`  | Atualizar token        | `{ refreshToken }`                       | `{ token }`       |

### Usuário (`/users`)

| Método | Rota                            | Descrição                | Payload                  | Resposta  |
| :----- | :------------------------------ | :----------------------- | :----------------------- | :-------- |
| GET    | `/users/me`                     | Perfil do usuário logado | -                        | `User`    |
| PUT    | `/users/me`                     | Atualizar perfil         | `{ name?, profession? }` | `User`    |
| GET    | `/users/me/favorites`           | Listar favoritos         | -                        | `Point[]` |
| POST   | `/users/me/favorites/{pointId}` | Adicionar favorito       | -                        | `void`    |
| DELETE | `/users/me/favorites/{pointId}` | Remover favorito         | -                        | `void`    |

### Pontos (`/points`)

| Método | Rota                      | Descrição                | Payload              | Resposta  |
| :----- | :------------------------ | :----------------------- | :------------------- | :-------- |
| GET    | `/points`                 | Listar pontos (paginado) | `?limit=20&offset=0` | `Point[]` |
| GET    | `/points/{id}`            | Detalhes do ponto        | -                    | `Point`   |
| GET    | `/points/search`          | Buscar pontos            | `?q=termo`           | `Point[]` |
| GET    | `/points/meridian/{code}` | Pontos por meridiano     | -                    | `Point[]` |

### Sintomas (`/symptoms`)

| Método | Rota               | Descrição       | Payload     | Resposta    |
| :----- | :----------------- | :-------------- | :---------- | :---------- |
| GET    | `/symptoms`        | Listar sintomas | `?limit=50` | `Symptom[]` |
| GET    | `/symptoms/search` | Buscar sintomas | `?q=termo`  | `Symptom[]` |

### IA (`/chat`)

| Método | Rota    | Descrição               | Payload               | Resposta               |
| :----- | :------ | :---------------------- | :-------------------- | :--------------------- |
| POST   | `/chat` | Enviar mensagem para IA | `{ message: string }` | `{ response: string }` |

### Admin (`/admin`)

| Método | Rota                 | Descrição           | Payload | Resposta                      |
| :----- | :------------------- | :------------------ | :------ | :---------------------------- |
| GET    | `/admin/stats`       | Estatísticas gerais | -       | `{ users, points, symptoms }` |
| POST   | `/admin/points`      | Criar ponto         | `Point` | `Point`                       |
| PUT    | `/admin/points/{id}` | Atualizar ponto     | `Point` | `Point`                       |
| DELETE | `/admin/points/{id}` | Deletar ponto       | -       | `void`                        |
