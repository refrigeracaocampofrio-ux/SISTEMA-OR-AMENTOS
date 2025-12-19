# Script para ler .env do backend e configurar na Vercel
Write-Host "🚀 Configurando variáveis do backend/.env na Vercel..." -ForegroundColor Cyan

# Ler arquivo .env do backend
$envPath = "backend\.env"
if (-Not (Test-Path $envPath)) {
    Write-Host "❌ Arquivo $envPath não encontrado!" -ForegroundColor Red
    exit 1
}

# Ler e parsear o arquivo
$envContent = Get-Content $envPath -Raw
$lines = $envContent -split "`n"

# Variáveis a adicionar
$varsToAdd = @(
    "EMAIL_FROM",
    "MAIL_PROVIDER",
    "EMAIL_USER",
    "EMAIL_PASS",
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REDIRECT_URI",
    "GOOGLE_CLIENT_ID",
    "ADMIN_USER",
    "ADMIN_PASS"
)

# Extrair valores do .env
$envDict = @{}
foreach ($line in $lines) {
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envDict[$key] = $value
    }
}

# Adicionar cada variável na Vercel
foreach ($varName in $varsToAdd) {
    if ($envDict.ContainsKey($varName)) {
        $value = $envDict[$varName]
        Write-Host "✅ Adicionando $varName..." -ForegroundColor Green
        echo $value | vercel env add $varName production
    } else {
        Write-Host "⚠️  $varName não encontrado no .env" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Todas as variáveis foram adicionadas!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Fazendo redeploy..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://sistema-or-amentos.vercel.app" -ForegroundColor Yellow
