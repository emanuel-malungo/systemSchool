import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const courseCounts = await prisma.tb_disciplinas.groupBy({
      by: ['codigo_Curso'],
      _count: {
        codigo: true
      }
    });
    console.log('Disciplines count by course:');
    console.log(courseCounts);

    const gradeCounts = await prisma.tb_grade_curricular.groupBy({
      by: ['codigo_Curso', 'codigo_Classe'],
      _count: {
        codigo: true
      }
    });
    console.log('\nGrade curricular count by course and class:');
    console.log(gradeCounts);

    // Let's also check all courses in the DB
    const allCursos = await prisma.tb_cursos.findMany();
    console.log('\nAll courses in DB:');
    console.log(allCursos);

    // Let's check classes
    const allClasses = await prisma.tb_classes.findMany();
    console.log('\nAll classes in DB:');
    console.log(allClasses);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
