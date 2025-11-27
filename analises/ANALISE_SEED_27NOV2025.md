# Análise Seed/Data Lake – 27/11/2025

## 1. Inventário Atual

- **Fontes de dados**: diretório `tables/` com 16 CSVs por meridiano (`01_twelve-primary-meridians.csv` ... `16_conception-vessel.csv`) + índice `acupuncture_points.csv`.
- **Pipelines**:
  - `tools/normalize_points.py` converte os CSVs brutos em `tools/output/points_review.csv` / `points_seed.(json|ndjson)` seguindo `seed_config.json`.
  - Scripts `update_*.py` (LU, LI, ST, etc.) enriquecem descrições e campos clínicos diretamente em `points_review.csv`.
  - `include_missing_meridians.py` injeta pontos dos vasos Governador/Concepção quando ausentes; `export_points_review.py` gera Firestore NDJSON; `validate_points_review.py` garante campos obrigatórios.
- **Artefatos**: `tools/output/points_seed.json` e `.ndjson` já existem, indicando execução prévia do normalizer, porém sem evidência de import no Firestore.

## 2. Cobertura e Lacunas (≈60% completo)

| Área                            | Status | Observações                                                                                                                                              |
| ------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pontos de acupuntura            | 70%    | Dados consolidados em `points_review.csv`; porém ainda há campos vazios (descrição/localização/indic.) para meridianos sem script de atualização manual. |
| Sintomas & categorias           | 20%    | Não há CSVs ou scripts para `symptoms`/`categories`; backend possui endpoints mas seed não foi preparado.                                                |
| Relacionamento ponto-sintoma    | 10%    | Coluna `symptomIds` existe, mas permanece `[]` salvo quando preenchida manualmente.                                                                      |
| Coordenadas/mapa corporal       | 40%    | `bodyMapCoords` e `coordinates.*` ainda vêm vazios para maioria dos pontos.                                                                              |
| Favoritos/estatísticas iniciais | 100%   | Defaults configurados em `seed_config.json`.                                                                                                             |
| Automação import/export         | 50%    | Scripts Python prontos, porém sem pipeline (CI ou script shell) chamando `normalize → validate → gcloud import`.                                         |

## 3. Principais Pendências

1. **Completar enriquecimento dos textos clínicos**
   - Executar/aprimorar os scripts `update_*.py` para todos os meridianos e revisar `points_review.csv` em `tools/content-work/` antes de gerar novo seed.
2. **Preencher relacionamentos e coordenadas**
   - Converter dados de `tables/??` e `appunture/assets/body-map` em `bodyMapCoords` + `symptomIds` (usar fontes `st_points_data.json`, etc.).
3. **Criar seed de sintomas/categorias**
   - Fonte pode ser `tables/acupuncture_points.csv` + planilhas clínicas. Necessário arquivo `symptoms_seed.json` e `categories_seed.json` + endpoint `/admin/data/seed` atualizado.
4. **Automatizar fluxo**
   - Script único (Make/PowerShell) para rodar `normalize_points.py`, todos os `update_*.py`, `validate_points_review.py`, `export_points_review.py` e copiar resultado para `backend-java` (ou bucket) antes do deploy.
5. **Importação Firestore**
   - Definir comando oficial (`gcloud firestore import` ou `firebase firestore:delete|import`). Documentar em `backend-java/README.md`.
6. **Versionamento de dados**
   - `tools/content-work/` e `tools/output/` possuem artefatos duplicados; mover para `data/processed/` com histórico ou gerar releases (evita divergência).

## 4. Riscos

- **Dados inconsistentes** entre CSVs e o seed usado pelo backend (principalmente se scripts manuais não forem reaplicados).
- **Seed parcial** quebra sincronização mobile (pontos sem descrição/coordinates tornam telas vazias).
- **Sem sintomas seed**: endpoints `/symptoms/*` do backend retornarão vazio, bloqueando seções da UI.

## 5. Plano de Regularização

| Passo | Descrição                                                                                                                      | Responsável      | Prazo   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------- |
| 1     | Rodar `normalize_points.py` limpo (commit atual) e congelar `tools/output/points_review.csv` em branch `data/seed`.            | Dados            | 0,5 dia |
| 2     | Executar `update_*.py` + preencher campos faltantes manualmente onde não há script, validando com `validate_points_review.py`. | Conteúdo clínico | 1 dia   |
| 3     | Mapear `symptomIds` reais (mínimo top 50 sintomas) e gerar arquivo `symptoms_seed.json` + script de import.                    | Dados + Produto  | 1,5 dia |
| 4     | Criar comando `python tools/export_points_review.py && gcloud firestore import ...` documentado em `backend-java/README.md`.   | Backend          | 0,5 dia |
| 5     | Integrar seed ao endpoint `/admin/data/seed` para disparo automático após deploy.                                              | Backend          | 1 dia   |

## 6. Percentual Restante

- Considerando pontos + sintomas + automação, o seed inicial está **60% concluído**. Restam **40%** focados em enriquecer descrições/relacionamentos, produzir seed de sintomas e institucionalizar o pipeline de importação.
