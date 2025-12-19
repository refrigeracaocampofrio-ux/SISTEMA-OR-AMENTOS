# 🚀 Quick Start - Sistema de Orçamentos

## Opção 1: Linux/Mac

```bash
# 1. Entrar na pasta
cd /caminho/do/projeto

# 2. Dar permissão ao script
chmod +x init-production.sh

# 3. Executar
./init-production.sh

# 4. Editar .env
nano .env

# 5. Importar banco (já tendo MySQL rodando)
mysql -u root -p < database/schema.sql

# 6. Iniciar
npm start
```

## Opção 2: Windows

```cmd
# 1. Abrir CMD na pasta do projeto

# 2. Executar script
init-production.bat

# 3. Editar .env (abrir com editor de texto)

# 4. Importar banco (já tendo MySQL rodando)
mysql -u root -p < database/schema.sql

# 5. Iniciar
npm start
```

## Opção 3: Manual (Qualquer SO)

```bash
# 1. Instalar dependências
npm install

# 2. Copiar arquivo de ambiente
cp .env.example .env
# Editar .env com seus dados

# 3. Criar banco de dados
mysql -u root -p < database/schema.sql

# 4. Iniciar servidor
npm start

# 5. Abrir navegador
# http://localhost:3000
```

## ⚙️ Configurar .env (Essencial)

Abra o arquivo `.env` e preencha:

```env
# Banco de Dados (OBRIGATÓRIO)
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=sistema_orcamento

# Porta (opcional, padrão 3000)
PORT=3000

# JWT Secret (gere uma string aleatória)
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria

# Email (SMTP - Gmail recomendado)
MAIL_PROVIDER=smtp
EMAIL_FROM=seu-email@gmail.com
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-google
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### ℹ️ Como gerar Senha de App Google:
1. Ir para https://myaccount.google.com/apppasswords
2. Selecionar "Mail" e "Windows Computer" (ou seu SO)
3. Copiar a senha gerada
4. Colar em `EMAIL_PASS` e `SMTP_PASS`

## 🎯 Primeiro Acesso

1. Abrir: **http://localhost:3000**
2. Ir para: **http://localhost:3000/setup.html**
3. Criar usuário admin
4. Fazer login
5. Começar a usar!

## 📋 Checklist de Configuração

- [ ] Node.js instalado (`node -v`)
- [ ] npm instalado (`npm -v`)
- [ ] MySQL rodando
- [ ] `.env` preenchido corretamente
- [ ] Banco importado: `schema.sql`
- [ ] Dependências instaladas: `npm install`
- [ ] Servidor rodando: `npm start`
- [ ] Acesso em: http://localhost:3000

## 🆘 Problemas Comuns

### "Cannot find module 'express'"
```bash
npm install
```

### "Error: connect ECONNREFUSED 127.0.0.1:3306"
- MySQL não está rodando
- Credenciais incorretas em `.env`
- DB_NAME incorreto

### "SMTP Error: connect ECONNREFUSED"
- Email não configurado (opcional no início)
- Credenciais incorretas

### "Port 3000 already in use"
- Mudar PORT em `.env`
- Ou matar processo: `lsof -i :3000 | kill -9 PID`

## 📚 Documentação Completa

Veja **DEPLOYMENT.md** para:
- Deploy em produção
- Configuração de domínio
- SSL/HTTPS
- Email avançado
- Troubleshooting detalhado

## 🎓 Estrutura do Projeto

```
EXPORTACAO/
├── backend/              # Servidor (Node.js)
│   ├── config/          # Configurações
│   ├── controllers/     # Lógica
│   ├── middleware/      # Middlewares
│   ├── models/          # Dados
│   ├── routes/          # Rotas API
│   ├── services/        # Email, PDF, etc
│   └── server.js        # Arquivo principal
├── frontend/            # Interface (HTML/CSS/JS)
├── database/            # Banco de dados
│   └── schema.sql      # Estrutura
├── package.json         # Dependências
├── .env.example        # Variáveis exemplo
├── README.md           # Este arquivo
├── DEPLOYMENT.md       # Deploy em produção
└── init-production.*   # Scripts de inicialização
```

## 🔐 Segurança Básica

✅ Mude `JWT_SECRET` para algo aleatório  
✅ Nunca commita `.env` no Git  
✅ Use HTTPS em produção  
✅ Senhas de app do Gmail (não a senha principal)  

## 📞 Próximos Passos

1. ✅ Servidor rodando
2. 📝 Criar usuário em /setup.html
3. 👥 Adicionar clientes
4. 📋 Criar orçamentos
5. 🚀 Fazer deploy em produção (ver DEPLOYMENT.md)

---

**Dúvidas?** Veja DEPLOYMENT.md ou revise `.env` e logs.
