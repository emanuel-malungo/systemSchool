import prisma from './config/database.js';

async function main() {
  const linkedProfs = await prisma.tb_professores.findMany({
    where: {
      Codigo_Utilizador: { gt: 0 }
    }
  });
  console.log('Professores com Codigo_Utilizador > 0:');
  for (const p of linkedProfs) {
    console.log(` - ID: ${p.Codigo}, Nome: ${p.Nome}, Codigo_Utilizador: ${p.Codigo_Utilizador}`);
    // Let's find their turmas
    const turmas = await prisma.tb_professor_turma.findMany({
      where: { Codigo_Professor: p.Codigo }
    });
    console.log(`   Atribuições de Turmas (${turmas.length}):`);
    for (const t of turmas) {
      console.log(`     - Turma: ${t.Codigo_Turma}, Disciplina: ${t.Codigo_Disciplina}, AnoLetivo: ${t.AnoLectivo}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
