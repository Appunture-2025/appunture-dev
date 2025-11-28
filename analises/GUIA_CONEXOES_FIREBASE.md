# Guia Prático de Conexão com o Firebase

> Última atualização: 27/11/2025 · Responsável: Squad Mobile/Appunture

Este guia resume **todos os passos necessários para habilitar as conexões com Firebase Auth, Firestore e Storage** no ecossistema Appunture (frontend Expo/React Native + backend Spring Boot). Use-o como checklist antes de qualquer deploy ou diagnóstico.

---

## 1. Componentes Utilizados

| Camada                | Serviços Firebase                      | Uso no projeto                                                                             |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| Frontend (Expo)       | Auth + Storage (upload via API)        | Login por email/senha, obtenção de ID Token, sincronização com backend                     |
| Backend (Spring Boot) | Admin SDK (Auth + Firestore) e Storage | Validação do ID Token, criação/sincronização de perfis, geração de URLs de upload/download |
| Scripts/Tools         | Firebase CLI + Emulators               | Configuração inicial, testes locais quando necessário                                      |

---

## 2. Pré-Requisitos Globais

1. **Conta Firebase** com projeto ativo (ex.: `appunture-tcc`).
2. **Firebase CLI** instalado (`npm install -g firebase-tools`), com `firebase login` realizado.
3. **Service Account** (JSON) com permissões de Admin SDK.
4. **Bucket** padrão do Storage criado (recomendado: `us-central1`).
5. **Regras mínimas** aplicadas (vide `backend-java/FIREBASE_SETUP.md`).

> Dica: execute `backend-java/setup-firebase.sh` para automatizar boa parte da configuração inicial.

---

## 3. Backend Java (Spring Boot)

1. **Dependências**: o módulo já usa o Admin SDK; não instale nada adicional.
2. **Variáveis obrigatórias** (arquivo `.env`, `application.yml` ou secrets do ambiente):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (conteúdo JSON completo ou caminho para o arquivo)
   - `FIREBASE_STORAGE_BUCKET` (ex.: `appunture-tcc.appspot.com`)
3. **Ambientes**:
   - Produção/Staging: mantenha `firebase.enabled=true` (valor padrão).
   - Desenvolvimento offline: defina `FIREBASE_ENABLED=false` ou ajuste `application-dev.yml` conforme documentação.
4. **Testes**: ao subir o backend, valide `GET /api/health` e `GET /api/auth/profile` usando um ID Token real (gerado pelo frontend ou via emulador).

---

## 4. Frontend Mobile (Expo / React Native)

### 4.1 Variáveis públicas (Expo)

O arquivo `frontend-mobile/appunture/config/firebaseConfig.ts` espera os valores via **`expo.extra`** (app.json / app.config.js) ou **variáveis `EXPO_PUBLIC_*`**. Configure **todos** os campos abaixo:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...   # opcional (Analytics)
EXPO_PUBLIC_FIREBASE_DATABASE_URL=...     # opcional (caso use RTDB)
```

> Sem esses valores o app falha ao iniciar e os testes unitários não conseguem mockar o Firebase.

### 4.2 Dependências Expo

Já instaladas no projeto, mas confirme durante novos ambientes:

- `firebase`
- `expo-secure-store`
- `@react-native-async-storage/async-storage`
- `expo-image-picker`, `expo-image-manipulator` (uso indireto nos uploads)

Após definir as variáveis, execute `npx expo start -c` para garantir que o bundle enxergue os novos valores.

---

## 5. Fluxo de Autenticação

1. **Frontend** usa `signInWithEmailAndPassword` (Firebase Auth) ➜ obtém **ID Token** via `user.getIdToken(true)`.
2. Token é salvo via `expo-secure-store` (`services/storage.ts`).
3. **Backend** recebe `Authorization: Bearer <token>` e valida pelo Admin SDK (`firebaseAuth.verifyIdToken`).
4. Perfil é sincronizado usando `POST /api/auth/sync` + `GET /api/auth/profile`.

> Se o backend recusar o token, confira relógio da máquina (skew), regras do projeto e se o usuário existe no Firebase.

---

## 6. Uploads e Storage

1. O app envia imagens via `apiService.uploadFile` ➜ backend gera upload multiparte e persiste no bucket.
2. Opcionalmente é possível habilitar **upload direto** via Firebase Storage SDK, mas o fluxo atual passa pelo backend para aplicar validações (limites, naming).
3. Garanta que o bucket configurado no backend seja o mesmo do console exportado para o frontend (consistência de URLs).

---

## 7. Ambientes de Teste

| Cenário                                    | Estratégia                                                                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit tests (Jest)**                      | Mockar `../../config/firebaseConfig` e serviços Firebase (já existe em `__mocks__`). Certifique-se de ajustar cada suíte como feito em `authStore.test.ts`.    |
| **Desenvolvimento local com backend real** | Usar um usuário de teste real no Firebase e rodar Expo + Spring Boot apontando para o mesmo projeto.                                                           |
| **Modo offline/sem Firebase**              | Definir `FIREBASE_ENABLED=false` no backend e usar os _mocks_ locais do frontend; alguns recursos (login, sync) ficarão indisponíveis.                         |
| **Emulador Firebase**                      | Opcional. Execute `firebase emulators:start` e aponte as variáveis `FIREBASE_EMULATOR_HOST`/`FIREBASE_AUTH_EMULATOR_HOST` se desejar testes totalmente locais. |

---

## 8. Checklist Rápido

- [ ] Projeto Firebase criado e com Authentication + Storage habilitados.
- [ ] Service Account JSON disponível e configurado no backend.
- [ ] Variáveis `EXPO_PUBLIC_FIREBASE_*` populadas (ou `expo.extra`).
- [ ] `API_BASE_URL` ajustado (`utils/constants.ts`) para conversar com o backend correto.
- [ ] Usuário de teste criado no Firebase Auth para validar login.
- [ ] Testes `npm test` passando (mocks configurados onde necessário).

---

## 9. Referências Internas

- `backend-java/FIREBASE_SETUP.md`: documentação completa de provisioning e custos.
- `backend-java/setup-firebase.sh`: script para bootstrap.
- `frontend-mobile/appunture/config/firebaseConfig.ts`: fonte da verdade sobre variáveis esperadas.
- `frontend-mobile/appunture/services/firebase.ts`: inicialização única do Firebase App.

Em caso de dúvidas adicionais, registre na issue **#firebase-integration** do board ou consulte o time responsável pelo backend para validações de credenciais.
