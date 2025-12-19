const pool = require('../services/db');

async function findByName(nome_peca) {
  const [rows] = await pool.query('SELECT * FROM estoque WHERE nome_peca = ? LIMIT 1', [nome_peca]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM estoque WHERE id = ?', [id]);
  return rows[0];
}

async function createOrUpdate(nome_peca, quantidade) {
  const existing = await findByName(nome_peca);
  if (existing) {
    const nova = Number(existing.quantidade) + Number(quantidade);
    await pool.query('UPDATE estoque SET quantidade = ? WHERE id = ?', [nova, existing.id]);
    await pool.query(
      'INSERT INTO movimentacao_estoque (estoque_id, quantidade, tipo, data) VALUES (?, ?, ?, NOW())',
      [existing.id, quantidade, 'entrada'],
    );
    return { id: existing.id, nome_peca, quantidade: nova };
  }
  const [r] = await pool.query('INSERT INTO estoque (nome_peca, quantidade) VALUES (?, ?)', [
    nome_peca,
    quantidade,
  ]);
  await pool.query(
    'INSERT INTO movimentacao_estoque (estoque_id, quantidade, tipo, data) VALUES (?, ?, ?, NOW())',
    [r.insertId, quantidade, 'entrada'],
  );
  return { id: r.insertId, nome_peca, quantidade };
}

async function updateQuantity(id, quantidade, tipo) {
  const item = await findById(id);
  if (!item) {
    throw new Error('Peça não encontrada');
  }
  let nova = Number(item.quantidade);
  if (tipo === 'entrada') {
    nova += Number(quantidade);
  } else if (tipo === 'saida') {
    if (nova < quantidade) {
      throw new Error('Estoque insuficiente');
    }
    nova -= Number(quantidade);
  }
  await pool.query('UPDATE estoque SET quantidade = ? WHERE id = ?', [nova, id]);
  await pool.query(
    'INSERT INTO movimentacao_estoque (estoque_id, quantidade, tipo, data) VALUES (?, ?, ?, NOW())',
    [id, quantidade, tipo],
  );
  return { id, nome_peca: item.nome_peca, quantidade: nova };
}

async function listAll() {
  const [rows] = await pool.query('SELECT * FROM estoque ORDER BY nome_peca');
  return rows;
}

module.exports = { findByName, findById, createOrUpdate, updateQuantity, listAll };
