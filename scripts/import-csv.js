/*
  Generic CSV importer for MySQL using mapping.json
  Usage examples:
  - npm run import:csv -- --dry-run
  - npm run import:csv -- --truncate
  - npm run import:csv -- --table=clientes
  - npm run import:csv -- --limit=100
*/

const fs = require('fs');
const path = require('path');
const pool = require('../backend/services/db');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (const a of args) {
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--truncate') opts.truncate = true;
    else if (a.startsWith('--table=')) opts.table = a.split('=')[1];
    else if (a.startsWith('--limit=')) opts.limit = parseInt(a.split('=')[1], 10) || undefined;
  }
  return opts;
}

// Basic CSV parser supporting quoted values and commas
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { // escaped quote
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
    }
    result.push(cur);
    return result;
  };
  const headers = parseLine(lines[0]).map(h => h.trim());
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function coerceValue(val) {
  const v = val === undefined ? null : String(val).trim();
  if (v === '' || v.toLowerCase() === 'null') return null;
  // Try number
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  // Try date in DD/MM/YYYY or YYYY-MM-DD
  const dmy = v.match(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/);
  if (dmy) {
    const [_, d, m, y] = dmy;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  const ymd = v.match(/^(\d{4})-([0-1]?\d)-([0-3]?\d)$/);
  if (ymd) {
    const [_, y, m, d] = ymd;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // Times HH:MM(:SS)
  const time = v.match(/^([0-2]?\d):([0-5]\d)(?::([0-5]\d))?$/);
  if (time) {
    const [_, hh, mm, ss] = time;
    return `${hh.padStart(2,'0')}:${mm.padStart(2,'0')}${ss?':'+ss.padStart(2,'0'):''}`;
  }
  return v;
}

async function tableExists(table) {
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', [process.env.DB_DATABASE || 'sistema_orcamento', table]);
  return rows[0]?.c > 0;
}

async function truncateTable(table) {
  await pool.query(`TRUNCATE TABLE ${table}`);
}

async function importTable(name, cfg, opts) {
  const filePath = path.join(__dirname, '..', 'database', 'import', cfg.file);
  if (!fs.existsSync(filePath)) {
    console.error(`[${name}] CSV não encontrado: ${filePath}`);
    return { inserted: 0, skipped: 0, errors: 0 };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const { headers, rows } = parseCSV(content);
  const headerIndex = new Map(headers.map((h, i) => [h, i]));

  // Build insert columns list
  const colMap = cfg.columns || {};
  const dbCols = Object.values(colMap);
  const defaults = cfg.defaults || {};
  const dedupe = cfg.dedupe || null;

  if (dbCols.length === 0) {
    console.error(`[${name}] mapping.columns está vazio.`);
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  let inserted = 0, skipped = 0, errors = 0;

  const limit = opts.limit || rows.length;
  for (let r = 0; r < Math.min(rows.length, limit); r++) {
    const line = rows[r];
    // Build values from mapping
    const values = dbCols.map((dbCol) => {
      const csvHeader = Object.keys(colMap).find(k => colMap[k] === dbCol);
      const idx = headerIndex.get(csvHeader);
      const raw = idx !== undefined ? line[idx] : undefined;
      const v = raw !== undefined ? raw : defaults[dbCol];
      return coerceValue(v);
    });

    // Dedupe check
    if (dedupe && Array.isArray(dedupe.by) && dedupe.by.length > 0 && !opts.dryRun) {
      const whereCols = dedupe.by.filter(c => dbCols.includes(c));
      if (whereCols.length > 0) {
        const whereVals = whereCols.map(c => values[dbCols.indexOf(c)]);
        const whereClause = whereCols.map(c => `${c} = ?`).join(' AND ');
        try {
          const [exist] = await pool.query(`SELECT id FROM ${name} WHERE ${whereClause} LIMIT 1`, whereVals);
          if (exist.length > 0) {
            skipped++;
            continue;
          }
        } catch (e) {
          console.warn(`[${name}] Falha no dedupe, seguindo com insert:`, e.message);
        }
      }
    }

    // Insert
    if (!opts.dryRun) {
      try {
        const placeholders = dbCols.map(() => '?').join(', ');
        const sql = `INSERT INTO ${name} (${dbCols.join(', ')}) VALUES (${placeholders})`;
        await pool.query(sql, values);
        inserted++;
      } catch (e) {
        errors++;
        console.error(`[${name}] Erro ao inserir linha ${r+2}:`, e.message);
      }
    } else {
      // Dry run: just count usable rows
      inserted++;
    }
  }

  return { inserted, skipped, errors };
}

async function main() {
  const opts = parseArgs();
  const importDir = path.join(__dirname, '..', 'database', 'import');
  const mappingPath = path.join(importDir, 'mapping.json');
  const samplePath = path.join(importDir, 'mapping.sample.json');

  if (!fs.existsSync(mappingPath)) {
    console.error(`Arquivo mapping.json não encontrado em ${mappingPath}`);
    if (fs.existsSync(samplePath)) {
      console.error(`Copie mapping.sample.json para mapping.json e ajuste os mapeamentos.`);
    }
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const tables = Object.keys(mapping).filter(t => !opts.table || opts.table === t);
  if (tables.length === 0) {
    console.error('Nenhuma tabela para importar. Verifique --table ou mapping.json.');
    process.exit(1);
  }

  // Validate tables exist
  for (const t of tables) {
    if (!(await tableExists(t))) {
      console.error(`Tabela '${t}' não existe no banco. Execute os scripts em database/*.sql antes.`);
      process.exit(1);
    }
  }

  if (opts.truncate && !opts.dryRun) {
    for (const t of tables) {
      console.log(`[${t}] TRUNCATE`);
      await truncateTable(t);
    }
  }

  const summary = {};
  for (const t of tables) {
    console.log(`[${t}] Importando de ${mapping[t].file}...${opts.dryRun ? ' (dry-run)' : ''}`);
    summary[t] = await importTable(t, mapping[t], opts);
  }

  console.log('Resumo da importação:');
  for (const [t, s] of Object.entries(summary)) {
    console.log(`- ${t}: inseridos=${s.inserted}, duplicados=${s.skipped}, erros=${s.errors}`);
  }

  await pool.end();
}

main().catch(err => {
  console.error('Falha na importação:', err);
  process.exit(1);
});
