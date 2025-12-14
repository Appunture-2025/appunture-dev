#!/bin/bash
# Script para diagnosticar problema com SVGs remotos

echo "=== TESTE DE SVG REMOTO ==="
echo ""

# URLs dos SVGs
BUCKET="appunture-tcc.firebasestorage.app"
SVGS=("LU" "ST" "ST2" "SP" "HT" "SI" "BL" "KI" "P" "TW" "GB" "LV" "GV" "CV" "LI")

echo "Testando acesso aos SVGs no Firebase Storage:"
echo "Bucket: $BUCKET"
echo ""

for svg in "${SVGS[@]}"; do
  URL="https://firebasestorage.googleapis.com/v0/b/$BUCKET/o/body-map%2F${svg}.svg?alt=media"
  
  echo -n "Testando $svg... "
  
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  
  if [ "$RESPONSE" = "200" ]; then
    echo "✓ OK (HTTP 200)"
  elif [ "$RESPONSE" = "403" ]; then
    echo "✗ BLOCKED (HTTP 403 - Forbidden)"
  elif [ "$RESPONSE" = "404" ]; then
    echo "✗ NOT FOUND (HTTP 404)"
  else
    echo "✗ ERROR (HTTP $RESPONSE)"
  fi
done

echo ""
echo "=== RESULTADOS ==="
echo "Se todos retornarem ✓ OK (HTTP 200), os SVGs estão acessíveis."
echo "Se retornar ✗ BLOCKED (HTTP 403), verifique as regras do Firebase Storage."
echo "Se retornar ✗ NOT FOUND (HTTP 404), verifique se os SVGs existem no bucket."
