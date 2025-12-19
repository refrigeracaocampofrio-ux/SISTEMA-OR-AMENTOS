#!/usr/bin/env node
/**
 * Script para criar tabela - tenta várias combinações de senha
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, 'EXECUTAR_ISTO_NO_MYSQL.sql');

async function tentarConectar(senha) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: senha,
      database: 'sistema_orcamento',
      multipleStatements: true,
      waitForConnections: true
    });
    return connection;
  } catch (err) {
    return null;
  }
}

async function criarTabela() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CRIANDO TABELA DE AGENDAMENTOS          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  let connection;
  try {
    // Tentar senhas comuns
    const senhasParaTentar = ['', 'root', '123456', 'password', 'admin'];
    
    console.log('🔐 Tentando conectar ao MySQL...\n');
    
    for (const senha of senhasParaTentar) {
      const desc = senha ? `"${senha}"` : 'vazia (sem senha)';
      process.stdout.write(`  Tentando com senha ${desc}... `);
      connection = await tentarConectar(senha);
      
      if (connection) {
        console.log('✅');
        break;
      } else {
        console.log('❌');
      }
    }
    
    if (!connection) {
      console.log('\n❌ Nenhuma senha funcionou!');
      console.log('\n📋 Soluções:');
      console.log('  1. Defina a variável de ambiente: set DB_PASSWORD=sua_senha');
      console.log('  2. Ou edite o arquivo .env com a senha correta');
      console.log('  3. Ou atualize este script com a senha correta\n');
      process.exit(1);
    }
    
    console.log('\n✅ Conectado ao MySQL!');
    
    // Ler arquivo SQL
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlFile}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('📄 Arquivo SQL carregado');
    
    // Executar
    console.log('⏳ Criando tabela...\n');
    await connection.query(sqlContent);
    
    console.log('\n✅ ✅ ✅ SUCESSO! ✅ ✅ ✅\n');
    console.log('📋 Próximos passos:');
    console.log('  1️⃣  Volte para o navegador');
    console.log('  2️⃣  Pressione F5 para recarregar a página');
    console.log('  3️⃣  Clique em "Agendamentos" no menu\n');
    
    await connection.end();
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERRO:', err.message, '\n');
    if (connection) {
      await connection.end().catch(() => {});
    }
    process.exit(1);
  }
}

criarTabela();
