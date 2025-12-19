// Nodemailer é carregado sob demanda apenas quando MAIL_PROVIDER = 'smtp'
let nodemailer;
const { sendWithResend } = require('./emailProviders/resend');
const { sendWithSendGrid } = require('./emailProviders/sendgrid');
const { sendWithGmail } = require('./emailProviders/gmail');

// Cria o transporter SMTP tradicional
function createTransporter() {
  try {
    if (!nodemailer) nodemailer = require('nodemailer');
  } catch (e) {
    throw new Error('Nodemailer não está instalado. Instale com: npm i nodemailer, ou use MAIL_PROVIDER=sendgrid/resend');
  }
  // Permite EMAIL_SERVICE (gmail, outlook, etc) ou host/porta
  const options = process.env.EMAIL_SERVICE
    ? {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
        },
      }
    : {
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
        port: Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587),
        secure: (process.env.EMAIL_SECURE || process.env.SMTP_SECURE) === 'true',
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
        },
      };
  return nodemailer.createTransport(options);
}

async function sendMail({ to, subject, text, html, userEmail }) {
  const provider = (process.env.MAIL_PROVIDER || '').toLowerCase();
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;

  if (provider === 'resend') {
    return sendWithResend({ from, to, subject, html, text, apiKey: process.env.RESEND_API_KEY });
  }
  if (provider === 'sendgrid') {
    return sendWithSendGrid({ from, to, subject, html, text, apiKey: process.env.SENDGRID_API_KEY });
  }
  if (provider === 'gmail') {
    // Para Gmail, usa a conta conectada; se userEmail fornecido, tenta usar as credenciais dessa conta
    return sendWithGmail({ from: null, to, subject, html, text, userEmail });
  }
  if (provider === 'console') {
    const payload = { from, to, subject, html, text };
    // eslint-disable-next-line no-console
    console.log('📤 [console provider] Email simulando envio:', payload);
    return { accepted: true, provider: 'console', payload };
  }

  // default: SMTP via Nodemailer
  const transporter = createTransporter();
  try {
    await transporter.verify();
  } catch (e) {
    const hint = transporter.options?.service
      ? `Verifique EMAIL_SERVICE/EMAIL_USER/EMAIL_PASS`
      : `Verifique EMAIL_HOST/EMAIL_PORT/EMAIL_SECURE/EMAIL_USER/EMAIL_PASS`;
    const err = new Error(`Falha ao verificar transporte SMTP: ${e.message}. ${hint}.`);
    err.cause = e;
    throw err;
  }
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = {
  sendMail,
  createTransporter,
};
