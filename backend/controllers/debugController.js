const emailer = require('../services/email');

function envInfo(req, res) {
  const env = process.env;
  res.json({
    DB_HOST: env.DB_HOST || null,
    DB_USER: env.DB_USER || null,
    DB_DATABASE: env.DB_DATABASE || env.DB_NAME || null,
    DB_PORT: env.DB_PORT || null,
    has_DB_PASSWORD: Boolean(env.DB_PASSWORD || env.DB_PASS),
    NODE_ENV: env.NODE_ENV || null,
  });
}

async function sendTestEmail(req, res, next) {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Campo `to` é obrigatório' });
    }
    const subject = 'Teste de envio - Sistema de Orçamento';
    const html = `<p>Teste de envio a partir do servidor. Se recebeu, SMTP está funcionando.</p>`;
    const info = await emailer.sendMail({ to, subject, html });
    res.json({ ok: true, info });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendTestEmail, envInfo };
