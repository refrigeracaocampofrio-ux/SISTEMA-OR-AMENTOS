param(
  [string]$ZipUrl = "https://github.com/planetscale/cli/releases/download/v0.268.0/pscale_0.268.0_windows_amd64.zip",
  [string]$Dest = "C:\Tools\pscale",
  [switch]$PersistPath
)

Write-Host "==> Baixando pscale amd64" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
$tmpZip = Join-Path $env:TEMP "pscale_windows_amd64.zip"
Invoke-WebRequest -Uri $ZipUrl -OutFile $tmpZip -UseBasicParsing

Expand-Archive -Path $tmpZip -DestinationPath $Dest -Force

# Renomeia binario se vier com nome longo
$exe = Get-ChildItem -Path $Dest -Filter "pscale*.exe" | Select-Object -First 1
if (-not $exe) {
  Write-Error "Nao encontrei executavel pscale no destino: $Dest"
  exit 1
}
if ($exe.Name -ne "pscale.exe") {
  Rename-Item -Path $exe.FullName -NewName "pscale.exe" -Force
}

# Ajusta PATH na sessao atual
$env:Path = "$Dest;$env:Path"

Write-Host "==> Testando pscale --version" -ForegroundColor Cyan
try {
  & "$Dest\pscale.exe" --version
} catch {
  Write-Error "Falha ao executar pscale: $_"
  exit 1
}

if ($PersistPath) {
  Write-Host "==> Gravando PATH permanente do usuario" -ForegroundColor Yellow
  $newPath = "$Dest;${env:PATH}"
  setx PATH $newPath | Out-Null
}

Write-Host "==> Pronto. Agora rode: pscale auth login" -ForegroundColor Green
