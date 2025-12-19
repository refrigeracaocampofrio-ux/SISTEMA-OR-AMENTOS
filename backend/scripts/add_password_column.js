const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'marciel',
    password: process.env.DB_PASS || '142514',
    database: process.env.DB_NAME || 'sistema_orcamento',
  });

  try {
    const [rows] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'password_hash'`,
      [process.env.DB_NAME || 'sistema_orcamento'],
    );
    if (rows.length === 0) {
      console.log('Coluna password_hash não existe — adicionando...');
      await conn.query('ALTER TABLE clientes ADD COLUMN password_hash VARCHAR(255) NULL');
      console.log('Coluna adicionada.');
    } else {
      console.log('Coluna password_hash já existe.');
    }
  } catch (err) {
    console.error('Erro ao checar/adicionar coluna:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
