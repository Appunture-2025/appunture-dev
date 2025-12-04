# 📋 Análise Completa das Histórias de Usuário - TCC Appunture

**Data:** Dezembro de 2025  
**Objetivo:** Validar, corrigir e complementar todas as histórias de usuário do TCC em relação ao sistema real implementado

---

## 📑 Sumário

1. [Inventário de Histórias de Usuário](#1-inventário-de-histórias-de-usuário)
2. [Tabela de Validação](#2-tabela-de-validação)
3. [Histórias Corrigidas e Completas](#3-histórias-corrigidas-e-completas)
4. [Critérios de Aceitação em Gherkin](#4-critérios-de-aceitação-em-gherkin)
5. [Histórias Faltantes (Novas)](#5-histórias-faltantes-novas)
6. [Versão Final para o TCC](#6-versão-final-para-o-tcc)

---

## 1. Inventário de Histórias de Usuário

### Histórias Encontradas no TCC (`apendices.tex`)

| #   | ID    | Título                                | Formato Padrão | Critérios de Aceitação | Protótipo |
| --- | ----- | ------------------------------------- | -------------- | ---------------------- | --------- |
| 1   | HU-01 | Busca de Pontos de Acupuntura         | ✅ Sim         | ✅ 6 critérios         | ✅ Sim    |
| 2   | HU-02 | Detalhes do Ponto de Acupuntura       | ✅ Sim         | ✅ 7 critérios         | ✅ Sim    |
| 3   | HU-03 | Atlas Visual Interativo               | ✅ Sim         | ✅ 6 critérios         | ✅ Sim    |
| 4   | HU-04 | Gerenciamento de Favoritos            | ✅ Sim         | ✅ 6 critérios         | ✅ Sim    |
| 5   | HU-05 | Sincronização de Dados                | ✅ Sim         | ✅ 6 critérios         | ❌ Não    |
| 6   | HU-06 | Assistente de Inteligência Artificial | ✅ Sim         | ✅ 6 critérios         | ✅ Sim    |
| 7   | HU-07 | Mapeamento de Sintomas                | ✅ Sim         | ✅ 6 critérios         | ❌ Não    |
| 8   | HU-08 | Autenticação de Usuário               | ✅ Sim         | ✅ 8 critérios         | ✅ Sim    |
| 9   | HU-09 | Navegação por Meridianos              | ✅ Sim         | ✅ 8 critérios         | ✅ Sim    |
| 10  | HU-10 | Configurações e Personalização        | ✅ Sim         | ✅ 6 critérios         | ✅ Sim    |

> **Nota:** A HU-05 original (Anotações Clínicas) foi **REMOVIDA** do TCC pois não está implementada no sistema. As demais histórias foram renumeradas.

### Detalhamento por História

#### HU-01: Busca de Pontos de Acupuntura

**Texto Original:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** buscar pontos de acupuntura por nome, código ou função,  
> **Para que** eu possa encontrar rapidamente informações sobre pontos específicos.

**Papel do Usuário:** Estudante ou Profissional  
**Funcionalidade:** Busca textual de pontos  
**Critérios de Aceitação:** 6 critérios listados

---

#### HU-02: Detalhes do Ponto de Acupuntura

**Texto Original:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** visualizar informações detalhadas de um ponto de acupuntura,  
> **Para que** eu possa estudar suas características e aplicações clínicas.

**Papel do Usuário:** Estudante ou Profissional  
**Funcionalidade:** Visualização de detalhes  
**Critérios de Aceitação:** 7 critérios listados

---

#### HU-03: Atlas Visual Interativo

**Texto Original:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** navegar por um atlas visual do corpo humano,  
> **Para que** eu possa localizar visualmente os pontos de acupuntura.

**Papel do Usuário:** Estudante ou Profissional  
**Funcionalidade:** Atlas corporal SVG interativo  
**Critérios de Aceitação:** 6 critérios listados

---

#### HU-04: Gerenciamento de Favoritos

**Texto Original:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** salvar pontos de acupuntura como favoritos,  
> **Para que** eu possa acessá-los rapidamente no futuro.

**Papel do Usuário:** Estudante ou Profissional  
**Funcionalidade:** Sistema de favoritos  
**Critérios de Aceitação:** 6 critérios listados

---

#### HU-05: Anotações Clínicas (Trabalho Futuro)

**Texto Original:**

> **Como** profissional de acupuntura,  
> **Quero** criar anotações pessoais sobre pontos de acupuntura,  
> **Para que** eu possa registrar observações clínicas e experiências práticas.

**Status:** ❌ **NÃO IMPLEMENTADA**  
**Papel do Usuário:** Profissional  
**Critérios de Aceitação:** 7 critérios (planejados)

---

#### HU-06: Sincronização de Dados

**Texto Original:**

> **Como** usuário do aplicativo,  
> **Quero** sincronizar meus dados entre dispositivos,  
> **Para que** eu possa acessar minhas informações em qualquer lugar.

**Papel do Usuário:** Usuário genérico  
**Funcionalidade:** Sincronização offline-first  
**Critérios de Aceitação:** 6 critérios listados

---

#### HU-07: Assistente de Inteligência Artificial

**Texto Original:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** consultar um assistente de IA sobre acupuntura,  
> **Para que** eu possa obter respostas contextualizadas às minhas dúvidas.

**Papel do Usuário:** Estudante ou Profissional  
**Funcionalidade:** Chatbot com IA  
**Critérios de Aceitação:** 6 critérios listados

---

#### HU-08: Mapeamento de Sintomas

**Texto Original:**

> **Como** profissional de acupuntura,  
> **Quero** mapear sintomas para pontos de acupuntura recomendados,  
> **Para que** eu possa auxiliar no planejamento de tratamentos.

**Papel do Usuário:** Profissional  
**Funcionalidade:** Busca de sintomas → pontos relacionados  
**Critérios de Aceitação:** 7 critérios listados

---

#### HU-09: Autenticação de Usuário

**Texto Original:**

> **Como** usuário do aplicativo,  
> **Quero** criar uma conta e realizar login de forma segura,  
> **Para que** eu possa acessar recursos personalizados e sincronizar meus dados.

**Papel do Usuário:** Usuário genérico  
**Funcionalidade:** Login/Registro/OAuth  
**Critérios de Aceitação:** 8 critérios listados

---

#### HU-10: Navegação por Meridianos

**Texto Original:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** navegar pelos meridianos da medicina tradicional chinesa,  
> **Para que** eu possa estudar os pontos organizados por canal energético.

**Papel do Usuário:** Estudante ou Profissional  
**Funcionalidade:** Listagem e detalhes de meridianos  
**Critérios de Aceitação:** 8 critérios listados

---

#### HU-11: Configurações e Personalização

**Texto Original:**

> **Como** usuário do aplicativo,  
> **Quero** personalizar as configurações do aplicativo,  
> **Para que** eu possa adaptar a experiência às minhas preferências.

**Papel do Usuário:** Usuário genérico  
**Funcionalidade:** Tela de perfil/configurações  
**Critérios de Aceitação:** 6 critérios listados

---

## 2. Tabela de Validação

| #   | História         | Existe no Sistema? | Comportamento Correto? | Completa?  | Formato OK? | Critérios Claros? | Problema Principal                                                        | Código Relacionado                                        |
| --- | ---------------- | ------------------ | ---------------------- | ---------- | ----------- | ----------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | HU-01 Busca      | ✅ Sim             | ⚠️ Parcial             | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critério 4 (destaque) e 6 (correções) não implementados                   | `app/(tabs)/search.tsx`, `stores/pointsStore.ts`          |
| 2   | HU-02 Detalhes   | ✅ Sim             | ⚠️ Parcial             | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critério 6 (técnicas de inserção) é estático, não do banco                | `screens/point-details/index.tsx`                         |
| 3   | HU-03 Atlas      | ✅ Sim             | ⚠️ Parcial             | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critério 2 (zoom/rotação) limitado; critério 6 não existe                 | `screens/body-map/index.tsx`, `components/BodyMap.tsx`    |
| 4   | HU-04 Favoritos  | ✅ Sim             | ⚠️ Parcial             | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critérios 4 (categorias) e 6 (exportar) NÃO implementados                 | `app/(tabs)/favorites.tsx`, `stores/pointsStore.ts`       |
| 5   | HU-05 Anotações  | ❌ **NÃO**         | ❌ N/A                 | ❌ N/A     | ✅ Sim      | ✅ Sim            | **FUNCIONALIDADE NÃO IMPLEMENTADA**                                       | Infraestrutura em `types/database.ts`                     |
| 6   | HU-06 Sync       | ✅ Sim             | ✅ Sim                 | ✅ Sim     | ✅ Sim      | ⚠️ Parcial        | Critério 6 (histórico) parcial                                            | `stores/syncStore.ts`, `services/database.ts`             |
| 7   | HU-07 IA         | ✅ Sim             | ⚠️ Parcial             | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critérios 3 (fontes), 5 (sugerir pontos), 6 (limitações) parciais         | `app/(tabs)/chatbot.tsx`, `backend/AiChatController.java` |
| 8   | HU-08 Sintomas   | ✅ Sim             | ⚠️ Parcial             | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critérios 3 (evidência), 5 (combinações), 6 (histórico) não implementados | `app/(tabs)/symptoms.tsx`, `stores/symptomsStore.ts`      |
| 9   | HU-09 Auth       | ✅ Sim             | ✅ Sim                 | ✅ Sim     | ✅ Sim      | ✅ Sim            | Critério 8 (visitante) parcial                                            | `stores/authStore.ts`, `screens/login/`                   |
| 10  | HU-10 Meridianos | ✅ Sim             | ✅ Sim                 | ✅ Sim     | ✅ Sim      | ✅ Sim            | -                                                                         | `app/(tabs)/meridians.tsx`, `utils/meridianData.ts`       |
| 11  | HU-11 Config     | ✅ Sim             | ✅ Sim                 | ⚠️ Parcial | ✅ Sim      | ⚠️ Parcial        | Critério 4 (modo offline) não salva economia real de dados                | `app/(tabs)/profile.tsx`, `stores/themeStore.ts`          |

### Legenda de Status

- ✅ **Completo/Correto:** Funcionalidade implementada conforme descrito
- ⚠️ **Parcial:** Implementação incompleta ou com diferenças
- ❌ **Não:** Não implementado ou incorreto

---

## 3. Histórias Corrigidas e Completas

### HU-01: Busca de Pontos de Acupuntura (CORRIGIDA)

**Versão Corrigida:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** buscar pontos de acupuntura por nome, código ou meridiano,  
> **Para que** eu possa encontrar rapidamente informações sobre pontos específicos durante meus estudos ou prática clínica.

**Ator:** Estudante ou Profissional de Acupuntura (autenticado ou não)

**Funcionalidade Real:**

- Busca textual em tempo real com debounce
- Busca por nome em português ou código alfanumérico (VG20, IG4)
- Filtro implícito por meridiano
- Toggle de favoritos nos resultados

**Valor/Benefício:** Acesso rápido a informações de pontos específicos, otimizando tempo de estudo e consulta clínica

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve permitir busca por nome do ponto em português
2. ✅ O sistema deve permitir busca por código alfanumérico (ex: VG20, E36, IG4)
3. ✅ O sistema deve exibir resultados em tempo real com debounce de 300ms
4. ❌ ~~O sistema deve destacar os termos buscados nos resultados~~ → **Não implementado**
5. ✅ A busca deve funcionar offline com dados em cache local (SQLite)
6. ❌ ~~O sistema deve sugerir correções para termos digitados incorretamente~~ → **Não implementado**
7. ✅ O sistema deve permitir alternar favoritos diretamente nos resultados de busca
8. ✅ O sistema deve exibir mensagem quando nenhum resultado for encontrado

**Critérios Técnicos:**

- Frontend: `app/(tabs)/search.tsx` com `SearchBar` component
- Store: `pointsStore.searchPoints()`
- Backend: `FirestorePointController.searchPoints()`
- Offline: SQLite local via `databaseService`

**Dependências:**

- Backend REST API funcionando
- SQLite local para modo offline
- `pointsStore` inicializado

---

### HU-02: Detalhes do Ponto de Acupuntura (CORRIGIDA)

**Versão Corrigida:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** visualizar informações completas de um ponto de acupuntura incluindo galeria de imagens,  
> **Para que** eu possa estudar suas características anatômicas e aplicações clínicas.

**Ator:** Estudante ou Profissional de Acupuntura (autenticado ou não)

**Funcionalidade Real:**

- Exibição de nome, código, meridiano, localização
- Galeria de imagens com carrossel
- Lista de indicações terapêuticas
- Toggle de favorito
- Upload de imagens (somente Admin)

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve exibir nome em português e código do ponto
2. ✅ O sistema deve mostrar a localização anatômica
3. ✅ O sistema deve apresentar as funções/indicações terapêuticas do ponto
4. ✅ O sistema deve exibir galeria de imagens ilustrativas (múltiplas imagens)
5. ✅ O sistema deve indicar contraindicações quando disponíveis
6. ⚠️ O sistema deve mostrar técnicas aplicáveis (lista estática no código, não do banco)
7. ✅ O sistema deve permitir favoritar/desfavoritar o ponto
8. ✅ **Administradores** podem adicionar/remover/reordenar imagens

**Critérios Técnicos:**

- Frontend: `screens/point-details/index.tsx`
- Componentes: `ImageGallery`, galeria com Lightbox
- Store: `pointsStore.loadPoint()`, `toggleFavorite()`
- Backend: `FirestorePointController.getPoint()`
- Admin: Upload via Firebase Storage

---

### HU-03: Atlas Visual Interativo (CORRIGIDA)

**Versão Corrigida:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** navegar por um atlas visual SVG do corpo humano com camadas anatômicas,  
> **Para que** eu possa localizar visualmente os pontos de acupuntura em diferentes regiões.

**Ator:** Estudante ou Profissional de Acupuntura

**Funcionalidade Real:**

- Atlas SVG com múltiplas camadas
- Toggle frente/costas
- Navegação entre camadas (anterior/próxima)
- Marcadores interativos nos pontos
- Tap no marcador navega para detalhes

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve exibir modelo anatômico SVG interativo do corpo humano
2. ⚠️ O sistema deve permitir navegação entre camadas (zoom/rotação limitados ao scroll nativo)
3. ✅ O sistema deve permitir alternar entre visualização frontal e dorsal
4. ✅ O sistema deve exibir marcadores nos pontos com coordenadas cadastradas
5. ✅ O sistema deve permitir tap em marcador para navegar aos detalhes do ponto
6. ✅ O sistema deve exibir nome da camada atual e total de camadas
7. ❌ ~~O sistema deve sincronizar a visualização com a busca textual~~ → **Não implementado**

**Critérios Técnicos:**

- Frontend: `screens/body-map/index.tsx`
- Componentes: `components/BodyMap.tsx`
- Assets: `assets/body-map/` (SVGs e manifest)
- Utils: `utils/bodyMap.ts`

---

### HU-04: Gerenciamento de Favoritos (CORRIGIDA)

**Versão Corrigida:**

> **Como** usuário autenticado do aplicativo,  
> **Quero** salvar pontos de acupuntura como favoritos,  
> **Para que** eu possa acessá-los rapidamente e mantê-los sincronizados entre dispositivos.

**Ator:** Usuário Autenticado (requer login)

**Funcionalidade Real:**

- Adicionar/remover favoritos
- Lista de favoritos com paginação
- Pull-to-refresh
- Sincronização com backend
- Requer autenticação

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve exigir autenticação para usar favoritos
2. ✅ O sistema deve permitir adicionar pontos à lista de favoritos
3. ✅ O sistema deve permitir remover pontos da lista de favoritos
4. ✅ O sistema deve exibir lista de favoritos com contagem
5. ❌ ~~O sistema deve permitir criar categorias personalizadas de favoritos~~ → **Não implementado**
6. ✅ O sistema deve sincronizar favoritos com a conta do usuário (offline-first)
7. ❌ ~~O sistema deve permitir exportar lista de favoritos~~ → **Não implementado**
8. ✅ O sistema deve usar optimistic update para feedback imediato

**Critérios Técnicos:**

- Frontend: `app/(tabs)/favorites.tsx`
- Store: `pointsStore.toggleFavorite()`, `loadFavorites()`
- Sync: `syncStore` para operações offline
- Backend: Favoritos salvos em `FirestoreUser.favoritePointIds[]`

---

### HU-05: Anotações Clínicas (TRABALHO FUTURO - MANTIDA)

**Status:** ❌ **NÃO IMPLEMENTADA**

**Versão Atualizada para TCC:**

> **Nota:** Esta história de usuário foi **planejada mas não implementada** na versão atual. A infraestrutura de dados foi preparada (tipos TypeScript, tabela SQLite `notes`, endpoints no `api.ts`), porém falta:
>
> - Controller no backend (`NoteController.java`)
> - Tela de UI para criar/editar anotações
> - Integração com tela de detalhes do ponto

**Texto Original (mantido como planejamento):**

> **Como** profissional de acupuntura,  
> **Quero** criar anotações pessoais sobre pontos de acupuntura,  
> **Para que** eu possa registrar observações clínicas e experiências práticas.

**Infraestrutura Preparada:**

- `types/database.ts`: Interface `Note`
- `services/database.ts`: Tabela `notes` no SQLite
- `services/api.ts`: Endpoints `createNote()`, `updateNote()`, `deleteNote()`
- `stores/syncStore.ts`: Handler `handleNoteOperation()`

---

### HU-06: Sincronização de Dados (CORRIGIDA)

**Versão Corrigida:**

> **Como** usuário autenticado do aplicativo,  
> **Quero** que meus dados (favoritos, preferências) sejam sincronizados automaticamente,  
> **Para que** eu possa acessar as mesmas informações em diferentes sessões e dispositivos.

**Ator:** Usuário Autenticado

**Funcionalidade Real:**

- Arquitetura offline-first com SQLite
- Fila de sincronização (`sync_queue`)
- Detecção automática de conectividade
- Retry com exponential backoff
- Resolução de conflitos por timestamp

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve funcionar completamente offline com dados em cache SQLite
2. ✅ O sistema deve sincronizar automaticamente quando detectar conexão à internet
3. ✅ O sistema deve adicionar operações à fila quando offline
4. ✅ O sistema deve resolver conflitos de sincronização usando timestamp (last-write-wins)
5. ✅ O sistema deve exibir status de sincronização na tela de perfil
6. ✅ O sistema deve fazer retry com exponential backoff (máximo 5 tentativas)
7. ⚠️ O sistema deve manter histórico de sincronizações (parcial - apenas última sync)

**Critérios Técnicos:**

- Store: `stores/syncStore.ts`
- Database: `sync_queue`, `sync_status` tables
- Service: `services/connectivity.ts`
- Constantes: `MAX_RETRIES = 5`, `BASE_DELAY = 1000ms`

---

### HU-07: Assistente de Inteligência Artificial (CORRIGIDA)

**Versão Corrigida:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** consultar um assistente de IA através de chat sobre temas de acupuntura,  
> **Para que** eu possa obter respostas educativas às minhas dúvidas de forma conversacional.

**Ator:** Estudante ou Profissional (autenticado ou não)

**Funcionalidade Real:**

- Interface de chat com mensagens do usuário e bot
- Indicador de "digitando..."
- Renderização de respostas em Markdown
- Integração com backend AI (endpoint `/ai/chat`)

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve permitir enviar perguntas em linguagem natural
2. ✅ O sistema deve exibir indicador de processamento ("Digitando...")
3. ✅ O sistema deve renderizar respostas em Markdown formatado
4. ⚠️ O sistema deve manter contexto da conversa na sessão atual (não persiste)
5. ⚠️ O sistema deve fornecer respostas baseadas em conhecimento de acupuntura (depende do modelo AI)
6. ❌ ~~O sistema deve citar fontes quando apropriado~~ → Depende do backend/modelo
7. ❌ ~~O sistema deve sugerir pontos relacionados às perguntas~~ → Não implementado
8. ⚠️ O sistema deve indicar que é ferramenta educacional (mensagem inicial)

**Critérios Técnicos:**

- Frontend: `app/(tabs)/chatbot.tsx`
- API: `apiService.chatWithAi()`
- Backend: `AiChatController.java`, `AiChatService.java`
- Renderização: `react-native-markdown-display`

---

### HU-08: Mapeamento de Sintomas (CORRIGIDA)

**Versão Corrigida:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** buscar sintomas e ver os pontos de acupuntura relacionados,  
> **Para que** eu possa estudar as correlações entre sintomas e pontos na MTC.

**Ator:** Estudante ou Profissional

**Funcionalidade Real:**

- Lista de sintomas com categorias
- Filtro por categoria (chips)
- Busca textual de sintomas
- Indicador de severidade
- Navegação para detalhes com pontos relacionados

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve listar sintomas cadastrados
2. ✅ O sistema deve permitir filtrar sintomas por categoria
3. ✅ O sistema deve permitir buscar sintomas por nome
4. ✅ O sistema deve exibir indicador de severidade quando disponível
5. ✅ O sistema deve navegar para detalhes mostrando pontos relacionados
6. ❌ ~~O sistema deve indicar nível de evidência para cada sugestão~~ → Não implementado
7. ❌ ~~O sistema deve exibir combinações de pontos recomendadas~~ → Não implementado
8. ❌ ~~O sistema deve salvar histórico de mapeamentos realizados~~ → Não implementado
9. ⚠️ O sistema deve incluir aviso de uso educacional (na tela de detalhes)

**Critérios Técnicos:**

- Frontend: `app/(tabs)/symptoms.tsx`, `app/symptom-details.tsx`
- Store: `stores/symptomsStore.ts`
- Backend: `FirestoreSymptomController.java`
- Modelo: `FirestoreSymptom` com `pointIds[]`

---

### HU-09: Autenticação de Usuário (CORRIGIDA - COMPLETA)

**Versão Corrigida:**

> **Como** usuário do aplicativo,  
> **Quero** criar uma conta ou fazer login de forma segura,  
> **Para que** eu possa acessar recursos personalizados como favoritos e sincronização.

**Ator:** Usuário (novo ou existente)

**Funcionalidade Real:**

- Cadastro com email/senha
- Login com email/senha
- Login social via Google OAuth
- Persistência de sessão
- Verificação de email
- Sincronização de perfil com backend

**Critérios de Aceitação (TODOS CORRETOS):**

1. ✅ O sistema deve permitir cadastro com nome, email e senha
2. ✅ O sistema deve validar força mínima da senha (6+ caracteres, Firebase padrão)
3. ✅ O sistema deve exigir confirmação de senha no cadastro
4. ✅ O sistema deve permitir login com email e senha
5. ✅ O sistema deve oferecer login social via Google OAuth
6. ✅ O sistema deve permitir recuperação de senha por email (Firebase)
7. ✅ O sistema deve manter sessão ativa entre execuções do app (SecureStore)
8. ⚠️ O sistema deve permitir acesso limitado sem login (busca e visualização funcionam)

**Critérios Técnicos:**

- Store: `stores/authStore.ts`
- Services: `services/firebase.ts`, `services/googleAuth.ts`
- Storage: `services/storage.ts` (SecureStore para token)
- Backend: `FirebaseAuthService.java`

---

### HU-10: Navegação por Meridianos (CORRIGIDA - COMPLETA)

**Versão Corrigida:**

> **Como** estudante ou profissional de acupuntura,  
> **Quero** navegar pelos meridianos da medicina tradicional chinesa visualizando suas características,  
> **Para que** eu possa estudar os pontos organizados por canal energético e seus elementos.

**Ator:** Estudante ou Profissional

**Funcionalidade Real:**

- Cards coloridos por meridiano
- Nome português, chinês, elemento Wu Xing
- Horário de maior atividade energética
- Órgão relacionado
- Contagem de pontos
- Navegação para pontos do meridiano

**Critérios de Aceitação (TODOS CORRETOS):**

1. ✅ O sistema deve listar os 12 meridianos principais e 2 vasos extraordinários
2. ✅ O sistema deve exibir nome em português e caracteres chineses
3. ✅ O sistema deve mostrar o elemento Wu Xing associado a cada meridiano
4. ✅ O sistema deve indicar o horário de maior atividade energética
5. ✅ O sistema deve exibir o órgão relacionado ao meridiano
6. ✅ O sistema deve mostrar a quantidade de pontos em cada meridiano
7. ✅ O sistema deve permitir visualizar todos os pontos de um meridiano
8. ✅ O sistema deve usar cores características para cada elemento

**Critérios Técnicos:**

- Frontend: `app/(tabs)/meridians.tsx`, `app/meridian-details.tsx`
- Data: `utils/meridianData.ts` (MERIDIAN_DATA constante)
- Store: `pointsStore.loadMeridians()`
- Backend: `FirestorePointController.getMeridians()`

---

### HU-11: Configurações e Personalização (CORRIGIDA)

**Versão Corrigida:**

> **Como** usuário do aplicativo,  
> **Quero** personalizar as configurações do aplicativo como tema e notificações,  
> **Para que** eu possa adaptar a experiência visual e funcional às minhas preferências.

**Ator:** Usuário (autenticado ou não para tema)

**Funcionalidade Real:**

- Alternância de tema (claro/escuro/automático)
- Toggle de notificações
- Toggle de modo offline
- Informações de conta
- Status de sincronização
- Logout com confirmação

**Critérios de Aceitação Corrigidos:**

1. ✅ O sistema deve permitir alternar entre tema claro, escuro e automático
2. ✅ O sistema deve salvar a preferência de tema (Zustand persist + AsyncStorage)
3. ✅ O sistema deve permitir ativar ou desativar notificações push (toggle local)
4. ✅ O sistema deve exibir informações da conta do usuário logado
5. ✅ O sistema deve mostrar status de sincronização e última atualização
6. ⚠️ O sistema deve permitir ativar modo offline (toggle existe, mas não economiza dados reais)
7. ✅ O sistema deve permitir logout com confirmação via Alert
8. ✅ O sistema deve exibir versão do aplicativo e informações de suporte

**Critérios Técnicos:**

- Frontend: `app/(tabs)/profile.tsx`
- Stores: `themeStore.ts`, `authStore.ts`, `syncStore.ts`
- Persistência: Zustand persist middleware

---

## 4. Critérios de Aceitação em Gherkin

### HU-01: Busca de Pontos de Acupuntura

```gherkin
Feature: Busca de Pontos de Acupuntura
  Como estudante ou profissional de acupuntura
  Quero buscar pontos de acupuntura por nome ou código
  Para encontrar rapidamente informações sobre pontos específicos

  Background:
    Given o aplicativo está aberto na tela de busca
    And existem pontos cadastrados no sistema

  Scenario: Buscar ponto por nome em português
    When eu digito "Baihui" no campo de busca
    And aguardo 300ms de debounce
    Then devo ver resultados contendo "Baihui"
    And os resultados devem incluir código e meridiano

  Scenario: Buscar ponto por código alfanumérico
    When eu digito "VG20" no campo de busca
    And aguardo 300ms de debounce
    Then devo ver o ponto com código "VG20"

  Scenario: Buscar termo sem resultados
    When eu digito "xyzabc123" no campo de busca
    And aguardo 300ms de debounce
    Then devo ver mensagem "Nenhum ponto encontrado para esta busca"

  Scenario: Buscar estando offline
    Given não tenho conexão com a internet
    And existem pontos em cache local
    When eu digito "Zusanli" no campo de busca
    Then devo ver resultados do cache local

  Scenario: Favoritar ponto nos resultados de busca
    Given estou autenticado
    When eu busco por "IG4"
    And toco no botão de favorito do ponto "IG4"
    Then o ponto deve ser marcado como favorito
    And a operação deve ser adicionada à fila de sync

  Rule: Debounce de busca
    - A busca só é executada após 300ms sem digitação
    - Isso evita chamadas excessivas à API
```

### HU-02: Detalhes do Ponto de Acupuntura

```gherkin
Feature: Detalhes do Ponto de Acupuntura
  Como estudante ou profissional de acupuntura
  Quero visualizar informações detalhadas de um ponto
  Para estudar suas características e aplicações clínicas

  Background:
    Given existe um ponto "VG20" cadastrado com imagens

  Scenario: Visualizar detalhes completos do ponto
    When eu navego para os detalhes do ponto "VG20"
    Then devo ver o nome "Baihui"
    And devo ver o código "VG20"
    And devo ver o meridiano "Du Mai"
    And devo ver a localização anatômica
    And devo ver as indicações terapêuticas

  Scenario: Visualizar galeria de imagens
    When eu navego para os detalhes do ponto "VG20"
    Then devo ver a galeria de imagens
    And posso navegar entre as imagens (carrossel)

  Scenario: Favoritar ponto na tela de detalhes
    Given estou autenticado
    When eu navego para os detalhes do ponto "VG20"
    And toco no botão de favorito
    Then o ícone de favorito deve ficar preenchido
    And o ponto deve aparecer em "Meus Favoritos"

  Scenario: Administrador adiciona imagem
    Given estou autenticado como administrador
    When eu navego para os detalhes do ponto "VG20"
    And toco em "Adicionar imagem"
    And seleciono uma imagem da galeria
    Then a imagem deve ser enviada ao Firebase Storage
    And a galeria deve ser atualizada com a nova imagem
```

### HU-03: Atlas Visual Interativo

```gherkin
Feature: Atlas Visual Interativo
  Como estudante ou profissional de acupuntura
  Quero navegar por um atlas visual do corpo humano
  Para localizar visualmente os pontos de acupuntura

  Background:
    Given o aplicativo está aberto na tela do mapa corporal
    And existem pontos com coordenadas cadastradas

  Scenario: Visualizar atlas na posição frontal
    Given estou na visualização "Frente"
    Then devo ver o modelo SVG do corpo na posição frontal
    And devo ver marcadores nos pontos com coordenadas frontais

  Scenario: Alternar para visualização dorsal
    Given estou na visualização "Frente"
    When toco no botão "Costas"
    Then devo ver o modelo SVG do corpo na posição dorsal
    And os marcadores devem mudar para pontos dorsais

  Scenario: Navegar entre camadas do atlas
    Given estou na camada 1 de 3
    When toco no botão "Próxima camada"
    Then devo estar na camada 2 de 3
    And os marcadores devem corresponder à camada atual

  Scenario: Selecionar ponto no mapa
    When eu toco em um marcador de ponto no mapa
    Then devo ser navegado para a tela de detalhes do ponto
```

### HU-04: Gerenciamento de Favoritos

```gherkin
Feature: Gerenciamento de Favoritos
  Como usuário autenticado
  Quero salvar pontos como favoritos
  Para acessá-los rapidamente

  Background:
    Given estou autenticado no aplicativo

  Scenario: Adicionar ponto aos favoritos
    Given estou na tela de detalhes do ponto "E36"
    When toco no botão de favorito
    Then o ponto deve ser adicionado à lista de favoritos
    And devo ver feedback visual imediato (optimistic update)

  Scenario: Remover ponto dos favoritos
    Given o ponto "E36" está nos meus favoritos
    When acesso a lista de favoritos
    And toco no botão de favorito do ponto "E36"
    Then o ponto deve ser removido da lista

  Scenario: Visualizar lista de favoritos
    Given tenho 3 pontos favoritos
    When acesso a aba "Favoritos"
    Then devo ver uma lista com 3 pontos
    And devo ver o texto "3 pontos favoritados"

  Scenario: Sincronizar favoritos ao voltar online
    Given adicionei um favorito estando offline
    When a conexão é restabelecida
    Then a operação pendente deve ser sincronizada
    And o favorito deve estar salvo no servidor

  Scenario: Acessar favoritos sem autenticação
    Given não estou autenticado
    When acesso a aba "Favoritos"
    Then devo ver mensagem "Login Necessário"
    And devo ver texto "Para usar os favoritos, você precisa fazer login"
```

### HU-06: Sincronização de Dados

```gherkin
Feature: Sincronização de Dados
  Como usuário autenticado
  Quero que meus dados sejam sincronizados
  Para acessar informações em diferentes sessões

  Background:
    Given estou autenticado no aplicativo

  Scenario: Operação offline adicionada à fila
    Given não tenho conexão com a internet
    When favorito um ponto
    Then a operação deve ser salva na tabela sync_queue
    And devo ver feedback que foi salvo localmente

  Scenario: Sincronização automática ao conectar
    Given tenho operações pendentes na fila
    And não tenho conexão com a internet
    When a conexão é restabelecida
    Then o sistema deve processar a fila automaticamente
    And as operações devem ser enviadas ao servidor

  Scenario: Retry com exponential backoff
    Given uma operação falhou no servidor
    When o sistema tenta novamente
    Then o delay deve ser (1s * 2^retry_count)
    And máximo de 5 tentativas deve ser respeitado

  Scenario: Resolução de conflitos por timestamp
    Given existe uma versão local com timestamp T1
    And existe uma versão remota com timestamp T2 > T1
    When ocorre sincronização
    Then a versão remota deve prevalecer (last-write-wins)
```

### HU-07: Assistente de Inteligência Artificial

```gherkin
Feature: Assistente de Inteligência Artificial
  Como estudante ou profissional de acupuntura
  Quero consultar um assistente de IA sobre acupuntura
  Para obter respostas educativas às minhas dúvidas

  Background:
    Given o aplicativo está aberto na tela do chatbot
    And o backend de IA está disponível

  Scenario: Enviar pergunta ao assistente
    When eu digito "Quais pontos ajudam na ansiedade?"
    And toco em enviar
    Then devo ver minha mensagem na conversa
    And devo ver indicador "Digitando..."
    And eventualmente devo ver a resposta do assistente

  Scenario: Resposta formatada em Markdown
    Given enviei uma pergunta
    When recebo a resposta
    Then a resposta deve estar formatada (negrito, listas, etc)

  Scenario: Mensagem inicial do assistente
    When abro a tela do chatbot pela primeira vez
    Then devo ver mensagem de boas-vindas
    And a mensagem deve indicar que é assistente educacional

  Scenario: Erro ao processar mensagem
    Given o backend está indisponível
    When envio uma pergunta
    Then devo ver alerta de erro
    And a mensagem deve permanecer no campo de entrada
```

### HU-09: Autenticação de Usuário

```gherkin
Feature: Autenticação de Usuário
  Como usuário do aplicativo
  Quero criar uma conta e fazer login
  Para acessar recursos personalizados

  Scenario: Cadastro com email e senha
    Given estou na tela de cadastro
    When preencho nome "João Silva"
    And preencho email "joao@email.com"
    And preencho senha "senha123"
    And confirmo a senha "senha123"
    And toco em "Cadastrar"
    Then uma conta deve ser criada no Firebase
    And devo ser redirecionado para a tela principal
    And devo estar autenticado

  Scenario: Validação de senha fraca
    Given estou na tela de cadastro
    When preencho senha "123"
    And toco em "Cadastrar"
    Then devo ver erro de validação
    And a mensagem deve indicar senha muito curta

  Scenario: Login com email e senha
    Given tenho uma conta cadastrada
    When estou na tela de login
    And preencho email "joao@email.com"
    And preencho senha "senha123"
    And toco em "Entrar"
    Then devo ser autenticado
    And meu token deve ser salvo no SecureStore

  Scenario: Login com Google OAuth
    Given estou na tela de login
    When toco em "Entrar com Google"
    And autorizo no popup do Google
    Then devo ser autenticado via Firebase
    And meu perfil deve ser sincronizado com o backend

  Scenario: Manter sessão entre execuções
    Given estou autenticado
    When fecho e reabro o aplicativo
    Then devo permanecer autenticado
    And não preciso fazer login novamente

  Scenario: Logout com confirmação
    Given estou autenticado
    When acesso "Perfil"
    And toco em "Sair da conta"
    Then devo ver alerta de confirmação
    When confirmo "Sair"
    Then devo ser deslogado
    And meu token deve ser removido
```

### HU-10: Navegação por Meridianos

```gherkin
Feature: Navegação por Meridianos
  Como estudante ou profissional de acupuntura
  Quero navegar pelos meridianos da MTC
  Para estudar pontos organizados por canal energético

  Background:
    Given existem meridianos cadastrados no sistema

  Scenario: Listar todos os meridianos
    When acesso a aba "Meridianos"
    Then devo ver cards para cada meridiano
    And cada card deve ter cor característica do elemento

  Scenario: Visualizar informações do meridiano
    When visualizo o card do meridiano "Pulmão"
    Then devo ver nome "Pulmão"
    And devo ver nome chinês
    And devo ver elemento "Metal"
    And devo ver horário "03:00 - 05:00"
    And devo ver quantidade de pontos

  Scenario: Acessar pontos do meridiano
    When toco no card do meridiano "Pulmão"
    Then devo navegar para a lista de pontos do meridiano
    And devo ver todos os pontos do meridiano "Pulmão"
```

### HU-11: Configurações e Personalização

```gherkin
Feature: Configurações e Personalização
  Como usuário do aplicativo
  Quero personalizar as configurações
  Para adaptar a experiência às minhas preferências

  Scenario: Alternar tema para escuro
    Given estou no tema claro
    When acesso "Perfil"
    And toco em "Tema"
    Then o tema deve mudar para escuro
    And toda a interface deve usar cores escuras

  Scenario: Tema automático segue sistema
    Given meu tema está configurado como "Automático"
    When o sistema operacional está em modo escuro
    Then o aplicativo deve usar tema escuro

  Scenario: Preferência de tema persistida
    Given alterei o tema para escuro
    When fecho e reabro o aplicativo
    Then o tema deve permanecer escuro

  Scenario: Visualizar status de sincronização
    Given estou autenticado
    When acesso "Perfil"
    Then devo ver se estou "Online" ou "Offline"
    And devo ver data/hora da última sincronização

  Scenario: Logout com confirmação
    Given estou autenticado
    When toco em "Sair da conta"
    Then devo ver alerta "Tem certeza que deseja sair?"
    When toco em "Sair"
    Then devo ser deslogado
```

---

## 5. Histórias Faltantes (Novas)

As seguintes histórias de usuário **não estão documentadas no TCC** mas **existem no sistema implementado**:

### HU-12: Visualização de Tela Inicial (HOME) [NOVA]

> **Como** usuário do aplicativo,  
> **Quero** ver um resumo das principais informações na tela inicial,  
> **Para que** eu possa acessar rapidamente os recursos mais relevantes.

**Ator:** Usuário (autenticado ou não)

**Funcionalidade Real:**

- Saudação personalizada (se autenticado)
- Pontos populares (5 itens)
- Sintomas populares (5 itens)
- Ações rápidas (Buscar, Mapa, Chat)

**Critérios de Aceitação:**

1. O sistema deve exibir saudação com nome do usuário se autenticado
2. O sistema deve listar os 5 pontos mais populares
3. O sistema deve listar os 5 sintomas mais populares
4. O sistema deve oferecer acesso rápido a Busca, Mapa Corporal e Assistente
5. O sistema deve atualizar dados ao fazer pull-to-refresh

**Código Relacionado:** `app/(tabs)/index.tsx`

---

### HU-13: Administração de Imagens de Pontos [NOVA]

> **Como** administrador do sistema,  
> **Quero** gerenciar as imagens dos pontos de acupuntura,  
> **Para que** eu possa manter o conteúdo visual atualizado e de qualidade.

**Ator:** Administrador (role = "ADMIN")

**Funcionalidade Real:**

- Upload de imagens via câmera ou galeria
- Reordenação de imagens na galeria
- Exclusão de imagens
- Upload para Firebase Storage
- Geração de thumbnails no backend

**Critérios de Aceitação:**

1. Somente usuários com role "ADMIN" devem ver botões de gerenciamento
2. O sistema deve permitir upload de múltiplas imagens da galeria
3. O sistema deve permitir captura de foto pela câmera
4. O sistema deve exibir progresso de upload
5. O sistema deve permitir reordenar imagens arrastando
6. O sistema deve confirmar antes de excluir imagem
7. O sistema deve atualizar galeria após modificações

**Código Relacionado:** `screens/point-details/index.tsx` (seção Admin)

---

### HU-14: Verificação de Email [NOVA]

> **Como** usuário recém-cadastrado,  
> **Quero** verificar meu endereço de email,  
> **Para que** eu possa garantir a segurança da minha conta.

**Ator:** Usuário recém-cadastrado

**Funcionalidade Real:**

- Modal de verificação de email após cadastro
- Botão para reenviar email de verificação
- Indicador de email verificado no perfil

**Critérios de Aceitação:**

1. Após cadastro, o sistema deve enviar email de verificação
2. O sistema deve exibir modal informando sobre verificação pendente
3. O sistema deve permitir reenviar email de verificação
4. O sistema deve mostrar badge de "verificado" no perfil quando confirmado

**Código Relacionado:** `screens/login/index.tsx`, `stores/authStore.ts`

---

### HU-15: Cache de Imagens [NOVA]

> **Como** usuário do aplicativo,  
> **Quero** que as imagens sejam cacheadas localmente,  
> **Para que** eu possa visualizá-las rapidamente e economizar dados.

**Ator:** Usuário (qualquer)

**Funcionalidade Real:**

- Cache automático de imagens visualizadas
- Uso do cache em visualizações subsequentes
- Imagens disponíveis offline após cache

**Critérios de Aceitação:**

1. Imagens visualizadas devem ser salvas em cache local
2. Visualizações subsequentes devem usar cache
3. Imagens em cache devem funcionar offline
4. O sistema deve gerenciar tamanho do cache

**Código Relacionado:** `services/imageCache.ts`, `components/CachedImage.tsx`

---

### HU-16: Tratamento de Erros e Feedback [NOVA]

> **Como** usuário do aplicativo,  
> **Quero** receber feedback claro sobre erros e status das operações,  
> **Para que** eu saiba quando algo deu errado e o que fazer.

**Ator:** Usuário (qualquer)

**Funcionalidade Real:**

- Alerts nativos para erros
- ErrorBoundary para erros de renderização
- Mensagens de status de operações
- Indicadores de loading

**Critérios de Aceitação:**

1. Erros de rede devem mostrar mensagem clara
2. Erros de validação devem indicar o campo problemático
3. Operações em andamento devem mostrar loading
4. Erros fatais devem ser capturados pelo ErrorBoundary
5. Mensagens de sucesso devem confirmar ações

**Código Relacionado:** `components/ErrorBoundary.tsx`, `services/api.ts`

---

### HU-17: Acessibilidade [NOVA]

> **Como** usuário com necessidades especiais de acessibilidade,  
> **Quero** que o aplicativo seja compatível com leitores de tela,  
> **Para que** eu possa utilizá-lo de forma independente.

**Ator:** Usuário com deficiência visual

**Funcionalidade Real:**

- Labels de acessibilidade em componentes
- Roles semânticos (button, header, text)
- Hints de navegação
- Suporte a VoiceOver/TalkBack

**Critérios de Aceitação:**

1. Todos os botões devem ter accessibilityLabel
2. Todos os ícones decorativos devem ter importantForAccessibility="no"
3. Listas devem ter accessibilityRole="list"
4. Campos de texto devem ter hints descritivos
5. Imagens significativas devem ter descrições

**Código Relacionado:** Todos os componentes (propriedades accessibility\*)

---

## 6. Versão Final para o TCC

### Resumo de Alterações Necessárias

| História | Ação                                               | Prioridade |
| -------- | -------------------------------------------------- | ---------- |
| HU-01    | Remover critérios 4 e 6 (não implementados)        | 🔴 Alta    |
| HU-02    | Ajustar critério 6 (técnicas são estáticas)        | 🟡 Média   |
| HU-03    | Remover critério 2 (zoom/rotação) e 6 (sync busca) | 🔴 Alta    |
| HU-04    | Remover critérios 4 e 6 (categorias e exportar)    | 🔴 Alta    |
| HU-05    | ✅ Já marcada como "Trabalho Futuro"               | -          |
| HU-06    | Ajustar critério 6 (histórico parcial)             | 🟡 Média   |
| HU-07    | Remover critérios 3, 5, 6 (dependem do modelo AI)  | 🟡 Média   |
| HU-08    | Remover critérios 3, 5, 6 (não implementados)      | 🔴 Alta    |
| HU-09    | ✅ Correto                                         | -          |
| HU-10    | ✅ Correto                                         | -          |
| HU-11    | Ajustar critério 4 (modo offline é toggle visual)  | 🟢 Baixa   |

### Novas Histórias a Adicionar

| #     | História                 | Justificativa                          |
| ----- | ------------------------ | -------------------------------------- |
| HU-12 | Tela Inicial (Home)      | Funcionalidade central não documentada |
| HU-13 | Administração de Imagens | Funcionalidade Admin importante        |
| HU-14 | Verificação de Email     | Segurança de conta                     |
| HU-15 | Cache de Imagens         | Performance offline                    |
| HU-16 | Tratamento de Erros      | UX essencial                           |
| HU-17 | Acessibilidade           | Conformidade WCAG                      |

---

### Template LaTeX para Novas Histórias

```latex
% ------------------------------------------------------------------------------
\section{HU-12: Tela Inicial}
\label{hu:home}

\textbf{Como} usuario do aplicativo, \\
\textbf{Quero} ver um resumo das principais informacoes na tela inicial, \\
\textbf{Para que} eu possa acessar rapidamente os recursos mais relevantes.

\subsection*{Criterios de Aceitacao}

\begin{enumerate}
    \item O sistema deve exibir saudacao com nome do usuario se autenticado
    \item O sistema deve listar os 5 pontos mais populares
    \item O sistema deve listar os 5 sintomas mais populares
    \item O sistema deve oferecer acesso rapido a Busca, Mapa Corporal e Assistente
    \item O sistema deve atualizar dados ao fazer pull-to-refresh
\end{enumerate}

% ------------------------------------------------------------------------------
\section{HU-13: Administracao de Imagens}
\label{hu:admin-imagens}

\textbf{Como} administrador do sistema, \\
\textbf{Quero} gerenciar as imagens dos pontos de acupuntura, \\
\textbf{Para que} eu possa manter o conteudo visual atualizado.

\subsection*{Criterios de Aceitacao}

\begin{enumerate}
    \item Somente usuarios com role ADMIN devem ver botoes de gerenciamento
    \item O sistema deve permitir upload de multiplas imagens da galeria
    \item O sistema deve permitir captura de foto pela camera
    \item O sistema deve exibir progresso de upload
    \item O sistema deve permitir reordenar imagens
    \item O sistema deve confirmar antes de excluir imagem
\end{enumerate}
```

---

## 📊 Estatísticas Finais

| Métrica                              | Valor                                |
| ------------------------------------ | ------------------------------------ |
| **Histórias no TCC original**        | 11                                   |
| **Histórias corretas**               | 3 (HU-09, HU-10, parcialmente HU-11) |
| **Histórias com problemas**          | 7 (precisam ajustes)                 |
| **Histórias não implementadas**      | 1 (HU-05 Anotações)                  |
| **Novas histórias identificadas**    | 6 (HU-12 a HU-17)                    |
| **Total após revisão**               | 17 histórias                         |
| **Critérios de aceitação originais** | ~70                                  |
| **Critérios que precisam remoção**   | ~12                                  |
| **Cenários Gherkin gerados**         | 50+                                  |

---

_Documento gerado em Dezembro de 2025_
_Baseado na análise do código-fonte real do projeto Appunture_
