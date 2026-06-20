// services/grade-management.services.js
import prisma from '../config/database.js';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/validation.utils.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { buildPautaExcelTemplate } from '../utils/pauta-excel.util.js';

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

        disciplines.forEach(dName => {
          const dObj = info.disciplinas?.find(d => d.disciplina === dName);
          const fVal = dObj && dObj.faltas !== undefined && dObj.faltas > 0 ? `${dObj.faltas}` : '0';
          const nVal = dObj && dObj.nota !== undefined && dObj.nota !== null ? dObj.nota.toFixed(1) : '-';

          // Faltas (left half of column)
          doc.fillColor('gray');
          doc.text(fVal, valX, rowY, { width: 15, align: 'center' });

          // Grade (right half of column)
          if (dObj && dObj.nota !== undefined && dObj.nota !== null) {
            doc.fillColor(dObj.nota >= 10 ? 'green' : 'red');
            doc.text(nVal, valX + 15, rowY, { width: 25, align: 'center' });
          } else {
            doc.fillColor('black');
            doc.text('-', valX + 15, rowY, { width: 25, align: 'center' });
          }
          valX += 40;
        });

        doc.fillColor('black');
        const media = info.mediaGeral || 0;
        const hasGrades = info.disciplinas?.some(d => d.nota !== null);

        if (hasGrades) {
          doc.font('Helvetica-Bold');
          doc.fillColor(media < 10 ? 'red' : 'black');
          doc.text(media.toFixed(2), valX, rowY, { width: 30, align: 'center' });

          if (!isDesistente) {
            if (info.situacao === 'TRANS') {
              doc.fillColor('blue');
              doc.text('TRANS', valX + 30, rowY, { width: 40, align: 'center' });
              if (isM) stats.transita.m++;
              if (isF) stats.transita.f++;
            } else {
              doc.fillColor('red');
              doc.text('N/TRAN', valX + 30, rowY, { width: 40, align: 'center' });
              if (isM) stats.nTransita.m++;
              if (isF) stats.nTransita.f++;
            }

            if (media > maxMedia) {
              maxMedia = media;
              melhorAluno = { nome: alunoNome, idade: idade };
            }
          }
        } else {
          doc.font('Helvetica');
          doc.text('-', valX, rowY, { width: 30, align: 'center' });
          if (!isDesistente) {
            doc.text('-', valX + 30, rowY, { width: 40, align: 'center' });
          }
        }

        if (isDesistente) {
          doc.font('Helvetica-Oblique');
          doc.fillColor('gray');
          doc.text('DESIST.', valX + 30, rowY, { width: 40, align: 'center' });
        }

        doc.font('Helvetica');
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
    let descCurso = (metadata?.tb_cursos?.designacao || '').toUpperCase();
    const descPeriodo = (metadata?.tb_periodos?.designacao || '').toUpperCase();
    const descTurma = (metadata?.designacao || '').toUpperCase();
    
    // Fallback: If course is empty but turma contains it (e.g. "10ª ÚNICA-ANÁLISES CLÌNICAS-MATINAL")
    if (!descCurso && descTurma.includes('-')) {
      const parts = descTurma.split('-');
      if (parts.length >= 2) {
        descCurso = parts[1].trim();
      }
    }
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

    return buildPautaExcelTemplate({
      pautaData,
      codigoTrimestre,
      descClasse,
      descCurso,
      descPeriodo,
      descTurma,
      descTrimestre,
      descAno,
      totalM,
      totalF
    });
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

      // Step 2: Buscar disciplinas via grade curricular
      const gradesCurricular = await prisma.tb_grade_curricular.findMany({
        where: { codigo_Classe: turmaObj.codigo_Classe, codigo_Curso: turmaObj.codigo_Curso },
        include: { tb_disciplinas: { select: { codigo: true, designacao: true } } }
      });
      let disciplinas = gradesCurricular
        .filter(g => g.tb_disciplinas)
        .map(g => g.tb_disciplinas);

      // Step 3: Buscar todas as notas da turma no trimestre
      const codigosAlunos = confirmacoes
        .map(c => c.tb_matriculas?.tb_alunos?.codigo)
        .filter(Boolean);

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
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
        }
      });

      // Fallback para disciplinas das notas se grade curricular estiver vazia
      if (disciplinas.length === 0) {
        const disciplinasMap = {};
        notas.forEach(n => {
          if (n.tb_disciplinas) disciplinasMap[n.tb_disciplinas.codigo] = n.tb_disciplinas;
        });
        disciplinas = Object.values(disciplinasMap);
      }

      // Step 4: Buscar faltas da turma no trimestre
      const trimestreDesignacao = trimestreObj?.designacao || `${codigoTrimestre}`;
      const anoLetivoDesignacao = anoLetivoObj?.designacao || `${codigoAnoLectivo}`;

      let faltas = await prisma.tb_faltas.findMany({
        where: {
          Codigo_Matricula: { in: confirmacoes.map(c => c.codigo_Matricula) },
          Trimestre: trimestreDesignacao,
          AnoLectivo: anoLetivoDesignacao
        }
      }).catch(() => []);

      // Step 5: Processar a pauta consolidada para cada aluno
      const pautaPorAluno = {};
      
      for (const confirmacao of confirmacoes) {
        const aluno = confirmacao.tb_matriculas?.tb_alunos;
        if (!aluno) continue;
        const codigoAluno = aluno.codigo;

        const notasAluno = notas.filter(n => n.CodigoAluno === codigoAluno);
        const notasPorDisciplina = {};
        notasAluno.forEach(n => {
          if (!notasPorDisciplina[n.CodigoDisciplina]) {
            notasPorDisciplina[n.CodigoDisciplina] = [];
          }
          notasPorDisciplina[n.CodigoDisciplina].push(n);
        });

        // Consolidar notas e faltas para cada disciplina
        const disciplinasAluno = disciplinas.map(disc => {
          const listNotas = notasPorDisciplina[disc.codigo] || [];
          const notaConsolidada = listNotas.length > 0 ? GradeManagementService._calcularNotaTrimestral(listNotas) : null;
          
          const faltasAlunoDisc = faltas
            .filter(f => f.Codigo_Matricula === confirmacao.codigo_Matricula && f.Codigo_Disciplina === disc.codigo)
            .reduce((sum, f) => sum + (parseInt(f.nFaltas) || 1), 0);

          return {
            codigoDisciplina: disc.codigo,
            disciplina: disc.designacao,
            nota: notaConsolidada,
            faltas: faltasAlunoDisc
          };
        });

        // Calcular médias, idade, gênero e situação
        const birthYear = aluno.dataNascimento ? new Date(aluno.dataNascimento).getFullYear() : 0;
        const currentYear = new Date().getFullYear();
        const idade = birthYear > 0 ? currentYear - birthYear : null;

        const generoRaw = aluno.sexo?.toUpperCase() || '';
        const genero = (generoRaw === 'M' || generoRaw.startsWith('MASC')) ? 'M' : ((generoRaw === 'F' || generoRaw.startsWith('FEM') || generoRaw === 'W') ? 'F' : '-');

        const notasValidas = disciplinasAluno.map(d => d.nota).filter(n => n !== null);
        const mediaGeral = notasValidas.length > 0 
          ? parseFloat((notasValidas.reduce((s, n) => s + n, 0) / notasValidas.length).toFixed(2)) 
          : 0;

        const negativas = disciplinasAluno.filter(d => d.nota !== null && d.nota < 10).length;

        let situacao = 'N/TRAN';
        if (aluno.codigo_Status !== 1) {
          situacao = 'DESIST.';
        } else if (mediaGeral >= 10 && negativas <= 2) {
          situacao = 'TRANS';
        }

        pautaPorAluno[codigoAluno] = {
          aluno: {
            ...aluno,
            idade,
            genero
          },
          disciplinas: disciplinasAluno,
          mediaGeral,
          negativas,
          situacao
        };
      }

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
        pauta: pautaPorAluno,
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
