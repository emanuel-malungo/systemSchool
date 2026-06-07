import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const ids = [5, 7, 9, 10, 1758, 1771];
    const students = await prisma.tb_alunos.findMany({
      where: {
        codigo: { in: ids }
      }
    });

    console.log('Students in class 35:');
    console.log(students.map(s => ({ codigo: s.codigo, nome: s.nome })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
