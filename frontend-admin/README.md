# Appunture Admin Dashboard

Painel administrativo para gerenciamento de pontos de acupuntura, meridianos e usuários.

## Tecnologias

- **React 18** + **TypeScript**
- **Vite 5** - Build tool rápido
- **TailwindCSS** - Estilização utilitária
- **React Router 6** - Roteamento
- **React Query** - Gerenciamento de estado do servidor
- **Firebase Auth** - Autenticação
- **Headless UI** - Componentes acessíveis
- **Heroicons** - Ícones

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com as configurações do Firebase
```

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Estrutura do Projeto

```
frontend-admin/
├── src/
│   ├── api/              # Clientes API
│   │   ├── client.ts     # Axios configurado
│   │   ├── points.ts     # API de pontos
│   │   ├── meridians.ts  # API de meridianos
│   │   ├── users.ts      # API de usuários
│   │   └── stats.ts      # API de estatísticas
│   ├── components/       # Componentes React
│   │   ├── DataTable.tsx # Tabela com paginação
│   │   ├── Header.tsx    # Cabeçalho
│   │   ├── Layout.tsx    # Layout principal
│   │   ├── Modal.tsx     # Modal e ConfirmModal
│   │   ├── Sidebar.tsx   # Navegação lateral
│   │   └── forms/        # Formulários
│   ├── config/           # Configurações
│   │   └── firebase.ts   # Configuração Firebase
│   ├── hooks/            # React Hooks
│   │   ├── useApi.ts     # Hook para React Query
│   │   └── useAuth.tsx   # Hook de autenticação
│   ├── pages/            # Páginas
│   │   ├── Dashboard.tsx # Painel principal
│   │   ├── Login.tsx     # Tela de login
│   │   ├── Meridians.tsx # CRUD de meridianos
│   │   ├── PointEdit.tsx # Edição de ponto
│   │   ├── Points.tsx    # CRUD de pontos
│   │   └── Users.tsx     # Listagem de usuários
│   ├── types/            # Tipos TypeScript
│   ├── App.tsx           # Componente principal
│   ├── index.css         # Estilos globais
│   └── main.tsx          # Entry point
└── ...
```

## Funcionalidades

### Dashboard

- Estatísticas gerais (pontos, meridianos, usuários)
- Gráfico de pontos por meridiano
- Atividade recente

### Pontos de Acupuntura

- Listagem com paginação e busca
- Criação, edição e exclusão
- Formulário completo com todos os campos

### Meridianos

- Listagem com paginação
- CRUD via modais
- Informações de elemento e Yin/Yang

### Usuários

- Listagem de usuários
- Busca por nome ou email
- Toggle de permissão admin
- Contagem de favoritos

## Segurança

- Apenas usuários com role `ADMIN` podem acessar
- Autenticação via Firebase
- Token JWT enviado em todas as requisições

## Deploy

O build pode ser hospedado em qualquer serviço de hospedagem estática:

```bash
npm run build
# O build estará em dist/
```

### Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

### Vercel/Netlify

Conecte o repositório e configure:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
