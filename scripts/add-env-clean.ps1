param([string]$Name, [string]$Value)

# Criar arquivo temporário com o valor
$tempFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempFile -Value $Value -NoNewline

try {
    # Usar o arquivo temporário: primeira linha "yes", segunda linha do arquivo
    $input = "yes`n" + (Get-Content $tempFile -Raw)
    $input | npx vercel env add $Name production
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}
