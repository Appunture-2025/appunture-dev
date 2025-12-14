# Backup das Configurações do Cloud Run

# Data: 12/12/2025

# Uso: Restaurar configurações com gcloud run services replace cloud-run-config-backup.yaml

## Variáveis de Ambiente Ativas:

```yaml
env:
  - name: GOOGLE_APPLICATION_CREDENTIALS
    valueFrom:
      secretKeyRef:
        key: latest
        name: firebase-service-account
  - name: SPRING_PROFILES_ACTIVE
    value: prod
  - name: FIREBASE_PROJECT_ID
    value: appunture-tcc
  - name: FIREBASE_STORAGE_BUCKET
    value: appunture-tcc.firebasestorage.app
  - name: GOOGLE_CLOUD_PROJECT
    value: appunture-tcc
```

## Service Account:

```
756244484248-compute@developer.gserviceaccount.com
```

## Recursos:

```yaml
resources:
  limits:
    cpu: "1"
    memory: 1Gi
```

## URLs:

- https://appunture-backend-756244484248.us-central1.run.app
- https://appunture-backend-tmjfb7ysza-uc.a.run.app

## Imagem Atual:

```
us-central1-docker.pkg.dev/appunture-tcc/appunture-backend/backend:e41a31f99e2a45f19cb41edaeca7de18a02bc5ec
```

## Para Restaurar:

```bash
gcloud run services replace cloud-run-config-backup.yaml
```
