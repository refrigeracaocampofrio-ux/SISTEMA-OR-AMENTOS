const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const rootUser = process.env.ROOT_DB_USER || process.env.DB_ROOT_USER || 'root';
  const rootPass =
    process.env.ROOT_DB_PASS || process.env.DB_ROOT_PASS || process.env.MYSQL_ROOT_PASSWORD;
  if (!rootPass) {
    console.error(
      'Root DB password not provided in ROOT_DB_PASS or DB_ROOT_PASS or MYSQL_ROOT_PASSWORD',
    );
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: rootUser,
    password: rootPass,
    multipleStatements: true,
  });

  try {
    console.log('Conectado como root, aplicando schema...');
    await conn.query(sql);
    console.log('Schema aplicado com sucesso.');

    // ensure user exists and has privileges
    const appUser = process.env.DB_USER || 'marciel';
    const appPass = process.env.DB_PASS || '142514';
    const createUserSql = `CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?; GRANT ALL PRIVILEGES ON ${process.env.DB_NAME || 'sistema_orcamento'}.* TO ?@'localhost'; FLUSH PRIVILEGES;`;
    // mysql2 does not allow placeholders for identifiers in CREATE USER; use manual escaping
    await conn
      .query(`CREATE USER IF NOT EXISTS '${appUser}'@'localhost' IDENTIFIED BY '${appPass}';`)
      .catch(() => {});
    await conn.query(
      `GRANT ALL PRIVILEGES ON ${process.env.DB_NAME || 'sistema_orcamento'}.* TO '${appUser}'@'localhost';`,
    );
    await conn.query('FLUSH PRIVILEGES;');
    console.log(`Usuário ${appUser}@localhost criado/garantido.`);
  } catch (err) {
    console.error('Erro ao aplicar schema/criar usuário:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
