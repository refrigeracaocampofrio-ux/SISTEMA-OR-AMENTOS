# 🚀 Deploy na Vercel - Sistema de Orçamentos

## ⚡ Vercel: A Forma Mais Fácil de Fazer Deploy!

A **Vercel** é a plataforma ideal para fazer deploy do seu sistema:

### ✅ Vantagens:
- ⚡ **Deploy AUTOMÁTICO** do GitHub (push e já está online!)
- 🆓 **100% GRATUITO** (plano Hobby)
- 🌍 **CDN Global** (site rápido em qualquer lugar do mundo)
- 🔒 **HTTPS Automático** (SSL grátis)
- 📊 **Analytics Incluído**
- 💰 **Custo Total: R$ 0,00/mês**

---

## 📋 Pré-requisitos

- [x] Código no GitHub ✅ (já configurado!)
- [ ] Conta Vercel (vamos criar - 1 minuto)
- [ ] Banco MySQL Externo (vamos configurar - PlanetScale grátis)

---

## 🎯 MÉTODO 1: Deploy via Interface Web (Mais Fácil)

### Passo 1: Criar Conta na Vercel

1. Acesse: **https://vercel.com/signup**
2. Clique em **Continue with GitHub**
3. Autorize a Vercel a acessar seus repositórios

### Passo 2: Importar Projeto do GitHub

1. No dashboard da Vercel, clique em **Add New** → **Project**
2. Selecione o repositório: **SISTEMA-OR-AMENTOS**
3. Clique em **Import**

### Passo 3: Configurar Projeto

**Framework Preset**: Selecione **Other**

**Root Directory**: `.` (raiz do projeto)

**Build Settings**:
- **Build Command**: `npm install`
- **Output Directory**: `.` 
- **Install Command**: `npm install`

### Passo 4: Configurar Variáveis de Ambiente

Clique em **Environment Variables** e adicione:

```
DB_HOST=seu-mysql-host.com
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=sistema_orcamento
JWT_SECRET=chave_super_secreta_aleatoria_123456789
PORT=3000
NODE_ENV=production
```

⚠️ **Importante**: Você precisa de um MySQL externo (veja opções abaixo)

### Passo 5: Deploy!

1. Clique em **Deploy**
2. Aguarde 2-3 minutos
3. ✅ **Pronto!** Seu app está no ar!

Acesse: `https://seu-projeto.vercel.app`

---

## 🎯 MÉTODO 2: Deploy via CLI (Mais Controle)

### Passo 1: Instalar Vercel CLI

```powershell
# Instalar globalmente
npm install -g vercel

# Verificar instalação
vercel --version
```

### Passo 2: Fazer Login

```powershell
# Login na Vercel
vercel login
```

Digite seu email e confirme no link enviado.

### Passo 3: Deploy

```powershell
# Navegar para a pasta do projeto
cd c:\Users\marciel\Desktop\sistema-orcamento

# Deploy
vercel
```

Responda as perguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **Project name?** → sistema-orcamentos
- **Directory?** → ./

Aguarde o deploy...

✅ **Deploy concluído!** URL: `https://sistema-orcamentos.vercel.app`

### Passo 4: Configurar Variáveis de Ambiente

```powershell
# Adicionar variáveis via CLI
vercel env add DB_HOST
# Digite o valor quando solicitado

vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_DATABASE
vercel env add JWT_SECRET
vercel env add PORT
vercel env add NODE_ENV
```

### Passo 5: Re-deploy com as Variáveis

```powershell
# Deploy em produção
vercel --prod
```

---

## 🗄️ Opções para Banco MySQL

### Opção 1: **PlanetScale** (Recomendado - MySQL Grátis)

**Vantagens**: 
- ✅ Gratuito até 5GB
- ✅ Serverless
- ✅ Integração perfeita com Vercel

**Setup:**
1. Acesse: **https://planetscale.com**
2. Crie conta (login com GitHub)
3. **New Database** → Nome: `sistema-orcamento`
4. Copie as credenciais de conexão
5. Cole nas variáveis de ambiente da Vercel

**Conectar:**
```env
DB_HOST=aws.connect.psdb.cloud
DB_USER=xxxxx
DB_PASSWORD=pscale_pw_xxxxx
DB_DATABASE=sistema-orcamento
```

### Opção 2: **Railway** (MySQL + Deploy)

1. Acesse: **https://railway.app**
2. **New Project** → **Provision MySQL**
3. Copie as credenciais
4. Use nas variáveis da Vercel

**Custo**: ~$5/mês

### Opção 3: **Aiven** (MySQL Gratuito)

1. Acesse: **https://aiven.io**
2. Cadastre-se
3. **Create Service** → **MySQL**
4. Plano gratuito: 1 node, 1GB RAM
5. Copie credenciais

---

## 📝 Configurar vercel.json (Otimização)

Crie na raiz do projeto:

```powershell
# Criar arquivo
New-Item -Path "vercel.json" -ItemType File
```

**Conteúdo:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Commitar e enviar:**

```powershell
git add vercel.json
git commit -m "Add Vercel configuration"
git push origin main
```

A Vercel irá re-deploiar automaticamente!

---

## 🔧 Configurar Domínio Personalizado

