# Prompt – Seed & Data Pipeline

## Contexto

- Diagnóstico em `analises/ANALISE_SEED_27NOV2025.md` e plano integrado evidenciam 60% de conclusão.
- Diretórios relevantes: `tables/`, `tools/*.py`, `tools/output/`, `backend-java/src/main/resources/seed/` (quando criado).

## Objetivos específicos

1. Normalizar novamente todos os CSVs (`tables/*.csv`) gerando `tools/output/points_review.csv` consistente.
2. Aplicar scripts de enriquecimento (`update_*.py`, `include_missing_meridians.py`, etc.) e preencher campos faltantes (descrições, coordinates, symptomIds).
3. Criar seed de sintomas/categorias (`symptoms_seed.json`, `categories_seed.json`) e relacionamentos ponto ↔ sintoma.
4. Automatizar export (`export_points_review.py`) para NDJSON e documentar/importar via endpoint `/admin/data/seed` ou comando `gcloud firestore import`.
5. Versão/organizar outputs em pasta `data/processed/<data>/` para rastreabilidade.

## Passos sugeridos

1. Limpar diretório de saída (`tools/output/`) mantendo apenas artefatos atuais em subpasta `archive/<data>`.
2. Executar pipeline:

   ```bash
   cd tools
   python normalize_points.py
   python include_missing_meridians.py
   # ... demais update_*.py
   python validate_points_review.py
   python export_points_review.py
   ```

3. Analisar `points_review.csv` resultante, preencher campos manualmente quando necessário e repetir validação.
4. Criar scripts/planilhas para derivar sintomas/categorias; gerar `symptoms_seed.json` e `symptoms_seed.ndjson` com estrutura compatível ao backend.
5. Copiar arquivos finais para `data/processed/<data>/` e referenciar em `backend-java` (por ex. `src/main/resources/seed/points.ndjson`).
6. Atualizar `backend-java/README.md` com instruções: como executar seed localmente (`curl -X POST /api/admin/data/seed`) e como importar via GCP.
7. Rodar smoke test `curl http://localhost:8080/api/points?limit=5` após seed.

## Critérios de aceitação

- `validate_points_review.py` e scripts correlatos executam sem erros.
- NDJSON gerado e versionado (commitado) + instruções claras de import/export.
- Endpoint `/api/admin/data/seed` popula Firestore (ou emulador) com dados consistentes.
- Documentação descreve pipeline completo e localização dos arquivos.

## Rollback / Segurança

- Trabalhar em branch dedicada `data/seed/<data>` e revisar com cuidado antes do merge.
- Guardar backup dos CSVs originais (`tables/raw/`).
- Evitar sobrescrever dados em produção sem confirmação manual.
