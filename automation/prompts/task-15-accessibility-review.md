# Task 15: Accessibility (a11y) Review

## Objetivo

Garantir que o aplicativo seja acessível para todos os usuários, incluindo aqueles com deficiências visuais, motoras ou cognitivas.

## Escopo

### Frontend Mobile (React Native)

#### 1. Screen Reader Support

- [ ] Verificar `accessibilityLabel` em todos os touchables
- [ ] Adicionar `accessibilityHint` onde necessário
- [ ] Testar com VoiceOver (iOS) / TalkBack (Android)
- [ ] Verificar ordem de foco lógica

```tsx
// ❌ Ruim
<TouchableOpacity onPress={handleFavorite}>
  <HeartIcon />
</TouchableOpacity>

// ✅ Bom
<TouchableOpacity
  onPress={handleFavorite}
  accessibilityLabel={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
  accessibilityRole="button"
  accessibilityState={{ selected: isFavorite }}
>
  <HeartIcon />
</TouchableOpacity>
```

#### 2. Componentes Interativos

- [ ] Todos os buttons com accessibilityRole="button"
- [ ] Links com accessibilityRole="link"
- [ ] Imagens decorativas com accessibilityElementsHidden
- [ ] Inputs com accessibilityLabel

#### 3. Navegação

- [ ] Headers anunciados corretamente
- [ ] Navegação por tabs acessível
- [ ] Modal/sheets focam corretamente
- [ ] Back navigation funciona com gestos

#### 4. Cores & Contraste

- [ ] Ratio de contraste mínimo 4.5:1 (texto normal)
- [ ] Ratio de contraste mínimo 3:1 (texto grande)
- [ ] Não depender apenas de cor para transmitir informação
- [ ] Suporte a dark mode accessibility

```
Ferramentas:
- Contrast Checker: https://webaim.org/resources/contrastchecker/
- React Native Accessibility Inspector
```

### Frontend Admin (React Web)

#### 5. Semantic HTML

- [ ] Uso correto de headings (h1-h6)
- [ ] Landmarks (nav, main, aside, footer)
- [ ] Lists para grupos de itens
- [ ] Tables para dados tabulares

#### 6. ARIA Attributes

- [ ] aria-label para icons sem texto
- [ ] aria-describedby para instruções
- [ ] aria-live para updates dinâmicos
- [ ] aria-expanded para accordions/dropdowns

#### 7. Keyboard Navigation

- [ ] Tab order lógico
- [ ] Focus visible em todos os elementos
- [ ] Esc fecha modals
- [ ] Enter/Space ativam buttons

#### 8. Forms

- [ ] Labels associados a inputs
- [ ] Error messages vinculadas
- [ ] Required fields indicados
- [ ] Autocomplete attributes

### Checklist WCAG 2.1

#### Nível A (Obrigatório)

- [ ] 1.1.1 Non-text Content - Alt text para imagens
- [ ] 1.3.1 Info and Relationships - Estrutura semântica
- [ ] 2.1.1 Keyboard - Tudo acessível via teclado
- [ ] 2.4.1 Bypass Blocks - Skip links
- [ ] 4.1.1 Parsing - HTML válido
- [ ] 4.1.2 Name, Role, Value - ARIA correto

#### Nível AA (Recomendado)

- [ ] 1.4.3 Contrast (Minimum) - 4.5:1
- [ ] 1.4.4 Resize Text - Até 200% sem perda
- [ ] 2.4.6 Headings and Labels - Descritivos
- [ ] 2.4.7 Focus Visible - Indicador visível

## Critérios de Aceitação

1. **Relatório de Acessibilidade**: `ACCESSIBILITY_REPORT.md` com:

   - Checklist WCAG preenchido
   - Issues encontradas
   - Correções implementadas

2. **Correções Implementadas**:

   - Todos os touchables com accessibilityLabel
   - Contraste adequado em todos os textos
   - Navegação por teclado funcional
   - Screen reader testado

3. **Testes**:
   - Testes de acessibilidade no Jest
   - Manual testing com VoiceOver/TalkBack
   - Lighthouse accessibility score > 90

## Comandos Úteis

```bash
# Frontend Admin - Lighthouse
npx lighthouse http://localhost:5173 --only-categories=accessibility

# React Native - Detectar issues
npx react-native-accessibility-engine

# Testar com screen reader (iOS Simulator)
# Settings > Accessibility > VoiceOver > On
```

## Componentes para Criar

### AccessibleButton

```tsx
interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function AccessibleButton({
  onPress,
  label,
  hint,
  disabled,
  children,
}: AccessibleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {children}
    </TouchableOpacity>
  );
}
```

## Output Esperado

```markdown
# ACCESSIBILITY_REPORT.md

## Resumo

- Nível WCAG: AA Compliant
- Lighthouse Score: 95/100
- Issues encontradas: 12
- Issues corrigidas: 12

## Checklist WCAG 2.1

| Critério               | Status | Notas               |
| ---------------------- | ------ | ------------------- |
| 1.1.1 Non-text Content | ✅     | Alt text adicionado |
| 1.4.3 Contrast         | ✅     | Cores ajustadas     |
| 2.1.1 Keyboard         | ✅     | Tab order corrigido |

## Issues Corrigidas

1. PointCard sem accessibilityLabel → Adicionado
2. Contraste insuficiente em buttons → Cores ajustadas
3. Modal não foca ao abrir → Focus trap implementado

## Recomendações Futuras

- Implementar preferência de movimento reduzido
- Adicionar suporte a texto grande
```

## Labels

`accessibility`, `a11y`, `wcag`, `copilot-agent`, `priority:medium`
