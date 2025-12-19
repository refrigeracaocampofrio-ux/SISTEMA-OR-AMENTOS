#!/usr/bin/env node
// Codebase analysis & report generator
// - Runs ESLint with JSON formatter, writes reports/code-lint-report.json
// - Produces a human-readable Markdown summary
// - Scans for MySQL query risks and Nodemailer transport issues

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports');
const CODE_JSON = path.join(REPORTS_DIR, 'code-lint-report.json');
const CODE_MD = path.join(REPORTS_DIR, 'code-lint-report.md');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { shell: process.platform === 'win32' });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => {
      if (code === 0 || out) {
        resolve({ code, out, err });
      } else {
        reject(new Error(err || `${cmd} exited with ${code}`));
      }
    });
  });
}

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) {
      continue;
    }
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...listFiles(full));
    } else if (e.isFile() && e.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

function scanMysqlRisks(files) {
  const findings = [];
  const concatPattern = /(SELECT|INSERT|UPDATE|DELETE)[^;]*\+\s*\w+/is; // naive string concat in SQL
  const templateUnsafe = /`\s*SELECT[^`]*\$\{[^}]+\}[^`]*`/is; // template literal interpolation
  const queryCall = /\.query\(/;
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    if (queryCall.test(src)) {
      if (concatPattern.test(src)) {
        findings.push({ file: f, issue: 'SQL string concatenation detected' });
      }
      if (templateUnsafe.test(src)) {
        findings.push({ file: f, issue: 'Template literal interpolation in SQL' });
      }
      // Heuristic: encourage prepared statements via placeholders
      const placeholders = /\?\s*[),]/;
      if (!placeholders.test(src)) {
        findings.push({ file: f, issue: 'No placeholders detected in SQL queries' });
      }
    }
  }
  return findings;
}

function scanNodemailer(files) {
  const findings = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    if (/nodemailer\.createTransport\(/.test(src)) {
      const secureTrue = /secure:\s*true/.test(src);
      const port465 = /port:\s*465/.test(src);
      const port587 = /port:\s*587/.test(src);
      if (secureTrue && !port465) {
        findings.push({ file: f, issue: 'secure: true without port 465' });
      }
      if (!secureTrue && port465) {
        findings.push({ file: f, issue: 'port 465 but secure: false' });
      }
      if (port587 && secureTrue) {
        findings.push({ file: f, issue: 'port 587 should typically use secure: false' });
      }
    }
  }
  return findings;
}

function checkEnv() {
  const envPath = path.join(ROOT, 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    return { exists: false };
  }
  const text = fs.readFileSync(envPath, 'utf8');
  // Heuristic: flag presence of passwords/tokens (do not log values)
  const keys = ['DB_PASS', 'SMTP_PASS', 'EMAIL_PASS', 'JWT_SECRET', 'OPENAI_API_KEY'];
  const exposed = keys.filter((k) => new RegExp(`^${k}=.+`, 'm').test(text));
  return { exists: true, exposedKeys: exposed };
}

function toMarkdown(eslintReport, mysqlFindings, mailFindings, envCheck) {
  const totalFiles = eslintReport.length;
  let errors = 0,
    warnings = 0;
  const details = [];
  for (const file of eslintReport) {
    errors += file.errorCount || 0;
    warnings += file.warningCount || 0;
    const msgs = (file.messages || []).map(
      (m) => `- [${m.ruleId || 'internal'}] ${m.message} (${m.severity === 2 ? 'error' : 'warn'})`,
    );
    if (msgs.length) {
      details.push(`### ${path.relative(ROOT, file.filePath)}\n${msgs.join('\n')}`);
    }
  }

  const mysqlMd = mysqlFindings.length
    ? `\n## MySQL Findings\n${mysqlFindings.map((f) => `- ${path.relative(ROOT, f.file)}: ${f.issue}`).join('\n')}`
    : '\n## MySQL Findings\n- No risky patterns detected';

  const mailMd = mailFindings.length
    ? `\n## Nodemailer Findings\n${mailFindings.map((f) => `- ${path.relative(ROOT, f.file)}: ${f.issue}`).join('\n')}`
    : '\n## Nodemailer Findings\n- No transport issues detected';

  const envMd = envCheck.exists
    ? `\n## .env Check\n- backend/.env present\n- Potentially sensitive keys set: ${envCheck.exposedKeys.join(', ') || 'none'}`
    : '\n## .env Check\n- backend/.env not found';

  return `# Code Analysis Report\n\n**Files scanned:** ${totalFiles}  
**ESLint errors:** ${errors}  
**ESLint warnings:** ${warnings}\n\n## ESLint Details\n${details.join('\n\n') || '- Clean'}${mysqlMd}${mailMd}${envMd}\n`;
}

(async () => {
  ensureReportsDir();

  // ESLint JSON
  const patterns = ['backend/**/*.js', 'scripts/**/*.js', 'test/**/*.js'];
  const eslintArgs = ['eslint', '-f', 'json', '--no-error-on-unmatched-pattern', ...patterns];
  const { out } = await run('npx', eslintArgs);
  let report;
  try {
    report = JSON.parse(out);
  } catch (e) {
    // If ESLint printed non-JSON noise, attempt to extract the JSON segment
    const start = out.indexOf('[');
    const end = out.lastIndexOf(']');
    report = start !== -1 && end !== -1 ? JSON.parse(out.slice(start, end + 1)) : [];
  }
  fs.writeFileSync(CODE_JSON, JSON.stringify(report, null, 2));

  // Heuristic scans
  const files = listFiles(path.join(ROOT, 'backend'));
  const mysqlFindings = scanMysqlRisks(files);
  const mailFindings = scanNodemailer(files);
  const envCheck = checkEnv();

  const md = toMarkdown(report, mysqlFindings, mailFindings, envCheck);
  fs.writeFileSync(CODE_MD, md, 'utf8');

  console.log(
    `✅ Reports written:\n- ${path.relative(ROOT, CODE_JSON)}\n- ${path.relative(ROOT, CODE_MD)}`,
  );
})();
