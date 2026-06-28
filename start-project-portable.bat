@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

title Projeto Jomorais - Modo Local

color 0E

echo ============================================
echo   CONFIGURACAO PORTAVEL - PROJETO JOMORAIS
echo ============================================
echo.

REM Obter o diretório do script automaticamente
set "SCRIPT_DIR=%~dp0"

REM ===================================
REM CONFIGURACAO MANUAL DE CAMINHOS
REM ===================================
REM OPCAO 1: Detectar automaticamente (recomendado)
set "AUTO_DETECT=true"

REM OPCAO 2: Configurar manualmente (descomente e edite se necessário)
REM set "AUTO_DETECT=false"
REM set "MANUAL_BACKEND_DIR=C:\caminho\para\seu\backend"
REM set "MANUAL_FRONTEND_DIR=C:\caminho\para\seu\frontend"

echo [INFO] Modo de deteccao:

if "!AUTO_DETECT!"=="true" (
    echo [AUTO] Detectando automaticamente...
    echo.

    set "BACKEND_DIR="
    set "FRONTEND_DIR="

    for /d %%i in ("%SCRIPT_DIR%*backend*") do (
        if exist "%%i\package.json" (
            set "BACKEND_DIR=%%i"
            echo [BACKEND] Auto-detectado: %%i
        )
    )

    if "!BACKEND_DIR!"=="" (
        for /d %%i in ("%SCRIPT_DIR%*back*") do (
            if exist "%%i\package.json" (
                set "BACKEND_DIR=%%i"
                echo [BACKEND] Auto-detectado: %%i
            )
        )
    )

    for /d %%i in ("%SCRIPT_DIR%*frontend*") do (
        if exist "%%i\package.json" (
            set "FRONTEND_DIR=%%i"
            echo [FRONTEND] Auto-detectado: %%i
        )
    )

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
    echo.
    set "BACKEND_DIR=!MANUAL_BACKEND_DIR!"
    set "FRONTEND_DIR=!MANUAL_FRONTEND_DIR!"
    echo [BACKEND] Manual: !BACKEND_DIR!
    echo [FRONTEND] Manual: !FRONTEND_DIR!
)

echo.

REM ===================================
REM VALIDAR DIRETORIOS
REM ===================================
if "!BACKEND_DIR!"=="" (
    echo =============================================
    echo  ERRO: Diretorio do backend nao encontrado!
    echo =============================================
    echo.
    echo SOLUCOES:
    echo 1. Certifique-se que existe uma pasta com "backend" no nome
    echo    contendo um arquivo package.json dentro dela.
    echo.
    echo 2. Ou edite este script manualmente:
    echo    - Abra este arquivo .bat em um editor de texto
    echo    - Procure por "CONFIGURACAO MANUAL"
    echo    - Descomente as linhas e coloque o caminho correto
    echo.
    echo Estrutura esperada:
    echo   !SCRIPT_DIR!
    echo   ├── backend\   ^<-- package.json aqui
    echo   └── frontend\  ^<-- package.json aqui
    echo.
    goto :ERROR_EXIT
)

if "!FRONTEND_DIR!"=="" (
    echo =============================================
    echo  ERRO: Diretorio do frontend nao encontrado!
    echo =============================================
    echo.
    echo SOLUCOES:
    echo 1. Certifique-se que existe uma pasta com "frontend" no nome
    echo    contendo um arquivo package.json dentro dela.
    echo.
    echo 2. Ou edite este script manualmente:
    echo    - Abra este arquivo .bat em um editor de texto
    echo    - Procure por "CONFIGURACAO MANUAL"
    echo    - Descomente as linhas e coloque o caminho correto
    echo.
    echo Estrutura esperada:
    echo   !SCRIPT_DIR!
    echo   ├── backend\   ^<-- package.json aqui
    echo   └── frontend\  ^<-- package.json aqui
    echo.
    goto :ERROR_EXIT
)

if not exist "!BACKEND_DIR!\package.json" (
    echo [ERRO] package.json nao encontrado em:
    echo        !BACKEND_DIR!
    echo.
    echo Verifique se o caminho do backend esta correto.
    echo.
    goto :ERROR_EXIT
)

