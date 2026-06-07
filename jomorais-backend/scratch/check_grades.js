import prisma from '../src/config/database.js';

async function main() {
  try {
    const updated = await prisma.tb_utilizadores.update({
      where: { codigo: 9 },
      data: { passe: 'e10adc3949ba59abbe56e057f20f883e' }
    });
    console.log('Password updated successfully for user:', updated.user);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
