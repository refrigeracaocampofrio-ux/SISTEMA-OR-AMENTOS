const express = require('express');
const router = express.Router();
const exportCtrl = require('../controllers/exportController');
const { requireAuth } = require('../middleware/auth');

router.get('/csv', requireAuth, exportCtrl.csv);
router.get('/excel', requireAuth, exportCtrl.excel);
router.get('/pdf', requireAuth, exportCtrl.pdf);

module.exports = router;