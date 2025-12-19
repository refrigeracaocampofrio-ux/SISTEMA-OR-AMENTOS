# Sistema de Orçamentos e Ordens de Serviço

Sistema web completo para gerenciar orçamentos, ordens de serviço e estoque.

## ✨ Funcionalidades

- 👤 **Autenticação**: Login seguro com JWT
- 📋 **Orçamentos**: Criar, editar e aprovar orçamentos
- 🔧 **Ordens de Serviço**: Gerenciar ordens com acompanhamento de status
- 📦 **Estoque**: Controlar peças e movimentação
- 👥 **Clientes**: Cadastro e gerenciamento de clientes
- 📧 **Email**: Envio automático de orçamentos e ordens
- 📄 **PDF**: Geração de PDFs para impressão
- 📱 **Dashboard**: Visão geral de pendências e status

## 🏗️ Arquitetura

**Backend**: Node.js + Express + MySQL  
**Frontend**: HTML5 + CSS3 + JavaScript (sem framework)  
**Autenticação**: JWT  
**Email**: SMTP/Gmail/Resend/SendGrid  

## 📦 Instalação Rápida

### 1. Dependências
```bash
npm install
```

### 2. Configurar Banco
```bash
mysql < database/schema.sql
```

### 3. Variáveis de Ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 4. Iniciar
```bash
npm start
```

Acesse: **http://localhost:3000**

## 📚 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `backend/server.js` | Servidor Express principal |
| `backend/routes/` | Rotas da API |
| `backend/controllers/` | Lógica de negócio |
| `backend/models/` | Modelos de dados |
| `backend/services/` | Serviços (email, PDF, etc) |
| `frontend/index.html` | Interface principal |
| `database/schema.sql` | Schema do banco |

## 🔐 Credenciais Padrão

Após setup, criar usuário via `/setup.html`

## 🚀 Deployment

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções completas de:
- Hospedagem compartilhada (cPanel)
- VPS/Servidor dedicado
- Configuração de domínio
- SSL/HTTPS
- Email em produção

## 🛠️ Variáveis de Ambiente

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=sistema_orcamento

# Servidor
PORT=3000
NODE_ENV=production

# Segurança
JWT_SECRET=chave-secreta-aleatoria

# Email
MAIL_PROVIDER=smtp
EMAIL_FROM=seu-email@gmail.com
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app
```

## 📞 Troubleshooting

**Erro ao conectar no banco?**
- Verificar credenciais em `.env`
- Confirmar MySQL rodando

**Email não funciona?**
- Gerar "Senha de app" no Gmail (não usar senha principal)
- Verificar `MAIL_PROVIDER` correto

**Porta já em uso?**
- Mudar `PORT` no `.env`
- Ou matar processo: `lsof -i :3000 | kill -9`

## 📄 Licença

ISC

---

**Pronto para deploy?** Veja [DEPLOYMENT.md](./DEPLOYMENT.md)
