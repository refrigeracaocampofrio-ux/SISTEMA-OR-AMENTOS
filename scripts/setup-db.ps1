param(
  [string]$BaseUrl = "https://sistema-or-amentos.vercel.app",
  [string]$AdminToken,
  [string]$DBHost,
  [string]$DBUser,
  [string]$DBPassword,
  [string]$DBDatabase,
  [int]$DBPort = 3306
)

function Try-AdminCheckAndImport {
  param([string]$BaseUrl, [string]$AdminToken)
  try {
    Write-Host "==> Checking DB connectivity via $BaseUrl/admin/db-check" -ForegroundColor Cyan
    $check = Invoke-RestMethod -Method Get -Uri "$BaseUrl/admin/db-check" -TimeoutSec 60
    if ($check.success -eq $true) {
      Write-Host "==> DB check OK" -ForegroundColor Green
    } else {
      Write-Warning "DB check failed: $($check | ConvertTo-Json -Depth 5)"
    }
  } catch {
    Write-Warning "DB check error: $($_.Exception.Message)"
  }

  if ([string]::IsNullOrEmpty($AdminToken)) {
    Write-Warning "ADMIN token not provided; skipping admin import route."
    return $false
  }
  try {
    $uri = "$BaseUrl/admin/run-schema?token=$AdminToken"
    Write-Host "==> Import via POST $uri" -ForegroundColor Cyan
    $resp = Invoke-RestMethod -Method Post -Uri $uri -TimeoutSec 300
    if ($resp.success -eq $true) {
      Write-Host (ConvertTo-Json $resp -Depth 5) -ForegroundColor Green
      return $true
    } else {
      Write-Warning "Admin route returned failure: $($resp | ConvertTo-Json -Depth 5)"
      return $false
    }
  } catch {
    Write-Warning "Admin route error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
      try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host $body
      } catch {}
    }
    return $false
  }
}

function Run-LocalNodeImport {
  param([string]$DBHost, [string]$DBUser, [string]$DBPassword, [string]$DBDatabase, [int]$DBPort)

  if ([string]::IsNullOrEmpty($DBHost) -or [string]::IsNullOrEmpty($DBUser) -or [string]::IsNullOrEmpty($DBPassword) -or [string]::IsNullOrEmpty($DBDatabase)) {
    Write-Warning "Missing DB parameters for local import. Trying to load from backend/.env or prompt..."

    $envFile = "C:\Users\marciel\Desktop\sistema-orcamento\backend\.env"
    if (Test-Path $envFile) {
      Write-Host "==> Reading $envFile" -ForegroundColor Cyan
      $lines = Get-Content -Path $envFile
      foreach ($line in $lines) {
        if ($line -match "^DB_HOST=(.*)$") { $DBHost = $Matches[1] }
        elseif ($line -match "^DB_USER=(.*)$") { $DBUser = $Matches[1] }
        elseif ($line -match "^DB_PASSWORD=(.*)$") { $DBPassword = $Matches[1] }
        elseif ($line -match "^DB_PASS=(.*)$") { $DBPassword = $Matches[1] }
        elseif ($line -match "^DB_DATABASE=(.*)$") { $DBDatabase = $Matches[1] }
        elseif ($line -match "^DB_NAME=(.*)$") { $DBDatabase = $Matches[1] }
        elseif ($line -match "^DB_PORT=(.*)$") { $DBPort = [int]$Matches[1] }
      }
    }

    if ([string]::IsNullOrEmpty($DBHost)) { $DBHost = Read-Host "Informe DB_HOST (ex.: aws-sa-east-1-1.psdb.cloud)" }
    if ([string]::IsNullOrEmpty($DBUser)) { $DBUser = Read-Host "Informe DB_USER (usuario do PlanetScale)" }
    if ([string]::IsNullOrEmpty($DBPassword)) { $DBPassword = Read-Host "Informe DB_PASSWORD" }
    if ([string]::IsNullOrEmpty($DBDatabase)) { $DBDatabase = Read-Host "Informe DB_DATABASE (ex.: sistema-orcamento)" }
  }

  Write-Host "==> Ensuring mysql2 is installed" -ForegroundColor Cyan
  try {
    npm ls mysql2 --depth=0 | Out-Null
  } catch {
    npm install mysql2 --no-audit --no-fund | Out-Null
  }

  $env:DB_HOST = $DBHost
  $env:DB_USER = $DBUser
  $env:DB_PASSWORD = $DBPassword
  $env:DB_DATABASE = $DBDatabase
  $env:DB_PORT = "$DBPort"
  $outFile = Join-Path $env:TEMP "schema_run_result.json"
  $env:SCHEMA_RUN_OUTPUT = $outFile

  Write-Host "==> Running local import via Node" -ForegroundColor Cyan
  node "C:\Users\marciel\Desktop\sistema-orcamento\scripts\mysql-run-schema.js" | Out-Null
  if (-not (Test-Path $outFile)) {
    Write-Error "Result file not found: $outFile"
    return $false
  }
  $jsonText = Get-Content -Path $outFile -Raw
  $json = $jsonText | ConvertFrom-Json
  if ($json.success -eq $true) {
    Write-Host (ConvertTo-Json $json -Depth 5) -ForegroundColor Green
    Write-Host "==> Local import completed" -ForegroundColor Green
    return $true
  } else {
    Write-Error "Local import failed: $jsonText"
    return $false
  }
}

# Orquestração
Write-Host "==> Starting DB setup" -ForegroundColor Cyan
$adminOk = Try-AdminCheckAndImport -BaseUrl $BaseUrl -AdminToken $AdminToken
if ($adminOk) {
  Write-Host "==> Done via admin route" -ForegroundColor Green
  exit 0
}

Write-Host "==> Falling back to local import" -ForegroundColor Yellow
$localOk = Run-LocalNodeImport -DBHost $DBHost -DBUser $DBUser -DBPassword $DBPassword -DBDatabase $DBDatabase -DBPort $DBPort
if ($localOk) { exit 0 } else { exit 1 }
