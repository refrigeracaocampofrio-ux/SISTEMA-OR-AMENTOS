// Insere o usuário admin marciel com senha 142514 no banco
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendEnv = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
}

async function run() {
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

    // Criar tabela usuarios se não existir
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.execute(createTableSql);

    // Hash da senha 142514
    const plainPassword = '142514';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Inserir ou atualizar usuário marciel
    const sql = `
      INSERT INTO usuarios (nome, email, senha, criado_em)
      VALUES ('Marciel', 'marciel@refrigeracaocampofrio.com.br', ?, NOW())
      ON DUPLICATE KEY UPDATE senha = ?
    `;

    await connection.execute(sql, [hashedPassword, hashedPassword]);
    await connection.end();

    console.log(JSON.stringify({ success: true, message: 'Usuario marciel criado/atualizado com sucesso' }));
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  }
}

run();
