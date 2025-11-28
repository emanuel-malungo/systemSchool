@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   CONFIGURACAO PORTAVEL - PROJETO JOMORAIS
echo ============================================
echo.

REM Definir cores para o terminal
color 0E

REM ===================================
REM CONFIGURACAO MANUAL DE CAMINHOS
REM ===================================
REM Se você mover este script para outro PC, edite os caminhos abaixo:

REM Obter o diretório do script automaticamente
set "SCRIPT_DIR=%~dp0"

REM OPCAO 1: Detectar automaticamente (recomendado)
set "AUTO_DETECT=true"

REM OPCAO 2: Configurar manualmente (descomente e edite se necessário)
REM set "AUTO_DETECT=false"
REM set "MANUAL_BACKEND_DIR=C:\caminho\para\seu\backend"
REM set "MANUAL_FRONTEND_DIR=C:\caminho\para\seu\frontend"

echo [INFO] Modo de detecção: 
if "!AUTO_DETECT!"=="true" (
    echo [AUTO] Detectando automaticamente...
    
    REM Detectar automaticamente os caminhos do backend e frontend
    set "BACKEND_DIR="
    set "FRONTEND_DIR="
    
    REM Procurar pelo diretório do backend
    for /d %%i in ("%SCRIPT_DIR%*backend*") do (
        if exist "%%i\package.json" (
            set "BACKEND_DIR=%%i"
            echo [BACKEND] Auto-detectado: %%i
        )
    )
    
    REM Se não encontrou com "backend", tentar variações
    if "!BACKEND_DIR!"=="" (
        for /d %%i in ("%SCRIPT_DIR%*back*") do (
            if exist "%%i\package.json" (
                set "BACKEND_DIR=%%i"
                echo [BACKEND] Auto-detectado: %%i
            )
        )
    )
    
    REM Procurar pelo diretório do frontend
    for /d %%i in ("%SCRIPT_DIR%*frontend*") do (
        if exist "%%i\package.json" (
            set "FRONTEND_DIR=%%i"
            echo [FRONTEND] Auto-detectado: %%i
        )
    )
    
    REM Se não encontrou com "front", tentar variações
    if "!FRONTEND_DIR!"=="" (
        for /d %%i in ("%SCRIPT_DIR%*web*") do (
            if exist "%%i\package.json" (
                set "FRONTEND_DIR=%%i"
                echo [FRONTEND] Auto-detectado: %%i
            )
        )
    )
    
) else (
    echo [MANUAL] Usando caminhos configurados manualmente...
    set "BACKEND_DIR=!MANUAL_BACKEND_DIR!"
    set "FRONTEND_DIR=!MANUAL_FRONTEND_DIR!"
    echo [BACKEND] Manual: !BACKEND_DIR!
    echo [FRONTEND] Manual: !FRONTEND_DIR!
)

echo.

REM Verificar se os diretórios foram encontrados/configurados
if "!BACKEND_DIR!"=="" (
    echo =============================================
    echo ERRO: Diretorio do backend nao encontrado!
    echo =============================================
    echo.
    echo SOLUCOES:
    echo 1. Certifique-se que existe uma pasta com "backend" no nome
    echo 2. Ou edite este script e configure manualmente:
    echo    - Abra este arquivo .bat em um editor de texto
    echo    - Procure por "CONFIGURACAO MANUAL"
    echo    - Descomente as linhas e coloque o caminho correto
    echo.
    echo Estrutura esperada:
    echo pasta-backend/
    echo   └── package.json
    echo.
    pause
    exit /b 1
)

if "!FRONTEND_DIR!"=="" (
    echo =============================================
    echo ERRO: Diretorio do frontend nao encontrado!
    echo =============================================
    echo.
    echo SOLUCOES:
    echo 1. Certifique-se que existe uma pasta com "front" no nome
    echo 2. Ou edite este script e configure manualmente:
    echo    - Abra este arquivo .bat em um editor de texto
    echo    - Procure por "CONFIGURACAO MANUAL"
    echo    - Descomente as linhas e coloque o caminho correto
    echo.
    echo Estrutura esperada:
    echo pasta-frontend/
    echo   └── package.json
    echo.
    pause
    exit /b 1
)

REM Verificar se os arquivos package.json existem
if not exist "!BACKEND_DIR!\package.json" (
    echo ERRO: package.json nao encontrado em: !BACKEND_DIR!
    echo Verifique se o caminho do backend esta correto.
    pause
    exit /b 1
)

if not exist "!FRONTEND_DIR!\package.json" (
    echo ERRO: package.json nao encontrado em: !FRONTEND_DIR!
    echo Verifique se o caminho do frontend esta correto.
    pause
    exit /b 1
)

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado. 
    echo Por favor, instale o Node.js primeiro em: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado. 
    echo O npm geralmente vem com o Node.js.
    pause
    exit /b 1
)

echo [OK] Configuracao validada com sucesso!
echo.
echo [INFO] Verificando dependencias...
echo.

REM Instalar dependências do backend
echo [BACKEND] Verificando dependencias em: !BACKEND_DIR!
cd /d "!BACKEND_DIR!"
if not exist "node_modules" (
    echo [BACKEND] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias do backend.
        pause
        exit /b 1
    )
) else (
    echo [BACKEND] Dependencias ja instaladas.
)

REM Instalar dependências do frontend
echo [FRONTEND] Verificando dependencias em: !FRONTEND_DIR!
cd /d "!FRONTEND_DIR!"
if not exist "node_modules" (
    echo [FRONTEND] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias do frontend.
        pause
        exit /b 1
    )
) else (
    echo [FRONTEND] Dependencias ja instaladas.
)

echo.
echo [INFO] Iniciando servidores...
echo.

REM Iniciar o backend
echo [BACKEND] Iniciando servidor backend...
start "Backend - Jomorais" cmd /k "cd /d "!BACKEND_DIR!" && npm run dev"

REM Aguardar um pouco para o backend inicializar
timeout /t 3 /nobreak >nul

REM Iniciar o frontend  
echo [FRONTEND] Iniciando servidor frontend...
start "Frontend - Jomorais" cmd /k "cd /d "!FRONTEND_DIR!" && npm run dev"

REM Aguardar o frontend inicializar
echo [INFO] Aguardando servidores iniciarem...
timeout /t 8 /nobreak >nul

REM Abrir o navegador
echo [INFO] Abrindo navegador...
start http://localhost:5173

echo.
echo ============================================
echo    PROJETO JOMORAIS INICIADO COM SUCESSO!
echo ============================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Caminhos utilizados:
echo Backend:  !BACKEND_DIR!
echo Frontend: !FRONTEND_DIR!
echo.
echo Para parar, feche as janelas ou use stop-project.bat
echo.
pause