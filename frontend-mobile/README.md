# 🏥 Appunture - Sistema Completo de Acupuntura Digital

Sistema completo para consulta de pontos de acupuntura, composto por:

- **Backend API** (Node.js + Express + PostgreSQL/SQLite)
- **Frontend Mobile** (React Native + Expo)
- **Frontend Web Admin** (HTML/CSS/JavaScript)

## 🚀 Início Rápido

### Opção 1: Script Automático (Recomendado)

**Linux/macOS:**

```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**

```cmd
start-dev.bat
```

### Opção 2: Manual

1. **Backend:**

   ```bash
   cd backend
   npm install
   npm run init-db
   npm run dev
   ```

2. **Frontend Mobile:**
   ```bash
   cd frontend-mobile/appunture
   npm install
   npm start
   ```

## 📱 Componentes do Sistema

### Backend API

- **Framework:** Node.js + Express
- **Banco:** PostgreSQL (produção) / SQLite (desenvolvimento)
- **Autenticação:** JWT
- **Porta:** 3000

**Endpoints principais:**

- `GET /api/points` - Lista pontos de acupuntura
- `GET /api/symptoms` - Lista sintomas
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário

### Frontend Mobile

- **Framework:** React Native + Expo
- **Estado:** Zustand
- **Banco Local:** SQLite
- **Sincronização:** Automática com backend

**Funcionalidades:**

- 🔍 Busca de pontos por sintomas
- 🗺️ Mapa corporal interativo
- 🤖 Assistente IA para recomendações
- ❤️ Sistema de favoritos
- 📱 Funcionamento offline

### Frontend Web Admin

- **Tecnologia:** HTML/CSS/JavaScript vanilla
- **Acesso:** http://localhost:3000/admin
- **Credenciais:** admin@appunture.com / admin123

**Funcionalidades:**

- 👥 Gerenciamento de usuários
- 📍 CRUD de pontos de acupuntura
- 🏥 CRUD de sintomas
- 📊 Dashboard administrativo

## 🛠 Tecnologias Utilizadas

### Backend

- Node.js 18+
- Express.js
- SQLite3 / PostgreSQL
- JWT para autenticação
- Multer para upload de arquivos
- CORS para cross-origin

### Frontend Mobile

- React Native 0.79+
- Expo SDK 53+
- TypeScript
- Zustand (estado global)
- Expo SQLite (banco local)
- React Navigation (navegação)
- Expo Vector Icons

### Frontend Web

- HTML5 / CSS3 / JavaScript ES6+
- Fetch API para comunicação
- CSS Grid / Flexbox
- Responsive Design

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

**users**

- id, name, email, password_hash, role, created_at

**points**

- id, name, chinese_name, meridian, location, indications, functions, contraindications

**symptoms**

- id, name, description, synonyms

**user_favorites**

- user_id, point_id, created_at

## 🔐 Autenticação e Segurança

- **JWT Tokens** para autenticação
- **Bcrypt** para hash de senhas
- **CORS** configurado para desenvolvimento
- **Rate limiting** em produção
- **Input validation** em todos os endpoints

## 📱 Instalação Mobile

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app no celular

### Execução

1. Inicie o backend primeiro
2. Execute `npm start` no diretório do frontend mobile
3. Escaneie o QR code com Expo Go

## 🌐 Deploy

### Backend (Heroku/Railway/VPS)

```bash
# Configurar variáveis de ambiente
DATABASE_URL=postgresql://...
JWT_SECRET=sua_chave_secreta
NODE_ENV=production

# Deploy
npm run build
npm start
```

### Mobile (Expo/App Stores)

```bash
# Build para produção
expo build:android
expo build:ios

# Ou usar EAS Build
eas build --platform all
```

## 🧪 Testes

### Backend

```bash
cd backend
npm test
```

### Frontend Mobile

```bash
cd frontend-mobile/appunture
npm test
```

## 📖 API Documentação

A documentação completa da API está disponível em:

- **Desenvolvimento:** http://localhost:3000/api/docs
- **Postman Collection:** `backend/docs/postman_collection.json`

### Exemplos de Uso

**Buscar pontos:**

```javascript
GET /api/points?search=dor%20de%20cabeça&limit=10
```

**Login:**

```javascript
POST /api/auth/login
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

## 🔧 Configuração

### Variáveis de Ambiente

**Backend (.env):**

```env
PORT=3000
DATABASE_URL=sqlite:./database/appunture.db
JWT_SECRET=sua_chave_super_secreta
NODE_ENV=development
```

**Frontend Mobile (constants.ts):**

```typescript
export const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api"
  : "https://api.appunture.com/api";
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão no mobile:**

- Verifique se backend está rodando na porta 3000
- Confirme que dispositivo está na mesma rede
- Para Android, use IP da máquina em vez de localhost

**Banco não inicializa:**

```bash
cd backend
rm -rf database/appunture.db
npm run init-db
```

**Dependências faltando:**

```bash
# Backend
cd backend && npm install

# Frontend Mobile
cd frontend-mobile/appunture && npm install
```

## 📈 Roadmap

### v1.1

- [ ] Notificações push
- [ ] Compartilhamento de pontos
- [ ] Modo escuro
- [ ] Backup na nuvem

### v1.2

- [ ] Múltiplos idiomas
- [ ] Integração com wearables
- [ ] Realidade aumentada
- [ ] Machine learning para recomendações

### v2.0

- [ ] App desktop (Electron)
- [ ] Sistema de agendamento
- [ ] Marketplace de tratamentos
- [ ] Comunidade de praticantes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvimento:** Equipe Appunture
- **Design:** UI/UX Team
- **Consultoria Médica:** Especialistas em MTC

## 📞 Suporte

- **Email:** suporte@appunture.com
- **Discord:** https://discord.gg/appunture
- **Documentação:** https://docs.appunture.com

---

## 🎯 Sobre o Projeto

Appunture é um sistema completo desenvolvido para democratizar o acesso ao conhecimento em acupuntura, oferecendo:

- **Consulta rápida** de pontos e indicações
- **Assistente inteligente** para recomendações
- **Interface intuitiva** para estudantes e profissionais
- **Dados confiáveis** baseados na medicina tradicional chinesa
- **Acesso offline** para uso em qualquer lugar

### Casos de Uso

1. **Estudantes de Acupuntura**

   - Consulta rápida durante estudos
   - Teste de conhecimentos
   - Acesso offline em aulas

2. **Profissionais**

   - Referência rápida durante consultas
   - Validação de protocolos
   - Educação de pacientes

3. **Pacientes**
   - Compreensão do tratamento
   - Localização de pontos
   - Informações educativas

### Diferenciais

- ✅ **Offline-first:** Funciona sem internet
- ✅ **Cross-platform:** Web, mobile e desktop
- ✅ **Open source:** Código aberto e auditável
- ✅ **Gratuito:** Acesso livre ao conhecimento
- ✅ **Científico:** Baseado em literatura médica
- ✅ **Acessível:** Interface simples e intuitiva

---

**Desenvolvido com ❤️ para a comunidade de acupuntura**
