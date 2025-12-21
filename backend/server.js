const express = require('express');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const { checkEnvVars } = require('./config/checkEnv');

// Carrega .env do backend se existir; caso contrário, da raiz
const backendEnvPath = path.join(__dirname, '.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

// Verifica .env e variáveis obrigatórias de acordo com o provider
const provider = (process.env.MAIL_PROVIDER || 'smtp').toLowerCase();
let requiredEmailVars;
if (provider === 'smtp') {
  requiredEmailVars = [
    ['EMAIL_USER', 'SMTP_USER'],
    ['EMAIL_PASS', 'SMTP_PASS'],
    ['EMAIL_FROM', 'SMTP_FROM'],
  ];
} else if (provider === 'resend') {
  requiredEmailVars = [
    ['EMAIL_FROM', 'SMTP_FROM'],
    'RESEND_API_KEY',
  ];
} else if (provider === 'sendgrid') {
  requiredEmailVars = [
    ['EMAIL_FROM', 'SMTP_FROM'],
    'SENDGRID_API_KEY',
  ];
} else if (provider === 'gmail') {
  // Para Gmail API, apenas o remetente é crítico para subir o servidor;
  // as credenciais OAuth serão verificadas no momento do envio/na página de setup.
  requiredEmailVars = [
    ['EMAIL_FROM', 'SMTP_FROM'],
  ];
} else if (provider === 'console') {
  requiredEmailVars = [
    ['EMAIL_FROM', 'SMTP_FROM'],
  ];
} else {
  console.warn(`MAIL_PROVIDER desconhecido: ${provider}. Usando console como padrão.`);
  process.env.MAIL_PROVIDER = 'console';
  process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@sistema-orcamento.local';
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  if (req.path.includes('/auth')) {
    console.log(`[REQUEST] ${req.method} ${req.path} - Body:`, req.body);
  }
  next();
});

// Evitar cache agressivo para arquivos HTML (para refletir mudanças rapidamente)
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' ) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// Servir frontend estático
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Mapear logo padrão para um arquivo de logo apropriado (prioridade: logo.png > logo-rcf.png > logo-rcf.svg)
app.get('/imagens/logo-rcf.png', (req, res) => {
  // Desabilitar cache para garantir que mudanças de logo apareçam imediatamente
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  const base = path.join(__dirname, '..', 'imagens');
  const candidates = [
    'logo.png',
    'logo-rcf.png',
    'logo-rcf.svg',
  ];
  for (const name of candidates) {
    const p = path.join(base, name);
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }
  res.status(404).send('Logo não encontrada');
});

// Servir pasta de imagens
app.use('/imagens', express.static(path.join(__dirname, '..', 'imagens')));

// Rotas
const orcamentoRoutes = require('./routes/orcamentos');
const ordensRoutes = require('./routes/ordens_servico');
const estoqueRoutes = require('./routes/estoque');
const { errorHandler } = require('./middleware/errorHandler');
const pool = require('./services/db');
const emailer = require('./services/email');
// debug/test routes
const debugRoutes = require('./routes/debug');
const emailRoutes = require('./routes/email');

app.use('/orcamentos', orcamentoRoutes);
app.use('/ordens_servico', ordensRoutes);
app.use('/estoque', estoqueRoutes);
// clientes
const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);
// auth
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// client auth (register/login)
const authClientRoutes = require('./routes/authClient');
app.use('/auth/client', authClientRoutes);

// agendamentos
const agendamentosRoutes = require('./routes/agendamentos');
app.use('/agendamentos', agendamentosRoutes);

// relatorios
const relatoriosRoutes = require('./routes/relatorios');
app.use('/relatorios', relatoriosRoutes);

// export
const exportRoutes = require('./routes/export');
app.use('/export', exportRoutes);

// debug
app.use('/debug', debugRoutes);
app.use('/email', emailRoutes);

// middleware de erro (deve vir depois das rotas)
app.use(errorHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// endpoint de configuração para frontend (ex.: GOOGLE_CLIENT_ID)
app.get('/config', (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || null;
  const mailProvider = process.env.MAIL_PROVIDER || null;
  const gmailReady = Boolean(
    process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && (process.env.GMAIL_REDIRECT_URI || true),
  );
  res.json({ GOOGLE_CLIENT_ID: googleClientId, MAIL_PROVIDER: mailProvider, GMAIL_READY: gmailReady });
});

// Apenas inicia o listener se executado diretamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;

