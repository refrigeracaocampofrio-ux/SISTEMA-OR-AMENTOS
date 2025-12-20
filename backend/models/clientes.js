const pool = require('../services/db');

async function createCliente({ nome, email, telefone, password_hash, protocolo }) {
  const [res] = await pool.query(
    'INSERT INTO clientes (protocolo, nome, email, telefone, password_hash) VALUES (?, ?, ?, ?, ?)',
    [protocolo || null, nome, email, telefone, password_hash || null],
  );
  return { id: res.insertId, protocolo, nome, email, telefone };
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

async function listar() {
  const [rows] = await pool.query('SELECT id, nome, email, telefone FROM clientes ORDER BY id DESC');
  return rows;
}

async function findByPhone(telefone) {
  const [rows] = await pool.query(
    'SELECT id, nome, email, telefone FROM clientes WHERE telefone = ? LIMIT 1',
    [telefone],
  );
  return rows[0];
}

async function buscarPorProtocolo(protocolo) {
  const [rows] = await pool.query(
    'SELECT id, protocolo, nome, email, telefone FROM clientes WHERE protocolo = ? LIMIT 1',
    [protocolo],
  );
  return rows[0];
}

// Alias para compatibilidade
async function create(dados) {
  return createCliente(dados);
}

module.exports = { createCliente, create, findById, findByEmail, findByPhone, buscarPorProtocolo, listar };
