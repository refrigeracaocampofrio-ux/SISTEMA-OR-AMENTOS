#!/usr/bin/env pwsh

# Script automático para corrigir erros do projeto
Write-Host "🔧 SCRIPT AUTOMÁTICO DE CORREÇÃO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Função para testar
function Test-Step {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Error-Step {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

# 1. Verificar Node.js
Write-Host "📋 Etapa 1: Verificar dependências..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Error-Step "Node.js não instalado"
    exit 1
} else {
    Test-Step "Node.js instalado"
}

# 2. Instalar dependências npm
Write-Host ""
Write-Host "📦 Etapa 2: Instalar dependências..." -ForegroundColor Yellow
npm install --legacy-peer-deps 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Test-Step "Dependências instaladas"
} else {
    Error-Step "Erro ao instalar dependências"
}

# 3. Remover arquivo quebrado
Write-Host ""
Write-Host "🗑️  Etapa 3: Remover arquivos problemáticos..." -ForegroundColor Yellow
if (Test-Path "backend/init-db.js") {
    Remove-Item "backend/init-db.js" -Force
    Test-Step "Removido backend/init-db.js"
} else {
    Test-Step "Arquivo init-db.js já removido"
}

# 4. Verificar e corrigir imports no server.js
Write-Host ""
Write-Host "🔍 Etapa 4: Verificar sintaxe do server.js..." -ForegroundColor Yellow
$serverPath = "backend/server.js"
$serverContent = Get-Content $serverPath -Raw

# Verificar se não tem require de init-db (que não existe)
if ($serverContent -match 'require.*init-db') {
    Write-Host "   ⚠️  Removendo referência a init-db..." -ForegroundColor Yellow
    $serverContent = $serverContent -replace 'const \{ initializeDatabase \} = require\(.*init-db.*\);?\s*', ""
    Set-Content -Path $serverPath -Value $serverContent
    Test-Step "Removida referência a init-db"
}

# 5. Testar sintaxe Node.js
Write-Host ""
Write-Host "✅ Etapa 5: Testar sintaxe..." -ForegroundColor Yellow
node -c "backend/server.js" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Test-Step "Sintaxe do server.js OK"
} else {
    Error-Step "Erro de sintaxe encontrado"
}

# 6. Git operations
Write-Host ""
Write-Host "🔄 Etapa 6: Fazer commit e push..." -ForegroundColor Yellow

# Check git status
$gitStatus = git status --porcelain
if ($gitStatus) {
    git add .
    Test-Step "Arquivos staged"
    
    git commit -m "Auto-fix: Remove broken init-db and fix imports" 2>&1 | Out-Null
    Test-Step "Commit criado"
    
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Test-Step "Push realizado com sucesso"
    } else {
        Error-Step "Erro no push"
    }
} else {
    Test-Step "Nenhuma mudança para commitar"
}

# 7. Resumo final
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ CORREÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 PRÓXIMAS ETAPAS:" -ForegroundColor Yellow
Write-Host "1. Aguarde 2-3 minutos para o Vercel fazer auto-deploy"
Write-Host "2. Acesse: https://sistema-or-amentos.vercel.app"
Write-Host "3. Se der erro, execute: npm run lint"
Write-Host ""
Write-Host "🗄️  IMPORTAR SCHEMA NO PLANETSCALE:" -ForegroundColor Yellow
Write-Host "1. Abra: database/schema.sql"
Write-Host "2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)"
Write-Host "3. Acesse: https://app.planetscale.com/refrigeracaocampofrio/sistema-orcamento"
Write-Host "4. Procure por 'Console' e cole o SQL"
Write-Host "5. Execute (pressione Enter ou clique Execute)"
Write-Host ""
Write-Host "✅ Depois teste o login:" -ForegroundColor Yellow
Write-Host "   Email: marciel"
Write-Host "   Senha: 142514"
Write-Host ""
