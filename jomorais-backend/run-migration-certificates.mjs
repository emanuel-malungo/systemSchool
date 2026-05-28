// Script para criar a tabela de certificados via Prisma $executeRawUnsafe
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function createCertificatesTables() {
  try {
    console.log('🔄 Criando tabela de certificados...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'prisma/migrations/add_new_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Extrair apenas a parte de certificados
    const certificadosMatch = sqlContent.match(/-- ==================== CERTIFICADOS ====================[\s\S]*?-- ==================== DECLARAÇÕES/);
    if (!certificadosMatch) {
      throw new Error('Seção de certificados não encontrada no arquivo SQL');
    }

    // Dividir por ponto-e-vírgula e executar cada statement
    const fullStatement = certificadosMatch[0]
      .replace(/-- ==================== DECLARAÇÕES/, '')
      .trim();
    
    const statements = fullStatement.split(';')
      .filter(stmt => stmt.trim())
      .filter(stmt => !stmt.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executando:\n${statement.substring(0, 100)}...\n`);
        await prisma.$executeRawUnsafe(statement);
      }
    }

    console.log('✅ Tabela de certificados criada com sucesso!\n');
    
    // Verificar se a tabela foi criada
    const tables = await prisma.$queryRaw`SHOW TABLES LIKE 'tb_certificados'`;
    console.log('📊 Tabela certificados:', tables);
    
    // Mostrar estrutura da tabela
    const schema = await prisma.$queryRaw`DESCRIBE tb_certificados`;
    console.log('📋 Estrutura da tabela:');
    console.table(schema);

  } catch (error) {
    console.error('❌ Erro ao criar tabela de certificados:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCertificatesTables();
