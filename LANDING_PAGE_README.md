# 🎯 Sistema de Agendamento - Landing Page Profissional

## 📋 O que foi implementado

### 1. **Nova Página de Boas-vindas (Landing Page)**
- **Arquivo**: `frontend/agendamento-welcome.html`
- **Funcionalidades**:
  - ✅ Header profissional com logo da Refrigeração Campo Frio
  - ✅ Informações da empresa (CNPJ, Email, Endereço)
  - ✅ Botão WhatsApp direto (11 98016-3597)
  - ✅ Duas abas: "Buscar" e "Novo"
  
  **ABA BUSCAR**:
  - Buscar cliente por protocolo (4 dígitos) ou telefone
  - Exibir dados do cliente encontrado
  - Listar agendamentos existentes com data, hora e status
  - Botões: "Novo Agendamento" ou "Reagendar"
  
  **ABA NOVO**:
  - Registrar novo cliente (Nome, Email, Telefone)
  - Gerar protocolo automático (4 dígitos)
  - Exibir protocolo gerado em destaque
  - Botão para continuar para agendamento

### 2. **Backend - Novas Rotas Públicas**
- `GET /clientes/buscar/:query` - Buscar cliente por protocolo ou telefone
- `POST /clientes/novo-protocolo` - Criar novo cliente e gerar protocolo
- `GET /clientes/agendamentos/:telefone` - Listar agendamentos de um cliente

### 3. **Modelos de Dados**

**`backend/models/clientes.js`** - Novo método:
```javascript
buscarPorProtocolo(protocolo)  // Buscar cliente por protocolo
findByPhone(telefone)           // Buscar cliente por telefone (já existia)
```

**`backend/models/agendamentos.js`** - Novos métodos:
```javascript
buscarPorProtocolo(protocolo)   // Listar agendamentos por protocolo
buscarPorTelefone(telefone)      // Listar agendamentos por telefone
```

### 4. **Controller de Clientes - Novas Funções**
- `buscarClientePorTelefoneOuProtocolo()` - Busca inteligente (protocolo ou telefone)
- `gerarNovoProtocolo()` - Criar novo cliente com protocolo
- `listarAgendamentosCliente()` - Listar agendamentos por telefone
- `gerarProtocolo()` - Gera protocolo único com verificação de duplicatas

### 5. **Banco de Dados - Migration**
- **Script**: `backend/scripts/migration-add-protocolo.js`
- **O que faz**: Adiciona coluna `protocolo` (VARCHAR 10, UNIQUE) na tabela `clientes`
- **Automático**: Executa automaticamente ao iniciar o servidor

### 6. **Fluxo do Usuário**

```
[agendamento-welcome.html] (LANDING PAGE)
    ↓
    ├─→ Aba "Buscar"
    │   ├─→ Digita protocolo OU telefone
    │   ├─→ Sistema busca cliente + agendamentos
    │   ├─→ Exibe dados do cliente
    │   └─→ Opções: "Novo Agendamento" ou "Reagendar"
    │       ↓
    │       [agendamento-data.html] (seleção de data)
    │
    └─→ Aba "Novo"
        ├─→ Preenche: Nome, Email, Telefone
        ├─→ Clica "Gerar Protocolo"
        ├─→ Sistema cria cliente + gera protocolo 4 dígitos
        ├─→ Exibe protocolo em destaque
        └─→ Clica "Continuar"
            ↓
            [agendamento-data.html] (seleção de data)
```

## 🔧 Configurações Necessárias

### Variáveis de Ambiente (`.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sistema_orcamento
```

## 🚀 Deploy

### Local
```bash
npm install
npm run migrate          # (opcional - migration roda automaticamente)
npm start              # Inicia servidor e rodada migration
```

### Vercel
1. Migration roda automaticamente ao iniciar (`package.json` > `start` script)
2. Commit e push das mudanças
3. Vercel deploya automaticamente

### Mudanças no `package.json`
```json
"start": "node backend/scripts/migration-add-protocolo.js && node backend/server.js"
```

## 📱 Responsividade

A página de boas-vindas é totalmente responsiva:
- Desktop: 2 colunas (boas-vindas + formulário)
- Mobile: 1 coluna (empilhadas verticalmente)

## 🎨 Design

- **Tema**: Dark modern (matching agendamento pages)
- **Cores**: 
  - Primária: `#3498db` (azul)
  - Accent: `#2ecc71` (verde)
  - Backgrounds: Dark gradients
- **Fonte**: Segoe UI, sans-serif

## 🔒 Segurança

- Todas as rotas públicas fazem validação de entrada
- Erro messages não expõem detalhes do sistema
- Protocolo é gerado com verificação de unicidade
- Busca por telefone remove caracteres especiais

## 📊 Exemplos de Resposta da API

### Buscar Cliente (Sucesso)
```json
{
  "success": true,
  "protocolo": "1234",
  "cliente": {
    "id": 5,
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11987654321"
  },
  "agendamentos": [
    {
      "id": 1,
      "data": "2025-12-20",
      "horario_inicio": "14:00",
      "horario_fim": "15:00",
      "status": "confirmado",
      "tipo_servico": "Manutenção"
    }
  ]
}
```

### Novo Protocolo (Sucesso)
```json
{
  "success": true,
  "protocolo": "5678",
  "cliente": {
    "id": 6,
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "telefone": "11998765432"
  },
  "message": "Novo cliente criado com sucesso"
}
```

### Erro (Cliente não encontrado)
```json
{
  "success": false,
  "error": "Cliente não encontrado",
  "protocolo": null,
  "cliente": null,
  "agendamentos": []
}
```

## 📝 Próximos Passos (Opcionais)

1. **Adicionar reagendamento**: Permitir cancelar/reagendar agendamentos existentes
2. **Email de confirmação**: Enviar protocolo por email ao novo cliente
3. **Validação de protocolo**: Exigir protocolo em todas as operações
4. **Dashboard**: Painel admin para visualizar protocolos gerados
5. **Rate limiting**: Limitar tentativas de busca

## 🐛 Troubleshooting

### Erro: "Column protocolo doesn't exist"
- Solução: Migration automática roda ao iniciar. Se não funcionar:
  ```bash
  npm run migrate
  ```

### Protocolo não sendo gerado
- Verificar se `buscarPorProtocolo` está funcionando
- Verificar logs do servidor

### Cliente não encontrado ao buscar
- Verificar se telefone está no formato correto
- Tentar com protocolo (4 dígitos)
- Verificar se cliente existe no banco (MySQL)

## 📞 Suporte

WhatsApp: https://wa.me/5511980163597

---

**Status**: ✅ Implementado e pronto para deploy
**Data**: 2024
**Versão**: 1.0.0
