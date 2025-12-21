#!/usr/bin/env pwsh
$ErrorActionPreference = "Continue"

Write-Host "🔧 Limpando configuração antiga..."
cd "C:\Users\marciel\Desktop\sistema-orcamento"
Remove-Item -Path ".vercel" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🚀 Fazendo deploy em produção..."

# Respostas para os prompts
$responses = @'
.
yes
refrigeracaocampofrio-ux
yes
yes
'@

# Pipar respostas para vercel
$responses | vercel --prod

Write-Host "✅ Deploy completo!"
Write-Host "🌐 Acesse: https://sistema-orcamento-chi.vercel.app"
