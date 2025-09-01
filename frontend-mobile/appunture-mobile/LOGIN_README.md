# Tela de Login - Appunture Mobile

## Estrutura Criada

A tela de login foi implementada seguindo os requisitos especificados:

### 📁 Estrutura de Pastas

```
appunture-mobile/
├── components/          # Componentes reutilizáveis
│   ├── Input/
│   │   ├── index.tsx   # Componente Input
│   │   └── styles.ts   # Estilos do Input
│   ├── Button/
│   │   ├── index.tsx   # Componente Button
│   │   └── styles.ts   # Estilos do Button
│   ├── Logo/
│   │   ├── index.tsx   # Componente Logo
│   │   └── styles.ts   # Estilos do Logo
│   └── index.ts        # Índice de exportação
│
├── screens/            # Telas da aplicação
│   └── Login/
│       ├── index.tsx   # Tela de Login
│       └── styles.ts   # Estilos da tela
│
└── app/                # Navegação (tabs)
    ├── login.tsx       # Rota do login
    ├── _layout.tsx     # Layout principal
    └── (tabs)/         # Lógica de navegação
        └── _layout.tsx # Layout das tabs
```

### 🧩 Componentes Criados

#### 1. **Input Component**
- Propriedades: label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, autoComplete, error
- Suporte a validação com mensagens de erro
- Estilização responsiva

#### 2. **Button Component**
- Propriedades: title, onPress, loading, disabled, variant
- Variantes: primary, secondary, outline
- Estado de loading com ActivityIndicator

#### 3. **Logo Component**
- Propriedades: size, showText
- Tamanhos: small, medium, large
- Logo simples com gradiente azul

### 🖥️ Tela de Login

#### Funcionalidades:
- **Validação de formulário** em tempo real
- **Campos obrigatórios**: email e senha
- **Validação de email** com regex
- **Checkbox "Lembrar-me"**
- **Link "Esqueceu a senha?"**
- **Link para registro**
- **Loading state** durante login
- **Feedback visual** com alertas

#### Credenciais de teste:
- **Email:** demo@exemplo.com
- **Senha:** 123456

### 🎨 Design

- **Cores principais:** #007AFF (azul iOS) e gradientes
- **Typography:** Hierarquia clara com tamanhos apropriados
- **Spacing:** Espaçamento consistente de 8px, 16px, 24px
- **Layout responsivo** com KeyboardAvoidingView
- **Feedback visual** nos estados de foco e erro

### 🚀 Como usar

1. **Iniciar o projeto:**
   ```bash
   cd frontend-mobile/appunture-mobile
   npm start
   ```

2. **Navegar para o login:**
   - A tela de login é a rota inicial do app
   - URL: `/login`

3. **Testar funcionalidades:**
   - Preencher campos com credenciais de teste
   - Testar validações deixando campos vazios
   - Testar "Lembrar-me" e links auxiliares

### 📱 Navegação

- **Login bem-sucedido:** Redireciona para `/(tabs)` (tela principal)
- **Registro:** Link preparado para futura implementação
- **Esqueceu senha:** Alerta informativo

### 🔧 Próximos passos

- [ ] Implementar tela de registro
- [ ] Implementar tela de recuperação de senha
- [ ] Integração com API real
- [ ] Implementar persistência de login
- [ ] Adicionar biometria/FaceID
- [ ] Testes unitários

### 🎯 Padrões seguidos

- ✅ **Organização:** Cada componente em pasta própria
- ✅ **Separação:** Lógica no index.tsx, estilos no styles.ts
- ✅ **Navegação:** Apenas lógica de roteamento em (tabs)
- ✅ **Componentes:** Reutilizáveis e configuráveis
- ✅ **TypeScript:** Tipagem completa em todos os componentes
