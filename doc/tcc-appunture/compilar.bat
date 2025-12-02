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

echo [1/4] Primeira compilacao...
pdflatex -interaction=nonstopmode main.tex > nul 2>&1

echo [2/4] Processando bibliografia (bibtex)...
bibtex main > nul 2>&1

echo [3/4] Segunda compilacao...
pdflatex -interaction=nonstopmode main.tex > nul 2>&1

echo [4/4] Compilacao final...
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
