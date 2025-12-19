# Sistema de Orçamento

Backend em Node.js + Express para gerenciamento de orçamentos, ordens de serviço e controle de estoque.

Pré-requisitos:

- Node.js >= 18
- MySQL

Instalação e execução:

1. Copie o arquivo de exemplo e ajuste as credenciais:

```bash
cp .env.example .env
# editar .env com suas credenciais
```

2. Instale dependências:

```bash
npm install
```

3. Crie o banco e as tabelas (execute o script `database/schema.sql` no MySQL):

```sql
-- no mysql client
SOURCE database/schema.sql;
SOURCE database/seed.sql; -- opcional
```

4. Inicie o servidor:

```bash
npm start
```

## Lint e Correção Automática

- Lint do projeto:

```bash
npm run lint
```

- Correção automática de código (ESLint + Prettier):

```bash
npm run fix:code
# ou em watch: node scripts/code-fix.js --watch
```

- Formatação (Prettier):

```bash
npm run format
```

## Revisão de Textos (Português)

Suporta `.txt` e `.docx`. Por padrão usa LanguageTool; opcionalmente pode usar OpenAI se `OPENAI_API_KEY` estiver definido.

Exemplos:

```bash
# Revisar um TXT e salvar saída
node scripts/text-review.js --file docs/exemplo.txt --out docs/exemplo_corrigido.txt

# Revisar um DOCX em seções (texto longo)
node scripts/text-review.js --file docs/contrato.docx --sections --out docs/contrato_corrigido.txt

# Fornecer texto direto e exibir explicações
node scripts/text-review.js --text "O documento precisa de correções." --explain

# Usar OpenAI como provedor (requer OPENAI_API_KEY)
node scripts/text-review.js --provider openai --file docs/exemplo.txt --out docs/corrigido.txt
```

Gerar relatório de revisão:

```bash
# Gera reports/text-review.md com explicações por seção
npm run report:text
```

## Relatório de Código

Gera um relatório com erros/warnings do ESLint, pontos de atenção em SQL/MySQL e configuração do Nodemailer.

```bash
npm run report:code
# Saídas:
# - reports/code-lint-report.json
# - reports/code-lint-report.md

# Relatório completo (código + texto)
npm run report:all
```

Variáveis recomendadas (.env):

```
OPENAI_API_KEY=seu_token
```

Endpoints principais:

- `POST /orcamentos` — criar orçamento (body: cliente, itens, mao_obra)
- `PUT /orcamentos/:id/status` — atualizar status (APROVADO / CANCELADO)
- `GET /orcamentos` — listar orçamentos
- `GET /orcamentos/:id` — detalhe do orçamento
- `POST /ordens_servico` — criar ordem (associada a orçamento aprovada)
- `PUT /ordens_servico/:id/status` — atualizar status da ordem
- `POST /estoque` — adicionar peça ao estoque
- `PUT /estoque/:id/movimentacao` — registrar entrada/saída

Enviar e-mails:

- Suporta múltiplos provedores: `smtp` (Nodemailer), `resend` (API), `sendgrid` (API) e `gmail` (OAuth). Defina `MAIL_PROVIDER` e variáveis correspondentes no `.env`.

Configuração SMTP recomendada (ex.: conta `refrigeracaocampofrio@seudominio`):

1. Adicione ao `.env`:

```
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_USER=refrigeracaocampofrio@seudominio.com
SMTP_PASS=sua_senha_smtp
SMTP_SECURE=false # true se usar 465
EMAIL_FROM=refrigeracaocampofrio@seudominio.com
```

2. Se usar Gmail/Google Workspace, prefira `EMAIL_SERVICE=gmail` e senha de app:

```
EMAIL_SERVICE=gmail
EMAIL_USER=seu@gmail.com
EMAIL_PASS=senha_de_app
```

3. Testar envio via rota de debug (servidor rodando):

```bash
curl -X POST http://localhost:3000/debug/send-test-email -H "Content-Type: application/json" -d '{"to":"seu_email_de_teste@dominio.com"}'
```

Isso tenta enviar um e-mail usando as credenciais do `.env`. Se houver erro de autenticação, verifique login/senha e se o provedor permite SMTP (por ex. habilitar "Less secure apps" ou gerar senha de app). Se quiser que eu configure aqui, forneça os valores `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS`.

Provedores API:

- Resend:
  - `.env`: `MAIL_PROVIDER=resend` e `RESEND_API_KEY=<chave>`
  - Endpoint: `https://api.resend.com/emails`.

