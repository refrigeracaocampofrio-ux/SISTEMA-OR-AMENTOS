# ❌ ERRO: HTTP 500 ao Carregar Agendamentos

## Problema
Quando tenta acessar a aba "Agendamentos" no dashboard, apareça o erro:
```
HTTP 500: Internal Server Error
```

## Causa
A tabela `agendamentos` não existe no banco de dados MySQL.

## Solução Rápida

### Opção 1: Usar o Script Node.js (Recomendado)

1. Abra um terminal PowerShell na pasta do projeto
2. Execute:
```powershell
node criar-tabela-agendamentos-auto.js
```

**IMPORTANTE**: Se pedir senha, digite a senha do MySQL que você definiu durante a instalação.

### Opção 2: Executar Manualmente no MySQL Workbench

1. Abra **MySQL Workbench**
2. Conecte ao seu MySQL com o usuário `root`
3. Abra o arquivo: `EXECUTAR_ISTO_NO_MYSQL.sql`
4. Aperte `Ctrl+Enter` para executar
5. Recarregue a página do navegador

### Opção 3: Usar MySQL CLI

```bash
cd C:\Users\marciel\Desktop\sistema-orcamento
type EXECUTAR_ISTO_NO_MYSQL.sql | "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -h localhost sistema_orcamento
```

Quando pedir, digite a senha do MySQL.

## Se Esqueceu a Senha do MySQL

Se você não lembra a senha de `root`:

### Windows - Resetar Senha do MySQL

1. **Parar o serviço MySQL**:
```powershell
Stop-Service MySQL95 -Force
```

2. **Iniciar sem validação**:
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables
```

3. **Conectar sem senha** (em outro terminal):
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -h localhost
```

4. **Resetar a senha**:
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
EXIT;
```

5. **Parar mysqld** (Ctrl+C no primeiro terminal)

6. **Reiniciar o serviço**:
```powershell
Start-Service MySQL95
```

## Configurar no .env

Edite o arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=sistema_orcamento
```

Depois execute o script novamente.

## Verificar Depois

Depois de criar a tabela, recarregue o navegador e a aba "Agendamentos" deve aparecer normalmente.

Se continuar com erro, verifique:
- ✓ MySQL está rodando (MySQL95 service)
- ✓ Banco `sistema_orcamento` existe
- ✓ Arquivo `.env` tem credenciais corretas
- ✓ Servidor Node.js está rodando na porta 3000
