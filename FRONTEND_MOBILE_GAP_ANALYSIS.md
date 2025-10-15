# Análise de Lacunas: Frontend Mobile vs Backend Java

## 📋 Sumário Executivo

Este documento apresenta uma análise completa do backend Java (Spring Boot + Firebase/Firestore) e do frontend mobile (React Native + Expo) do projeto Appunture, identificando todas as funcionalidades, integrações e features que faltam ser implementadas no frontend mobile.

**Data da Análise:** 15 de outubro de 2025  
**Backend:** Spring Boot 3.2.5 + Java 17 + Firebase/Firestore  
**Frontend Mobile:** React Native (Expo 53.x) + TypeScript

---

## 🎯 Objetivo

Identificar e documentar todas as funcionalidades do backend Java que ainda não estão implementadas ou integradas no frontend mobile, priorizando pela importância e complexidade de implementação.

---

## 📊 Visão Geral da Arquitetura

### Backend Java - Estrutura Atual

```
Backend Java (Spring Boot)
├── Autenticação Firebase Auth
├── Banco de Dados Firestore (NoSQL)
├── Firebase Storage (Arquivos)
├── API REST Completa
├── Role-Based Access Control (RBAC)
└── Documentação OpenAPI/Swagger
```

**Controladores Disponíveis:**
- `FirestoreAuthController` - Autenticação e perfil de usuário (`/auth`)
- `FirestorePointController` - Pontos de acupuntura (`/points`)
- `FirestoreSymptomController` - Sintomas (`/symptoms`)
- `FirestoreAdminController` - Administração (`/admin`)
- `FirebaseStorageController` - Upload de arquivos (`/api/storage`)
- `FirestoreHealthController` - Verificação de saúde (`/health`)

### Frontend Mobile - Estrutura Atual

```
Frontend Mobile (React Native + Expo)
├── Telas em Tabs
│   ├── Home (index.tsx)
│   ├── Search (busca de pontos)
│   ├── Chatbot (assistente IA)
│   ├── Favorites (favoritos)
│   └── Profile (perfil)
├── Telas Auxiliares
│   ├── Login
│   ├── Register
│   ├── Welcome
│   ├── Body Map (mapa corporal)
│   └── Point Details
├── Stores (Zustand)
│   ├── authStore
│   ├── pointsStore
│   └── syncStore
└── Services
    ├── api.ts
    ├── database.ts (SQLite)
    ├── nlp.ts
    └── storage.ts
```

---

## 🚨 LACUNAS CRÍTICAS (Alta Prioridade)

### 1. **Integração com Firebase Auth**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- FirebaseAuthController com endpoints completos
- Autenticação via Firebase Auth + Firestore
- Custom claims para roles (USER/ADMIN)
- Token de autenticação Firebase

**Frontend Atual:**
- Usa autenticação básica com email/senha (não Firebase)
- API service usa Bearer token padrão
- Não integra com Firebase SDK
- Sem suporte a autenticação social (Google, Apple, etc.)

**O Que Falta:**
1. ✅ Instalar Firebase SDK no React Native
2. ✅ Configurar Firebase Authentication
3. ✅ Implementar login/registro via Firebase
4. ✅ Atualizar authStore para usar Firebase Auth
5. ✅ Implementar sincronização de usuário (`POST /auth/sync`)
6. ✅ Implementar refresh de tokens Firebase
7. ✅ Adicionar login social (Google/Apple)

**Endpoints Backend Não Utilizados:**
- `POST /auth/sync` - Sincronizar usuário Firebase com Firestore
- `GET /auth/me` - Obter informações do token Firebase + perfil

---

### 2. **Sistema de Favoritos**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend Disponível:**
- `POST /auth/favorites/{pointId}` - Adicionar favorito
- `DELETE /auth/favorites/{pointId}` - Remover favorito
- Lista de favoritos armazenada em FirestoreUser
- Estatísticas de favoritos por ponto

