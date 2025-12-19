# Script para configurar variáveis de ambiente na Vercel
Write-Host "🚀 Configurando variáveis de ambiente na Vercel..." -ForegroundColor Cyan

# Variáveis de ambiente
$envVars = @{
    "DB_HOST" = "aws-sa-east-1-1.pg.psdb.cloud"
    "DB_USER" = "postgres.ircl8da32x3r"
    "DB_PASSWORD" = "pscale_pw_UfAnJ7ubDEyAzDmRZnRjVbZr1zqJ7ew"
    "DB_DATABASE" = "sistema-orcamento"
    "JWT_SECRET" = "chave_secreta_super_segura_123456789"
    "NODE_ENV" = "production"
}

# Adicionar cada variável
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "✅ Adicionando $key..." -ForegroundColor Green
    echo $value | vercel env add $key production
}

Write-Host ""
Write-Host "✅ Todas as variáveis foram adicionadas!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Fazendo redeploy..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://sistema-or-amentos.vercel.app" -ForegroundColor Yellow
