# Análise Backend Java – 27/11/2025

## 1. Visão Geral

- Base atual: Spring Boot 3.2.5 (Java 17) + Firebase (Auth, Firestore, Storage) já migrado e operacional conforme `backend-java/STATUS_FINAL_MIGRACAO.md`.
- Arquitetura segue padrão serverless (Cloud Run) com Docker pronto e documentação extensa (`backend-java/README.md`).
- Cobertura de testes apontada como **60%+** (badge README), porém ainda abaixo da meta >80% descrita em `TODO_PLANO_FINALIZACAO.md`.

## 2. Escopo Entregue (≈85%)

| Domínio                                     | Status | Evidências                                                                                 |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Configurações (Firebase, Security, OpenAPI) | 100%   | `src/main/java/com/appunture/backend/config/`                                              |
| APIs Auth/Pontos/Sintomas/Admin/Health      | 100%   | Controllers documentados no README e Postman collection                                    |
| Modelos/Repos/Serviços Firestore            | 100%   | Estrutura completa em `model`, `repository`, `service`                                     |
| Observabilidade básica                      | 80%    | Arquivos Prometheus/Grafana presentes em `observability/` porém não integrados no pipeline |
| Testes automatizados                        | 60%    | Apenas controllers principais possuem testes (`src/test/java/...`)                         |
| Documentação técnica                        | 95%    | README + `DECISOES_ARQUITETURA.md` + `TODO_PLANO_FINALIZACAO.md`                           |

## 3. Lacunas Para Encerrar Backend

1. **Qualidade e Cobertura de Testes** (Alta)
   - Expandir testes de serviço/repositório; configurar Firestore Emulator para integrações; meta >80%.
2. **Seed e Dados de Referência** (Alta)
   - Endpoint `/admin/data/seed` citado, mas dataset inicial ainda não versionado; necessário script e verificação pós-operacional.
3. **Automação DevOps** (Alta)
   - Pipeline CI/CD (GitHub Actions ou Cloud Build) ainda não configurado para build, testes e deploy automático.
4. **Monitoramento & Alertas** (Média)
   - Templates prontos, falta provisionamento real (Prometheus/Grafana ou Cloud Monitoring) e definição de SLIs/SLOs.
5. **Segurança avançada** (Média)
   - Rate limiting, auditoria e logs estruturados previstos no plano; revisar regras Firestore + custom claims.
6. **Otimizações Performáticas** (Baixa)
   - Cache distribuído (Redis) e índices compostos Firestore listados como próximos passos.

## 4. Dependências e Bloqueios

- **Seed compartilhado** com frontend/mobile; depende da definição final do dataset (ver ferramentas em `tools/` e CSVs em `tables/`).
- **Integração CI/CD** aguarda credenciais e projeto GCP definitivo.
- **Testes emulator** precisam de setup local documentado para o time de frontend utilizar ambientes mockados.

## 5. Ações Recomendadas & Estimativa

| Ordem | Ação                                                           | Responsável    | Duração Est. |
| ----- | -------------------------------------------------------------- | -------------- | ------------ |
| 1     | Mapear gaps de teste e aumentar cobertura (services, security) | Backend        | 2 dias       |
| 2     | Finalizar script de seed + validação `/admin/data/seed`        | Backend/Data   | 1 dia        |
| 3     | Configurar pipeline CI/CD (build → test → deploy Cloud Run)    | DevOps         | 1 dia        |
| 4     | Provisionar observabilidade + alertas mínimos                  | Backend/DevOps | 1 dia        |
| 5     | Revisar segurança avançada (rate limit/logs auditoria)         | Backend        | 1 dia        |

## 6. Percentual Restante

- Escopo obrigatório para "backend pronto para produção" estimado em **85% concluído**, restando **15%** concentrados em qualidade/operacionalização.
- Após execução das ações acima (≈5-6 dias úteis), backend fica apto para homologação final e integração contínua com o frontend.
