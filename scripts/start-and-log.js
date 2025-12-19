#!/usr/bin/env node
// Start server, capture stdout/stderr, and write a timestamped log under reports/
// If critical errors are detected, exit non-zero; otherwise keep streaming and print summary.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const reportsDir = path.join(ROOT, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(reportsDir, `server-startup-${stamp}.log`);

// Determine provider from backend/.env to tailor critical detection
let provider = 'smtp';
try {
  const envText = fs.readFileSync(path.join(ROOT, 'backend', '.env'), 'utf8');
  const match = envText.match(/MAIL_PROVIDER\s*=\s*(\w+)/i);
  if (match) provider = match[1].toLowerCase();
} catch {}

const criticalPatterns = [
  /Corrija o arquivo backend\.env/i,
  /Erro ao conectar no banco/i,
  // Missing general required vars
  /Variável obrigatória ausente\b(?!.*(RESEND_API_KEY|SENDGRID_API_KEY))/i,
  /ausente ou vazia/i,
];

const p = spawn('node', ['backend/server.js'], { shell: process.platform === 'win32' });
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

let hadCritical = false;
let lines = 0;

function handle(data, streamName) {
  const text = data.toString();
  lines += text.split(/\r?\n/).length - 1;
  logStream.write(text);
  process.stdout.write(text);
  for (const pat of criticalPatterns) {
    if (pat.test(text)) {
      // Treat missing API keys as non-critical for API providers
      if (provider !== 'smtp' && /RESEND_API_KEY ausente|SENDGRID_API_KEY ausente/i.test(text)) {
        continue;
      }
      hadCritical = true;
    }
  }
}

p.stdout.on('data', (d) => handle(d, 'stdout'));
p.stderr.on('data', (d) => handle(d, 'stderr'));

p.on('close', (code) => {
  logStream.end();
  console.log(`\n📝 Startup log saved: ${path.relative(ROOT, logPath)} (${lines} lines)`);
  if (hadCritical || (typeof code === 'number' && code !== 0)) {
    console.error('❌ Startup detected issues. See the log above or the saved file.');
    process.exit(code || 1);
  } else {
    console.log('✅ Server started successfully.');
    process.exit(0);
  }
});
