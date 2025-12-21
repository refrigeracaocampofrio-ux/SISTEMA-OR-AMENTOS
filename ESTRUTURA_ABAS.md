# 📊 Estrutura das Abas - Google Sheets

## Planilha ID: `1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M`
🔗 [Abrir Planilha](https://docs.google.com/spreadsheets/d/1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M/edit)

---

## 📇 Aba: CLIENTES

**Propósito:** Registro de todos os clientes cadastrados

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - ID | ID único do cliente | 123 |
| B - Nome | Nome completo | João Silva |
| C - Email | Email de contato | joao@email.com |
| D - Telefone | Telefone com DDD | (11) 98765-4321 |
| E - Criado Em | Timestamp de cadastro | 2025-12-20T10:30:00Z |

**Ordenação:** Por data de criação (mais recente primeiro)

---

## 📅 Aba: AGENDAMENTOS

**Propósito:** Todos os agendamentos de visitas técnicas

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - ID | ID único do agendamento | 456 |
| B - Cliente ID | ID do cliente vinculado | 123 |
| C - Nome | Nome do solicitante | João Silva |
| D - Email | Email de contato | joao@email.com |
| E - Telefone | Telefone com DDD | (11) 98765-4321 |
| F - Cidade | Cidade do atendimento | São Paulo |
| G - Estado | Estado (sigla) | SP |
| H - Data Agendamento | Data da visita | 2025-12-25 |
| I - Horário Início | Horário de início | 09:00 |
| J - Horário Fim | Horário de término | 10:00 |
| K - Tipo Serviço | Tipo de serviço | Manutenção Preventiva |
| L - Status | Status atual | pendente/confirmado/concluido |
| M - Criado Em | Timestamp de criação | 2025-12-20T10:30:00Z |

**Ordenação:** Por timestamp de criação (mais recente primeiro)

---

## 💰 Aba: ORCAMENTOS

**Propósito:** Orçamentos gerados para clientes

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - ID | ID único do orçamento | 789 |
| B - Protocolo | Código de protocolo | ORC-2025-00789 |
| C - Cliente ID | ID do cliente | 123 |
| D - Valor Total | Valor total em R$ | 1500.00 |
| E - Status | Status atual | PENDENTE/APROVADO/CANCELADO |
| F - Equipamento | Equipamento em questão | Geladeira Frost Free |
| G - Técnico | Nome do técnico | Carlos |
| H - Data Criação | Data de criação | 2025-12-20T10:30:00Z |

**Ordenação:** Por data de criação (mais recente primeiro)

---

## 🔧 Aba: ORDENS

**Propósito:** Ordens de serviço (criadas ao aprovar orçamentos)

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - ID | ID único da ordem | 321 |
| B - Protocolo | Código de protocolo | OS-2025-00321 |
| C - Orçamento ID | ID do orçamento vinculado | 789 |
| D - Status | Status atual | EM ANDAMENTO/CONCLUIDO |
| E - Data Criação | Data de abertura | 2025-12-20T10:30:00Z |
| F - Data Conclusão | Data de conclusão | 2025-12-22T16:00:00Z |

**Ordenação:** Por data de criação (mais recente primeira)

---

## 📦 Aba: ESTOQUE

**Propósito:** Movimentações de estoque (entradas e saídas)

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - ID | ID da movimentação | 555 |
| B - Estoque ID | ID do item de estoque | 10 |
| C - Peça | Nome da peça | Compressor 1/4 HP |
| D - Tipo Movimento | entrada ou saida | saida |
| E - Quantidade | Quantidade movimentada | 2 |
| F - Data | Timestamp da movimentação | 2025-12-20T10:30:00Z |

**Ordenação:** Por data (mais recente primeiro)

---

## 📋 Aba: LOG

**Propósito:** Registro de todas as mudanças de status e atualizações

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - Evento | Tipo de evento | ORCAMENTO_STATUS |
| B - Entity ID | ID da entidade afetada | 789 |
| C - Valor/Status | Novo valor ou status | APROVADO |
| D - Timestamp | Data/hora do evento | 2025-12-20T10:30:00Z |

**Eventos registrados:**
- `CLIENTE_UPDATE` - Cliente atualizado
- `AGENDAMENTO_STATUS` - Status de agendamento mudou
- `ORCAMENTO_STATUS` - Status de orçamento mudou
- `ORDEM_STATUS` - Status de ordem de serviço mudou

**Ordenação:** Por timestamp (mais recente primeiro)

---

## 🎨 Formatação Aplicada

✅ **Cabeçalhos:**
- Fundo azul (#0066CC)
- Texto branco em negrito
- Alinhamento centralizado
- Primeira linha congelada (sempre visível ao rolar)

✅ **Colunas:**
- Auto-ajustadas ao conteúdo
- Filtros habilitados em todas as abas

---

## 🔄 Sincronização Automática

**Quando os dados são gravados:**
- ✅ Ao criar novo cliente → grava em CLIENTES
- ✅ Ao atualizar cliente → grava em LOG
- ✅ Ao criar agendamento → grava em AGENDAMENTOS
- ✅ Ao mudar status de agendamento → grava em LOG
- ✅ Ao criar orçamento → grava em ORCAMENTOS
- ✅ Ao aprovar orçamento → cria ordem em ORDENS
- ✅ Ao mudar status de ordem → grava em LOG
- ✅ Movimentação de estoque → grava em ESTOQUE

**Organização:** Todos os registros mantêm ordem cronológica decrescente (mais novo no topo)

**Performance:** Inserção inteligente — busca posição correta antes de inserir, mantendo ordenação perfeita

---

## 📊 Exemplo de Uso

1. Cliente agenda uma visita no site → linha aparece em **AGENDAMENTOS**
2. Técnico confirma → status atualizado + registro em **LOG**
3. Após visita, técnico cria orçamento → linha em **ORCAMENTOS**
4. Cliente aprova → status "APROVADO" em **ORCAMENTOS** + nova linha em **ORDENS**
5. Técnico usa peças → movimentações em **ESTOQUE**
6. Serviço concluído → status "CONCLUIDO" em **ORDENS** + registro em **LOG**

**Resultado:** Rastreabilidade completa de todo o processo! 🎯
