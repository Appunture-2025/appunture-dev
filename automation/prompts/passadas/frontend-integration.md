# Prompt – Frontend Firebase & Integração

## Contexto

- Status atual conforme `analises/ANALISE_FRONTEND_27NOV2025.md` e `analises/ANALISE_INTEGRACAO_27NOV2025.md`.
- App Expo Router com Firebase Auth, sync offline e API Axios, porém ainda chama endpoints legados `/auth/login`/`/auth/register`, possui `API_BASE_URL` incompleto e falta upload real.

## Objetivos específicos

1. Ajustar configuração de ambientes (`utils/constants.ts`, `.env`, `app.json`) para priorizar `EXPO_PUBLIC_API_BASE_URL` com fallback `http://localhost:8080/api` e apontar para backend Java/Cloud Run.
2. Remover endpoints legados de autenticação no `apiService` e stores; usar exclusivamente Firebase Auth client-side + `/auth/sync`/`/auth/profile`.
3. Implementar upload de imagens real (Firebase Storage via backend `/storage/upload` ou SDK) no `syncStore` e `mediaStorageService` com acompanhamento de progresso.
4. Ampliar testes (Jest/React Native Testing Library/Detox) cobrindo auth store, upload flow e telas chave.
5. Atualizar documentação (`frontend-mobile/appunture/README.md`, `SYNC_IMPLEMENTATION_COMPLETE.md`) e `.env.example`.

## Passos sugeridos

1. Revisar `frontend-mobile/appunture/utils/constants.ts` e garantir normalização do base URL.
2. Atualizar `services/api.ts`, `stores/authStore.ts`, testes e mocks para remover `login/register` e alinhar com Firebase.
3. Implementar upload real: reutilizar `apiService.uploadFile` ou integrar `firebaseStorage`. Garantir que fila offline (`syncStore.ts`) marque operações como concluídas, incrementando métricas e tratando falhas.
4. Criar/atualizar testes:
   - `__tests__/stores/authStore.test.ts` cobrindo fluxo Firebase-only.
   - Novos testes para `syncStore` (upload success/failure) e componentes UI relevantes.
5. Rodar `npm test`, `npx expo-doctor`, `npx expo lint`.
6. Atualizar docs e exemplos `.env`/`app.json` com variáveis `EXPO_PUBLIC_FIREBASE_*` e `EXPO_PUBLIC_API_BASE_URL`.

## Critérios de aceitação

- `npm test` e lint passam localmente/CI.
- App (expo start) consegue logar via Firebase + sincronizar profil e favoritos.
- Upload de imagens funciona online e offline (fila processada, logs sem TODOs).
- Documentação descreve configuração de ambientes e fluxo de upload.

## Rollback / Segurança

- Não commitar chaves reais; usar placeholders `your-...`.
- Se upload Firebase imediato falhar, garantir fallback para modo anterior (ex.: flag `ENABLE_STORAGE_UPLOAD=false`).
- Caso integrações quebrem, reverter módulo especifico mantendo commits separados.
