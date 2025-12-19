const pool = require('../services/db');

async function createOrcamento({ cliente_id, valor_total, status, equipamento, defeito, validade, garantia, tecnico, observacoes }) {
  const [res] = await pool.query(
    `INSERT INTO orcamentos (cliente_id, valor_total, status, equipamento, defeito, validade, garantia, tecnico, observacoes, data_criacao) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [cliente_id, valor_total, status, equipamento, defeito, validade, garantia, tecnico, observacoes],
  );
  const id = res.insertId;
  const protocolo = `ORC-${new Date().getFullYear()}-${String(id).padStart(5, '0')}`;
  await pool.query('UPDATE orcamentos SET protocolo = ? WHERE id = ?', [protocolo, id]);
  return { id, protocolo };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM orcamentos WHERE id = ?', [id]);
  return rows[0];
}

async function updateStatus(id, status, motivo = null) {
  if (status === 'CANCELADO') {
    await pool.query('UPDATE orcamentos SET status = ?, motivo_cancelamento = ? WHERE id = ?', [
      status,
      motivo,
      id,
    ]);
  } else {
    await pool.query('UPDATE orcamentos SET status = ? WHERE id = ?', [status, id]);
  }
}

async function listAll() {
  const [rows] = await pool.query('SELECT * FROM orcamentos ORDER BY data_criacao DESC');
  return rows;
}

module.exports = { createOrcamento, findById, updateStatus, listAll };
