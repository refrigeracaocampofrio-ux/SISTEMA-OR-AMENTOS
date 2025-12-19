async function detalheOuProtocolo(req, res, next) {
  try {
    const { id } = req.params;
    // Tenta como ID primeiro
    const o = await require('../models/orcamentos').findById(id);
    if (o) {
      const cliente = await require('../models/clientes').findById(o.cliente_id);
      const itens = await require('../models/orcamentoItens').listByOrcamento(o.id);
      return res.json({ ...o, cliente, itens });
    }
    
    // Tenta como protocolo
    const [rows] = await require('../services/db').query('SELECT * FROM orcamentos WHERE protocolo = ?', [id]);
    if (rows.length > 0) {
      const o = rows[0];
      const cliente = await require('../models/clientes').findById(o.cliente_id);
      const itens = await require('../models/orcamentoItens').listByOrcamento(o.id);
      return res.json({ ...o, cliente, itens });
    }
    
    return res.status(404).json({ error: 'Orçamento não encontrado' });
  } catch (err) {
    next(err);
  }
}

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orcamentosController');
const { requireAuth } = require('../middleware/auth');

// Protege ações que disparam e-mails e mudam estado
router.post('/', requireAuth, ctrl.criarOrcamento);
router.put('/:id/status', requireAuth, ctrl.atualizarStatus);
router.delete('/:id', requireAuth, ctrl.deletarOrcamento);
router.get('/', ctrl.listar);
router.get('/:id', detalheOuProtocolo);

// Rotas PDF
router.get('/:id/pdf', ctrl.gerarPDFOrcamento);
router.post('/:id/pdf/enviar', requireAuth, ctrl.enviarPDFOrcamento);

module.exports = router;
