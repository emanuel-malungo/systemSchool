@echo off
echo ============================================
echo   PARANDO PROJETO JOMORAIS
echo ============================================
echo.

REM Matar processos Node.js relacionados ao projeto
echo [INFO] Parando servidores Node.js...

taskkill /F /FI "WINDOWTITLE eq Backend - Jomorais*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend - Jomorais*" >nul 2>&1

REM Matar processos nas portas específicas
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [OK] Servidores parados!
echo.

REM Restaurar .env original se existir backup
set "SCRIPT_DIR=%~dp0"
for /d %%i in ("%SCRIPT_DIR%*frontend*") do (
    if exist "%%i\.env.backup" (
        echo [INFO] Restaurando .env original do frontend...
        copy "%%i\.env.backup" "%%i\.env" >nul 2>&1
        del "%%i\.env.backup" >nul 2>&1
        echo [OK] .env restaurado!
    )
)

echo.
echo ============================================
echo   PROJETO JOMORAIS PARADO COM SUCESSO
echo ============================================
echo.
pause
