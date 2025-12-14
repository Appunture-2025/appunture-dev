# Appunture - Guia de Deploy para Produção

## Visão Geral

Este documento descreve como fazer o deploy da aplicação Appunture para ambiente de produção.

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   Cloud Run     │────▶│   Firestore     │
│   (Expo/RN)     │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Firebase      │     │   Vertex AI     │     │   Cloud Storage │
│   Auth          │     │   (Gemini)      │     │   (Images)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## URLs de Produção

- **Backend API**: https://appunture-backend-756244484248.us-central1.run.app/api
- **Firebase Console**: https://console.firebase.google.com/project/appunture-tcc
- **GCP Console**: https://console.cloud.google.com/run?project=appunture-tcc

---

## 1. Deploy do Backend (Cloud Run)

### Pré-requisitos

1. **gcloud CLI** instalado e configurado
2. **Docker** instalado
3. Acesso ao projeto GCP `appunture-tcc`
4. Secret `firebase-service-account` configurado no Secret Manager

### Opção A: Deploy Automático (Cloud Build)

```bash
cd backend-java
gcloud builds submit --config=cloudbuild.yaml ..
```

### Opção B: Deploy Manual

```bash
cd backend-java
chmod +x deploy-prod.sh
./deploy-prod.sh
```

### Verificar Deploy

```bash
# Verificar status do serviço
gcloud run services describe appunture-backend --region us-central1

# Ver logs
gcloud run services logs read appunture-backend --region us-central1 --limit 50

# Testar health check
curl https://appunture-backend-756244484248.us-central1.run.app/api/actuator/health
```

---

## 2. Build do App Mobile (EAS)

### Pré-requisitos

1. **EAS CLI** instalado: `npm install -g eas-cli`
2. Conta Expo configurada
3. Arquivo `google-services.json` presente

### Build de Produção (Android)

```bash
cd frontend-mobile/appunture

# Login no EAS
eas login

# Build para produção (AAB para Play Store)
eas build --platform android --profile production

# Build APK para testes
eas build --platform android --profile preview
```

### Build de Desenvolvimento

```bash
# APK de desenvolvimento
eas build --platform android --profile development
```

### Verificar Builds

```bash
# Listar builds
eas build:list

# Ver status do último build
eas build:view
```

---

## 3. Configurações de Ambiente

### Frontend (.env)

O arquivo `.env` já está configurado para produção:

```env
EXPO_PUBLIC_API_BASE_URL=https://appunture-backend-756244484248.us-central1.run.app/api
EXPO_PUBLIC_FIREBASE_PROJECT_ID=appunture-tcc
```

### Backend (application-prod.yml)

Variáveis de ambiente no Cloud Run:
- `SPRING_PROFILES_ACTIVE=prod`
- `GOOGLE_CLOUD_PROJECT=appunture-tcc`
- `FIREBASE_PROJECT_ID=appunture-tcc`
- `FIREBASE_ENABLED=true`
- `FIREBASE_STORAGE_BUCKET=appunture-tcc.firebasestorage.app`

Secret:
- `GOOGLE_APPLICATION_CREDENTIALS` → Secret Manager: `firebase-service-account`

---

## 4. Checklist de Produção

### Backend
- [x] Configuração de CORS para produção
- [x] Rate limiting habilitado
- [x] Autenticação Firebase configurada
- [x] Logs em nível INFO
- [x] Health checks configurados
- [x] Secret Manager para credenciais

### Frontend
- [x] API URL apontando para produção
- [x] Firebase configurado
- [x] Google Sign-In configurado
- [x] EAS configurado para builds

### Segurança
- [x] HTTPS obrigatório
- [x] Tokens JWT validados
- [x] CORS restrito
- [x] Headers de segurança configurados

---

## 5. Monitoramento

### Cloud Run
- **Métricas**: https://console.cloud.google.com/run/detail/us-central1/appunture-backend/metrics
- **Logs**: https://console.cloud.google.com/run/detail/us-central1/appunture-backend/logs

### Firebase
- **Auth**: https://console.firebase.google.com/project/appunture-tcc/authentication
- **Firestore**: https://console.firebase.google.com/project/appunture-tcc/firestore
- **Storage**: https://console.firebase.google.com/project/appunture-tcc/storage

---

## 6. Troubleshooting

### Backend não inicia
```bash
# Ver logs de erro
gcloud run services logs read appunture-backend --region us-central1 --limit 100

# Verificar se o secret existe
gcloud secrets versions access latest --secret=firebase-service-account
```

### Erro de autenticação
1. Verificar se o token Firebase está sendo enviado no header `Authorization: Bearer <token>`
2. Verificar se o projeto Firebase está correto
3. Verificar logs do backend para erros de validação de token

### App não conecta ao backend
1. Verificar se a URL da API está correta no `.env`
2. Verificar se o CORS está configurado corretamente
3. Testar a API diretamente: `curl https://appunture-backend-756244484248.us-central1.run.app/api/actuator/health`

---

## 7. Rollback

### Backend
```bash
# Listar revisões
gcloud run revisions list --service appunture-backend --region us-central1

# Rollback para revisão anterior
gcloud run services update-traffic appunture-backend \
    --region us-central1 \
    --to-revisions REVISION_NAME=100
```

### Frontend
- Builds anteriores ficam disponíveis no EAS
- Para rollback, faça um novo build com a versão anterior do código

---

## Contatos

- **Projeto**: Appunture TCC
- **Firebase Project ID**: appunture-tcc
- **GCP Project Number**: 756244484248
