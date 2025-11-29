# Architecture Decision Records

Este diretório contém os Architecture Decision Records (ADRs) do projeto Appunture.

## O que são ADRs?

ADRs são documentos que capturam decisões arquiteturais importantes junto com seu contexto e consequências. Eles servem como um registro histórico das escolhas técnicas do projeto.

## Índice

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](ADR-001-firestore.md) | Firestore como Database | Accepted | 2024-01 |
| [ADR-002](ADR-002-expo.md) | Expo vs React Native CLI | Accepted | 2024-01 |
| [ADR-003](ADR-003-firebase-auth.md) | Firebase Authentication | Accepted | 2024-01 |
| [ADR-004](ADR-004-api-structure.md) | Estrutura da API REST | Accepted | 2024-02 |

## Template ADR

Para criar um novo ADR, use o seguinte template:

```markdown
# ADR-XXX: Título da Decisão

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-YYY]

## Context

[Descreva o contexto e problema que levou a esta decisão]

## Decision

[Descreva a decisão tomada]

## Consequences

### Positivas
- ✅ Consequência positiva 1
- ✅ Consequência positiva 2

### Negativas
- ❌ Consequência negativa 1
- ❌ Consequência negativa 2

## Alternatives Considered

### Alternativa 1
[Descrição e por que foi rejeitada]

### Alternativa 2
[Descrição e por que foi rejeitada]
```

## Referências

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR Article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
