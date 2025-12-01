#!/bin/bash
echo "========================================"
echo " Appunture Point Mapper"
echo "========================================"
echo ""
echo "Iniciando servidor local..."
echo ""
echo "Acesse: http://localhost:8080/tools/point-mapper/"
echo ""
echo "Pressione Ctrl+C para encerrar"
echo "========================================"
echo ""

cd "$(dirname "$0")/../.."
python3 -m http.server 8080
