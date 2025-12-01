# 📊 Análise Completa dos Dados de Pontos de Acupuntura

**Data:** 28 de Novembro de 2025  
**Versão:** 1.0  
**Arquivo Analisado:** `data/processed/2025-11-28/points_seed.json`

---

## 📈 Resumo Executivo

| Métrica                       | Valor                                  |
| ----------------------------- | -------------------------------------- |
| **Total de Pontos**           | 361                                    |
| **Meridianos**                | 14 (12 Principais + 2 Extraordinários) |
| **Sintomas Associados**       | 622                                    |
| **Associações Ponto-Sintoma** | 1.460                                  |

---

## 🔍 Distribuição por Meridiano

| Meridiano                           | Sigla | Pontos | Faixa        |
| ----------------------------------- | ----- | ------ | ------------ |
| Bexiga (Bladder)                    | BL    | 67     | BL-1 a BL-67 |
| Estômago (Stomach)                  | ST    | 45     | ST-1 a ST-45 |
| Vesícula Biliar (Gallbladder)       | GB    | 44     | GB-1 a GB-44 |
| Vaso Governador (Governing Vessel)  | GV    | 28     | GV-1 a GV-28 |
| Rim (Kidney)                        | KI    | 27     | KI-1 a KI-27 |
| Vaso Concepção (Conception Vessel)  | CV    | 24     | CV-1 a CV-24 |
| Triplo Aquecedor (Triple Energizer) | TE    | 23     | TE-1 a TE-23 |
| Baço (Spleen)                       | SP    | 21     | SP-1 a SP-21 |
| Intestino Grosso (Large Intestine)  | LI    | 20     | LI-1 a LI-20 |
| Intestino Delgado (Small Intestine) | SI    | 19     | SI-1 a SI-19 |
| Fígado (Liver)                      | LR    | 14     | LR-1 a LR-14 |
| Pulmão (Lung)                       | LU    | 11     | LU-1 a LU-11 |
| Coração (Heart)                     | HT    | 9      | HE-1 a HE-9  |
| Pericárdio (Pericardium)            | PC    | 9      | PC-1 a PC-9  |

> ⚠️ **Nota:** Pontos do Coração usam código "HE" (Heart) em vez de "HT"

---

## ✅ Campos Preenchidos (100%)

Todos os 361 pontos possuem os seguintes campos preenchidos:

| Campo               | Descrição             | Exemplo (LU-1)                                |
| ------------------- | --------------------- | --------------------------------------------- |
| `code`              | Código do ponto       | "LU-1"                                        |
| `name`              | Nome em inglês        | "Middle Assembly"                             |
| `chineseName`       | Nome em chinês        | "中府"                                        |
| `meridian`          | Sigla do meridiano    | "LU"                                          |
| `meridianName`      | Nome do meridiano     | "Lung"                                        |
| `meridianGroup`     | Grupo do meridiano    | "Twelve Primary Meridians"                    |
| `description`       | Descrição clínica     | "Ponto Mu do Pulmão que dispersa Calor..."    |
| `location`          | Localização anatômica | "No 1.º espaço intercostal, 6 cun lateral..." |
| `indication`        | Indicações clínicas   | "Tosse seca ou produtiva, dispneia, asma..."  |
| `contraindications` | Contraindicações      | "Cuidado com pneumotórax; evitar punções..."  |
| `functions`         | Funções energéticas   | "Regula e faz descer o Qi de Pulmão..."       |

### Traduções Disponíveis

| Campo                         | Descrição           | Exemplo        |
| ----------------------------- | ------------------- | -------------- |
| `translation.pinyin`          | Romanização chinesa | "zhōng fǔ"     |
| `translation.transliteration` | Transliteração      | "Zhongfu"      |
| `translation.korean`          | Coreano + Hangul    | "jung bu 중부" |
| `translation.vietnamese`      | Vietnamita          | "Trung phủ"    |

---

## ❌ Campos Vazios (0% - Necessitam Enriquecimento)

