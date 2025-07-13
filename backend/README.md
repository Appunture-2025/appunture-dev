# Appunture Backend

Backend API para o aplicativo Appunture - Sistema de consulta e estudo de pontos de acupuntura.

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados principal
- **SQLite** - Banco de dados local/desenvolvimento
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **Multer** - Upload de arquivos

## Instalação

1. Clone o repositório e navegue até a pasta backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Initialize o banco de dados:

```bash
node init-db.js
```

## Executando o Servidor

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário (autenticado)
- `PUT /api/auth/profile` - Atualizar perfil (autenticado)

### Pontos de Acupuntura

- `GET /api/points` - Listar pontos
- `GET /api/points/:id` - Detalhes de um ponto
- `GET /api/points/search?q=termo` - Buscar pontos
- `GET /api/points/meridians` - Listar meridianos
- `GET /api/points/symptom/:symptomId` - Pontos por sintoma

### Sintomas

- `GET /api/symptoms` - Listar sintomas
- `GET /api/symptoms/:id` - Detalhes de um sintoma
- `GET /api/symptoms/search?q=termo` - Buscar sintomas
- `GET /api/symptoms/categories` - Listar categorias

### Administração (requer autenticação admin)

- `GET /api/admin/dashboard/stats` - Estatísticas do dashboard
- `POST /api/admin/points` - Criar ponto
- `PUT /api/admin/points/:id` - Atualizar ponto
- `DELETE /api/admin/points/:id` - Deletar ponto
- `POST /api/admin/symptoms` - Criar sintoma
- `PUT /api/admin/symptoms/:id` - Atualizar sintoma
- `DELETE /api/admin/symptoms/:id` - Deletar sintoma
- `POST /api/admin/upload` - Upload de arquivo
- `GET /api/admin/users` - Listar usuários
- `DELETE /api/admin/users/:id` - Deletar usuário

## Estrutura do Projeto

```
backend/
├── src/
│   ├── app.js              # Arquivo principal
│   ├── config/
│   │   ├── database.js     # Configuração do banco
│   │   └── jwt.js          # Configuração JWT
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pointsController.js
│   │   ├── symptomsController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js         # Middleware de autenticação
│   │   └── upload.js       # Middleware de upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Point.js
│   │   └── Symptom.js
│   └── routes/
│       ├── auth.js
│       ├── points.js
│       ├── symptoms.js
│       └── admin.js
├── uploads/                # Arquivos uploadados
├── database/              # Banco SQLite local
├── init-db.js             # Script de inicialização
├── package.json
└── .env
```

## Configuração do Banco de Dados

### PostgreSQL (Produção)

Configure a variável `DATABASE_URL` no arquivo `.env`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/appunture
```

### SQLite (Desenvolvimento)

O SQLite é usado automaticamente para desenvolvimento local. O arquivo do banco será criado em `database/appunture.db`.

## Usuário Admin Padrão

Após executar `node init-db.js`, um usuário admin será criado:

- **Email**: admin@appunture.com
- **Senha**: admin123

## Health Check

Verifique se o servidor está funcionando:

```bash
curl http://localhost:3000/health
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
