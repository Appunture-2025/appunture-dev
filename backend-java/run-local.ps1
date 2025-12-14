# 🚀 Script para Rodar Backend Localmente
# Uso: .\run-local.ps1

Write-Host "🚀 Iniciando Backend Appunture em modo LOCAL..." -ForegroundColor Cyan

# Configurar JAVA_HOME se não estiver definido
if (-not $env:JAVA_HOME) {
    # Tentar encontrar JDK instalado
    $jdkPath = "C:\Program Files\Java\jdk-21"
    if (Test-Path $jdkPath) {
        $env:JAVA_HOME = $jdkPath
        Write-Host "✅ JAVA_HOME configurado: $env:JAVA_HOME" -ForegroundColor Green
    } else {
        Write-Host "❌ JDK não encontrado em $jdkPath! Instale Java 17+ e configure JAVA_HOME" -ForegroundColor Red
        exit 1
    }
}

# Verificar se o serviceAccount.json existe
if (-not (Test-Path ".\serviceAccount.json")) {
    # Copiar da raiz do projeto se existir
    if (Test-Path "..\serviceAccount.json") {
        Write-Host "📋 Copiando serviceAccount.json da raiz do projeto..." -ForegroundColor Yellow
        Copy-Item "..\serviceAccount.json" ".\serviceAccount.json"
    } else {
        Write-Host "❌ ERRO: serviceAccount.json não encontrado!" -ForegroundColor Red
        Write-Host "Por favor, coloque o arquivo serviceAccount.json na pasta backend-java/" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ serviceAccount.json encontrado" -ForegroundColor Green

# Configurar variáveis de ambiente
$env:SPRING_PROFILES_ACTIVE = "local"
$env:SERVICE_ACCOUNT_PATH = ".\serviceAccount.json"
$env:GOOGLE_CLOUD_PROJECT = "appunture-tcc"
$env:GOOGLE_CLOUD_LOCATION = "us-central1"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\serviceAccount.json"

Write-Host "`n📦 Configurações:" -ForegroundColor Cyan
Write-Host "  - Profile: local" -ForegroundColor White
Write-Host "  - Port: 8080" -ForegroundColor White
Write-Host "  - Context Path: /api" -ForegroundColor White
Write-Host "  - Firebase Project: appunture-tcc" -ForegroundColor White
Write-Host "  - Service Account: .\serviceAccount.json" -ForegroundColor White
Write-Host "  - Google Credentials: .\serviceAccount.json" -ForegroundColor White
Write-Host "  - Vertex AI: gemini-1.5-flash (us-central1)" -ForegroundColor White

Write-Host "`n🔨 Compilando projeto..." -ForegroundColor Yellow
.\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na compilação!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Compilação concluída!" -ForegroundColor Green
Write-Host "`n🚀 Iniciando servidor..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8080/api" -ForegroundColor Green
Write-Host "   Press Ctrl+C para parar`n" -ForegroundColor Yellow

# Rodar o JAR
$jarFile = Get-ChildItem -Path ".\target" -Filter "backend-*.jar" | Select-Object -First 1
if ($jarFile) {
    java -jar ".\target\$($jarFile.Name)"
} else {
    Write-Host "❌ Arquivo JAR não encontrado em target/" -ForegroundColor Red
    exit 1
}
