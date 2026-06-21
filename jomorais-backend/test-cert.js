import { CertificatesService } from './src/services/certificates.services.js';
import prisma from './src/config/database.js';

async function test() {
  try {
    const turmas = await prisma.tb_turmas.findMany({
      include: {
        _count: {
          select: { tb_confirmacoes: true }
        }
      }
    });
    
    const target = turmas.find(t => t._count.tb_confirmacoes === 44);
    if (!target) {
      console.log("Could not find a class with exactly 44 students.");
      const any = turmas.find(t => t._count.tb_confirmacoes > 0);
      if (any) {
        console.log(`Using class ${any.codigo} with ${any._count.tb_confirmacoes} students instead.`);
        const res = await CertificatesService.createClassCertificates({
          codigoTurma: any.codigo,
          codigoAnoLectivo: any.codigo_AnoLectivo
        });
        console.log(JSON.stringify(res, null, 2));
      }
      return;
    }

    console.log(`Found class ${target.codigo} with 44 students.`);
    const res = await CertificatesService.createClassCertificates({
      codigoTurma: target.codigo,
      codigoAnoLectivo: target.codigo_AnoLectivo
    });
    
    console.log(JSON.stringify(res, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
