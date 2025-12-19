const { sendMail } = require('../services/email');

async function main() {
  try {
    const info = await sendMail({
      to: 'marcielma43@gmail.com',
      subject: 'Teste de envio via Gmail OAuth2',
      text: 'Este é um teste automático do sistema de orçamento.',
      html: '<b>Este é um teste automático do sistema de orçamento.</b>',
    });
    console.log('E-mail enviado:', info.messageId);
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
