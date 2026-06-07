import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const turma = await prisma.tb_turmas.findUnique({
      where: { codigo: 35 },
    });
    console.log('Turma 35 details:', turma);

    if (turma) {
      const gc = await prisma.tb_grade_curricular.findMany({
        where: {
          codigo_Classe: turma.codigo_Classe,
          codigo_Curso: turma.codigo_Curso
        },
        include: {
          tb_disciplinas: true
        }
      });
      console.log('Disciplines in grade curricular:', gc.map(g => ({
        codigo: g.tb_disciplinas?.codigo,
        designacao: g.tb_disciplinas?.designacao,
        status: g.status
      })));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
