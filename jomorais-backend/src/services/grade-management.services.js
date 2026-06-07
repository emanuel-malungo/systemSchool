// services/grade-management.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

export class GradeManagementService {
  // Helper para calcular a nota trimestral consolidada por disciplina usando pesos (MAC: 40%, PP: 20%, PT: 40%)
  static _calcularNotaTrimestral(notasDaDisciplina) {
    const macNotas = notasDaDisciplina.filter(n => n.CodigoTipoAvaliacao === 1);
    const ppNotas = notasDaDisciplina.filter(n => n.CodigoTipoAvaliacao === 2 || n.CodigoTipoAvaliacao === 9);
    const ptNotas = notasDaDisciplina.filter(n => n.CodigoTipoAvaliacao === 3 || n.CodigoTipoAvaliacao === 10);

    // Se não houver nenhuma nota nos tipos padrão, faz fallback para média simples de qualquer nota disponível
    if (macNotas.length === 0 && ppNotas.length === 0 && ptNotas.length === 0) {
      if (notasDaDisciplina.length === 0) return null;
      const sum = notasDaDisciplina.reduce((acc, n) => acc + (n.Nota || 0), 0);
      return parseFloat((sum / notasDaDisciplina.length).toFixed(1));
    }

    const macVal = macNotas.length > 0 ? (macNotas.reduce((acc, n) => acc + (n.Nota || 0), 0) / macNotas.length) : null;
    const ppVal = ppNotas.length > 0 ? (ppNotas.reduce((acc, n) => acc + (n.Nota || 0), 0) / ppNotas.length) : null;
    const ptVal = ptNotas.length > 0 ? (ptNotas.reduce((acc, n) => acc + (n.Nota || 0), 0) / ptNotas.length) : null;

    let totalWeight = 0;
    let weightedSum = 0;

    if (macVal !== null) {
      weightedSum += macVal * 0.4;
      totalWeight += 0.4;
    }
    if (ppVal !== null) {
      weightedSum += ppVal * 0.2;
      totalWeight += 0.2;
    }
    if (ptVal !== null) {
      weightedSum += ptVal * 0.4;
      totalWeight += 0.4;
    }

    return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(1)) : 0;
  }

  // ===============================
  // LANÇAMENTO DE NOTAS - CRUD
  // ===============================

  static async createGrade(data) {
    try {
      const {
        codigoAluno,
        codigoDisciplina,
        nota,
        codigoAnoLectivo,
        codigoTipoAvaliacao,
        codigoTrimestre,
        codigoTurma,
        codigoUtilizador
      } = data;

      // Validações básicas
      if (
        !codigoAluno ||
        !codigoDisciplina ||
        nota === undefined ||
        !codigoAnoLectivo ||
        !codigoTipoAvaliacao ||
        !codigoTrimestre ||
        !codigoUtilizador
      ) {
        throw new AppError(
          'Campos obrigatórios: codigoAluno, codigoDisciplina, nota, codigoAnoLectivo, codigoTipoAvaliacao, codigoTrimestre, codigoUtilizador',
          400
        );
      }

      // Validar nota entre 0 e 20
      if (nota < 0 || nota > 20) {
        throw new AppError('Nota deve estar entre 0 e 20', 400);
      }

      // Validar entidades relacionadas
      const [aluno, disciplina, anoLectivo, tipoAvaliacao, trimestre, utilizador] = await Promise.all([
        prisma.tb_alunos.findUnique({ where: { codigo: parseInt(codigoAluno) } }),
        prisma.tb_disciplinas.findUnique({ where: { codigo: parseInt(codigoDisciplina) } }),
        prisma.tb_ano_lectivo.findUnique({ where: { codigo: parseInt(codigoAnoLectivo) } }),
        prisma.tb_tipo_avaliacao.findUnique({ where: { codigo: parseInt(codigoTipoAvaliacao) } }),
        prisma.tb_trimestres.findUnique({ where: { codigo: parseInt(codigoTrimestre) } }),
        prisma.tb_utilizadores.findUnique({ where: { codigo: parseInt(codigoUtilizador) } })
      ]);

      if (!aluno) throw new AppError('Aluno não encontrado', 404);
      if (!disciplina) throw new AppError('Disciplina não encontrada', 404);
      if (!anoLectivo) throw new AppError('Ano letivo não encontrado', 404);
      if (!tipoAvaliacao) throw new AppError('Tipo de avaliação não encontrado', 404);
      if (!trimestre) throw new AppError('Trimestre não encontrado', 404);
      if (!utilizador) throw new AppError('Utilizador não encontrado', 404);

      // Validar turma se fornecida
      if (codigoTurma) {
        const turmaExists = await prisma.tb_turmas.findUnique({
          where: { codigo: parseInt(codigoTurma) }
        });
        if (!turmaExists) throw new AppError('Turma não encontrada', 404);
      }

      // Verificar se já existe nota para este aluno/disciplina/avaliação/trimestre
      const existingGrade = await prisma.tb_notas_alunos.findFirst({
        where: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoDisciplina: parseInt(codigoDisciplina),
          CodigoTipoAvaliacao: parseInt(codigoTipoAvaliacao),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        }
      });

      if (existingGrade) {
        throw new AppError(
          'Já existe uma nota para este aluno nesta disciplina e avaliação',
          409
        );
      }

      // Criar nota
      const grade = await prisma.tb_notas_alunos.create({
        data: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoDisciplina: parseInt(codigoDisciplina),
          Nota: parseFloat(nota),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo),
          CodigoTipoAvaliacao: parseInt(codigoTipoAvaliacao),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoTurma: codigoTurma ? parseInt(codigoTurma) : null,
          CodigoUtilizador: parseInt(codigoUtilizador),
          DataCadastro: Math.floor(Date.now() / 1000) // Unix timestamp em segundos
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...grade,
        mensagem: 'Nota lançada com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar nota:', error);
      throw new AppError(`Erro ao lançar nota: ${error.message}`, 500);
    }
  }

  static async updateGrade(id, data) {
    try {
      const gradeId = parseInt(id);

      const existingGrade = await prisma.tb_notas_alunos.findUnique({
        where: { Codigo: gradeId }
      });

      if (!existingGrade) {
        throw new AppError('Nota não encontrada', 404);
      }

      // Validar nota se fornecida
      if (data.nota !== undefined) {
        if (data.nota < 0 || data.nota > 20) {
          throw new AppError('Nota deve estar entre 0 e 20', 400);
        }
      }

      // Preparar dados de atualização
      const updateData = {};

      if (data.nota !== undefined) {
        updateData.Nota = parseFloat(data.nota);
      }

      // Registrar na auditoria se houve mudança
      if (updateData.Nota !== undefined && updateData.Nota !== existingGrade.Nota) {
        await prisma.tb_historico_notas.create({
          data: {
            Codigo_Nota: gradeId,
            CampoAlterado: 'Nota',
            ValorAnterior: existingGrade.Nota,
            ValorNovo: updateData.Nota,
            MotivoAlteracao: data.motivo || 'Atualização de nota',
            AlteradoPor: data.codigoUtilizador ? parseInt(data.codigoUtilizador) : 1,
            DataAlteracao: new Date()
          }
        });
      }

      const updated = await prisma.tb_notas_alunos.update({
        where: { Codigo: gradeId },
        data: updateData,
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...updated,
        mensagem: 'Nota atualizada com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atualizar nota: ${error.message}`, 500);
    }
  }

  static async getGrades(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;

      const where = {};
      if (filters.codigoAluno) where.CodigoAluno = parseInt(filters.codigoAluno);
      if (filters.codigoDisciplina) where.CodigoDisciplina = parseInt(filters.codigoDisciplina);
      // Note: CodigoTurma filter commented out as column doesn't exist in db yet
      // if (filters.codigoTurma) where.CodigoTurma = parseInt(filters.codigoTurma);
      if (filters.codigoTrimestre) where.CodigoTrimestre = parseInt(filters.codigoTrimestre);
      if (filters.codigoAnoLectivo) where.CodigoAnoLectivo = parseInt(filters.codigoAnoLectivo);

      const [grades, total] = await Promise.all([
        prisma.tb_notas_alunos.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            tb_alunos: { select: { codigo: true, nome: true } },
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
            tb_trimestres: { select: { codigo: true, designacao: true } },
            tb_turmas: { select: { codigo: true, designacao: true } }
          },
          orderBy: [{ CodigoTrimestre: 'asc' }, { tb_alunos: { nome: 'asc' } }]
        }),
        prisma.tb_notas_alunos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: grades,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw new AppError(`Erro ao buscar notas: ${error.message}`, 500);
    }
  }

  static async getGradeById(id) {
    try {
      const grade = await prisma.tb_notas_alunos.findUnique({
        where: { Codigo: parseInt(id) },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } },
          tb_turmas: { select: { codigo: true, designacao: true } }
        }
      });

      if (!grade) {
        throw new AppError('Nota não encontrada', 404);
      }

      return grade;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao buscar nota: ${error.message}`, 500);
    }
  }

  static async deleteGrade(id) {
    try {
      const grade = await prisma.tb_notas_alunos.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!grade) {
        throw new AppError('Nota não encontrada', 404);
      }

      await prisma.tb_notas_alunos.delete({
        where: { Codigo: parseInt(id) }
      });

      return {
        mensagem: 'Nota removida com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao remover nota: ${error.message}`, 500);
    }
  }

  // ===============================
  // PAUTA (CONSOLIDAÇÃO DE NOTAS)
  // ===============================

  static async exportPautaPDF(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    const pautaData = await this.generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo);
    
    const metadata = await prisma.tb_turmas.findUnique({
      where: { codigo: parseInt(codigoTurma) },
      include: {
        tb_classes: true,
        tb_cursos: true,
        tb_periodos: true,
        tb_ano_lectivo: true
      }
    });

    const trimestre = await prisma.tb_trimestres.findUnique({
      where: { codigo: parseInt(codigoTrimestre) }
    });

    const descClasse = metadata?.tb_classes?.designacao || '';
    const descCurso = metadata?.tb_cursos?.designacao || '';
    const descPeriodo = metadata?.tb_periodos?.designacao || '';
    const descTurma = metadata?.designacao || '';
    const descTrimestre = trimestre?.designacao || '1º Trimestre';
    const descAno = metadata?.tb_ano_lectivo?.designacao || '';

    // Count genders
    let totalM = 0;
    let totalF = 0;
    const confirmacoesList = await prisma.tb_confirmacoes.findMany({
      where: {
        codigo_Turma: parseInt(codigoTurma),
        codigo_Ano_lectivo: parseInt(codigoAnoLectivo)
      },
      include: {
        tb_matriculas: {
          include: {
            tb_alunos: { select: { sexo: true } }
          }
        }
      }
    });

    confirmacoesList.forEach(c => {
      const s = c.tb_matriculas?.tb_alunos?.sexo?.toUpperCase();
      if (s === 'M' || s?.startsWith('MASC')) {
        totalM++;
      } else if (s === 'F' || s?.startsWith('FEM') || s === 'W') {
        totalF++;
      }
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header Info
      doc.fontSize(14).font('Helvetica-Bold').text('INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS', { align: 'center' });
      doc.fontSize(12).text('PAUTA DE APROVEITAMENTO ESCOLAR', { align: 'center' });
      doc.fontSize(10).font('Helvetica-Oblique').text('ÁREA DE FORMAÇÃO: SAÚDE', { align: 'center' });
      doc.moveDown(0.5);

      // Metadata Info Line
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(`${descClasse}   |   CURSO: ${descCurso}   |   TURMA: ${descTurma}   |   PERÍODO: ${descPeriodo}   |   ${descTrimestre}   |   ANO: ${descAno}   |   MF: ${confirmacoesList.length} (M: ${totalM} F: ${totalF})`, { align: 'center' });
      doc.moveDown();

      // Dynamic Grid
      const allDisciplinesSet = new Set();
      for (const info of Object.values(pautaData.pauta)) {
        if (info.disciplinas) {
          info.disciplinas.forEach(d => allDisciplinesSet.add(d.disciplina));
        }
      }
      const disciplines = Array.from(allDisciplinesSet).sort();

      // Setup table header position
      let startX = 35;
      let startY = doc.y;
      
      doc.fontSize(7);
      
      // Draw grid headers
      doc.text('Nº', startX, startY, { width: 20, align: 'center' });
      doc.text('PROC', startX + 20, startY, { width: 30, align: 'center' });
      doc.text('NOME DO ALUNO', startX + 50, startY, { width: 125 });

      let curX = startX + 175;
      disciplines.forEach(d => {
        const shortName = d.length > 7 ? d.substring(0, 6) + '.' : d;
        doc.text(shortName, curX, startY, { width: 40, align: 'center' });
        curX += 40;
      });

      doc.text('MÉDIA', curX, startY, { width: 30, align: 'center' });
      doc.text('OBS', curX + 30, startY, { width: 40, align: 'center' });
      doc.text('ID.', curX + 70, startY, { width: 20, align: 'center' });
      doc.text('GEN.', curX + 90, startY, { width: 20, align: 'center' });

      doc.moveDown(0.5);
      doc.font('Helvetica');

      // Stats tracking
      let stats = {
        matriculados: { m: 0, f: 0 },
        transita: { m: 0, f: 0 },
        nTransita: { m: 0, f: 0 },
        desistidos: { m: 0, f: 0 }
      };
      let maxMedia = 0;
      let melhorAluno = { nome: '-', idade: '-' };

      // Draw rows
      let index = 1;
      for (const [alunoId, info] of Object.entries(pautaData.pauta)) {
        let rowY = doc.y;

        if (rowY > 520) {
          doc.addPage();
          rowY = 40;
          doc.font('Helvetica-Bold');
          doc.text('Nº', startX, rowY, { width: 20, align: 'center' });
          doc.text('PROC', startX + 20, rowY, { width: 30, align: 'center' });
          doc.text('NOME DO ALUNO', startX + 50, rowY, { width: 125 });

          let tempX = startX + 175;
          disciplines.forEach(d => {
            const shortName = d.length > 7 ? d.substring(0, 6) + '.' : d;
            doc.text(shortName, tempX, rowY, { width: 40, align: 'center' });
            tempX += 40;
          });

          doc.text('MÉDIA', tempX, rowY, { width: 30, align: 'center' });
          doc.text('OBS', tempX + 30, rowY, { width: 40, align: 'center' });
          doc.text('ID.', tempX + 70, rowY, { width: 20, align: 'center' });
          doc.text('GEN.', tempX + 90, rowY, { width: 20, align: 'center' });

          doc.font('Helvetica');
          doc.moveDown(0.5);
          rowY = doc.y;
        }

        const alunoNome = (info.aluno?.nome || 'N/A').toUpperCase();
        const alunoProc = info.aluno?.codigo?.toString() || alunoId;
        
        const birthYear = info.aluno?.dataNascimento ? new Date(info.aluno.dataNascimento).getFullYear() : 0;
        const currentYear = new Date().getFullYear();
        const idade = birthYear > 0 ? (currentYear - birthYear).toString() : '-';
        
        const generoRaw = info.aluno?.sexo?.toUpperCase() || '';
        const genero = (generoRaw === 'M' || generoRaw.startsWith('MASC')) ? 'M' : ((generoRaw === 'F' || generoRaw.startsWith('FEM') || generoRaw === 'W') ? 'F' : '-');
        
        const isM = genero === 'M';
        const isF = genero === 'F';
        const isDesistente = info.aluno?.codigo_Status !== 1;

        if (isM) stats.matriculados.m++;
        if (isF) stats.matriculados.f++;
        if (isDesistente) {
          if (isM) stats.desistidos.m++;
          if (isF) stats.desistidos.f++;
        }

        doc.text(index.toString(), startX, rowY, { width: 20, align: 'center' });
        doc.text(alunoProc, startX + 20, rowY, { width: 30, align: 'center' });
        doc.text(alunoNome, startX + 50, rowY, { width: 125 });

        let valX = startX + 175;
        let sumGrades = 0;
        let countGrades = 0;

        disciplines.forEach(dName => {
          const dObj = info.disciplinas?.find(d => d.disciplina === dName);
          if (dObj && dObj.nota !== undefined && dObj.nota !== null) {
            const notaVal = dObj.nota;
            doc.fillColor(notaVal >= 10 ? 'green' : 'red');
            doc.text(notaVal.toFixed(1), valX, rowY, { width: 40, align: 'center' });
            sumGrades += notaVal;
            countGrades++;
          } else {
            doc.fillColor('black');
            doc.text('-', valX, rowY, { width: 40, align: 'center' });
          }
          valX += 40;
        });

        doc.fillColor('black');
        const media = countGrades > 0 ? sumGrades / countGrades : 0;
        if (countGrades > 0) {
          doc.font('Helvetica-Bold');
          doc.fillColor(media < 10 ? 'red' : 'black');
          doc.text(media.toFixed(2), valX, rowY, { width: 30, align: 'center' });

          if (!isDesistente) {
            doc.fillColor(media >= 10 ? 'blue' : 'red');
            doc.text(media >= 10 ? 'TRANS' : 'N/TRAN', valX + 30, rowY, { width: 40, align: 'center' });
            
            if (media >= 10) {
              if (isM) stats.transita.m++;
              if (isF) stats.transita.f++;
            } else {
              if (isM) stats.nTransita.m++;
              if (isF) stats.nTransita.f++;
            }

            if (media > maxMedia) {
              maxMedia = media;
              melhorAluno = { nome: alunoNome, idade: idade };
            }
          } else {
            doc.fillColor('black');
            doc.font('Helvetica-Oblique');
            doc.text('DESIST.', valX + 30, rowY, { width: 40, align: 'center' });
          }
          doc.font('Helvetica');
        } else {
          doc.text('-', valX, rowY, { width: 30, align: 'center' });
          doc.font(isDesistente ? 'Helvetica-Oblique' : 'Helvetica');
          doc.text(isDesistente ? 'DESIST.' : '-', valX + 30, rowY, { width: 40, align: 'center' });
          doc.font('Helvetica');
        }

        doc.fillColor('black');
        doc.text(idade, valX + 70, rowY, { width: 20, align: 'center' });
        doc.text(genero, valX + 90, rowY, { width: 20, align: 'center' });

        doc.fillColor('black');
        doc.moveDown(0.6);
        index++;
      }

      // Check if there is space for stats and signatures (approx 150pt needed)
      if (doc.y > 400) {
        doc.addPage();
      } else {
        doc.moveDown(2);
      }

      const statY = doc.y;
      
      // Draw Stats Block
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('DADOS ESTATÍSTICOS', startX, statY);
      doc.moveDown(0.5);
      const ty = doc.y;

      doc.text('M', startX + 100, ty);
      doc.text('F', startX + 130, ty);
      doc.text('SOMA', startX + 160, ty);
      
      doc.font('Helvetica').fontSize(8);
      const statRowsData = [
        { label: 'MATRICULADOS', m: stats.matriculados.m, f: stats.matriculados.f },
        { label: 'TRANSITA', m: stats.transita.m, f: stats.transita.f },
        { label: 'N/TRANSITA', m: stats.nTransita.m, f: stats.nTransita.f },
        { label: 'DESISTIDO/A', m: stats.desistidos.m, f: stats.desistidos.f }
      ];

      let ry = ty + 15;
      statRowsData.forEach(sr => {
        doc.text(sr.label, startX, ry);
        doc.text(sr.m.toString(), startX + 100, ry);
        doc.text(sr.f.toString(), startX + 130, ry);
        doc.text((sr.m + sr.f).toString(), startX + 160, ry);
        ry += 15;
      });

      // Melhor Aluno Box
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(`MÁXIMA: ${maxMedia.toFixed(1)}`, startX + 220, ty);
      doc.font('Helvetica').fontSize(8);
      doc.text(`NOME DO/A ALUNO/A: ${melhorAluno.nome}`, startX + 220, ty + 15);
      doc.text(`IDADE: ${melhorAluno.idade}`, startX + 220, ty + 30);

      // Signatures
      doc.moveDown(3);
      const sigY = Math.max(ry + 30, doc.y);
      
      const sig1X = startX + 50;
      const sig2X = startX + 450;

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text(`DATA DO CONSELHO DE TURMA ___ / ___ / ${new Date().getFullYear()}`, startX, sigY);
      
      doc.text('A Directora da Turma', sig1X, sigY + 40, { width: 200, align: 'center' });
      doc.text('__________________________________________', sig1X, sigY + 70, { width: 200, align: 'center' });
      doc.font('Helvetica').fontSize(9);
      doc.text(pautaData.directorTurma?.tb_docente?.nome || '', sig1X, sigY + 85, { width: 200, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('O Subdirector Pedagógico', sig2X, sigY + 40, { width: 200, align: 'center' });
      doc.text('__________________________________________', sig2X, sigY + 70, { width: 200, align: 'center' });
      doc.font('Helvetica').fontSize(9);
      doc.text(pautaData.instituicao?.subDirector || '', sig2X, sigY + 85, { width: 200, align: 'center' });

      doc.end();
    });
  }

  static async exportPautaExcel(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    const pautaData = await this.generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo);
    
    const metadata = await prisma.tb_turmas.findUnique({
      where: { codigo: parseInt(codigoTurma) },
      include: {
        tb_classes: true,
        tb_cursos: true,
        tb_periodos: true,
        tb_ano_lectivo: true
      }
    });

    const trimestre = await prisma.tb_trimestres.findUnique({
      where: { codigo: parseInt(codigoTrimestre) }
    });

    const descClasse = (metadata?.tb_classes?.designacao || '11ª CLASSE').toUpperCase();
    const descCurso = (metadata?.tb_cursos?.designacao || '').toUpperCase();
    const descPeriodo = (metadata?.tb_periodos?.designacao || '').toUpperCase();
    const descTurma = (metadata?.designacao || '').toUpperCase();
    const descTrimestre = (trimestre?.designacao || '1º TRIMESTRE').toUpperCase();
    const descAno = (metadata?.tb_ano_lectivo?.designacao || '').toUpperCase();

    // Gender stats
    let totalM = 0;
    let totalF = 0;
    const confirmacoesList = await prisma.tb_confirmacoes.findMany({
      where: {
        codigo_Turma: parseInt(codigoTurma),
        codigo_Ano_lectivo: parseInt(codigoAnoLectivo)
      },
      include: {
        tb_matriculas: {
          include: {
            tb_alunos: { select: { sexo: true } }
          }
        }
      }
    });

    confirmacoesList.forEach(c => {
      const s = c.tb_matriculas?.tb_alunos?.sexo?.toUpperCase();
      if (s === 'M' || s?.startsWith('MASC')) {
        totalM++;
      } else if (s === 'F' || s?.startsWith('FEM') || s === 'W') {
        totalF++;
      }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('PAUTA');

    // Make grid lines visible!
    sheet.views = [{ showGridLines: true }];

    // Base Styles
    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    };

    // Row 4: Logo text
    sheet.mergeCells('B4:P4');
    const titleCell = sheet.getCell('B4');
    titleCell.value = 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS';
    titleCell.font = { name: 'Calibri', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Row 5: Green thick line
    sheet.mergeCells('A5:AT5');
    const greenLine = sheet.getCell('A5');
    greenLine.border = { top: { style: 'medium', color: { argb: 'FF548235' } } }; // Green

    // Row 6: Subtitle
    sheet.mergeCells('A6:AT6');
    const subtitleCell = sheet.getCell('A6');
    subtitleCell.value = 'PAUTA DE APROVEITAMENTO ESCOLAR';
    subtitleCell.font = { name: 'Calibri', size: 14, bold: true };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 7: Area de formacao
    sheet.mergeCells('A7:AT7');
    const areaCell = sheet.getCell('A7');
    areaCell.value = 'ÁREA DE FORMAÇÃO: SAÚDE'; // To make SAÚDE blue, rich text is needed, but simple value is OK for now
    areaCell.font = { name: 'Calibri', size: 11, bold: true };
    areaCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Director Block (Left Side)
    sheet.mergeCells('B9:E9');
    const dirTitle = sheet.getCell('B9');
    dirTitle.value = 'O Director do Instituto';
    dirTitle.font = { name: 'Calibri', size: 9, bold: true };
    dirTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('B11:E11');
    const dirLine = sheet.getCell('B11');
    dirLine.value = '________________________________________';
    dirLine.alignment = { horizontal: 'center', vertical: 'bottom' };

    sheet.mergeCells('B12:E12');
    const dirName = sheet.getCell('B12');
    dirName.value = (pautaData.instituicao?.director || 'GABRIEL PRÓSPERO MADIALA').toUpperCase();
    dirName.font = { name: 'Calibri', size: 9, bold: true };
    dirName.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('B13:E13');
    const dirDate = sheet.getCell('B13');
    dirDate.value = `DATA ___ / ___ / ${new Date().getFullYear()}`;
    dirDate.font = { name: 'Calibri', size: 9, bold: true };
    dirDate.alignment = { horizontal: 'center', vertical: 'middle' };

    // Center Block (Classe, Turma, Curso, Periodo, Trimestre, Ano)
    // Classe
    sheet.mergeCells('I9:K9');
    const clsCell = sheet.getCell('I9');
    clsCell.value = descClasse;
    clsCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0070C0' } };
    clsCell.alignment = { horizontal: 'right', vertical: 'middle' };

    // Turma
    sheet.mergeCells('I11:K11');
    const trmCell = sheet.getCell('I11');
    trmCell.value = `TURMA: ${descTurma}`;
    trmCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFC00000' } };
    trmCell.alignment = { horizontal: 'right', vertical: 'middle' };

    // Curso (Center Large)
    sheet.mergeCells('M10:U10');
    const cursoCell = sheet.getCell('M10');
    cursoCell.value = `CURSO: ${descCurso}`;
    cursoCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0070C0' } };
    cursoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Underline for Curso
    sheet.mergeCells('M11:U11');
    sheet.getCell('M11').border = { top: { style: 'thin', color: { argb: 'FF000000' } } };

    // Período
    sheet.mergeCells('W8:AA8');
    const perCell = sheet.getCell('W8');
    perCell.value = `PERÍODO: ${descPeriodo}`;
    perCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFC00000' } };
    perCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Trimestre
    sheet.mergeCells('W10:AA10');
    const trimCell = sheet.getCell('W10');
    trimCell.value = descTrimestre;
    trimCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFC00000' } };
    trimCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Ano Lectivo
    sheet.mergeCells('W11:AA11');
    const anoCell = sheet.getCell('W11');
    anoCell.value = `ANO LECTIVO: ${descAno}`;
    anoCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFC00000' } };
    anoCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // MF Block (Right Side)
    sheet.getCell('AD9').value = `MF:`;
    sheet.getCell('AD9').font = { name: 'Calibri', size: 10, bold: true };
    sheet.getCell('AE9').value = confirmacoesList.length;
    sheet.getCell('AE9').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0070C0' } };

    sheet.getCell('AD10').value = `M:`;
    sheet.getCell('AD10').font = { name: 'Calibri', size: 10, bold: true };
    sheet.getCell('AE10').value = totalM;
    sheet.getCell('AE10').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0070C0' } };

    sheet.getCell('AD11').value = `F:`;
    sheet.getCell('AD11').font = { name: 'Calibri', size: 10, bold: true };
    sheet.getCell('AE11').value = totalF;
    sheet.getCell('AE11').font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFC00000' } };

    // Date Box
    sheet.mergeCells('AG10:AH11');
    const dBox = sheet.getCell('AG10');
    const today = new Date();
    dBox.value = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().substring(2)}`;
    dBox.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0070C0' } };
    dBox.alignment = { horizontal: 'center', vertical: 'middle' };
    dBox.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    };

    // Get unique disciplines
    const allDisciplinesSet = new Set();
    for (const info of Object.values(pautaData.pauta)) {
      if (info.disciplinas) {
        info.disciplinas.forEach(d => allDisciplinesSet.add(d.disciplina));
      }
    }
    const disciplines = Array.from(allDisciplinesSet).sort();

    // Setup columns & table headers
    // Merge cells for A14:A16 (Nº), B14:B16 (Nº PROC), C14:C16 (NOME), D14:D16 (DISCIPLINA A REPETIR)
    const headerPositions = [
      { cell: 'A14', val: 'Nº', merge: 'A14:A16' },
      { cell: 'B14', val: 'Nº PROC', merge: 'B14:B16' },
      { cell: 'C14', val: 'NOME', merge: 'C14:C16' },
      { cell: 'D14', val: 'DISCIPLINA A REPETIR', merge: 'D14:D16' }
    ];

    headerPositions.forEach(hp => {
      sheet.mergeCells(hp.merge);
      const c = sheet.getCell(hp.cell);
      c.value = hp.val;
      c.font = { name: 'Calibri', size: 10, bold: true };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.fill = headerFill;
      c.border = borderStyle;
    });

    // We start adding disciplines at column 5 (E)
    let colIndex = 5;
    const disciplineColsMap = {};

    disciplines.forEach(dName => {
      const colLetter1 = columnToLetter(colIndex);
      const colLetter2 = columnToLetter(colIndex + 1);

      // Merge horizontally for Discipline name
      sheet.mergeCells(`${colLetter1}14:${colLetter2}14`);
      const discCell = sheet.getCell(`${colLetter1}14`);
      discCell.value = dName.toUpperCase();
      discCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF005080' } };
      discCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      discCell.fill = headerFill;
      discCell.border = borderStyle;

      // Row 15: Column 1 = FALTAS, Column 2 = MT[Trimester]
      const fCell = sheet.getCell(`${colLetter1}15`);
      fCell.value = 'FALTAS';
      fCell.font = { name: 'Calibri', size: 7, bold: true };
      fCell.alignment = { horizontal: 'center', vertical: 'middle' };
      fCell.fill = headerFill;
      fCell.border = borderStyle;

      const gCell = sheet.getCell(`${colLetter2}15`);
      gCell.value = `MT${codigoTrimestre}º`;
      gCell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: 'FFC00000' } };
      gCell.alignment = { horizontal: 'center', vertical: 'middle' };
      gCell.fill = headerFill;
      gCell.border = borderStyle;

      // Row 16: Column 1 = / / /, Column 2 = empty
      const slCell = sheet.getCell(`${colLetter1}16`);
      slCell.value = '/  /  /';
      slCell.font = { name: 'Calibri', size: 7, italic: true };
      slCell.alignment = { horizontal: 'center', vertical: 'middle' };
      slCell.fill = headerFill;
      slCell.border = borderStyle;

      const emCell = sheet.getCell(`${colLetter2}16`);
      emCell.fill = headerFill;
      emCell.border = borderStyle;

      // Save columns mapping
      disciplineColsMap[dName] = { faltasCol: colLetter1, gradeCol: colLetter2 };

      colIndex += 2;
    });

    // Add OBS column after disciplines
    const obsColLetter = columnToLetter(colIndex);
    const mediaColLetter = columnToLetter(colIndex + 1);
    const idadeColLetter = columnToLetter(colIndex + 2);
    const generoColLetter = columnToLetter(colIndex + 3);
    colIndex += 3; // Update colIndex for the new columns

    const extraCols = [
      { letter: obsColLetter, val: 'OBS' },
      { letter: mediaColLetter, val: 'MÉDIA' },
      { letter: idadeColLetter, val: 'Idade' },
      { letter: generoColLetter, val: 'Género' }
    ];

    extraCols.forEach(col => {
      sheet.mergeCells(`${col.letter}14:${col.letter}16`);
      const cell = sheet.getCell(`${col.letter}14`);
      cell.value = col.val;
      cell.font = { name: 'Calibri', size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', textRotation: col.val === 'Idade' || col.val === 'Género' ? 90 : 0 };
      cell.fill = headerFill;
      cell.border = borderStyle;
    });

    // Set row heights
    sheet.getRow(14).height = 25;
    sheet.getRow(15).height = 18;
    sheet.getRow(16).height = 15;

    // Track statistics
    let stats = {
      matriculados: { m: 0, f: 0 },
      transita: { m: 0, f: 0 },
      nTransita: { m: 0, f: 0 },
      desistidos: { m: 0, f: 0 }
    };
    let maxMedia = 0;
    let melhorAluno = { nome: '-', idade: '-' };

    // Draw students rows starting from Row 17
    let rowNum = 17;
    let index = 1;

    for (const [alunoId, info] of Object.entries(pautaData.pauta)) {
      const row = sheet.getRow(rowNum);
      row.height = 20;

      const cellA = row.getCell(1);
      cellA.value = index;
      cellA.alignment = { horizontal: 'center', vertical: 'middle' };
      cellA.border = borderStyle;

      const cellB = row.getCell(2);
      cellB.value = parseInt(info.aluno?.codigo) || index;
      cellB.alignment = { horizontal: 'center', vertical: 'middle' };
      cellB.border = borderStyle;

      const cellC = row.getCell(3);
      cellC.value = (info.aluno?.nome || 'N/A').toUpperCase();
      cellC.alignment = { horizontal: 'left', vertical: 'middle' };
      cellC.border = borderStyle;

      // Col D: Disciplina a repetir (leave empty or compute if they have < 10)
      const repeatDiscs = [];
      
      let sumGrades = 0;
      let countGrades = 0;

      // Populate grades
      disciplines.forEach(dName => {
        const dObj = info.disciplinas?.find(d => d.disciplina === dName);
        const { faltasCol, gradeCol } = disciplineColsMap[dName];

        // Faltas column (always empty or slash)
        const cellF = row.getCell(faltasCol);
        cellF.border = borderStyle;
        cellF.alignment = { horizontal: 'center', vertical: 'middle' };

        // Grade column
        const cellG = row.getCell(gradeCol);
        cellG.border = borderStyle;
        cellG.alignment = { horizontal: 'center', vertical: 'middle' };

        if (dObj && dObj.nota !== undefined && dObj.nota !== null) {
          const n = dObj.nota;
          cellG.value = n;
          cellG.numFmt = '0.0';
          if (n < 10) {
            cellG.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFF0000' } }; // Red
            repeatDiscs.push(dName.substring(0, 5));
          } else {
            cellG.font = { name: 'Calibri', size: 9, color: { argb: 'FF000000' } };
          }
          sumGrades += n;
          countGrades++;
        } else {
          cellG.value = '-';
          cellG.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });

      // Repeat list
      const cellD = row.getCell(4);
      cellD.value = repeatDiscs.join(', ');
      cellD.font = { name: 'Calibri', size: 8, italic: true };
      cellD.alignment = { horizontal: 'center', vertical: 'middle' };
      cellD.border = borderStyle;

      // Calculate Idade and Genero
      const birthYear = info.aluno?.dataNascimento ? new Date(info.aluno.dataNascimento).getFullYear() : 0;
      const currentYear = new Date().getFullYear();
      const idade = birthYear > 0 ? currentYear - birthYear : '-';
      const generoRaw = info.aluno?.sexo?.toUpperCase() || '';
      const genero = (generoRaw === 'M' || generoRaw.startsWith('MASC')) ? 'M' : ((generoRaw === 'F' || generoRaw.startsWith('FEM') || generoRaw === 'W') ? 'F' : '-');
      const isM = genero === 'M';
      const isF = genero === 'F';
      const isDesistente = info.aluno?.codigo_Status !== 1;

      if (isM) stats.matriculados.m++;
      if (isF) stats.matriculados.f++;

      if (isDesistente) {
        if (isM) stats.desistidos.m++;
        if (isF) stats.desistidos.f++;
      }

      // OBS Column and MÉDIA Column
      const cellObs = row.getCell(obsColLetter);
      cellObs.border = borderStyle;
      cellObs.alignment = { horizontal: 'center', vertical: 'middle' };

      const cellMedia = row.getCell(mediaColLetter);
      cellMedia.border = borderStyle;
      cellMedia.alignment = { horizontal: 'center', vertical: 'middle' };

      const cellIdade = row.getCell(idadeColLetter);
      cellIdade.border = borderStyle;
      cellIdade.alignment = { horizontal: 'center', vertical: 'middle' };
      cellIdade.value = idade;

      const cellGenero = row.getCell(generoColLetter);
      cellGenero.border = borderStyle;
      cellGenero.alignment = { horizontal: 'center', vertical: 'middle' };
      cellGenero.value = genero;

      const media = countGrades > 0 ? sumGrades / countGrades : 0;
      if (countGrades > 0) {
        cellMedia.value = media;
        cellMedia.numFmt = '0.0';
        cellMedia.font = { name: 'Calibri', size: 9, bold: true, color: { argb: media < 10 ? 'FFFF0000' : 'FF000000' } };

        if (!isDesistente) {
          if (media >= 10) {
            cellObs.value = 'TRANS';
            cellObs.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF0070C0' } }; // Blue
            if (isM) stats.transita.m++;
            if (isF) stats.transita.f++;
          } else {
            cellObs.value = 'N/TRAN';
            cellObs.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFF0000' } }; // Red
            if (isM) stats.nTransita.m++;
            if (isF) stats.nTransita.f++;
          }

          if (media > maxMedia) {
            maxMedia = media;
            melhorAluno = { nome: info.aluno?.nome || '', idade: idade };
          }
        }
      } else {
        cellObs.value = isDesistente ? 'DESIST.' : '-';
        if (isDesistente) cellObs.font = { name: 'Calibri', size: 9, bold: true, italic: true };
        cellMedia.value = '-';
      }

      index++;
      rowNum++;
    }

    // Adjust column widths
    sheet.getColumn('A').width = 4;
    sheet.getColumn('B').width = 10;
    sheet.getColumn('C').width = 30;
    sheet.getColumn('D').width = 16;
    
    disciplines.forEach(dName => {
      const { faltasCol, gradeCol } = disciplineColsMap[dName];
      sheet.getColumn(faltasCol).width = 7;
      sheet.getColumn(gradeCol).width = 7;
    });
    
    sheet.getColumn(obsColLetter).width = 10;
    sheet.getColumn(mediaColLetter).width = 9;
    sheet.getColumn(idadeColLetter).width = 7;
    sheet.getColumn(generoColLetter).width = 8;

    // DADOS ESTATÍSTICOS BLOCK
    const statsStartColIndex = colIndex + 2;
    const statsStartCol = columnToLetter(statsStartColIndex);
    const statsEndCol = columnToLetter(statsStartColIndex + 5);

    // Title
    sheet.mergeCells(`${statsStartCol}17:${statsEndCol}17`);
    const statTitle = sheet.getCell(`${statsStartCol}17`);
    statTitle.value = 'DADOS ESTATÍSTICOS';
    statTitle.font = { name: 'Calibri', size: 11, bold: true };
    statTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    statTitle.fill = headerFill;
    statTitle.border = borderStyle;

    // Headers
    const labels = ['', 'M', 'F', 'SOMA'];
    labels.forEach((val, i) => {
      const cLetter = columnToLetter(statsStartColIndex + (i === 0 ? 0 : i + 1));
      if (i === 0) {
        sheet.mergeCells(`${cLetter}18:${columnToLetter(statsStartColIndex + 1)}18`);
      }
      const targetCol = i === 0 ? cLetter : columnToLetter(statsStartColIndex + i + 1);
      const c = sheet.getCell(`${targetCol}18`);
      c.value = val;
      c.font = { name: 'Calibri', size: 10, bold: true };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = borderStyle;
      if (i > 0) c.fill = headerFill;
    });

    const statRowsData = [
      { label: 'MATRICULADOS', m: stats.matriculados.m, f: stats.matriculados.f },
      { label: 'TRANSITA', m: stats.transita.m, f: stats.transita.f },
      { label: 'N/TRANSITA', m: stats.nTransita.m, f: stats.nTransita.f },
      { label: 'DESISTIDO/A', m: stats.desistidos.m, f: stats.desistidos.f }
    ];

    let sr = 19;
    statRowsData.forEach(sData => {
      sheet.mergeCells(`${statsStartCol}${sr}:${columnToLetter(statsStartColIndex + 1)}${sr}`);
      const lCell = sheet.getCell(`${statsStartCol}${sr}`);
      lCell.value = sData.label;
      lCell.font = { name: 'Calibri', size: 10, bold: true };
      lCell.border = borderStyle;

      const mCell = sheet.getCell(`${columnToLetter(statsStartColIndex + 2)}${sr}`);
      mCell.value = sData.m;
      mCell.border = borderStyle;
      mCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const fCell = sheet.getCell(`${columnToLetter(statsStartColIndex + 3)}${sr}`);
      fCell.value = sData.f;
      fCell.border = borderStyle;
      fCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const somaCell = sheet.getCell(`${columnToLetter(statsStartColIndex + 4)}${sr}`);
      somaCell.value = sData.m + sData.f;
      somaCell.border = borderStyle;
      somaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      somaCell.fill = headerFill;
      sr++;
    });

    // MÁXIMA ALUNO BLOCK
    sr++;
    const maxBoxStartCol = columnToLetter(statsStartColIndex + 1);
    const maxBoxEndCol = columnToLetter(statsStartColIndex + 4);

    sheet.mergeCells(`${maxBoxStartCol}${sr}:${columnToLetter(statsStartColIndex + 2)}${sr}`);
    const lblMax = sheet.getCell(`${maxBoxStartCol}${sr}`);
    lblMax.value = 'MÁXIMA';
    lblMax.font = { name: 'Calibri', size: 10, bold: true };
    lblMax.border = borderStyle;

    sheet.mergeCells(`${columnToLetter(statsStartColIndex + 3)}${sr}:${maxBoxEndCol}${sr}`);
    const valMax = sheet.getCell(`${columnToLetter(statsStartColIndex + 3)}${sr}`);
    valMax.value = maxMedia.toFixed(1);
    valMax.font = { name: 'Calibri', size: 10, bold: true };
    valMax.border = borderStyle;
    valMax.alignment = { horizontal: 'center', vertical: 'middle' };
    sr++;

    sheet.mergeCells(`${maxBoxStartCol}${sr}:${maxBoxEndCol}${sr}`);
    const nomeMax = sheet.getCell(`${maxBoxStartCol}${sr}`);
    nomeMax.value = `NOME DO/A ALUNO/A: ${melhorAluno.nome}`;
    nomeMax.font = { name: 'Calibri', size: 9 };
    nomeMax.border = borderStyle;
    sr++;

    sheet.mergeCells(`${maxBoxStartCol}${sr}:${maxBoxEndCol}${sr}`);
    const idadeMax = sheet.getCell(`${maxBoxStartCol}${sr}`);
    idadeMax.value = `IDADE: ${melhorAluno.idade}`;
    idadeMax.font = { name: 'Calibri', size: 9 };
    idadeMax.border = borderStyle;

    // ASSINATURAS E DATA
    let footRow = Math.max(rowNum + 4, sr + 2);
    sheet.mergeCells(`B${footRow}:F${footRow}`);
    const dataCell = sheet.getCell(`B${footRow}`);
    dataCell.value = `DATA DO CONSELHO DE TURMA ___ / ___ / ${new Date().getFullYear()}`;
    dataCell.font = { name: 'Calibri', size: 11, bold: true };

    footRow += 4;
    sheet.mergeCells(`C${footRow}:I${footRow}`);
    const dirTurmaCell = sheet.getCell(`C${footRow}`);
    dirTurmaCell.value = 'A Directora da Turma';
    dirTurmaCell.font = { name: 'Calibri', size: 11, bold: true };
    dirTurmaCell.alignment = { horizontal: 'center' };

    sheet.mergeCells(`${statsStartCol}${footRow}:${statsEndCol}${footRow}`);
    const subDirCell = sheet.getCell(`${statsStartCol}${footRow}`);
    subDirCell.value = 'O Subdirector Pedagógico';
    subDirCell.font = { name: 'Calibri', size: 11, bold: true };
    subDirCell.alignment = { horizontal: 'center' };

    footRow++;
    sheet.mergeCells(`C${footRow}:I${footRow}`);
    const dirTurmaLine = sheet.getCell(`C${footRow}`);
    dirTurmaLine.value = '__________________________________________';
    dirTurmaLine.alignment = { horizontal: 'center' };

    sheet.mergeCells(`${statsStartCol}${footRow}:${statsEndCol}${footRow}`);
    const subDirLine = sheet.getCell(`${statsStartCol}${footRow}`);
    subDirLine.value = '__________________________________________';
    subDirLine.alignment = { horizontal: 'center' };

    footRow++;
    const nomeDirTurma = pautaData.directorTurma?.tb_docente?.nome || '';
    sheet.mergeCells(`C${footRow}:I${footRow}`);
    const dirTurmaNameCell = sheet.getCell(`C${footRow}`);
    dirTurmaNameCell.value = nomeDirTurma;
    dirTurmaNameCell.font = { name: 'Calibri', size: 10 };
    dirTurmaNameCell.alignment = { horizontal: 'center' };

    const nomeSubdir = pautaData.instituicao?.subDirector || '';
    sheet.mergeCells(`${statsStartCol}${footRow}:${statsEndCol}${footRow}`);
    const subDirNameCell = sheet.getCell(`${statsStartCol}${footRow}`);
    subDirNameCell.value = nomeSubdir;
    subDirNameCell.font = { name: 'Calibri', size: 10 };
    subDirNameCell.alignment = { horizontal: 'center' };

    // Apply borders to all empty headers of merged title rows
    for (let r = 14; r <= 16; r++) {
      for (let c = 1; c <= colIndex; c++) {
        const cell = sheet.getRow(r).getCell(c);
        if (!cell.border) cell.border = borderStyle;
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }


  static async generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    try {
      // Step 0: Buscar dados institucionais e director de turma
      const instituicao = await prisma.tb_dados_instituicao.findFirst();
      const directorTurma = await prisma.tb_directores_turmas.findFirst({
        where: { codigoTurma: parseInt(codigoTurma), codigoAnoLectivo: parseInt(codigoAnoLectivo) },
        include: { tb_docente: { select: { nome: true } } }
      });
      const turmaObj = await prisma.tb_turmas.findUnique({ 
        where: { codigo: parseInt(codigoTurma) },
        include: { tb_classes: true, tb_cursos: true, tb_periodos: true }
      });
      const trimestreObj = await prisma.tb_trimestres.findUnique({ where: { codigo: parseInt(codigoTrimestre) } });
      const anoLetivoObj = await prisma.tb_ano_lectivo.findUnique({ where: { codigo: parseInt(codigoAnoLectivo) } });

      // Step 1: Buscar todos os alunos confirmados nesta turma e ano letivo
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(codigoTurma),
          codigo_Ano_lectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: { select: { codigo: true, nome: true, sexo: true, dataNascimento: true, codigo_Status: true } }
            }
          }
        }
      });
      if (confirmacoes.length === 0) {
        throw new AppError('Nenhum aluno confirmado para esta turma e ano letivo', 400);
      }



      // Step 2: Para cada aluno, buscar suas notas no trimestre
      const pautaPorAluno = {};
      
      for (const confirmacao of confirmacoes) {
        const aluno = confirmacao.tb_matriculas.tb_alunos;
        const codigoAluno = aluno.codigo;

        // Buscar notas do aluno neste trimestre e ano letivo
        const notas = await prisma.tb_notas_alunos.findMany({
          where: {
            CodigoAluno: codigoAluno,
            CodigoTrimestre: parseInt(codigoTrimestre),
            CodigoAnoLectivo: parseInt(codigoAnoLectivo)
          },
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
          },
          orderBy: { tb_disciplinas: { designacao: 'asc' } }
        });

        if (notas.length > 0) {
          pautaPorAluno[codigoAluno] = {
            aluno,
            disciplinas: notas.map(nota => ({
              disciplina: nota.tb_disciplinas.designacao,
              tipoAvaliacao: nota.tb_tipo_avaliacao.designacao,
              nota: nota.Nota,
              dataCadastro: nota.DataCadastro
            }))
          };
        }
      }

      // Se nenhum aluno tem notas, retornar pauta vazia com todos os alunos
      const pautaFinal = Object.keys(pautaPorAluno).length > 0 
        ? pautaPorAluno
        : confirmacoes.reduce((acc, confirmacao) => {
            const aluno = confirmacao.tb_matriculas.tb_alunos;
            acc[aluno.codigo] = { aluno, disciplinas: [] };
            return acc;
          }, {});

      return {
        turma: parseInt(codigoTurma),
        turmaObj,
        trimestreObj,
        anoLetivoObj,
        instituicao,
        directorTurma,
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: parseInt(codigoAnoLectivo),
        totalAlunos: confirmacoes.length,
        alunosComNotas: Object.keys(pautaPorAluno).length,
        pauta: pautaFinal,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar pauta: ${error.message}`, 500);
    }
  }

  // ===============================
  // BOLETIM (RELATÓRIO POR ALUNO / TURMA)
  // ===============================

  /**
   * Gera boletim para todos os alunos de uma turma num trimestre específico.
   * Retorna dados estruturados para geração de PDF no frontend.
   */
  static async generateBoletimTurma(codigoTurma, codigoTrimestre, codigoAnoLectivo, codigoUtilizador = 1) {
    try {
      const turma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(codigoTurma) },
        include: { tb_classes: true, tb_periodos: true, tb_salas: true, tb_cursos: true }
      });
      if (!turma) throw new AppError('Turma não encontrada', 404);

      const anoLetivo = await prisma.tb_ano_lectivo.findUnique({ where: { codigo: parseInt(codigoAnoLectivo) } });
      const trimestre = await prisma.tb_trimestres.findUnique({ where: { codigo: parseInt(codigoTrimestre) } });
      const directorTurma = await prisma.tb_directores_turmas.findFirst({
        where: { codigoTurma: parseInt(codigoTurma), codigoAnoLectivo: parseInt(codigoAnoLectivo) },
        include: { tb_docente: true }
      });

      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: { codigo_Turma: parseInt(codigoTurma), codigo_Ano_lectivo: parseInt(codigoAnoLectivo) },
        include: { tb_matriculas: { include: { tb_alunos: true } } },
        orderBy: { codigo: 'asc' }
      });
      if (confirmacoes.length === 0) throw new AppError('Não há alunos confirmados para a turma selecionada.', 400);

      // Obter códigos de todos os alunos confirmados
      const codigosAlunos = confirmacoes
        .map(c => c.tb_matriculas?.tb_alunos?.codigo)
        .filter(Boolean);

      // 6. Buscar disciplinas via grade curricular
      const gradesCurricular = await prisma.tb_grade_curricular.findMany({
        where: { codigo_Classe: turma.codigo_Classe, codigo_Curso: turma.codigo_Curso },
        include: { tb_disciplinas: { select: { codigo: true, designacao: true } } }
      });
      let disciplinas = gradesCurricular
        .filter(g => g.tb_disciplinas)
        .map(g => g.tb_disciplinas);

      // 7. Buscar todas as notas da turma no trimestre
      // Tenta por CodigoTurma + também por CodigoAluno (fallback para notas sem CodigoTurma preenchido)
      const notasWhere = {
        CodigoTrimestre: parseInt(codigoTrimestre),
        CodigoAnoLectivo: parseInt(codigoAnoLectivo)
      };
      if (codigosAlunos.length > 0) {
        notasWhere.OR = [
          { CodigoTurma: parseInt(codigoTurma) },
          { CodigoAluno: { in: codigosAlunos } }
        ];
      } else {
        notasWhere.CodigoTurma = parseInt(codigoTurma);
      }

      const notas = await prisma.tb_notas_alunos.findMany({
        where: notasWhere,
        include: { tb_disciplinas: { select: { codigo: true, designacao: true } } }
      });

      // Complementar disciplinas com as encontradas nas notas (se grade curricular estiver vazio)
      if (disciplinas.length === 0) {
        const disciplinasMap = {};
        notas.forEach(n => {
          if (n.tb_disciplinas) disciplinasMap[n.tb_disciplinas.codigo] = n.tb_disciplinas;
        });
        disciplinas = Object.values(disciplinasMap);
      }

      const trimestreDesignacao = trimestre?.designacao || `${codigoTrimestre}`;
      const anoLetivoDesignacao = anoLetivo?.designacao || `${codigoAnoLectivo}`;
      let faltas = await prisma.tb_faltas.findMany({
        where: {
          Codigo_Matricula: { in: confirmacoes.map(c => c.codigo_Matricula) },
          Trimestre: trimestreDesignacao,
          AnoLectivo: anoLetivoDesignacao
        }
      }).catch(() => []);

      const matriculaParaAluno = {};
      confirmacoes.forEach(conf => {
        if (conf.tb_matriculas?.tb_alunos) matriculaParaAluno[conf.codigo_Matricula] = conf.tb_matriculas.tb_alunos.codigo;
      });

      const boletins = confirmacoes.map((conf, idx) => {
        const aluno = conf.tb_matriculas?.tb_alunos;
        if (!aluno) return null;

        const notasAluno = notas.filter(n => n.CodigoAluno === aluno.codigo);
        const notasPorDisciplina = {};
        notasAluno.forEach(n => {
          if (!notasPorDisciplina[n.CodigoDisciplina]) notasPorDisciplina[n.CodigoDisciplina] = [];
          notasPorDisciplina[n.CodigoDisciplina].push(n);
        });

        const notasFinais = disciplinas.map(disc => {
          const listNotas = notasPorDisciplina[disc.codigo] || [];
          const notaConsolidada = listNotas.length > 0 ? GradeManagementService._calcularNotaTrimestral(listNotas) : null;
          return { codigoDisciplina: disc.codigo, disciplina: disc.designacao, nota: notaConsolidada };
        }).filter(item => item.nota !== null);

        const mediaGeral = notasFinais.length > 0 ? parseFloat((notasFinais.reduce((s, n) => s + n.nota, 0) / notasFinais.length).toFixed(2)) : 0;
        const negativas = notasFinais.filter(n => n.nota < 10).length;
        const situacao = (mediaGeral >= 10 && negativas <= 2) ? 'TRANSITA' : 'N-TRANSITA';
        const faltasAluno = faltas.filter(f => matriculaParaAluno[f.Codigo_Matricula] === aluno.codigo).reduce((sum, f) => sum + (parseInt(f.nFaltas) || 1), 0);

        return { numero: idx + 1, aluno: { codigo: aluno.codigo, nome: aluno.nome, dataNascimento: aluno.dataNascimento }, notas: notasFinais, mediaGeral, situacao, faltas: faltasAluno, comportamento: 'Bom' };
      }).filter(Boolean);

      let instituicao = await prisma.tb_dados_instituicao.findFirst() || { nome: 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS', localidade: 'Cabinda, Angola', telefone_Movel: '+244 915 312 187' };
      
      try {
        await prisma.tb_logs.create({ data: { Descricao: `Geração de boletins para a turma de ID ${codigoTurma}`, OBS: `Turma: ${turma.designacao} | Alunos: ${boletins.length}`, Data: new Date(), CodigoUtilizador: parseInt(codigoUtilizador) } });
      } catch (logError) { console.error(logError); }

      return {
        turma: { codigo: turma.codigo, designacao: turma.designacao, classe: turma.tb_classes?.designacao || '', periodo: turma.tb_periodos?.designacao || '', sala: turma.tb_salas?.designacao || '', curso: turma.tb_cursos?.designacao || '' },
        anoLetivo: anoLetivo?.designacao || codigoAnoLectivo,
        trimestre: trimestre?.designacao || `${codigoTrimestre}º`,
        disciplinas,
        directorTurma: directorTurma?.tb_docente?.nome || 'N/D',
        contactoDirector: directorTurma?.tb_docente?.contacto || 'N/D',
        instituicao: { nome: instituicao.nome, endereco: instituicao.localidade, telefone: instituicao.telefone_Movel || instituicao.telefone_Fixo || '+244 915 312 187', email: instituicao.email || '' },
        boletins,
        totalAlunos: boletins.length,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar boletim da turma: ${error.message}`, 500);
    }
  }

  static async generateBoletim(codigoAluno, codigoAnoLectivo, codigoUtilizador = 1) {
    try {
      // Buscar todas as notas do aluno no ano letivo
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true, classe: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ CodigoTrimestre: 'asc' }, { tb_disciplinas: { designacao: 'asc' } }]
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para este aluno', 404);
      }

      // Agrupar por trimestre e depois por disciplina
      const boletimPorTrimestre = {};
      const notasAgrupadas = {}; // { codigoTrimestre: { codigoDisciplina: [notas] } }
      const trimestresMap = {};
      const disciplinasMap = {};

      notas.forEach(nota => {
        const tCode = nota.CodigoTrimestre;
        const dCode = nota.CodigoDisciplina;
        
        trimestresMap[tCode] = nota.tb_trimestres.designacao;
        disciplinasMap[dCode] = nota.tb_disciplinas.designacao;

        if (!notasAgrupadas[tCode]) {
          notasAgrupadas[tCode] = {};
        }
        if (!notasAgrupadas[tCode][dCode]) {
          notasAgrupadas[tCode][dCode] = [];
        }
        notasAgrupadas[tCode][dCode].push(nota);
      });

      let totalTrimesters = 0;
      let somaMediasTrimesters = 0;

      Object.entries(notasAgrupadas).forEach(([tCode, disciplinasNotas]) => {
        const trimestreDesignacao = trimestresMap[tCode];
        const disciplinasFinais = [];

        Object.entries(disciplinasNotas).forEach(([dCode, listNotas]) => {
          const notaConsolidada = GradeManagementService._calcularNotaTrimestral(listNotas);
          if (notaConsolidada !== null) {
            disciplinasFinais.push({
              disciplina: disciplinasMap[dCode],
              nota: notaConsolidada
            });
          }
        });

        const mediaTrimestre = disciplinasFinais.length > 0
          ? parseFloat((disciplinasFinais.reduce((acc, curr) => acc + curr.nota, 0) / disciplinasFinais.length).toFixed(2))
          : 0;

        const negativas = disciplinasFinais.filter(d => d.nota < 10).length;
        const situacao = (mediaTrimestre >= 10 && negativas <= 2) ? 'TRANSITA' : 'N-TRANSITA';

        boletimPorTrimestre[tCode] = {
          trimestre: trimestreDesignacao,
          disciplinas: disciplinasFinais,
          mediaTrimestre,
          situacao
        };

        somaMediasTrimesters += mediaTrimestre;
        totalTrimesters++;
      });

      const mediaGeral = totalTrimesters > 0 ? parseFloat((somaMediasTrimesters / totalTrimesters).toFixed(2)) : 0;

      // Auditoria
      try {
        await prisma.tb_logs.create({
          data: {
            Descricao: `Geração de boletim individual do aluno ID ${codigoAluno} para o ano letivo ID ${codigoAnoLectivo}.`,
            OBS: `Aluno: ${notas[0].tb_alunos.nome} | Média Geral: ${mediaGeral}`,
            Data: new Date(),
            CodigoUtilizador: codigoUtilizador ? parseInt(codigoUtilizador) : 1
          }
        });
      } catch (logError) {
        console.error('Falha ao registar log de auditoria de boletim individual:', logError);
      }

      return {
        aluno: notas[0].tb_alunos,
        anoLectivo: codigoAnoLectivo,
        mediaGeral,
        boletim: boletimPorTrimestre,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar boletim: ${error.message}`, 500);
    }
  }

  // ===============================
  // HISTÓRICO DE ALTERAÇÕES
  // ===============================

  static async getGradeHistory(codigoNota) {
    try {
      const history = await prisma.tb_historico_notas.findMany({
        where: { Codigo_Nota: parseInt(codigoNota) },
        orderBy: { DataAlteracao: 'desc' }
      });

      if (history.length === 0) {
        throw new AppError('Nenhum histórico encontrado para esta nota', 404);
      }

      return {
        codigoNota: parseInt(codigoNota),
        historico: history,
        totalAlteracoes: history.length
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao buscar histórico: ${error.message}`, 500);
    }
  }

  // ===============================
  // ESTATÍSTICAS E RELATÓRIOS
  // ===============================

  static async getGradeStatistics(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    try {
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoTurma: parseInt(codigoTurma),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        }
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para calcular estatísticas', 404);
      }

      const notasArray = notas.map(n => n.Nota);
      const media = notasArray.reduce((a, b) => a + b, 0) / notasArray.length;
      const notasOrdenadas = notasArray.sort((a, b) => a - b);
      const mediana =
        notasOrdenadas.length % 2 === 0
          ? (notasOrdenadas[notasOrdenadas.length / 2 - 1] + notasOrdenadas[notasOrdenadas.length / 2]) / 2
          : notasOrdenadas[Math.floor(notasOrdenadas.length / 2)];

      // Contar aprovações (nota >= 10) e reprovações (nota < 10)
      const aprovados = notasArray.filter(n => n >= 10).length;
      const reprovados = notasArray.filter(n => n < 10).length;
      const taxaAprovacao = ((aprovados / notasArray.length) * 100).toFixed(2);

      return {
        turma: parseInt(codigoTurma),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: codigoAnoLectivo,
        totalNotas: notasArray.length,
        media: parseFloat(media.toFixed(2)),
        mediana: parseFloat(mediana.toFixed(2)),
        minima: Math.min(...notasArray),
        maxima: Math.max(...notasArray),
        aprovados,
        reprovados,
        taxaAprovacao: `${taxaAprovacao}%`,
        distribuicao: {
          somente0a5: notasArray.filter(n => n >= 0 && n < 5).length,
          somente5a10: notasArray.filter(n => n >= 5 && n < 10).length,
          somente10a15: notasArray.filter(n => n >= 10 && n < 15).length,
          somente15a20: notasArray.filter(n => n >= 15 && n <= 20).length
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao calcular estatísticas: ${error.message}`, 500);
    }
  }

  static async getDisciplineStatistics(codigoDisciplina, codigoTrimestre, codigoAnoLectivo) {
    try {
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoDisciplina: parseInt(codigoDisciplina),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_disciplinas: { select: { designacao: true } }
        }
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para esta disciplina', 404);
      }

      const notasArray = notas.map(n => n.Nota);
      const media = notasArray.reduce((a, b) => a + b, 0) / notasArray.length;
      const aprovados = notasArray.filter(n => n >= 10).length;

      return {
        disciplina: notas[0].tb_disciplinas.designacao,
        codigoDisciplina: parseInt(codigoDisciplina),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: codigoAnoLectivo,
        totalAlunosAvaliados: notasArray.length,
        mediaGeral: parseFloat(media.toFixed(2)),
        aprovados,
        reprovados: notasArray.length - aprovados,
        tasaAprovacao: `${((aprovados / notasArray.length) * 100).toFixed(2)}%`
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar estatísticas da disciplina: ${error.message}`, 500);
    }
  }

  static async getConsolidatedDisciplineStatistics(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    try {
      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        throw new AppError('Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo', 400);
      }

      // Step 1: Get all students confirmed in this turma and academic year
      // (same approach as generatePauta - turma membership comes from tb_confirmacoes)
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(codigoTurma),
          codigo_Ano_lectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: { select: { codigo: true, nome: true } }
            }
          }
        }
      });

      // Build set of valid student codes for this turma
      const alunosDaTurma = confirmacoes
        .map(c => c.tb_matriculas?.tb_alunos)
        .filter(a => !!a);

      const codigosAlunos = alunosDaTurma.map(a => a.codigo);

      // Step 2: Fetch grades for all students in this turma for the given trimestre/anoLetivo
      // Filter by CodigoAluno (students in turma) + CodigoTrimestre + CodigoAnoLectivo
      // This works regardless of whether CodigoTurma was set on the note record
      const notas = codigosAlunos.length > 0
        ? await prisma.tb_notas_alunos.findMany({
            where: {
              CodigoAluno: { in: codigosAlunos },
              CodigoTrimestre: parseInt(codigoTrimestre),
              CodigoAnoLectivo: parseInt(codigoAnoLectivo)
            },
            include: {
              tb_alunos: { select: { codigo: true, nome: true } },
              tb_disciplinas: { select: { codigo: true, designacao: true } }
            }
          })
        : [];

      if (notas.length === 0) {
        return {
          disciplinas: [],
          geral: {
            totalDisciplinas: 0,
            mediaGeral: 0,
            totalAprovados: 0,
            totalReprovados: 0,
            percentualAprovacaoGeral: 0
          }
        };
      }

      // Agrupar por disciplina e depois por aluno
      const agrupado = {};

      notas.forEach(n => {
        const discId = n.CodigoDisciplina;
        const discNome = n.tb_disciplinas?.designacao || `Disciplina ${discId}`;
        const alunoId = n.CodigoAluno;
        const alunoNome = n.tb_alunos?.nome || `Aluno ${alunoId}`;
        
        if (!agrupado[discId]) {
          agrupado[discId] = {
            codigoDisciplina: discId,
            nomeDisciplina: discNome,
            alunosMap: {}
          };
        }

        if (!agrupado[discId].alunosMap[alunoId]) {
          agrupado[discId].alunosMap[alunoId] = {
            codigoAluno: alunoId,
            nomeAluno: alunoNome,
            notas: []
          };
        }

        agrupado[discId].alunosMap[alunoId].notas.push({
          tipo: n.CodigoTipoAvaliacao, // 1=MAC, 2=PP, 3=PT
          nota: n.Nota
        });
      });

      let totalDisciplinas = 0;
      let somaMediasConsolidadasTotal = 0;
      let contagemAlunosConsolidadosTotal = 0;
      let totalAprovadosGeral = 0;
      let totalReprovadosGeral = 0;

      const disciplinasStats = Object.values(agrupado).map(d => {
        const alunosList = Object.values(d.alunosMap).map(aluno => {
          let sum = 0;
          let count = 0;
          let mac = null;
          let pp = null;
          let pt = null;

          aluno.notas.forEach(n => {
            sum += n.nota;
            count++;
            if (n.tipo === 1) mac = n.nota;
            else if (n.tipo === 2 || n.tipo === 9) pp = n.nota;
            else if (n.tipo === 3 || n.tipo === 10) pt = n.nota;
          });

          const notaFinal = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
          const status = notaFinal >= 10 ? 'Aprovado' : 'Reprovado';

          return {
            codigoAluno: aluno.codigoAluno,
            nomeAluno: aluno.nomeAluno,
            MAC: mac,
            PP: pp,
            PT: pt,
            notaFinal,
            status
          };
        });

        // Ordenar alunos por nome
        alunosList.sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));

        // Calcular estatísticas da disciplina
        const totalAlunos = alunosList.length;
        const aprovados = alunosList.filter(a => a.notaFinal >= 10).length;
        const reprovados = totalAlunos - aprovados;
        const media = totalAlunos > 0 
          ? parseFloat((alunosList.reduce((acc, curr) => acc + curr.notaFinal, 0) / totalAlunos).toFixed(2))
          : 0;
        const percentualAprovacao = totalAlunos > 0 ? parseFloat(((aprovados / totalAlunos) * 100).toFixed(2)) : 0;

        // Somar para as métricas globais
        somaMediasConsolidadasTotal += alunosList.reduce((acc, curr) => acc + curr.notaFinal, 0);
        contagemAlunosConsolidadosTotal += totalAlunos;
        totalAprovadosGeral += aprovados;
        totalReprovadosGeral += reprovados;
        totalDisciplinas++;

        return {
          codigoDisciplina: d.codigoDisciplina,
          nomeDisciplina: d.nomeDisciplina,
          totalAlunos,
          media,
          aprovados,
          reprovados,
          percentualAprovacao,
          alunos: alunosList
        };
      });

      // Ordenar disciplinas alfabeticamente
      disciplinasStats.sort((a, b) => a.nomeDisciplina.localeCompare(b.nomeDisciplina));

      const mediaGeral = contagemAlunosConsolidadosTotal > 0
        ? parseFloat((somaMediasConsolidadasTotal / contagemAlunosConsolidadosTotal).toFixed(2))
        : 0;

      const percentualAprovacaoGeral = (totalAprovadosGeral + totalReprovadosGeral) > 0
        ? parseFloat(((totalAprovadosGeral / (totalAprovadosGeral + totalReprovadosGeral)) * 100).toFixed(2))
        : 0;

      return {
        disciplinas: disciplinasStats,
        geral: {
          totalDisciplinas,
          mediaGeral,
          totalAprovados: totalAprovadosGeral,
          totalReprovados: totalReprovadosGeral,
          percentualAprovacaoGeral
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao consolidar estatísticas das disciplinas: ${error.message}`, 500);
    }
  }

  static async getTeacherGradeReport(codigoProfessor, codigoTrimestre, codigoAnoLectivo) {
    try {
      // Buscar todas as notas lançadas por este professor
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          tb_alunos: {
            // Notas onde o professor é responsável (via professor_turma ou professor_disciplina)
          },
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_turmas: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ tb_turmas: { designacao: 'asc' } }, { tb_disciplinas: { designacao: 'asc' } }]
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para este professor', 404);
      }

      // Agrupar por turma e disciplina
      const relatorioAgrupado = {};
      notas.forEach(nota => {
        const chaveTurma = nota.CodigoTurma;
        if (!relatorioAgrupado[chaveTurma]) {
          relatorioAgrupado[chaveTurma] = {
            turma: nota.tb_turmas?.designacao || 'N/A',
            disciplinas: {}
          };
        }
        const chaveDisciplina = nota.CodigoDisciplina;
        if (!relatorioAgrupado[chaveTurma].disciplinas[chaveDisciplina]) {
          relatorioAgrupado[chaveTurma].disciplinas[chaveDisciplina] = {
            disciplina: nota.tb_disciplinas.designacao,
            alunos: []
          };
        }
        relatorioAgrupado[chaveTurma].disciplinas[chaveDisciplina].alunos.push({
          aluno: nota.tb_alunos,
          nota: nota.Nota
        });
      });

      return {
        professor: parseInt(codigoProfessor),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: codigoAnoLectivo,
        totalNotas: notas.length,
        relatorio: relatorioAgrupado,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar relatório do professor: ${error.message}`, 500);
    }
  }

  // ===============================
  // BUSCAR NOTAS POR CRITÉRIOS
  // ===============================

  static async getGradesByStudent(codigoAluno, codigoAnoLectivo) {
    try {
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ CodigoTrimestre: 'asc' }, { tb_disciplinas: { designacao: 'asc' } }]
      });

      return {
        codigoAluno: parseInt(codigoAluno),
        anoLectivo: codigoAnoLectivo,
        totalNotas: grades.length,
        notas: grades
      };
    } catch (error) {
      throw new AppError(`Erro ao buscar notas do aluno: ${error.message}`, 500);
    }
  }

  static async getGradesByDiscipline(codigoDisciplina, codigoAnoLectivo) {
    try {
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoDisciplina: parseInt(codigoDisciplina),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ CodigoTrimestre: 'asc' }, { tb_alunos: { nome: 'asc' } }]
      });

      return {
        codigoDisciplina: parseInt(codigoDisciplina),
        anoLectivo: codigoAnoLectivo,
        totalNotas: grades.length,
        notas: grades
      };
    } catch (error) {
      throw new AppError(`Erro ao buscar notas por disciplina: ${error.message}`, 500);
    }
  }

  static async getGradesByClassroom(codigoTurma, codigoAnoLectivo) {
    try {
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoTurma: parseInt(codigoTurma),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        },
        orderBy: [
          { CodigoTrimestre: 'asc' },
          { tb_alunos: { nome: 'asc' } },
          { tb_disciplinas: { designacao: 'asc' } }
        ]
      });

      return {
        codigoTurma: parseInt(codigoTurma),
        anoLectivo: codigoAnoLectivo,
        totalNotas: grades.length,
        notas: grades
      };
    } catch (error) {
      throw new AppError(`Erro ao buscar notas por turma: ${error.message}`, 500);
    }
  }

  // ===============================
  // IMPORTAÇÃO EM BULK
  // ===============================

  static async importGradesBulk(data) {
    try {
      const { grades, codigoAnoLectivo, codigoUtilizador } = data;

      if (!Array.isArray(grades) || grades.length === 0) {
        throw new AppError('Grades deve ser um array não vazio', 400);
      }

      if (!codigoAnoLectivo || !codigoUtilizador) {
        throw new AppError('codigoAnoLectivo e codigoUtilizador são obrigatórios', 400);
      }

      const resultados = {
        sucesso: [],
        erros: []
      };

      // Processar cada nota
      for (let i = 0; i < grades.length; i++) {
        const gradeData = {
          ...grades[i],
          codigoAnoLectivo: parseInt(codigoAnoLectivo),
          codigoUtilizador: parseInt(codigoUtilizador)
        };

        try {
          const grade = await this.createGrade(gradeData);
          resultados.sucesso.push({
            indice: i,
            aluno: grades[i].codigoAluno,
            disciplina: grades[i].codigoDisciplina,
            status: 'OK'
          });
        } catch (error) {
          resultados.erros.push({
            indice: i,
            aluno: grades[i].codigoAluno,
            disciplina: grades[i].codigoDisciplina,
            erro: error.message
          });
        }
      }

      return {
        totalProcessados: grades.length,
        sucessos: resultados.sucesso.length,
        erros: resultados.erros.length,
        resultados
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao importar notas: ${error.message}`, 500);
    }
  }
}