if not exist "!FRONTEND_DIR!\package.json" (
    echo [ERRO] package.json nao encontrado em:
    echo        !FRONTEND_DIR!
    echo.
    echo Verifique se o caminho do frontend esta correto.
    echo.
    goto :ERROR_EXIT
)

REM ===================================
REM VERIFICAR NODE.JS E NPM
REM ===================================
echo [INFO] Verificando Node.js e npm...

where node >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Node.js nao encontrado.
    echo.
    echo Por favor, instale o Node.js em: https://nodejs.org/
    echo Apos instalar, reinicie o computador e execute este script novamente.
    echo.
    goto :ERROR_EXIT
)

where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] npm nao encontrado.
    echo O npm geralmente e instalado junto com o Node.js.
    echo Tente reinstalar o Node.js em: https://nodejs.org/
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

echo [BACKEND] Verificando dependencias em: !BACKEND_DIR!
cd /d "!BACKEND_DIR!"
if not exist "node_modules" (
    echo [BACKEND] Instalando dependencias... Isso pode demorar alguns minutos.
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo [ERRO] Falha ao instalar dependencias do backend.
        echo Verifique sua conexao com a internet e tente novamente.
        echo.
        goto :ERROR_EXIT
    )
    echo [BACKEND] Dependencias instaladas com sucesso!
) else (
    echo [BACKEND] Dependencias ja instaladas.
)

echo.
echo [FRONTEND] Verificando dependencias em: !FRONTEND_DIR!
cd /d "!FRONTEND_DIR!"
if not exist "node_modules" (
    echo [FRONTEND] Instalando dependencias... Isso pode demorar alguns minutos.
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo [ERRO] Falha ao instalar dependencias do frontend.
        echo Verifique sua conexao com a internet e tente novamente.
        echo.
        goto :ERROR_EXIT
    )
    echo [FRONTEND] Dependencias instaladas com sucesso!
) else (
    echo [FRONTEND] Dependencias ja instaladas.
)

echo.

REM ===================================
REM ATUALIZAR CLIENTE PRISMA
REM ===================================
echo [BACKEND] Atualizando cliente Prisma...
cd /d "!BACKEND_DIR!"

call npx prisma generate >nul 2>&1
if !errorlevel! neq 0 (
    echo [AVISO] prisma generate falhou - continuando mesmo assim...
) else (
    echo [OK] Cliente Prisma gerado.
)
echo.

REM ===================================
REM INICIAR SERVIDORES
REM ===================================
echo [INFO] Iniciando servidores...
echo.

REM Salvar caminhos em variaveis limpas para o start funcionar corretamente
set "BD=!BACKEND_DIR!"
set "FD=!FRONTEND_DIR!"

echo [BACKEND] Iniciando servidor backend...
start "Backend - Jomorais" cmd /k "cd /d "!BD!" && npm run dev"

echo [INFO] Aguardando backend inicializar (5s)...
timeout /t 5 /nobreak >nul

echo [FRONTEND] Iniciando servidor frontend...
start "Frontend - Jomorais" cmd /k "cd /d "!FD!" && npm run dev"

echo [INFO] Aguardando frontend inicializar (8s)...
timeout /t 8 /nobreak >nul

echo [INFO] Abrindo navegador...
start "" "http://localhost:5173"

goto :SUCCESS_EXIT

REM ===================================
REM SAIDAS
REM ===================================
:ERROR_EXIT
echo.
echo ============================================
echo   OCORREU UM ERRO - Leia as mensagens acima
echo ============================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
exit /b 1

:SUCCESS_EXIT
echo.
echo ============================================
echo    PROJETO JOMORAIS INICIADO COM SUCESSO!
echo ============================================
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo.
echo  Caminhos utilizados:
echo    Backend:  !BD!
echo    Frontend: !FD!
echo.
echo  Para parar os servidores, feche as janelas
echo  "Backend - Jomorais" e "Frontend - Jomorais".
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
exit /b 0
