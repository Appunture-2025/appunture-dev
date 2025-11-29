# ADR-002: Expo vs React Native CLI

## Status

Accepted

## Context

Para o desenvolvimento do aplicativo móvel Appunture, precisamos escolher entre usar o Expo (framework gerenciado sobre React Native) ou o React Native CLI puro.

### Requisitos do Projeto

1. **Desenvolvimento rápido** - TCC com prazo definido
2. **Cross-platform** - Android e iOS
3. **Funcionalidades nativas** - Câmera, storage, notificações
4. **Modo offline** - SQLite local
5. **Atualizações OTA** - Atualizar sem resubmissão às lojas
6. **Fácil testing** - Expo Go para testes rápidos

## Decision

Utilizaremos **Expo SDK 53+** com Expo Router como framework de desenvolvimento mobile.

### Justificativas

1. **Desenvolvimento Acelerado**
   - Zero configuração de ambiente nativo
   - Hot reload instantâneo
   - Expo Go para testes sem builds

2. **Expo SDK 53+**
   - React Native 0.79+ (New Architecture)
   - Suporte completo a módulos nativos via EAS
   - SQLite nativo incluído

3. **Expo Router**
   - File-based routing (similar a Next.js)
   - Deep linking automático
   - Type-safe navigation

4. **EAS Build**
   - Builds na nuvem (sem Xcode/Android Studio local)
   - CI/CD integrado
   - Submissão às lojas automatizada

5. **Expo Updates**
   - OTA updates sem resubmissão
   - Rollback automático
   - Deploy instantâneo

## Consequences

### Positivas

- ✅ **Setup zero** - `npm install` e pronto
- ✅ **Desenvolvimento 3-5x mais rápido** que RN CLI
- ✅ **Expo Go** para testes instantâneos
- ✅ **Builds na nuvem** - sem ambiente nativo local
- ✅ **OTA updates** - correções sem passar pelas lojas
- ✅ **Expo Router** - navegação moderna e type-safe
- ✅ **SQLite incluído** - `expo-sqlite` funciona out-of-box
- ✅ **Firebase SDK** - totalmente compatível
- ✅ **Push notifications** - `expo-notifications`

### Negativas

- ❌ **Tamanho do app** maior (~10-20MB extra)
  - Mitigação: Tree shaking e Hermes engine
- ❌ **Algumas libs nativas incompatíveis**
  - Mitigação: Config plugins ou EAS builds customizados
- ❌ **Menos controle** sobre código nativo
  - Mitigação: Expo Dev Client para casos avançados
- ❌ **Dependência do Expo** para updates e builds

### Módulos Nativos Utilizados

| Módulo | Uso | Status Expo |
|--------|-----|-------------|
| expo-sqlite | Banco local | ✅ Nativo |
| expo-notifications | Push notifications | ✅ Nativo |
| expo-secure-store | Token storage | ✅ Nativo |
| expo-image | Carregamento de imagens | ✅ Nativo |
| expo-file-system | Acesso a arquivos | ✅ Nativo |
| @react-native-firebase | Firebase SDK | ✅ Via config plugin |

## Alternatives Considered

### React Native CLI

**Prós:**
- Controle total sobre código nativo
- Menor tamanho de app
- Qualquer biblioteca nativa

**Contras:**
- Setup complexo (Xcode, Android Studio, etc.)
- Builds locais demorados
- Manutenção de código nativo

**Rejeitado por:** Complexidade de setup e manutenção para escopo TCC

### Flutter

**Prós:**
- Performance excelente
- UI consistente cross-platform
- Hot reload

**Contras:**
- Linguagem Dart (curva de aprendizado)
- Menor ecossistema que React Native
- Menos integração com Firebase

**Rejeitado por:** Stack diferente da equipe e menor ecossistema

### Progressive Web App (PWA)

**Prós:**
- Zero instalação
- Desenvolvimento web familiar
- Atualizações instantâneas

**Contras:**
- Acesso limitado a recursos nativos
- Performance inferior
- Sem presença nas app stores

**Rejeitado por:** Requisitos de modo offline robusto e recursos nativos

## Implementação

### Estrutura de Pastas (Expo Router)

```
app/
├── (tabs)/           # Tab navigator
│   ├── _layout.tsx   # Layout das tabs
│   ├── index.tsx     # Home
│   ├── search.tsx    # Busca
│   ├── favorites.tsx # Favoritos
│   └── profile.tsx   # Perfil
├── point/[id].tsx    # Detalhe do ponto (dinâmico)
├── login.tsx         # Login
├── register.tsx      # Cadastro
└── _layout.tsx       # Root layout
```

### Configuração Firebase

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel'],
  };
};
```

## Referências

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [Expo SDK 53 Release Notes](https://expo.dev/changelog)
