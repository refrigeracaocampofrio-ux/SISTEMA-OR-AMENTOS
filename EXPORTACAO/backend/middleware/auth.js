const authService = require('../services/auth');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const parts = header.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];
  try {
    const payload = authService.verify(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { requireAuth };
