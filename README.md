# Appunture (TCC / Projeto Acadêmico)

Projeto em desenvolvimento para Trabalho de Conclusão de Curso: plataforma de apoio ao estudo e consulta de pontos de acupuntura e sintomas associados.

## 📊 Status do Projeto

**Progresso Geral:** 70% completo

- **Backend:** 70% completo
  - ✅ Funcionalidades core: 100%
  - ✅ Documentação API (Swagger): 100%
  - ⚠️ Testes: 0% (CRÍTICO)
  - ⚠️ Segurança: 60%
  - ⚠️ Observabilidade: 30%

- **Frontend Mobile:** 65% completo
  - ✅ Telas: 85% (18 telas implementadas)
  - ✅ Integração API: 75%
  - ⚠️ Sincronização offline: 30%
  - ⚠️ Testes: 0% (CRÍTICO)
  - ⚠️ Acessibilidade: 40%

**Estatísticas:**
- 67 endpoints REST backend (6 controllers)
- 18 telas React Native (2840 linhas de código)
- 4 stores Zustand para state management
- Firebase Authentication + Firestore + Storage integrados

**Estimativa para Produção:** 4-6 semanas focando em testes e segurança

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

## 📊 Documentação e Análises

- **[DIAGNOSTICO_COMPLETO.md](./DIAGNOSTICO_COMPLETO.md)** - 🆕 Diagnóstico técnico completo e acionável
  - Sumário executivo com métricas atualizadas
  - O que está implementado (com evidências)
  - O que falta implementar (com prioridades)
  - O que precisa de ajustes (bugs, arquitetura, performance)
  - Backlog consolidado em 3 sprints
  - Checklist de QA para homologação
  - Riscos e recomendações arquiteturais
- **[ANALISE_ATUALIZADA.md](./ANALISE_ATUALIZADA.md)** - Análise completa e diagnóstico técnico do projeto (1083 linhas)
  - Diagnóstico Backend e Frontend detalhado
  - Backlog priorizado (28 tarefas em 3 sprints)
  - Critérios de aceitação e checklist de QA
  - Riscos e recomendações arquiteturais
- **[FRONTEND_MOBILE_GAP_ANALYSIS.md](./FRONTEND_MOBILE_GAP_ANALYSIS.md)** - Análise de lacunas Frontend vs Backend
- **[IMPLEMENTACAO_RELATORIO.md](./IMPLEMENTACAO_RELATORIO.md)** - Relatório de implementação detalhado
- **[LEIA-ME_ANALISE.md](./LEIA-ME_ANALISE.md)** - Resumo executivo das análises

## Roadmap (Próximos Passos)

### Prioridade Alta 🔴 (Sprint 1 - 4 semanas)
- Implementar testes backend (unitários + integração) - 0% atual
- Implementar testes frontend (Jest + React Native Testing Library) - 0% atual
- Sincronização offline robusta no mobile
- Corrigir CORS para produção (segurança crítica)
- Logs estruturados (JSON) + Correlation ID
- Validação de email verificado (Firebase Auth)
- Rate limiting nas APIs

### Prioridade Média 🟡 (Sprint 2 - 3 semanas)
- Galeria de múltiplas imagens por ponto
- Mapa corporal interativo com coordenadas
- Upload de foto de perfil
- Sistema de auditoria (createdBy, updatedBy)
- Performance: otimizar N+1 queries
- Acessibilidade completa no mobile

### Prioridade Baixa 🟢 (Sprint 3 - 2 semanas)
- Login social (Google, Apple)
- Notificações push (FCM)
- Modo escuro
- Internacionalização (pt/en)
- Documentação completa

**Para detalhes completos, consultar [ANALISE_ATUALIZADA.md](./ANALISE_ATUALIZADA.md)**

## Aviso Acadêmico

Projeto sem garantias comerciais; código voltado ao aprendizado de arquitetura, boas práticas e containerização.

## Licença

Uso acadêmico / educacional. Ajustar licença conforme necessidade futura.
