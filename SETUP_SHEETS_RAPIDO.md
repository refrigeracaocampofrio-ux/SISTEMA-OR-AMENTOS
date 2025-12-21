# 🚀 Guia Rápido: Configurar Google Sheets

## 1️⃣ Criar Service Account (5 minutos)

1. Acesse: https://console.cloud.google.com/
2. Se não tiver projeto, crie um novo: "sistema-orcamento" ou similar
3. Menu ☰ → **IAM & Admin** → **Service Accounts**
4. **+ CREATE SERVICE ACCOUNT**
   - Name: `sistema-orcamento-sheets`
   - Service account ID: (gerado automaticamente)
   - Clique **CREATE AND CONTINUE**
   - Pule a etapa "Grant this service account access" (clique CONTINUE)
   - Pule "Grant users access" (clique DONE)

## 2️⃣ Criar Chave JSON

1. Na lista de Service Accounts, localize a que você criou
2. Clique nos **3 pontos** (⋮) → **Manage keys**
3. **ADD KEY** → **Create new key**
4. Escolha formato: **JSON**
5. Clique **CREATE** — um arquivo JSON será baixado

## 3️⃣ Habilitar Google Sheets API

1. No Cloud Console, menu ☰ → **APIs & Services** → **Library**
2. Busque: "**Google Sheets API**"
3. Clique nela e depois em **ENABLE**

## 4️⃣ Compartilhar a Planilha

1. Abra sua planilha:
   https://docs.google.com/spreadsheets/d/1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M/edit

2. Clique no botão **Compartilhar** (canto superior direito)

3. **Cole o email do Service Account:**
   - Abra o arquivo JSON baixado
   - Procure o campo `"client_email":`
   - Copie o email (algo como `sistema-orcamento-sheets@projeto-123456.iam.gserviceaccount.com`)
   - Cole no campo "Adicionar pessoas e grupos"

4. Selecione permissão: **Editor** ✏️

5. **DESMARQUE** "Notificar pessoas" (é um bot, não precisa de email)

6. Clique **Enviar**

## 5️⃣ Configurar Variáveis de Ambiente

Abra o arquivo JSON baixado e localize estes campos:

```json
{
  "client_email": "sistema-orcamento-sheets@projeto-123456.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...muito texto...kGg==\n-----END PRIVATE KEY-----\n"
}
```

### Para ambiente local (.env):

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
GOOGLE_SHEETS_ENABLED=true
SHEETS_SPREADSHEET_ID=1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M
SHEETS_SERVICE_ACCOUNT_EMAIL=sistema-orcamento-sheets@projeto-123456.iam.gserviceaccount.com
SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...sua chave completa...kGg==\n-----END PRIVATE KEY-----\n"
```

⚠️ **Importante:** Mantenha os `\n` literais na chave (não converta em quebras de linha reais).

### Para Vercel (produção):

Opção 1 - Via Dashboard:
1. Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables
2. Adicione cada variável (Name + Value)
3. Selecione ambientes: Production, Preview, Development

Opção 2 - Via CLI:
```bash
vercel env add GOOGLE_SHEETS_ENABLED production
# Digite: true

vercel env add SHEETS_SPREADSHEET_ID production
# Cole: 1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M

vercel env add SHEETS_SERVICE_ACCOUNT_EMAIL production
# Cole: sistema-orcamento-sheets@projeto-123456.iam.gserviceaccount.com

vercel env add SHEETS_PRIVATE_KEY production
# Cole a chave completa do JSON (com aspas e \n)
```

## 6️⃣ Configurar Abas da Planilha

Execute o script de setup (requer variáveis configuradas):

```bash
npm run sheets:setup
```

Isso cria automaticamente:
- ✅ Aba **CLIENTES** com colunas: ID, Nome, Email, Telefone, Criado Em
- ✅ Aba **AGENDAMENTOS** com todas as colunas necessárias
- ✅ Aba **ORCAMENTOS** com protocolo, valor, status, etc.
- ✅ Aba **ORDENS** vinculadas aos orçamentos
- ✅ Aba **ESTOQUE** para movimentações
- ✅ Aba **LOG** para todas as mudanças de status

Cabeçalhos formatados (fundo azul, texto branco, negrito) + primeira linha congelada!

## 7️⃣ Testar Integração

### Teste local:
```bash
npm start
```

Crie um cliente via frontend (http://localhost:5000) e verifique se aparece na aba CLIENTES da planilha.

### Deploy produção:
```bash
vercel --prod
```

Após deploy, teste criando um agendamento público e verifique a aba AGENDAMENTOS.

## 8️⃣ Verificar Funcionamento

✅ **Checklist:**
- [ ] Service Account criado
- [ ] Google Sheets API habilitada
- [ ] Planilha compartilhada com Service Account
- [ ] Variáveis configuradas no .env (local) ou Vercel (produção)
- [ ] Script `npm run sheets:setup` executado com sucesso
- [ ] Abas criadas na planilha com cabeçalhos formatados
- [ ] Teste de criação: cliente/agendamento aparece na planilha
- [ ] Dados organizados por data (mais recente no topo)

## 🔧 Troubleshooting

**Erro: "insufficient authentication scopes"**
→ Google Sheets API não está habilitada no projeto

**Erro: "The caller does not have permission"**
→ Planilha não foi compartilhada com o Service Account (ou permissão errada)

**Dados não aparecem (sem erros)**
→ Verifique se `GOOGLE_SHEETS_ENABLED=true` e variáveis não estão vazias

**Erro: "invalid private key"**
→ Chave foi copiada errada; copie novamente do JSON mantendo `\n` literais

## 📊 Resultado Final

Todos os eventos do sistema gravarão automaticamente na planilha:
- 📝 Novos clientes
- 📅 Agendamentos criados
- 💰 Orçamentos gerados
- 🔧 Ordens de serviço abertas
- 📦 Movimentações de estoque
- 📋 Mudanças de status (tudo no LOG)

**Ordem:** Mais recente sempre no topo de cada aba! 🎯
