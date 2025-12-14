# Script para diagnosticar problema com SVGs remotos - PowerShell

Write-Host "=== TESTE DE SVG REMOTO ===" -ForegroundColor Cyan
Write-Host ""

$BUCKET = "appunture-tcc.firebasestorage.app"
$SVGS = @("LU", "ST", "ST2", "SP", "HT", "SI", "BL", "KI", "P", "TW", "GB", "LV", "GV", "CV", "LI")

Write-Host "Testando acesso aos SVGs no Firebase Storage:" -ForegroundColor Yellow
Write-Host "Bucket: $BUCKET"
Write-Host ""

$successCount = 0
$blockedCount = 0
$notFoundCount = 0
$errorCount = 0

foreach ($svg in $SVGS) {
  $URL = "https://firebasestorage.googleapis.com/v0/b/$BUCKET/o/body-map%2F${svg}.svg?alt=media"
  
  Write-Host -NoNewline "Testando $svg... "
  
  try {
    $response = Invoke-WebRequest -Uri $URL -Method Head -ErrorAction SilentlyContinue
    $statusCode = $response.StatusCode
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
  }
  
  switch ($statusCode) {
    200 {
      Write-Host "✓ OK (HTTP 200)" -ForegroundColor Green
      $successCount++
    }
    403 {
      Write-Host "✗ BLOCKED (HTTP 403 - Forbidden)" -ForegroundColor Red
      $blockedCount++
    }
    404 {
      Write-Host "✗ NOT FOUND (HTTP 404)" -ForegroundColor Yellow
      $notFoundCount++
    }
    default {
      Write-Host "✗ ERROR (HTTP $statusCode)" -ForegroundColor Red
      $errorCount++
    }
  }
}

Write-Host ""
Write-Host "=== RESULTADOS ===" -ForegroundColor Cyan
Write-Host "Sucesso (200):  $successCount" -ForegroundColor Green
Write-Host "Bloqueado (403): $blockedCount" -ForegroundColor Red
Write-Host "Não encontrado (404): $notFoundCount" -ForegroundColor Yellow
Write-Host "Erro: $errorCount" -ForegroundColor Red
Write-Host ""

if ($successCount -eq $SVGS.Count) {
  Write-Host "✓ Todos os SVGs estão acessíveis!" -ForegroundColor Green
  Write-Host "  Se ainda não funcionam no app, o problema está no frontend."
} elseif ($blockedCount -gt 0) {
  Write-Host "✗ SVGs bloqueados - verifique regras do Firebase Storage" -ForegroundColor Red
} elseif ($notFoundCount -gt 0) {
  Write-Host "✗ SVGs não encontrados - verifique se estão no bucket" -ForegroundColor Red
} else {
  Write-Host "✗ Erro de rede ou servidor indisponível" -ForegroundColor Red
}
