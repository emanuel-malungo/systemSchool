import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const turma = await prisma.tb_turmas.findUnique({ where: { codigo: 35 } });
    console.log('Turma 35:', JSON.stringify(turma, null, 2));

    // Check what columns exist in grade curricular
    const gc = await prisma.tb_grade_curricular.findFirst();
    console.log('Grade curricular sample:', JSON.stringify(gc, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
