# Task 16: Error Handling & Resilience Review

## Objetivo

Revisar e melhorar o tratamento de erros em toda a aplicação, garantindo resiliência e boa experiência do usuário.

## Escopo

### Backend Java

#### 1. Global Exception Handling

- [ ] Verificar `@ControllerAdvice` implementado
- [ ] Padronizar formato de erro
- [ ] Mapear exceções para HTTP status codes
- [ ] Não expor stack traces em produção

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

#### 2. Validação de Input

- [ ] Jakarta Validation em todos os DTOs
- [ ] Mensagens de erro customizadas
- [ ] Validação de business rules nos Services
- [ ] Sanitização de inputs

```java
public record CreatePointRequest(
    @NotBlank(message = "Code is required")
    @Size(max = 10, message = "Code must be at most 10 characters")
    String code,

    @NotBlank(message = "Name is required")
    String name
) {}
```

#### 3. Firestore Error Handling

- [ ] Retry policy para transient errors
- [ ] Timeout configuration
- [ ] Fallback strategies
- [ ] Circuit breaker (opcional)

#### 4. External Service Errors

- [ ] Firebase Auth errors mapeados
- [ ] Storage errors tratados
- [ ] Timeout handling

### Frontend Mobile

#### 5. Error Boundaries

- [ ] Implementar ErrorBoundary component
- [ ] Fallback UI para crashes
- [ ] Error reporting (Sentry/Crashlytics)

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
      );
    }
    return this.props.children;
  }
}
```

#### 6. API Error Handling

- [ ] Interceptor Axios para erros
- [ ] Toast/Alert para erros de usuário
- [ ] Retry automático para network errors
- [ ] Offline handling

```tsx
// axios interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - refresh or logout
    }
    if (!error.response) {
      // Network error - show offline message
    }
    return Promise.reject(error);
  }
);
```

#### 7. Form Validation

- [ ] Validação client-side consistente
- [ ] Mensagens de erro claras
- [ ] Highlight de campos com erro
- [ ] Async validation (username disponível, etc)

#### 8. Loading & Empty States

- [ ] Skeleton loading
- [ ] Empty state messages
- [ ] Error state com retry
- [ ] Timeout handling

### Frontend Admin

#### 9. React Query Error Handling

- [ ] onError callbacks
- [ ] Error pages (404, 500)
- [ ] Toast notifications
- [ ] Retry buttons

```tsx
const { data, error, refetch } = useQuery({
  queryKey: ["points"],
  queryFn: getPoints,
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});

if (error) {
  return <ErrorState message={error.message} onRetry={refetch} />;
}
```

## Checklist de Erros

### Tipos de Erro a Tratar

- [ ] Validation errors (400)
- [ ] Authentication errors (401)
- [ ] Authorization errors (403)
- [ ] Not found errors (404)
- [ ] Rate limiting (429)
- [ ] Server errors (500)
- [ ] Network errors
- [ ] Timeout errors

### UX de Erro

- [ ] Mensagens user-friendly
- [ ] Ações claras (retry, contact support)
- [ ] Não perder dados do usuário
- [ ] Log para debugging

## Critérios de Aceitação

1. **Error Handling Consistente**:

   - Formato de erro padronizado backend
   - Tratamento em todos os endpoints
   - Error boundaries no frontend

2. **Resiliência**:

   - Retry automático para transient errors
   - Graceful degradation
   - Offline support básico

3. **Observabilidade**:
   - Erros logados com contexto
   - Error reporting configurado
   - Métricas de erro rate

## Output Esperado

````markdown
# ERROR_HANDLING_REVIEW.md

## Resumo

- Endpoints revisados: 25
- Error handlers adicionados: 8
- Error boundaries: 3

## Padrão de Erro Implementado

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Invalid email format" }],
    "timestamp": "2025-11-28T...",
    "traceId": "abc123"
  }
}
```
````

## Melhorias Implementadas

### Backend

- GlobalExceptionHandler criado
- Retry policy para Firestore
- Validações em todos os DTOs

### Frontend

- ErrorBoundary em App.tsx
- Axios interceptors configurados
- Toast notifications para erros

## Testes de Resiliência

- [x] Backend responde 503 → Frontend retry
- [x] Token expirado → Refresh automático
- [x] Network offline → Mensagem apropriada

```

## Labels
`error-handling`, `resilience`, `copilot-agent`, `priority:high`
```
