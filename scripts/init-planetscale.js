#!/usr/bin/env node
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const config = {
    host: process.env.DB_HOST || 'aws.connect.psdb.cloud',
    user: process.env.DB_USER || 'eji0fpzw0nap5776opmw',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema-rcf',
    port: 3306,
    ssl: { rejectUnauthorized: false },
  };

  try {
    console.log('🔗 Conectando ao PlanetScale...');
    const conn = await mysql.createConnection(config);
    console.log('✅ Conectado!\n');

    // Garantir que clientes tem todas as colunas necessárias
    console.log('📄 Verificando tabela clientes...');
    try {
      await conn.execute('ALTER TABLE clientes ADD COLUMN password_hash VARCHAR(255) NULL');
      console.log('   ✓ Coluna password_hash adicionada');
    } catch (e) {
      if (e.message.includes('Duplicate')) {
        console.log('   ✓ Coluna password_hash já existe');
      } else {
        console.warn('   ⚠️  ', e.message);
      }
    }

    // Criar tabela agendamentos sem foreign key
    console.log('📄 Criando tabela agendamentos...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NULL,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        endereco TEXT NOT NULL,
        complemento VARCHAR(255),
        cidade VARCHAR(100) NOT NULL,
        estado VARCHAR(2) NOT NULL,
        cep VARCHAR(10),
        data_agendamento DATE NOT NULL,
        horario_inicio TIME NOT NULL,
        horario_fim TIME NOT NULL,
        tipo_servico VARCHAR(255),
        descricao_problema TEXT,
        status ENUM('pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado') DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('   ✓ Tabela agendamentos criada');

    // Criar índices
    console.log('📊 Criando índices...');
    try {
      await conn.execute('CREATE INDEX idx_data_agendamento ON agendamentos(data_agendamento)');
    } catch (e) {
      if (!e.message.includes('exists')) console.warn('   ⚠️  ', e.message);
    }
    try {
      await conn.execute('CREATE INDEX idx_status ON agendamentos(status)');
    } catch (e) {
      if (!e.message.includes('exists')) console.warn('   ⚠️  ', e.message);
    }
    try {
      await conn.execute('CREATE INDEX idx_email ON agendamentos(email)');
    } catch (e) {
      if (!e.message.includes('exists')) console.warn('   ⚠️  ', e.message);
    }
    console.log('   ✓ Índices criados');

    // Verificar tabelas
    console.log('\n📊 Verificando tabelas...');
    const [tables] = await conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sistema-rcf'");
    console.log(`   ✓ ${tables.length} tabelas encontradas:`);
    tables.forEach(t => console.log(`     - ${t.TABLE_NAME}`));

    // Testar agendamentos
    console.log('\n🧪 Testando tabela agendamentos...');
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM agendamentos');
    console.log(`   ✓ Agendamentos existentes: ${rows[0].count}`);

    await conn.end();
    console.log('\n✅ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

initDatabase();
