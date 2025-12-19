const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const fetch = require('node-fetch');

// Simple admin login using env credentials
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'marciel';
  const ADMIN_PASS = process.env.ADMIN_PASS || '142514';

  console.log('[AUTH] Login attempt:', { username, hasPassword: Boolean(password) });

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    console.log('[AUTH] ✅ Login successful for', username);
    const token = authService.sign({ username });
    return res.json({ token });
  }

  console.log('[AUTH] ❌ Login failed for', username);
  res.status(401).json({ error: 'Credenciais inválidas' });
});

// Verify Google ID token endpoint
router.post('/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ error: 'id_token é obrigatório' });
    }
    const r = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`,
    );
    if (!r.ok) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    const info = await r.json();
    const expected = process.env.GOOGLE_CLIENT_ID;
    if (expected && info.aud !== expected) {
      return res.status(401).json({ error: 'Audience inválido' });
    }
    const token = authService.sign({
      sub: info.sub,
      email: info.email,
      name: info.name,
      provider: 'google',
    });
    res.json({ token, user: { email: info.email, name: info.name } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar token Google' });
  }
});

module.exports = router;
