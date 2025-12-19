const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordensController');
const { requireAuth } = require('../middleware/auth');

// Atualização de status pode enviar e-mail
router.put('/:id/status', requireAuth, ctrl.atualizarStatus);
router.delete('/:id', requireAuth, ctrl.deletarOrdem);
router.get('/', ctrl.listar);

// Rotas PDF
router.get('/:id/pdf', ctrl.gerarPDFOrdem);
router.post('/:id/pdf/enviar', requireAuth, ctrl.enviarPDFOrdem);

module.exports = router;
