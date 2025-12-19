# 🚀 Deploy na HostGator - Sistema de Orçamentos

## ⚠️ IMPORTANTE: Verificar Tipo de Hospedagem

A **HostGator** oferece diferentes planos. Node.js **NÃO funciona** em hospedagem compartilhada tradicional.

### ✅ Opções Compatíveis:
- **VPS HostGator** (Recomendado)
- **Servidor Dedicado**
- **Cloud Hosting**

### ❌ NÃO Compatível:
- **Hospedagem Compartilhada** (Shared Hosting) - Apenas PHP/MySQL

---

## 📋 Pré-requisitos

- [x] Conta HostGator VPS ou superior
- [x] Acesso SSH ao servidor
- [x] MySQL database criado no cPanel
- [x] Domínio configurado (ex: campofrio.com.br)

---

## 🔧 MÉTODO 1: Deploy via SSH (VPS/Cloud)

### Passo 1: Conectar via SSH

```bash
# Conectar ao servidor HostGator
ssh usuario@seu-dominio.com.br
# ou
ssh usuario@ip-do-servidor
```

### Passo 2: Instalar Node.js

```bash
# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### Passo 3: Instalar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

### Passo 4: Clonar Repositório

```bash
# Ir para diretório web
cd /home/usuario/public_html

# Clonar do GitHub
git clone https://github.com/refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS.git
cd SISTEMA-OR-AMENTOS

# Instalar dependências
npm install
```

### Passo 5: Configurar Banco de Dados MySQL

**No cPanel da HostGator:**

1. Acesse **MySQL Databases**
2. Crie um novo database: `usuario_sistema_orcamento`
3. Crie um usuário MySQL
4. Adicione o usuário ao database com privilégios completos
5. Anote: host, database, user, password

**No servidor SSH:**

```bash
# Importar schema do banco
mysql -u usuario_banco -p usuario_sistema_orcamento < database/schema.sql

# Digite a senha quando solicitado
```

### Passo 6: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

**Cole este conteúdo (ajuste os valores):**

```env
# Database HostGator
DB_HOST=localhost
DB_USER=usuario_banco
DB_PASSWORD=senha_banco
DB_DATABASE=usuario_sistema_orcamento

# JWT
JWT_SECRET=chave_super_secreta_aleatoria_aqui_123456789

# Server
PORT=3000
NODE_ENV=production

# Email (opcional)
GMAIL_CLIENT_ID=seu_client_id
GMAIL_CLIENT_SECRET=seu_client_secret
GMAIL_REFRESH_TOKEN=seu_refresh_token
GMAIL_USER=seu@email.com
```

Salvar: `Ctrl+O` → Enter → `Ctrl+X`

### Passo 7: Iniciar Aplicação com PM2

```bash
# Iniciar aplicação
pm2 start backend/server.js --name sistema-orcamento

# Verificar status
pm2 status

# Ver logs
pm2 logs sistema-orcamento

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

### Passo 8: Configurar Nginx como Proxy Reverso

```bash
# Editar configuração Nginx
sudo nano /etc/nginx/sites-available/default
```

**Adicione este bloco:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 9: Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL grátis
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

---

## 🔧 MÉTODO 2: Deploy via cPanel (se disponível Node.js)

### Passo 1: Acessar cPanel

1. Login: `https://seu-dominio.com.br:2083`
2. Procure por **Setup Node.js App** ou **Application Manager**

### Passo 2: Criar Aplicação Node.js

1. Clique em **Create Application**
2. Configurações:
   - **Node.js version**: 18.x
   - **Application mode**: Production
   - **Application root**: `SISTEMA-OR-AMENTOS`
   - **Application URL**: `seu-dominio.com.br`
   - **Application startup file**: `backend/server.js`
   - **Passenger Port**: 3000

### Passo 3: Configurar Variáveis de Ambiente

No cPanel Node.js App:
1. Clique em **Environment Variables**
2. Adicione cada variável do `.env`:
   - `DB_HOST=localhost`
   - `DB_USER=usuario`
   - `DB_PASSWORD=senha`
   - etc.

### Passo 4: Deploy

```bash
# No terminal do cPanel ou SSH
cd ~/SISTEMA-OR-AMENTOS
npm install
```

Clique em **Restart** na interface do cPanel.

---

## 📊 Configuração do MySQL no cPanel

### Criar Database e Usuário

