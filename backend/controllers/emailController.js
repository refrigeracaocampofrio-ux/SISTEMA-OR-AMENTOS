const { google } = require('googleapis');
const pool = require('../services/db');

function envTrim(key, fallback) {
  const raw = process.env[key];
  if (typeof raw !== 'string') return fallback ?? '';
  const val = raw.replace(/^yes[\r\n]+/i, '').replace(/[\r\n]+$/g, '').trim();
  return val === '' ? (fallback ?? '') : val;
}

async function getStatus(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT user_email FROM email_credentials WHERE provider = ? ORDER BY updated_at DESC LIMIT 1',
      ['gmail'],
    );
    if (rows.length > 0) {
      res.json({ configured: true, email: rows[0].user_email });
    } else {
      res.json({ configured: false });
    }
  } catch (e) {
    res.status(500).json({ error: e.message, configured: false });
  }
}

async function connectGoogle(req, res) {
  try {
    const clientId = envTrim('GMAIL_CLIENT_ID', '');
    const clientSecret = envTrim('GMAIL_CLIENT_SECRET', '');
    const redirectUri = envTrim('GMAIL_REDIRECT_URI', 'http://localhost:3000/email/google/callback');
    const hasId = Boolean(clientId && clientId.trim() !== '');
    const hasSecret = Boolean(clientSecret && clientSecret.trim() !== '');
    const hasRedirect = Boolean(redirectUri && redirectUri.trim() !== '');
    console.log(`[Gmail OAuth] Config check -> ID:${hasId} SECRET:${hasSecret} REDIRECT:${hasRedirect} URI:${redirectUri}`);
    if (!hasId || !hasSecret) {
      return res.status(400).json({
        error: 'Gmail OAuth não configurado no servidor. Defina GMAIL_CLIENT_ID e GMAIL_CLIENT_SECRET em backend/.env e reinicie.',
        GMAIL_CLIENT_ID: hasId,
        GMAIL_CLIENT_SECRET: hasSecret,
        GMAIL_REDIRECT_URI: hasRedirect,
      });
    }
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const scope = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
      'email',
      'profile',
    ];
    const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope, prompt: 'consent' });
    console.log('[Gmail OAuth] Redirecting to Google URL:', url);
    res.redirect(url);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function googleCallback(req, res) {
  const code = req.query.code;
  if (!code) {return res.status(400).send('Faltou código de autorização.');}
  try {
    const clientId = envTrim('GMAIL_CLIENT_ID', '');
    const clientSecret = envTrim('GMAIL_CLIENT_SECRET', '');
    const redirectUri = envTrim('GMAIL_REDIRECT_URI', 'http://localhost:3000/email/google/callback');
    if (!clientId || !clientSecret) {
      return res.status(400).send('GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET não configurados.');
    }
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const info = await oauth2.userinfo.get();
    const email = info.data.email;

    // Ensure table exists
    await pool.query(
      `CREATE TABLE IF NOT EXISTS email_credentials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(50) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expiry_date BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_provider_email (provider, user_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    );

    // Store/update credentials
    await pool.query(
      `INSERT INTO email_credentials (provider, user_email, access_token, refresh_token, expiry_date)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE access_token=VALUES(access_token), refresh_token=VALUES(refresh_token), expiry_date=VALUES(expiry_date), updated_at=NOW()`,
      ['gmail', email, tokens.access_token || null, tokens.refresh_token || tokens.access_token || null, tokens.expiry_date || null],
    );

    // Redirect to home with success flag
    res.redirect('/?setup_complete=1');
  } catch (e) {
    res.status(500).send('Erro no callback OAuth: ' + e.message);
  }
}

module.exports = { getStatus, connectGoogle, googleCallback };
