const clientesModel = require('../models/clientes');

async function listar(req, res, next) {
  try {
    const [rows] = await require('../services/db').query(
      'SELECT id, nome, email, telefone FROM clientes ORDER BY nome',
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { nome, email, telefone } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ error: 'nome e email são obrigatórios' });
    }
    // evita duplicar
    const existente = await clientesModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'Cliente já cadastrado' });
    }
    const c = await clientesModel.createCliente({ nome, email, telefone });
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
}

async function detalhe(req, res, next) {
  try {
    const c = await clientesModel.findById(req.params.id);
    if (!c) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(c);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { nome, email, telefone } = req.body;
    const id = req.params.id;
    await require('../services/db').query(
      'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, email, telefone, id],
    );
    res.json({ id, nome, email, telefone });
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await require('../services/db').query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, detalhe, atualizar, remover };
