# 📦 Conteúdo da Pasta EXPORTACAO

Esta pasta contém todos os arquivos necessários para fazer deploy do Sistema de Orçamentos em um servidor/hospedagem.

## 📂 Estrutura Completa

```
EXPORTACAO/
├── 📄 README.md                      ← Leia primeiro (visão geral)
├── 📄 QUICKSTART.md                  ← Começar rápido (instruções passo a passo)
├── 📄 DEPLOYMENT.md                  ← Deploy em produção (hospedagem, domínio, etc)
├── 📄 PRE-DEPLOYMENT-CHECKLIST.md    ← Checklist antes de subir
├── 📄 package.json                   ← Dependências do projeto
├── 📄 .env.example                   ← Template de variáveis de ambiente
├── 📄 .gitignore                     ← Arquivos a ignorar no Git
├── 🔧 init-production.sh             ← Script de inicialização (Linux/Mac)
├── 🔧 init-production.bat            ← Script de inicialização (Windows)
│
├── 📁 backend/                       ← Servidor Node.js
│   ├── server.js                    ← Arquivo principal
│   ├── config/
│   │   ├── checkEnv.js             ← Verificação de variáveis
│   │   └── db.js                   ← Pool de conexão MySQL
│   ├── controllers/                ← Lógica de negócio
│   │   ├── authClientController.js
│   │   ├── clientesController.js
│   │   ├── debugController.js
│   │   ├── emailController.js
│   │   ├── estoqueController.js
│   │   ├── orcamentosController.js
│   │   └── ordensController.js
│   ├── middleware/                 ← Middlewares
│   │   ├── auth.js                ← JWT
│   │   ├── errorHandler.js        ← Tratamento de erros
│   │   └── validation.js          ← Validação de dados
│   ├── models/                    ← Modelos de dados
│   │   ├── clientes.js
│   │   ├── estoque.js
│   │   ├── movimentacaoEstoque.js
│   │   ├── orcamentoItens.js
│   │   ├── orcamentos.js
│   │   └── ordens.js
│   ├── routes/                    ← Rotas da API
│   │   ├── auth.js
│   │   ├── authClient.js
│   │   ├── clientes.js
│   │   ├── debug.js
│   │   ├── email.js
│   │   ├── estoque.js
│   │   ├── orcamentos.js
│   │   └── ordens_servico.js
│   └── services/                  ← Serviços (email, PDF, etc)
│       ├── auth.js               ← JWT
│       ├── db.js                 ← MySQL
│       ├── email.js              ← Configuração email
│       ├── emailTemplates.js     ← Templates HTML
│       ├── pdfGenerator.js       ← Geração de PDF
│       └── emailProviders/       ← Provedores de email
│           ├── gmail.js          ← Gmail API
│           ├── resend.js         ← Resend
│           └── sendgrid.js       ← SendGrid
│
├── 📁 frontend/                    ← Interface HTML/CSS/JS
│   ├── index.html                 ← Dashboard principal
│   ├── login.html                 ← Tela de login
│   ├── setup.html                 ← Configuração inicial
│   ├── email.html                 ← Testes de email
│   ├── test-email.html            ← Testes de email
│   ├── ordens.html                ← Ordens de serviço
│   └── js/                        ← Scripts JavaScript (se houver)
│
└── 📁 database/                    ← Banco de dados
    └── schema.sql                 ← Script SQL para criar tabelas
```

## 🚀 Como Começar

### 1️⃣ Leia Primeiro
Comece lendo nesta ordem:
1. **README.md** - Visão geral do projeto
2. **QUICKSTART.md** - Instruções rápidas de inicialização
3. **DEPLOYMENT.md** - Para fazer deploy em produção

### 2️⃣ Instalação Local (Teste)
```bash
# Windows
init-production.bat

# Linux/Mac
chmod +x init-production.sh
./init-production.sh
```

### 3️⃣ Deploy em Produção
Siga as instruções em **DEPLOYMENT.md** para:
- Hospedagem compartilhada (cPanel)
- VPS/Servidor dedicado
- Configuração de domínio
- SSL/HTTPS
- Email

