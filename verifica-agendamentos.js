const mysql = require('mysql2/promise');

async function testarTabela() {
  try {
    console.log('🔍 Testando conexão com MySQL...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // tente sem senha primeiro
      database: 'sistema_orcamento'
    });
    
    console.log('✅ Conectado ao banco!');
    
    // Verificar se tabela existe
    const [tables] = await connection.query("SHOW TABLES LIKE 'agendamentos'");
    
    if (tables.length === 0) {
      console.log('\n❌ ERRO: Tabela "agendamentos" NÃO EXISTE!');
      console.log('\n📋 SOLUÇÃO:\n');
      console.log('1. Abra MySQL Workbench ou mysql CLI');
      console.log('2. Abra o arquivo: EXECUTAR_ISTO_NO_MYSQL.sql');
      console.log('3. Execute o script no banco "sistema_orcamento"');
      console.log('4. Recarregue esta página no navegador');
      
      await connection.end();
      process.exit(1);
    }
    
    console.log('\n✅ Tabela agendamentos EXISTE!');
    
    // Ver estrutura
    const [structure] = await connection.query('DESCRIBE agendamentos');
    console.log('\n📊 Colunas da tabela:');
    structure.forEach(col => {
      console.log(`  ✓ ${col.Field}: ${col.Type}`);
    });
    
    // Contar registros
    const [count] = await connection.query('SELECT COUNT(*) as total FROM agendamentos');
    console.log(`\n📈 Total de agendamentos: ${count[0].total}`);
    
    console.log('\n✅ ✅ ✅ TUDO OK! Pode recarregar o navegador! ✅ ✅ ✅');
    
    await connection.end();
    
  } catch (err) {
    console.log('\n❌ ERRO DE CONEXÃO:', err.message);
    
    if (err.message.includes('Access denied')) {
      console.log('\n⚠️  Verifique a senha do MySQL (password no .env)');
    } else if (err.message.includes('Unknown database')) {
      console.log('\n⚠️  Banco "sistema_orcamento" não existe');
      console.log('   Execute: CREATE DATABASE sistema_orcamento;');
    }
    
    process.exit(1);
  }
}

testarTabela();
