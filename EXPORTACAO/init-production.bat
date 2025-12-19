@echo off
REM Script de inicialização do Sistema de Orçamentos para Windows
REM Use: init-production.bat

echo.
echo ==================================
echo Sistema de Orçamentos - Inicialização
echo ==================================
echo.

REM 1. Verificar Node.js
echo [1/5] Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não está instalado
    exit /b 1
)
echo ✅ Node.js está instalado
echo.

REM 2. Verificar npm
echo [2/5] Verificando npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não está instalado
    exit /b 1
)
echo ✅ npm está instalado
echo.

REM 3. Instalar dependências
echo [3/5] Instalando dependências...
call npm install --production
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    exit /b 1
)
echo ✅ Dependências instaladas
echo.

REM 4. Verificar .env
echo [4/5] Verificando configurações (.env)...
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado
    echo Criando a partir de .env.example...
    copy .env.example .env
    echo ⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!
    echo Configure os seguintes campos:
    echo   - DB_HOST, DB_USER, DB_PASS, DB_NAME
    echo   - JWT_SECRET
    echo   - EMAIL_FROM, EMAIL_USER, EMAIL_PASS (SMTP)
)
echo.

REM 5. Info
echo ==================================
echo ✅ Inicialização concluída!
echo ==================================
echo.
echo Próximos passos:
echo 1. Edite o arquivo .env com suas credenciais
echo 2. Importe o schema do banco: mysql -u root -p ^< database\schema.sql
echo 3. Inicie o servidor: npm start
echo 4. Acesse o sistema em http://localhost:3000
echo 5. Configure o sistema em /setup.html
echo.
pause
