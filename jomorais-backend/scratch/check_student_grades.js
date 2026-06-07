import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const studentId = 5; // JOÃO SIMBA MBEUA MATIABA
    const notes = await prisma.tb_notas_alunos.findMany({
      where: {
        CodigoAluno: studentId,
      },
      include: {
        tb_disciplinas: true,
        tb_tipo_avaliacao: true,
        tb_trimestres: true
      }
    });

    console.log(`All notes for student ${studentId}:`);
    console.log(notes.map(n => ({
      disciplina: n.tb_disciplinas?.designacao,
      nota: n.Nota,
      turma: n.CodigoTurma,
      ano: n.CodigoAnoLectivo,
      trim: n.CodigoTrimestre,
      tipo: n.tb_tipo_avaliacao?.designacao
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
