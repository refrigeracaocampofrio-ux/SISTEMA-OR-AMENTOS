const fetch = require('node-fetch');

async function sendWithResend({ from, to, subject, html, text, apiKey }) {
  if (!apiKey) {throw new Error('RESEND_API_KEY não definido.');}
  const body = {
    from,
    to,
    subject,
  };
  if (html) {body.html = html;}
  else if (text) {body.text = text;}
  else {body.text = '';}

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Resend API error: ${res.status} ${res.statusText} ${errText}`);
  }
  return res.json();
}

module.exports = { sendWithResend };
