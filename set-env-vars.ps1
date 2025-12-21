$ErrorActionPreference = "Stop"

# Dados do PlanetScale - USE ARQUIVO .env OU VARIÁVEIS DE AMBIENTE
# NÃO USE SENHAS HARDCODED AQUI!
$dbVars = @{
    "DB_HOST" = "aws.connect.psdb.cloud"
    "DB_USER" = "eji0fpzw0nap5776opmw"
    # DB_PASSWORD deve ser configurado via .env ou Vercel dashboard
    "DB_DATABASE" = "sistema-rcf"
    "DB_PORT" = "3306"
    "GOOGLE_SHEETS_ENABLED" = "true"
    "SHEETS_SPREADSHEET_ID" = "1oUdAipChezu45OcWdl2xviZbpMWcNvs5xZjVL44pj9M"
}

Write-Host "🔐 Configurando variáveis de ambiente no Vercel..."

foreach ($varName in $dbVars.Keys) {
    $varValue = $dbVars[$varName]
    Write-Host "  ➕ Adicionando $varName..."
    
    $output = vercel env add $varName production 2>&1
    
    if ($output -like "*already exists*") {
        Write-Host "    ✓ $varName já existe"
    } else {
        Write-Host "    ✓ $varName adicionado"
    }
}

Write-Host ""
Write-Host "✅ Todas as variáveis configuradas!"
Write-Host "🔄 Aguarde o novo deploy..."

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# Deploy automático
Write-Host ""
Write-Host "🚀 Iniciando deploy..."
vercel --prod --yes

Write-Host ""
Write-Host "✨ Pronto! Sistema online em: https://sistema-orcamento-chi.vercel.app"
