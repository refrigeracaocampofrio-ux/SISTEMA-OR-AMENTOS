param(
  [string]$DbPassword
)

$ErrorActionPreference = 'Stop'

# Valores do banco: tenta ler arquivos/host.txt e arquivos/user.txt; senão, usa defaults MySQL
# PlanetScale MySQL usa subdomínio "connect.psdb.cloud"
$defaultHost = 'aws-sa-east-1-1.connect.psdb.cloud'
$defaultUser = ''
$hostFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'arquivos/host.txt'
$userFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'arquivos/user.txt'
$DbHost = (Test-Path $hostFile) ? ((Get-Content $hostFile -Raw).Trim()) : $defaultHost
$DbUser = (Test-Path $userFile) ? ((Get-Content $userFile -Raw).Trim()) : $defaultUser
if (-not $DbUser) { Write-Host "Atenção: defina arquivos/user.txt com usuário MySQL do PlanetScale" -ForegroundColor Yellow }

$envMap = @(
  @{ Name = 'DB_HOST';      Value = $DbHost }
  @{ Name = 'DB_USER';      Value = $DbUser }
  @{ Name = 'DB_DATABASE';  Value = 'sistema_orcamento' }
  @{ Name = 'DB_NAME';      Value = 'sistema_orcamento' }
  @{ Name = 'DB_PORT';      Value = '3306' }
)

function Get-VercelCmd {
  # Prefer the Windows cmd shim
  $pathsToTry = @(
    (Join-Path $env:APPDATA 'npm/vercel.cmd'),
    (Join-Path $env:USERPROFILE 'AppData/Roaming/npm/vercel.cmd'),
    'vercel.cmd',
    'vercel'
  )
  foreach ($p in $pathsToTry) {
    $cmd = Get-Command $p -ErrorAction SilentlyContinue
    if ($cmd) { return @{ File=$cmd.Source; UseCmd=$false } }
  }
  # fallback to npx vercel
  return @{ File='npx'; UseCmd=$true }
}

$VercelCmd = Get-VercelCmd

function Run-Vercel([string]$args, [string]$inputValue) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  if ($VercelCmd.UseCmd) {
    $psi.FileName = 'cmd.exe'
    $psi.Arguments = "/c npx vercel $args"
  } else {
    if ($VercelCmd.File -like '*.ps1') {
      $psi.FileName = 'powershell.exe'
      $psi.Arguments = "-ExecutionPolicy Bypass -File `"$($VercelCmd.File)`" $args"
    } else {
      $psi.FileName = $VercelCmd.File
      $psi.Arguments = $args
    }
  }
  $psi.RedirectStandardInput = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $proc = [System.Diagnostics.Process]::Start($psi)
  if ($inputValue) {
    $proc.StandardInput.WriteLine($inputValue)
  }
  $proc.StandardInput.Close()
  $stdout = $proc.StandardOutput.ReadToEnd()
  $stderr = $proc.StandardError.ReadToEnd()
  $proc.WaitForExit()
  return @{ Exit=$proc.ExitCode; Out=$stdout; Err=$stderr }
}

function Ensure-VercelEnv([string]$name, [string]$value) {
  Write-Host "[vercel] set $name" -ForegroundColor Cyan
  $rm = Run-Vercel "env rm $name production --yes" $null
  if ($rm.Exit -ne 0 -and ($rm.Err -notmatch 'does not exist')) {
    Write-Host ("Aviso ao remover {0}: {1}" -f $name, $rm.Err) -ForegroundColor Yellow
  }
  $add = Run-Vercel "env add $name production" $value
  Write-Host $add.Out
  if ($add.Exit -ne 0) {
    Write-Error "Failed to set $name. ExitCode=$($add.Exit). Error=$($add.Err)"
  }
}

# Garantir senha: 1) param, 2) arquivos/password.txt, 3) prompt
if (-not $DbPassword) {
  $pwdFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'arquivos/password.txt'
  if (Test-Path $pwdFile) {
    $DbPassword = (Get-Content $pwdFile -Raw).Trim()
    Write-Host "Usando senha de $pwdFile" -ForegroundColor Yellow
  }
}
if (-not $DbPassword) {
  $secure = Read-Host 'Digite DB_PASSWORD (não será salvo)' -AsSecureString
  $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

Ensure-VercelEnv -name 'DB_PASSWORD' -value $DbPassword

foreach ($item in $envMap) {
  Ensure-VercelEnv -name $item.Name -value $item.Value
}

Write-Host 'Concluído. Execute: vercel --prod' -ForegroundColor Green
