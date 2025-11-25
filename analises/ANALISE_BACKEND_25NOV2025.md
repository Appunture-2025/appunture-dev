# ☕ Análise Completa do Backend Java — 25/11/2025

## 1. Sumário Executivo

- **Stack:** Spring Boot 3.2.5 + Java 17 + Firebase Admin SDK + Firestore + Firebase Storage + Cloud Run
- **Status geral:** Código funcional (≈70% do roadmap), migração concluída e documentada; pendências concentram-se em qualidade (testes, seed oficial, observabilidade) e automação.
- **Principais gaps:** Cobertura ≥60%, seed versionado e automatizado, pipeline CI/CD, auditoria/logs de imagens, dashboards/alertas, documentação OpenAPI enriquecida.
- **Risco para release em 2 semanas:** Médio — funcionalidades prontas, mas sem testes e seed não há garantia para homologação.

## 2. Capacidades já entregues

| Eixo                     | Situação                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Autenticação & Segurança | Firebase Auth + RBAC completo, rate limiting com Bucket4j, filtros e CORS por ambiente                  |
| Domínio                  | CRUD de pontos/sintomas/usuários/admin, favoritos, estatísticas, coordenadas, uploads                   |
| Infra                    | Dockerfile otimizado, scripts de deploy (Cloud Run), configs por ambiente (`application*.yml`)          |
| Observabilidade          | Métricas Micrometer + Prometheus expostas, logging estruturado JSON                                     |
| Documentação             | READMEs atualizados, `STATUS_FINAL_MIGRACAO.md`, `TODO_PLANO_FINALIZACAO.md`, `DIAGNOSTICO_COMPLETO.md` |

## 3. Pendências para finalização

### 🔥 Alta

1. **Cobertura de testes ≥60%**
   - Criar suites `@SpringBootTest` para `FirestorePoint/Symptom/AuthController`.
   - Unit tests para `FirestoreUserService`, `FirebaseStorageService` (mock StorageClient) e `LoggingEmailService`.
   - Configurar JaCoCo local + pipeline e publicar badge no `README.md`.
2. **Seed de dados oficiais**
   - Versionar arquivos `.json/.csv` em `src/main/resources/seed/`.
   - Implementar `CommandLineRunner` ou endpoint protegido em `FirestoreAdminController` (30 pontos, 20 sintomas, admin padrão, relacionamentos).
   - Documentar execução no README + checklist de deploy.
3. **Pipeline GitHub Actions**
   - Workflow com build/test, cache Maven e publicação de relatórios.
   - Job opcional de deploy para Cloud Run com substituição de variáveis.
   - Upload de artefatos (logs/JaCoCo) para troubleshooting.

### ⚙️ Média

- **Dashboards & alertas:** provisionar Grafana/alternative, criar alertas (latência, 5xx, estouro rate-limit) e documentar em `DECISOES_ARQUITETURA.md`.
- **Workflow de imagens auditável:** logar quem adiciona/remove imagens em `/points/{id}/images`, gerar thumbnails (Cloud Function ou serviço) e persistir referência `imageUrls`.
- **Auditoria ampla:** campos `createdBy/updatedBy`, logs estruturados por recurso sensível.
- **Documentação OpenAPI rica:** exemplos nos DTOs, export Postman/Insomnia atualizado.

### 💤 Baixa

- **Cache & performance:** estratégia Redis/batch Firestore, índices compostos.
- **Features futuras:** notificações administrativas, analytics avançado, backup/DR playbook.

## 4. Saúde técnica

| Tema            | Situação atual                                       | Risco | Próximo passo                                                |
| --------------- | ---------------------------------------------------- | ----- | ------------------------------------------------------------ |
| Testes          | 45 testes existentes (15% cobertura estimada)        | Alto  | Priorizar controllers + serviços críticos                    |
| Configuração    | `application.yml` saneado; metadata extra adicionada | Baixo | Garantir sincronismo entre perfis (dev/prod) ao incluir seed |
| Segurança       | RBAC e filtros ok; falta auditoria                   | Médio | Adicionar logs/claims aos endpoints administrativos          |
| Observabilidade | Métricas expostas, mas sem painel                    | Médio | Provisionar dashboard e alertas antes de homologar           |
| Deploy          | Scripts manuais (Cloud Build/Run)                    | Médio | GitHub Actions + documentação de rollback                    |

## 5. Check-list para considerar o backend "finalizado"

- [ ] Cobertura ≥60% com JaCoCo publicado.
- [ ] Seed oficial importado automaticamente + documentação.
- [ ] CI/CD em funcionamento (build/test + deploy opcional).
- [ ] Dashboards e alertas mínimos operacionais.
- [ ] Auditoria/logs para uploads de imagem e operações admin.
- [ ] OpenAPI com exemplos + coleção Postman exportada.
- [ ] Guia de QA/backups incluído em `README.md`.

## 6. Sequenciamento sugerido (2 semanas)

1. **Semana 1**
   - Escrever testes faltantes, configurar JaCoCo, rodar localmente.
   - Implementar seed + arquivos versionados.
   - Criar workflow GitHub Actions com publicação de artefatos.
2. **Semana 2**
   - Implantar dashboards e alertas (Grafana + Prometheus).
   - Completar auditoria do workflow de imagens.
   - Polir documentação (OpenAPI/Postman, README, guia de seed) e executar smoke de endpoints críticos.
