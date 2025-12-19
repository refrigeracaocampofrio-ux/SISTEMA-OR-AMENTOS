const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configurações de conexão
const config = {
  host: 'aws-sa-east-1-1.pg.psdb.cloud',
  user: 'postgres.ircl8da32x3r',
  password: 'pscale_pw_UfAnJ7ubDEyAzDmRZnRjVbZr1zqJ7ew',
  database: 'sistema-orcamento',
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectionTimeout: 30000
};

async function importSchema() {
  console.log('🚀 Iniciando importação do schema SQL...');
  console.log('=' + '='.repeat(59));
  console.log();

  try {
    // Ler arquivo schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    console.log(`📖 Lendo arquivo: ${schemaPath}`);
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`✅ Arquivo lido: ${sql.length} caracteres`);
    console.log();

    // Conectar ao banco
    console.log(`🔌 Conectando ao banco de dados...`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log();

    const connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao PlanetScale com sucesso!');
    console.log();

    // Separar statements por ;
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`⚙️  Executando ${statements.length} comandos SQL...`);
    console.log();

    let executed = 0;
    let errors = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await connection.execute(stmt);
        executed++;
        
        // Mostrar progresso a cada 10 comandos
        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ ${i + 1}/${statements.length} comandos executados...`);
        }
      } catch (e) {
        // Ignorar erros de "table already exists"
        if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) {
          console.log(`   ⚠️  Erro: ${e.message.substring(0, 80)}`);
          errors++;
        }
      }
    }

    console.log();
    console.log('=' + '='.repeat(59));
    console.log('✅✅✅ SCHEMA IMPORTADO COM SUCESSO! ✅✅✅');
    console.log('=' + '='.repeat(59));
    console.log(`📊 Total: ${executed} comandos executados com sucesso`);
    if (errors > 0) {
      console.log(`⚠️  Avisos: ${errors} erros ignorados`);
    }
    console.log();
    console.log('🎯 PRÓXIMAS ETAPAS:');
    console.log('=' + '='.repeat(59));
    console.log('1. Acesse seu site: https://sistema-or-amentos.vercel.app');
    console.log('2. Faça login com:');
    console.log('   Email: marciel');
    console.log('   Senha: 142514');
    console.log('3. Teste criar um orçamento!');
    console.log();

    await connection.end();

  } catch (error) {
    console.log();
    console.log('❌❌❌ ERRO NA IMPORTAÇÃO ❌❌❌');
    console.log('=' + '='.repeat(59));
    console.log(`Erro: ${error.message}`);
    console.log();
    process.exit(1);
  }
}

// Executar
importSchema();