**Frontend Atual:**
- Interface de favoritos implementada
- Store com métodos de favoritos
- **PROBLEMA:** API calls usam endpoints incorretos (`/favorites` ao invés de `/auth/favorites/{pointId}`)

**O Que Falta:**
1. ✅ Corrigir endpoints da API de favoritos
2. ✅ Sincronizar favoritos entre local e remoto
3. ✅ Implementar contador de favoritos nos cards
4. ✅ Mostrar pontos populares baseado em favoritos

---

### 3. **Perfil de Usuário Completo**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend Disponível:**
- `GET /auth/profile` - Obter perfil completo
- `PUT /auth/profile` - Atualizar perfil
- Campos: name, phoneNumber, profileImageUrl, role, enabled

**Frontend Atual:**
- Tela de perfil básica implementada
- Apenas mostra informações básicas
- Sem funcionalidade de edição completa

**O Que Falta:**
1. ✅ Tela de edição de perfil
2. ✅ Upload de foto de perfil (integrar com Firebase Storage)
3. ✅ Campo de telefone
4. ✅ Exibir role do usuário (USER/ADMIN)
5. ✅ Mostrar data de criação da conta
6. ✅ Indicador de email verificado

---

## 🔴 LACUNAS IMPORTANTES (Média-Alta Prioridade)

### 4. **Busca e Filtros Avançados de Pontos**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend Disponível:**
- `GET /points` - Listar todos os pontos
- `GET /points/{id}` - Buscar por ID
- `GET /points/code/{code}` - Buscar por código (ex: VG20)
- `GET /points/meridian/{meridian}` - Filtrar por meridiano
- `GET /points/symptom/{symptomId}` - Pontos por sintoma
- `GET /points/search?name=` - Buscar por nome
- `GET /points/popular?limit=` - Pontos populares

**Frontend Atual:**
- Busca básica por nome implementada
- Sem filtros por meridiano
- Sem busca por sintoma
- Sem exibição de pontos populares

**O Que Falta:**
1. ✅ Implementar busca por código de ponto
2. ✅ Filtro por meridiano (dropdown ou lista)
3. ✅ Busca por sintoma associado
4. ✅ Seção "Pontos Populares" na home
5. ✅ Filtros combinados (meridiano + sintoma)
6. ✅ Histórico de buscas recentes

---

### 5. **Sistema de Sintomas Completo**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `GET /symptoms` - Listar todos os sintomas
- `GET /symptoms/{id}` - Buscar sintoma por ID
- `GET /symptoms/name/{name}` - Buscar por nome exato
- `GET /symptoms/category/{category}` - Filtrar por categoria
- `GET /symptoms/point/{pointId}` - Sintomas de um ponto
- `GET /symptoms/search?name=` - Buscar sintomas
- `GET /symptoms/tag/{tag}` - Buscar por tag
- `GET /symptoms/severity?min=&max=` - Filtrar por severidade
- `GET /symptoms/popular?limit=` - Sintomas mais usados
- `GET /symptoms/categories` - Listar categorias únicas
- `GET /symptoms/tags` - Listar tags únicas
- `GET /symptoms/stats` - Estatísticas de sintomas
- `POST /symptoms/{id}/use` - Incrementar contador de uso

**Frontend Atual:**
- Sintomas mencionados no chatbot (NLP)
- Sem tela dedicada a sintomas
- Sem navegação por sintomas
- Sem integração com API de sintomas

**O Que Falta:**
1. ✅ Tela de listagem de sintomas
2. ✅ Busca de sintomas
3. ✅ Filtro por categoria de sintoma
4. ✅ Filtro por severidade
5. ✅ Tela de detalhes do sintoma (com pontos associados)
6. ✅ Navegação: Sintoma → Pontos relacionados
7. ✅ Integrar contador de uso quando buscar sintoma
8. ✅ Seção "Sintomas Comuns" na home
9. ✅ Explorar por categorias de sintomas
10. ✅ Explorar por tags de sintomas

---