### Usar Domínio Próprio (ex: campofrio.com.br)

1. No dashboard da Vercel, vá em **Settings** → **Domains**
2. Clique em **Add**
3. Digite seu domínio: `campofrio.com.br`
4. Siga as instruções para configurar DNS

**Registros DNS a adicionar:**

```
Tipo: A
Nome: @
Valor: 76.76.21.21

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

Aguarde propagação DNS (até 48h, geralmente 15min)

✅ **HTTPS automático** após configuração!

---

## � Auto-Deploy do GitHub

### Como Funciona:

1. Você faz alterações no código localmente
2. Commita e faz push:
   ```powershell
   git add .
   git commit -m "Nova funcionalidade"
   git push origin main
   ```
3. **Vercel detecta automaticamente** e faz deploy!
4. Em 2 minutos seu site está atualizado!

### Configurar Branches:

- **main** → Produção (`sistema-orcamentos.vercel.app`)
- **dev** → Preview (`sistema-orcamentos-dev.vercel.app`)

---

## 📊 Monitoramento e Logs

### Ver Logs em Tempo Real:

**Via Web:**
1. Dashboard Vercel → Seu projeto
2. **Deployments** → Último deploy
3. **View Function Logs**

**Via CLI:**
```powershell
vercel logs
```

### Analytics:

1. Dashboard → Projeto → **Analytics**
2. Veja:
   - Requisições por segundo
   - Tempo de resposta
   - Erros
   - Tráfego por região

---

## 🚨 Troubleshooting

### Erro: "Module not found"

```powershell
# Verificar package.json
cat package.json

# Instalar dependências localmente
npm install

# Re-deploy
vercel --prod
```

### Erro: "Cannot connect to database"

1. Verifique variáveis de ambiente no dashboard
2. Teste conexão MySQL:
   ```powershell
   # Localmente
   node -e "require('./backend/config/db.js')"
   ```

### Erro 500

```powershell
# Ver logs detalhados
vercel logs --follow
```

### Build Falhou

1. Verifique **Build Logs** no dashboard
2. Corrija erros localmente
3. Push novamente

---

## � Planos e Custos

### **Hobby (Gratuito)**
- ✅ Deploy ilimitados
- ✅ HTTPS automático
- ✅ 100GB bandwidth/mês
- ✅ Perfeito para começar

### **Pro ($20/mês)**
- ✅ Tudo do Hobby
- ✅ Analytics avançado
- ✅ Domínios ilimitados
- ✅ Suporte prioritário
- ✅ Mais performance

### **Enterprise (Custom)**
- Para grandes empresas
- SLA garantido

**👉 Comece com Hobby (gratuito)!**

---

## ⚡ Deploy Completo - Script Automatizado

Crie o arquivo `deploy-vercel.ps1`:

```powershell
# Criar arquivo
New-Item -Path "deploy-vercel.ps1" -ItemType File
```

**Conteúdo:**

```powershell
Write-Host "🚀 Deploy Vercel - Sistema Orçamentos" -ForegroundColor Cyan
Write-Host ""

# Verificar se está logado
Write-Host "📝 Verificando login Vercel..." -ForegroundColor Yellow
vercel whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Não está logado. Fazendo login..." -ForegroundColor Red
    vercel login
}

Write-Host ""
Write-Host "✅ Logado com sucesso!" -ForegroundColor Green
Write-Host ""

# Deploy para produção
Write-Host "🚀 Fazendo deploy para produção..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse seu app em:" -ForegroundColor Cyan
vercel ls

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```

**Executar:**
```powershell
.\deploy-vercel.ps1
```

---

## � Comandos Úteis

```powershell
# Ver projetos
vercel ls

# Ver domínios
vercel domains ls

# Ver variáveis de ambiente
vercel env ls

# Remover projeto
vercel remove nome-projeto

# Ver logs em tempo real
vercel logs --follow

# Deploy específico
vercel --prod

# Abrir projeto no navegador
vercel --open
```

---

## ✅ Checklist de Deploy

- [ ] Código no GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] MySQL externo configurado (PlanetScale/Railway)
- [ ] Deploy realizado com sucesso
- [ ] App testado e funcionando
- [ ] HTTPS ativo
- [ ] (Opcional) Domínio personalizado configurado
- [ ] Auto-deploy configurado

---

## 🎯 Resultado Final

Após o deploy na Vercel:

✅ **App rodando 24/7**
✅ **URL**: `https://sistema-orcamentos.vercel.app`
✅ **HTTPS automático**
✅ **Auto-deploy** do GitHub
✅ **Global CDN** (super rápido)
✅ **Analytics** incluído
✅ **Zero configuração de servidor**

---

## 🆘 Suporte

- **Documentação**: https://vercel.com/docs
- **Discord**: https://vercel.com/discord
- **GitHub**: https://github.com/vercel/vercel

---

## � Próximos Passos

1. ✅ Deploy concluído
2. 📧 Configurar envio de emails
3. 📊 Monitorar analytics
4. 🔄 Fazer updates via GitHub
5. 💰 Considerar upgrade para Pro (se necessário)

**� Parabéns! Seu sistema está ONLINE na Vercel!**
