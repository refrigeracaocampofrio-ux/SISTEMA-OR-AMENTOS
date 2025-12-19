const fs = require('fs');
const path = require('path');

function checkEnvVars(requiredVars = []) {
  const backendEnvPath = path.join(__dirname, '..', '.env');
  const rootEnvPath = path.join(__dirname, '..', '..', '.env');
  const hasBackendEnv = fs.existsSync(backendEnvPath);
  const hasRootEnv = fs.existsSync(rootEnvPath);
  if (!hasBackendEnv && !hasRootEnv) {
    console.error('Arquivo .env não encontrado em backend/.env nem na raiz do projeto.');
    return false;
  }

  // As variáveis já devem estar disponíveis via process.env graças ao dotenv.config() em server.js
  let ok = true;
  for (const v of requiredVars) {
    if (Array.isArray(v)) {
      const found = v.find((key) => process.env[key] && process.env[key] !== '');
      if (!found) {
        console.error(`Variável obrigatória ausente: uma de [${v.join(', ')}]`);
        ok = false;
      }
    } else {
      const val = process.env[v];
      if (typeof val === 'undefined' || val === '') {
        console.error(`Variável obrigatória ausente ou vazia: ${v}`);
        ok = false;
      }
    }
  }
  return ok;
}

module.exports = { checkEnvVars };