### 6. **Coordenadas e Visualização no Mapa Corporal**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend Disponível:**
- `PUT /points/{pointId}/coordinates` - Atualizar coordenadas (x, y)
- Campo `coordinates` nos pontos (Map<String, Double>)
- Coordenadas salvas no Firestore

**Frontend Atual:**
- Componente BodyMap existe
- Não carrega coordenadas do backend
- Coordenadas hardcoded ou ausentes

**O Que Falta:**
1. ✅ Integrar coordenadas do backend no mapa
2. ✅ Renderizar pontos nas posições corretas
3. ✅ Tornar pontos clicáveis no mapa
4. ✅ Navegação do mapa para detalhes do ponto
5. ✅ Zoom e pan no mapa corporal
6. ✅ Filtrar pontos visíveis no mapa por meridiano

---

### 7. **Imagens dos Pontos**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `POST /points/{pointId}/images` - Adicionar imagem ao ponto
- Campo `imageUrls` (Lista) em FirestorePoint
- Firebase Storage para armazenar imagens

**Frontend Atual:**
- Campo `image_url` (singular) no tipo Point
- Não exibe múltiplas imagens
- Sem integração com Firebase Storage

**O Que Falta:**
1. ✅ Atualizar tipo Point para suportar múltiplas imagens
2. ✅ Carregar imagens do Firebase Storage
3. ✅ Galeria de imagens na tela de detalhes
4. ✅ Zoom/pinch nas imagens
5. ✅ Fallback para imagem padrão

---

### 8. **Firebase Storage - Upload de Arquivos**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `POST /api/storage/upload` - Upload de arquivo
- `GET /api/storage/signed-url/{fileName}` - URL assinada temporária
- `DELETE /api/storage/{fileName}` - Deletar arquivo (Admin)
- `GET /api/storage/list` - Listar arquivos (Admin)
- `GET /api/storage/info/{fileName}` - Info do arquivo
- `GET /api/storage/exists/{fileName}` - Verificar se existe
- `GET /api/storage/status` - Status do serviço

**Frontend Atual:**
- Nenhuma funcionalidade de upload implementada
- Sem integração com Firebase Storage

**O Que Falta:**
1. ✅ Implementar upload de foto de perfil
2. ✅ Implementar seleção de imagem (câmera/galeria)
3. ✅ Preview da imagem antes do upload
4. ✅ Progress bar durante upload
5. ✅ Tratamento de erros de upload
6. ✅ Compressão de imagem antes do upload

---

## 🟡 LACUNAS MODERADAS (Média Prioridade)

### 9. **Estatísticas e Dashboard**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `GET /points/stats` - Estatísticas de pontos
- `GET /symptoms/stats` - Estatísticas de sintomas
- Contadores de: total, populares, por categoria, etc.

**Frontend Atual:**
- Sem tela de estatísticas
- Sem dashboard informativo

**O Que Falta:**
1. ✅ Tela de estatísticas gerais
2. ✅ Gráficos de distribuição (meridianos, categorias)
3. ✅ Top 5/10 pontos mais favoritados
4. ✅ Top 5/10 sintomas mais buscados
5. ✅ Métricas de uso do app

---

### 10. **Modo Admin**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `GET /admin/dashboard` - Dashboard administrativo
- `GET /admin/users` - Listar usuários
- `GET /admin/users/{userId}` - Detalhes do usuário
- `PUT /admin/users/{userId}/role` - Atualizar role
- `PUT /admin/users/{userId}/enabled` - Habilitar/desabilitar usuário
- `DELETE /admin/users/{userId}` - Deletar usuário
- `POST /admin/users` - Criar admin
- `GET /admin/stats/detailed` - Estatísticas detalhadas
- `POST /admin/data/seed` - Seed de dados
- `GET /admin/health` - Health check admin

**Frontend Atual:**
- Sem interface administrativa
- Sem verificação de role
- Todos os usuários veem as mesmas telas