| Campo             | Status    | Pontos Afetados |
| ----------------- | --------- | --------------- |
| `coordinates.x/y` | **VAZIO** | 361/361 (100%)  |
| `bodyMapCoords`   | **VAZIO** | 361/361 (100%)  |
| `symptomIds`      | **VAZIO** | 361/361 (100%)  |
| `imageUrls`       | **VAZIO** | 361/361 (100%)  |
| `imageRefs`       | **VAZIO** | 361/361 (100%)  |

---

## 🔴 Problemas Identificados

### 1. **Inconsistência no Código do Coração**

```
Meridiano: Heart (HT)
Códigos usados: HE-1 a HE-9 (deveria ser HT-1 a HT-9)
IDs gerados: he_1 a he_9
```

**Impacto:** Pode causar confusão e problemas de busca.

### 2. **Falta de Coordenadas para Body Map**

- Funcionalidade `BodyMap.tsx` requer coordenadas X/Y
- Nenhum ponto possui coordenadas definidas
- **Impacto:** Funcionalidade de mapa corporal inoperante

### 3. **Sem Associação Direta com Sintomas**

- Campo `symptomIds[]` está vazio em todos os pontos
- Associações existem apenas no `symptoms_seed.json` (direção inversa)
- **Impacto:** Busca de sintomas por ponto requer JOIN manual

### 4. **Dados Técnicos de Agulhamento Ausentes**

Informações críticas para prática clínica que **NÃO existem** no schema atual:

| Informação               | Status                               |
| ------------------------ | ------------------------------------ |
| Profundidade de inserção | ❌ Ausente                           |
| Ângulo de inserção       | ❌ Ausente                           |
| Técnica de agulhamento   | ❌ Ausente                           |
| Indicação de moxabustão  | ❌ Ausente (só em contraindications) |
| Sensação de De-Qi        | ❌ Ausente                           |
| Combinações clássicas    | ❌ Ausente                           |

### 5. **Categoria Única**

- Todos os pontos têm `category: "General"`
- Não há categorização por:
  - Tipo de ponto (Mu, Shu, Yuan, Luo, Xi, He-Mar, etc.)
  - Nível de importância clínica
  - Uso comum vs. especializado

---

## 📋 Dados Faltantes - Detalhamento

### Campos Técnicos Recomendados para Adição

```typescript
interface PointEnhanced {
  // Existentes
  code: string;
  name: string;
  // ...

  // NOVOS - Técnica de Agulhamento
  needling: {
    depth: string; // "0.5-1.0 cun"
    angle: string; // "perpendicular", "oblíquo 45°", "transversal"
    direction?: string; // "superior", "inferior", "lateral"
    sensation: string; // "Distensão local, irradiação para o ombro"
    caution?: string; // Avisos específicos
  };

  // NOVOS - Moxabustão
  moxibustion: {
    applicable: boolean; // true/false
    cones?: number; // 3-5 cones
    minutes?: number; // 10-15 min
    contraindicated?: boolean;
  };

  // NOVOS - Classificação
  pointType: string[]; // ["Mu-Front", "Crossing Point"]
  element?: string; // "Wood", "Fire", "Earth", "Metal", "Water"
  energyType?: string; // "Tonification", "Sedation"
  importance: number; // 1-5 (frequência de uso clínico)

  // NOVOS - Combinações
  classicCombinations: Array<{
    points: string[]; // ["LU-7", "KI-6"]
    purpose: string; // "Abertura do Ren Mai"
    source?: string; // "Ling Shu"
  }>;

  // NOVOS - Anatomia Moderna
  anatomy: {
    muscles: string[]; // ["Peitoral maior", "Deltóide anterior"]
    nerves: string[]; // ["N. peitoral lateral"]
    vessels: string[]; // ["A. toracoacromial"]
  };

  // NOVOS - Coordenadas (para Body Map)
  coordinates: {
    x: number; // 0-100 (porcentagem)
    y: number; // 0-100 (porcentagem)
    view: string; // "anterior", "posterior", "lateral"
  };
}
```

---

## 📊 Análise de Qualidade do Conteúdo

### Descrições

- ✅ Qualidade: **BOA** - Descrevem função energética
- ⚠️ Variação: Algumas muito curtas (< 20 caracteres)

