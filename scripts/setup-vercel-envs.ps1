#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) '.env.vercel.production'

if (-not (Test-Path $envFile)) {
    Write-Error "Arquivo não encontrado: $envFile"
    exit 1
}

# Função para adicionar env usando arquivo temporário
function Add-VercelEnvSafe([string]$Name, [string]$Value) {
    Write-Host "[ADD] $Name" -ForegroundColor Cyan
    
    # Criar arquivo temporário com ambas as respostas
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        # Escrever: linha 1 = yes, linha 2 = valor
        @"
yes
$Value
"@ | Set-Content $tempFile -NoNewline
        
        # Executar comando redirecionando stdin do arquivo
        cmd /c "npx vercel env add $Name production < `"$tempFile`""
        
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao adicionar $Name"
        }
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

# Remover todas as variáveis DB_*
Write-Host "Removendo variáveis DB_* existentes..." -ForegroundColor Yellow
$varsToRemove = @('DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_NAME', 'DB_PORT')
foreach ($var in $varsToRemove) {
    Write-Host "[RM] $var" -ForegroundColor DarkGray
    vercel env rm $var production --yes 2>&1 | Out-Null
}

Start-Sleep -Seconds 2

# Ler .env e adicionar variáveis
Write-Host "Adicionando variáveis de $envFile..." -ForegroundColor Green
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*$') { return }
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()
        if ($key -match '^(DB_|ADMIN_)') {
            $envVars[$key] = $val
        }
    }
}

foreach ($key in $envVars.Keys | Sort-Object) {
    Add-VercelEnvSafe -Name $key -Value $envVars[$key]
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅ Concluído! Execute: vercel --prod" -ForegroundColor Green
