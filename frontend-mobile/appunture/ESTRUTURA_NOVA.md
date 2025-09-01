# Nova Estrutura de Pastas - Appunture

## Estrutura Implementada

```
appunture/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx              # Roteamento para screens/home
│   ├── _layout.tsx                # Layout raiz (inalterado)
│   ├── login.tsx                  # Roteamento para screens/login
│   ├── register.tsx               # Roteamento para screens/register
│   ├── welcome.tsx                # Roteamento para screens/welcome
│   ├── body-map.tsx               # Roteamento para screens/body-map
│   └── point-details.tsx          # Roteamento para screens/point-details
├── screens/
│   ├── login/
│   │   ├── index.tsx              # Componente da tela de login
│   │   └── styles.ts              # Estilos da tela de login
│   ├── register/
│   │   ├── index.tsx              # Componente da tela de registro
│   │   └── styles.ts              # Estilos da tela de registro
│   ├── welcome/
│   │   ├── index.tsx              # Componente da tela de boas-vindas
│   │   └── styles.ts              # Estilos da tela de boas-vindas
│   ├── home/
│   │   ├── index.tsx              # Componente da tela inicial
│   │   └── styles.ts              # Estilos da tela inicial
│   ├── body-map/
│   │   ├── index.tsx              # Componente do mapa corporal
│   │   └── styles.ts              # Estilos do mapa corporal
│   └── point-details/
│       ├── index.tsx              # Componente de detalhes do ponto
│       └── styles.ts              # Estilos de detalhes do ponto
├── stores/                        # (inalterado)
├── services/                      # (inalterado)
├── components/                    # (inalterado)
├── types/                         # (inalterado)
└── utils/                         # (inalterado)
```

## Mudanças Realizadas

### 1. Pasta (tabs)
- Agora contém apenas arquivos de roteamento
- Cada arquivo importa o componente correspondente da pasta `screens`
- Responsabilidade única: gerenciar navegação

### 2. Pasta screens
- **Nova estrutura**: cada tela tem sua própria pasta
- **Separação clara**: `index.tsx` (lógica) + `styles.ts` (estilos)
- **Organização**: facilita manutenção e localização de código

### 3. Arquivos de Roteamento
- **app/login.tsx**: `import LoginScreen from "../screens/login"`
- **app/register.tsx**: `import RegisterScreen from "../screens/register"`
- **app/welcome.tsx**: `import WelcomeScreen from "../screens/welcome"`
- **app/body-map.tsx**: `import BodyMapScreen from "../screens/body-map"`
- **app/point-details.tsx**: `import PointDetailsScreen from "../screens/point-details"`
- **app/(tabs)/index.tsx**: `import HomeScreen from "../../screens/home"`

### 4. Estrutura de Cada Tela

#### Exemplo: screens/login/
```typescript
// index.tsx - Componente principal
import React, { useState } from "react";
import { /* imports */ } from "react-native";
import { styles } from "./styles";

export default function LoginScreen() {
  // Lógica do componente
}

// styles.ts - Estilos separados
import { StyleSheet } from "react-native";
import { COLORS } from "../../utils/constants";

export const styles = StyleSheet.create({
  // Estilos específicos da tela
});
```

## Benefícios da Nova Estrutura

1. **Organização Clara**: Cada tela tem sua pasta dedicada
2. **Separação de Responsabilidades**: Lógica e estilos separados
3. **Facilidade de Manutenção**: Localização rápida de arquivos
4. **Reutilização**: Componentes podem ser facilmente reutilizados
5. **Escalabilidade**: Fácil adição de novas telas seguindo o padrão
6. **Navegação Limpa**: Pasta (tabs) focada apenas em roteamento

## Próximos Passos

1. **Criar telas adicionais** seguindo o mesmo padrão
2. **Implementar componentes compartilhados** na pasta components
3. **Adicionar testes** para cada tela
4. **Documentar** padrões de desenvolvimento

## Padrão de Nomenclatura

- **Pastas**: kebab-case (login, register, body-map)
- **Arquivos**: index.tsx (componente) + styles.ts (estilos)
- **Componentes**: PascalCase (LoginScreen, RegisterScreen)
- **Estilos**: export const styles
