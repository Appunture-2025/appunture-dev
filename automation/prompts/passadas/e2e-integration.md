# Prompt – Integração & Testes End-to-End

## Contexto

- Conforme `analises/ANALISE_INTEGRACAO_27NOV2025.md`, a integração backend ↔ mobile está em 50%.
- Falhas principais: autenticação desalinhada, upload de mídia não testado, ausência de pipelines automáticos de teste.

## Objetivos específicos

1. Formalizar contratos de autenticação (Firebase token + `/auth/sync`/`/auth/profile`) e garantir que o mobile não invoque endpoints inexistentes.
2. Criar suíte Postman/Newman ou REST Client cobrindo fluxos chave (`/auth/profile`, `/points`, `/symptoms`, `/storage/upload`).
3. Implementar testes end-to-end mobile (Detox ou Expo E2E) cobrindo login → sync → busca → upload.
4. Construir checklist de ambientes (URLs, API keys, CORS) e validar automaticamente.

## Passos sugeridos

1. Atualizar documentação de contratos (`docs/integration.md` ou nova seção em `analises/PLANO_IMPLEMENTACAO_FINAL_27NOV2025.md`).
2. Criar coleção Postman (pasta `integration-tests/postman/`) com ambiente DEV/HOMOLOG, exportar `.json`.
3. Adicionar script npm `npm run test:e2e:api` que executa Newman:

   ```bash
   newman run integration-tests/postman/appunture.postman_collection.json \
     -e integration-tests/postman/dev.postman_environment.json
   ```

4. Configurar Detox (ou Expo E2E) na pasta mobile:
   - Atualizar `package.json` com scripts `test:e2e:android` e `test:e2e:ios`.
   - Criar testes básicos (`e2e/login.e2e.ts`, etc.) validando fluxo Firebase.
5. Integrar esses testes ao pipeline (ver prompt `devops-observability.md`).
6. Adicionar badge/relatório ao README informando status dos testes E2E.

## Critérios de aceitação

- Coleção Postman rodando em CI, com resultados anexados.
- Pelo menos 1 teste Detox funcional em `android.emu.release` ou ambiente similar.
- Documentação atualizada indicando como rodar E2E localmente.
- Todos os contratos de autenticação revisados e refletidos em `services/api.ts`.

## Rollback / Segurança

- Ao testar uploads, usar bucket de desenvolvimento (ou mocks) para evitar custos.
- Detox pode exigir emulador; se indisponível, permitir skip com flag `E2E_SKIP=true`.
- Manter coleções Postman versionadas; se quebrar, reverter para última versão funcional.
