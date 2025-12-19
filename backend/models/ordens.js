const pool = require('../services/db');

async function createOrdem({ orcamento_id, status }) {
  const [res] = await pool.query(
    'INSERT INTO ordens_servico (orcamento_id, status, data_criacao) VALUES (?, ?, NOW())',
    [orcamento_id, status],
  );
  const id = res.insertId;
  const protocolo = `OS-${new Date().getFullYear()}-${String(id).padStart(5, '0')}`;
  await pool.query('UPDATE ordens_servico SET protocolo = ? WHERE id = ?', [protocolo, id]);
  return { id, protocolo };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM ordens_servico WHERE id = ?', [id]);
  return rows[0];
}

async function updateStatus(id, status) {
  if (status === 'CONCLUIDO' || status === 'CONCLUIDO') {
    await pool.query('UPDATE ordens_servico SET status = ?, data_conclusao = NOW() WHERE id = ?', [
      status,
      id,
    ]);
  } else {
    await pool.query('UPDATE ordens_servico SET status = ? WHERE id = ?', [status, id]);
  }
}

async function listAll() {
  const [rows] = await pool.query('SELECT * FROM ordens_servico ORDER BY data_criacao DESC');
  return rows;
}

module.exports = { createOrdem, findById, updateStatus, listAll };