## 📋 Checklist de Arquivos

### Arquivos de Documentação ✅
- [x] README.md - Visão geral
- [x] QUICKSTART.md - Começar rápido
- [x] DEPLOYMENT.md - Deploy em produção
- [x] PRE-DEPLOYMENT-CHECKLIST.md - Verificação final
- [x] ARQUIVO-CONTEUDO.md - Este arquivo

### Configuração ✅
- [x] package.json - Dependências npm
- [x] .env.example - Variáveis de ambiente
- [x] .gitignore - Arquivos para ignorar

### Scripts de Inicialização ✅
- [x] init-production.sh - Linux/Mac
- [x] init-production.bat - Windows

### Backend (Node.js) ✅
- [x] backend/server.js
- [x] backend/config/ (2 arquivos)
- [x] backend/controllers/ (7 arquivos)
- [x] backend/middleware/ (3 arquivos)
- [x] backend/models/ (6 arquivos)
- [x] backend/routes/ (8 arquivos)
- [x] backend/services/ (5 arquivos + 3 providers email)

### Frontend (HTML/CSS/JS) ✅
- [x] frontend/index.html
- [x] frontend/login.html
- [x] frontend/setup.html
- [x] frontend/email.html
- [x] frontend/test-email.html
- [x] frontend/ordens.html
- [x] frontend/js/ (pasta)

### Banco de Dados ✅
- [x] database/schema.sql

## 🎯 Próximos Passos

### Desenvolvimento/Testes
```bash
npm install
# Editar .env
npm start
```

### Deploy Produção
1. Ler **DEPLOYMENT.md**
2. Preparar servidor (cPanel/VPS)
3. Subir arquivos via FTP/Git
4. Executar **init-production.sh** ou **init-production.bat**
5. Importar banco: `schema.sql`
6. Configurar domínio e SSL
7. Usar checklist **PRE-DEPLOYMENT-CHECKLIST.md**

## 📦 Dependências (Principais)

Veja `package.json` para lista completa:
- **express** - Framework web
- **mysql2** - Banco de dados
- **jsonwebtoken** - Autenticação
- **bcryptjs** - Hash de senhas
- **nodemailer** - Email SMTP
- **pdfkit** - Geração de PDF
- **cors** - CORS middleware
- **googleapis** - Gmail API
- **dotenv** - Variáveis de ambiente

## 🔐 Segurança

**Antes de fazer deploy:**
- [ ] Mudar `JWT_SECRET` em `.env`
- [ ] Criar senha forte para MySQL
- [ ] Gerar novo `GOOGLE_CLIENT_ID/SECRET` em Google Cloud
- [ ] Usar "Senha de App" do Gmail (não a senha principal)
- [ ] Ativar HTTPS/SSL
- [ ] Não commitar `.env` no Git

## 💾 Backup

**Importante:** Fazer backup regular
```bash
mysqldump -u user -p sistema_orcamento > backup.sql
```

## 📞 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Cannot find module" | `npm install` |
| Banco não conecta | Verificar `.env` e MySQL |
| Email não funciona | Gerar "Senha de app" no Gmail |
| Porta em uso | Mudar `PORT` em `.env` |
| Permissão negada | `chmod +x init-production.sh` (Linux) |

## 📚 Documentação Completa

Veja cada arquivo para mais detalhes:
- **README.md** - Funcionalidades e setup
- **QUICKSTART.md** - Passo a passo rápido
- **DEPLOYMENT.md** - Deploy detalhado
- **PRE-DEPLOYMENT-CHECKLIST.md** - Verificação final

## ✨ Resumo

Esta pasta exportada contém **TUDO** que você precisa para fazer deploy do sistema em um servidor de produção. Siga as instruções em **QUICKSTART.md** para começar!

**Versão:** 1.0.0  
**Data:** Dezembro 2025  
**Status:** ✅ Pronto para production
