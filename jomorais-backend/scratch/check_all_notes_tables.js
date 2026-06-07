import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const tables = [
      'tb_notas',
      'tb_notas_1_4',
      'tb_notas_5_6',
      'tb_notas_7_9',
      'tb_notas_alunos',
      'tb_notas_contgest_10_12',
      'tb_notas_enfermagem_10_12',
      'tb_notas_fis_bio_10_12',
      'tb_notas_jur_econ_10_12'
    ];

    console.log('Row counts for all notes tables:');
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`${table}: ${count}`);
      } catch (err) {
        console.log(`${table}: Error or not queryable (${err.message})`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
