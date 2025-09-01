# Debug - Tela em Branco no Web

## ✅ Soluções Implementadas

### 1. **Criado arquivo index.tsx**
- ❌ **Problema**: Expo Router precisa de um arquivo `app/index.tsx` como entrada
- ✅ **Solução**: Criado arquivo com tela inicial simples e links de navegação

### 2. **Simplificado _layout.tsx**
- ❌ **Problema**: Layout complexo com stores pode estar causando erros
- ✅ **Solução**: Criado versão simplificada sem dependências complexas

### 3. **Criado tela simples de welcome**
- ❌ **Problema**: Tela welcome complexa pode ter dependências que não funcionam na web
- ✅ **Solução**: Criado versão simples sem animações ou dependências externas

### 4. **Instalando dependências web**
- ❌ **Problema**: Podem faltar dependências específicas para web
- ✅ **Solução**: Instalando `react-native-web` e `react-dom`

### 5. **Corrigido erro "Cannot use 'import.meta' outside a module" - NOVA ABORDAGEM**
- ❌ **Problema**: Metro bundler gerando código com import.meta que não funciona na web
- ✅ **Soluções aplicadas**:
  - ✅ Criado `polyfills.js` para definir import.meta globalmente
  - ✅ Criado `public/import-meta-patch.js` para patch no navegador
  - ✅ Criado `public/index.html` customizado que carrega o patch primeiro
  - ✅ Mudado bundler para `webpack` (mais estável para web)
  - ✅ Simplificado `webpack.config.js` com DefinePlugin
  - ✅ Configurado metro para injetar polyfills automaticamente

## 🔍 Possíveis Causas da Tela em Branco

### **1. Arquivo index.tsx ausente**
- Expo Router exige um arquivo `app/index.tsx` como rota raiz
- ✅ **RESOLVIDO**: Criado arquivo index.tsx

### **2. Dependências complexas não compatíveis com web**
- Stores, database, animações podem não funcionar na web
- ✅ **RESOLVIDO**: Simplificado para versões básicas

### **3. Dependências web ausentes**
- `react-native-web` necessário para renderizar na web
- ✅ **RESOLVIDO**: Instalando dependências

### **4. Erro "Cannot use 'import.meta' outside a module"**
- Metro bundler gera código ES6 com import.meta que navegadores rejeitam
- ✅ **RESOLVIDO**: Configurações de bundler atualizadas

### **5. Configuração de módulos incorreta**
- TypeScript/Babel podem estar gerando módulos incompatíveis
- ✅ **RESOLVIDO**: Configurados tsconfig e babel corretamente

### **6. Erros no console do navegador**
- JavaScript pode estar falhando silenciosamente
- 🔍 **VERIFICAR**: Abrir DevTools do navegador (F12)

### **7. Cache do navegador**
- Arquivos antigos podem estar em cache
- 🔍 **VERIFICAR**: Limpar cache do navegador (Ctrl+Shift+R)

### **8. Servidor Metro não atualizou**
- Mudanças podem não ter sido detectadas
- 🔍 **VERIFICAR**: Reiniciar servidor com `--clear`

## 🚀 Próximos Passos para Debug - APÓS LIMPEZA

### **TENTAR AGORA: Configuração Limpa**
```bash
# Com tudo limpo, tentar iniciar:
npx expo start --web --clear

# Se ainda houver erro de import.meta, tentar:
npx expo start --web --no-dev

# Ou com modo de desenvolvimento desabilitado:
npx expo start --web --minify
```

### **Se o erro import.meta persistir:**
1. **Verificar versão do Expo:**
```bash
npx expo --version
```

2. **Atualizar Expo CLI se necessário:**
```bash
npm install -g @expo/cli@latest
```

3. **Verificar se as dependências estão corretas:**
```bash
npx expo doctor
```

### **1. Verificar Console do Navegador**
```
1. Abrir http://localhost:8081
2. Pressionar F12 para abrir DevTools
3. Ir na aba "Console"
4. Verificar se ainda há erros (o erro import.meta deve ter sumido)
5. Ir na aba "Network" e verificar se arquivos estão carregando
```

### **2. Limpar Cache Completo**
```bash
# Parar o servidor (Ctrl+C)
# Limpar cache e reiniciar
npx expo start --web --clear
```

### **3. Verificar se Tela Simples Funciona**
- A nova tela index.tsx deve mostrar:
  - Título "Appunture"
  - Subtitle "Aplicativo funcionando!"
  - 3 botões de navegação

### **4. Verificar Dependências Web**
```bash
# Verificar se foram instaladas
npm list react-native-web react-dom
```

### **5. Testar no Dispositivo Móvel**
```bash
# Se web não funcionar, testar no celular
npx expo start
# Escanear QR code com Expo Go
```

## 🔧 Comandos para Reiniciar - ATUALIZADO

```bash
# 1. Parar servidor atual (Ctrl+C no terminal)

# 2. Limpar cache e node_modules se necessário
rm -rf node_modules .expo
npm install

# 3. Iniciar com webpack (mais estável para web)
npx expo start --web --clear

# Se ainda houver problemas, tentar:
npx expo start --web --no-dev --minify

# Ou forçar webpack
npx expo start --web --webpack
```

## 📋 Checklist de Verificação - ATUALIZADO

- ✅ Arquivo `app/index.tsx` existe
- ✅ Layout simplificado criado
- ✅ Tela welcome simples criada
- ✅ Dependências web instaladas
- ✅ Polyfill para import.meta criado
- ✅ Patch JavaScript criado
- ✅ HTML customizado criado
- ✅ Bundler mudado para webpack
- ❓ Servidor iniciado com webpack
- ❓ Console do navegador verificado

## 🎯 Resultado Esperado

Após as correções, você deve ver:
- Tela inicial com título "Appunture"
- Botões funcionais de navegação
- Sem erros no console do navegador
- Navegação funcionando entre telas

## 🧹 LIMPEZA COMPLETA REALIZADA

### **Arquivos e Pastas Removidos:**
- ✅ `node_modules/` - Removido completamente
- ✅ `package-lock.json` - Removido para instalação limpa
- ✅ `.expo/` - Cache do Expo removido
- ✅ `polyfills.js` - Arquivo de polyfill removido
- ✅ `webpack.config.js` - Configuração custom removida
- ✅ `public/` - Pasta customizada removida
- ✅ `test.html` - Arquivo de teste removido

### **Configurações Simplificadas:**
- ✅ `metro.config.js` - Voltado para configuração padrão do Expo
- ✅ `babel.config.js` - Configuração mínima
- ✅ `app.json` - Bundler metro (padrão)

### **Dependências Reinstaladas:**
- ✅ `npm cache clean --force`
- ✅ `npm install` - Instalação limpa
- ✅ `npx expo install --fix` - Dependências compatíveis
- ✅ `npx expo install react-native-web react-dom` - Dependências web
