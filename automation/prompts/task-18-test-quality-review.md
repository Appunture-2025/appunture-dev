# Task 18: Test Quality Review & Improvement

## Objetivo

Revisar qualidade dos testes existentes, identificar gaps de cobertura e melhorar a estratégia de testes.

## Escopo

### Backend Java

#### 1. Análise de Cobertura

- [ ] Executar `./mvnw test jacoco:report`
- [ ] Analisar cobertura por pacote
- [ ] Identificar classes não testadas
- [ ] Verificar branch coverage (não só line)

```
Target Coverage:
- Line Coverage: >= 80%
- Branch Coverage: >= 70%
- Classes críticas: >= 90%
```

#### 2. Qualidade dos Testes

##### Unit Tests

- [ ] Seguem padrão AAA (Arrange, Act, Assert)
- [ ] Nomes descritivos (should_X_when_Y)
- [ ] Isolados (sem dependência de ordem)
- [ ] Mocks apropriados

```java
// ❌ Ruim
@Test
void test1() {
    var result = service.process(null);
    assertNull(result);
}

// ✅ Bom
@Test
void shouldReturnNull_whenInputIsNull() {
    // Arrange
    String input = null;

    // Act
    var result = service.process(input);

    // Assert
    assertThat(result).isNull();
}
```

##### Integration Tests

- [ ] Testam fluxos completos
- [ ] Usam containers (Testcontainers) ou mocks
- [ ] Não dependem de ambiente externo
- [ ] Cleanup apropriado

#### 3. Gaps a Cobrir

- [ ] Controllers: todos os endpoints
- [ ] Services: edge cases e erros
- [ ] Repositories: queries customizadas
- [ ] Security: autenticação/autorização

### Frontend Mobile

#### 4. Jest Coverage

- [ ] Executar `npm test -- --coverage`
- [ ] Analisar por pasta
- [ ] Identificar componentes não testados

```
Target Coverage:
- Statements: >= 70%
- Branches: >= 60%
- Functions: >= 70%
- Lines: >= 70%
```

#### 5. Componentes

##### Unit Tests

- [ ] Renderização correta
- [ ] Props handling
- [ ] Event handlers
- [ ] Loading/error states

```tsx
describe("PointCard", () => {
  it("should render point name", () => {
    render(<PointCard point={mockPoint} />);
    expect(screen.getByText(mockPoint.name)).toBeTruthy();
  });

  it("should call onPress when tapped", () => {
    const onPress = jest.fn();
    render(<PointCard point={mockPoint} onPress={onPress} />);
    fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledWith(mockPoint);
  });
});
```

##### Hook Tests

- [ ] Custom hooks testados com @testing-library/react-hooks
- [ ] States iniciais verificados
- [ ] Mutations testadas
- [ ] Cleanup verificado

#### 6. Services

- [ ] API calls mockadas
- [ ] Error handling testado
- [ ] Transformações de dados

### Frontend Admin

#### 7. React Query Tests

- [ ] Queries testadas
- [ ] Mutations testadas
- [ ] Error states
- [ ] Loading states

#### 8. Integration Tests

- [ ] Fluxos de formulário
- [ ] Navegação
- [ ] Autenticação

### E2E Tests

#### 9. Detox (Mobile)

- [ ] Fluxo de login
- [ ] Navegação principal
- [ ] CRUD de favoritos
- [ ] Sync de dados

#### 10. Cypress/Playwright (Admin)

- [ ] Login/logout
- [ ] CRUD de pontos
- [ ] CRUD de meridianos
- [ ] Busca e filtros

## Test Pyramid

```
        /\
       /  \     E2E (10%)
      /----\    - Fluxos críticos
     /      \
    /--------\  Integration (20%)
   /          \ - API, DB, componentes
  /------------\ Unit (70%)
 /              \ - Funções, classes
/__________________\
```

## Critérios de Aceitação

1. **Cobertura Mínima**:

   - Backend: 80% line, 70% branch
   - Frontend: 70% statements

2. **Testes de Qualidade**:

   - Nomes descritivos
   - Assertions significativas
   - Mocks apropriados

3. **Gaps Cobertos**:

   - Todos os controllers testados
   - Todos os hooks testados
   - Edge cases cobertos

4. **E2E Básicos**:
   - Login funciona
   - Navegação funciona
   - CRUD funciona

## Comandos Úteis

```bash
# Backend
cd backend-java
./mvnw test jacoco:report
open target/site/jacoco/index.html

# Frontend Mobile
cd frontend-mobile/appunture
npm test -- --coverage --watchAll=false
open coverage/lcov-report/index.html

# Frontend Admin
cd frontend-admin
npm test -- --coverage
```

## Fixtures & Mocks a Criar

### Mock Data

```typescript
// __mocks__/points.ts
export const mockPoint: Point = {
  id: "point-1",
  code: "LU-1",
  name: "Zhongfu",
  nameEn: "Central Treasury",
  namePt: "Tesouro Central",
  // ...
};

export const mockMeridian: Meridian = {
  id: "meridian-1",
  code: "LU",
  name: "Lung",
  // ...
};
```

### API Mocks

```typescript
// __mocks__/api.ts
export const mockApi = {
  getPoints: jest.fn().mockResolvedValue([mockPoint]),
  getPoint: jest.fn().mockResolvedValue(mockPoint),
  // ...
};
```

## Output Esperado

```markdown
# TEST_QUALITY_REVIEW.md

## Cobertura Atual vs Target

| Módulo  | Statements | Branch | Target     |
| ------- | ---------- | ------ | ---------- |
| Backend | 82%        | 71%    | ✅ 80%/70% |
| Mobile  | 73%        | 65%    | ✅ 70%/60% |
| Admin   | 68%        | 58%    | ⚠️ 70%/60% |

## Testes Adicionados

### Backend

- PointServiceTest: +15 tests
- MeridianControllerTest: +8 tests

### Frontend

- PointCard.test.tsx: new
- useFavorites.test.ts: new
- api.test.ts: +5 tests

## Gaps Identificados e Resolvidos

1. AuthController sem testes → +10 tests
2. useFavorites hook → +8 tests
3. Error states não testados → +12 tests

## E2E Criados

- login.e2e.ts: login/logout flow
- favorites.e2e.ts: add/remove favorites
```

## Labels

`testing`, `quality`, `coverage`, `copilot-agent`, `priority:high`
