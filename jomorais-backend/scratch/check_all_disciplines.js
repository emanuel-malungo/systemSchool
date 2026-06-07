import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    // How does tb_disciplinas relate to courses?
    const sample = await prisma.tb_disciplinas.findFirst();
    console.log('Disciplina sample:', JSON.stringify(sample, null, 2));

    // Get all disciplines
    const all = await prisma.tb_disciplinas.findMany({ take: 20 });
    console.log('\nAll disciplines:', JSON.stringify(all, null, 2));

    // Check total grade curricular
    const totalGC = await prisma.tb_grade_curricular.count();
    console.log('\nTotal grade curricular entries:', totalGC);
    const allGC = await prisma.tb_grade_curricular.findMany({ take: 5 });
    console.log('Grade curricular samples:', JSON.stringify(allGC, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
