const pool = require('../services/db');

async function insertMovimentacao({ estoque_id, quantidade, tipo }) {
  const [res] = await pool.query(
    'INSERT INTO movimentacao_estoque (estoque_id, quantidade, tipo, data) VALUES (?, ?, ?, NOW())',
    [estoque_id, quantidade, tipo],
  );
  return { id: res.insertId };
}

async function listByEstoque(estoque_id) {
  const [rows] = await pool.query(
    'SELECT * FROM movimentacao_estoque WHERE estoque_id = ? ORDER BY data DESC',
    [estoque_id],
  );
  return rows;
}

module.exports = { insertMovimentacao, listByEstoque };
