const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', ctrl.listar); // Listar é público
router.post('/', requireAuth, ctrl.criar);
router.get('/:id', requireAuth, ctrl.detalhe);
router.put('/:id', requireAuth, ctrl.atualizar);
router.delete('/:id', requireAuth, ctrl.remover);

// Rotas públicas para agendamento público
router.get('/buscar/:query', ctrl.buscarClientePorTelefoneOuProtocolo); // Público - buscar por protocolo ou telefone
router.post('/novo-protocolo', ctrl.gerarNovoProtocolo); // Público - gerar novo protocolo
router.get('/agendamentos/:telefone', ctrl.listarAgendamentosCliente); // Público - listar agendamentos

module.exports = router;
