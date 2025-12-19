require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../services/db');

async function addProtocoloToOrdens() {
  try {
    // Verifica se a coluna existe
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'ordens_servico' 
      AND COLUMN_NAME = 'protocolo'
    `);

    if (columns.length === 0) {
      console.log('Adicionando coluna protocolo à tabela ordens_servico...');
      await pool.query(`
        ALTER TABLE ordens_servico 
        ADD COLUMN protocolo VARCHAR(50) UNIQUE AFTER id
      `);
      console.log('✅ Coluna protocolo adicionada com sucesso');
    } else {
      console.log('✅ Coluna protocolo já existe');
    }

    // Gera protocolo para ordens que não têm
    const [ordens] = await pool.query(`
      SELECT id FROM ordens_servico WHERE protocolo IS NULL
    `);

    if (ordens.length > 0) {
      console.log(`Gerando ${ordens.length} protocolos faltantes...`);
      for (const ordem of ordens) {
        const protocolo = `OS-${new Date().getFullYear()}-${String(ordem.id).padStart(5, '0')}`;
        await pool.query(`
          UPDATE ordens_servico SET protocolo = ? WHERE id = ?
        `, [protocolo, ordem.id]);
      }
      console.log(`✅ ${ordens.length} protocolos gerados`);
    } else {
      console.log('✅ Todos os protocolos já estão preenchidos');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

addProtocoloToOrdens();
