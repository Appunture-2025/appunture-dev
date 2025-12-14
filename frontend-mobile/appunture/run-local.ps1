# 🚀 Script para Rodar Frontend Localmente
# Uso: .\run-local.ps1

Write-Host "🚀 Iniciando Frontend Appunture em modo LOCAL..." -ForegroundColor Cyan

# Verificar se está na pasta correta
if (-not (Test-Path ".\package.json")) {
    Write-Host "❌ ERRO: Execute este script na pasta frontend-mobile/appunture/" -ForegroundColor Red
    exit 1
}

# Verificar se .env está configurado para local
$envContent = Get-Content ".env" -Raw
if ($envContent -like "*localhost:8080*") {
    Write-Host "✅ .env configurado para desenvolvimento local" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env não está configurado para localhost" -ForegroundColor Yellow
    Write-Host "   Configurando para desenvolvimento local..." -ForegroundColor White
    
    if (Test-Path ".env.production.backup") {
        Write-Host "   Backup encontrado, mantendo .env atual" -ForegroundColor White
    }
    
    # Adicionar comentário sobre configuração
    Write-Host "   ℹ️  Verifique .env.README.md para mais informações" -ForegroundColor Cyan
}

# Verificar se node_modules existe
if (-not (Test-Path ".\node_modules")) {
    Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📦 Configurações:" -ForegroundColor Cyan
Write-Host "  - API Base URL: " -NoNewline -ForegroundColor White
if ($envContent -like "*localhost*") {
    Write-Host "http://localhost:8080/api" -ForegroundColor Green
} else {
    Write-Host "PRODUÇÃO (Cloud Run)" -ForegroundColor Yellow
}
Write-Host "  - Storage Bucket: appunture-tcc.firebasestorage.app" -ForegroundColor White

Write-Host "`n🚀 Iniciando Expo com cache limpo..." -ForegroundColor Cyan
Write-Host "   Acesse: http://localhost:8081" -ForegroundColor Green
Write-Host "   Press Ctrl+C para parar`n" -ForegroundColor Yellow

# Iniciar Expo com cache limpo
npx expo start --clear
