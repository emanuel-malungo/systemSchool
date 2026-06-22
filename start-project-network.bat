@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

title Projeto Jomorais - Modo Rede Local

color 0A

echo ============================================
echo   PROJETO JOMORAIS - MODO REDE LOCAL
echo ============================================
echo.

REM Obter o diretório do script automaticamente
set "SCRIPT_DIR=%~dp0"
echo [INFO] Diretorio do script: %SCRIPT_DIR%
echo.

REM ===================================
REM DETECCAO DO IP DA REDE LOCAL
REM ===================================
echo [INFO] Detectando IP da rede local...

set "LOCAL_IP="

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" 2^>nul') do (
    set "IP_TEMP=%%a"
    if not "!IP_TEMP!"=="" (
        for /f "tokens=*" %%b in ("!IP_TEMP!") do (
            set "LOCAL_IP=%%b"
            goto :IP_FOUND
        )
    )
)

:IP_FOUND
if defined LOCAL_IP (
    for /f "tokens=* delims= " %%x in ("!LOCAL_IP!") do set "LOCAL_IP=%%x"
)

if not defined LOCAL_IP (
    echo [AVISO] Nao foi possivel detectar o IP da rede.
    echo [AVISO] Usando localhost como fallback.
    set "LOCAL_IP=localhost"
)

echo [OK] IP detectado: !LOCAL_IP!
echo.

REM ===================================
REM DETECCAO AUTOMATICA DOS DIRETORIOS
REM ===================================
echo [INFO] Detectando diretorios do projeto...

set "BACKEND_DIR="
set "FRONTEND_DIR="

for /d %%i in ("%SCRIPT_DIR%*backend*") do (
    if exist "%%i\package.json" (
        set "BACKEND_DIR=%%i"
        echo [BACKEND] Detectado: %%i
    )
)

if not defined BACKEND_DIR (
    for /d %%i in ("%SCRIPT_DIR%*back*") do (
        if exist "%%i\package.json" (
            set "BACKEND_DIR=%%i"
            echo [BACKEND] Detectado: %%i
        )
    )
)

for /d %%i in ("%SCRIPT_DIR%*frontend*") do (
    if exist "%%i\package.json" (
        set "FRONTEND_DIR=%%i"
        echo [FRONTEND] Detectado: %%i
    )
)

if not defined FRONTEND_DIR (
    for /d %%i in ("%SCRIPT_DIR%*web*") do (
        if exist "%%i\package.json" (
            set "FRONTEND_DIR=%%i"
            echo [FRONTEND] Detectado: %%i
        )
    )
)

echo.

if not defined BACKEND_DIR (
    echo [ERRO] Diretorio do backend nao encontrado!
    echo.
    echo Certifique-se que existe uma pasta com "backend" no nome
    echo contendo um arquivo package.json
    echo.
    goto :ERROR_EXIT
)

if not defined FRONTEND_DIR (
    echo [ERRO] Diretorio do frontend nao encontrado!
    echo.
    echo Certifique-se que existe uma pasta com "frontend" no nome
    echo contendo um arquivo package.json
    echo.
    goto :ERROR_EXIT
)

echo [OK] Diretorios encontrados!
echo.

REM ===================================
REM CONFIGURAR O .ENV DO FRONTEND
REM ===================================
echo [INFO] Configurando .env do frontend para acesso via rede...

if exist "!FRONTEND_DIR!\.env" (
    copy "!FRONTEND_DIR!\.env" "!FRONTEND_DIR!\.env.backup" >nul 2>&1
    echo [OK] Backup do .env criado.
)

(
    echo VITE_API_URL=http://!LOCAL_IP!:8000
    echo #VITE_API_URL=https://jomorais-backend-o5e5.onrender.com
    echo VITE_TOKEN_KEY=meu_token
) > "!FRONTEND_DIR!\.env"

echo [OK] Frontend configurado para usar: http://!LOCAL_IP!:8000
echo.

REM ===================================
REM VERIFICAR NODE.JS E NPM
REM ===================================
echo [INFO] Verificando Node.js e npm...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado.
    echo Por favor, instale o Node.js: https://nodejs.org/
    echo.
    goto :ERROR_EXIT
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] npm nao encontrado.
    echo.
    goto :ERROR_EXIT
)

echo [OK] Node.js e npm encontrados!
echo.

REM ===================================
REM INSTALAR DEPENDENCIAS
REM ===================================
echo [INFO] Verificando dependencias...
echo.

cd /d "!BACKEND_DIR!"
if not exist "node_modules" (
    echo [BACKEND] Instalando dependencias... Isso pode demorar alguns minutos.
    call npm install
    if !errorlevel! neq 0 (
        echo [ERRO] Falha ao instalar dependencias do backend.
        goto :ERROR_EXIT
    )
) else (
    echo [BACKEND] Dependencias ja instaladas.
)

