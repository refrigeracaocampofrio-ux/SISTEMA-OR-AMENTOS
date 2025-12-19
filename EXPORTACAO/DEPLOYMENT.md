# Sistema de Orçamentos e Ordens de Serviço - Guia de Deployment

## 📋 Estrutura do Projeto

```
├── backend/                  # Servidor Node.js/Express
│   ├── config/              # Configurações
│   ├── controllers/         # Lógica de negócio
│   ├── middleware/          # Middlewares (autenticação, validação)
│   ├── models/              # Modelos de dados
│   ├── routes/              # Rotas da API
│   ├── services/            # Serviços (email, PDF, autenticação)
│   └── server.js            # Arquivo principal
├── frontend/                # Arquivos HTML/CSS/JS (stático)
├── database/                # Scripts SQL
│   └── schema.sql          # Schema do banco de dados
├── package.json             # Dependências do projeto
└── .env.example            # Variáveis de ambiente (exemplo)
```

## 🚀 Como Fazer Deploy

### 1. Pré-requisitos
- Node.js v14+ instalado
- MySQL 5.7+ instalado e rodando
- Acesso a servidor/hospedagem (VPS, cPanel, etc.)

### 2. Preparar o Servidor

#### No cPanel (Hospedagem Compartilhada):
1. Fazer upload dos arquivos via FTP/File Manager
2. Entrar em "Setup Node.js App"
3. Configurar a porta (ex: 8080)
4. Definir "Application Root" como a pasta do projeto

#### Em VPS/Dedicado:
```bash
# Clonar ou fazer upload do projeto
cd /home/seu-usuario/seu-dominio

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

### 3. Configurar Banco de Dados

#### Via phpMyAdmin (cPanel):
1. Acessar phpMyAdmin
2. Criar novo banco: `sistema_orcamento`
3. Importar arquivo `database/schema.sql`
4. Criar usuário MySQL com permissões

#### Via Linha de Comando:
```bash
mysql -u root -p < database/schema.sql
```

### 4. Configurar Variáveis de Ambiente (.env)

Copiar `.env.example` para `.env` e preencher:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql
DB_NAME=sistema_orcamento

# Servidor
PORT=3000
NODE_ENV=production

# Autenticação
JWT_SECRET=gere-uma-chave-aleatoria-longa-aqui

# Email (escolher um provider)
MAIL_PROVIDER=smtp
EMAIL_FROM=seu-email@gmail.com
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app-google
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google Auth (Opcional)
GOOGLE_CLIENT_ID=seu_id_aqui
GOOGLE_CLIENT_SECRET=seu_secret_aqui
```

### 5. Instalar Dependências

```bash
npm install
```

Isso instala apenas as dependências de produção listadas em `package.json`.

### 6. Iniciar o Servidor

#### Desenvolvimento:
```bash
npm start
```

#### Produção (com PM2):
```bash
npm install -g pm2
pm2 start backend/server.js --name "sistema-orcamento"
pm2 startup
pm2 save
```

#### Com Supervisor (cPanel):
Criar arquivo `/etc/supervisor/conf.d/sistema-orcamento.conf`:
```
[program:sistema-orcamento]
directory=/home/seu-usuario/seu-dominio
command=/usr/bin/node backend/server.js
autostart=true
autorestart=true
startsecs=10
stopwaitsecs=10
stdout_logfile=/home/seu-usuario/seu-dominio/logs/out.log
stderr_logfile=/home/seu-usuario/seu-dominio/logs/err.log
```

### 7. Configurar Domínio

#### Com Nginx (Reverse Proxy):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Com Apache (cPanel):
Usar .htaccess com mod_rewrite para direcionar para Node.js

### 8. SSL/HTTPS

```bash
# Com Let's Encrypt (Certbot)
sudo certbot certonly --webroot -w /home/seu-usuario/seu-dominio -d seu-dominio.com
```

## 📧 Configuração de Email

### Gmail (Recomendado):
1. Habilitar "Autenticação em 2 etapas" na conta Google
2. Gerar "Senha de app" (não é a senha normal)
3. Copiar a senha de app para `EMAIL_PASS` no `.env`

### Alternativas:
- **Resend**: `MAIL_PROVIDER=resend` + `RESEND_API_KEY`
- **SendGrid**: `MAIL_PROVIDER=sendgrid` + `SENDGRID_API_KEY`
- **SMTP Customizado**: Configurar `SMTP_HOST`, `SMTP_PORT`, etc.

## 🔍 Verificar se Está Funcionando

```bash
# Testar conexão
curl http://seu-dominio.com

# Ver logs
pm2 logs sistema-orcamento

# Ou no supervisor
tail -f /home/seu-usuario/seu-dominio/logs/out.log
```

## 🛠️ Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Connection refused" (Banco de dados)
- Verificar credenciais em `.env`
- Confirmar que MySQL está rodando
- Verificar porta: `mysql -u root -p -h localhost -e "SELECT 1"`

### Erro: "SMTP not working"
- Verificar credenciais de email
- Ativar "Acesso de apps menos seguros" (Gmail)
- Gerar "Senha de app" específica

### Porta 3000 já em uso
```bash
# Liberar porta
lsof -i :3000
kill -9 <PID>

# Ou usar porta diferente no .env
PORT=8080
```

## 📝 Manutenção

### Backup do Banco:
```bash
mysqldump -u seu_usuario -p sistema_orcamento > backup_$(date +%Y%m%d).sql
```

### Atualizar dependências:
```bash
npm update
```

### Monitorar performance:
```bash
pm2 monit
```

## 🔐 Segurança

- ✅ Manter `.env` fora do Git
- ✅ Usar HTTPS em produção
- ✅ Gerar JWT_SECRET aleatório forte
- ✅ Configurar CORS apropriadamente
- ✅ Usar senhas app do Gmail (não a senha principal)
- ✅ Manter Node.js e dependências atualizadas

## 📞 Suporte

Para problemas de deployment:
1. Verificar logs: `pm2 logs`
2. Testar conectividade: `npm test`
3. Revisar variáveis em `.env`
4. Consultar documentação oficial das dependências

---

**Última atualização**: Dezembro 2025
