# Task 12: Code Quality Review & Refactoring

## Objetivo
Realizar análise completa de qualidade de código, identificando code smells, violações de padrões e oportunidades de refatoração.

## Escopo

### Backend Java

#### 1. Análise Estática
- [ ] Executar análise com SonarQube/Spotless rules
- [ ] Identificar code smells (métodos longos, classes grandes)
- [ ] Verificar duplicação de código
- [ ] Analisar complexidade ciclomática

#### 2. Padrões de Design
- [ ] Revisar uso de DTOs vs Entities
- [ ] Verificar separação de responsabilidades (SRP)
- [ ] Analisar injeção de dependência
- [ ] Revisar tratamento de exceções

#### 3. Estrutura de Código
```
Verificar:
- [ ] Controllers: apenas orquestração, sem lógica de negócio
- [ ] Services: lógica de negócio encapsulada
- [ ] Repositories: acesso a dados isolado
- [ ] DTOs: validações com Jakarta Validation
```

#### 4. Performance Patterns
- [ ] Identificar N+1 queries
- [ ] Verificar uso de cache onde apropriado
- [ ] Analisar operações síncronas vs assíncronas
- [ ] Revisar paginação de resultados

### Frontend Mobile

#### 5. React Patterns
- [ ] Verificar hooks customizados - responsabilidade única
- [ ] Analisar gerenciamento de estado (Context vs local)
- [ ] Revisar memoização (useMemo, useCallback, React.memo)
- [ ] Verificar componentização adequada

#### 6. TypeScript Quality
- [ ] Identificar uso excessivo de `any`
- [ ] Verificar types vs interfaces
- [ ] Analisar null/undefined handling
- [ ] Revisar generics onde aplicável

#### 7. Estrutura de Pastas
```
Verificar convenções:
- [ ] components/ - componentes reutilizáveis
- [ ] screens/ ou pages/ - telas
- [ ] hooks/ - hooks customizados
- [ ] services/ - chamadas API
- [ ] utils/ - funções utilitárias
- [ ] types/ - definições de tipos
```

### Frontend Admin

#### 8. React Query Patterns
- [ ] Verificar cache strategy
- [ ] Analisar invalidation patterns
- [ ] Revisar error boundaries
- [ ] Verificar loading states

## Checklist de Análise

### Code Smells a Identificar
- [ ] Funções/métodos > 50 linhas
- [ ] Classes > 300 linhas
- [ ] Parâmetros > 4 em funções
- [ ] Nesting > 3 níveis
- [ ] Magic numbers/strings
- [ ] Código comentado
- [ ] TODOs/FIXMEs abandonados

### Padrões a Verificar
- [ ] Nomenclatura consistente (camelCase, PascalCase)
- [ ] Imports organizados
- [ ] Constantes extraídas
- [ ] Error handling consistente
- [ ] Logging apropriado

## Critérios de Aceitação

1. **Relatório de Qualidade**: Criar `CODE_QUALITY_REPORT.md` com:
   - Métricas de qualidade por módulo
   - Lista de issues encontradas
   - Recomendações priorizadas

2. **Refatorações Aplicadas**:
   - Extrair métodos/funções longas
   - Eliminar código duplicado
   - Corrigir violações de padrões

3. **Testes Mantidos**:
   - Todos os testes existentes passando
   - Novos testes para código refatorado

## Output Esperado

```markdown
# CODE_QUALITY_REPORT.md

## Métricas Gerais
| Módulo | Linhas | Arquivos | Complexidade Média |
|--------|--------|----------|-------------------|
| Backend | X | Y | Z |
| Mobile | X | Y | Z |
| Admin | X | Y | Z |

## Issues por Categoria
### Code Smells (X encontrados)
### Duplicação (X instâncias)
### Complexidade Alta (X métodos)

## Refatorações Realizadas
1. Extraído `XyzService` de `AbcController`
2. Criado hook `useXyz` para lógica compartilhada

## Testes Adicionados
- `XyzService.test.ts`
```

## Labels
`code-quality`, `refactoring`, `copilot-agent`, `priority:medium`
