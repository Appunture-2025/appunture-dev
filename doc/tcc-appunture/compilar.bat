@echo off
REM ========================================
REM  Script de Compilacao - TCC Appunture
REM  Uso: compilar.bat
REM ========================================

echo ========================================
echo   Compilando TCC Appunture
echo ========================================
echo.

set PATH=%PATH%;C:\Users\Usuario\AppData\Local\Programs\MiKTeX\miktex\bin\x64

REM Verificar se pdflatex existe
where pdflatex >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: pdflatex nao encontrado!
    echo.
    echo Instale o MiKTeX: https://miktex.org/download
    pause
    exit /b 1
)

REM Limpar arquivos auxiliares antigos para evitar problemas
echo [0/5] Limpando arquivos auxiliares...
del /q main.aux main.bbl main.blg main.lof main.log main.lot main.out main.toc main.sig main.sbl main.loq 2>nul

echo [1/5] Primeira compilacao (gera arquivos auxiliares)...
pdflatex -interaction=nonstopmode main.tex > nul 2>&1

echo [2/5] Processando bibliografia (bibtex)...
bibtex main > nul 2>&1

echo [3/5] Segunda compilacao (resolve referencias)...
pdflatex -interaction=nonstopmode main.tex > nul 2>&1

echo [4/5] Terceira compilacao (resolve siglas e listas)...
pdflatex -interaction=nonstopmode main.tex > nul 2>&1

echo [5/5] Compilacao final...
pdflatex -interaction=nonstopmode main.tex > nul 2>&1

echo.
if exist main.pdf (
    echo ========================================
    echo   SUCESSO! Arquivo gerado: main.pdf
    echo ========================================
    echo.
    echo Abrindo PDF...
    start main.pdf
) else (
    echo ========================================
    echo   ERRO na compilacao!
    echo   Verifique o arquivo main.log
    echo ========================================
)

pause