- SendGrid:
  - `.env`: `MAIL_PROVIDER=sendgrid` e `SENDGRID_API_KEY=<chave>`
  - Endpoint: `https://api.sendgrid.com/v3/mail/send`.

Gmail (OAuth):

- Crie um OAuth Client no Google Cloud (tipo Web) e configure o Redirect URI: `http://localhost:3000/email/google/callback`.
- `.env`:
```
MAIL_PROVIDER=gmail
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REDIRECT_URI=http://localhost:3000/email/google/callback
EMAIL_FROM=seuemail@dominio.com
```
- Crie a tabela:
```
SOURCE backend/scripts/init_email_oauth.sql;
```
- Conecte a conta acessando: `http://localhost:3000/email/connect/google`

Observações:

- Já existem controllers, models e rotas no diretório `backend/`.
- Se quiser usar o Gmail, gere uma senha de app (se estiver usando autenticação em 2 passos).

# Sistema de Orçamento, Ordens de Serviço e Estoque

Projeto em Node.js + MySQL que permite criar orçamentos, aprová-los/cancelá-los, gerar ordens de serviço e controlar estoque de peças. Envia notificações por e-mail usando Nodemailer.

Estrutura:

- `backend/` - servidor Express, rotas e serviços
- `database/` - script SQL para criar o banco e tabelas
- `frontend/` - páginas HTML simples para interação

Instalação

1. Instale dependências:

```bash
npm install
```

2. Crie o banco e tabelas no MySQL usando o script `database/schema.sql` (execute no cliente MySQL):

```sql
SOURCE database/schema.sql;
```

3. Crie um arquivo `.env` na raiz com as variáveis:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=senha
DB_NAME=sistema_orcamento
PORT=3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha
SMTP_FROM=no-reply@seu-dominio.com
SMTP_SECURE=false
```

4. Inicie o servidor:

```bash
npm start
```

Endpoints principais:

- `POST /orcamentos` - criar orçamento
  - Exemplo payload:
    {
    "cliente": { "nome": "João", "email": "joao@example.com" },
    "itens": [{ "nome_peca": "Filtro", "quantidade": 1, "valor_unitario": 20 }],
    "mao_obra": 50
    }
- `PUT /orcamentos/:id/status` - atualizar status (APROVADO, CANCELADO)
  - Se `CANCELADO` enviar `{ "status": "CANCELADO", "motivo": "Cliente desistiu" }`.
  - Se `APROVADO` enviar `{ "status": "APROVADO" }`.
- `GET /orcamentos` - listar orçamentos com cliente e itens
- `GET /orcamentos/:id` - detalhes de um orçamento
- `PUT /ordens_servico/:id/status` - atualizar status da ordem (CONCLUIDO)
- `GET /ordens_servico` - listar ordens de serviço
- `POST /estoque` - registrar peça/entrada
  - Payload: `{ "nome_peca": "Filtro", "quantidade": 10 }`
- `PUT /estoque/:id/movimentacao` - registrar entrada/saída
  - Payload: `{ "tipo": "saida", "quantidade": 2 }`

Frontend simples está em `frontend/` e espera que o backend esteja rodando no mesmo host. A página principal (`frontend/index.html`) já faz chamadas para criar orçamentos e listar/atualizar status.

Autenticação
-- `POST /auth/login` - efetua login com credenciais do administrador (definidas em `.env`: `ADMIN_USER` e `ADMIN_PASS`). Retorna JWT: - Payload exemplo: `{ "username": "admin", "password": "admin" }` - Use o token no header `Authorization: Bearer <token>` para acessar rotas protegidas como `/clientes`.

Endpoints de clientes (protegidos por JWT):

- `GET /clientes` - lista clientes
- `POST /clientes` - cria cliente (body: `{ nome, email, telefone }`)
- `GET /clientes/:id` - detalhe
- `PUT /clientes/:id` - atualizar
- `DELETE /clientes/:id` - remover

Frontend Login

- Existe uma página simples de login em `frontend/login.html` que envia as credenciais para `POST /auth/login`, armazena o token JWT em `localStorage` e redireciona para `frontend/index.html`.
- Para chamadas API protegidas a partir do frontend, envie o header:
  - `Authorization: Bearer <token>`

Exemplo de uso em JavaScript:

```js
const token = localStorage.getItem('token');
fetch('/clientes', { headers: { Authorization: 'Bearer ' + token } });
```
