const mysql = require('mysql2/promise');

// Safely read and trim env values to avoid CRLF/newline issues from Vercel UI
function envTrim(key, fallback) {
  const val = process.env[key];
  if (typeof val === 'string') {
    const t = val.trim();
    return t.length ? t : (fallback ?? '');
  }
  return fallback ?? '';
}

const hostRaw = envTrim('DB_HOST', '');
const userRaw = envTrim('DB_USER', '');
const passRaw = envTrim('DB_PASSWORD', envTrim('DB_PASS', ''));
const dbRaw = envTrim('DB_DATABASE', envTrim('DB_NAME', ''));
const portRaw = envTrim('DB_PORT', '');

const host = hostRaw || 'localhost';
const user = userRaw || 'root';
const password = passRaw || '';
const database = dbRaw || 'sistema_orcamento';
const port = Number(portRaw || 3306);

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  ssl: host && host.includes('psdb.cloud') ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
