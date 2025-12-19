const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/agendamentosController');
const { requireAuth } = require('../middleware/auth');

// Rotas públicas (para o formulário de agendamento)
router.get('/horarios-disponiveis/:data', ctrl.horariosDisponiveis);
router.post('/', ctrl.criar);

// Rotas protegidas (requerem autenticação)
router.get('/', requireAuth, ctrl.listar);
router.get('/:id', requireAuth, ctrl.buscarPorId);
router.put('/:id', requireAuth, ctrl.atualizar);
router.put('/:id/status', requireAuth, ctrl.atualizarStatus);
router.delete('/:id', requireAuth, ctrl.deletar);

module.exports = router;
