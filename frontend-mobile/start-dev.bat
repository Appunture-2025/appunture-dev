@echo off
setlocal EnableDelayedExpansion

echo 🚀 Iniciando Appunture em modo desenvolvimento...

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js não encontrado. Por favor instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm não encontrado. Por favor instale o npm primeiro.
    pause
    exit /b 1
)

echo 📦 Verificando dependências...

REM Verificar e instalar dependências do backend
if exist backend (
    echo 🔧 Verificando backend...
    cd backend
    if not exist node_modules (
        echo 📥 Instalando dependências do backend...
        call npm install
    )
    cd ..
) else (
    echo ❌ Diretório backend não encontrado!
    pause
    exit /b 1
)

REM Verificar e instalar dependências do frontend mobile
if exist frontend-mobile\appunture (
    echo 🔧 Verificando frontend mobile...
    cd frontend-mobile\appunture
    if not exist node_modules (
        echo 📥 Instalando dependências do frontend mobile...
        call npm install
    )
    cd ..\..
) else (
    echo ❌ Diretório frontend-mobile\appunture não encontrado!
    pause
    exit /b 1
)

echo ✅ Dependências verificadas!

REM Configurar banco de dados se necessário
echo 🗄️ Configurando banco de dados...
cd backend
if not exist database\appunture.db (
    echo 🏗️ Inicializando banco de dados...
    call npm run init-db
)
cd ..

echo ✅ Banco de dados pronto!

REM Criar arquivo batch temporário para iniciar backend
echo @echo off > start_backend.bat
echo cd backend >> start_backend.bat
echo call npm run dev >> start_backend.bat
echo pause >> start_backend.bat

REM Criar arquivo batch temporário para iniciar frontend
echo @echo off > start_frontend.bat
echo cd frontend-mobile\appunture >> start_frontend.bat
echo call npm start >> start_frontend.bat
echo pause >> start_frontend.bat

echo 🚀 Iniciando backend na porta 3000...
start "Backend - Appunture" start_backend.bat

REM Aguardar um pouco para o backend inicializar
timeout /t 3 /nobreak >nul

echo 📱 Iniciando frontend mobile...
start "Frontend Mobile - Appunture" start_frontend.bat

echo 🎉 Appunture iniciado com sucesso!
echo 📋 Informações:
echo   🔧 Backend: http://localhost:3000
echo   📱 Frontend: Expo Dev Server iniciado
echo   📊 Admin: http://localhost:3000/admin
echo.
echo 📖 Comandos disponíveis:
echo   • Backend API: http://localhost:3000/api
echo   • Documentação API: http://localhost:3000/api/docs
echo.
echo 🔗 Para conectar o app mobile:
echo   1. Escaneie o QR code que aparecerá no terminal do frontend
echo   2. Ou baixe o Expo Go e digite o URL manualmente
echo   3. O app já está configurado para conectar no backend local
echo.
echo Pressione qualquer tecla para parar todos os serviços...
pause >nul

REM Cleanup
taskkill /f /im node.exe >nul 2>nul
del start_backend.bat >nul 2>nul
del start_frontend.bat >nul 2>nul

echo Serviços parados!
pause
