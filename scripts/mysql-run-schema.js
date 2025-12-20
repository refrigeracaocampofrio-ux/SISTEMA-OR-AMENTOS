// Runs database/schema.sql against a MySQL-compatible server using env vars
// Env: DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE (or DB_NAME), DB_PORT

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Do NOT load dotenv here to avoid noisy logs; rely on envs passed by caller

async function run() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(JSON.stringify({ success: false, error: 'schema.sql not found', path: schemaPath }));
    process.exit(1);
  }

  const DB_HOST = process.env.DB_HOST;
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS;
  const DB_DATABASE = process.env.DB_DATABASE || process.env.DB_NAME;
  const DB_PORT = Number(process.env.DB_PORT || 3306);

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing DB env vars',
      info: { DB_HOST, DB_USER, hasPassword: Boolean(DB_PASSWORD), DB_DATABASE, DB_PORT },
    }));
    process.exit(1);
  }

  const raw = fs.readFileSync(schemaPath, 'utf8');
  const statements = raw
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'))
    .filter((s) => {
      const up = s.toUpperCase();
      if (up.startsWith('CREATE DATABASE')) return false;
      if (up.startsWith('USE ')) return false;
      return true;
    });

  const useSSL = DB_HOST.includes('psdb.cloud');
  const connConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  };

  try {
    const connection = await mysql.createConnection(connConfig);
    let executed = 0;
    let skipped = 0;
    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
        executed += 1;
      } catch (e) {
        if ((e.message || '').toLowerCase().includes('exists')) {
          skipped += 1;
        } else {
          await connection.end();
          console.error(JSON.stringify({ success: false, error: e.message }));
          process.exit(1);
        }
      }
    }
    await connection.end();
    const result = { success: true, executed, skipped };
    const outPath = process.env.SCHEMA_RUN_OUTPUT;
    if (outPath) {
      fs.writeFileSync(outPath, JSON.stringify(result));
    } else {
      console.log(JSON.stringify(result));
    }
  } catch (err) {
    const payload = { success: false, error: err.message };
    const outPath = process.env.SCHEMA_RUN_OUTPUT;
    if (outPath) {
      fs.writeFileSync(outPath, JSON.stringify(payload));
    } else {
      console.error(JSON.stringify(payload));
    }
    process.exit(1);
  }
}

run();
