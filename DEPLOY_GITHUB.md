# 📤 Deploy para GitHub - SISTEMA-ORÇAMENTOS

## Pré-requisitos
1. ✅ Instalar Git: https://git-scm.com/download/win
2. ✅ Ter conta GitHub
3. ✅ Criar repositório: `refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS`

## Passo 1: Instalar Git
```powershell
# Baixar e instalar Git for Windows
# https://git-scm.com/download/win
```

## Passo 2: Configurar Git (primeira vez)
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## Passo 3: Inicializar Repositório
```powershell
cd c:\Users\marciel\Desktop\sistema-orcamento

# Inicializar git
git init

# Adicionar todos os arquivos (exceto .env e node_modules)
git add .

# Primeiro commit
git commit -m "Initial commit - Sistema de Orçamentos RCF"
```

## Passo 4: Conectar com GitHub
```powershell
# Adicionar repositório remoto
git remote add origin https://github.com/refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS.git

# Verificar remote
git remote -v
```

## Passo 5: Enviar para GitHub
```powershell
# Criar branch main e fazer push
git branch -M main
git push -u origin main
```

---

## 🚨 IMPORTANTE: Arquivos que NÃO serão enviados
- ✅ `.env` (credenciais secretas)
- ✅ `node_modules/` (dependências - serão instaladas depois)
- ✅ `*.log` (logs)
- ✅ `.vscode/` (configurações locais)

---

## 🔧 Para Deploy em Servidor Real (após push)

### Opção 1: Vercel (Recomendado para Node.js)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Opção 2: Render.com
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente (copiar do .env)
3. Deploy automático

### Opção 3: Railway
1. Conectar repositório GitHub
2. Adicionar MySQL database
3. Configurar variáveis de ambiente
4. Deploy automático

---

## 📝 Checklist de Deploy
- [ ] `.gitignore` configurado (já está ✅)
- [ ] `.env` NÃO incluído no repo
- [ ] `package.json` com scripts de build
- [ ] README.md atualizado
- [ ] Instruções de instalação claras
- [ ] Variáveis de ambiente documentadas

---

## 🔑 Variáveis de Ambiente Necessárias
Criar arquivo `.env` no servidor com:
```env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=nome_banco
JWT_SECRET=chave_secreta_aleatoria
PORT=3000
NODE_ENV=production
```

---

## 🚀 Comandos Rápidos (após Git instalado)

Execute este script de uma vez:
```powershell
cd c:\Users\marciel\Desktop\sistema-orcamento
git init
git add .
git commit -m "Initial commit - Sistema de Orçamentos RCF v4.0"
git branch -M main
git remote add origin https://github.com/refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS.git
git push -u origin main
```

---

## ✅ Verificação
Depois do push, acesse:
https://github.com/refrigeracaocampofrio-ux/SISTEMA-OR-AMENTOS

Você deve ver todos os arquivos EXCETO `.env` e `node_modules`.