**O Que Falta:**
1. ✅ Verificar role do usuário no authStore
2. ✅ Tela de administração (tabs ou drawer)
3. ✅ Dashboard administrativo
4. ✅ Gerenciamento de usuários
5. ✅ Editar roles de usuários
6. ✅ Habilitar/desabilitar contas
7. ✅ Ver estatísticas detalhadas
8. ✅ CRUD de pontos (Admin only)
9. ✅ CRUD de sintomas (Admin only)
10. ✅ Gerenciar associações ponto-sintoma

---

### 11. **CRUD de Pontos (Admin)**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `POST /points` - Criar ponto (Admin)
- `PUT /points/{id}` - Atualizar ponto (Admin)
- `DELETE /points/{id}` - Deletar ponto (Admin)
- `POST /points/{pointId}/symptoms/{symptomId}` - Associar sintoma (Admin)
- `DELETE /points/{pointId}/symptoms/{symptomId}` - Remover sintoma (Admin)

**Frontend Atual:**
- Sem funcionalidade de criação/edição de pontos
- Usuário admin tem mesmo acesso que usuário comum

**O Que Falta:**
1. ✅ Formulário de criação de ponto
2. ✅ Formulário de edição de ponto
3. ✅ Confirmação de exclusão
4. ✅ Seletor de sintomas para associação
5. ✅ Preview do ponto antes de salvar
6. ✅ Validação de campos obrigatórios

---

### 12. **CRUD de Sintomas (Admin)**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `POST /symptoms` - Criar sintoma (Admin)
- `PUT /symptoms/{id}` - Atualizar sintoma (Admin)
- `DELETE /symptoms/{id}` - Deletar sintoma (Admin)
- `POST /symptoms/{symptomId}/points/{pointId}` - Associar ponto (Admin)
- `DELETE /symptoms/{symptomId}/points/{pointId}` - Remover ponto (Admin)
- `POST /symptoms/{symptomId}/tags` - Adicionar tag (Admin)

**Frontend Atual:**
- Sem funcionalidade de criação/edição de sintomas

**O Que Falta:**
1. ✅ Formulário de criação de sintoma
2. ✅ Formulário de edição de sintoma
3. ✅ Gerenciar tags de sintoma
4. ✅ Definir categoria e severidade
5. ✅ Associar pontos ao sintoma
6. ✅ Confirmação de exclusão

---

### 13. **Meridian Navigation**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend Disponível:**
- Pontos organizados por meridiano
- Filtro por meridiano disponível

**Frontend Atual:**
- API service tem método getMeridians()
- Store tem campo meridians
- Sem UI para navegar por meridianos

**O Que Falta:**
1. ✅ Tela/seção "Explorar por Meridiano"
2. ✅ Lista de meridianos com contagem de pontos
3. ✅ Visualização de pontos de um meridiano específico
4. ✅ Cores/ícones distintos por meridiano
5. ✅ Informações sobre cada meridiano

---

### 14. **Health Checks e Monitoramento**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend Disponível:**
- `GET /health` - Health check básico
- `GET /health/detailed` - Health check detalhado
- `GET /health/readiness` - Readiness probe
- `GET /health/liveness` - Liveness probe
- `GET /health/metrics` - Métricas básicas

**Frontend Atual:**
- API service tem método healthCheck()
- Não é usado em nenhum lugar
- Sem indicador de status do servidor

**O Que Falta:**
1. ✅ Indicador de conectividade com backend
2. ✅ Retry automático quando backend está offline
3. ✅ Tela de status do sistema (configurações)
4. ✅ Exibir latência da conexão
5. ✅ Log de erros de conexão

---

## 🟢 LACUNAS MENORES (Baixa Prioridade)

### 15. **Notas Pessoais em Pontos**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend:** Não há endpoint específico para notas no backend atual

**Frontend Atual:**
- Tipo `Note` definido em database.ts
- Tabela notes no SQLite local
- Sem UI para criar/editar notas

**O Que Falta:**
1. ✅ Backend: Implementar endpoints de notas
2. ✅ Frontend: Tela de adicionar nota a um ponto
3. ✅ Frontend: Listar notas de um ponto
4. ✅ Frontend: Editar/deletar notas
5. ✅ Sincronização de notas (local → remoto)

