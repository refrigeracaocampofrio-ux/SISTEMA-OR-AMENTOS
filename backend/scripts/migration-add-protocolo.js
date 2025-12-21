#!/usr/bin/env node
/**
 * Migration: Add protocolo column to clientes table
 * This script runs on first deployment to add the protocolo column
 */

const mysql = require('mysql2/promise');

async function runMigration() {
  try {
    // Get database connection details from environment
    const host = process.env.DB_HOST || 'localhost';
    const config = {
      host,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistema_orcamento',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: host.includes('psdb.cloud') ? { rejectUnauthorized: false } : undefined
    };

    console.log(`Connecting to database ${config.database} at ${config.host}...`);
    
    const connection = await mysql.createConnection(config);

      // Ensure protocolo column on clientes
      const [columnsClientes] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'clientes' 
          AND COLUMN_NAME = 'protocolo'
          AND TABLE_SCHEMA = ?
      `, [config.database]);

      if (columnsClientes.length === 0) {
        console.log('Adding protocolo column to clientes...');
        await connection.query(
          'ALTER TABLE clientes ADD COLUMN protocolo VARCHAR(10) UNIQUE AFTER id'
        );
        console.log('✓ Added protocolo to clientes');
      } else {
        console.log('✓ Column protocolo already exists in clientes');
      }

      // Ensure protocolo column on agendamentos
      const [columnsAg] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'agendamentos' 
          AND COLUMN_NAME = 'protocolo'
          AND TABLE_SCHEMA = ?
      `, [config.database]);

      if (columnsAg.length === 0) {
        console.log('Adding protocolo column to agendamentos...');
        await connection.query(
          'ALTER TABLE agendamentos ADD COLUMN protocolo VARCHAR(10) NULL AFTER id'
        );
        console.log('✓ Added protocolo to agendamentos');
      } else {
        console.log('✓ Column protocolo already exists in agendamentos');
      }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
