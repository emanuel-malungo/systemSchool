import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const turma = await prisma.tb_turmas.findFirst({
      where: {
        designacao: 'Informática', // or look for class 35 / class with code from screenshot
        // Let's find a class where the class/room/course is "Informática"
      },
      include: {
        tb_classes: true,
        tb_cursos: true,
      }
    });

    console.log('Turmas found:', await prisma.tb_turmas.findMany({
      include: { tb_classes: true, tb_cursos: true }
    }));

    // Let's search for notes where CodigoAnoLectivo is correct (let's check what ano letivo designacao is 2022/2023)
    const anos = await prisma.tb_ano_lectivo.findMany();
    console.log('Anos Lectivos:', anos);

    const trimestres = await prisma.tb_trimestres.findMany();
    console.log('Trimestres:', trimestres);

    // Let's check all notes in the DB
    const allNotes = await prisma.tb_notas_alunos.findMany({
      take: 50,
      include: {
        tb_alunos: { select: { nome: true } },
        tb_disciplinas: { select: { designacao: true } }
      }
    });
    console.log('Sample notes in DB:', allNotes.map(n => ({
      aluno: n.tb_alunos?.nome,
      disc: n.tb_disciplinas?.designacao,
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
