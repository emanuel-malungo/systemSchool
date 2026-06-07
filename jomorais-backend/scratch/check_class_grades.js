import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const confirmacoes = await prisma.tb_confirmacoes.findMany({
      where: {
        codigo_Turma: 35,
      },
      include: {
        tb_matriculas: {
          include: {
            tb_alunos: true
          }
        }
      }
    });

    console.log(`Total students in class 35: ${confirmacoes.length}`);
    const studentIds = confirmacoes.map(c => c.tb_matriculas?.tb_alunos?.codigo).filter(Boolean);
    console.log('Student IDs in class 35:', studentIds);

    const notes = await prisma.tb_notas_alunos.findMany({
      where: {
        CodigoAluno: { in: studentIds }
      },
      include: {
        tb_alunos: { select: { nome: true } },
        tb_disciplinas: { select: { designacao: true } }
      }
    });

    console.log(`Total notes for students in class 35: ${notes.length}`);
    console.log(notes.map(n => ({
      aluno: n.tb_alunos?.nome,
      disciplina: n.tb_disciplinas?.designacao,
      nota: n.Nota,
      turma: n.CodigoTurma,
      ano: n.CodigoAnoLectivo,
      trim: n.CodigoTrimestre
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
