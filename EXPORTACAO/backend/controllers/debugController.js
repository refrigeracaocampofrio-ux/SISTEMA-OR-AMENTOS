const emailer = require('../services/email');

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

module.exports = { sendTestEmail };
