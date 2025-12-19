require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../services/db');

async function addColumns() {
  try {
    console.log('Verificando e adicionando colunas ausentes à tabela orcamentos...');
    
    // Verifica se a coluna existe
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orcamentos' 
      AND COLUMN_NAME IN ('equipamento', 'defeito', 'validade', 'garantia', 'tecnico', 'observacoes', 'protocolo')
    `);

    console.log('Colunas existentes:', columns.map(c => c.COLUMN_NAME));

    const existingColumns = columns.map(c => c.COLUMN_NAME);
    const neededColumns = [
      { name: 'protocolo', sql: 'ALTER TABLE orcamentos ADD COLUMN protocolo VARCHAR(50) UNIQUE AFTER id' },
      { name: 'equipamento', sql: 'ALTER TABLE orcamentos ADD COLUMN equipamento VARCHAR(255) AFTER status' },
      { name: 'defeito', sql: 'ALTER TABLE orcamentos ADD COLUMN defeito TEXT AFTER equipamento' },
      { name: 'validade', sql: 'ALTER TABLE orcamentos ADD COLUMN validade INT DEFAULT 7 AFTER defeito' },
      { name: 'garantia', sql: 'ALTER TABLE orcamentos ADD COLUMN garantia INT DEFAULT 90 AFTER validade' },
      { name: 'tecnico', sql: 'ALTER TABLE orcamentos ADD COLUMN tecnico VARCHAR(255) AFTER garantia' },
      { name: 'observacoes', sql: 'ALTER TABLE orcamentos ADD COLUMN observacoes TEXT AFTER tecnico' },
    ];

    for (const col of neededColumns) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adicionando coluna ${col.name}...`);
        await pool.query(col.sql);
        console.log(`✅ Coluna ${col.name} adicionada com sucesso`);
      } else {
        console.log(`✅ Coluna ${col.name} já existe`);
      }
    }

    // Verifica se motivo_cancelamento existe
    const [motivo] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'orcamentos' 
      AND COLUMN_NAME = 'motivo_cancelamento'
    `);

    if (motivo.length === 0) {
      console.log('Adicionando coluna motivo_cancelamento...');
      await pool.query('ALTER TABLE orcamentos ADD COLUMN motivo_cancelamento TEXT AFTER data_criacao');
      console.log('✅ Coluna motivo_cancelamento adicionada');
    } else {
      console.log('✅ Coluna motivo_cancelamento já existe');
    }

    console.log('\n✅ Todas as colunas foram verificadas e adicionadas se necessário!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

addColumns();