---

### 16. **Histórico de Pesquisas**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend:** Não implementado

**Frontend Atual:**
- Mencionado na tela de perfil
- Não implementado

**O Que Falta:**
1. ✅ Salvar histórico de buscas localmente
2. ✅ Tela de histórico
3. ✅ Limpar histórico
4. ✅ Buscar novamente a partir do histórico
5. ✅ Limite de entradas no histórico (ex: 50)

---

### 17. **Modo Offline Robusto**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Backend:** API REST completa disponível

**Frontend Atual:**
- SQLite database configurado
- Fallback para dados locais em alguns lugares
- syncStore definido mas não utilizado completamente

**O Que Falta:**
1. ✅ Sincronização completa ao ficar online
2. ✅ Indicador claro de modo offline
3. ✅ Fila de operações pendentes
4. ✅ Resolver conflitos de sincronização
5. ✅ Download de dados essenciais para uso offline
6. ✅ Mensagens informativas sobre limitações offline

---

### 18. **Notificações Push**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend:** Firebase Cloud Messaging disponível no Firebase

**Frontend Atual:**
- Toggle de notificações na tela de perfil
- Não implementado

**O Que Falta:**
1. ✅ Configurar Firebase Cloud Messaging
2. ✅ Solicitar permissão de notificações
3. ✅ Salvar token de notificação no backend
4. ✅ Backend: Endpoint para enviar notificações
5. ✅ Notificações relevantes (novos pontos, atualizações)

---

### 19. **Compartilhamento de Pontos**

**Status:** ❌ NÃO IMPLEMENTADO

**Backend:** Não necessário (funcionalidade client-side)

**Frontend Atual:**
- Não implementado

**O Que Falta:**
1. ✅ Botão de compartilhar na tela de detalhes
2. ✅ Compartilhar via WhatsApp, SMS, email
3. ✅ Gerar link profundo (deep link) para ponto
4. ✅ Compartilhar imagem do ponto

---

### 20. **Tutoriais e Onboarding**

**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO

**Frontend Atual:**
- Tela Welcome básica existe
- Sem tutorial de uso

**O Que Falta:**
1. ✅ Tutorial interativo no primeiro uso
2. ✅ Tooltips em funcionalidades principais
3. ✅ FAQ/Ajuda dentro do app
4. ✅ Vídeos tutoriais (se disponíveis)

---

### 21. **Temas e Personalização**

**Status:** ❌ NÃO IMPLEMENTADO

**Frontend Atual:**
- Cores definidas em constants
- Tema único (claro)

**O Que Falta:**
1. ✅ Modo escuro (dark mode)
2. ✅ Troca de tema nas configurações
3. ✅ Persistir preferência de tema
4. ✅ Ajuste de tamanho de fonte

---

### 22. **Acessibilidade**

**Status:** ⚠️ NÃO VERIFICADO

**O Que Falta:**
1. ✅ Labels acessíveis em todos os elementos
2. ✅ Suporte a leitores de tela
3. ✅ Contraste adequado de cores
4. ✅ Navegação por teclado (se aplicável)
5. ✅ Textos alternativos em imagens

---

### 23. **Internacionalização (i18n)**

**Status:** ❌ NÃO IMPLEMENTADO

**Frontend Atual:**
- Textos em português hardcoded

**O Que Falta:**
1. ✅ Configurar biblioteca i18n (react-i18next)
2. ✅ Extrair todos os textos para arquivos de tradução
3. ✅ Suporte a inglês
4. ✅ Seletor de idioma nas configurações
5. ✅ Persistir preferência de idioma

---

## 📝 PROBLEMAS DE INTEGRAÇÃO IDENTIFICADOS

### 1. Endpoints da API Incorretos

**Problema:** O apiService.ts usa endpoints que não correspondem ao backend real

