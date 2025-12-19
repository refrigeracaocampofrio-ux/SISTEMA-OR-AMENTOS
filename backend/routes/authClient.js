const express = require('express');
const router = express.Router();
const controller = require('../controllers/authClientController');

router.post('/register', controller.register);
router.post('/login', controller.clientLogin);

module.exports = router;
