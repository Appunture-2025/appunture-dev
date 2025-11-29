# Contributing to Appunture

Obrigado por considerar contribuir com o Appunture! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Code of Conduct](#code-of-conduct)
- [Como Contribuir](#como-contribuir)
- [Code Style](#code-style)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Review Checklist](#review-checklist)

## Code of Conduct

Este projeto segue um código de conduta que promove um ambiente respeitoso e inclusivo. Seja gentil, profissional e construtivo em todas as interações.

## Como Contribuir

### 1. Reportar Bugs

- Use as issues do GitHub para reportar bugs
- Descreva o comportamento esperado vs. atual
- Inclua passos para reproduzir
- Adicione screenshots se aplicável
- Informe versões (OS, Node, Java, etc.)

### 2. Sugerir Features

- Abra uma issue com a tag `enhancement`
- Descreva o problema que a feature resolve
- Proponha uma solução
- Considere impactos em outras partes do sistema

### 3. Implementar Mudanças

1. Fork o repositório
2. Clone localmente
3. Configure o ambiente de desenvolvimento
4. Implemente suas mudanças
5. Teste localmente
6. Abra um Pull Request

## Code Style

### Backend (Java)

Seguimos o **Google Java Style Guide** com as seguintes convenções:

```java
// Classes: PascalCase
public class FirestorePointService { }

// Métodos: camelCase
public void findByCode(String code) { }

// Constantes: UPPER_SNAKE_CASE
private static final int MAX_RETRY_ATTEMPTS = 5;

// Variáveis: camelCase
String pointId = "VG20";
```

**JavaDoc obrigatório para:**
- Todas as classes públicas
- Todos os métodos públicos em Services
- DTOs com descrição de campos

```java
/**
 * Service responsible for managing acupuncture points.
 * Handles CRUD operations and search functionality.
 *
 * @see FirestorePoint
 * @see FirestorePointRepository
 */
@Service
public class FirestorePointService {

    /**
     * Retrieves a point by its unique code.
     *
     * @param code The point code (e.g., "VG20", "ST36")
     * @return Optional containing the point if found
     */
    public Optional<FirestorePoint> findByCode(String code) { }
}
```

### Frontend (TypeScript)

Seguimos **Prettier + ESLint** com as seguintes convenções:

```typescript
// Interfaces: PascalCase com 'I' prefix opcional
interface Point { }
interface UseNotificationsReturn { }

// Types: PascalCase
type SyncEntityType = 'favorite' | 'point' | 'symptom';

// Functions: camelCase
function calculateBackoffDelay(retryCount: number): number { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 5;

// React Components: PascalCase
export function PointCard({ point }: PointCardProps) { }
```

**TSDoc obrigatório para:**
- Hooks customizados
- Funções de serviço
- Componentes com props complexas

```typescript
/**
 * Hook for managing push notifications.
 * Handles token registration, notification listeners, and navigation.
 *
 * @example
 * ```tsx
 * const { pushToken, register, hasPermission } = useNotifications();
 * ```
 */
export function useNotifications(): UseNotificationsReturn { }
```

### Ferramentas de Lint

```bash
# Backend - Checkstyle
cd backend-java
mvn checkstyle:check

# Frontend - ESLint + Prettier
cd frontend-mobile/appunture
npm run lint
npm run format
```

## Git Workflow

### Branch Naming

```
feature/xxx     - Nova funcionalidade
bugfix/xxx      - Correção de bug
hotfix/xxx      - Correção urgente em produção
docs/xxx        - Documentação
refactor/xxx    - Refatoração sem mudança de comportamento
test/xxx        - Adição/correção de testes
```

**Exemplos:**
```bash
feature/push-notifications
bugfix/sync-queue-overflow
docs/update-readme
refactor/extract-auth-service
```

### Commit Messages

Seguimos **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção (build, deps, etc.)

**Exemplos:**
```bash
feat(auth): add Google Sign-In support
fix(sync): resolve queue processing deadlock
docs(readme): update quick start guide
refactor(points): extract validation logic
test(auth): add unit tests for login flow
chore(deps): update Spring Boot to 3.2.5
```

### Rebase vs Merge

- Use **rebase** para manter histórico linear em feature branches
- Use **merge** (squash) ao integrar PRs na main

```bash
# Atualizar feature branch com main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Resolver conflitos se necessário
git add .
git rebase --continue
```

## Pull Request Process

### 1. Antes de Abrir o PR

- [ ] Código compila sem erros
- [ ] Testes passam localmente
- [ ] Lint sem warnings
- [ ] Documentação atualizada (se aplicável)
- [ ] Commits seguem convenção

### 2. Descrição do PR

Use este template:

```markdown
## Descrição
[Descreva o que foi alterado e por quê]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. [Passo 1]
2. [Passo 2]
3. [Resultado esperado]

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem warnings de lint
- [ ] Review self-check feito

## Screenshots (se aplicável)
[Adicione screenshots de UI changes]
```

### 3. Review Process

1. Pelo menos 1 aprovação necessária
2. CI deve passar (tests, lint, build)
3. Conflitos resolvidos
4. Squash merge na main

## Review Checklist

### Para Reviewers

**Código:**
- [ ] Lógica está correta
- [ ] Código é legível e bem estruturado
- [ ] Não há código duplicado desnecessário
- [ ] Error handling adequado
- [ ] Sem problemas de segurança óbvios

**Testes:**
- [ ] Testes cobrem casos principais
- [ ] Testes cobrem edge cases importantes
- [ ] Nomes de testes são descritivos

**Documentação:**
- [ ] JavaDoc/TSDoc presente onde necessário
- [ ] README atualizado se API mudou
- [ ] Comentários explicam "por quê", não "o quê"

**Performance:**
- [ ] Sem N+1 queries óbvias
- [ ] Sem loops infinitos potenciais
- [ ] Uso adequado de cache (se aplicável)

## Recursos Adicionais

- [Backend README](backend-java/README.md)
- [Mobile README](frontend-mobile/appunture/README.md)
- [Architecture Decisions](docs/adr/)
- [Local Development Setup](docs/setup/local-development.md)

---

Dúvidas? Abra uma issue ou entre em contato com a equipe!
