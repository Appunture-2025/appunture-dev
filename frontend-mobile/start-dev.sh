#!/bin/bash

# Script para executar backend e frontend simultaneamente

echo "🚀 Iniciando Appunture em modo desenvolvimento..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor instale o npm primeiro."
    exit 1
fi

# Função para cleanup quando o script for interrompido
cleanup() {
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Verificando dependências...${NC}"

# Verificar e instalar dependências do backend
if [ -d "backend" ]; then
    echo -e "${YELLOW}🔧 Verificando backend...${NC}"
    cd backend
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 Instalando dependências do backend...${NC}"
        npm install
    fi
    cd ..
else
    echo -e "${RED}❌ Diretório backend não encontrado!${NC}"
    exit 1
fi

# Verificar e instalar dependências do frontend mobile
if [ -d "frontend-mobile/appunture" ]; then
    echo -e "${YELLOW}🔧 Verificando frontend mobile...${NC}"
    cd frontend-mobile/appunture
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 Instalando dependências do frontend mobile...${NC}"
        npm install
    fi
    cd ../..
else
    echo -e "${RED}❌ Diretório frontend-mobile/appunture não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências verificadas!${NC}"

# Configurar banco de dados se necessário
echo -e "${BLUE}🗄️ Configurando banco de dados...${NC}"
cd backend
if [ ! -f "database/appunture.db" ]; then
    echo -e "${YELLOW}🏗️ Inicializando banco de dados...${NC}"
    npm run init-db
fi
cd ..

echo -e "${GREEN}✅ Banco de dados pronto!${NC}"

# Iniciar backend
echo -e "${BLUE}🚀 Iniciando backend na porta 3000...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Aguardar um pouco para o backend inicializar
sleep 3

# Verificar se o backend está rodando
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⏳ Aguardando backend inicializar...${NC}"
    sleep 5
fi

# Iniciar frontend mobile
echo -e "${BLUE}📱 Iniciando frontend mobile...${NC}"
cd frontend-mobile/appunture
npm start &
FRONTEND_PID=$!
cd ../..

echo -e "${GREEN}🎉 Appunture iniciado com sucesso!${NC}"
echo -e "${BLUE}📋 Informações:${NC}"
echo -e "  🔧 Backend: http://localhost:3000"
echo -e "  📱 Frontend: Expo Dev Server iniciado"
echo -e "  📊 Admin: http://localhost:3000/admin"
echo ""
echo -e "${YELLOW}📖 Comandos disponíveis:${NC}"
echo -e "  • Pressione ${BLUE}Ctrl+C${NC} para parar todos os serviços"
echo -e "  • Backend API: ${BLUE}http://localhost:3000/api${NC}"
echo -e "  • Documentação API: ${BLUE}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "${GREEN}🔗 Para conectar o app mobile:${NC}"
echo -e "  1. Escaneie o QR code que aparecerá no terminal"
echo -e "  2. Ou baixe o Expo Go e digite o URL manualmente"
echo -e "  3. O app já está configurado para conectar no backend local"

# Aguardar indefinidamente ou até ser interrompido
wait
