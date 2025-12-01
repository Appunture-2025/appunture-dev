#!/bin/bash
# Appunture - Setup Script
# Este script configura o ambiente de desenvolvimento local

echo "🚀 Appunture - Setup de Desenvolvimento Local"
echo "============================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar pré-requisitos
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

errors=()

# Node.js
if command -v node &> /dev/null; then
    echo -e "  ${GREEN}✅ Node.js: $(node --version)${NC}"
else
    errors+=("Node.js não encontrado. Instale em https://nodejs.org")
    echo -e "  ${RED}❌ Node.js não encontrado${NC}"
fi

# Java
if command -v java &> /dev/null; then
    echo -e "  ${GREEN}✅ Java: $(java --version 2>&1 | head -1)${NC}"
else
    errors+=("Java não encontrado. Instale o JDK 17+")
    echo -e "  ${RED}❌ Java não encontrado${NC}"
fi

# Git
if command -v git &> /dev/null; then
    echo -e "  ${GREEN}✅ Git: $(git --version)${NC}"
else
    errors+=("Git não encontrado")
    echo -e "  ${RED}❌ Git não encontrado${NC}"
fi

if [ ${#errors[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Erros encontrados:${NC}"
    for error in "${errors[@]}"; do
        echo -e "   ${RED}- $error${NC}"
    done
    echo ""
    echo -e "${YELLOW}Por favor, resolva os erros acima e execute novamente.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Instalando dependências...${NC}"

# Backend
echo ""
echo -e "  ${CYAN}🔧 Backend Java...${NC}"
cd backend-java
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "    ${GREEN}📄 Criado .env a partir do template${NC}"
fi
./mvnw -q dependency:go-offline 2>/dev/null && echo -e "    ${GREEN}✅ Dependências Maven instaladas${NC}" || echo -e "    ${YELLOW}⚠️  Erro ao instalar dependências Maven${NC}"
cd ..

# Frontend Mobile
echo ""
echo -e "  ${CYAN}📱 Frontend Mobile...${NC}"
cd frontend-mobile/appunture
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "    ${GREEN}📄 Criado .env a partir do template${NC}"
fi
npm install --silent 2>/dev/null && echo -e "    ${GREEN}✅ Dependências NPM instaladas${NC}" || echo -e "    ${YELLOW}⚠️  Erro ao instalar dependências NPM${NC}"
cd ../..

# Integration Tests
echo ""
echo -e "  ${CYAN}🧪 Integration Tests...${NC}"
cd integration-tests
npm install --silent 2>/dev/null && echo -e "    ${GREEN}✅ Dependências NPM instaladas${NC}" || echo -e "    ${YELLOW}⚠️  Erro ao instalar dependências NPM${NC}"
cd ..

echo ""
echo "============================================="
echo -e "${GREEN}✅ Setup concluído!${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "   1. Configure os arquivos .env em cada pasta com suas credenciais Firebase"
echo "   2. Execute o backend: cd backend-java && ./mvnw spring-boot:run"
echo "   3. Execute o mobile: cd frontend-mobile/appunture && npx expo start"
echo ""
echo -e "${CYAN}📖 Consulte DEPLOY_GUIDE.md para instruções completas de deploy${NC}"
echo ""
