import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const note = await prisma.tb_notas_alunos.findFirst({
      where: {
        CodigoTurma: 35
      }
    });

    console.log('NOTE KEYS & VALUES:');
    if (note) {
      for (const [key, val] of Object.entries(note)) {
        console.log(`${key}: ${typeof val === 'bigint' ? val.toString() : val} (${typeof val})`);
      }
    } else {
      console.log('No notes found in class 35.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
