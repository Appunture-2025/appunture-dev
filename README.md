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
- Spring Security (JWT)
- Spring Data JPA + PostgreSQL
- Flyway (migrations)
- MapStruct (DTO mapping)
- Swagger / OpenAPI (documentação)
- Docker & docker-compose

## Principais Recursos Implementados

- Registro, login, refresh token, perfil
- Seed automático de usuário admin
- CRUD de Points e Symptoms com DTOs
- Estatística de meridianos
- Tratamento global de exceções
- Testes unitários e de integração básicos

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
├── config         # Security, OpenAPI, seed admin
├── controller     # REST controllers
├── dto            # DTOs (requests/responses/mappers)
├── entity         # Entidades JPA
├── repository     # Interfaces JPA
├── security       # JWT + filtro
├── service        # Regras de negócio
├── exception      # Tratamento global
└── ...
```

## Endpoints (Resumo)

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`, `/api/auth/refresh`
- Points: `/api/points`, `/api/points/{id}`, `/api/points/code/{code}`, `/api/points/meridian/{meridian}`, `/api/points/stats/meridians`
- Symptoms: `/api/symptoms`, `/api/symptoms/{id}`

Operações de criação/alteração/remoção exigem ROLE_ADMIN.

## Roadmap (Próximos Passos)

- Upload de imagens para pontos (S3 ou local)
- Favoritos de pontos do usuário
- Relacionamento ponto-sintoma com score editável
- Melhoria de testes (cobertura + perfis)
- Observabilidade (metrics, logs estruturados)
- Deploy em ambiente cloud (ECS/Fargate ou similar)

## Aviso Acadêmico

Projeto sem garantias comerciais; código voltado ao aprendizado de arquitetura, boas práticas e containerização.

## Licença

Uso acadêmico / educacional. Ajustar licença conforme necessidade futura.
