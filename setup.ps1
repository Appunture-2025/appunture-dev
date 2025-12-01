# Appunture - Setup Script
# Este script configura o ambiente de desenvolvimento local

Write-Host "🚀 Appunture - Setup de Desenvolvimento Local" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar pré-requisitos
Write-Host "📋 Verificando pré-requisitos..." -ForegroundColor Yellow

$errors = @()

# Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    $errors += "Node.js não encontrado. Instale em https://nodejs.org"
    Write-Host "  ❌ Node.js não encontrado" -ForegroundColor Red
}

# Java
$javaVersion = java --version 2>&1 | Select-Object -First 1
if ($javaVersion) {
    Write-Host "  ✅ Java: $javaVersion" -ForegroundColor Green
} else {
    $errors += "Java não encontrado. Instale o JDK 17+"
    Write-Host "  ❌ Java não encontrado" -ForegroundColor Red
}

# Git
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "  ✅ Git: $gitVersion" -ForegroundColor Green
} else {
    $errors += "Git não encontrado"
    Write-Host "  ❌ Git não encontrado" -ForegroundColor Red
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Erros encontrados:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Por favor, resolva os erros acima e execute novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow

# Backend
Write-Host ""
Write-Host "  🔧 Backend Java..." -ForegroundColor Cyan
Push-Location backend-java
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "    📄 Criado .env a partir do template" -ForegroundColor Green
}
./mvnw -q dependency:go-offline 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Dependências Maven instaladas" -ForegroundColor Green
} else {
    Write-Host "    ⚠️  Erro ao instalar dependências Maven" -ForegroundColor Yellow
}
Pop-Location

# Frontend Mobile
Write-Host ""
Write-Host "  📱 Frontend Mobile..." -ForegroundColor Cyan
Push-Location frontend-mobile/appunture
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "    📄 Criado .env a partir do template" -ForegroundColor Green
}
npm install --silent 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Dependências NPM instaladas" -ForegroundColor Green
} else {
    Write-Host "    ⚠️  Erro ao instalar dependências NPM" -ForegroundColor Yellow
}
Pop-Location

# Integration Tests
Write-Host ""
Write-Host "  🧪 Integration Tests..." -ForegroundColor Cyan
Push-Location integration-tests
npm install --silent 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Dependências NPM instaladas" -ForegroundColor Green
} else {
    Write-Host "    ⚠️  Erro ao instalar dependências NPM" -ForegroundColor Yellow
}
Pop-Location

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure os arquivos .env em cada pasta com suas credenciais Firebase" -ForegroundColor White
Write-Host "   2. Execute o backend: cd backend-java && ./mvnw spring-boot:run" -ForegroundColor White
Write-Host "   3. Execute o mobile: cd frontend-mobile/appunture && npx expo start" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulte DEPLOY_GUIDE.md para instruções completas de deploy" -ForegroundColor Cyan
Write-Host ""
