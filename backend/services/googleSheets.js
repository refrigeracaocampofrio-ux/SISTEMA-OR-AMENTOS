const { google } = require('googleapis');

function getEnv(key, def = '') {
  const v = process.env[key];
  if (typeof v === 'string') return v.trim();
  return def;
}

const ENABLED = /^true|1|yes$/i.test(getEnv('GOOGLE_SHEETS_ENABLED', 'false'));
const SHEET_ID = getEnv('SHEETS_SPREADSHEET_ID', '1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M');
const CLIENT_EMAIL = getEnv('SHEETS_SERVICE_ACCOUNT_EMAIL');
let PRIVATE_KEY = getEnv('SHEETS_PRIVATE_KEY');
if (PRIVATE_KEY) {
  // Allow \n escaped keys and Vercel/Windows env formatting
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

const DEFAULT_TABS = {
  clientes: getEnv('SHEETS_TAB_CLIENTES', 'CLIENTES'),
  agendamentos: getEnv('SHEETS_TAB_AGENDAMENTOS', 'AGENDAMENTOS'),
  orcamentos: getEnv('SHEETS_TAB_ORCAMENTOS', 'ORCAMENTOS'),
  ordens: getEnv('SHEETS_TAB_ORDENS', 'ORDENS'),
  estoque: getEnv('SHEETS_TAB_ESTOQUE', 'ESTOQUE'),
  log: getEnv('SHEETS_TAB_LOG', 'LOG')
};

let sheetsClient = null;
function getSheetsClient() {
  if (!ENABLED) return null;
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.warn('Google Sheets desabilitado: variáveis ausentes (SHEET_ID, CLIENT_EMAIL, PRIVATE_KEY).');
    return null;
  }
  if (sheetsClient) return sheetsClient;
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getSheetRows(tab) {
  const client = getSheetsClient();
  if (!client) return [];
  try {
    const res = await client.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A:Z`,
    });
    return res.data.values || [];
  } catch (e) {
    console.warn(`Sheets getSheetRows falhou (${tab}):`, e.message);
    return [];
  }
}

async function appendRow(tab, values) {
 

// Insere linha ordenada por data (coluna de timestamp)
async function insertRowSorted(tab, values, dateColumnIndex) {
  const client = getSheetsClient();
  if (!client) return false;
  try {
    const rows = await getSheetRows(tab);
    if (rows.length <= 1) {
      // Sem dados ou só header, faz append direto
      return appendRow(tab, values);
    }
    
    const newDate = new Date(values[dateColumnIndex]);
    let insertIndex = rows.length; // default: fim
    
    // Procura posição correta (ordem decrescente - mais recente primeiro)
    for (let i = 1; i < rows.length; i++) {
      const rowDate = new Date(rows[i][dateColumnIndex]);
      if (newDate > rowDate) {
        insertIndex = i;
        break;
      }
    }
    
  insertRowSorted,
  getSheetRows,
  async logClienteCreate(c) {
    const tab = DEFAULT_TABS.clientes;
    const row = [c.id, c.nome, c.email, c.telefone || '', nowISO()];
    return insertRowSorted(tab, row, 4); // coluna 4 = criado_em
  },
  async logClienteUpdate(c) {
    const tab = DEFAULT_TABS.log;
    const row = ['CLIENTE_UPDATE', c.id, c.nome, c.email, c.telefone || '', nowISO()];
    return insertRowSorted(tab, row, 5); // coluna 5 = timestamp
  },
  async logAgendamentoCreate(a) {
    const tab = DEFAULT_TABS.agendamentos;
    const row = [
      a.id, a.cliente_id || '', a.nome, a.email, a.telefone,
      a.cidade, a.estado, a.data_agendamento, a.horario_inicio, a.horario_fim,
      a.tipo_servico || '', a.status || 'pendente', nowISO()
    ];
    return insertRowSorted(tab, row, 12); // coluna 12 = criado_em
  },
  async logAgendamentoStatus(id, status) {
    const tab = DEFAULT_TABS.log;
    const row = ['AGENDAMENTO_STATUS', id, status, nowISO()];
    return insertRowSorted(tab, row, 3); // coluna 3 = timestamp
  },
  async logOrcamentoCreate(o) {
    const tab = DEFAULT_TABS.orcamentos;
    const row = [
      o.id, o.protocolo || '', o.cliente_id, o.valor_total, o.status,
      o.equipamento || '', o.tecnico || '', o.data_criacao || nowISO()
    ];
    return insertRowSorted(tab, row, 7); // coluna 7 = data_criacao
  },
  async logOrcamentoStatus(id, status) {
    const tab = DEFAULT_TABS.log;
    const row = ['ORCAMENTO_STATUS', id, status, nowISO()];
    return insertRowSorted(tab, row, 3); // coluna 3 = timestamp
  },
  async logOrdemCreate(o) {
    const tab = DEFAULT_TABS.ordens;
    const row = [o.id, o.protocolo || '', o.orcamento_id, o.status, o.data_criacao || nowISO(), o.data_conclusao || ''];
    return insertRowSorted(tab, row, 4); // coluna 4 = data_criacao
  },
  async logOrdemStatus(id, status) {
    const tab = DEFAULT_TABS.log;
    const row = ['ORDEM_STATUS', id, status, nowISO()];
    return insertRowSorted(tab, row, 3); // coluna 3 = timestamp
  },
  async logEstoqueMovimento(movimento) {
    const tab = DEFAULT_TABS.estoque;
    const row = [movimento.id, movimento.estoque_id, movimento.nome_peca || '', movimento.tipo, movimento.quantidade, nowISO()];
    return insertRowSorted(tab, row, 5); // coluna 5 = timestampc.email, c.telefone || '', nowISO()];
    return appendRow(tab, row);
  },
  async logClienteUpdate(c) {
    const tab = DEFAULT_TABS.log;
    const row = ['CLIENTE_UPDATE', c.id, c.nome, c.email, c.telefone || '', nowISO()];
    return appendRow(tab, row);
  },
  async logAgendamentoCreate(a) {
    const tab = DEFAULT_TABS.agendamentos;
    const row = [
      a.id, a.cliente_id || '', a.nome, a.email, a.telefone,
      a.cidade, a.estado, a.data_agendamento, a.horario_inicio, a.horario_fim,
      a.tipo_servico || '', a.status || 'pendente', nowISO()
    ];
    return appendRow(tab, row);
  },
  async logAgendamentoStatus(id, status) {
    const tab = DEFAULT_TABS.log;
    const row = ['AGENDAMENTO_STATUS', id, status, nowISO()];
    return appendRow(tab, row);
  },
  async logOrcamentoCreate(o) {
    const tab = DEFAULT_TABS.orcamentos;
    const row = [
      o.id, o.protocolo || '', o.cliente_id, o.valor_total, o.status,
      o.equipamento || '', o.tecnico || '', o.data_criacao || ''
    ];
    return appendRow(tab, row);
  },
  async logOrcamentoStatus(id, status) {
    const tab = DEFAULT_TABS.log;
    const row = ['ORCAMENTO_STATUS', id, status, nowISO()];
    return appendRow(tab, row);
  },
  async logOrdemCreate(o) {
    const tab = DEFAULT_TABS.ordens;
    const row = [o.id, o.protocolo || '', o.orcamento_id, o.status, o.data_criacao || '', o.data_conclusao || ''];
    return appendRow(tab, row);
  },
  async logOrdemStatus(id, status) {
    const tab = DEFAULT_TABS.log;
    const row = ['ORDEM_STATUS', id, status, nowISO()];
    return appendRow(tab, row);
  }
};
