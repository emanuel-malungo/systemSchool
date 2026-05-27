// Script para criar as novas tabelas via Prisma $executeRawUnsafe
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('🔄 Criando novas tabelas de professor e avaliação...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'prisma/migrations/add_professor_and_evaluation_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Dividir por ponto-e-vírgula e executar cada statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executando:\n${statement.substring(0, 100)}...\n`);
        await prisma.$executeRawUnsafe(statement);
      }
    }

    console.log('✅ Tabelas criadas com sucesso!\n');
    
    // Listar as novas tabelas
    const tables = await prisma.$queryRaw`SHOW TABLES LIKE 'tb_professor%' OR SHOW TABLES LIKE 'tb_periodo%' OR SHOW TABLES LIKE 'tb_historico%'`;
    console.log('📊 Novas tabelas:', tables);

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
