const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/estoqueController');

router.post('/', ctrl.criarPeca);
router.put('/:id/movimentacao', ctrl.movimentacao);
router.get('/', ctrl.listar);

module.exports = router;
