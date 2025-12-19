const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/emailController');

// Verifica se há credenciais Gmail configuradas
router.get('/status', ctrl.getStatus);
// Inicia o OAuth com Google para vincular a conta remetente
router.get('/connect/google', ctrl.connectGoogle);
// Callback do OAuth (configure GMAIL_REDIRECT_URI para esta rota)
router.get('/google/callback', ctrl.googleCallback);

module.exports = router;
