#!/usr/bin/env node
/**
 * Script para criar tabela de agendamentos
 * Executa via Node.js/mysql2
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, 'EXECUTAR_ISTO_NO_MYSQL.sql');

async function criarTabela() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CRIANDO TABELA DE AGENDAMENTOS          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  let connection;
  try {
    // Obter credenciais do .env ou variáveis de ambiente
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || process.env.DB_PASS || '';
    const database = process.env.DB_NAME || 'sistema_orcamento';
    
    console.log('🔐 Conectando ao MySQL...');
    console.log(`   Host: ${host}`);
    console.log(`   Usuário: ${user}`);
    console.log(`   Banco: ${database}`);
    console.log('');
    
    // Conectar
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      multipleStatements: true,
      waitForConnections: true
    });
    
    console.log('✅ Conectado!');
    
    // Ler arquivo SQL
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlFile}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('📄 Lido arquivo SQL');
    
    // Executar
    console.log('⏳ Criando tabela...\n');
    const results = await connection.query(sqlContent);
    
    console.log('');
    console.log('✅ ✅ ✅ SUCESSO! ✅ ✅ ✅\n');
    console.log('📋 Próximos passos:');
    console.log('  1️⃣  Volte para o navegador');
    console.log('  2️⃣  Pressione F5 para recarregar a página');
    console.log('  3️⃣  Clique em "Agendamentos" no menu\n');
    console.log('Tudo deve funcionar agora!\n');
    
    await connection.end();
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERRO:', err.message);
    console.error('');
    
    if (err.message.includes('Access denied')) {
      console.error('⚠️  Credenciais incorretas');
      console.error('  • Verifique DB_PASSWORD no arquivo .env');
      console.error('  • Ou defina via variável de ambiente: set DB_PASSWORD=sua_senha\n');
    } else if (err.message.includes('Unknown database')) {
      console.error('⚠️  Banco de dados não existe');
      console.error('  Execute: CREATE DATABASE sistema_orcamento;\n');
    } else if (err.message.includes('Table')) {
      console.error('⚠️  Problema com a tabela - talvez já exista?');
    }
    
    if (connection) {
      await connection.end().catch(() => {});
    }
    
    process.exit(1);
  }
}

criarTabela();
