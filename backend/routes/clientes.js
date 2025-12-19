const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', ctrl.listar); // Listar é público
router.post('/', requireAuth, ctrl.criar);
router.get('/:id', requireAuth, ctrl.detalhe);
router.put('/:id', requireAuth, ctrl.atualizar);
router.delete('/:id', requireAuth, ctrl.remover);

module.exports = router;
