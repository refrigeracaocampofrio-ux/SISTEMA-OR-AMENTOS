# ✅ Pre-Deployment Checklist

Use este checklist antes de fazer deploy em produção.

## 🔧 Ambiente Local (Antes de subir)

- [ ] Todos os testes passando: `npm test`
- [ ] Sem erros de lint: `npm run lint`
- [ ] .env configurado corretamente
- [ ] Banco de dados funcionando localmente
- [ ] Servidor iniciando sem erros: `npm start`
- [ ] Interface carregando: http://localhost:3000
- [ ] Login funcionando
- [ ] Todas as funcionalidades testadas

## 🌐 Preparação de Servidor

### Hospedagem
- [ ] Hospedagem contratada (VPS, cPanel, Heroku, etc)
- [ ] Node.js instalado no servidor
- [ ] MySQL/MariaDB instalado
- [ ] Acesso SSH/FTP ao servidor
- [ ] Domínio apontado para o servidor

### Segurança
- [ ] Certificado SSL obtido (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Portas adequadas abertas (80, 443, 3000)
- [ ] Sem acesso público a .env
- [ ] Banco de dados protegido por senha forte

## 📝 Configuração de Produção

### .env - Variáveis Críticas
- [ ] `DB_HOST` = IP/hostname correto
- [ ] `DB_USER` = Usuário MySQL seguro
- [ ] `DB_PASS` = Senha forte MySQL
- [ ] `DB_NAME` = Banco criado
- [ ] `JWT_SECRET` = String aleatória longa
- [ ] `NODE_ENV=production`
- [ ] `PORT` = Porta correta (3000 ou reverse proxy)

### Email
- [ ] `MAIL_PROVIDER` = Provider escolhido (smtp/resend/sendgrid)
- [ ] `EMAIL_FROM` = Email válido
- [ ] `EMAIL_USER` = Credenciais corretas
- [ ] `EMAIL_PASS` = Senha de app (se Gmail)
- [ ] Teste envio de email: acesse /email

### Google (Opcional)
- [ ] `GOOGLE_CLIENT_ID` = ID gerado
- [ ] `GOOGLE_CLIENT_SECRET` = Secret gerado
- [ ] URLs de callback configuradas no Google Cloud Console

## 🗄️ Banco de Dados

- [ ] Banco `sistema_orcamento` criado
- [ ] Schema importado: `schema.sql`
- [ ] Permissões MySQL configuradas
- [ ] Backup automático agendado
- [ ] Teste de conexão: `mysql -u user -p`

## 🚀 Deployment

### Instalação
```bash
npm install --production
```
- [ ] Dependências instaladas com sucesso
- [ ] Nenhuma vulnerabilidade crítica: `npm audit`

### Banco
```bash
mysql -u user -p < database/schema.sql
```
- [ ] Schema importado sem erros
- [ ] Tabelas criadas: 
  - [ ] clientes
  - [ ] usuarios
  - [ ] orcamentos
  - [ ] orcamento_itens
  - [ ] ordens_servico
  - [ ] estoque
  - [ ] movimentacao_estoque

### Inicialização
- [ ] Servidor inicia sem erros
- [ ] Conecta ao banco de dados
- [ ] Email configurado (ou aviso apropriado)
- [ ] Acesso via URL público funcionando

## 🧪 Testes em Produção

Após deploy, testar:

- [ ] Acesso ao site: seu-dominio.com
- [ ] Login página: /login.html
- [ ] Setup página: /setup.html (criar usuário)
- [ ] Dashboard carrega
- [ ] Criar cliente
- [ ] Criar orçamento
- [ ] Enviar orçamento por email
- [ ] Criar ordem de serviço
- [ ] Gerar PDF
- [ ] Controle de estoque
- [ ] Logout funciona

## 📊 Monitoramento

### PM2 (se usando)
```bash
pm2 status
pm2 logs
pm2 monit
```
- [ ] Processo rodando
- [ ] Sem erros nos logs
- [ ] CPU/memória normais

### Logs
- [ ] Acessível em /var/log/ ou pasta do projeto
- [ ] Rotação de logs configurada
- [ ] Erros sendo registrados

## 🔒 Segurança Final

- [ ] HTTPS/SSL ativo
- [ ] .env não acessível via web
- [ ] node_modules não servido publicamente
- [ ] CORS configurado apropriadamente
- [ ] Senhas não em logs
- [ ] Backup automático funcionando

## 📞 Documentação

- [ ] Instruções de acesso documentadas
- [ ] Credenciais seguras (não no email)
- [ ] Runbook de troubleshooting criado
- [ ] Plano de backup comunicado

## 🔄 Manutenção Contínua

Após deploy, com regularidade:

**Diariamente**
- [ ] Verificar logs de erro
- [ ] Monitorar performance

**Semanalmente**
- [ ] Verificar espaço em disco
- [ ] Testar funcionalidades principais

**Mensalmente**
- [ ] Atualizar dependências (`npm update`)
- [ ] Verificar vulnerabilidades (`npm audit`)
- [ ] Testar backup/restore

**Trimestralmente**
- [ ] Renovar certificados SSL
- [ ] Revisar logs de acesso
- [ ] Atualizar Node.js (se necessário)

## 📋 Rollback

Se algo der errado:

```bash
# Parar servidor
pm2 stop sistema-orcamento

# Reverter código (git)
git revert <commit>

# Restaurar banco (backup)
mysql -u user -p < backup.sql

# Reiniciar
pm2 start sistema-orcamento
```

- [ ] Backup anterior acessível
- [ ] Procedimento de rollback documentado
- [ ] Tempo de downtime aceitável para equipe

---

## ✨ Sucesso!

Se todos os itens foram marcados, seu sistema está pronto para produção! 🎉

**Próximos passos:**
1. Monitorar por 24-48h
2. Comunicar aos usuários
3. Documentar procedures
4. Planejar atualizações futuras

