# ==============================================
# 🚀 SCRIPT DE DEPLOY PARA GITHUB
# Sistema de Orçamentos - Refrigeração Campo Frio
# ==============================================

Write-Host "📦 Preparando deploy para GitHub..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
Write-Host "🔍 Verificando Git..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "❌ Git não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Por favor, instale o Git primeiro:" -ForegroundColor Yellow
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Após instalar, execute este script novamente." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Git instalado!" -ForegroundColor Green
Write-Host ""

# Navegar para a pasta do projeto
Set-Location "c:\Users\marciel\Desktop\sistema-orcamento"

# Configurar Git (se necessário)
Write-Host "⚙️ Configurando Git..." -ForegroundColor Yellow
$userName = git config --global user.name
if (-not $userName) {
    Write-Host ""
    Write-Host "Digite seu nome para o Git:" -ForegroundColor Cyan
    $name = Read-Host "Nome"
    git config --global user.name "$name"
}

$userEmail = git config --global user.email
if (-not $userEmail) {
    Write-Host ""
    Write-Host "Digite seu email para o Git:" -ForegroundColor Cyan
    $email = Read-Host "Email"
    git config --global user.email "$email"
}

Write-Host ""
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host "   Nome: $(git config --global user.name)" -ForegroundColor Gray
Write-Host "   Email: $(git config --global user.email)" -ForegroundColor Gray
Write-Host ""

# Verificar se já é um repositório Git
if (Test-Path ".git") {
    Write-Host "⚠️ Repositório Git já existe." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Deseja reinicializar? (S/N)" -ForegroundColor Cyan
    $resposta = Read-Host
    if ($resposta -eq "S" -or $resposta -eq "s") {
        Remove-Item -Recurse -Force .git
        Write-Host "🗑️ Repositório anterior removido." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Deploy cancelado." -ForegroundColor Red
        pause
        exit
    }
}

# Inicializar repositório
Write-Host ""
Write-Host "🎯 Inicializando repositório Git..." -ForegroundColor Yellow
git init
Write-Host "✅ Repositório inicializado!" -ForegroundColor Green

# Adicionar arquivos
Write-Host ""
Write-Host "📁 Adicionando arquivos..." -ForegroundColor Yellow
Write-Host "   (Excluindo: .env, node_modules, logs)" -ForegroundColor Gray
git add .

# Verificar arquivos adicionados
Write-Host ""
Write-Host "📋 Arquivos que serão enviados:" -ForegroundColor Cyan
git status --short

# Criar commit
Write-Host ""
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Sistema de Orçamentos RCF v4.0"
Write-Host "✅ Commit criado!" -ForegroundColor Green

# Criar branch main
Write-Host ""
Write-Host "🌿 Criando branch main..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch main criada!" -ForegroundColor Green

# Adicionar remote
Write-Host ""
Write-Host "🔗 Conectando ao GitHub..." -ForegroundColor Yellow
git remote add origin https://github.com/refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS.git
Write-Host "✅ Repositório remoto adicionado!" -ForegroundColor Green

# Verificar remote
Write-Host ""
Write-Host "📡 Repositório remoto configurado:" -ForegroundColor Cyan
git remote -v

# Push para GitHub
Write-Host ""
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
Write-Host "   (Você pode precisar fazer login no GitHub)" -ForegroundColor Gray
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ ✅ ✅ DEPLOY CONCLUÍDO COM SUCESSO! ✅ ✅ ✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Seu código está no GitHub!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 Acesse:" -ForegroundColor Yellow
    Write-Host "   https://github.com/refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Verificar se todos os arquivos estão no repositório" -ForegroundColor Gray
    Write-Host "   2. Configurar deploy em produção (Vercel/Render/Railway)" -ForegroundColor Gray
    Write-Host "   3. Configurar variáveis de ambiente no servidor" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "   1. Verifique se o repositório existe no GitHub" -ForegroundColor Gray
    Write-Host "   2. Verifique suas credenciais do GitHub" -ForegroundColor Gray
    Write-Host "   3. Se o repo já existir, use:" -ForegroundColor Gray
    Write-Host "      git push -f origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Erro detalhado:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
