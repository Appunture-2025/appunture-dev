# Appunture (TCC / Projeto Acadêmico)

Projeto em desenvolvimento para Trabalho de Conclusão de Curso: plataforma de apoio ao estudo e consulta de pontos de acupuntura e sintomas associados.

## Objetivo

Fornecer API e interfaces web/mobile para:

- Consulta de pontos de acupuntura
- Associação ponto ↔ sintoma (com pontuação de eficácia)
- Busca e estatísticas (ex: contagem por meridiano)
- Autenticação de usuários e perfil
- Administração (gestão de dados)

## Módulos

- `backend-java/` (Spring Boot 3 / Java 17) – API principal
- `backend-antiga/` (Node.js) – Código legado (obsoleto, será removido)
- `frontend-web/` (Vite + React + Tailwind) – Interface web
- `frontend-mobile/` (Expo / React Native) – Interface mobile

## Stack Backend Atual

- Java 17, Spring Boot 3
- **Firebase Authentication** (substitui JWT local)
- **Google Cloud Storage** (upload de arquivos)
- Spring Data JPA + PostgreSQL
- Flyway (migrations)
- MapStruct (DTO mapping)
- Swagger / OpenAPI (documentação)
- Docker & docker-compose

## Principais Recursos Implementados

- **Autenticação Firebase** (registro, login, verificação de email)
- **Upload para Google Cloud Storage** (plano gratuito 5GB)
- Sistema de favoritos e relacionamentos
- CRUD completo de Points e Symptoms com DTOs
- Estatísticas e dashboards administrativos
- Busca avançada e filtros
- Tratamento global de exceções
- Testes unitários e de integração

## Executar com Docker

Pré-requisito: Docker + Docker Compose instalados.

```bash
# Subir stack
docker compose up --build

# API disponível em: http://localhost:8080/api
# Swagger UI:        http://localhost:8080/api/swagger-ui/index.html
```

Credenciais seed admin (definidas em `application.yml`):

```
admin@appunture.com / changeMeAdmin123
```

## Estrutura Simplificada do Backend Java

```
backend-java/src/main/java/com/appunture/backend
├── config         # Firebase, Firestore e segurança
├── controller     # REST controllers (Firestore)
├── dto            # DTOs (requests/responses)
├── exception      # Tratamento global
├── model          # Modelos do Firestore
├── repository     # Repositórios Firestore
├── security       # Filtro de autenticação Firebase
└── service        # Regras de negócio no Firestore
```

## Endpoints (Resumo)

- Auth (Firebase ID Token obrigatório):
	- `GET /api/auth/profile`
	- `PUT /api/auth/profile`
	- `POST /api/auth/sync`
	- `GET /api/auth/me`
	- `POST /api/auth/favorites/{pointId}`
	- `DELETE /api/auth/favorites/{pointId}`
- Points (Firestore): `GET /api/points`, `GET /api/points/{id}`, `GET /api/points/code/{code}`, `GET /api/points/meridian/{meridian}`, `GET /api/points/symptom/{symptomId}`, `POST|PUT|DELETE /api/points/**` (ROLE_ADMIN)
- Symptoms (Firestore): `GET /api/symptoms`, `GET /api/symptoms/{id}`, `GET /api/symptoms/category/{category}`, `GET /api/symptoms/point/{pointId}`, `POST|PUT|DELETE /api/symptoms/**` (ROLE_ADMIN)
- Admin (ROLE_ADMIN): `/api/admin/**`
- Storage (Firebase Storage): `/api/storage/**`

Operações de criação/alteração/remoção exigem ROLE_ADMIN.

## Roadmap (Próximos Passos)

- Finalizar automações para provisionamento de credenciais Firebase/Firestore entre ambientes
- Smoke tests automatizados para fluxos autenticados usando Firebase ID tokens
- Ajustar relacionamento ponto-sintoma com score editável
- Melhoria de testes (cobertura + perfis)
- Observabilidade (metrics, logs estruturados)
- Deploy em ambiente cloud (ECS/Fargate ou similar)

## Aviso Acadêmico

Projeto sem garantias comerciais; código voltado ao aprendizado de arquitetura, boas práticas e containerização.

## Licença

Uso acadêmico / educacional. Ajustar licença conforme necessidade futura.
