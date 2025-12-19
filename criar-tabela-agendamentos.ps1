# Script para criar tabela de agendamentos no MySQL
# Execute este arquivo com: .\criar-tabela-agendamentos.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CRIANDO TABELA DE AGENDAMENTOS NO MYSQL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Caminho do arquivo SQL
$sqlFile = "c:\Users\marciel\Desktop\sistema-orcamento\database\agendamentos.sql"

# Ler o conteúdo do SQL
$sqlContent = @"
USE sistema_orcamento;

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  endereco TEXT NOT NULL,
  complemento VARCHAR(255),
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(10),
  data_agendamento DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  tipo_servico VARCHAR(255),
  descricao_problema TEXT,
  status ENUM('pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_data_agendamento ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_email ON agendamentos(email);
"@

Write-Host "SQL a ser executado:" -ForegroundColor Yellow
Write-Host $sqlContent -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Pedir senha do MySQL
$senha = Read-Host "Digite a senha do MySQL (root)" -AsSecureString
$senhaClear = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($senha)
)

Write-Host ""
Write-Host "Executando SQL no MySQL..." -ForegroundColor Yellow

# Salvar SQL temporário
$tempSql = "$env:TEMP\agendamentos_temp.sql"
$sqlContent | Out-File -FilePath $tempSql -Encoding UTF8

try {
    # Tentar executar com mysql.exe
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    
    if (-not (Test-Path $mysqlPath)) {
        $mysqlPath = "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
    }
    
    if (-not (Test-Path $mysqlPath)) {
        Write-Host "MySQL não encontrado no caminho padrão." -ForegroundColor Red
        Write-Host ""
        Write-Host "COPIE E EXECUTE MANUALMENTE:" -ForegroundColor Yellow
        Write-Host "1. Abra MySQL Workbench" -ForegroundColor White
        Write-Host "2. Conecte ao banco 'sistema_orcamento'" -ForegroundColor White
        Write-Host "3. Cole e execute o SQL mostrado acima" -ForegroundColor White
        Write-Host ""
        pause
        exit
    }
    
    # Executar MySQL
    $arguments = "-u root -p$senhaClear < `"$tempSql`""
    Start-Process -FilePath $mysqlPath -ArgumentList $arguments -Wait -NoNewWindow
    
    Write-Host ""
    Write-Host "✅ Tabela criada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora:" -ForegroundColor Cyan
    Write-Host "1. Volte para o navegador" -ForegroundColor White
    Write-Host "2. Pressione F5 para recarregar" -ForegroundColor White
    Write-Host "3. Clique em 'Agendamentos' novamente" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao executar:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "EXECUTE MANUALMENTE:" -ForegroundColor Yellow
    Write-Host "1. Abra MySQL Workbench" -ForegroundColor White
    Write-Host "2. Conecte ao banco" -ForegroundColor White
    Write-Host "3. Execute o SQL acima" -ForegroundColor White
    Write-Host ""
} finally {
    # Limpar arquivo temporário
    if (Test-Path $tempSql) {
        Remove-Item $tempSql -Force
    }
}

Write-Host ""
pause
