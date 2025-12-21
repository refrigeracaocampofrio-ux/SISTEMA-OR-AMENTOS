# Google Sheets Live Sync

Esta integração grava eventos ao vivo na sua planilha do Google Sheets, organizados cronologicamente por data.

## Planilha configurada
**ID da planilha:** `1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M`
🔗 [Abrir planilha](https://docs.google.com/spreadsheets/d/1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M/edit)

## Pré-requisitos
1. **Crie um Service Account no Google Cloud Console:**
   - Acesse: https://console.cloud.google.com/
   - Navegue até: IAM & Admin → Service Accounts
   - Clique em "Create Service Account"
   - Dê um nome (ex: "sistema-orcamento-sheets")
   - Clique em "Create and Continue"
   - **NÃO** precisa de roles específicas na conta
   - Clique em "Done"

2. **Crie e baixe as credenciais:**
   - Na lista de Service Accounts, clique nos 3 pontos → "Manage Keys"
   - "Add Key" → "Create New Key" → JSON
   - Baixe o arquivo JSON

3. **Habilite a Google Sheets API:**
   - No Cloud Console, vá em "APIs & Services" → "Library"
   - Procure "Google Sheets API"
   - Clique em "Enable"

4. **Compartilhe a planilha:**
   - Abra a planilha: https://docs.google.com/spreadsheets/d/1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M/edit
   - Clique em "Compartilhar"
   - Cole o email do Service Account (está no JSON baixado, campo `client_email`)
   - Dê permissão de **Editor**
   - Clique em "Enviar"

## Configuração das variáveis de ambiente

Abra o arquivo JSON baixado e copie os valores:

```env
GOOGLE_SHEETS_ENABLED=true
SHEETS_SPREADSHEET_ID=1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M
SHEETS_SERVICE_ACCOUNT_EMAIL=seu-service-account@projeto-123456.iam.gserviceaccount.com
SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...sua chave completa aqui...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ Importante para a chave privada
- Copie o campo `private_key` do JSON completo (com aspas)
- Mantenha os `\n` literais (não quebre em linhas reais)
- No Vercel: cole direto no campo de variável
- No arquivo `.env` local: use aspas duplas

## Setup automático das abas

Execute o script de configuração para criar as abas com cabeçalhos:

```bash
npm run sheets:setup
```

O script cria automaticamente:
- ✅ **CLIENTES** - ID, Nome, Email, Telefone, Criado Em
- ✅ **AGENDAMENTOS** - ID, Cliente ID, Nome, Email, Telefone, Cidade, Estado, Data Agendamento, Horário Início, Horário Fim, Tipo Serviço, Status, Criado Em
- ✅ **ORCAMENTOS** - ID, Protocolo, Cliente ID, Valor Total, Status, Equipamento, Técnico, Data Criação
- ✅ **ORDENS** - ID, Protocolo, Orçamento ID, Status, Data Criação, Data Conclusão
- ✅ **ESTOQUE** - ID, Estoque ID, Peça, Tipo Movimento, Quantidade, Data
- ✅ **LOG** - Evento, Entity ID, Valor/Status, Timestamp

**Recursos aplicados:**
- Cabeçalhos com fundo azul e texto branco em negrito
- Primeira linha congelada
- Colunas auto-ajustadas
- Formatação centralizada

## Funcionamento

### Organização por data
Todos os registros são **inseridos em ordem cronológica decrescente** (mais recente primeiro):
- A coluna de data/timestamp é usada como chave de ordenação
- Ao criar um registro, o sistema busca a posição correta e insere
- Garante que a planilha sempre mostre os dados mais recentes no topo

### Eventos capturados

| Ação | Aba | Dados Gravados |
|------|-----|----------------|
| Criar cliente | CLIENTES | ID, nome, email, telefone, timestamp |
| Atualizar cliente | LOG | Tipo de evento, ID, dados, timestamp |
| Criar agendamento | AGENDAMENTOS | Todos os campos + timestamp |
| Mudar status agendamento | LOG | Evento, ID, novo status, timestamp |
| Criar orçamento | ORCAMENTOS | ID, protocolo, cliente, valor, status, equipamento, técnico, data |
| Aprovar orçamento | ORCAMENTOS + ORDENS | Atualiza status + cria ordem de serviço |
| Criar ordem | ORDENS | ID, protocolo, orçamento_id, status, datas |
| Mudar status ordem | LOG | Evento, ID, status, timestamp |

### Tolerância a falhas
- Se a integração falhar (credenciais inválidas, rate limit, etc.), o sistema continua funcionando normalmente
- Erros são logados no console mas não bloqueiam operações
- Você pode habilitar/desabilitar via `GOOGLE_SHEETS_ENABLED=false`

## Deploy no Vercel

Configure as variáveis no dashboard do Vercel:

```bash
vercel env add GOOGLE_SHEETS_ENABLED
vercel env add SHEETS_SPREADSHEET_ID
vercel env add SHEETS_SERVICE_ACCOUNT_EMAIL
vercel env add SHEETS_PRIVATE_KEY
```

Ou use o CLI:
```bash
vercel env add GOOGLE_SHEETS_ENABLED production
# (digite: true)
vercel env add SHEETS_SPREADSHEET_ID production
# (cole: 1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M)
vercel env add SHEETS_SERVICE_ACCOUNT_EMAIL production
# (cole o email do service account)
vercel env add SHEETS_PRIVATE_KEY production
# (cole a chave completa com \n)
```

Depois faça redeploy:
```bash
vercel --prod
```

## Teste rápido

Após configurar, teste criando um cliente via frontend ou API:

```bash
curl -X POST https://seu-dominio.com/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste Sheets","email":"teste@sheets.com","telefone":"11999999999"}'
```

Verifique a aba CLIENTES na planilha — a linha deve aparecer automaticamente no topo!

## Troubleshooting

### Erro: "Request had insufficient authentication scopes"
- Verifique se a Google Sheets API está habilitada no projeto
- Confirme que o Service Account tem o scope correto (já configurado no código)

### Erro: "The caller does not have permission"
- Confirme que você compartilhou a planilha com o email do Service Account
- A permissão deve ser **Editor**, não Viewer

### Nenhum erro mas dados não aparecem
- Verifique se `GOOGLE_SHEETS_ENABLED=true`
- Confirme que as variáveis estão definidas (não vazias)
- Cheque os logs do console: `console.warn` mostra falhas silenciosas

### Chave privada inválida
- Certifique-se de copiar a chave completa do JSON
- Mantenha os `\n` literais (não converta em quebras de linha reais)
- No Vercel, cole exatamente como está no JSON (com aspas e escapes)