**Exemplos:**
- Frontend: `/favorites` → Backend: `/auth/favorites/{pointId}`
- Frontend: `/points/meridians` → Backend: Não existe (usar filtro)
- Frontend: `/symptoms/categories` → Backend: OK ✅

**Solução:**
- Atualizar apiService.ts para corresponder aos endpoints reais
- Verificar todos os métodos da API

---

### 2. Tipos de Dados Incompatíveis

**Problema:** Tipos TypeScript não correspondem aos modelos do backend

**Exemplos:**
- `Point.id` é `number` no frontend, mas `string` (Firestore ID) no backend
- `coordinates` é objeto `{x, y}` mas backend usa `Map<String, Double>`
- `imageUrls` (plural) no backend, mas `image_url` (singular) no frontend

**Solução:**
- Atualizar tipos em `types/api.ts`
- Criar adapters para conversão de dados

---

### 3. Autenticação Firebase Não Integrada

**Problema:** Frontend usa autenticação básica, backend espera Firebase Auth

**Impacto:**
- Funcionalidades avançadas do Firebase não disponíveis
- Roles e permissões não funcionam corretamente
- Custom claims não são verificados

**Solução:**
- Migrar completamente para Firebase Auth
- Atualizar authStore
- Configurar Firebase SDK

---

### 4. Falta de Tratamento de Erros Padronizado

**Problema:** Tratamento inconsistente de erros da API

**Solução:**
- Criar componente de notificação global
- Padronizar mensagens de erro
- Adicionar retry automático em falhas de rede

---

### 5. Sincronização Offline Incompleta

**Problema:** syncStore definido mas não utilizado adequadamente

**Solução:**
- Implementar fila de sincronização
- Usar React Query ou similar para cache
- Indicadores visuais claros de estado de sync

---

## 🎯 PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### FASE 1 - CRÍTICO (1-2 semanas)
**Objetivo:** Fazer o app funcionar corretamente com o backend

1. ✅ **Integração Firebase Auth** (3-5 dias)
   - Setup Firebase SDK
   - Atualizar authStore
   - Implementar login/registro Firebase
   - Endpoint `/auth/sync`

2. ✅ **Corrigir Endpoints da API** (1-2 dias)
   - Atualizar apiService.ts
   - Corrigir tipos de dados
   - Testar todas as integrações

3. ✅ **Sistema de Favoritos** (1-2 dias)
   - Corrigir endpoints
   - Sincronização local/remoto
   - Atualizar UI

4. ✅ **Perfil de Usuário Completo** (2-3 dias)
   - Tela de edição
   - Upload de foto
   - Integração completa

### FASE 2 - IMPORTANTE (2-3 semanas)
**Objetivo:** Funcionalidades essenciais para usuários

5. ✅ **Busca e Filtros Avançados** (3-4 dias)
   - Busca por código, meridiano, sintoma
   - Pontos populares
   - Filtros combinados

6. ✅ **Sistema de Sintomas** (5-7 dias)
   - Tela de listagem
   - Busca e filtros
   - Detalhes e navegação
   - Categorias e tags

7. ✅ **Coordenadas no Mapa Corporal** (3-4 dias)
   - Integração com backend
   - Renderização de pontos
   - Interatividade

8. ✅ **Imagens dos Pontos** (2-3 dias)
   - Múltiplas imagens
   - Galeria
   - Firebase Storage

9. ✅ **Navegação por Meridiano** (2-3 dias)
   - UI de exploração
   - Filtros
   - Visualizações

### FASE 3 - MODERADO (2-3 semanas)
**Objetivo:** Funcionalidades administrativas e avançadas

10. ✅ **Modo Admin** (5-7 dias)
    - Dashboard admin
    - Gerenciamento de usuários
    - Verificação de roles

11. ✅ **CRUD Admin de Pontos** (3-4 dias)
    - Criar/editar/deletar
    - Associações com sintomas
    - Validações

12. ✅ **CRUD Admin de Sintomas** (3-4 dias)
    - Criar/editar/deletar
    - Tags e categorias
    - Associações

