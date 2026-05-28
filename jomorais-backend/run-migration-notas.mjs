import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Adding CodigoTurma column to tb_notas_alunos...');
    
    // Add column
    await prisma.$executeRaw`ALTER TABLE tb_notas_alunos ADD COLUMN CodigoTurma INT UNSIGNED`;
    console.log('Column added successfully');
    
    // Add index and foreign key
    await prisma.$executeRaw`ALTER TABLE tb_notas_alunos ADD INDEX FK_tb_notas_alunos_turma (CodigoTurma)`;
    console.log('Index added successfully');
    
    await prisma.$executeRaw`ALTER TABLE tb_notas_alunos ADD CONSTRAINT FK_tb_notas_alunos_turma FOREIGN KEY (CodigoTurma) REFERENCES tb_turmas (codigo) ON DELETE NO ACTION ON UPDATE NO ACTION`;
    console.log('Foreign key added successfully');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error.message);
    if (error.message.includes('Duplicate column')) {
      console.log('Column already exists, skipping...');
    }
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
