const estoqueModel = require('../models/estoque');

async function criarPeca(req, res, next) {
  try {
    const { nome_peca, quantidade } = req.body;
    if (!nome_peca || quantidade == null) {
      return res.status(400).json({ error: 'nome_peca e quantidade obrigatórios' });
    }
    const r = await estoqueModel.createOrUpdate(nome_peca, Number(quantidade));
    res.status(201).json(r);
  } catch (err) {
    next(err);
  }
}

async function movimentacao(req, res, next) {
  try {
    const { id } = req.params;
    const { tipo, quantidade } = req.body;
    if (!tipo || quantidade == null) {
      return res.status(400).json({ error: 'tipo e quantidade obrigatórios' });
    }
    const r = await estoqueModel.updateQuantity(id, Number(quantidade), tipo);
    res.json(r);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const rows = await estoqueModel.listAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { criarPeca, movimentacao, listar };
