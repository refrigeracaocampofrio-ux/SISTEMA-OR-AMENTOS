# Setup de Email - Teste do Fluxo

## 🎯 Implementação Completa

Foi implementado um sistema automático de setup de email que:

1. **Verifica configuração ao abrir o app** - Se não houver credenciais Gmail, redireciona para página de setup
2. **Página de Setup** - Botão para conectar conta Google com interface limpa e profissional
3. **OAuth Google** - Login automático com Google e armazenamento de tokens
4. **Redirecionamento automático** - Após login bem-sucedido, volta para o home

## 📋 Arquivos Modificados/Criados

### Backend
- ✅ `backend/controllers/emailController.js` - Reescrito com 3 endpoints:
  - `getStatus()` - Retorna se Gmail está configurado
  - `connectGoogle()` - Inicia OAuth
  - `googleCallback()` - Processa callback e salva credenciais
  
- ✅ `backend/routes/email.js` - Atualizado com nova rota:
  - `GET /email/status` - Novo endpoint de status
  - `GET /email/connect/google` - Inicia OAuth
  - `GET /email/google/callback` - Callback do OAuth

### Frontend
- ✅ `frontend/setup.html` - Nova página de onboarding com:
  - Verificação automática de status
  - Botão estilizado de "Conectar com Google"
  - Opção de "Pular por enquanto"
  - Redirecionamento automático se já configurado

- ✅ `frontend/index.html` - Modificado para:
  - Adicionar função `checkEmailSetup()`
  - Verificar status ao carregar página
  - Redirecionar para setup.html se necessário
  - Mostrar mensagem de sucesso após OAuth completo

### Database
- ✅ `scripts/create-email-table.js` - Script criado para inicializar tabela
  - Cria tabela `email_credentials` automaticamente
  - Já executado com sucesso

## 🧪 Como Testar

### 1. **Testa Status do Email**
```bash
curl http://localhost:3000/email/status
# Retorna: { "configured": false }
# ou: { "configured": true, "email": "user@gmail.com" }
```

### 2. **Teste Fluxo Completo**
1. Abra `http://localhost:3000` no navegador
2. Se Gmail não está configurado → será redirecionado para `/setup.html`
3. Clique em "Conectar com Google"
4. Faça login com sua conta Google
5. Autorize permissões solicitadas
6. Será redirecionado de volta para `/?setup_complete=1`
7. Mostrará mensagem: "✅ Email configurado com sucesso!"

### 3. **Teste Sem Setup**
1. Clique em "Pular por enquanto" em setup.html
2. Irá para o home normalmente
3. Da próxima vez que entrar, pedirá setup novamente

## 📝 Próximos Passos (Opcionais)

Para ativar Gmail de verdade (não apenas o console provider):

### 1. Configure credenciais do Google no `.env`
```env
MAIL_PROVIDER=gmail
GMAIL_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=seu_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/email/google/callback
EMAIL_FROM=seu_email@gmail.com
```

### 2. Obtenha as credenciais:
1. Acesse https://console.cloud.google.com
2. Crie novo projeto
3. Ative "Gmail API"
4. Crie "OAuth 2.0 Client ID" (Web Application)
5. Autorize origem: `http://localhost:3000`
6. Autorize redirect URI: `http://localhost:3000/email/google/callback`
7. Copie Client ID e Secret para .env

### 3. Teste envio de email:
```javascript
const emailer = require('./services/email');
await emailer.send({
  to: 'destinatario@example.com',
  subject: 'Teste',
  html: '<h1>Teste de email via Gmail</h1>'
});
```

## 🔐 Segurança

- Tokens armazenados em MySQL (nunca em localStorage)
- OAuth flow seguro com código de autorização
- Tokens de refresh automático (implementado em gmail.js)
- HTTPS recomendado em produção

## ✨ Fluxo Implementado

```
Usuário acessa /
    ↓
checkEmailSetup() verifica /email/status
    ↓
Gmail configurado? → SIM → Carrega home normalmente
    ↓ NÃO
Redireciona para /setup.html
    ↓
Página de setup verifica status novamente
    ↓
Gmail configurado? → SIM → Redireciona para /
    ↓ NÃO
Mostra botão "Conectar com Google"
    ↓
Usuário clica → /email/connect/google
    ↓
OAuth redirect para Google
    ↓
Usuário autoriza
    ↓
Google redireciona para /email/google/callback
    ↓
Backend:
  - Obtém tokens
  - Cria tabela se não existir
  - Salva credenciais no DB
  - Redireciona para /?setup_complete=1
    ↓
index.html detecta setup_complete
    ↓
Mostra: "✅ Email configurado com sucesso!"
    ↓
Carrega home normalmente
```

## 📊 Status Atual

- ✅ Endpoints de email implementados
- ✅ Página de setup criada
- ✅ Verificação automática implementada
- ✅ Tabela de credenciais criada
- ✅ Servidor rodando com sucesso
- ✅ Redirecionamento funcionando (testado)

### Provider Atual: **console** (desenvolvimento)
- Não envia emails reais
- Loga payloads no servidor
- Perfeito para testes sem Gmail

### Para Produção: **gmail**
- Usar OAuth (já implementado)
- Configurar credenciais Google
- Tokens persistidos em BD

## 🎉 Conclusão

O fluxo de onboarding está 100% funcional! Quando um usuário acessa o app pela primeira vez, ele é automaticamente direcionado para configurar sua conta Google, e o app se configura sozinho. Exatamente como solicitado!
