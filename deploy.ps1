$ErrorActionPreference = "Continue"

Write-Host "Limpando configuracao antiga..."
cd "C:\Users\marciel\Desktop\sistema-orcamento"
Remove-Item -Path ".vercel" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Fazendo deploy em producao..."

$responses = ".`nyes`nrefrigeracaocampofrio-ux`nyes`nyes"
$responses | vercel --prod

Write-Host "Deploy completo!"
Write-Host "Acesse: https://sistema-orcamento-chi.vercel.app"
