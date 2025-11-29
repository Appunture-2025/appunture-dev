# 🚀 Production Checklist - Appunture

> Checklist completo para deploy em produção do app Appunture.
> Data: 29/11/2025

## ✅ Status Geral

| Área            | Status   | Observações                     |
| --------------- | -------- | ------------------------------- |
| Backend Java    | ✅ Ready | Cloud Run configurado           |
| Frontend Mobile | ✅ Ready | Expo SDK 53, Firebase integrado |
| Firebase        | ✅ Ready | Auth, Firestore, Storage        |
| CI/CD           | ✅ Ready | GitHub Actions configurado      |
| Testes          | ✅ Ready | 137 testes passando             |

---

## 🔐 1. Segurança

### Backend (Spring Boot)

- [x] **HTTPS obrigatório** - Cloud Run força HTTPS automaticamente
- [x] **CORS configurado** - `WebConfig.java` com origens permitidas
- [x] **Rate Limiting** - Bucket4j implementado (`RateLimitingFilter.java`)
- [x] **Firebase Authentication** - Tokens validados em todos os endpoints protegidos
- [x] **Correlation ID** - Rastreamento de requisições (`CorrelationIdFilter.java`)
- [x] **Input Validation** - DTOs com validações Bean Validation
- [x] **Structured Logging** - JSON logs com contexto (`LoggingFilter.java`)
- [x] **Secrets em variáveis de ambiente** - Não hardcoded no código

### Frontend (React Native/Expo)

- [x] **Expo SecureStore** - Tokens armazenados de forma segura
- [x] **Logger condicional** - Console.log removidos em produção
- [x] **Validação de inputs** - Forms validados
- [x] **Firebase Auth** - Google e Apple Sign-In
- [x] **Offline-first** - Sincronização com cache local

### Firebase

- [x] **Security Rules** - Firestore e Storage rules configuradas
- [x] **Service Account** - Mínimo privilégio necessário
- [x] **App Check** - (Opcional) Proteção contra abuso

---

## ⚡ 2. Performance

### Backend

- [x] **Firestore Indexes** - Índices compostos criados
- [x] **Pagination** - Endpoints paginados
- [x] **Gzip Compression** - Spring Boot compressão habilitada
- [x] **Actuator Metrics** - `/actuator/prometheus` disponível
- [ ] **Redis Cache** - (Opcional) Para dados frequentes

### Frontend

- [x] **Image Caching** - `imageCache.ts` implementado
- [x] **Lazy Loading** - Componentes carregados sob demanda
- [x] **FlashList** - Listas virtualizadas
- [x] **Expo Image** - Otimização de imagens
- [x] **Bundle Size** - Assets otimizados

---

## 🧪 3. Testes

### Backend

- [x] **Unit Tests** - 57+ testes JUnit
- [x] **Integration Tests** - Controllers testados
- [x] **JaCoCo Coverage** - Relatório de cobertura

### Frontend

- [x] **Jest Tests** - 137 testes passando
- [x] **Store Tests** - authStore, pointsStore, syncStore
- [x] **Component Tests** - ImageGallery, CachedImage, ErrorBoundary
- [x] **Service Tests** - API, Auth, ImageCache

### E2E

- [x] **Postman Collection** - `integration-tests/postman/`
- [x] **Newman CI** - Workflow `integration-tests.yml`
- [ ] **Detox** - Testes E2E mobile (opcional)

---

## 🔄 4. CI/CD

### GitHub Actions

- [x] **backend-ci.yml** - Build, test, deploy Cloud Run
- [x] **frontend-ci.yml** - Lint, test, TypeScript check
- [x] **integration-tests.yml** - Newman collection
- [x] **seed-pipeline.yml** - Dados de seed

### Deploy

- [x] **Cloud Run** - Backend Java configurado
- [x] **EAS Build** - Expo builds configurados
- [x] **Environment Variables** - Secrets no GitHub

---

## 📱 5. App Stores

### Google Play

- [ ] **App Signing** - Keystore configurado
- [ ] **Privacy Policy** - Link configurado
- [ ] **Screenshots** - 5+ screenshots por idioma
- [ ] **Description** - Textos em PT-BR e EN

### Apple App Store

- [x] **Apple Sign-In** - Implementado (obrigatório)
- [ ] **App Store Connect** - Conta configurada
- [ ] **Privacy Labels** - Configurados
- [ ] **Screenshots** - iPhone e iPad

---

## 📊 6. Observabilidade

### Métricas

- [x] **Spring Actuator** - `/actuator/health`, `/actuator/prometheus`
- [x] **Request Logging** - Correlation ID em todas as requisições
- [ ] **Grafana Dashboard** - (Opcional) Visualização de métricas
- [ ] **Alertas** - PagerDuty/Slack para erros críticos

### Logs

- [x] **Structured JSON** - Logs em formato JSON
- [x] **Correlation ID** - Rastreamento de requisições
- [x] **Error Tracking** - Stack traces capturados
- [ ] **Log Aggregation** - Cloud Logging / ELK (opcional)

---

## 🔔 7. Push Notifications (FCM)

- [x] **NotificationService.java** - Serviço backend implementado
- [x] **NotificationController.java** - Endpoints REST
- [x] **notificationService.ts** - Serviço frontend
- [x] **useNotifications.ts** - Hook React para notificações
- [x] **FCM Token Registration** - Registro de tokens no backend
- [ ] **Firebase Console** - Campanhas de notificação

---

## 📝 8. Documentação

- [x] **README.md** - Instruções de setup
- [x] **SETUP_CONFIGURACAO.md** - Guia de configuração
- [x] **DECISOES_ARQUITETURA.md** - Decisões técnicas
- [x] **API OpenAPI** - Especificação OpenAPI 3.0
- [x] **Postman Collection** - Documentação de endpoints

---

## 🚀 9. Checklist Final de Deploy

### Pré-Deploy

1. [ ] Executar todos os testes localmente
2. [ ] Verificar variáveis de ambiente em produção
3. [ ] Backup do Firestore (se houver dados)
4. [ ] Comunicar equipe sobre deploy

### Deploy

1. [ ] Push para branch `main`
2. [ ] Aguardar CI/CD verde
3. [ ] Verificar logs do Cloud Run
4. [ ] Testar endpoints críticos

### Pós-Deploy

1. [ ] Verificar health check: `GET /actuator/health`
2. [ ] Testar login (Google/Apple)
3. [ ] Verificar sincronização de dados
4. [ ] Monitorar métricas por 1 hora
5. [ ] Comunicar sucesso do deploy

---

## 📞 10. Contatos de Emergência

| Função   | Responsável | Contato |
| -------- | ----------- | ------- |
| Backend  | -           | -       |
| Frontend | -           | -       |
| DevOps   | -           | -       |
| Firebase | -           | -       |

---

## 📚 Referências

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)

---

> Última atualização: 29/11/2025
