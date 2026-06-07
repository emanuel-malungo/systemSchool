import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const gc = await prisma.tb_grade_curricular.findMany({
      include: {
        tb_cursos: true
      }
    });

    const uniqueCourses = {};
    gc.forEach(g => {
      if (g.tb_cursos) {
        uniqueCourses[g.tb_cursos.codigo] = g.tb_cursos.designacao;
      }
    });

    console.log('Unique courses in grade curricular:', uniqueCourses);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
