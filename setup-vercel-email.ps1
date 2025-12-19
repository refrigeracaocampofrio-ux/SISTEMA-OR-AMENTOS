# Script para configurar variáveis de EMAIL na Vercel
Write-Host "🚀 Configurando variáveis de EMAIL na Vercel..." -ForegroundColor Cyan

# Variáveis de email
$emailVars = @{
    "MAIL_PROVIDER" = "smtp"
    "EMAIL_USER" = "seu_email@gmail.com"
    "EMAIL_PASS" = "sua_senha"
    "EMAIL_FROM" = "seu_email@gmail.com"
    "SMTP_USER" = "seu_email@gmail.com"
    "SMTP_PASS" = "sua_senha"
    "SMTP_FROM" = "seu_email@gmail.com"
}

# Adicionar cada variável
foreach ($key in $emailVars.Keys) {
    $value = $emailVars[$key]
    Write-Host "✅ Adicionando $key..." -ForegroundColor Green
    echo $value | vercel env add $key production
}

Write-Host ""
Write-Host "✅ Todas as variáveis de email foram adicionadas!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Fazendo redeploy..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://sistema-or-amentos.vercel.app" -ForegroundColor Yellow
