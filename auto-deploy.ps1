# Script automático para adicionar todas as variáveis na Vercel
Write-Host "🚀 Adicionando variáveis de ambiente na Vercel..." -ForegroundColor Cyan
Write-Host ""

# Variáveis do backend/.env
$vars = @(
    @{ name = "DB_HOST"; value = "aws-sa-east-1-1.pg.psdb.cloud" },
    @{ name = "DB_USER"; value = "postgres.ircl8da32x3r" },
    @{ name = "DB_PASSWORD"; value = "pscale_pw_UfAnJ7ubDEyAzDmRZnRjVbZr1zqJ7ew" },
    @{ name = "DB_DATABASE"; value = "sistema-orcamento" },
    @{ name = "DB_NAME"; value = "sistema-orcamento" },
    @{ name = "MAIL_PROVIDER"; value = "gmail" },
    @{ name = "EMAIL_FROM"; value = "refrigeracaocampofrio@gmail.com" },
    @{ name = "ADMIN_USER"; value = "marciel" },
    @{ name = "ADMIN_PASS"; value = "142514" },
    @{ name = "JWT_SECRET"; value = "change_this_secret" },
    @{ name = "GOOGLE_CLIENT_ID"; value = "1086725866046-rjtbhquhrn4ddhb5vdbj093rqvole9it.apps.googleusercontent.com" },
    @{ name = "GMAIL_CLIENT_ID"; value = "1086725866046-fc1a3gvmubsmt7jf4qukg4ca6ifimucd.apps.googleusercontent.com" },
    @{ name = "GMAIL_CLIENT_SECRET"; value = "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" },
    @{ name = "GMAIL_REDIRECT_URI"; value = "https://sistema-or-amentos.vercel.app/email/google/callback" },
    @{ name = "NODE_ENV"; value = "production" },
    @{ name = "PORT"; value = "3000" }
)

# Adicionar cada variável
$count = 0
foreach ($var in $vars) {
    $count++
    Write-Host "[$count/16] ✅ Adicionando $($var.name)..." -ForegroundColor Green
    echo $var.value | vercel env add $var.name production | Out-Null
}

Write-Host ""
Write-Host "✅ TODAS AS 16 VARIÁVEIS ADICIONADAS!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 FAZENDO REDEPLOY..." -ForegroundColor Cyan
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "✅✅✅ DEPLOY CONCLUÍDO! ✅✅✅" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse: https://sistema-or-amentos.vercel.app" -ForegroundColor Yellow
Write-Host ""
