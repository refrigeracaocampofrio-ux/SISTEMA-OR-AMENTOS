# Script para iniciar o servidor em background
Write-Host "Iniciando servidor..." -ForegroundColor Green

# Para qualquer processo node rodando
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Inicia o servidor em background usando Start-Job
$job = Start-Job -ScriptBlock {
    Set-Location "C:\Users\marciel\Desktop\sistema-orcamento"
    npm start
}

Write-Host "Aguardando servidor iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verifica se está rodando
$nodeProcess = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "✅ Servidor rodando (PID: $($nodeProcess.Id))" -ForegroundColor Green
    Write-Host "📡 Acesse: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para parar: Get-Process -Name node | Stop-Process -Force" -ForegroundColor Gray
} else {
    Write-Host "❌ Servidor não iniciou. Verificando erros..." -ForegroundColor Red
    Receive-Job $job
}
