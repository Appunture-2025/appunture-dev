# 📊 Análise Completa dos Dados de Pontos de Acupuntura

**Data:** 1 de Dezembro de 2025  
**Versão:** 2.0  
**Arquivo Principal:** `data/processed/2025-11-28/points_seed.json`

---

## 📈 Resumo Executivo

| Métrica                                    | Valor                                  |
| ------------------------------------------ | -------------------------------------- |
| **Total de Pontos**                        | 361                                    |
| **Meridianos**                             | 14 (12 Principais + 2 Extraordinários) |
| **Sintomas Cadastrados**                   | 622                                    |
| **Associações Sintoma→Ponto**              | 1.460                                  |
| **Categorias de Sintomas**                 | 13                                     |
| **Pontos com Tipo Especial**               | 199 (55%)                              |
| **Pontos com Descrição Curta (<30 chars)** | 109 (30%)                              |

---

## 🔍 Distribuição por Meridiano

| Meridiano                           | Sigla | Pontos | Faixa        | %     |
| ----------------------------------- | ----- | ------ | ------------ | ----- |
| Bexiga (Bladder)                    | BL    | 67     | BL-1 a BL-67 | 18.6% |
| Estômago (Stomach)                  | ST    | 45     | ST-1 a ST-45 | 12.5% |
| Vesícula Biliar (Gallbladder)       | GB    | 44     | GB-1 a GB-44 | 12.2% |
| Vaso Governador (Governing Vessel)  | GV    | 28     | GV-1 a GV-28 | 7.8%  |
| Rim (Kidney)                        | KI    | 27     | KI-1 a KI-27 | 7.5%  |
| Vaso Concepção (Conception Vessel)  | CV    | 24     | CV-1 a CV-24 | 6.6%  |
| Triplo Aquecedor (Triple Energizer) | TE    | 23     | TE-1 a TE-23 | 6.4%  |
| Baço (Spleen)                       | SP    | 21     | SP-1 a SP-21 | 5.8%  |
| Intestino Grosso (Large Intestine)  | LI    | 20     | LI-1 a LI-20 | 5.5%  |
| Intestino Delgado (Small Intestine) | SI    | 19     | SI-1 a SI-19 | 5.3%  |
| Fígado (Liver)                      | LR    | 14     | LR-1 a LR-14 | 3.9%  |
| Pulmão (Lung)                       | LU    | 11     | LU-1 a LU-11 | 3.0%  |
| Coração (Heart)                     | HT\*  | 9      | HE-1 a HE-9  | 2.5%  |
| Pericárdio (Pericardium)            | PC    | 9      | PC-1 a PC-9  | 2.5%  |

> ⚠️ \*Pontos do Coração usam código "HE" em vez do padrão internacional "HT"

---

## 📊 Categorias de Sintomas

| Categoria                | Qtd | Exemplos                                  |
| ------------------------ | --- | ----------------------------------------- |
| Outros                   | 225 | Adenite, Apendicite, Apresentação pélvica |
| Dor e Musculoesquelético | 196 | Dor lombar, Cervicalgia, Artralgia        |
| Neurológico e Mental     | 39  | Ansiedade, Insônia, Depressão             |
| Digestivo                | 29  | Náusea, Constipação, Diarreia             |
| Urogenital               | 24  | Dismenorreia, Incontinência               |
| Respiratório             | 21  | Tosse, Asma, Dispneia                     |
| Cardiovascular           | 19  | Palpitações, Hipertensão                  |
| Febre e Sistema Imune    | 14  | Febre, Gripe, Resfriado                   |
| Nariz e Garganta         | 14  | Rinite, Faringite                         |
| Olhos e Visão            | 14  | Conjuntivite, Visão turva                 |
| Pele e Dermatológico     | 14  | Urticária, Eczema                         |
| Geral e Energético       | 8   | Fadiga, Astenia                           |
| Ouvidos e Audição        | 5   | Zumbido, Surdez                           |

---

## ✅ Campos Preenchidos (100%)

Todos os 361 pontos possuem:

| Campo               | Exemplo (LU-1)                                |
| ------------------- | --------------------------------------------- |
| `code`              | "LU-1"                                        |
| `name`              | "Middle Assembly"                             |
| `chineseName`       | "中府"                                        |
| `meridian`          | "LU"                                          |
| `meridianName`      | "Lung"                                        |
| `meridianGroup`     | "Twelve Primary Meridians"                    |
| `description`       | "Ponto Mu do Pulmão que dispersa Calor..."    |
| `location`          | "No 1.º espaço intercostal, 6 cun lateral..." |
| `indication`        | "Tosse seca ou produtiva, dispneia..."        |
| `contraindications` | "Cuidado com pneumotórax..."                  |
| `functions`         | "Regula e faz descer o Qi de Pulmão..."       |