cd /d "!FRONTEND_DIR!"
if not exist "node_modules" (
    echo [FRONTEND] Instalando dependencias... Isso pode demorar alguns minutos.
    call npm install
    if !errorlevel! neq 0 (
        echo [ERRO] Falha ao instalar dependencias do frontend.
        goto :ERROR_EXIT
    )
) else (
    echo [FRONTEND] Dependencias ja instaladas.
)

echo.

REM ===================================
REM CONFIGURAR FIREWALL (OPCIONAL)
REM ===================================
echo [INFO] Verificando regras de firewall...
echo [AVISO] Se outros PCs nao conseguirem acessar, execute como Administrador
echo         ou adicione manualmente as portas 8000 e 5173 no Firewall do Windows.
echo.

netsh advfirewall firewall show rule name="Jomorais Backend" >nul 2>&1
if !errorlevel! neq 0 (
    echo [INFO] Tentando adicionar regra de firewall para Backend (porta 8000)...
    netsh advfirewall firewall add rule name="Jomorais Backend" dir=in action=allow protocol=tcp localport=8000 >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Regra de firewall adicionada para Backend.
    ) else (
        echo [AVISO] Nao foi possivel adicionar regra. Execute como Administrador se necessario.
    )
)

netsh advfirewall firewall show rule name="Jomorais Frontend" >nul 2>&1
if !errorlevel! neq 0 (
    echo [INFO] Tentando adicionar regra de firewall para Frontend (porta 5173)...
    netsh advfirewall firewall add rule name="Jomorais Frontend" dir=in action=allow protocol=tcp localport=5173 >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Regra de firewall adicionada para Frontend.
    ) else (
        echo [AVISO] Nao foi possivel adicionar regra. Execute como Administrador se necessario.
    )
)

echo.

REM ===================================
REM ATUALIZAR BANCO DE DADOS (PRISMA)
REM ===================================
echo [BACKEND] Atualizando banco de dados com Prisma...
cd /d "!BACKEND_DIR!"

call npx prisma generate
if !errorlevel! neq 0 (
    echo [ERRO] Falha ao gerar o cliente Prisma.
    goto :ERROR_EXIT
)

call npx prisma db push --skip-generate
if !errorlevel! neq 0 (
    echo [ERRO] Falha ao sincronizar o banco de dados (Prisma db push).
    echo [AVISO] Se houver alteracoes destrutivas que causem perda de dados,
    echo         este comando falha automaticamente para proteger seus dados.
    goto :ERROR_EXIT
)

echo [OK] Banco de dados e cliente Prisma atualizados com sucesso!
echo.

REM ===================================
REM INICIAR SERVIDORES
REM ===================================
echo [INFO] Iniciando servidores...
echo.

REM Iniciar o backend em nova janela
echo [BACKEND] Iniciando servidor backend...
start "Backend - Jomorais (Rede)" /D "!BACKEND_DIR!" cmd /k npm run dev

echo [INFO] Aguardando backend inicializar (5s)...
timeout /t 5 /nobreak >nul

REM Iniciar o frontend em nova janela
echo [FRONTEND] Iniciando servidor frontend...
start "Frontend - Jomorais (Rede)" /D "!FRONTEND_DIR!" cmd /k "npm run dev -- --host"

echo [INFO] Aguardando frontend inicializar (8s)...
timeout /t 8 /nobreak >nul

REM Abrir o navegador
echo [INFO] Abrindo navegador...
start "" "http://localhost:5173"

goto :SUCCESS_EXIT

REM ===================================
REM SAIDAS
REM ===================================
:ERROR_EXIT
echo.
echo ============================================
echo   OCORREU UM ERRO - Verifique as mensagens acima
echo ============================================
echo.
echo Pressione qualquer tecla para fechar...
pause
exit /b 1

:SUCCESS_EXIT
echo.
echo ============================================
echo    PROJETO JOMORAIS - INICIADO COM SUCESSO
echo ============================================
echo.
echo  ACESSO LOCAL (este PC):
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo.
echo  ACESSO NA REDE (outros PCs):
echo    Frontend: http://!LOCAL_IP!:5173
echo    Backend:  http://!LOCAL_IP!:8000
echo.
echo ============================================
echo.
echo [IMPORTANTE] Para outros PCs acessarem:
echo   1. Certifique-se que estao na mesma rede Wi-Fi/LAN
echo   2. Acesse pelo navegador: http://!LOCAL_IP!:5173
echo   3. Se nao funcionar, verifique o Firewall do Windows
echo.
echo Caminhos utilizados:
echo   Backend:  !BACKEND_DIR!
echo   Frontend: !FRONTEND_DIR!
echo.
echo Para parar os servidores, feche as janelas "Backend" e "Frontend".
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause
exit /b 0