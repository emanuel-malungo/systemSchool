import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function syncDatabase() {
  console.log('🔄 Iniciando sincronização automática do banco de dados...');
  try {
    // 1. Executar tabelas de professores e avaliações
    const profSqlPath = path.join(process.cwd(), 'prisma/migrations/add_professor_and_evaluation_tables.sql');
    if (fs.existsSync(profSqlPath)) {
      console.log('📝 Sincronizando tabelas de professor e avaliação...');
      await runSqlFile(profSqlPath);
    }

    // 2. Executar criação das tabelas de certificados, declarações e histórico escolar
    const newTablesPath = path.join(process.cwd(), 'prisma/migrations/add_new_tables.sql');
    if (fs.existsSync(newTablesPath)) {
      console.log('📝 Sincronizando tabelas adicionais (certificados, declarações, histórico)...');
      await runSqlFile(newTablesPath);
    }
    
    // 3. Garantir a tabela de certificados com a estrutura correta (sem Codigo_Disciplina na Unique Key)
    try {
      const createCertificadosSQL = `CREATE TABLE IF NOT EXISTS \`tb_certificados\` (
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
      await prisma.$executeRawUnsafe(createCertificadosSQL);
    } catch (e) {
      // Ignorar se já existe
    }

    // 4. Rodar a migração das notas (adicionar CodigoTurma a tb_notas_alunos)
    try {
      console.log('📝 Verificando coluna CodigoTurma em tb_notas_alunos...');
      await prisma.$executeRawUnsafe(`ALTER TABLE tb_notas_alunos ADD COLUMN CodigoTurma INT UNSIGNED`);
      await prisma.$executeRawUnsafe(`ALTER TABLE tb_notas_alunos ADD INDEX FK_tb_notas_alunos_turma (CodigoTurma)`);
      await prisma.$executeRawUnsafe(`ALTER TABLE tb_notas_alunos ADD CONSTRAINT FK_tb_notas_alunos_turma FOREIGN KEY (CodigoTurma) REFERENCES tb_turmas (codigo) ON DELETE NO ACTION ON UPDATE NO ACTION`);
      console.log('✅ Coluna CodigoTurma adicionada com sucesso.');
    } catch (error) {
      const isDuplicate = 
        error.message.includes('Duplicate column') || 
        error.message.includes('already exists') || 
        error.message.includes('dup') || 
        error.message.includes('1060') ||
        error.message.includes('1061');
      if (isDuplicate) {
        console.log('ℹ️ Coluna CodigoTurma ou constraint já existem. Pulando...');
      } else {
        console.warn('⚠️ Aviso ao adicionar CodigoTurma:', error.message);
      }
    }

    console.log('✅ Sincronização do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro fatal na sincronização do banco de dados:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function runSqlFile(filePath) {
  try {
    let sqlContent = fs.readFileSync(filePath, 'utf-8');
    
    // Remover comentários SQL simples
    sqlContent = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (err) {
        // Ignora erros comuns de tabela/coluna duplicada
        const isCommonError = 
          err.message.includes('already exists') || 
          err.message.includes('Duplicate') ||
          err.message.includes('1050') || // Table already exists
          err.message.includes('1060') || // Duplicate column name
          err.message.includes('1061') || // Duplicate key name
          err.message.includes('1022');   // Can't write; duplicate key in table
        
        if (!isCommonError) {
          console.warn(`⚠️ Aviso ao executar statement do arquivo ${path.basename(filePath)}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.error(`❌ Erro ao ler ou executar arquivo SQL ${filePath}:`, err.message);
  }
}
