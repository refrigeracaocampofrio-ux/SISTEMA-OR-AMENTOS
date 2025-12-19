# 📅 Sistema de Agendamento de Visitas - RCF

## 🎯 Funcionalidades

✅ **Agendamento Online Interativo**
- Calendário visual para escolha da data
- Horários disponíveis em tempo real
- Formulário completo de dados do cliente
- Confirmação por email automática

✅ **Integração com Clientes**
- Salva automaticamente no banco de dados
- Vincula com cliente existente (se mesmo email)
- Ou cria novo cliente automaticamente

✅ **Horários de Atendimento**
- **Segunda a Sexta**: 08:00-11:00, 13:00-17:00 (almoço 12:00-13:00)
- **Sábado**: 09:00-14:00 (sem almoço)
- **Domingo**: Não atende

## 📋 Como Configurar

### 1. Criar Tabela no Banco de Dados

Execute o arquivo SQL:
```sql
-- Ver arquivo: database/INSTRUCOES_AGENDAMENTOS.sql
-- ou: database/agendamentos.sql
```

No MySQL Workbench ou phpMyAdmin:
1. Conecte ao banco `sistema_orcamento`
2. Abra o arquivo `database/agendamentos.sql`
3. Execute o script

### 2. Logo da Empresa

Substitua o arquivo `/imagens/logo-rcf.png` pela logo real da RCF Assistência Técnica.

### 3. Iniciar o Servidor

```bash
npm start
```

## 🌐 Como Usar

### Para Clientes (Acesso Público)

**URL para compartilhar:**
```
http://seu-dominio.com/agendamento.html
```

**Processo de agendamento:**

1. **Escolher Data** 📅
   - Visualiza calendário do mês
   - Seleciona data desejada
   - Domingos desabilitados (não atende)

2. **Escolher Horário** 🕐
   - Vê apenas horários disponíveis
   - Slots de 1 hora
   - Respeita horários de atendimento

3. **Preencher Dados** 📝
   - Nome completo
   - Email e telefone
   - Endereço completo
   - Tipo de serviço (opcional)
   - Descrição do problema (opcional)

4. **Confirmar** ✅
   - Revisa todos os dados
   - Confirma agendamento
   - Recebe email de confirmação

### Para Administradores (Sistema Interno)

**Gerenciar agendamentos** (futuro):
- Ver todos os agendamentos
- Confirmar/cancelar visitas
- Criar orçamento a partir do agendamento
- Vincular com cliente existente

## 🔧 API Endpoints

### Públicos (sem autenticação)

```javascript
// Obter horários disponíveis
GET /agendamentos/horarios-disponiveis/:data
// Exemplo: /agendamentos/horarios-disponiveis/2025-12-20

// Criar novo agendamento
POST /agendamentos
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua ABC, 123",
  "complemento": "Apto 45",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "data_agendamento": "2025-12-20",
  "horario_inicio": "09:00",
  "horario_fim": "10:00",
  "tipo_servico": "Ar Condicionado",
  "descricao_problema": "Não gela"
}
```

### Protegidos (requerem autenticação)

```javascript
// Listar todos
GET /agendamentos

// Buscar por ID
GET /agendamentos/:id

// Atualizar
PUT /agendamentos/:id

// Atualizar status
PUT /agendamentos/:id/status
{ "status": "confirmado" }

// Deletar
DELETE /agendamentos/:id
```

## 📧 Email de Confirmação

Ao criar agendamento, o cliente recebe email com:
- Data e horário confirmados
- Endereço da visita
- Tipo de serviço
- Descrição do problema
- Informações da empresa

## 🎨 Personalização

### Cores (no arquivo agendamento.html)

```css
:root {
  --rcf-blue: #00a8e8;       /* Azul principal */
  --rcf-light-blue: #5bc0de; /* Azul claro */
  --rcf-dark: #0056b3;       /* Azul escuro */
}
```

### Horários de Atendimento

Editar em: `backend/controllers/agendamentosController.js`

```javascript
// Função: horariosDisponiveis
if (diaSemana === 6) {
  // Sábado
  horarios = [
    { inicio: '09:00', fim: '10:00' },
    // ...
  ];
} else {
  // Segunda a Sexta
  horarios = [
    { inicio: '08:00', fim: '09:00' },
    // ...
  ];
}
```

## 🔗 Compartilhar Link de Agendamento

### Opções:

**1. Link direto:**
```
https://seu-dominio.com/agendamento.html
```

**2. QR Code:**
Gere um QR Code que aponte para o link acima

**3. Botão no site:**
```html
<a href="/agendamento.html" class="btn btn-primary">
  📅 Agendar Visita
</a>
```

**4. WhatsApp:**
```
Olá! Para agendar sua visita, acesse:
https://seu-dominio.com/agendamento.html
```

## ✨ Recursos da Interface

- ❄️ Tema RCF (refrigeração)
- 📱 Totalmente responsivo
- ⚡ Validação em tempo real
- 🎨 Animações suaves
- 🔄 Loading states
- ✅ Feedback visual
- 📧 Confirmação automática

## 🔄 Fluxo Completo

```
Cliente acessa link
    ↓
Escolhe data no calendário
    ↓
Escolhe horário disponível
    ↓
Preenche dados pessoais
    ↓
Revisa e confirma
    ↓
Sistema cria agendamento
    ↓
Verifica se cliente existe (email)
    ↓
└─ SIM → Vincula ao cliente existente
└─ NÃO → Cria novo cliente
    ↓
Envia email de confirmação
    ↓
Mostra mensagem de sucesso
```

## 📊 Status do Agendamento

- **pendente**: Aguardando confirmação
- **confirmado**: Visita confirmada
- **em_atendimento**: Técnico em atendimento
- **concluido**: Visita finalizada
- **cancelado**: Agendamento cancelado

## 🚀 Próximos Passos

1. ✅ Executar SQL no banco
2. ✅ Substituir logo
3. ✅ Testar agendamento
4. 📧 Configurar email
5. 🌐 Compartilhar link com clientes
6. 📊 Acompanhar agendamentos no sistema

## 🆘 Troubleshooting

**Horários não aparecem?**
- Verificar se a data não é domingo
- Verificar se não é data passada
- Ver console do navegador (F12)

**Email não chega?**
- Verificar configuração SMTP no .env
- Ver logs do servidor
- Testar envio em /email

**Erro ao confirmar?**
- Verificar conexão com banco
- Ver se tabela foi criada corretamente
- Checar logs do servidor

---

**Sistema pronto para uso!** 🎉

Compartilhe o link `/agendamento.html` com seus clientes e comece a receber agendamentos!
