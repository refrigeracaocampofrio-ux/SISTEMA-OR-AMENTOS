const mysql = require('mysql2/promise');

// Safely read and trim env values to avoid CRLF/newline issues from Vercel UI
function envTrim(key, fallback) {
  const val = process.env[key];
  if (typeof val === 'string') {
    // Remove "yes\n" or "yes\r\n" prefix from Vercel CLI bug
    let cleaned = val.replace(/^yes[\r\n]+/i, '');
    cleaned = cleaned.trim();
    return cleaned.length ? cleaned : (fallback ?? '');
  }
  return fallback ?? '';
}

const hostRaw = envTrim('DB_HOST', '');
const userRaw = envTrim('DB_USER', '');
const passRaw = envTrim('DB_PASSWORD', envTrim('DB_PASS', ''));
const dbRaw = envTrim('DB_DATABASE', envTrim('DB_NAME', ''));
const portRaw = envTrim('DB_PORT', '');

const user = userRaw || 'root';
const password = passRaw || '';
// Detect PlanetScale MySQL by password prefix or host domain
const isPlanetScale = password.startsWith('pscale_pw_') || (hostRaw && hostRaw.includes('psdb.cloud'));
// Use correct PlanetScale MySQL host fallback
const host = hostRaw || (isPlanetScale ? 'aws-sa-east-1-1.connect.psdb.cloud' : 'localhost');
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
