# Prompt – Integrar Postman/Newman no CI

## Contexto

- Collection Postman existe em `integration-tests/postman/appunture.postman_collection.json`
- Environment variables em `integration-tests/postman/appunture.postman_environment.json`
- Backend roda em Cloud Run
- CI atual não executa testes de integração E2E

## Objetivo

Adicionar job de integração no GitHub Actions que execute a collection Postman usando Newman.

## Implementação

### 1. Atualizar backend-ci.yml

Adicionar job após deploy:

```yaml
integration-tests:
  name: Integration Tests (Newman)
  runs-on: ubuntu-latest
  needs: deploy-staging # ou o nome do job de deploy
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "20"

    - name: Install Newman
      run: |
        npm install -g newman
        npm install -g newman-reporter-htmlextra

    - name: Wait for deployment to stabilize
      run: sleep 30

    - name: Get Firebase ID Token
      id: firebase-token
      env:
        FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
        TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      run: |
        # Obter token de teste usando Firebase REST API
        RESPONSE=$(curl -s -X POST \
          "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}" \
          -H "Content-Type: application/json" \
          -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\",\"returnSecureToken\":true}")

        TOKEN=$(echo $RESPONSE | jq -r '.idToken')
        echo "::add-mask::$TOKEN"
        echo "token=$TOKEN" >> $GITHUB_OUTPUT

    - name: Run Newman Collection
      env:
        API_BASE_URL: ${{ secrets.API_BASE_URL_STAGING }}
        FIREBASE_TOKEN: ${{ steps.firebase-token.outputs.token }}
      run: |
        newman run integration-tests/postman/appunture.postman_collection.json \
          --environment integration-tests/postman/appunture.postman_environment.json \
          --env-var "baseUrl=${API_BASE_URL}" \
          --env-var "authToken=${FIREBASE_TOKEN}" \
          --reporters cli,htmlextra \
          --reporter-htmlextra-export ./newman-report.html \
          --delay-request 100 \
          --timeout-request 10000

    - name: Upload Newman Report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: newman-report
        path: newman-report.html
        retention-days: 7

    - name: Comment PR with results
      if: github.event_name == 'pull_request' && always()
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          let status = '${{ job.status }}' === 'success' ? '✅' : '❌';
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## Integration Tests ${status}\n\nNewman collection run completed with status: **${{ job.status }}**\n\nSee artifacts for detailed report.`
          });
```

### 2. Criar/Atualizar Environment File

Verificar se `integration-tests/postman/appunture.postman_environment.json` tem:

```json
{
  "id": "appunture-env",
  "name": "Appunture Environment",
  "values": [
    {
      "key": "baseUrl",
      "value": "",
      "type": "default",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "type": "secret",
      "enabled": true
    },
    {
      "key": "testPointId",
      "value": "LU1",
      "type": "default",
      "enabled": true
    },
    {
      "key": "testUserId",
      "value": "",
      "type": "default",
      "enabled": true
    }
  ]
}
```

### 3. Atualizar Collection com Auth

Na collection, adicionar Pre-request script global:

```javascript
// Pre-request Script (Collection level)
const authToken = pm.environment.get("authToken");

if (authToken) {
  pm.request.headers.add({
    key: "Authorization",
    value: `Bearer ${authToken}`,
  });
}
```

### 4. Criar Usuário de Teste

Criar usuário de teste no Firebase Console:

- Email: `ci-test@appunture.com`
- Password: (gerar senha segura)
- Adicionar aos secrets do GitHub:
  - `TEST_USER_EMAIL`
  - `TEST_USER_PASSWORD`
  - `FIREBASE_API_KEY`

### 5. Adicionar Scripts de Teste na Collection

Para cada request, adicionar tests:

```javascript
// GET /points - Test Script
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
  const data = pm.response.json();
  pm.expect(data).to.be.an("array");
});

pm.test("Points have required fields", function () {
  const data = pm.response.json();
  if (data.length > 0) {
    pm.expect(data[0]).to.have.property("id");
    pm.expect(data[0]).to.have.property("name");
    pm.expect(data[0]).to.have.property("meridian");
  }
});

pm.test("Response time is less than 500ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

```javascript
// GET /points/:id - Test Script
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Point has correct structure", function () {
  const data = pm.response.json();
  pm.expect(data).to.have.property("id");
  pm.expect(data).to.have.property("name");
  pm.expect(data).to.have.property("chineseName");
  pm.expect(data).to.have.property("meridian");
  pm.expect(data).to.have.property("location");
  pm.expect(data).to.have.property("functions");
  pm.expect(data).to.have.property("indications");
});
```

```javascript
// POST /favorites - Test Script
pm.test("Status code is 200 or 201", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Store for later cleanup
const data = pm.response.json();
pm.environment.set("lastFavoriteId", data.id);
```

### 6. Workflow Separado (Opcional)

Criar workflow dedicado `integration-tests.yml`:

```yaml
name: Integration Tests

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to test"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production
  schedule:
    - cron: "0 6 * * *" # Daily at 6 AM UTC

jobs:
  newman:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Newman
        run: npm install -g newman newman-reporter-htmlextra

      - name: Get Firebase Token
        id: auth
        run: |
          RESPONSE=$(curl -s -X POST \
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${{ secrets.FIREBASE_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"email":"${{ secrets.TEST_USER_EMAIL }}","password":"${{ secrets.TEST_USER_PASSWORD }}","returnSecureToken":true}')
          TOKEN=$(echo $RESPONSE | jq -r '.idToken')
          echo "::add-mask::$TOKEN"
          echo "token=$TOKEN" >> $GITHUB_OUTPUT

      - name: Run Tests
        run: |
          newman run integration-tests/postman/appunture.postman_collection.json \
            -e integration-tests/postman/appunture.postman_environment.json \
            --env-var "baseUrl=${{ secrets.API_BASE_URL }}" \
            --env-var "authToken=${{ steps.auth.outputs.token }}" \
            -r cli,htmlextra \
            --reporter-htmlextra-export newman-report.html

      - name: Upload Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: newman-report-${{ github.run_id }}
          path: newman-report.html
```

## Secrets Necessários

Adicionar no GitHub:

| Secret                    | Descrição                         |
| ------------------------- | --------------------------------- |
| `FIREBASE_API_KEY`        | API Key do projeto Firebase (Web) |
| `TEST_USER_EMAIL`         | Email do usuário de teste         |
| `TEST_USER_PASSWORD`      | Senha do usuário de teste         |
| `API_BASE_URL_STAGING`    | URL do backend em staging         |
| `API_BASE_URL_PRODUCTION` | URL do backend em produção        |

## Critérios de Aceitação

- [ ] Newman roda automaticamente após deploy
- [ ] Token Firebase obtido automaticamente
- [ ] Report HTML gerado como artifact
- [ ] Falha no CI se testes falharem
- [ ] Comentário automático em PRs
- [ ] Testes cobrem endpoints principais:
  - [ ] GET /points
  - [ ] GET /points/:id
  - [ ] GET /meridians
  - [ ] POST /favorites
  - [ ] DELETE /favorites/:id
  - [ ] GET /user/profile
  - [ ] PUT /user/profile

## Verificação Local

```bash
# Instalar Newman
npm install -g newman

# Rodar localmente
newman run integration-tests/postman/appunture.postman_collection.json \
  -e integration-tests/postman/appunture.postman_environment.json \
  --env-var "baseUrl=http://localhost:8080" \
  --env-var "authToken=YOUR_TOKEN"
```

## Rollback

Se falhar, remover o job `integration-tests` do workflow.