13. ✅ **Estatísticas e Dashboard** (2-3 dias)
    - Métricas gerais
    - Gráficos
    - Top listas

14. ✅ **Firebase Storage Upload** (2-3 dias)
    - Upload de fotos
    - Progress e erros
    - Compressão

### FASE 4 - REFINAMENTO (1-2 semanas)
**Objetivo:** Melhorias de UX e features complementares

15. ✅ **Modo Offline Robusto** (3-4 dias)
16. ✅ **Health Checks** (1-2 dias)
17. ✅ **Notas Pessoais** (2-3 dias)
18. ✅ **Histórico de Pesquisas** (1-2 dias)
19. ✅ **Notificações Push** (2-3 dias)

### FASE 5 - POLIMENTO (1 semana)
**Objetivo:** UX e acessibilidade

20. ✅ **Compartilhamento** (1-2 dias)
21. ✅ **Tutoriais/Onboarding** (2-3 dias)
22. ✅ **Temas** (1-2 dias)
23. ✅ **Acessibilidade** (2-3 dias)
24. ✅ **Internacionalização** (2-3 dias)

---

## 📦 DEPENDÊNCIAS A ADICIONAR

### Frontend Mobile

```json
{
  "dependencies": {
    "@react-native-firebase/app": "^19.0.0",
    "@react-native-firebase/auth": "^19.0.0",
    "@react-native-firebase/firestore": "^19.0.0",
    "@react-native-firebase/storage": "^19.0.0",
    "@react-native-firebase/messaging": "^19.0.0",
    "react-query": "^3.39.3",
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.0",
    "expo-image-picker": "~14.7.0",
    "expo-image-manipulator": "~11.8.0",
    "expo-sharing": "~11.10.0",
    "react-native-chart-kit": "^6.12.0"
  }
}
```

---

## 🛠️ ARQUIVOS QUE PRECISAM SER MODIFICADOS/CRIADOS

### Modificar

1. ✅ `services/api.ts` - Atualizar endpoints e métodos
2. ✅ `types/api.ts` - Corrigir tipos de dados
3. ✅ `stores/authStore.ts` - Integrar Firebase Auth
4. ✅ `stores/pointsStore.ts` - Adicionar novos métodos
5. ✅ `stores/syncStore.ts` - Implementar sincronização completa
6. ✅ `utils/constants.ts` - Adicionar configurações Firebase
7. ✅ `app/(tabs)/profile.tsx` - Melhorar funcionalidades
8. ✅ `app/(tabs)/search.tsx` - Adicionar filtros
9. ✅ `app/(tabs)/favorites.tsx` - Corrigir integração
10. ✅ `app/body-map.tsx` - Integrar coordenadas

### Criar Novos

1. ✅ `services/firebase.ts` - Configuração Firebase
2. ✅ `services/firebaseAuth.ts` - Serviço de autenticação
3. ✅ `services/firebaseStorage.ts` - Serviço de storage
4. ✅ `stores/symptomsStore.ts` - Store de sintomas
5. ✅ `stores/adminStore.ts` - Store admin
6. ✅ `app/(tabs)/symptoms.tsx` - Tela de sintomas
7. ✅ `app/symptom-details.tsx` - Detalhes do sintoma
8. ✅ `app/(admin)/_layout.tsx` - Layout admin
9. ✅ `app/(admin)/dashboard.tsx` - Dashboard admin
10. ✅ `app/(admin)/users.tsx` - Gerenciar usuários
11. ✅ `app/(admin)/points.tsx` - Gerenciar pontos
12. ✅ `app/(admin)/symptoms.tsx` - Gerenciar sintomas
13. ✅ `app/meridians.tsx` - Explorar meridianos
14. ✅ `app/statistics.tsx` - Estatísticas
15. ✅ `components/FilterBar.tsx` - Barra de filtros
16. ✅ `components/SymptomCard.tsx` - Card de sintoma
17. ✅ `components/StatCard.tsx` - Card de estatística
18. ✅ `components/ImageGallery.tsx` - Galeria de imagens
19. ✅ `components/UploadButton.tsx` - Botão de upload
20. ✅ `components/AdminRoute.tsx` - Proteção de rota admin
21. ✅ `utils/adapters.ts` - Adapters de dados
22. ✅ `utils/validators.ts` - Validadores

