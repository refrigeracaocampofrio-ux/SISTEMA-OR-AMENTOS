require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = require('../services/db');

async function checkOrcamento() {
  try {
    // Buscar o último orçamento criado
    const [rows] = await pool.query(
      'SELECT * FROM orcamentos ORDER BY id DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      console.log('❌ Nenhum orçamento encontrado no banco de dados');
      return;
    }
    
    const orc = rows[0];
    console.log('\n✅ Último orçamento criado:');
    console.log(`ID: ${orc.id}`);
    console.log(`Protocolo: ${orc.protocolo}`);
    console.log(`Cliente ID: ${orc.cliente_id}`);
    console.log(`Equipamento: ${orc.equipamento || 'N/A'}`);
    console.log(`Defeito: ${orc.defeito || 'N/A'}`);
    console.log(`Valor Total: R$ ${orc.valor_total || 0}`);
    console.log(`Validade: ${orc.validade || 'N/A'}`);
    console.log(`Garantia: ${orc.garantia || 'N/A'}`);
    console.log(`Técnico: ${orc.tecnico || 'N/A'}`);
    console.log(`Observações: ${orc.observacoes || 'N/A'}`);
    console.log(`Status: ${orc.status}`);
    console.log(`Data Criação: ${orc.data_criacao}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

checkOrcamento();
