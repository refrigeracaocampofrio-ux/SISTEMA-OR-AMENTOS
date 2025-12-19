const mysql = require('mysql2/promise');
require('dotenv').config();

async function truncateWithConnection(conn) {
  console.log(
    'Limpando tabelas de teste (orcamento_itens, orcamentos, clientes, movimentacao_estoque, ordens_servico)...',
  );
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  await conn.query('TRUNCATE TABLE orcamento_itens');
  await conn.query('TRUNCATE TABLE orcamentos');
  await conn.query('TRUNCATE TABLE ordens_servico');
  await conn.query('TRUNCATE TABLE movimentacao_estoque');
  await conn.query('TRUNCATE TABLE estoque');
  await conn.query('TRUNCATE TABLE clientes');
  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('Tabelas truncadas.');
}

async function run() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'sistema_orcamento';
  const appUser = process.env.DB_USER || process.env.USER || 'marciel';
  const appPass = process.env.DB_PASS || process.env.DB_PASSWORD || '142514';

  // Attempt only with application credentials (no root fallback for safety)
  try {
    const pool = await mysql.createPool({
      host: dbHost,
      user: appUser,
      password: appPass,
      database: dbName,
    });
    const conn = await pool.getConnection();
    try {
      await truncateWithConnection(conn);
      conn.release();
      await pool.end();
      return;
    } finally {
      try {
        conn.release();
      } catch (e) {}
      try {
        await pool.end();
      } catch (e) {}
    }
  } catch (err) {
    console.error(
      'Falha ao conectar com usuário da app; atualize `.env` com credenciais válidas:',
      err.message,
    );
    process.exitCode = 1;
    return;
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