---

## 🔒 CONSIDERAÇÕES DE SEGURANÇA

1. ✅ **Firebase Auth Rules** - Configurar regras de segurança no Firestore
2. ✅ **Role-Based Access** - Verificar roles antes de exibir UI admin
3. ✅ **Token Refresh** - Implementar refresh automático de tokens
4. ✅ **Validação Client-Side** - Validar dados antes de enviar
5. ✅ **Storage Rules** - Proteger uploads no Firebase Storage
6. ✅ **API Keys** - Usar variáveis de ambiente para keys sensíveis

---

## 📈 MÉTRICAS DE SUCESSO

Após implementação completa, o app deve ter:

- ✅ 100% dos endpoints do backend integrados
- ✅ Autenticação Firebase funcional
- ✅ Modo offline robusto
- ✅ Interface admin completa
- ✅ Navegação fluida entre pontos e sintomas
- ✅ Upload de imagens funcionando
- ✅ Favoritos sincronizados
- ✅ 0 crashes relacionados a integração
- ✅ < 2s tempo de carregamento inicial
- ✅ Feedback visual em todas as ações

---

## 🎨 MELHORIAS DE UX SUGERIDAS

Além das funcionalidades faltantes, considera-se:

1. ✅ Loading skeletons ao invés de spinners
2. ✅ Animações suaves de transição
3. ✅ Pull-to-refresh em todas as listas
4. ✅ Empty states informativos e bonitos
5. ✅ Mensagens de erro mais amigáveis
6. ✅ Feedback háptico em ações importantes
7. ✅ Infinite scroll em listas longas
8. ✅ Busca com debounce para melhor performance
9. ✅ Cache inteligente para menos requisições
10. ✅ Breadcrumbs para navegação profunda

---

## 📚 DOCUMENTAÇÃO NECESSÁRIA

Para facilitar a implementação:

1. ✅ Guia de integração Firebase
2. ✅ Documentação de API endpoints
3. ✅ Fluxogramas de autenticação
4. ✅ Diagramas de navegação
5. ✅ Style guide / design system
6. ✅ Guia de contribuição
7. ✅ Testes de integração

---

## 🏁 CONCLUSÃO

Este documento identificou **24 áreas principais** de lacunas entre o backend Java e o frontend mobile, com um total estimado de **8-10 semanas** de desenvolvimento para implementação completa.

**Resumo Quantitativo:**
- 🚨 **Lacunas Críticas:** 3 (autenticação, favoritos, perfil)
- 🔴 **Lacunas Importantes:** 11 (busca, sintomas, admin, CRUD, etc.)
- 🟡 **Lacunas Moderadas:** 6 (stats, health, meridians, etc.)
- 🟢 **Lacunas Menores:** 10 (notas, histórico, temas, i18n, etc.)
- 📊 **Total de Endpoints Backend:** 85 endpoints disponíveis
- ❌ **Endpoints Não Integrados:** Aproximadamente 50-60 endpoints

**Próximos Passos:**
1. Revisar e aprovar este documento com a equipe
2. Priorizar features baseadas nos objetivos do TCC
3. Começar pela Fase 1 (integrações críticas)
4. Implementar incrementalmente com testes
5. Documentar durante o desenvolvimento

**Observação Final:**  
Este é um projeto acadêmico (TCC), portanto pode-se focar nas funcionalidades essenciais (Fases 1-3) e deixar refinamentos (Fases 4-5) como melhorias futuras se o tempo for limitado.

---

**Autor:** Análise Técnica de Código  
**Data:** 15 de outubro de 2025  
**Versão:** 1.0  
**Método:** Revisão manual e sistemática do código-fonte Java e React Native
