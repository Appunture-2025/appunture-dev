# ADR-001: Firestore como Database

## Status

Accepted

## Context

O projeto Appunture precisa de um banco de dados que atenda aos seguintes requisitos:

1. **Custo zero** durante o desenvolvimento do TCC
2. **Escalabilidade automática** sem necessidade de configuração manual
3. **Integração mobile-first** com suporte a offline e sincronização
4. **Baixa manutenção** para foco no desenvolvimento de features
5. **Performance** adequada para consultas de pontos de acupuntura

### Situação Anterior

- Backend Node.js + PostgreSQL
- Custos de hosting PostgreSQL: $15-30/mês (RDS, Digital Ocean, etc.)
- Sincronização offline exigia implementação manual complexa
- Backup e manutenção manuais

## Decision

Utilizaremos **Google Cloud Firestore** como banco de dados principal do projeto.

### Justificativas

1. **Free Tier Generoso**
   - 50.000 leituras/dia
   - 20.000 escritas/dia
   - 1 GiB de armazenamento
   - Mais que suficiente para o escopo do TCC

2. **Integração Nativa com Firebase**
   - SDK mobile com suporte offline built-in
   - Sincronização automática quando reconecta
   - Listeners em tempo real (se necessário)

3. **Serverless**
   - Zero configuração de infraestrutura
   - Escalabilidade automática
   - Backups automáticos

4. **Flexibilidade de Schema**
   - Modelo NoSQL documento-orientado
   - Fácil evolução do schema
   - Queries por campos específicos

## Consequences

### Positivas

- ✅ **Custo zero** durante desenvolvimento e uso moderado
- ✅ **Sincronização offline** nativa no SDK mobile
- ✅ **Escalabilidade automática** sem intervenção
- ✅ **Manutenção zero** - serviço gerenciado
- ✅ **Integração perfeita** com Firebase Auth e Storage
- ✅ **Performance otimizada** para leituras frequentes
- ✅ **Backup automático** e recuperação de desastres

### Negativas

- ❌ **Queries limitadas** comparado a SQL
  - Sem JOINs nativos
  - Índices compostos precisam ser criados manualmente
  - Ordenação limitada a campos indexados
- ❌ **Vendor lock-in** com Google Cloud
- ❌ **Modelagem diferente** - requer pensar em termos de documentos
- ❌ **Custos podem aumentar** significativamente em escala (pós-TCC)

### Mitigações

- Para queries complexas: desnormalização de dados
- Para JOINs: subcollections ou campos duplicados
- Para vendor lock-in: camada de abstração no repository

## Alternatives Considered

### PostgreSQL (mantido)

**Prós:**
- SQL completo e queries complexas
- Integridade referencial
- Amplamente conhecido

**Contras:**
- Custo mensal ($15-30+)
- Manutenção de infraestrutura
- Sincronização offline manual

**Rejeitado por:** Custo e complexidade de manutenção

### MongoDB Atlas

**Prós:**
- Free tier de 512MB
- Queries mais flexíveis que Firestore
- Familiar para muitos devs

**Contras:**
- Sem integração nativa com Firebase Auth
- Limite de armazenamento baixo
- Sincronização offline manual

**Rejeitado por:** Falta de integração com Firebase

### Supabase (PostgreSQL)

**Prós:**
- PostgreSQL gerenciado
- Free tier generoso
- SDK mobile com realtime

**Contras:**
- Menos integrado que Firebase
- Menor comunidade
- Autenticação separada

**Rejeitado por:** Preferência por stack unificada Firebase

## Referências

- [Firestore Pricing](https://firebase.google.com/pricing)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Comparing Firestore vs PostgreSQL](https://firebase.google.com/docs/firestore/rtdb-vs-firestore)
