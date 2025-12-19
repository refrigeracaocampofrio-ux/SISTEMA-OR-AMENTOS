#!/usr/bin/env node
/**
 * Script para criar tabela de agendamentos com credenciais
 */

const mysql = require('mysql2/promise');
const fs = require('fs');

async function criarTabela() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CRIANDO TABELA DE AGENDAMENTOS          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  let connection;
  try {
    console.log('🔐 Conectando ao MySQL...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ma20112004@',
      database: 'sistema_orcamento',
      multipleStatements: true,
      waitForConnections: true
    });
    
    console.log('✅ Conectado ao MySQL!\n');
    
    console.log('📄 Carregando arquivo SQL...');
    const sqlContent = fs.readFileSync(__dirname + '/EXECUTAR_ISTO_NO_MYSQL.sql', 'utf8');
    
    console.log('⏳ Criando tabela e índices...\n');
    const results = await connection.query(sqlContent);
    
    console.log('\n✅ ✅ ✅ SUCESSO! ✅ ✅ ✅\n');
    console.log('Tabela agendamentos criada com sucesso!\n');
    
    console.log('📋 Próximos passos:');
    console.log('  1. Volte para o navegador');
    console.log('  2. Pressione F5 para recarregar a página');
    console.log('  3. Clique em "Agendamentos" no menu\n');
    
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