### Traduções Disponíveis

| Idioma           | Exemplo        |
| ---------------- | -------------- |
| Pinyin           | "zhōng fǔ"     |
| Transliteração   | "Zhongfu"      |
| Coreano + Hangul | "jung bu 중부" |
| Vietnamita       | "Trung phủ"    |

---

## ❌ Campos Vazios (Necessitam Enriquecimento)

| Campo             | Status     | Impacto                       |
| ----------------- | ---------- | ----------------------------- |
| `coordinates.x/y` | 0/361 (0%) | BodyMap inoperante            |
| `bodyMapCoords[]` | 0/361 (0%) | Múltiplas vistas impossíveis  |
| `symptomIds[]`    | 0/361 (0%) | Busca bidirecional impossível |
| `imageUrls[]`     | 0/361 (0%) | Sem imagens de referência     |
| `imageRefs[]`     | 0/361 (0%) | Sem assets locais             |

---

## ⚠️ Problemas de Qualidade de Conteúdo

### 1. Descrições Curtas (109 pontos - 30%)

Distribuição por meridiano:

| Meridiano | Pontos Afetados | Exemplo                        |
| --------- | --------------- | ------------------------------ |
| BL        | 38              | "Xialian (Crista Inferior)."   |
| GV        | 23              | "Yinjiao, união das gengivas." |
| ST        | 23              | "Sibai (Quatro Brancos)."      |
| CV        | 14              | "Qihai, mar de Qi."            |
| LI        | 8               | "Jugu (Osso Grande)."          |
| SP        | 2               | -                              |
| GB        | 1               | -                              |

**Ação:** Expandir descrições com informações sobre classificação, uso clínico e características energéticas.

### 2. Inconsistência de Código (Heart/Coração)

```
Esperado: HT-1 a HT-9 (padrão WHO)
Atual: HE-1 a HE-9
IDs gerados: he_1 a he_9
```

**Impacto:** Confusão com materiais de referência internacionais.

### 3. Associações Sintoma→Ponto Unidirecionais

- `symptoms_seed.json` possui `pointIds[]` preenchido ✅
- `points_seed.json` possui `symptomIds[]` vazio ❌

**Ação:** Script de sincronização para popular `symptomIds` nos pontos.

---

## 📋 Pontos com Classificação Especial Identificada

199 pontos (55%) têm tipo especial mencionado na descrição:

### Exemplos de Tipos Encontrados

| Ponto | Tipo Identificado                        |
| ----- | ---------------------------------------- |
| LU-1  | Ponto Mu (Front-Mu)                      |
| LU-3  | Janela do Céu                            |
| LU-5  | He-Mar (Água)                            |
| LU-6  | Xi-Cleft                                 |
| LU-7  | Luo + Comando + Abertura Ren Mai         |
| LU-8  | Jing-Rio (Metal)                         |
| LU-9  | Yuan + Shu-Transporte                    |
| LU-10 | Ying-Fonte (Fogo)                        |
| LU-11 | Jing-Poço (Madeira)                      |
| LI-4  | Yuan-Fonte + Comando Face/Boca           |
| BL-1  | Ponto de Encontro (ST, SI, YM, Yin Qiao) |

**Ação:** Extrair tipos para campo estruturado `pointTypes[]`.

---

## 🔴 Dados Técnicos Ausentes (Crítico para Prática)

### Informações que NÃO existem no schema atual:

| Informação                       | Uso Clínico             |
| -------------------------------- | ----------------------- |
| **Profundidade de inserção**     | Segurança do paciente   |
| **Ângulo de inserção**           | Técnica correta         |
| **Direção da agulha**            | Efeito terapêutico      |
| **Sensação De-Qi**               | Validação da técnica    |
| **Moxabustão aplicável**         | Técnica complementar    |
| **Número de cones/minutos moxa** | Dosagem                 |
| **Combinações clássicas**        | Protocolos tradicionais |
| **Anatomia moderna**             | Público ocidental       |

### Schema Proposto para Enriquecimento

