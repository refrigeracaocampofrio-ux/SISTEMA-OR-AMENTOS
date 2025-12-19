const db = require('./config/db');

/**
 * Script para criar tabelas automaticamente se não existirem
 * Roda quando o servidor inicia
 */

async function initializeDatabase() {
  try {
    console.log('📊 Inicializando banco de dados...');
    
    // Verificar se as tabelas principais existem
    const [tables] = await db.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_DATABASE || 'sistema-orcamento']);

    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada. Criando schema...');
      
      // Ler e executar o schema.sql
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql.split(';').filter(s => s.trim());
        
        let count = 0;
        for (const statement of statements) {
          try {
            await db.execute(statement);
            count++;
          } catch (e) {
            // Ignorar erros de tabelas que já existem
            if (!e.message.includes('already exists')) {
              console.warn('⚠️  ', e.message.substring(0, 100));
            }
          }
        }
        
        console.log(`✅ Schema criado com sucesso! (${count} comandos executados)`);
      } else {
        console.warn('⚠️  Arquivo schema.sql não encontrado');
      }
    } else {
      console.log(`✅ Banco de dados já existe com ${tables.length} tabela(s)`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
    // Não parar o servidor se o banco falhar
    return false;
  }
}

module.exports = { initializeDatabase };
