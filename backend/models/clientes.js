const pool = require('../services/db');

async function createCliente({ nome, email, telefone, password_hash }) {
  const [res] = await pool.query(
    'INSERT INTO clientes (nome, email, telefone, password_hash) VALUES (?, ?, ?, ?)',
    [nome, email, telefone, password_hash || null],
  );
  return { id: res.insertId, nome, email, telefone };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, nome, email, telefone FROM clientes WHERE id = ?', [
    id,
  ]);
  return rows[0];
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, nome, email, telefone, password_hash FROM clientes WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0];
}

// Alias para compatibilidade
async function create(dados) {
  return createCliente(dados);
}

module.exports = { createCliente, create, findById, findByEmail };
