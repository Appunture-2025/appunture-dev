# Análise Frontend Mobile (React Native + Expo) – 27/11/2025

## 1. Visão Geral

- Base atual documentada em `frontend-mobile/appunture/README.md`: app Expo Router 0.79 com Zustand, SQLite e sync offline.
- Estrutura modular reorganizada (`ESTRUTURA_NOVA.md`) e dependências saneadas (`DEPENDENCIAS_RESOLVIDAS.md`).
- Offline sync entregue 100% com testes (`SYNC_IMPLEMENTATION_COMPLETE.md`), mas upload real para Storage segue pendente (`stores/syncStore.ts`).

## 2. Escopo Entregue (≈70%)

| Domínio                                           | Status | Evidências                                                            |
| ------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| Estrutura de navegação (Expo Router, screens)     | 90%    | `ESTRUTURA_NOVA.md`, pastas `app/` e `screens/` separadas             |
| Stores e sync offline                             | 100%   | `stores/syncStore.ts`, doc T03 com cobertura de testes                |
| Serviços API + Firebase wrappers                  | 80%    | `services/api.ts`, `services/firebase.ts`                             |
| UI/UX principais (login, welcome, home, body map) | 65%    | componentes prontos porém precisam ajustes de design e acessibilidade |
| Testes (stores e fluxo admin)                     | 60%    | `__tests__/` com suites rodando via Jest                              |
| Web build/Expo web                                | 50%    | Limpezas feitas (`DEBUG_WEB.md`), mas build web ainda instável        |

## 3. Lacunas e Itens Pendentes

1. **Configuração de Ambientes e API Base** (Alta)
   - `utils/constants.ts` ainda usa `http://localhost:3000` como padrão; deve apontar para backend Java (`8080` ou domínio Cloud Run) e validar variáveis `EXPO_PUBLIC_API_BASE_URL`.
2. **Upload de Imagens/Storage** (Alta)
   - `syncStore.ts` mantém TODO para upload real ao Firebase Storage; funcionalidade está stubada, impedindo sincronização de mídias.
3. **Integração Completa com Backend Java** (Alta)
   - `services/api.ts` cobre endpoints principais, porém precisa revisar payloads (auth/login/register herdados do backend antigo) e alinhar com `/auth/profile`/`/auth/sync` do Spring Boot.
4. **Experiência Web/Admin** (Média)
   - `DEBUG_WEB.md` mostra limpeza, mas ainda não há confirmação de build web funcional; verificar expo-router web e flows admin (login/admin dashboards).
5. **E2E/Detox e Cobertura UI** (Média)
   - Testes existentes focam em stores. Falta cobertura para telas (`screens/*`) e flows críticos (login → sync → mapa corporal).
6. **Publicação e Branding** (Baixa)
   - `app.json` ainda contém placeholders para chaves Firebase e assets. Necessário configurar ícones, splash, package name, builds `eas.json` para produção.

## 4. Dependências e Bloqueios

- **Backend**: precisa expor ambiente estável para QA; sem URL definitiva, mobile segue apontando para localhost.
- **Seed/Data**: telas dependem de catálogo completo para validação (ver análise do seed). Sem dados reais, mapa/sugestões ficam vazios.
- **Assets**: imagens em `assets/body-map/*.svg` dependem de coordenas do backend (endpoint `/points/{id}` com `coordinates`).

## 5. Próximas Ações Recomendadas

| Ordem | Ação                                                                                                                        | Responsável      | Prazo Est. |
| ----- | --------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- |
| 1     | Atualizar `API_BASE_URL` + `.env`/`app.json` com endpoints do backend Java e validar todas as chamadas (`services/api.ts`). | Mobile Lead      | 0,5 dia    |
| 2     | Implementar upload real de imagens usando `firebaseStorage` ou endpoint `/storage/upload` e remover TODO em `syncStore.ts`. | Mobile + Backend | 1 dia      |
| 3     | Revisar flows de autenticação: alinhar login/register com Firebase Auth (usar `firebaseAuth` + `authStore`).                | Mobile           | 1 dia      |
| 4     | Expandir testes UI (React Native Testing Library) para telas principais + Detox smoke test.                                 | QA/Mobile        | 1,5 dia    |
| 5     | Configurar builds EAS + branding (ícones, splash, permissões).                                                              | Mobile/Design    | 1 dia      |
| 6     | Validar compatibilidade web/admin após limpeza e documentar passo a passo.                                                  | Frontend Web     | 1 dia      |

## 6. Percentual Restante e Observações

- Estimamos **70% concluído** para o app mobile considerando funcionalidades core entregues; faltam **30%** focados em integração final, mídia/storage, ajustes UX e publicação.
- Para declarar "frontend pronto", imprescindível: apontar para backend definitivo, rodar suíte de testes (unit + UI), validar offline/online com seeds reais e preparar builds (Android/iOS/Web) com configurações de produção.
