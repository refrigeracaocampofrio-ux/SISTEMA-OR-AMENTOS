const fs = require('fs');
const path = require('path');
const express = require('express');
const open = require('child_process').exec;
const readline = require('readline');
const { google } = require('googleapis');
require('dotenv').config();

const PORT = 4000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    }),
  );
}

async function writeEnv(updates) {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  try {
    content = fs.readFileSync(envPath, 'utf8');
  } catch (e) {
    content = '';
  }
  const lines = content.split(/\r?\n/).filter(Boolean);
  const map = {};
  for (const l of lines) {
    const idx = l.indexOf('=');
    if (idx === -1) {
      continue;
    }
    map[l.slice(0, idx)] = l.slice(idx + 1);
  }
  Object.assign(map, updates);
  const out = Object.keys(map).map((k) => `${k}=${map[k]}`);
  fs.writeFileSync(envPath, out.join('\n') + '\n', 'utf8');
  console.log('.env atualizado com as credenciais GMAIL_*.');
}

async function openUrl(url) {
  const platform = process.platform;
  if (platform === 'win32') {
    open(`start "" "${url}"`);
  } else if (platform === 'darwin') {
    open(`open "${url}"`);
  } else {
    open(`xdg-open "${url}"`);
  }
}

async function main() {
  let clientId = process.env.GMAIL_CLIENT_ID || '';
  let clientSecret = process.env.GMAIL_CLIENT_SECRET || '';

  if (!clientId) {
    clientId = await ask('GMAIL_CLIENT_ID: ');
  }
  if (!clientSecret) {
    clientSecret = await ask('GMAIL_CLIENT_SECRET: ');
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
  });

  const app = express();

  const server = app.listen(PORT, () => {
    console.log(`Aguardando callback em ${REDIRECT_URI} ... abrindo navegador...`);
    openUrl(authUrl);
  });

  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      res.send('Nenhum código recebido.');
      return;
    }
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      // pega e-mail do usuário
      const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
      const info = await oauth2.userinfo.get();
      const email = info.data.email;

      await writeEnv({
        GMAIL_USER_EMAIL: email,
        GMAIL_CLIENT_ID: clientId,
        GMAIL_CLIENT_SECRET: clientSecret,
        GMAIL_REFRESH_TOKEN: tokens.refresh_token || tokens.access_token,
      });

      res.send('Autorização recebida. Pode fechar esta janela.');
      console.log('Tokens recebidos e .env atualizado.');
    } catch (err) {
      console.error('Erro ao trocar código por token:', err.message);
      res.status(500).send('Erro ao obter token. Veja o terminal.');
    } finally {
      setTimeout(() => server.close(), 1000);
    }
  });
}

if (require.main === module) {
  main();
}

module.exports = main;
