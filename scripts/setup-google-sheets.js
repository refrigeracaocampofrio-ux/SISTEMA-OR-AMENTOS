/*
  Script de configuração automática do Google Sheets
  Cria abas e insere cabeçalhos para organização dos dados
  
  Uso: node scripts/setup-google-sheets.js
*/

const { google } = require('googleapis');

function getEnv(key, def = '') {
  const v = process.env[key];
  if (typeof v === 'string') return v.trim();
  return def;
}

const SHEET_ID = getEnv('SHEETS_SPREADSHEET_ID', '1ez3DjYYyotQ52fjQKdOVjoTnl-xwTQh6IRIwI9hBB5M');
const CLIENT_EMAIL = getEnv('SHEETS_SERVICE_ACCOUNT_EMAIL');
let PRIVATE_KEY = getEnv('SHEETS_PRIVATE_KEY');
if (PRIVATE_KEY) {
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

const TABS_CONFIG = [
  {
    name: 'CLIENTES',
    headers: ['ID', 'Nome', 'Email', 'Telefone', 'Criado Em'],
    frozen: 1
  },
  {
    name: 'AGENDAMENTOS',
    headers: ['ID', 'Cliente ID', 'Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'Data Agendamento', 'Horário Início', 'Horário Fim', 'Tipo Serviço', 'Status', 'Criado Em'],
    frozen: 1
  },
  {
    name: 'ORCAMENTOS',
    headers: ['ID', 'Protocolo', 'Cliente ID', 'Valor Total', 'Status', 'Equipamento', 'Técnico', 'Data Criação'],
    frozen: 1
  },
  {
    name: 'ORDENS',
    headers: ['ID', 'Protocolo', 'Orçamento ID', 'Status', 'Data Criação', 'Data Conclusão'],
    frozen: 1
  },
  {
    name: 'ESTOQUE',
    headers: ['ID', 'Estoque ID', 'Peça', 'Tipo Movimento', 'Quantidade', 'Data'],
    frozen: 1
  },
  {
    name: 'LOG',
    headers: ['Evento', 'Entity ID', 'Valor/Status', 'Timestamp'],
    frozen: 1
  }
];

async function setupSheets() {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error('❌ Variáveis de ambiente ausentes:');
    console.error('   SHEETS_SPREADSHEET_ID:', SHEET_ID ? '✅' : '❌');
    console.error('   SHEETS_SERVICE_ACCOUNT_EMAIL:', CLIENT_EMAIL ? '✅' : '❌');
    console.error('   SHEETS_PRIVATE_KEY:', PRIVATE_KEY ? '✅' : '❌');
    console.error('\nConfigure as variáveis no .env ou ambiente e tente novamente.');
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`\n📊 Configurando Google Sheets: ${SHEET_ID}\n`);

  try {
    // Obter abas existentes
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const existingSheets = meta.data.sheets.map(s => s.properties.title);

    console.log('Abas existentes:', existingSheets.join(', '));

    const requests = [];

    // Criar abas que não existem
    for (const tab of TABS_CONFIG) {
      if (!existingSheets.includes(tab.name)) {
        console.log(`➕ Criando aba: ${tab.name}`);
        requests.push({
          addSheet: {
            properties: {
              title: tab.name,
              gridProperties: {
                rowCount: 1000,
                columnCount: tab.headers.length,
                frozenRowCount: tab.frozen || 1
              }
            }
          }
        });
      } else {
        console.log(`✅ Aba já existe: ${tab.name}`);
      }
    }

    // Executar criação de abas
    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests }
      });
      console.log('✅ Abas criadas com sucesso!\n');
    }

    // Inserir cabeçalhos e formatar
    for (const tab of TABS_CONFIG) {
      console.log(`📝 Configurando cabeçalhos da aba: ${tab.name}`);
      
      // Verificar se já tem dados
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${tab.name}!A1:Z1`
      });

      if (!existing.data.values || existing.data.values.length === 0 || existing.data.values[0].length === 0) {
        // Inserir cabeçalhos
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${tab.name}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [tab.headers]
          }
        });

        // Formatar cabeçalho (negrito, fundo azul)
        const sheetId = meta.data.sheets.find(s => s.properties.title === tab.name)?.properties.sheetId;
        if (sheetId !== undefined) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: {
              requests: [
                {
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: tab.headers.length
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: { red: 0.0, green: 0.4, blue: 0.8 },
                        textFormat: { bold: true, foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 } },
                        horizontalAlignment: 'CENTER'
                      }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                  }
                },
                {
                  autoResizeDimensions: {
                    dimensions: {
                      sheetId: sheetId,
                      dimension: 'COLUMNS',
                      startIndex: 0,
                      endIndex: tab.headers.length
                    }
                  }
                }
              ]
            }
          });
        }
        console.log(`   ✅ Cabeçalhos inseridos e formatados`);
      } else {
        console.log(`   ⏭️  Cabeçalhos já existem, pulando...`);
      }
    }

    console.log('\n✅ Configuração completa!');
    console.log(`\n🔗 Abrir planilha: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit\n`);
  } catch (err) {
    console.error('❌ Erro ao configurar sheets:', err.message);
    if (err.response?.data?.error) {
      console.error('Detalhes:', JSON.stringify(err.response.data.error, null, 2));
    }
    process.exit(1);
  }
}

setupSheets();