```typescript
interface PointEnhanced {
  // --- EXISTENTES ---
  code: string;
  name: string;
  chineseName: string;
  meridian: string;
  description: string;
  location: string;
  indication: string;
  contraindications: string;
  functions: string;
  translation: { pinyin; transliteration; korean; vietnamese };

  // --- NOVOS: Técnica ---
  needling: {
    depth: string; // "0.5-1.0 cun"
    angle: "perpendicular" | "oblique" | "transverse";
    direction?: string; // "superior", "medial"
    sensation: string; // "Distensão local irradiando..."
    caution?: string; // "Evitar artéria radial"
  };

  moxibustion: {
    applicable: boolean;
    cones?: string; // "3-5 cones"
    duration?: string; // "10-15 min"
    method?: string; // "indireta", "direta leve"
  };

  // --- NOVOS: Classificação ---
  pointTypes: string[]; // ["Mu-Front", "Crossing"]
  element?: string; // "Metal", "Fire"
  energyType?: string; // "Tonification", "Sedation"
  importance: 1 | 2 | 3 | 4 | 5; // Frequência de uso

  // --- NOVOS: Combinações ---
  classicCombinations: Array<{
    points: string[]; // ["LU-7", "KI-6"]
    purpose: string; // "Abertura Ren Mai"
    source?: string; // "Ling Shu"
  }>;

  // --- NOVOS: Anatomia ---
  anatomy: {
    muscles: string[];
    nerves: string[];
    vessels: string[];
    region: string; // "Tórax anterior"
  };

  // --- CORRIGIR: Coordenadas ---
  coordinates: {
    x: number; // 0-100 (%)
    y: number; // 0-100 (%)
    view: "anterior" | "posterior" | "lateral" | "head";
  };

  // --- CORRIGIR: Sintomas ---
  symptomIds: string[]; // ["tosse", "dispneia"]
}
```

---

## 🎯 Plano de Enriquecimento

### Fase 1: Correções Críticas (1-2 dias)

| #   | Tarefa                            | Impacto                     |
| --- | --------------------------------- | --------------------------- |
| 1   | Popular `symptomIds[]` via script | Habilita busca bidirecional |
| 2   | Corrigir códigos HE→HT            | Consistência internacional  |
| 3   | Expandir 109 descrições curtas    | Qualidade de conteúdo       |

### Fase 2: Funcionalidades Core (3-5 dias)

| #   | Tarefa                                     | Impacto                      |
| --- | ------------------------------------------ | ---------------------------- |
| 4   | Adicionar `coordinates` para BodyMap       | Feature principal habilitada |
| 5   | Extrair `pointTypes[]` das descrições      | Filtros avançados            |
| 6   | Adicionar `needling` (profundidade/ângulo) | Essencial para prática       |

### Fase 3: Diferenciação (1 semana+)

| #   | Tarefa                          | Impacto                 |
| --- | ------------------------------- | ----------------------- |
| 7   | Adicionar `moxibustion`         | Técnica complementar    |
| 8   | Adicionar `classicCombinations` | Protocolos tradicionais |
| 9   | Adicionar `anatomy`             | Público ocidental       |
| 10  | Adicionar tradução japonesa     | Novo mercado            |

---

## 📁 Estrutura de Arquivos

### Dados Fonte (tables/)

| Arquivo                                             | Conteúdo                |
| --------------------------------------------------- | ----------------------- |
| `01_twelve-primary-meridians.csv`                   | Metadados 12 meridianos |
| `02_eight-extraordinary-meridians.csv`              | 8 vasos extraordinários |
| `03_lung-meridian.csv` a `16_conception-vessel.csv` | Pontos detalhados       |
| `acupuncture_points.csv`                            | Lista de meridianos     |

### Dados Processados (data/processed/2025-11-28/)

| Arquivo              | Registros    |
| -------------------- | ------------ |
| `points_seed.json`   | 361 pontos   |
| `symptoms_seed.json` | 622 sintomas |
| `points_review.csv`  | Backup CSV   |

### Types Frontend (frontend-mobile/appunture/types/)

| Arquivo       | Interface                               |
| ------------- | --------------------------------------- |
| `api.ts`      | `Point`, `Symptom`, `PointWithSymptoms` |
| `database.ts` | `LocalPoint`, `SymptomPoint`            |

---

## 📚 Fontes de Referência para Enriquecimento

| Fonte                                           | Uso Recomendado          |
| ----------------------------------------------- | ------------------------ |
| WHO Standard Acupuncture Point Locations (2008) | Localização oficial      |
| A Manual of Acupuncture (Deadman et al.)        | Indicações + Combinações |
| Acupuncture Atlas (Lian/Chen)                   | Anatomia + Ilustrações   |
| Chinese Acupuncture and Moxibustion             | Técnicas tradicionais    |
| Atlas of Acupuncture (Focks/Marz)               | Profundidade/Ângulo      |

---

## ✨ Próximos Passos Imediatos

1. **Criar script `sync_symptom_ids.py`** - Popular symptomIds nos pontos
2. **Criar script `fix_heart_codes.py`** - Migrar HE→HT
3. **Criar script `expand_descriptions.py`** - Enriquecer descrições curtas
4. **Definir schema de coordenadas** - Para funcionalidade BodyMap

---

_Documento gerado para análise de dados do projeto Appunture_
