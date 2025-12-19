# ============================================
# Script para criar tabela de agendamentos
# ============================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CRIANDO TABELA DE AGENDAMENTOS          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$mySqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Verificar se mysql.exe existe
if (-not (Test-Path $mySqlPath)) {
    Write-Host "❌ ERRO: MySQL não encontrado em: $mySqlPath" -ForegroundColor Red
    Write-Host "📍 Verifique se MySQL Server está instalado na pasta correta" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔐 Digite a senha do usuário 'root' do MySQL:" -ForegroundColor Yellow

# Obter a senha
$senha = Read-Host -AsSecureString "Senha (deixe em branco se não houver)" 

# Converter para texto plano (realmente inseguro, mas necessário para a CLI)
$senhaTexto = ""
if ($senha.Length -gt 0) {
    $senhaTexto = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($senha))
}

Write-Host "`n⏳ Conectando ao MySQL..." -ForegroundColor Cyan

# Executar o script SQL
$sqlFile = "EXECUTAR_ISTO_NO_MYSQL.sql"

try {
    # Ler o arquivo SQL e pipe para mysql
    $sqlContent = Get-Content $sqlFile -Raw
    
    if ($senhaTexto) {
        $sqlContent | & $mySqlPath -u root -p$senhaTexto -h localhost sistema_orcamento
    } else {
        $sqlContent | & $mySqlPath -u root -h localhost sistema_orcamento
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ ✅ ✅ SUCESSO! ✅ ✅ ✅" -ForegroundColor Green
        Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
        Write-Host "  1️⃣  Volte para o navegador" -ForegroundColor White
        Write-Host "  2️⃣  Pressione F5 para recarregar a página" -ForegroundColor White
        Write-Host "  3️⃣  Clique em 'Agendamentos' no menu" -ForegroundColor White
        Write-Host "`nTudo deve funcionar agora!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ ERRO ao executar script SQL" -ForegroundColor Red
        Write-Host "Verifique:" -ForegroundColor Yellow
        Write-Host "  • MySQL está rodando?" -ForegroundColor White
        Write-Host "  • Banco 'sistema_orcamento' existe?" -ForegroundColor White
        Write-Host "  • Usuário e senha estão corretos?" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ ERRO: $_" -ForegroundColor Red
}