1. **MySQL Databases** no cPanel
2. **Create New Database**: `sistema_orcamento`
3. **Add New User**: criar usuário e senha forte
4. **Add User to Database**: adicionar com ALL PRIVILEGES

### Importar Schema

**Opção 1: Via phpMyAdmin**
1. Acesse **phpMyAdmin** no cPanel
2. Selecione o database criado
3. Clique em **Import**
4. Upload do arquivo `database/schema.sql`
5. Clique em **Go**

**Opção 2: Via SSH**
```bash
mysql -u usuario -p database_name < database/schema.sql
```

---

## 🔐 Segurança

### Configurar Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Proteger Arquivos Sensíveis

```bash
# Permissões corretas
chmod 600 .env
chmod 700 backend/
```

### Backup Automático

```bash
# Criar script de backup
nano ~/backup-db.sh
```

**Conteúdo:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u usuario -p'senha' database_name > ~/backups/backup_$DATE.sql
find ~/backups -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Tornar executável
chmod +x ~/backup-db.sh

# Agendar com cron (diário às 3h)
crontab -e
# Adicionar linha:
0 3 * * * ~/backup-db.sh
```

---

## 🚨 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs sistema-orcamento

# Verificar porta
netstat -tulpn | grep 3000

# Reiniciar
pm2 restart sistema-orcamento
```

### Erro de conexão MySQL

```bash
# Testar conexão
mysql -u usuario -p -h localhost database_name

# Verificar se MySQL está rodando
sudo systemctl status mysql
```

### Erro 502 Bad Gateway

```bash
# Verificar se app está rodando
pm2 status

# Verificar logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Permissões negadas

```bash
# Corrigir permissões
sudo chown -R $USER:$USER ~/SISTEMA-OR-AMENTOS
chmod -R 755 ~/SISTEMA-OR-AMENTOS
```

---

## 📝 Comandos Úteis

```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs sistema-orcamento --lines 100

# Reiniciar aplicação
pm2 restart sistema-orcamento

# Parar aplicação
pm2 stop sistema-orcamento

# Atualizar código do GitHub
cd ~/SISTEMA-OR-AMENTOS
git pull origin main
npm install
pm2 restart sistema-orcamento

# Verificar uso de recursos
pm2 monit
```

---

## 🔄 Atualizar Aplicação

### Método Automático (com Git)

```bash
cd ~/SISTEMA-OR-AMENTOS
git pull origin main
npm install
pm2 restart sistema-orcamento
```

### Criar Script de Atualização

```bash
nano ~/update-app.sh
```

**Conteúdo:**
```bash
#!/bin/bash
cd ~/SISTEMA-OR-AMENTOS
git pull origin main
npm install
pm2 restart sistema-orcamento
echo "✅ Aplicação atualizada!"
```

```bash
chmod +x ~/update-app.sh
# Executar: ~/update-app.sh
```

---

## 💰 Custos Estimados HostGator

- **VPS Snappy 2000**: ~R$ 59,99/mês
  - 2 GB RAM
  - 2 Core CPU
  - 120 GB SSD
  - **Suficiente para este app**

- **VPS Snappy 4000**: ~R$ 109,99/mês
  - 4 GB RAM
  - 2 Core CPU
  - 165 GB SSD
  - **Recomendado para produção**

---

## ✅ Checklist de Deploy

- [ ] VPS/Cloud HostGator contratado
- [ ] SSH configurado e testado
- [ ] Node.js 18.x instalado
- [ ] PM2 instalado
- [ ] MySQL database criado
- [ ] Schema do banco importado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Aplicação iniciada com PM2
- [ ] Nginx configurado como proxy
- [ ] SSL/HTTPS configurado
- [ ] Domínio apontando para servidor
- [ ] Backup automático configurado
- [ ] Firewall configurado
- [ ] Testado em produção

---

## 🆘 Suporte HostGator

- **Chat**: https://www.hostgator.com.br/
- **Ticket**: Área do Cliente → Suporte
- **Telefone**: (11) 4858-0288
- **WhatsApp**: (11) 95943-7481

---

## 🎯 Resultado Final

Após concluir todos os passos:

✅ **Aplicação rodando 24/7**
✅ **Acesso via**: `https://seu-dominio.com.br`
✅ **SSL/HTTPS ativo**
✅ **Auto-restart em caso de falha**
✅ **Backup automático**
✅ **Logs centralizados**

---

**🎉 Seu sistema está ONLINE e em PRODUÇÃO!**
