#!/bin/bash

# Script de configuração inicial do Firebase para TCC
echo "🔥 Configuração Firebase + Google Cloud Storage - TCC Appunture"
echo "================================================================="

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instalando..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI encontrado"
fi

# Login no Firebase
echo "🔐 Fazendo login no Firebase..."
firebase login

# Criar projeto Firebase (opcional)
read -p "📝 Deseja criar um novo projeto Firebase? (y/n): " create_project
if [[ $create_project == "y" || $create_project == "Y" ]]; then
    read -p "📛 Nome do projeto (ex: appunture-tcc): " project_name
    firebase projects:create $project_name
    firebase use $project_name
fi

# Inicializar Firebase no projeto
echo "🚀 Inicializando Firebase..."
firebase init

echo ""
echo "✅ Configuração inicial concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure Authentication no console Firebase"
echo "2. Configure Storage no console Firebase" 
echo "3. Baixe a service account key"
echo "4. Configure as variáveis de ambiente:"
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_SERVICE_ACCOUNT_KEY" 
echo "   - GCP_STORAGE_BUCKET"
echo ""
echo "📖 Consulte FIREBASE_SETUP.md para instruções detalhadas"