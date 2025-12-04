# 📊 Diagramas Mermaid Completos - TCC Appunture

**Data de Atualização:** Dezembro de 2025  
**Versão:** 2.0 - Atualizada com base no código real implementado

Este arquivo contém todos os diagramas em formato Mermaid para o TCC do projeto Appunture.

---

## Índice

1. [Diagrama de Casos de Uso](#1-diagrama-de-casos-de-uso)
2. [Diagrama de Classes - Backend](#2-diagrama-de-classes---backend)
3. [Diagrama de Classes - Frontend](#3-diagrama-de-classes---frontend)
4. [Modelo de Dados - SQLite Local](#4-modelo-de-dados---sqlite-local)
5. [Modelo de Dados - Firestore](#5-modelo-de-dados---firestore)
6. [Diagrama de Arquitetura](#6-diagrama-de-arquitetura)
7. [Diagrama de Componentes](#7-diagrama-de-componentes)
8. [Diagrama de Estados - Stores Zustand](#8-diagrama-de-estados---stores-zustand)
9. [Diagramas de Sequência](#9-diagramas-de-sequência)
   - 9.1 [HU-01: Busca de Pontos](#91-hu-01-busca-de-pontos)
   - 9.2 [HU-02: Detalhes do Ponto](#92-hu-02-detalhes-do-ponto)
   - 9.3 [HU-03: Atlas Visual](#93-hu-03-atlas-visual)
   - 9.4 [HU-04: Gerenciamento de Favoritos](#94-hu-04-gerenciamento-de-favoritos)
   - 9.5 [HU-05: Sincronização de Dados](#95-hu-05-sincronização-de-dados)
   - 9.6 [HU-06: Assistente IA](#96-hu-06-assistente-ia)
   - 9.7 [HU-07: Mapeamento de Sintomas](#97-hu-07-mapeamento-de-sintomas)
   - 9.8 [HU-08: Autenticação](#98-hu-08-autenticação)
   - 9.9 [HU-09: Navegação por Meridianos](#99-hu-09-navegação-por-meridianos)
   - 9.10 [HU-10: Configurações](#910-hu-10-configurações)
10. [Fluxo de Sincronização Offline-First](#10-fluxo-de-sincronização-offline-first)

---

## 1. Diagrama de Casos de Uso

**Arquivo:** `fig/casos-de-uso.png`

```mermaid
flowchart TB
    subgraph Sistema["Sistema Appunture"]
        direction TB

        subgraph Consulta["📚 Consulta de Informações"]
            UC1["HU-01: Buscar Pontos<br/>de Acupuntura"]
            UC2["HU-02: Visualizar<br/>Detalhes do Ponto"]
            UC3["HU-03: Navegar pelo<br/>Atlas Visual"]
            UC9["HU-09: Navegar por<br/>Meridianos"]
        end

        subgraph Personalizacao["⭐ Personalização"]
            UC4["HU-04: Gerenciar<br/>Favoritos"]
            UC10["HU-10: Configurações<br/>e Preferências"]
        end

        subgraph Assistencia["🤖 Assistência"]
            UC6["HU-06: Consultar<br/>Assistente IA"]
            UC7["HU-07: Mapear<br/>Sintomas"]
        end

        subgraph Sistema_Core["⚙️ Sistema"]
            UC8["HU-08: Autenticação"]
            UC5["HU-05: Sincronização<br/>de Dados"]
        end
    end

    Usuario((👤 Estudante/<br/>Profissional))
    Admin((🔧 Administrador))

    Usuario --> UC1
    Usuario --> UC2
    Usuario --> UC3
    Usuario --> UC4
    Usuario --> UC5
    Usuario --> UC6
    Usuario --> UC7
    Usuario --> UC8
    Usuario --> UC9
    Usuario --> UC10

    Admin --> UC8
    Admin -.->|gerencia| UC1

    UC1 -.->|include| UC2
    UC3 -.->|include| UC2
    UC9 -.->|include| UC2
    UC4 -.->|require| UC8
    UC5 -.->|require| UC8
```

---

## 2. Diagrama de Classes - Backend

**Arquivo:** `fig/classes.png`

```mermaid
classDiagram
    class FirestorePoint {
        +String id
        +String code
        +String name
        +String description
        +String meridian
        +String location
        +String indication
        +Map~String,Double~ coordinates
        +List~String~ imageUrls
        +Map~String,String~ imageThumbnailMap
        +List~ImageAuditEntry~ imageAudit
        +List~String~ symptomIds
        +List~String~ tags
        +String category
        +Integer favoriteCount
        +Integer viewCount
        +String createdBy
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
        +addSymptomId(String)
        +removeSymptomId(String)
    }

    class FirestoreUser {
        +String id
        +String firebaseUid
        +String email
        +String name
        +String role
        +boolean enabled
        +List~String~ favoritePointIds
        +String profileImageUrl
        +String phoneNumber
        +boolean emailVerified
        +String fcmToken
        +List~String~ notificationTopics
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
        +isAdmin() boolean
        +isUser() boolean
    }

    class FirestoreSymptom {
        +String id
        +String name
        +String description
        +String category
        +List~String~ tags
        +List~String~ pointIds
        +Integer useCount
        +Integer associatedPointsCount
        +Integer severity
        +Integer priority
        +String createdBy
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
        +addPointId(String)
        +removePointId(String)
        +incrementUseCount()
    }

    class ImageAuditEntry {
        +String imageUrl
        +String thumbnailUrl
        +String action
        +String performedBy
        +String performedByEmail
        +LocalDateTime timestamp
        +String notes
    }

    FirestorePoint "1" *-- "*" ImageAuditEntry : imageAudit
    FirestorePoint "*" -- "*" FirestoreSymptom : symptomIds ↔ pointIds
    FirestoreUser "*" -- "*" FirestorePoint : favoritePointIds
```

---

## 3. Diagrama de Classes - Frontend

**Arquivo:** `fig/classes-frontend.png`

```mermaid
classDiagram
    class LocalPoint {
        +String id
        +String name
        +String chinese_name
        +String meridian
        +String location
        +String functions
        +String indications
        +String contraindications
        +String image_path
        +String coordinates
        +String code
        +Integer favorite_count
        +boolean synced
        +String last_sync
    }

    class LocalSymptom {
        +String id
        +String name
        +String synonyms
        +String category
        +Integer use_count
        +boolean synced
        +String last_sync
    }

    class Favorite {
        +Integer id
        +String point_id
        +String user_id
        +boolean synced
        +String operation
        +String created_at
        +String updated_at
    }

    class SyncOperation {
        +String id
        +String entity_type
        +String operation
        +String data
        +String reference
        +Integer timestamp
        +Integer retry_count
        +String last_error
        +Integer last_attempt
        +String status
        +Integer created_at
    }

    class User {
        +String id
        +String email
        +String name
        +String role
        +String profileImageUrl
    }

    LocalPoint "1" -- "*" Favorite : point_id
    User "1" -- "*" Favorite : user_id
    SyncOperation ..> Favorite : sincroniza
```

---

## 4. Modelo de Dados - SQLite Local

**Arquivo:** `fig/modelo-logico-sqlite.png`

```mermaid
erDiagram
    points {
        TEXT id PK "Firestore ID"
        TEXT code "Ex: VG20, E36"
        TEXT name "Nome obrigatório"
        TEXT chinese_name "Nome chinês"
        TEXT meridian "Meridiano"
        TEXT location "Localização"
        TEXT functions "Funções"
        TEXT indications "Indicações"
        TEXT contraindications "Contraindicações"
        TEXT image_path "Caminho imagem"
        TEXT coordinates "JSON x,y"
        INTEGER favorite_count "Contagem favoritos"
        INTEGER synced "0=não, 1=sim"
        DATETIME last_sync "Última sincronização"
    }

    symptoms {
        TEXT id PK "Firestore ID"
        TEXT name "Nome obrigatório"
        TEXT synonyms "JSON array sinônimos"
        TEXT category "Categoria"
        INTEGER use_count "Uso em buscas"
        INTEGER synced "0=não, 1=sim"
        DATETIME last_sync "Última sincronização"
    }

    symptom_points {
        TEXT symptom_id PK,FK
        TEXT point_id PK,FK
        REAL efficacy_score "Default 1.0"
    }

    favorites {
        INTEGER id PK "AUTOINCREMENT"
        TEXT point_id FK
        TEXT user_id "Firebase UID"
        INTEGER synced "0=não, 1=sim"
        TEXT operation "UPSERT ou DELETE"
        DATETIME created_at
        DATETIME updated_at
    }

    search_history {
        INTEGER id PK "AUTOINCREMENT"
        TEXT query "Termo buscado"
        TEXT type "point, symptom, general"
        DATETIME created_at
    }

    sync_status {
        TEXT table_name PK
        DATETIME last_sync
        TEXT status "success, error, pending"
    }

    sync_queue {
        TEXT id PK "UUID"
        TEXT entity_type "favorite, point, symptom"
        TEXT operation "CREATE, UPDATE, DELETE"
        TEXT data "JSON payload"
        TEXT reference "Referência opcional"
        INTEGER timestamp "Unix timestamp"
        INTEGER retry_count "Default 0"
        TEXT last_error "Último erro"
        INTEGER last_attempt "Unix timestamp"
        TEXT status "pending, in_progress, retry, failed"
        INTEGER created_at "Unix timestamp"
    }

    image_sync_queue {
        INTEGER id PK "AUTOINCREMENT"
        TEXT point_id FK
        TEXT image_uri "URI local"
        TEXT payload "JSON dados"
        TEXT status "pending, in_progress, retry, failed"
        INTEGER retry_count "Default 0"
        DATETIME last_attempt
        DATETIME created_at
    }

    points ||--o{ symptom_points : "relaciona"
    symptoms ||--o{ symptom_points : "relaciona"
    points ||--o{ favorites : "favoritado em"
    points ||--o{ image_sync_queue : "imagens"
```

---

## 5. Modelo de Dados - Firestore

**Arquivo:** `fig/modelo-logico-firestore.png`

```mermaid
flowchart TB
    subgraph Firestore["☁️ Cloud Firestore"]
        subgraph Collections["Collections"]
            PC[("📁 points")]
            SC[("📁 symptoms")]
            UC[("📁 users")]
        end
    end

    subgraph Point["📄 Document: FirestorePoint"]
        direction LR
        P1["id: String<br/>code: String<br/>name: String<br/>description: String"]
        P2["meridian: String<br/>location: String<br/>indication: String"]
        P3["coordinates: Map<br/>imageUrls: Array<br/>imageThumbnailMap: Map<br/>symptomIds: Array"]
        P4["favoriteCount: Number<br/>viewCount: Number<br/>tags: Array<br/>category: String"]
    end

    subgraph Symptom["📄 Document: FirestoreSymptom"]
        direction LR
        S1["id: String<br/>name: String<br/>description: String"]
        S2["category: String<br/>tags: Array<br/>pointIds: Array"]
        S3["useCount: Number<br/>severity: Number<br/>priority: Number"]
    end

    subgraph User["📄 Document: FirestoreUser"]
        direction LR
        U1["id: String<br/>firebaseUid: String<br/>email: String<br/>name: String"]
        U2["role: String<br/>enabled: Boolean<br/>emailVerified: Boolean"]
        U3["favoritePointIds: Array<br/>fcmToken: String<br/>notificationTopics: Array"]
    end

    PC --> Point
    SC --> Symptom
    UC --> User

    P3 -.->|"symptomIds[]"| SC
    S2 -.->|"pointIds[]"| PC
    U3 -.->|"favoritePointIds[]"| PC

    style Point fill:#e1f5fe
    style Symptom fill:#f3e5f5
    style User fill:#e8f5e9
```

---

## 6. Diagrama de Arquitetura

**Arquivo:** `fig/arquitetura.png`

```mermaid
flowchart TB
    subgraph Mobile["📱 Mobile App - React Native 0.79.6 + Expo SDK 53"]
        subgraph UI["Interface do Usuário"]
            Tabs["Tabs: Home, Search, Meridians,<br/>Symptoms, Chatbot, Favorites, Profile"]
            Screens["Screens: PointDetails, BodyMap,<br/>SymptomDetails, Login, Register"]
        end

        subgraph StateManagement["Gerenciamento de Estado - Zustand 4.4.7"]
            AS["authStore<br/>• user, token<br/>• isAuthenticated"]
            PS["pointsStore<br/>• points, favorites<br/>• meridians"]
            SS["syncStore<br/>• pendingOps<br/>• lastSync, status"]
            SYS["symptomsStore<br/>• symptoms<br/>• categories"]
            TS["themeStore<br/>• mode, isDark<br/>• colors"]
        end

        subgraph Services["Serviços"]
            API["api.ts<br/>Axios Client"]
            DB["database.ts<br/>SQLite"]
            FB["firebase.ts<br/>Auth Client"]
            ST["storage.ts<br/>AsyncStorage<br/>SecureStore"]
            CN["connectivity.ts<br/>Network Monitor"]
        end
    end

    subgraph Backend["☕ Backend - Spring Boot 3.2.5 + Java 17"]
        subgraph Controllers["REST Controllers"]
            PC["FirestorePointController"]
            SC["FirestoreSymptomController"]
            AC["FirestoreAuthController"]
            AIC["AiChatController"]
            NC["NotificationController"]
            STC["FirebaseStorageController"]
        end

        subgraph BackendServices["Services"]
            PointSvc["FirestorePointService"]
            SymptomSvc["FirestoreSymptomService"]
            AuthSvc["FirestoreAuthService"]
            AISvc["AiChatService<br/>Spring AI + Gemini"]
        end

        subgraph Security["Security"]
            JWT["Firebase JWT<br/>Validation"]
            RBAC["Role-Based<br/>Access Control"]
        end
    end

    subgraph Firebase["🔥 Firebase"]
        FA["Firebase Auth<br/>Email + Google OAuth"]
        FS["Cloud Firestore<br/>NoSQL Database"]
        FST["Firebase Storage<br/>Images"]
        FCM["Cloud Messaging<br/>Push Notifications"]
    end

    subgraph LocalStorage["💾 Local Storage"]
        SQLite[("SQLite<br/>8 tabelas")]
        Cache["Image Cache"]
        Secure["SecureStore<br/>Tokens"]
    end

    UI --> StateManagement
    StateManagement --> Services

    API -->|"HTTPS/REST"| Controllers
    FB -->|"Auth SDK"| FA

    Controllers --> Security
    Security --> BackendServices
    BackendServices --> FS
    BackendServices --> FST
    BackendServices --> FA
    BackendServices --> FCM

    DB --> SQLite
    ST --> Cache
    ST --> Secure

    style Mobile fill:#e3f2fd
    style Backend fill:#fff3e0
    style Firebase fill:#fce4ec
    style LocalStorage fill:#e8f5e9
```

---

## 7. Diagrama de Componentes

**Arquivo:** `fig/componentes.png`

```mermaid
flowchart TB
    subgraph Frontend["Frontend Mobile"]
        subgraph AppLayer["App Layer"]
            Router["Expo Router<br/>Navigation"]
            Tabs["Tab Navigator<br/>7 tabs"]
        end

        subgraph ScreensLayer["Screens"]
            Home["HomeScreen"]
            Search["SearchScreen"]
            Meridians["MeridiansScreen"]
            Symptoms["SymptomsScreen"]
            Chatbot["ChatbotScreen"]
            Favorites["FavoritesScreen"]
            Profile["ProfileScreen"]
            PointDetails["PointDetailsScreen"]
            BodyMap["BodyMapScreen"]
        end

        subgraph ComponentsLayer["Components"]
            PointCard["PointCard"]
            SearchBar["SearchBar"]
            BodySVG["BodyMapSVG"]
            ImageGallery["ImageGallery"]
            ChatMessage["ChatMessage"]
            MeridianCard["MeridianCard"]
        end

        subgraph StoresLayer["Stores - Zustand"]
            Auth["useAuthStore"]
            Points["usePointsStore"]
            Sync["useSyncStore"]
            SymptomsS["useSymptomsStore"]
            Theme["useThemeStore"]
        end

        subgraph ServicesLayer["Services"]
            ApiSvc["apiService"]
            DbSvc["databaseService"]
            FirebaseSvc["firebaseAuth"]
            StorageSvc["storageService"]
            ConnSvc["connectivityService"]
        end
    end

    Router --> Tabs
    Tabs --> ScreensLayer
    ScreensLayer --> ComponentsLayer
    ScreensLayer --> StoresLayer
    StoresLayer --> ServicesLayer

    style AppLayer fill:#bbdefb
    style ScreensLayer fill:#c8e6c9
    style ComponentsLayer fill:#fff9c4
    style StoresLayer fill:#f8bbd9
    style ServicesLayer fill:#d1c4e9
```

---

## 8. Diagrama de Estados - Stores Zustand

**Arquivo:** `fig/estados-stores.png`

```mermaid
stateDiagram-v2
    [*] --> App

    state App {
        state authStore {
            [*] --> Loading : initializeAuth()
            Loading --> Unauthenticated : Token inválido
            Loading --> Authenticated : Token válido
            Unauthenticated --> Authenticating : login()/register()
            Authenticating --> Authenticated : Success
            Authenticating --> Unauthenticated : Error
            Authenticated --> Unauthenticated : logout()
        }

        state pointsStore {
            [*] --> Idle
            Idle --> Fetching : loadPoints()
            Fetching --> Loaded : API Success
            Fetching --> LocalOnly : API Error + Cache
            Fetching --> Error : API Error + No Cache
            Loaded --> Fetching : refresh()
            LocalOnly --> Fetching : retry()
            Error --> Fetching : retry()
        }

        state syncStore {
            [*] --> Synced
            Synced --> Pending : Local change
            Pending --> Syncing : Network available
            Syncing --> Synced : All ops success
            Syncing --> PartialSync : Some ops failed
            PartialSync --> Syncing : Retry with backoff
            Syncing --> Pending : Network lost
        }

        state themeStore {
            [*] --> System
            System --> Light : setMode('light')
            System --> Dark : setMode('dark')
            Light --> Dark : toggleTheme()
            Dark --> Light : toggleTheme()
            Light --> System : setMode('system')
            Dark --> System : setMode('system')
        }
    }
```

---

## 9. Diagramas de Sequência

### 9.1 HU-01: Busca de Pontos

**Arquivo:** `fig/seq-busca.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Search as 🔍 SearchScreen
    participant Store as 📦 pointsStore
    participant API as 🌐 apiService
    participant DB as 💾 SQLite
    participant Backend as ☕ Backend

    User->>Search: Digitar termo de busca
    Search->>Search: Debounce 300ms
    Search->>Store: searchPoints(query)

    alt Online
        Store->>API: GET /points/search?query=...
        API->>Backend: HTTP Request
        Backend->>Backend: Buscar no Firestore
        Backend-->>API: Lista de pontos
        API-->>Store: Points[]
        Store->>DB: Salvar em cache
    else Offline
        Store->>DB: SELECT * FROM points WHERE name LIKE...
        DB-->>Store: LocalPoint[]
    end

    Store-->>Search: Atualizar searchResults
    Search-->>User: Exibir lista de pontos

    User->>Search: Tocar em ponto
    Search->>Search: router.push('/point-details/[id]')
```

---

### 9.2 HU-02: Detalhes do Ponto

**Arquivo:** `fig/seq-detalhes.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Details as 📄 PointDetailsScreen
    participant Store as 📦 pointsStore
    participant API as 🌐 apiService
    participant DB as 💾 SQLite
    participant Backend as ☕ Backend
    participant Storage as 🖼️ Firebase Storage

    User->>Details: Abrir tela de detalhes
    Details->>Store: loadPoint(pointId)

    alt Online
        Store->>API: GET /points/{id}
        API->>Backend: HTTP Request
        Backend->>Backend: Firestore.get(pointId)
        Backend-->>API: PointWithSymptoms
        API-->>Store: Dados completos
        Store->>DB: Atualizar cache local
    else Offline
        Store->>DB: getPointById(id)
        DB-->>Store: LocalPoint
    end

    Store-->>Details: selectedPoint
    Details->>Details: Renderizar informações

    alt Possui imagens
        Details->>Storage: Carregar imageUrls[]
        Storage-->>Details: Imagens do ponto
        Details->>Details: Exibir galeria
    end

    Details-->>User: Tela completa renderizada
```

---

### 9.3 HU-03: Atlas Visual

**Arquivo:** `fig/seq-atlas.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant BodyMap as 🗺️ BodyMapScreen
    participant SVG as 🎨 BodyMapSVG
    participant Store as 📦 pointsStore
    participant DB as 💾 SQLite

    User->>BodyMap: Abrir Atlas Visual
    BodyMap->>Store: Carregar pontos com coordenadas
    Store->>DB: getPointsWithCoordinates()
    DB-->>Store: Points com x,y
    Store-->>BodyMap: Lista de pontos

    BodyMap->>SVG: Renderizar camada atual
    SVG->>SVG: Posicionar marcadores
    SVG-->>User: Mapa com pontos interativos

    User->>SVG: Navegar camadas (← →)
    SVG->>SVG: Trocar para próxima camada
    SVG-->>User: Nova camada exibida

    User->>SVG: Alternar Frente/Costas
    SVG->>SVG: Trocar plano (front/back)
    SVG-->>User: Vista alternada

    User->>SVG: Tocar em marcador
    SVG->>BodyMap: onPointSelect(pointId)
    BodyMap->>BodyMap: router.push('/point-details/[id]')
```

---

### 9.4 HU-04: Gerenciamento de Favoritos

**Arquivo:** `fig/seq-favoritos.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Screen as 📱 Tela (Search/Details/Favorites)
    participant Store as 📦 pointsStore
    participant Auth as 🔐 authStore
    participant DB as 💾 SQLite
    participant Sync as 🔄 syncStore
    participant API as 🌐 apiService

    User->>Screen: Tocar ícone favorito ⭐
    Screen->>Auth: Verificar isAuthenticated

    alt Não autenticado
        Auth-->>Screen: false
        Screen-->>User: "Faça login para favoritar"
    else Autenticado
        Auth-->>Screen: true
        Screen->>Store: toggleFavorite(pointId)

        Note over Store,DB: Optimistic Update
        Store->>Store: Atualizar UI imediatamente
        Store->>DB: INSERT/DELETE favorites
        DB-->>Store: Sucesso local

        Store->>Sync: addToQueue(favorite, UPSERT/DELETE)
        Sync->>DB: INSERT sync_queue

        alt Online
            Sync->>API: POST/DELETE /favorites
            API-->>Sync: Sucesso
            Sync->>DB: UPDATE synced=1
        else Offline
            Sync-->>Sync: Manter na fila
            Note over Sync: Sincronizar quando online
        end

        Store-->>Screen: Atualizar estado
        Screen-->>User: ⭐ preenchida/vazia
    end
```

---

### 9.5 HU-05: Sincronização de Dados

**Arquivo:** `fig/seq-sync.png`

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 App
    participant Conn as 🌐 connectivityService
    participant Sync as 🔄 syncStore
    participant Queue as 📋 sync_queue
    participant API as 🌐 apiService
    participant DB as 💾 SQLite
    participant Backend as ☕ Backend

    Note over App,Backend: Inicialização / Mudança de Conectividade

    App->>Conn: Monitorar conectividade
    Conn-->>App: Online detectado
    App->>Sync: triggerSync()

    Sync->>Queue: Buscar operações pending
    Queue-->>Sync: Lista de SyncOperations

    loop Para cada operação
        Sync->>Sync: Verificar retry_count < MAX_RETRIES

        alt Operação de Favorito
            Sync->>API: POST/DELETE /favorites
        else Operação de Ponto
            Sync->>API: Buscar dados atualizados
        end

        alt Sucesso
            API-->>Sync: 200 OK
            Sync->>DB: Remover da fila
            Sync->>DB: UPDATE synced=1
        else Erro recuperável
            API-->>Sync: 5xx Error
            Sync->>Queue: Incrementar retry_count
            Sync->>Sync: Calcular backoff exponencial
            Note over Sync: Delay = 1s * 2^retry_count (max 60s)
        else Erro permanente
            API-->>Sync: 4xx Error
            Sync->>Queue: Marcar como failed
        end
    end

    Sync->>Sync: Atualizar lastSync
    Sync-->>App: Sincronização completa
```

---

### 9.6 HU-06: Assistente IA

**Arquivo:** `fig/seq-ia.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Chat as 🤖 ChatbotScreen
    participant API as 🌐 apiService
    participant Backend as ☕ AiChatController
    participant AI as 🧠 AiChatService
    participant Gemini as ✨ Google Gemini

    User->>Chat: Digitar pergunta
    Chat->>Chat: Adicionar mensagem ao histórico
    Chat->>Chat: setLoading(true)

    Chat->>API: POST /ai/chat
    Note over API: { message, history }

    API->>Backend: HTTP Request
    Backend->>AI: processChat(message, history)

    AI->>AI: Construir prompt com contexto
    AI->>Gemini: Enviar para modelo
    Gemini-->>AI: Resposta gerada

    AI->>AI: Processar resposta
    AI-->>Backend: ChatResponse
    Backend-->>API: JSON Response
    API-->>Chat: { response, suggestedPoints }

    Chat->>Chat: Adicionar resposta ao histórico
    Chat->>Chat: setLoading(false)
    Chat->>Chat: Renderizar Markdown
    Chat-->>User: Exibir resposta formatada

    opt Pontos sugeridos
        Chat-->>User: Exibir cards de pontos relacionados
        User->>Chat: Tocar em ponto sugerido
        Chat->>Chat: Navegar para detalhes
    end
```

---

### 9.7 HU-07: Mapeamento de Sintomas

**Arquivo:** `fig/seq-mapper.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Symptoms as 🩺 SymptomsScreen
    participant Store as 📦 symptomsStore
    participant API as 🌐 apiService
    participant Backend as ☕ Backend
    participant Details as 📄 SymptomDetailsScreen

    User->>Symptoms: Abrir tela de sintomas
    Symptoms->>Store: fetchSymptoms()
    Store->>API: GET /symptoms
    API->>Backend: HTTP Request
    Backend-->>API: Lista de sintomas
    API-->>Store: Symptom[]
    Store-->>Symptoms: Atualizar lista

    User->>Symptoms: Filtrar por categoria
    Symptoms->>Store: fetchSymptomsByCategory(category)
    Store->>API: GET /symptoms?category=...
    API-->>Store: Sintomas filtrados
    Store-->>Symptoms: Lista atualizada

    User->>Symptoms: Buscar sintoma
    Symptoms->>Store: searchSymptoms(query)
    Store->>API: GET /symptoms/search?query=...
    API-->>Store: Resultados
    Store-->>Symptoms: Exibir resultados

    User->>Symptoms: Selecionar sintoma
    Symptoms->>Details: Navegar para detalhes
    Details->>Store: fetchSymptomById(id)
    Store->>API: GET /symptoms/{id}
    API-->>Store: SymptomWithPoints
    Store-->>Details: Dados + pontos relacionados
    Details-->>User: Exibir pontos recomendados

    Note over Details,User: ⚠️ Aviso: Uso educacional apenas
```

---

### 9.8 HU-08: Autenticação

**Arquivo:** `fig/seq-auth.png`

#### Login com Email/Senha

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Login as 🔑 LoginScreen
    participant Store as 📦 authStore
    participant Firebase as 🔥 Firebase Auth
    participant API as 🌐 apiService
    participant Backend as ☕ Backend
    participant Storage as 💾 SecureStore

    User->>Login: Inserir email e senha
    Login->>Store: login(credentials)
    Store->>Store: setLoading(true)

    Store->>Firebase: signInWithEmailAndPassword()
    Firebase-->>Store: UserCredential

    Store->>Firebase: getIdToken()
    Firebase-->>Store: JWT Token

    Store->>Storage: storeToken(token)

    Store->>API: GET /auth/profile
    Note over API: Header: Authorization: Bearer {token}
    API->>Backend: HTTP Request
    Backend->>Backend: Validar JWT
    Backend-->>API: User Profile

    alt Usuário não existe no backend
        Store->>API: POST /auth/sync
        API->>Backend: Criar usuário no Firestore
        Backend-->>API: User criado
    end

    API-->>Store: User data
    Store->>Storage: storeUserData(user)
    Store->>Store: setAuthenticated(true)
    Store-->>Login: Sucesso
    Login->>Login: router.replace('/(tabs)')
```

#### Login Social (Google)

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Login as 🔑 LoginScreen
    participant Store as 📦 authStore
    participant Google as 🔵 Google OAuth
    participant Firebase as 🔥 Firebase Auth
    participant API as 🌐 apiService
    participant Backend as ☕ Backend

    User->>Login: Tocar "Entrar com Google"
    Login->>Store: loginWithGoogle()

    Store->>Google: signInWithGoogle()
    Google->>Google: Abrir popup/redirect
    User->>Google: Selecionar conta
    Google-->>Store: { idToken, accessToken }

    Store->>Firebase: signInWithCredential(GoogleCredential)
    Firebase-->>Store: UserCredential

    Store->>Firebase: getIdToken()
    Firebase-->>Store: JWT Token

    Store->>API: GET /auth/profile
    API->>Backend: HTTP Request

    alt Primeiro acesso
        Backend-->>API: 404 Not Found
        Store->>API: POST /auth/sync
        Backend->>Backend: Criar usuário com dados do Google
        Backend-->>API: User criado
    else Usuário existente
        Backend-->>API: User Profile
    end

    Store->>Store: setAuthenticated(true)
    Store-->>Login: Sucesso
```

#### Cadastro

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Register as 📝 RegisterScreen
    participant Store as 📦 authStore
    participant Firebase as 🔥 Firebase Auth
    participant API as 🌐 apiService
    participant Backend as ☕ Backend

    User->>Register: Preencher nome, email, senha
    Register->>Register: Validar senha >= 6 caracteres
    Register->>Register: Validar confirmação de senha

    Register->>Store: register(data)
    Store->>Firebase: createUserWithEmailAndPassword()
    Firebase-->>Store: UserCredential

    Store->>Firebase: updateProfile({ displayName })
    Firebase-->>Store: Perfil atualizado

    Store->>Firebase: getIdToken()
    Firebase-->>Store: JWT Token

    Store->>API: POST /auth/sync
    API->>Backend: Criar usuário no Firestore
    Backend-->>API: User criado

    Store->>Store: setAuthenticated(true)
    Store-->>Register: Sucesso
    Register->>Register: router.replace('/(tabs)')
```

---

### 9.9 HU-09: Navegação por Meridianos

**Arquivo:** `fig/seq-meridianos.png`

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Meridians as 🔮 MeridiansScreen
    participant Store as 📦 pointsStore
    participant API as 🌐 apiService
    participant Backend as ☕ Backend
    participant Details as 📄 MeridianDetailsScreen

    User->>Meridians: Abrir tela de meridianos
    Meridians->>Store: loadMeridians()
    Store->>API: GET /points/meridians
    API->>Backend: HTTP Request
    Backend->>Backend: Aggregate por meridiano
    Backend-->>API: Lista com contagem
    API-->>Store: Meridians[]
    Store-->>Meridians: Dados dos meridianos

    Meridians->>Meridians: Renderizar cards
    Note over Meridians: Exibir: nome, elemento Wu Xing,<br/>horário, órgão, cor, quantidade

    Meridians-->>User: Lista de meridianos

    User->>Meridians: Selecionar meridiano
    Meridians->>Details: Navegar para detalhes
    Details->>Store: loadPointsByMeridian(meridian)
    Store->>API: GET /points?meridian=...
    API-->>Store: Points do meridiano
    Store-->>Details: Lista de pontos
    Details-->>User: Exibir pontos do meridiano
```

---

### 9.10 HU-10: Configurações

**Arquivo:** `fig/seq-config.png`

#### Alternar Tema

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Profile as ⚙️ ProfileScreen
    participant Store as 📦 themeStore
    participant Storage as 💾 AsyncStorage
    participant App as 📱 App

    User->>Profile: Tocar em opção de tema
    Profile->>Store: setMode('light'|'dark'|'system')

    Store->>Store: Calcular cores efetivas
    Store->>Store: Atualizar isDark, colors
    Store->>Storage: Persistir preferência

    Store-->>App: Notificar mudança
    App->>App: Re-renderizar com novas cores
    App-->>User: Interface atualizada
```

#### Logout

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Usuário
    participant Profile as ⚙️ ProfileScreen
    participant Store as 📦 authStore
    participant Firebase as 🔥 Firebase Auth
    participant Storage as 💾 SecureStore
    participant DB as 💾 SQLite

    User->>Profile: Tocar em "Sair"
    Profile->>Profile: Exibir confirmação
    User->>Profile: Confirmar logout

    Profile->>Store: logout()
    Store->>Firebase: signOut()
    Firebase-->>Store: Sucesso

    Store->>Storage: removeToken()
    Store->>Storage: removeUserData()
    Store->>DB: Limpar dados do usuário

    Store->>Store: Reset state
    Store-->>Profile: Logout completo
    Profile->>Profile: router.replace('/login')
```

---

## 10. Fluxo de Sincronização Offline-First

**Arquivo:** `fig/fluxo-sync.png`

```mermaid
flowchart TB
    subgraph UserAction["👤 Ação do Usuário"]
        A1[Adicionar Favorito]
        A2[Remover Favorito]
    end

    subgraph LocalFirst["💾 Local First"]
        L1[Atualizar UI<br/>Optimistic Update]
        L2[Salvar SQLite<br/>synced=0]
        L3[Adicionar à<br/>sync_queue]
    end

    subgraph NetworkCheck["🌐 Verificação de Rede"]
        N1{Online?}
    end

    subgraph SyncProcess["🔄 Processo de Sincronização"]
        S1[Buscar operações<br/>pending]
        S2[Processar operação]
        S3{Sucesso?}
        S4[Remover da fila<br/>synced=1]
        S5[Incrementar retry]
        S6{retry < MAX?}
        S7[Calcular backoff<br/>exponencial]
        S8[Marcar como<br/>failed]
    end

    subgraph Backend["☕ Backend API"]
        B1[POST/DELETE<br/>/favorites]
        B2[Atualizar<br/>Firestore]
    end

    A1 --> L1
    A2 --> L1
    L1 --> L2
    L2 --> L3
    L3 --> N1

    N1 -->|Sim| S1
    N1 -->|Não| W1[Aguardar<br/>conectividade]
    W1 -.->|Quando online| S1

    S1 --> S2
    S2 --> B1
    B1 --> B2
    B2 --> S3

    S3 -->|Sim| S4
    S3 -->|Não| S5
    S5 --> S6
    S6 -->|Sim| S7
    S7 -.->|Após delay| S2
    S6 -->|Não| S8

    style UserAction fill:#e3f2fd
    style LocalFirst fill:#e8f5e9
    style SyncProcess fill:#fff3e0
    style Backend fill:#fce4ec
```

---

## Instruções para Gerar Imagens

### Mermaid CLI

```bash
# Instalar
npm install -g @mermaid-js/mermaid-cli

# Gerar PNG
mmdc -i diagrama.mmd -o diagrama.png -t neutral -b white -w 1200

# Gerar SVG (melhor qualidade)
mmdc -i diagrama.mmd -o diagrama.svg -t neutral -b white
```

### Ferramentas Online

- **Mermaid Live Editor:** https://mermaid.live/
- **Mermaid Chart:** https://www.mermaidchart.com/

### VS Code Extensions

- **Mermaid Preview:** `bierner.markdown-mermaid`
- **Mermaid Editor:** `tomoyukim.vscode-mermaid-editor`

---

## Checklist de Substituição de Arquivos

| Arquivo Original                  | Diagrama Mermaid | Status        |
| --------------------------------- | ---------------- | ------------- |
| `fig/casos-de-uso.png`            | Seção 1          | ⬜ Substituir |
| `fig/classes.png`                 | Seção 2          | ⬜ Substituir |
| `fig/modelo-logico-sqlite.png`    | Seção 4          | ⬜ Substituir |
| `fig/modelo-logico-firestore.png` | Seção 5          | ⬜ Substituir |
| `fig/arquitetura.png`             | Seção 6          | ⬜ Substituir |
| `fig/seq-busca.png`               | Seção 9.1        | ⬜ Substituir |
| `fig/seq-detalhes.png`            | Seção 9.2        | ⬜ Substituir |
| `fig/seq-atlas.png`               | Seção 9.3        | ⬜ Substituir |
| `fig/seq-favoritos.png`           | Seção 9.4        | ⬜ Substituir |
| `fig/seq-sync.png`                | Seção 9.5        | ⬜ Substituir |
| `fig/seq-ia.png`                  | Seção 9.6        | ⬜ Substituir |
| `fig/seq-mapper.png`              | Seção 9.7        | ⬜ Substituir |
| `fig/seq-loginemailsenha.png`     | Seção 9.8        | ⬜ Substituir |
| `fig/seq-loginsocial.png`         | Seção 9.8        | ⬜ Substituir |
| `fig/seq-cadastro.png`            | Seção 9.8        | ⬜ Substituir |
| `fig/seq-listarmeridianos.png`    | Seção 9.9        | ⬜ Substituir |
| `fig/seq-acessarmeridiano.png`    | Seção 9.9        | ⬜ Substituir |
| `fig/seq-apptheme.png`            | Seção 9.10       | ⬜ Substituir |
| `fig/seq-logout.png`              | Seção 9.10       | ⬜ Substituir |
| `fig/seq-anotacao.png`            | ❌ REMOVER       | ⬜ Deletar    |

---

_Diagramas atualizados em Dezembro de 2025 - Versão 2.0_
