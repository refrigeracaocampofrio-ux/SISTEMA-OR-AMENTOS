require('dotenv').config();
const pool = require('./backend/services/db');

async function testarTabela() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Tentar listar a tabela
    const [rows] = await pool.query('SHOW TABLES LIKE "agendamentos"');
    
    if (rows.length === 0) {
      console.log('❌ ERRO: Tabela agendamentos NÃO existe!');
      console.log('\n📋 Solução: Execute o script EXECUTAR_ISTO_NO_MYSQL.sql no MySQL Workbench');
      process.exit(1);
    }
    
    console.log('✅ Tabela agendamentos existe!');
    
    // Ver estrutura
    const [structure] = await pool.query('DESCRIBE agendamentos');
    console.log('\n📊 Estrutura da tabela:');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // Contar registros
    const [count] = await pool.query('SELECT COUNT(*) as total FROM agendamentos');
    console.log(`\n📈 Total de agendamentos: ${count[0].total}`);
    
    console.log('\n✅ Tudo parece OK! Recarregue o navegador.');
    
  } catch (err) {
    console.log('❌ ERRO:', err.message);
    if (err.message.includes('no such table')) {
      console.log('⚠️  Tabela agendamentos não existe no banco de dados');
    }
    process.exit(1);
  }
}

testarTabela();
