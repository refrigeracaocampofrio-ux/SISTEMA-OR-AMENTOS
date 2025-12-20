const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const router = express.Router();

// Roda o schema.sql no banco (usar apenas para inicializar)
router.post('/run-schema', async (req, res) => {
  const token = req.query.token || req.headers['x-admin-token'];
  const expected = process.env.ADMIN_SCHEMA_TOKEN || 'temp-run-schema';
  if (!token || token !== expected) {
    return res.status(401).json({ success: false, error: 'unauthorized' });
  }

  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    return res.status(404).json({ success: false, error: 'schema.sql not found' });
  }

  const DB_HOST = process.env.DB_HOST;
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD;
  const DB_DATABASE = process.env.DB_DATABASE || process.env.DB_NAME;
  const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('--'))
      // PlanetScale já define o DB; ignorar CREATE DATABASE/USE
      .filter((s) => {
        const up = s.toUpperCase();
        if (up.startsWith('CREATE DATABASE')) return false;
        if (up.startsWith('USE ')) return false;
        return true;
      });

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      port: DB_PORT,
      ssl: { rejectUnauthorized: false },
    });

    let executed = 0;
    let skipped = 0;
    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
        executed += 1;
      } catch (e) {
        // Ignora erros de tabela já existente
        if (e.message && e.message.toLowerCase().includes('exists')) {
          skipped += 1;
        } else {
          await connection.end();
          return res.status(500).json({ success: false, error: e.message });
        }
      }
    }

    await connection.end();
    return res.json({ success: true, executed, skipped });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, details: err.stack });
  }
});

// Verifica conexao e variaveis do banco
router.get('/db-check', async (req, res) => {
  const info = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_DATABASE: process.env.DB_DATABASE || process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || '3306',
  };
  try {
    const connection = await mysql.createConnection({
      host: info.DB_HOST,
      user: info.DB_USER,
      password: process.env.DB_PASSWORD,
      database: info.DB_DATABASE,
      port: Number(info.DB_PORT),
      ssl: { rejectUnauthorized: false },
    });
    const [rows] = await connection.query('SELECT 1 as ok');
    await connection.end();
    return res.json({ success: true, info, ping: rows });
  } catch (err) {
    return res.status(500).json({ success: false, info, error: err.message });
  }
});

module.exports = router;
