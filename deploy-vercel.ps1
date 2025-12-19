# ========================================
# 🚀 Deploy Automático para Vercel
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY PARA VERCEL - SISTEMA ORÇAMENTOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Verificar se Vercel CLI está instalado
Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️ Vercel CLI não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar Vercel CLI!" -ForegroundColor Red
        Write-Host "Execute manualmente: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Vercel CLI instalado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI já instalado!" -ForegroundColor Green
}

# Verificar se está logado
Write-Host "`n🔐 Verificando login na Vercel..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1

if ($whoami -match "Error") {
    Write-Host "⚠️ Você não está logado na Vercel." -ForegroundColor Yellow
    Write-Host "`n📧 Abrindo página de login..." -ForegroundColor Cyan
    vercel login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro no login!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✅ Já está logado como: $whoami" -ForegroundColor Green
}

# Verificar variáveis de ambiente
Write-Host "`n⚙️ CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$envVars = @(
    "DB_HOST",
    "DB_USER", 
    "DB_PASSWORD",
    "DB_DATABASE",
    "JWT_SECRET",
    "NODE_ENV"
)

Write-Host "As seguintes variáveis precisam ser configuradas:" -ForegroundColor Yellow
foreach ($var in $envVars) {
    Write-Host "  - $var" -ForegroundColor White
}

Write-Host "`n⚠️ IMPORTANTE: Configure as variáveis de ambiente na Vercel:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Selecione seu projeto" -ForegroundColor White
Write-Host "3. Vá em Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Adicione todas as variáveis listadas acima`n" -ForegroundColor White

$continue = Read-Host "Já configurou as variáveis de ambiente? (s/n)"
if ($continue -ne "s" -and $continue -ne "S") {
    Write-Host "`n⏸️ Deploy pausado." -ForegroundColor Yellow
    Write-Host "Configure as variáveis e execute o script novamente." -ForegroundColor Yellow
    exit 0
}

# Fazer deploy
Write-Host "`n🚀 Iniciando deploy para Vercel..." -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

Write-Host "Executando: vercel --prod" -ForegroundColor Yellow
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ========================================" -ForegroundColor Green
    Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "✅ ========================================`n" -ForegroundColor Green
    
    Write-Host "🌐 Seu app está online!" -ForegroundColor Cyan
    Write-Host "`n📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Acesse o link fornecido acima" -ForegroundColor White
    Write-Host "2. Teste o login e funcionalidades" -ForegroundColor White
    Write-Host "3. Configure domínio personalizado (opcional)`n" -ForegroundColor White
    
    Write-Host "💡 Dica: Todo push no GitHub fará deploy automático!`n" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Erro no deploy!" -ForegroundColor Red
    Write-Host "Verifique os logs acima para mais detalhes." -ForegroundColor Yellow
    Write-Host "`nSoluções comuns:" -ForegroundColor Yellow
    Write-Host "1. Verifique se as variáveis de ambiente estão corretas" -ForegroundColor White
    Write-Host "2. Confira se o vercel.json está correto" -ForegroundColor White
    Write-Host "3. Veja os logs em: https://vercel.com/dashboard`n" -ForegroundColor White
    exit 1
}
