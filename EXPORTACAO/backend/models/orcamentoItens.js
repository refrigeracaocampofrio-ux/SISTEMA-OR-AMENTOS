const pool = require('../services/db');

async function insertItem({ orcamento_id, nome_peca, quantidade, valor_unitario }) {
  const [res] = await pool.query(
    'INSERT INTO orcamento_itens (orcamento_id, nome_peca, quantidade, valor_unitario) VALUES (?, ?, ?, ?)',
    [orcamento_id, nome_peca, quantidade, valor_unitario],
  );
  return { id: res.insertId };
}

async function listByOrcamento(orcamento_id) {
  const [rows] = await pool.query(
    'SELECT id, nome_peca, quantidade, valor_unitario FROM orcamento_itens WHERE orcamento_id = ?',
    [orcamento_id],
  );
  return rows;
}

module.exports = { insertItem, listByOrcamento };
