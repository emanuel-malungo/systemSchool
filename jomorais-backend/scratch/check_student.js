import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const notes = await prisma.tb_notas_alunos.findMany({
      where: {
        CodigoTurma: 35
      },
      include: {
        tb_disciplinas: true,
        tb_alunos: true
      }
    });

    console.log(`TOTAL NOTES FOR CLASS 35: ${notes.length}`);
    if (notes.length > 0) {
      console.log('Sample notes:');
      const samples = notes.slice(0, 10).map(n => ({
        aluno: n.tb_alunos?.nome,
        disciplina: n.tb_disciplinas?.designacao,
        nota: n.nota,
        tipo: n.CodigoTipoNota,
        trimestre: n.CodigoTrimestre
      }));
      console.log(samples);

      const uniqueDisciplines = [...new Set(notes.map(n => n.tb_disciplinas?.designacao))];
      console.log('Unique disciplines in notes for this class:', uniqueDisciplines);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
