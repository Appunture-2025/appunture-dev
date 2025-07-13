# Appunture Web Admin

Sistema administrativo web para o Appunture - plataforma de acupuntura e medicina tradicional chinesa.

## 🚀 Tecnologias

- **React 18** - Framework de interface
- **TypeScript** - Tipagem estática
- **Vite** - Bundler e dev server
- **Tailwind CSS** - Framework de estilos
- **React Router Dom** - Roteamento
- **React Query (TanStack Query)** - Gerenciamento de estado e cache
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, etc.)
│   ├── forms/          # Componentes de formulário
│   ├── charts/         # Componentes de gráficos
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── Sidebar.tsx     # Menu lateral
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── auth/           # Páginas de autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── points/         # Gestão de pontos de acupuntura
│   ├── symptoms/       # Gestão de sintomas
│   ├── users/          # Gestão de usuários
│   └── ...
├── layouts/            # Layouts da aplicação
│   ├── AdminLayout.tsx # Layout principal do admin
│   └── AuthLayout.tsx  # Layout das páginas de auth
├── context/            # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── hooks/              # Hooks customizados
│   ├── usePoints.ts    # Hook para pontos
│   └── useSymptoms.ts  # Hook para sintomas
├── services/           # Serviços e APIs
│   └── api.ts          # Cliente HTTP e endpoints
├── types/              # Definições de tipos TypeScript
│   └── index.ts        # Tipos principais
├── utils/              # Utilitários
│   ├── constants.ts    # Constantes da aplicação
│   └── helpers.ts      # Funções auxiliares
├── App.tsx             # Componente raiz
└── main.tsx            # Ponto de entrada
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Verificação de tipos
npm run type-check

# Lint
npm run lint
```

### Scripts Disponíveis

- `dev` - Inicia o servidor de desenvolvimento
- `build` - Gera build de produção
- `preview` - Preview da build de produção
- `lint` - Executa ESLint
- `type-check` - Verificação de tipos TypeScript

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Appunture Admin
```

### Proxy para Backend

O Vite está configurado para fazer proxy das requisições `/api/*` para o backend local na porta 3001.

## 📋 Funcionalidades

### ✅ Implementado

- [x] Estrutura base do projeto
- [x] Sistema de autenticação
- [x] Layout responsivo com sidebar
- [x] Dashboard com métricas
- [x] Gestão de pontos de acupuntura (listagem)
- [x] Gestão de sintomas (listagem)
- [x] Componentes UI base (Button, Input, etc.)
- [x] Roteamento protegido
- [x] Context de autenticação
- [x] Hooks customizados
- [x] Integração com API

### 🚧 Em Desenvolvimento

- [ ] CRUD completo de pontos
- [ ] CRUD completo de sintomas
- [ ] CRUD de usuários
- [ ] Formulários de criação/edição
- [ ] Upload de imagens
- [ ] Gráficos e relatórios
- [ ] Busca avançada e filtros
- [ ] Paginação
- [ ] Testes unitários
- [ ] Testes E2E

## 🎨 Design System

### Cores Principais

- **Primary**: Blue (600, 700)
- **Secondary**: Gray (200, 300)
- **Success**: Green (600, 700)
- **Warning**: Yellow (600, 700)
- **Danger**: Red (600, 700)

### Componentes UI

- **Button**: Variantes primary, secondary, danger, ghost
- **Input**: Com suporte a ícones e validação
- **LoadingSpinner**: Para estados de carregamento

## 📡 API Integration

O frontend se comunica com o backend através de:

- **Base URL**: `/api`
- **Authentication**: JWT Bearer Token
- **Endpoints**:
  - `POST /api/auth/login` - Login
  - `GET /api/auth/profile` - Perfil do usuário
  - `GET /api/points` - Listar pontos
  - `GET /api/symptoms` - Listar sintomas
  - `GET /api/users` - Listar usuários

## 🔐 Autenticação

- JWT tokens armazenados no localStorage
- Context de autenticação global
- Interceptors automáticos no Axios
- Rotas protegidas com ProtectedRoute

## 📱 Responsividade

- Design mobile-first
- Sidebar colapsível em mobile
- Grid responsivo
- Componentes adaptativos

## 🚀 Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

### Deploy Sugerido

- **Vercel**: Deploy automático via GitHub
- **Netlify**: Deploy com preview branches
- **AWS S3 + CloudFront**: Para produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

Desenvolvido com ❤️ pela equipe Appunture
