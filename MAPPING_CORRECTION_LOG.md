# 📝 Correção de Mapeamento de Imagens - Resumo

## ✅ Corrigido

### Mapeamento Atlas Layers

```
ST-1 (e todos os pontos ST) agora tem:
  imageRefs: ["atlas:ST", "atlas:ST2"]

LR-1 (e todos os 14 pontos LR) agora mapeiam para:
  imageRefs: ["atlas:LV"]
```

### Resultados

- **361/361 pontos** enriquecidos ✅ (era 347/361)
- **0 pontos ignorados** ✅ (era 14 com meridian LR)
- Arquivo atualizado: `data/processed/2025-11-28/points_seed.ndjson`

### Mapeamento Completo Implementado

| Meridian | Atlas Layers            | Descrição               |
| :------- | :---------------------- | :---------------------- |
| LU       | atlas:LU                | Lung                    |
| LI       | atlas:LI                | Large Intestine         |
| **ST**   | **atlas:ST, atlas:ST2** | **Stomach (2 camadas)** |
| SP       | atlas:SP                | Spleen                  |
| HT       | atlas:HT                | Heart                   |
| SI       | atlas:SI                | Small Intestine         |
| BL       | atlas:BL                | Bladder                 |
| KI       | atlas:KI                | Kidney                  |
| PC       | atlas:PC                | Pericardium             |
| TE       | atlas:TW                | Triple Energizer → TW   |
| GB       | atlas:GB                | Gallbladder             |
| LV       | atlas:LV                | Liver                   |
| GV       | atlas:GV                | Governing Vessel        |
| CV       | atlas:CV                | Conception Vessel       |
| **LR**   | **atlas:LV**            | **Extra → Liver**       |
| P        | atlas:P                 | Extra layer             |

## Exemplos de Pontos

### ST-1 com duas imagens

```json
{
  "code": "ST-1",
  "meridian": "ST",
  "imageRefs": ["atlas:ST", "atlas:ST2"],
  ...
}
```

### LR-1 mapeado para Liver

```json
{
  "code": "LR-1",
  "meridian": "LR",
  "imageRefs": ["atlas:LV"],
  ...
}
```

## Próximos Passos

✅ Database seed data está **100% pronto**
⚠️ Aguardando: Firebase Storage bucket creation
🔜 Então: Re-seed SQLite

---

**Data**: 12 de dezembro de 2025  
**Arquivo**: `data/processed/2025-11-28/points_seed.ndjson`  
**Status**: ✨ Pronto para re-seeding
