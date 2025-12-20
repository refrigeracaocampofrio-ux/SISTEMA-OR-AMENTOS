param(
  [string]$EnvFilePath = "$(Join-Path (Get-Location) ".env.vercel.production")"
)

$ErrorActionPreference = 'Stop'

function Get-VercelCmd {
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
  if ($args -like 'env add *') {
    $proc.StandardInput.WriteLine('yes')
    $proc.StandardInput.WriteLine($inputValue)
  } elseif ($args -like 'env update *') {
    $proc.StandardInput.WriteLine($inputValue)
  } elseif ($inputValue) {
    $proc.StandardInput.WriteLine($inputValue)
  }
  $proc.StandardInput.Close()
  $stdout = $proc.StandardOutput.ReadToEnd()
  $stderr = $proc.StandardError.ReadToEnd()
  $proc.WaitForExit()
  return @{ Exit=$proc.ExitCode; Out=$stdout; Err=$stderr }
}

function Get-ProductionEnvNames {
  $res = Run-Vercel 'env ls production' $null
  if ($res.Exit -ne 0) { throw "vercel env ls failed: $($res.Err)" }
  $names = @()
  foreach ($line in ($res.Out -split "`r?`n")) {
    if ($line -match '^\s*([A-Z0-9_]+)\s+Encrypted') {
      $names += $matches[1]
    }
  }
  return $names
}

function Remove-AllProductionEnvs {
  $names = Get-ProductionEnvNames
  Write-Host ("Encontradas {0} variáveis em Production" -f $names.Count) -ForegroundColor Yellow
  foreach ($n in $names) {
    Write-Host ("[vercel] rm {0}" -f $n) -ForegroundColor Cyan
    $rm = Run-Vercel "env rm $n production --yes" $null
    if ($rm.Exit -ne 0) { Write-Host ("Aviso ao remover {0}: {1}" -f $n, $rm.Err) -ForegroundColor Red }
  }
}

function Ensure-VercelEnv([string]$name, [string]$value) {
  Write-Host "[vercel] add $name" -ForegroundColor Cyan
  $add = Run-Vercel "env add $name production" $value
  Write-Host $add.Out
  if ($add.Exit -ne 0) { throw ("Failed to add {0}: {1}" -f $name, $add.Err) }
}

function Load-EnvFile([string]$path) {
  if (-not (Test-Path $path)) { throw "Arquivo de env não encontrado: $path" }
  $dict = @{}
  foreach ($line in (Get-Content $path)) {
    if ($line -match '^\s*#') { continue }
    if ($line -match '^\s*$') { continue }
    if ($line -match '^(.*?)=(.*)$') {
      $k = $matches[1].Trim()
      $v = $matches[2].Trim()
      $dict[$k] = $v
    }
  }
  return $dict
}

Write-Host 'Apagando todas as variáveis de Production…' -ForegroundColor Magenta
Remove-AllProductionEnvs

Write-Host "Lendo envs de: $EnvFilePath" -ForegroundColor Green
$envs = Load-EnvFile -path $EnvFilePath

foreach ($key in $envs.Keys) {
  Ensure-VercelEnv -name $key -value $envs[$key]
}

Write-Host 'Concluído. Execute: vercel --prod' -ForegroundColor Green
