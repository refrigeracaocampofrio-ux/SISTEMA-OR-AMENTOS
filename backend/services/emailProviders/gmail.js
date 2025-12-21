const { google } = require('googleapis');
const pool = require('../db');

function envTrim(key, fallback) {
  const raw = process.env[key];
  if (typeof raw !== 'string') return fallback ?? '';
  const val = raw.replace(/^yes[\r\n]+/i, '').replace(/[\r\n]+$/g, '').trim();
  return val === '' ? (fallback ?? '') : val;
}

function getOAuthClient() {
  const clientId = envTrim('GMAIL_CLIENT_ID', '');
  const clientSecret = envTrim('GMAIL_CLIENT_SECRET', '');
  const redirectUri = envTrim('GMAIL_REDIRECT_URI', 'http://localhost:3000/email/google/callback');
  if (!clientId || !clientSecret) {
    throw new Error('GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET não configurados.');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getStoredCredentials(userEmail) {
  if (userEmail) {
    const [rows] = await pool.query(
      'SELECT * FROM email_credentials WHERE provider = ? AND user_email = ? ORDER BY updated_at DESC LIMIT 1',
      ['gmail', userEmail],
    );
    return rows[0] || null;
  }
  const [rows] = await pool.query(
    'SELECT * FROM email_credentials WHERE provider = ? ORDER BY updated_at DESC LIMIT 1',
    ['gmail'],
  );
  return rows[0] || null;
}

async function updateStoredCredentials({ user_email, access_token, refresh_token, expiry_date }) {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS email_credentials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      provider VARCHAR(50) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expiry_date BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  );

  await pool.query(
    `INSERT INTO email_credentials (provider, user_email, access_token, refresh_token, expiry_date)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE access_token=VALUES(access_token), refresh_token=VALUES(refresh_token), expiry_date=VALUES(expiry_date), updated_at=NOW()`,
    ['gmail', user_email, access_token || null, refresh_token || null, expiry_date || null],
  );
}

function buildRawMessage({ from, to, subject, text, html }) {
  const boundary = 'mixed-boundary';
  
  // Encode subject in UTF-8 using RFC 2047
  const encodedSubject = subject ? `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=` : '';
  
  let body = '';
  if (html) {
    body = [
      `From: ${from}`,
      `To: ${Array.isArray(to) ? to.join(', ') : to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: text/html; charset=utf-8`,
      '',
      html,
    ].join('\r\n');
  } else {
    body = [
      `From: ${from}`,
      `To: ${Array.isArray(to) ? to.join(', ') : to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: text/plain; charset=utf-8`,
      '',
      text || '',
    ].join('\r\n');
  }
  return Buffer.from(body).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendWithGmail({ from, to, subject, html, text, userEmail }) {
  const creds = await getStoredCredentials(userEmail);
  if (!creds || !creds.refresh_token) {
    throw new Error('Conta Gmail não conectada. Acesse /email/connect/google para autorizar.');
  }

  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials({
    access_token: creds.access_token || undefined,
    refresh_token: creds.refresh_token,
    expiry_date: creds.expiry_date || undefined,
  });

  // Refresh if needed
  if (!creds.access_token || !creds.expiry_date || creds.expiry_date < Date.now()) {
    const tokens = await oAuth2Client.refreshAccessToken();
    const newCreds = tokens.credentials;
    await updateStoredCredentials({
      user_email: creds.user_email,
      access_token: newCreds.access_token,
      refresh_token: newCreds.refresh_token || creds.refresh_token,
      expiry_date: newCreds.expiry_date || null,
    });
    oAuth2Client.setCredentials({
      access_token: newCreds.access_token,
      refresh_token: newCreds.refresh_token || creds.refresh_token,
      expiry_date: newCreds.expiry_date,
    });
  }

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  // se 'from' não foi informado, usa a conta conectada
  const effectiveFrom = from || creds.user_email;
  const raw = buildRawMessage({ from: effectiveFrom, to, subject, html, text });
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return res.data;
}

module.exports = { sendWithGmail, getOAuthClient, updateStoredCredentials, getStoredCredentials };
