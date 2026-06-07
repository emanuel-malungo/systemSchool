import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const gcCount = await prisma.tb_grade_curricular.count();
    const discCount = await prisma.tb_disciplinas.count();
    const cursoCount = await prisma.tb_cursos.count();
    const notasCount = await prisma.tb_notas_alunos.count();

    console.log('Counts:');
    console.log('tb_grade_curricular:', gcCount);
    console.log('tb_disciplinas:', discCount);
    console.log('tb_cursos:', cursoCount);
    console.log('tb_notas_alunos:', notasCount);

    // Let's get some courses
    const courses = await prisma.tb_cursos.findMany({
      take: 10,
    });
    console.log('Courses:', courses);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
