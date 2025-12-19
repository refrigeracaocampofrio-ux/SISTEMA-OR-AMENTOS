const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/debugController');

// POST /debug/send-test-email { to }
router.post('/send-test-email', ctrl.sendTestEmail);
router.get('/env', ctrl.envInfo);

module.exports = router;
