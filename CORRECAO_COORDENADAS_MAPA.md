# CORREÇÃO DE DADOS - MAPA CORPORAL

## Problema Identificado

**Reportado pelo usuário:** Pontos aparecendo na camada SVG errada.

## Análise

Foram encontrados **74 problemas de coordenadas** no arquivo `seed-data.json`:

| Código no Dados   | Camada SVG Correta | Quantidade de Pontos |
| ----------------- | ------------------ | -------------------- |
| TE → TW           | Triple Warmer      | 23 pontos            |
| ST → ST (era ST2) | Stomach            | 19 pontos            |
| LR → LV           | Liver              | 14 pontos            |
| HE → HT           | Heart              | 9 pontos             |
| PC → P            | Pericardium        | 9 pontos             |

**Total:** 74 coordenadas incorretas

## Solução Aplicada

### 1. Correção dos Dados (seed-data.json)

Criado script `tools/fix-body-map-coords.js` que:

- Mapeia variações de códigos para camadas corretas
- Corrige automaticamente o campo `view` nas coordenadas
- Mantém coordenadas x,y intactas

### 2. Correção do Filtro (screens/body-map/index.tsx)

Atualizado mapeamento de meridianos para incluir variações:

```typescript
HT: ["HT", "HE", "Coração", "Heart", ...]  // Aceita HE como variação
P: ["P", "PC", "Pericárdio", ...]          // Aceita PC como variação
TW: ["TW", "TE", "TA", "Triplo Aquecedor", ...] // Aceita TE/TA
LV: ["LV", "LR", "Fígado", ...]            // Aceita LR como variação
ST2: ["ST", "Estômago", ...]               // ST2 é parte de ST
```

Adicionado filtro inteligente para ST/ST2:

```typescript
if (activeLayer.id === "ST" || activeLayer.id === "ST2") {
  return coord.layerId === "ST" || coord.layerId === "ST2";
}
```

## Resultado

✅ **0 problemas restantes**  
✅ Todos os 361 pontos agora têm coordenadas na camada correta  
✅ Filtro de visualização ajustado para variações de nomenclatura  
✅ Sistema funcionando corretamente

## Arquivos Modificados

1. `frontend-mobile/appunture/assets/data/seed-data.json` - Dados corrigidos
2. `frontend-mobile/appunture/screens/body-map/index.tsx` - Filtros atualizados
3. `tools/fix-body-map-coords.js` - Script de correção (novo)

---

**Status:** ✅ PROBLEMA RESOLVIDO
