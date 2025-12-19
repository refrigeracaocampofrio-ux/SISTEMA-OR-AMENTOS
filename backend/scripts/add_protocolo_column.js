const pool = require('../services/db');

async function addProtocoloColumn() {
  try {
    console.log('Adicionando coluna protocolo à tabela orcamentos...');
    
    // Verificar se coluna já existe
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orcamentos' AND COLUMN_NAME = 'protocolo'
    `);
    
    if (columns.length > 0) {
      console.log('Coluna protocolo já existe');
      process.exit(0);
    }
    
    // Adicionar coluna
    await pool.query(`ALTER TABLE orcamentos ADD COLUMN protocolo VARCHAR(50) UNIQUE AFTER id`);
    console.log('✅ Coluna protocolo adicionada');
    
    // Gerar protocolos para registros existentes
    const [orcamentos] = await pool.query('SELECT id FROM orcamentos WHERE protocolo IS NULL ORDER BY id');
    
    for (const orc of orcamentos) {
      const protocolo = `ORC-${new Date().getFullYear()}-${String(orc.id).padStart(5, '0')}`;
      await pool.query('UPDATE orcamentos SET protocolo = ? WHERE id = ?', [protocolo, orc.id]);
    }
    
    console.log(`✅ ${orcamentos.length} protocolos gerados`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

addProtocoloColumn();
