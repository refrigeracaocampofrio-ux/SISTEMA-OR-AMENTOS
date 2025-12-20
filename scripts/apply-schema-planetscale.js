const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'aws.connect.psdb.cloud',
    user: process.env.DB_USER || 'nsc5xiz7p38ujxgwww7g',
    password: process.env.DB_PASSWORD || 'pscale_pw_...',
    database: process.env.DB_DATABASE || 'sistema-rcf',
    port: 3306,
    ssl: { rejectUnauthorized: false },
    multipleStatements: false
  });

  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove CREATE DATABASE e USE statements (PlanetScale não permite)
    schema = schema.replace(/CREATE DATABASE.*?;/gi, '');
    schema = schema.replace(/USE .*;/gi, '');
    // Remove FOREIGN KEY constraints (PlanetScale/Vitess não permite)
    schema = schema.replace(/,?\s*FOREIGN KEY.*?\)/gi, '');
    schema = schema.replace(/,?\s*CONSTRAINT.*?REFERENCES.*?\)/gi, '');
    
    // Split por statement e executar um por vez
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executando ${statements.length} statements...`);
    
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
        const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`✓ ${preview}...`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERR') {
          console.log(`  (tabela já existe, ignorando)`);
        } else {
          console.error(`✗ Erro:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Schema aplicado com sucesso!');
  } catch (err) {
    console.error('Erro fatal:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
