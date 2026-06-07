// Script para dropar e recriar a tabela de certificados com a estrutura correta
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recreateCertificatesTable() {
  try {
    console.log('🔄 Recriando tabela de certificados com estrutura correta...\n');

    // Drop da tabela existente
    console.log('🗑️  Removendo tabela de certificados antiga...');
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS tb_certificados`);
      console.log('✅ Tabela antiga removida\n');
    } catch (error) {
      console.log('⚠️  Tabela não existia ou não pode ser removida\n');
    }

    // SQL direto para criar a tabela
    const createTableSQL = `CREATE TABLE IF NOT EXISTS \`tb_certificados\` (
      \`Codigo\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`Codigo_Aluno\` INT UNSIGNED NOT NULL,
      \`Codigo_AnoLectivo\` INT UNSIGNED NOT NULL,
      \`NumeroCertificado\` VARCHAR(50),
      \`DataEmissao\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`DataAssinatura\` TIMESTAMP NULL,
      \`AssinadoPor\` INT UNSIGNED,
      \`Status\` VARCHAR(20) NOT NULL DEFAULT 'Pendente',
      \`Observacoes\` TEXT,
      \`DataCadastro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`Codigo\`),
      UNIQUE KEY \`UK_tb_certificados\` (\`Codigo_Aluno\`, \`Codigo_AnoLectivo\`),
      INDEX \`FK_tb_certificados_aluno_idx\` (\`Codigo_Aluno\`),
      INDEX \`FK_tb_certificados_ano_lectivo_idx\` (\`Codigo_AnoLectivo\`),
      INDEX \`FK_tb_certificados_assinador_idx\` (\`AssinadoPor\`),
      CONSTRAINT \`FK_tb_certificados_aluno\` FOREIGN KEY (\`Codigo_Aluno\`) REFERENCES \`tb_alunos\` (\`codigo\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT \`FK_tb_certificados_ano_lectivo\` FOREIGN KEY (\`Codigo_AnoLectivo\`) REFERENCES \`tb_ano_lectivo\` (\`codigo\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT \`FK_tb_certificados_assinador\` FOREIGN KEY (\`AssinadoPor\`) REFERENCES \`tb_utilizadores\` (\`codigo\`) ON DELETE NO ACTION ON UPDATE NO ACTION
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

    console.log('📝 Criando nova tabela de certificados...\n');
    await prisma.$executeRawUnsafe(createTableSQL);
    console.log('✅ Tabela criada com sucesso\n');

    console.log('✅ Tabela de certificados recriada com sucesso!\n');
    
    // Verificar estrutura da tabela
    const schema = await prisma.$queryRaw`DESCRIBE tb_certificados`;
    console.log('📋 Estrutura da tabela tb_certificados:');
    console.table(schema);
    
    // Verificar se as colunas esperadas existem
    const expectedColumns = ['Codigo', 'Codigo_Aluno', 'Codigo_AnoLectivo', 'NumeroCertificado', 'DataEmissao', 'Status'];
    const actualColumns = schema.map(col => col.Field);
    
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      console.error(`❌ Colunas faltando: ${missingColumns.join(', ')}`);
      process.exit(1);
    } else {
      console.log('\n✅ Todas as colunas esperadas estão presentes!');
    }

  } catch (error) {
    console.error('❌ Erro ao recriar tabela de certificados:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

recreateCertificatesTable();
