# 📱 Análise Completa do Frontend Mobile — 25/11/2025

## 1. Sumário Executivo

- **Stack:** React Native (Expo 53) + TypeScript + Zustand + SQLite
- **Status geral:** ~55% concluído (features essenciais presentes, porém sem cobertura de testes nem modo admin)
- **Principais gaps:** RBAC visual, atlas de imagens embutido, mapa corporal dinâmico, workflows admin/CRUD, testes automatizados e sincronização offline confiável.
- **Risco para release em 2 semanas:** Alto, se as frentes críticas (admin + body map + testes) não começarem imediatamente em paralelo.

## 2. O que já está estável

| Área         | Situação atual                                                                     |
| ------------ | ---------------------------------------------------------------------------------- |
| Autenticação | Firebase Auth integrado, login/registro funcionando, sync perfil Firestore         |
| Navegação    | Estrutura de tabs + rotas auxiliares consolidada                                   |
| Stores       | `authStore`, `pointsStore`, `symptomsStore`, `syncStore` criados (sync incompleto) |
| Sintomas     | Listagem, busca, categorias e detalhes consumindo API                              |
| Favoritos    | Toggle remoto/local funciona; precisa reconciliação offline                        |
| UI geral     | Telas principais (home, busca, detalhes) responsivas e com loading states básicos  |

## 3. Entregas pendentes por prioridade

### 🔥 Alta (bloqueia release)

1. **Modo Admin + RBAC visual**
   - Persistir claims/role no `authStore`, esconder tabs/rotas, proteger navegação.
   - Implementar stack `admin/` com cards para CRUD de pontos/sintomas + painel de usuários (`/admin/**`).
   - Testes Jest simulando usuários ADMIN vs USER.
2. **Galeria & Body Map com assets embutidos**
   - Versionar atlas de imagens dentro de `assets/body-map/**`, mapear por `pointId`/meridiano.
   - Atualizar `PointCard`, `point-details.tsx`, `ImageGallery` para múltiplas imagens locais (swipe/zoom).
   - Body map deve consumir coordenadas do backend e referenciar imagens locais (sem upload).
   - Smoke tests garantindo navegação offline.
3. **Mapa corporal dinâmico**
   - Renderizar pontos com coordenadas vindas da API, zoom/pan, filtros por meridiano/região.
   - Navegação do mapa → detalhes do ponto + highlight dos meridianos.
4. **Suite de testes e2e/unit**
   - Configurar Jest/RTL com mocks existentes.
   - Cobrir stores críticos (`authStore`, `pointsStore`).
   - Criar smoke tests para admin flow, favoritos e body map.
5. **Modo offline confiável**
   - Finalizar `syncStore`: fila de operações, indicador offline, reconcile automático.
   - Download de dados essenciais (pontos, sintomas, atlas) para uso offline.

### ⚙️ Média

- **Perfil completo:** edição de telefone/profissão/foto (referenciando assets ou Firebase Storage apenas para foto), status de e-mail, claims.
- **Filtros & estatísticas:** chips persistentes, tela "Insights" com `/points/stats` e `/symptoms/stats`.
- **Navegação por meridiano:** UI dedicada com listagem e detalhes por meridiano.
- **Health check & conectividade:** indicador no app, retry automático, log de latência.

### 💤 Baixa

- UX consistente (design tokens, mensagens PT-BR), onboarding guiado, dark mode, acessibilidade, i18n, notificações push, histórico de buscas/notas pessoais (aguardando decisão com backend).

## 4. Lacunas técnicas críticas

| Tema              | Problema                                  | Consequência                      | Ação sugerida                                       |
| ----------------- | ----------------------------------------- | --------------------------------- | --------------------------------------------------- |
| Tipos e contratos | `Point` ainda usa `image_url`/`number` ID | Crash ao consumir dados reais     | Atualizar `types/api.ts` + adapters                 |
| Role-based UI     | Stores não guardam claims                 | Usuários comuns veem botões admin | Persistir claims + guardas de rota                  |
| Atlas de imagens  | Dependência de upload removida            | Mapa não mostra assets corretos   | Criar convenção `pointId -> asset` + bundler        |
| Testes            | Cobertura 0%                              | Sem garantia de regressão         | Montar suíte mínima (stores + componentes críticos) |
| Sync offline      | `syncStore` incompleto                    | Possível perda de dados/favoritos | Implementar fila + mensagens claras                 |

## 5. Plano de ação (próximas 2 semanas)

1. **Semana 1**
   - RBAC + stack admin
   - Refatorar tipos/pontos + atlas embutido
   - Consumir coordenadas reais no body map
   - Criar 5 testes Jest cobrindo stores principais
2. **Semana 2**
   - Completar CRUD admin (pontos/sintomas) e dashboards
   - Finalizar galeria + body map (swipe/zoom, filtros)
   - Elasticidade offline + health indicator
   - Ampliar cobertura de testes (componentes) e preparar smoke manual

## 6. Critérios de pronto para o frontend

- RBAC funcional + telas admin restritas.
- Body map interativo com assets locais sincronizados a partir das coordenadas do backend.
- Galeria de pontos renderiza múltiplas imagens offline.
- Testes automatizados executados no CI (mín. 10 casos cobrindo stores e fluxos críticos).
- UX consistente com mensagens PT-BR e indicadores de conectividade/offline.
- Checklist de QA (login → admin → body map → favoritos) passando em dispositivos reais.
