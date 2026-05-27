import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('\n🔄 Criando novas tabelas de professor e avaliação...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'prisma/migrations/add_professor_and_evaluation_tables.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Remove comments and split by semicolon
    sqlContent = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove SQL comments
      .join('\n');
    
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`⏳ Executando statement ${i + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        console.log(`✅ Statement ${i + 1} executado\n`);
      } catch (err) {
        console.error(`❌ Erro no statement ${i + 1}: ${err.message}\n`);
        // Continue com os próximos statements
      }
    }

    console.log(`\n✅ ${successCount}/${statements.length} tabelas criadas com sucesso!\n`);
    
    // List the new tables
    try {
      const tables = await prisma.$queryRaw`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'gestao_escolar' 
        AND (TABLE_NAME LIKE '%professor%' OR TABLE_NAME LIKE '%periodo%' OR TABLE_NAME LIKE '%historico%')
      `;
      console.log('📊 Novas tabelas criadas:');
      tables.forEach((table, idx) => {
        console.log(`   ${idx + 1}. ${Object.values(table)[0]}`);
      });
    } catch (err) {
      console.log('   (Não foi possível listar as tabelas)');
    }

    console.log('\n🎉 Setup concluído! Agora execute:');
    console.log('   npx prisma generate\n');

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
