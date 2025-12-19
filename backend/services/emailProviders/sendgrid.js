const fetch = require('node-fetch');

async function sendWithSendGrid({ from, to, subject, html, text, apiKey }) {
  if (!apiKey) throw new Error('SENDGRID_API_KEY não definido.');
  const personalization = {
    to: Array.isArray(to) ? to.map((t) => ({ email: t })) : [{ email: to }],
    subject,
  };
  const content = [];
  if (html) content.push({ type: 'text/html', value: html });
  if (text) content.push({ type: 'text/plain', value: text });
  if (!content.length) content.push({ type: 'text/plain', value: '' });

  const body = {
    personalizations: [personalization],
    from: { email: from },
    content,
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`SendGrid API error: ${res.status} ${res.statusText} ${errText}`);
  }
  // SendGrid returns 202 Accepted without body
  return { accepted: true };
}

module.exports = { sendWithSendGrid };
