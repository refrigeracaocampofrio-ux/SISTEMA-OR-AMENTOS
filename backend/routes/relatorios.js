const express = require('express');
const router = express.Router();
const relatoriosCtrl = require('../controllers/relatoriosController');
const { requireAuth } = require('../middleware/auth');

// Relatório mensal (mês/ano)
router.get('/mensal', requireAuth, relatoriosCtrl.mensal);

// Relatório financeiro por período (data_inicio, data_fim)
router.get('/financeiro', requireAuth, relatoriosCtrl.financeiro);

module.exports = router;