### Localização

- ✅ Qualidade: **BOA** - Usa medidas em cun
- ✅ Referências anatômicas presentes

### Indicações

- ✅ Qualidade: **EXCELENTE** - Múltiplas indicações por ponto
- ✅ Formato consistente com vírgulas

### Contraindicações

- ✅ Qualidade: **BOA** - Avisos de segurança relevantes
- ⚠️ Algumas mencionam moxabustão sem campo dedicado

### Funções

- ✅ Qualidade: **EXCELENTE** - Linguagem tradicional MTC
- ✅ Múltiplas ações por ponto

---

## 🎯 Recomendações de Enriquecimento

### Prioridade ALTA (Impacto Funcional)

| #   | Ação                    | Justificativa              |
| --- | ----------------------- | -------------------------- |
| 1   | Adicionar `coordinates` | Habilitar BodyMap          |
| 2   | Popular `symptomIds`    | Bidirecionalidade de busca |
| 3   | Corrigir códigos HE→HT  | Consistência internacional |
| 4   | Adicionar `needling`    | Essencial para prática     |

### Prioridade MÉDIA (Valor Clínico)

| #   | Ação                            | Justificativa              |
| --- | ------------------------------- | -------------------------- |
| 5   | Adicionar `moxibustion`         | Técnica complementar comum |
| 6   | Adicionar `pointType`           | Categorização tradicional  |
| 7   | Adicionar `classicCombinations` | Protocolos clássicos       |
| 8   | Adicionar `importance`          | Priorização de estudo      |

### Prioridade BAIXA (Diferenciação)

| #   | Ação                        | Justificativa          |
| --- | --------------------------- | ---------------------- |
| 9   | Adicionar `anatomy`         | Público ocidental      |
| 10  | Adicionar tradução japonesa | Mercado adicional      |
| 11  | Adicionar `element`         | Teoria dos 5 elementos |

---

## 📁 Estrutura de Dados de Referência

### Arquivos CSV Originais (tables/)

| Arquivo                                             | Conteúdo                    |
| --------------------------------------------------- | --------------------------- |
| `01_twelve-primary-meridians.csv`                   | Metadados dos 12 meridianos |
| `02_eight-extraordinary-meridians.csv`              | 8 vasos extraordinários     |
| `03_lung-meridian.csv` a `16_conception-vessel.csv` | Pontos por meridiano        |
| `acupuncture_points.csv`                            | Lista de meridianos         |

### Dados Processados (data/processed/)

| Arquivo              | Registros        | Status     |
| -------------------- | ---------------- | ---------- |
| `points_seed.json`   | 361              | Principal  |
| `symptoms_seed.json` | 622              | Completo   |
| `points_review.csv`  | 362 (com header) | Backup CSV |

---

## 🔄 Próximos Passos Sugeridos

1. **Criar script de migração HE→HT**

   - Atualizar códigos do Coração
   - Manter backward compatibility

2. **Implementar coordenadas do BodyMap**

   - Usar sistema relativo (0-100%)
   - Considerar múltiplas vistas (anterior/posterior)

3. **Popular symptomIds bidirecionalmente**

   - Extrair de `symptoms_seed.json`
   - Criar script de sincronização

4. **Enriquecer com dados de agulhamento**

   - Fontes: WHO Standard, Deadman, etc.
   - Adicionar profundidade, ângulo, sensação

5. **Adicionar classificação de pontos**
   - Pontos especiais (Yuan, Luo, Xi, etc.)
   - Pontos de comando
   - Pontos de abertura

---

## 📚 Fontes de Referência para Enriquecimento

| Fonte                                    | Uso                    |
| ---------------------------------------- | ---------------------- |
| WHO Standard Acupuncture Point Locations | Localização oficial    |
| A Manual of Acupuncture (Deadman)        | Indicações/Combinações |
| Acupuncture Atlas (Lian/Chen)            | Anatomia               |
| Chinese Acupuncture and Moxibustion      | Técnicas tradicionais  |

---

_Documento gerado automaticamente para análise de dados do projeto Appunture_
