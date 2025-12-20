param(
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$BaseUrl = "https://sistema-or-amentos.vercel.app"
)

$uri = "$BaseUrl/admin/run-schema?token=$Token"
Write-Host "==> POST $uri" -ForegroundColor Cyan
try {
  $resp = Invoke-RestMethod -Method Post -Uri $uri -TimeoutSec 180
  $resp | ConvertTo-Json -Depth 5
} catch {
  Write-Error "Falha ao executar schema: $_"
  if ($_.Exception.Response -ne $null) {
    try {
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $body = $reader.ReadToEnd()
      Write-Host $body
    } catch {}
  }
  exit 1
}
