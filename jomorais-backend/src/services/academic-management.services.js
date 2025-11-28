// services/academic-management.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';

export class AcademicManagementService {
  // ===============================
  // ANO LETIVO - CRUD COMPLETO
  // ===============================

  static async createAnoLectivo(data) {
    try {
      const { designacao, mesInicial, mesFinal, anoInicial, anoFinal } = data;

      const existingAno = await prisma.tb_ano_lectivo.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingAno) {
        throw new AppError('Já existe um ano letivo com esta designação', 409);
      }

      if (parseInt(anoInicial) > parseInt(anoFinal)) {
        throw new AppError('Ano inicial não pode ser maior que ano final', 400);
      }

      return await prisma.tb_ano_lectivo.create({
        data: {
          designacao: designacao.trim(),
          mesInicial: mesInicial.trim(),
          mesFinal: mesFinal.trim(),
          anoInicial: anoInicial.trim(),
          anoFinal: anoFinal.trim()
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar ano letivo', 500);
    }
  }

  static async updateAnoLectivo(id, data) {
    try {
      const existingAno = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingAno) {
        throw new AppError('Ano letivo não encontrado', 404);
      }

      if (data.designacao) {
        const duplicateAno = await prisma.tb_ano_lectivo.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateAno) {
          throw new AppError('Já existe um ano letivo com esta designação', 409);
        }
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          updateData[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
        }
      });

      return await prisma.tb_ano_lectivo.update({
        where: { codigo: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar ano letivo', 500);
    }
  }

  static async getAnosLectivos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [anosLectivos, total] = await Promise.all([
        prisma.tb_ano_lectivo.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_ano_lectivo.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: anosLectivos,
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
      throw new AppError('Erro ao buscar anos letivos', 500);
    }
  }

  static async getAnoLectivoById(id) {
    try {
      const anoLectivo = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!anoLectivo) {
        throw new AppError('Ano letivo não encontrado', 404);
      }

      return anoLectivo;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar ano letivo', 500);
    }
  }

  static async deleteAnoLectivo(id, forceCascade = false) {
    try {
      const existingAno = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_turmas: {
            include: {
              tb_confirmacoes: true,
              tb_directores_turmas: true,
              tb_servico_aluno: true,
              tb_servicos_turma: true,
              tb_notas: true,
              tb_notas_1_4: true,
              tb_notas_5_6: true,
              tb_notas_7_9: true,
              tb_notas_contgest_10_12: true,
              tb_notas_enfermagem_10_12: true,
              tb_notas_fis_bio_10_12: true,
              tb_notas_jur_econ_10_12: true,
              tb_tipos_propinas: true
            }
          },
          tb_confirmacoes: true,
          tb_directores_turmas: true,
          tb_notas: true,
          tb_notas_1_4: true,
          tb_notas_5_6: true,
          tb_notas_7_9: true,
          tb_notas_alunos: true,
          tb_notas_contgest_10_12: true,
          tb_notas_enfermagem_10_12: true,
          tb_notas_fis_bio_10_12: true,
          tb_notas_jur_econ_10_12: true,
          tb_ocorrencias_alunos: true,
          tb_pre_confirmacao: true
        }
      });

      if (!existingAno) {
        throw new AppError('Ano letivo não encontrado', 404);
      }

      // TÉCNICA: VALIDAÇÃO COMPLETA COM DETALHES
      // Verificar todas as dependências e retornar informações detalhadas
      const dependencias = {
        turmas: existingAno.tb_turmas.length,
        confirmacoes: existingAno.tb_confirmacoes.length,
        diretoresTurmas: existingAno.tb_directores_turmas.length,
        notas: existingAno.tb_notas.length,
        notas1_4: existingAno.tb_notas_1_4.length,
        notas5_6: existingAno.tb_notas_5_6.length,
        notas7_9: existingAno.tb_notas_7_9.length,
        notasAlunos: existingAno.tb_notas_alunos.length,
        notasContgest: existingAno.tb_notas_contgest_10_12.length,
        notasEnfermagem: existingAno.tb_notas_enfermagem_10_12.length,
        notasFisBio: existingAno.tb_notas_fis_bio_10_12.length,
        notasJurEcon: existingAno.tb_notas_jur_econ_10_12.length,
        ocorrencias: existingAno.tb_ocorrencias_alunos.length,
        preConfirmacoes: existingAno.tb_pre_confirmacao.length
      };

      const totalDependencias = Object.values(dependencias).reduce((sum, count) => sum + count, 0);

      if (totalDependencias > 0 && !forceCascade) {
        const detalhesMsg = [];
        if (dependencias.turmas > 0) detalhesMsg.push(`${dependencias.turmas} turma(s)`);
        if (dependencias.confirmacoes > 0) detalhesMsg.push(`${dependencias.confirmacoes} confirmação(ões)`);
        if (dependencias.diretoresTurmas > 0) detalhesMsg.push(`${dependencias.diretoresTurmas} diretor(es) de turma`);
        if (dependencias.notas > 0) detalhesMsg.push(`${dependencias.notas} nota(s)`);
        if (dependencias.notasAlunos > 0) detalhesMsg.push(`${dependencias.notasAlunos} nota(s) de alunos`);
        if (dependencias.ocorrencias > 0) detalhesMsg.push(`${dependencias.ocorrencias} ocorrência(s)`);
        if (dependencias.preConfirmacoes > 0) detalhesMsg.push(`${dependencias.preConfirmacoes} pré-confirmação(ões)`);
        
        // Somar todas as notas por classe
        const totalNotasClasses = dependencias.notas1_4 + dependencias.notas5_6 + dependencias.notas7_9 + 
                                 dependencias.notasContgest + dependencias.notasEnfermagem + 
                                 dependencias.notasFisBio + dependencias.notasJurEcon;
        if (totalNotasClasses > 0) detalhesMsg.push(`${totalNotasClasses} nota(s) por classe`);

        throw new AppError(
          `Não é possível excluir este ano letivo pois possui dependências: ${detalhesMsg.join(', ')}.`, 
          400,
          dependencias
        );
      }

      if (totalDependencias > 0 && forceCascade) {
        // TÉCNICA: CASCADE DELETE (Exclusão em Cascata)
        // Excluir o ano letivo e todas as suas dependências em uma transação
        const result = await prisma.$transaction(async (tx) => {
          console.log(`[DELETE ANO LETIVO] Iniciando exclusão em cascata do ano letivo ${id} - ${existingAno.designacao}`);
          
          let contadores = {
            confirmacoes: 0,
            servicosAluno: 0,
            docenteTurma: 0,
            servicosTurma: 0,
            diretoresTurma: 0,
            tiposPropinas: 0,
            notas: 0,
            notas1_4: 0,
            notas5_6: 0,
            notas7_9: 0,
            notasAlunos: 0,
            notasContgest: 0,
            notasEnfermagem: 0,
            notasFisBio: 0,
            notasJurEcon: 0,
            ocorrencias: 0,
            preConfirmacoes: 0,
            turmas: 0
          };

          // ===================================
          // PASSO 1: EXCLUIR NOTAS GERAIS
          // ===================================
          if (existingAno.tb_notas.length > 0) {
            const notasResult = await tx.tb_notas.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notas = notasResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notas} notas gerais`);
          }

          // ===================================
          // PASSO 2: EXCLUIR NOTAS POR CLASSE
          // ===================================
          if (existingAno.tb_notas_1_4.length > 0) {
            const notas1_4Result = await tx.tb_notas_1_4.deleteMany({
              where: { Codigo_Ano_Lectivo: parseInt(id) }
            });
            contadores.notas1_4 = notas1_4Result.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notas1_4} notas 1ª-4ª classe`);
          }

          if (existingAno.tb_notas_5_6.length > 0) {
            const notas5_6Result = await tx.tb_notas_5_6.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notas5_6 = notas5_6Result.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notas5_6} notas 5ª-6ª classe`);
          }

          if (existingAno.tb_notas_7_9.length > 0) {
            const notas7_9Result = await tx.tb_notas_7_9.deleteMany({
              where: { Codigo_AnoLectivo: parseInt(id) }
            });
            contadores.notas7_9 = notas7_9Result.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notas7_9} notas 7ª-9ª classe`);
          }

          if (existingAno.tb_notas_alunos.length > 0) {
            const notasAlunosResult = await tx.tb_notas_alunos.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notasAlunos = notasAlunosResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notasAlunos} notas de alunos`);
          }

          // Notas especializadas
          if (existingAno.tb_notas_contgest_10_12.length > 0) {
            const notasContgestResult = await tx.tb_notas_contgest_10_12.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notasContgest = notasContgestResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notasContgest} notas contabilidade/gestão`);
          }

          if (existingAno.tb_notas_enfermagem_10_12.length > 0) {
            const notasEnfermagemResult = await tx.tb_notas_enfermagem_10_12.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notasEnfermagem = notasEnfermagemResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notasEnfermagem} notas enfermagem`);
          }

          if (existingAno.tb_notas_fis_bio_10_12.length > 0) {
            const notasFisBioResult = await tx.tb_notas_fis_bio_10_12.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notasFisBio = notasFisBioResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notasFisBio} notas física/biologia`);
          }

          if (existingAno.tb_notas_jur_econ_10_12.length > 0) {
            const notasJurEconResult = await tx.tb_notas_jur_econ_10_12.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.notasJurEcon = notasJurEconResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.notasJurEcon} notas jurídico/economia`);
          }

          // ===================================
          // PASSO 3: EXCLUIR OCORRÊNCIAS
          // ===================================
          if (existingAno.tb_ocorrencias_alunos.length > 0) {
            const ocorrenciasResult = await tx.tb_ocorrencias_alunos.deleteMany({
              where: { CodigoAnoLectivo: parseInt(id) }
            });
            contadores.ocorrencias = ocorrenciasResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.ocorrencias} ocorrências`);
          }

          // ===================================
          // PASSO 4: EXCLUIR PRÉ-CONFIRMAÇÕES
          // ===================================
          if (existingAno.tb_pre_confirmacao.length > 0) {
            const preConfirmacaoResult = await tx.tb_pre_confirmacao.deleteMany({
              where: { codigoAnoLectivo: parseInt(id) }
            });
            contadores.preConfirmacoes = preConfirmacaoResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.preConfirmacoes} pré-confirmações`);
          }

          // ===================================
          // PASSO 5: EXCLUIR DEPENDÊNCIAS DAS TURMAS
          // ===================================
          if (existingAno.tb_turmas.length > 0) {
            const turmaIds = existingAno.tb_turmas.map(t => t.codigo);

            // Excluir confirmações das turmas
            const confirmacoesResult = await tx.tb_confirmacoes.deleteMany({
              where: { codigo_Turma: { in: turmaIds } }
            });
            contadores.confirmacoes = confirmacoesResult.count;
            if (contadores.confirmacoes > 0) {
              console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.confirmacoes} confirmações das turmas`);
            }

            // Excluir serviços dos alunos
            const servicosAlunoResult = await tx.tb_servico_aluno.deleteMany({
              where: { codigo_Turma: { in: turmaIds } }
            });
            contadores.servicosAluno = servicosAlunoResult.count;
            if (contadores.servicosAluno > 0) {
              console.log(`[DELETE ANO LETIVO] ✓ Excluídos ${contadores.servicosAluno} serviços de alunos`);
            }

            // Excluir relações docente-turma
            const docenteTurmaResult = await tx.tb_docente_turma.deleteMany({
              where: { codigo_turma: { in: turmaIds } }
            });
            contadores.docenteTurma = docenteTurmaResult.count;
            if (contadores.docenteTurma > 0) {
              console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.docenteTurma} relações docente-turma`);
            }

            // Excluir serviços de turma
            const servicosTurmaResult = await tx.tb_servicos_turma.deleteMany({
              where: { codigoTurma: { in: turmaIds } }
            });
            contadores.servicosTurma = servicosTurmaResult.count;
            if (contadores.servicosTurma > 0) {
              console.log(`[DELETE ANO LETIVO] ✓ Excluídos ${contadores.servicosTurma} serviços de turma`);
            }

            // Excluir tipos de propinas
            const tiposPropinaResult = await tx.tb_tipos_propinas.deleteMany({
              where: { codigoTurma: { in: turmaIds } }
            });
            contadores.tiposPropinas = tiposPropinaResult.count;
            if (contadores.tiposPropinas > 0) {
              console.log(`[DELETE ANO LETIVO] ✓ Excluídos ${contadores.tiposPropinas} tipos de propinas`);
            }
          }

          // ===================================
          // PASSO 6: EXCLUIR DIRETORES DE TURMA
          // ===================================
          if (existingAno.tb_directores_turmas.length > 0) {
            const diretoresTurmaResult = await tx.tb_directores_turmas.deleteMany({
              where: { codigoAnoLectivo: parseInt(id) }
            });
            contadores.diretoresTurma = diretoresTurmaResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídos ${contadores.diretoresTurma} diretores de turma`);
          }

          // ===================================
          // PASSO 7: EXCLUIR TURMAS
          // ===================================
          if (existingAno.tb_turmas.length > 0) {
            const turmasResult = await tx.tb_turmas.deleteMany({
              where: { codigo_AnoLectivo: parseInt(id) }
            });
            contadores.turmas = turmasResult.count;
            console.log(`[DELETE ANO LETIVO] ✓ Excluídas ${contadores.turmas} turmas`);
          }

          // ===================================
          // PASSO 8: EXCLUIR O ANO LETIVO
          // ===================================
          await tx.tb_ano_lectivo.delete({
            where: { codigo: parseInt(id) }
          });
          console.log('[DELETE ANO LETIVO] ✓ Ano letivo excluído');
          
          console.log('[DELETE ANO LETIVO] ✓ Exclusão em cascata concluída com sucesso');
          
          return { 
            message: 'Ano letivo e todas as dependências excluídas com sucesso',
            tipo: 'cascade_delete',
            detalhes: {
              anoNome: existingAno.designacao,
              ...contadores
            }
          };
        }, {
          maxWait: 60000,
          timeout: 60000,
        });
        
        return result;
      }

      // TÉCNICA: HARD DELETE (Exclusão Física)
      // Ano letivo sem dependências pode ser excluído permanentemente
      await prisma.tb_ano_lectivo.delete({
        where: { codigo: parseInt(id) }
      });

      return { 
        message: 'Ano letivo excluído com sucesso',
        tipo: 'hard_delete',
        detalhes: {
          anoNome: existingAno.designacao
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[DELETE ANO LETIVO] ✗ Erro ao excluir ano letivo:', error);
      console.error('Stack trace:', error.stack);
      throw new AppError(`Erro ao excluir ano letivo: ${error.message}`, 500);
    }
  }

  // ===============================
  // CURSOS - CRUD COMPLETO
  // ===============================

  static async createCurso(data) {
    try {
      const { designacao, codigo_Status } = data;

      if (designacao) {
        const existingCurso = await prisma.tb_cursos.findFirst({
          where: {
            designacao: designacao.trim()
          }
        });

        if (existingCurso) {
          throw new AppError('Já existe um curso com esta designação', 409);
        }
      }

      return await prisma.tb_cursos.create({
        data: {
          designacao: designacao?.trim() || null,
          codigo_Status: codigo_Status ? parseInt(codigo_Status) : 1
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar curso', 500);
    }
  }

  static async updateCurso(id, data) {
    try {
      const existingCurso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingCurso) {
        throw new AppError('Curso não encontrado', 404);
      }

      if (data.designacao) {
        const duplicateCurso = await prisma.tb_cursos.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateCurso) {
          throw new AppError('Já existe um curso com esta designação', 409);
        }
      }

      const updateData = {};
      if (data.designacao !== undefined) {
        updateData.designacao = data.designacao?.trim() || null;
      }
      if (data.codigo_Status !== undefined) {
        updateData.codigo_Status = data.codigo_Status ? parseInt(data.codigo_Status) : null;
      }

      return await prisma.tb_cursos.update({
        where: { codigo: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar curso', 500);
    }
  }

  static async getCursos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [cursos, total] = await Promise.all([
        prisma.tb_cursos.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_cursos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: cursos,
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
      console.error('Erro detalhado ao buscar cursos:', error);
      throw new AppError(`Erro ao buscar cursos: ${error.message}`, 500);
    }
  }

  // Estatísticas simples dos cursos
  static async getCourseStatistics() {
    try {
      const total = await prisma.tb_cursos.count();
      const active = await prisma.tb_cursos.count({ where: { codigo_Status: 1 } });
      const inactive = await prisma.tb_cursos.count({ where: { codigo_Status: 0 } });

      return { total, active, inactive };
    } catch (error) {
      throw new AppError('Erro ao obter estatísticas de cursos', 500);
    }
  }

  static async getCursoById(id) {
    try {
      const curso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!curso) {
        throw new AppError('Curso não encontrado', 404);
      }

      return curso;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar curso', 500);
    }
  }

  static async deleteCurso(id) {
    try {
      const existingCurso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_disciplinas: true,
          tb_turmas: true,
          tb_grade_curricular: true,
          tb_matriculas: true
        }
      });

      if (!existingCurso) {
        throw new AppError('Curso não encontrado', 404);
      }

      // TÉCNICA: VALIDAÇÃO COM DETALHES
      // Verificar todas as dependências e retornar informações detalhadas
      const temDependencias = existingCurso.tb_disciplinas.length > 0 || 
                              existingCurso.tb_turmas.length > 0 || 
                              existingCurso.tb_grade_curricular.length > 0 ||
                              existingCurso.tb_matriculas.length > 0;

      if (temDependencias) {
        const detalhes = {
          disciplinas: existingCurso.tb_disciplinas.length,
          turmas: existingCurso.tb_turmas.length,
          gradeCurricular: existingCurso.tb_grade_curricular.length,
          matriculas: existingCurso.tb_matriculas.length
        };
        
        throw new AppError(
          `Não é possível excluir este curso pois possui ${existingCurso.tb_disciplinas.length} disciplina(s), ` +
          `${existingCurso.tb_turmas.length} turma(s), ${existingCurso.tb_grade_curricular.length} item(ns) na grade curricular ` +
          `e ${existingCurso.tb_matriculas.length} matrícula(s) associadas.`, 
          400,
          detalhes
        );
      }

      // TÉCNICA: HARD DELETE (Exclusão Física)
      // Curso sem dependências pode ser excluído permanentemente
      await prisma.tb_cursos.delete({
        where: { codigo: parseInt(id) }
      });

      return { 
        message: 'Curso excluído com sucesso',
        tipo: 'hard_delete',
        detalhes: {
          cursoNome: existingCurso.designacao
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao excluir curso:', error);
      throw new AppError('Erro ao excluir curso', 500);
    }
  }

  // ===============================
  // CLASSES - CRUD COMPLETO
  // ===============================

  static async createClasse(data) {
    try {
      const { designacao, status, notaMaxima, exame } = data;

      const existingClasse = await prisma.tb_classes.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingClasse) {
        throw new AppError('Já existe uma classe com esta designação', 409);
      }

      return await prisma.tb_classes.create({
        data: {
          designacao: designacao.trim(),
          status: status ? parseInt(status) : 1,
          notaMaxima: notaMaxima ? parseFloat(notaMaxima) : 0,
          exame: exame !== undefined ? Boolean(exame) : false
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar classe', 500);
    }
  }

  static async updateClasse(id, data) {
    try {
      const existingClasse = await prisma.tb_classes.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingClasse) {
        throw new AppError('Classe não encontrada', 404);
      }

      if (data.designacao) {
        const duplicateClasse = await prisma.tb_classes.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateClasse) {
          throw new AppError('Já existe uma classe com esta designação', 409);
        }
      }

      const updateData = {};
      if (data.designacao !== undefined) updateData.designacao = data.designacao.trim();
      if (data.status !== undefined) updateData.status = parseInt(data.status);
      if (data.notaMaxima !== undefined) updateData.notaMaxima = parseFloat(data.notaMaxima);
      if (data.exame !== undefined) updateData.exame = Boolean(data.exame);

      return await prisma.tb_classes.update({
        where: { codigo: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar classe', 500);
    }
  }

  static async getClasses(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [classes, total] = await Promise.all([
        prisma.tb_classes.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_classes.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: classes,
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
      console.error('Erro detalhado ao buscar classes:', error);
      throw new AppError(`Erro ao buscar classes: ${error.message}`, 500);
    }
  }

  static async getClasseById(id) {
    try {
      const classe = await prisma.tb_classes.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!classe) {
        throw new AppError('Classe não encontrada', 404);
      }

      return classe;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar classe', 500);
    }
  }

  static async deleteClasse(id) {
    try {
      const existingClasse = await prisma.tb_classes.findUnique({
        where: { codigo: parseInt(id) },
        include: { 
          tb_turmas: {
            include: {
              tb_confirmacoes: {
                include: {
                  tb_matriculas: true
                }
              }
            }
          }, 
          tb_grade_curricular: true 
        }
      });

      if (!existingClasse) {
        throw new AppError('Classe não encontrada', 404);
      }

      // TÉCNICA: CASCADE DELETE (Exclusão em Cascata)
      // Excluir a classe e todas as suas dependências em uma transação
      const result = await prisma.$transaction(async (tx) => {
        console.log(`[DELETE CLASSE] Iniciando exclusão em cascata da classe ${id} - ${existingClasse.designacao}`);
        
        // ===================================
        // PASSO 1: EXCLUIR CONFIRMAÇÕES (via turmas)
        // ===================================
        let confirmacoesCount = 0;
        if (existingClasse.tb_turmas.length > 0) {
          const turmaIds = existingClasse.tb_turmas.map(t => t.codigo);
          const confirmacoesResult = await tx.tb_confirmacoes.deleteMany({
            where: { codigo_Turma: { in: turmaIds } }
          });
          confirmacoesCount = confirmacoesResult.count;
          if (confirmacoesCount > 0) {
            console.log(`[DELETE CLASSE] ✓ Excluídas ${confirmacoesCount} confirmações`);
          }
        }
        
        // ===================================
        // PASSO 2: EXCLUIR SERVIÇOS DOS ALUNOS (via turmas)
        // ===================================
        let servicosCount = 0;
        if (existingClasse.tb_turmas.length > 0) {
          const turmaIds = existingClasse.tb_turmas.map(t => t.codigo);
          const servicosResult = await tx.tb_servico_aluno.deleteMany({
            where: { codigo_Turma: { in: turmaIds } }
          });
          servicosCount = servicosResult.count;
          if (servicosCount > 0) {
            console.log(`[DELETE CLASSE] ✓ Excluídos ${servicosCount} serviços de alunos`);
          }
        }
        
        // ===================================
        // PASSO 3: EXCLUIR RELAÇÕES DOCENTE-TURMA
        // ===================================
        let docenteTurmaCount = 0;
        if (existingClasse.tb_turmas.length > 0) {
          const turmaIds = existingClasse.tb_turmas.map(t => t.codigo);
          if (tx.tb_docente_turma && typeof tx.tb_docente_turma.deleteMany === 'function') {
            const docenteTurmaResult = await tx.tb_docente_turma.deleteMany({
              where: { codigo_turma: { in: turmaIds } }
            });
            docenteTurmaCount = docenteTurmaResult.count;
          } else {
            const rawRes = await tx.$executeRawUnsafe(`DELETE FROM tb_docente_tuma WHERE codigo_turma IN (${turmaIds.join(',')})`);
            docenteTurmaCount = Number(rawRes) || 0;
          }
          if (docenteTurmaCount > 0) {
            console.log(`[DELETE CLASSE] ✓ Excluídas ${docenteTurmaCount} relações docente-turma`);
          }
        }
        
        // ===================================
        // PASSO 4: EXCLUIR SERVIÇOS DE TURMA
        // ===================================
        let servicosTurmaCount = 0;
        if (existingClasse.tb_turmas.length > 0) {
          const turmaIds = existingClasse.tb_turmas.map(t => t.codigo);
          const servicosTurmaResult = await tx.tb_servicos_turma.deleteMany({
            where: { codigoTurma: { in: turmaIds } }
          });
          servicosTurmaCount = servicosTurmaResult.count;
          if (servicosTurmaCount > 0) {
            console.log(`[DELETE CLASSE] ✓ Excluídos ${servicosTurmaCount} serviços de turma`);
          }
        }
        
        // ===================================
        // PASSO 5: EXCLUIR DIRETORES DE TURMA
        // ===================================
        let diretoresTurmaCount = 0;
        if (existingClasse.tb_turmas.length > 0) {
          const turmaIds = existingClasse.tb_turmas.map(t => t.codigo);
          const diretoresTurmaResult = await tx.tb_directores_turmas.deleteMany({
            where: { codigoTurma: { in: turmaIds } }
          });
          diretoresTurmaCount = diretoresTurmaResult.count;
          if (diretoresTurmaCount > 0) {
            console.log(`[DELETE CLASSE] ✓ Excluídos ${diretoresTurmaCount} diretores de turma`);
          }
        }
        
        // ===================================
        // PASSO 6: EXCLUIR GRADE CURRICULAR
        // ===================================
        // ===================================
        // PASSO 6: EXCLUIR GRADE CURRICULAR
        // ===================================
        const gradeCurricularCount = existingClasse.tb_grade_curricular.length;
        if (gradeCurricularCount > 0) {
          await tx.tb_grade_curricular.deleteMany({
            where: { codigo_Classe: parseInt(id) }
          });
          console.log(`[DELETE CLASSE] ✓ Excluídos ${gradeCurricularCount} itens da grade curricular`);
        }
        
        // ===================================
        // PASSO 7: EXCLUIR TURMAS
        // ===================================
        const turmasCount = existingClasse.tb_turmas.length;
        if (turmasCount > 0) {
          await tx.tb_turmas.deleteMany({
            where: { codigo_Classe: parseInt(id) }
          });
          console.log(`[DELETE CLASSE] ✓ Excluídas ${turmasCount} turmas`);
        }
        
        // ===================================
        // PASSO 8: EXCLUIR PROPINAS DA CLASSE
        // ===================================
        const propinaClasseResult = await tx.tb_propina_classe.deleteMany({
          where: { codigoClasse: parseInt(id) }
        });
        const propinaClasseCount = propinaClasseResult.count;
        if (propinaClasseCount > 0) {
          console.log(`[DELETE CLASSE] ✓ Excluídas ${propinaClasseCount} propinas da classe`);
        }
        
        // ===================================
        // PASSO 9: EXCLUIR LIMITES DE PAGAMENTO DA CLASSE
        // ===================================
        const limitePagamentoResult = await tx.tb_limite_pagamento_propina.deleteMany({
          where: { codigoClasse: parseInt(id) }
        });
        const limitePagamentoCount = limitePagamentoResult.count;
        if (limitePagamentoCount > 0) {
          console.log(`[DELETE CLASSE] ✓ Excluídos ${limitePagamentoCount} limites de pagamento`);
        }
        
        // ===================================
        // PASSO 10: EXCLUIR MESES DA CLASSE
        // ===================================
        // ===================================
        // PASSO 10: EXCLUIR MESES DA CLASSE
        // ===================================
        const mesesClasseResult = await tx.tb_meses_classe.deleteMany({
          where: { codigoClasse: parseInt(id) }
        });
        const mesesClasseCount = mesesClasseResult.count;
        if (mesesClasseCount > 0) {
          console.log(`[DELETE CLASSE] ✓ Excluídos ${mesesClasseCount} meses da classe`);
        }
        
        // ===================================
        // PASSO 11: EXCLUIR A CLASSE
        // ===================================
        await tx.tb_classes.delete({
          where: { codigo: parseInt(id) }
        });
        console.log('[DELETE CLASSE] ✓ Classe excluída');
        
        console.log('[DELETE CLASSE] ✓ Exclusão em cascata concluída com sucesso');
        
        return { 
          message: 'Classe e todas as dependências excluídas com sucesso',
          tipo: 'cascade_delete',
          detalhes: {
            classeNome: existingClasse.designacao,
            confirmacoes: confirmacoesCount,
            servicos: servicosCount,
            docenteTurma: docenteTurmaCount,
            servicosTurma: servicosTurmaCount,
            diretoresTurma: diretoresTurmaCount,
            gradeCurricular: gradeCurricularCount,
            turmas: turmasCount,
            propinaClasse: propinaClasseCount,
            limitePagamento: limitePagamentoCount,
            mesesClasse: mesesClasseCount
          }
        };
      }, {
        maxWait: 30000,
        timeout: 30000,
      });
      
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[DELETE CLASSE] ✗ Erro ao excluir classe em cascata:', error);
      console.error('Stack trace:', error.stack);
      throw new AppError(`Erro ao excluir classe e dependências: ${error.message}`, 500);
    }
  }

  // ===============================
  // DISCIPLINAS - CRUD COMPLETO
  // ===============================

  static async createDisciplina(data) {
    try {
      const { designacao, codigo_Curso, status, cadeiraEspecifica } = data;

      const cursoExists = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(codigo_Curso) }
      });

      if (!cursoExists) {
        throw new AppError('Curso não encontrado', 404);
      }

      const existingDisciplina = await prisma.tb_disciplinas.findFirst({
        where: {
          designacao: designacao.trim(),
          codigo_Curso: parseInt(codigo_Curso)
        }
      });

      if (existingDisciplina) {
        throw new AppError('Já existe uma disciplina com esta designação neste curso', 409);
      }

      return await prisma.tb_disciplinas.create({
        data: {
          designacao: designacao.trim(),
          codigo_Curso: parseInt(codigo_Curso),
          status: status ? parseInt(status) : 1,
          cadeiraEspecifica: cadeiraEspecifica ? parseInt(cadeiraEspecifica) : 0
        },
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar disciplina:', error);
      throw new AppError('Erro ao criar disciplina', 500);
    }
  }

  static async updateDisciplina(id, data) {
    try {
      const existingDisciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingDisciplina) {
        throw new AppError('Disciplina não encontrada', 404);
      }

      if (data.codigo_Curso) {
        const cursoExists = await prisma.tb_cursos.findUnique({
          where: { codigo: parseInt(data.codigo_Curso) }
        });
        if (!cursoExists) throw new AppError('Curso não encontrado', 404);
      }

      const updateData = {};
      if (data.designacao !== undefined) updateData.designacao = data.designacao.trim();
      if (data.codigo_Curso !== undefined) updateData.codigo_Curso = parseInt(data.codigo_Curso);
      if (data.status !== undefined) updateData.status = parseInt(data.status);
      if (data.cadeiraEspecifica !== undefined) updateData.cadeiraEspecifica = parseInt(data.cadeiraEspecifica);

      return await prisma.tb_disciplinas.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar disciplina', 500);
    }
  }

  static async deleteDisciplina(id) {
    try {
      const existingDisciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(id) },
        include: { 
          tb_grade_curricular: {
            include: {
              tb_classes: { select: { designacao: true } },
              tb_cursos: { select: { designacao: true } }
            }
          },
          tb_cursos: { select: { designacao: true } }
        }
      });

      if (!existingDisciplina) {
        throw new AppError('Disciplina não encontrada', 404);
      }

      // TÉCNICA: CASCADE DELETE (Exclusão em Cascata)
      // Excluir a disciplina e todas as suas dependências em uma transação
      const result = await prisma.$transaction(async (tx) => {
        console.log(`[DELETE DISCIPLINA] Iniciando exclusão em cascata da disciplina ${id} - ${existingDisciplina.designacao}`);
        
        // ===================================
        // PASSO 1: EXCLUIR GRADE CURRICULAR
        // ===================================
        const gradeCurricularCount = existingDisciplina.tb_grade_curricular.length;
        if (gradeCurricularCount > 0) {
          await tx.tb_grade_curricular.deleteMany({
            where: { codigo_disciplina: parseInt(id) }
          });
          console.log(`[DELETE DISCIPLINA] ✓ Excluídos ${gradeCurricularCount} itens da grade curricular`);
        }
        
        // ===================================
        // PASSO 2: EXCLUIR A DISCIPLINA
        // ===================================
        await tx.tb_disciplinas.delete({
          where: { codigo: parseInt(id) }
        });
        console.log('[DELETE DISCIPLINA] ✓ Disciplina excluída');
        
        console.log('[DELETE DISCIPLINA] ✓ Exclusão em cascata concluída com sucesso');
        
        return { 
          message: 'Disciplina e todas as dependências excluídas com sucesso',
          tipo: 'cascade_delete',
          detalhes: {
            disciplinaNome: existingDisciplina.designacao,
            cursoNome: existingDisciplina.tb_cursos?.designacao || 'N/A',
            gradeCurricular: gradeCurricularCount
          }
        };
      }, {
        maxWait: 30000,
        timeout: 30000,
      });
      
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[DELETE DISCIPLINA] ✗ Erro ao excluir disciplina em cascata:', error);
      console.error('Stack trace:', error.stack);
      throw new AppError(`Erro ao excluir disciplina e dependências: ${error.message}`, 500);
    }
  }

  static async getDisciplinas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [disciplinas, total] = await Promise.all([
        prisma.tb_disciplinas.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_cursos: { select: { codigo: true, designacao: true } },
            tb_grade_curricular: { select: { codigo: true } }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_disciplinas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: disciplinas,
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
      throw new AppError('Erro ao buscar disciplinas', 500);
    }
  }

  static async getDisciplinaById(id) {
    try {
      const disciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });

      if (!disciplina) {
        throw new AppError('Disciplina não encontrada', 404);
      }

      return disciplina;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar disciplina', 500);
    }
  }

  static async getDisciplineStatistics() {
    try {
      const [
        totalDisciplinas,
        disciplinasAtivas,
        disciplinasInativas,
        disciplinasEspecificas,
        disciplinasNaGrade
      ] = await Promise.all([
        // Total de disciplinas
        prisma.tb_disciplinas.count(),
        
        // Disciplinas ativas (status = 1)
        prisma.tb_disciplinas.count({
          where: { status: 1 }
        }),
        
        // Disciplinas inativas (status = 0 ou 4)
        prisma.tb_disciplinas.count({
          where: { 
            OR: [
              { status: 0 },
              { status: 4 }
            ]
          }
        }),
        
        // Disciplinas específicas (cadeiraEspecifica = 1)
        prisma.tb_disciplinas.count({
          where: { cadeiraEspecifica: 1 }
        }),
        

      ]);

      return {
        totalDisciplinas,
        disciplinasAtivas,
        disciplinasInativas,
        disciplinasEspecificas,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de disciplinas:', error);
      throw new AppError('Erro ao buscar estatísticas de disciplinas', 500);
    }
  }

  // ===============================
  // SALAS - CRUD COMPLETO
  // ===============================

  static async createSala(data) {
    try {
      const { designacao } = data;

      // Valida se a designação foi fornecida
      if (!designacao || designacao.trim().length === 0) {
        throw new AppError('Designação é obrigatória', 400);
      }

      // Busca todas as salas e faz comparação case-insensitive manualmente
      const allSalas = await prisma.tb_salas.findMany({
        select: {
          codigo: true,
          designacao: true
        }
      });

      const designacaoNormalizada = designacao.trim().toLowerCase();
      const existingSala = allSalas.find(
        sala => sala.designacao.toLowerCase() === designacaoNormalizada
      );

      if (existingSala) {
        throw new AppError('Já existe uma sala com esta designação', 409);
      }

      return await prisma.tb_salas.create({
        data: { designacao: designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      // Loga o erro real para debug
      console.error('Erro ao criar sala (detalhes):', error);
      throw new AppError(`Erro ao criar sala: ${error.message}`, 500);
    }
  }

  static async updateSala(id, data) {
    try {
      const existingSala = await prisma.tb_salas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingSala) {
        throw new AppError('Sala não encontrada', 404);
      }

      return await prisma.tb_salas.update({
        where: { codigo: parseInt(id) },
        data: { designacao: data.designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar sala', 500);
    }
  }

  static async deleteSala(id) {
    try {
      const existingSala = await prisma.tb_salas.findUnique({
        where: { codigo: parseInt(id) },
        include: { tb_turmas: true }
      });

      if (!existingSala) {
        throw new AppError('Sala não encontrada', 404);
      }

      if (existingSala.tb_turmas.length > 0) {
        throw new AppError('Não é possível excluir esta sala pois possui turmas associadas', 400);
      }

      await prisma.tb_salas.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Sala excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir sala', 500);
    }
  }

  static async getSalas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      // Remove o mode: 'insensitive' que não é suportado
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [salas, total] = await Promise.all([
        prisma.tb_salas.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_salas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: salas,
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
      console.error('Erro ao buscar salas (detalhes):', error);
      throw new AppError('Erro ao buscar salas', 500);
    }
  }

  static async getSalaById(id) {
    try {
      const sala = await prisma.tb_salas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!sala) {
        throw new AppError('Sala não encontrada', 404);
      }

      return sala;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar sala', 500);
    }
  }

  // ===============================
  // PERÍODOS - CRUD COMPLETO
  // ===============================

  static async createPeriodo(data) {
    try {
      const { designacao } = data;

      // Valida se a designação foi fornecida
      if (!designacao || designacao.trim().length === 0) {
        throw new AppError('Designação é obrigatória', 400);
      }

      // Busca todos os períodos e faz comparação case-insensitive manualmente
      const allPeriodos = await prisma.tb_periodos.findMany({
        select: {
          codigo: true,
          designacao: true
        }
      });

      const designacaoNormalizada = designacao.trim().toLowerCase();
      const existingPeriodo = allPeriodos.find(
        periodo => periodo.designacao.toLowerCase() === designacaoNormalizada
      );

      if (existingPeriodo) {
        throw new AppError('Já existe um período com esta designação', 409);
      }

      return await prisma.tb_periodos.create({
        data: { designacao: designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao criar período (detalhes):', error);
      throw new AppError(`Erro ao criar período: ${error.message}`, 500);
    }
  }

  static async updatePeriodo(id, data) {
    try {
      const existingPeriodo = await prisma.tb_periodos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingPeriodo) {
        throw new AppError('Período não encontrado', 404);
      }

      return await prisma.tb_periodos.update({
        where: { codigo: parseInt(id) },
        data: { designacao: data.designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar período', 500);
    }
  }

  static async deletePeriodo(id) {
    try {
      const existingPeriodo = await prisma.tb_periodos.findUnique({
        where: { codigo: parseInt(id) },
        include: { tb_turmas: true }
      });

      if (!existingPeriodo) {
        throw new AppError('Período não encontrado', 404);
      }

      if (existingPeriodo.tb_turmas.length > 0) {
        throw new AppError('Não é possível excluir este período pois possui turmas associadas', 400);
      }

      await prisma.tb_periodos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Período excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir período', 500);
    }
  }

  static async getPeriodos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      // Remove o mode: 'insensitive' que não é suportado
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [periodos, total] = await Promise.all([
        prisma.tb_periodos.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_periodos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: periodos,
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
      console.error('Erro ao buscar períodos (detalhes):', error);
      throw new AppError('Erro ao buscar períodos', 500);
    }
  }

  static async getPeriodoById(id) {
    try {
      const periodo = await prisma.tb_periodos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!periodo) {
        throw new AppError('Período não encontrado', 404);
      }

      return periodo;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar período', 500);
    }
  }

  // ===============================
  // TURMAS - CRUD COMPLETO
  // ===============================

  static async createTurma(data) {
    try {
      const {
        designacao, codigo_Classe, codigo_Curso, codigo_Sala,
        codigo_Periodo, status, codigo_AnoLectivo, max_Alunos
      } = data;

      // Verificar entidades relacionadas
      const [classe, curso, sala, periodo] = await Promise.all([
        prisma.tb_classes.findUnique({ where: { codigo: parseInt(codigo_Classe) } }),
        prisma.tb_cursos.findUnique({ where: { codigo: parseInt(codigo_Curso) } }),
        prisma.tb_salas.findUnique({ where: { codigo: parseInt(codigo_Sala) } }),
        prisma.tb_periodos.findUnique({ where: { codigo: parseInt(codigo_Periodo) } })
      ]);

      if (!classe) throw new AppError('Classe não encontrada', 404);
      if (!curso) throw new AppError('Curso não encontrado', 404);
      if (!sala) throw new AppError('Sala não encontrada', 404);
      if (!periodo) throw new AppError('Período não encontrado', 404);

      const existingTurma = await prisma.tb_turmas.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingTurma) {
        throw new AppError('Já existe uma turma com esta designação', 409);
      }

      return await prisma.tb_turmas.create({
        data: {
          designacao: designacao.trim(),
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso),
          codigo_Sala: parseInt(codigo_Sala),
          codigo_Periodo: parseInt(codigo_Periodo),
          status: status?.trim() || "Activo",
          codigo_AnoLectivo: codigo_AnoLectivo ? parseInt(codigo_AnoLectivo) : 1,
          max_Alunos: max_Alunos ? parseInt(max_Alunos) : 30
        },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar turma:', error);
      throw new AppError(`Erro ao criar turma: ${error.message}`, 500);
    }
  }

  static async updateTurma(id, data) {
    try {
      const existingTurma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingTurma) {
        throw new AppError('Turma não encontrada', 404);
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'designacao' || key === 'status') {
            updateData[key] = data[key].trim();
          } else if (['codigo_Classe', 'codigo_Curso', 'codigo_Sala', 'codigo_Periodo', 'codigo_AnoLectivo', 'max_Alunos'].includes(key)) {
            updateData[key] = parseInt(data[key]);
          }
        }
      });

      return await prisma.tb_turmas.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar turma', 500);
    }
  }

  static async deleteTurma(id) {
    try {
      const existingTurma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_classes: { select: { designacao: true } },
          tb_cursos: { select: { designacao: true } },
          tb_salas: { select: { designacao: true } },
          tb_periodos: { select: { designacao: true } }
        }
      });

      if (!existingTurma) {
        throw new AppError('Turma não encontrada', 404);
      }

      // TÉCNICA: CASCADE DELETE (Exclusão em Cascata)
      const result = await prisma.$transaction(async (tx) => {
        console.log(`[DELETE TURMA] Iniciando exclusão em cascata da turma ${id} - ${existingTurma.designacao}`);
        
        const turmaId = parseInt(id);
        
        // ===================================
        // PASSO 1: EXCLUIR CONFIRMAÇÕES
        // ===================================
        const confirmacoesResult = await tx.tb_confirmacoes.deleteMany({
          where: { codigo_Turma: turmaId }
        });
        const confirmacoesCount = confirmacoesResult.count;
        if (confirmacoesCount > 0) {
          console.log(`[DELETE TURMA] ✓ Excluídas ${confirmacoesCount} confirmações`);
        }
        
        // ===================================
        // PASSO 2: EXCLUIR SERVIÇOS DE ALUNOS
        // ===================================
        const servicosResult = await tx.tb_servico_aluno.deleteMany({
          where: { codigo_Turma: turmaId }
        });
        const servicosCount = servicosResult.count;
        if (servicosCount > 0) {
          console.log(`[DELETE TURMA] ✓ Excluídos ${servicosCount} serviços de alunos`);
        }
        
        // ===================================
        // PASSO 3: EXCLUIR RELAÇÕES DOCENTE-TURMA
        // ===================================
        let docenteTurmaCount = 0;
        if (tx.tb_docente_turma && typeof tx.tb_docente_turma.deleteMany === 'function') {
          const docenteTurmaResult = await tx.tb_docente_turma.deleteMany({
            where: { codigo_turma: turmaId }
          });
          docenteTurmaCount = docenteTurmaResult.count;
        } else {
          const rawRes = await tx.$executeRaw`DELETE FROM tb_docente_tuma WHERE codigo_turma = ${turmaId}`;
          docenteTurmaCount = Number(rawRes) || 0;
        }
        if (docenteTurmaCount > 0) {
          console.log(`[DELETE TURMA] ✓ Excluídas ${docenteTurmaCount} relações docente-turma`);
        }
        
        // ===================================
        // PASSO 4: EXCLUIR SERVIÇOS DE TURMA
        // ===================================
        const servicosTurmaResult = await tx.tb_servicos_turma.deleteMany({
          where: { codigoTurma: turmaId }
        });
        const servicosTurmaCount = servicosTurmaResult.count;
        if (servicosTurmaCount > 0) {
          console.log(`[DELETE TURMA] ✓ Excluídos ${servicosTurmaCount} serviços de turma`);
        }
        
        // ===================================
        // PASSO 5: EXCLUIR DIRETORES DE TURMA
        // ===================================
        const diretoresTurmaResult = await tx.tb_directores_turmas.deleteMany({
          where: { codigoTurma: turmaId }
        });
        const diretoresTurmaCount = diretoresTurmaResult.count;
        if (diretoresTurmaCount > 0) {
          console.log(`[DELETE TURMA] ✓ Excluídos ${diretoresTurmaCount} diretores de turma`);
        }
        
        // ===================================
        // PASSO 6: EXCLUIR PERMISSÕES DE TURMA-UTILIZADOR
        // ===================================
        const permissoesResult = await tx.tb_permissao_turma_utilizador.deleteMany({
          where: { codigoTurma: turmaId }
        });
        const permissoesCount = permissoesResult.count;
        if (permissoesCount > 0) {
          console.log(`[DELETE TURMA] ✓ Excluídas ${permissoesCount} permissões de turma`);
        }
        
        // ===================================
        // PASSO 7: EXCLUIR A TURMA
        // ===================================
        await tx.tb_turmas.delete({
          where: { codigo: turmaId }
        });
        console.log('[DELETE TURMA] ✓ Turma excluída');
        
        console.log('[DELETE TURMA] ✓ Exclusão em cascata concluída com sucesso');
        
        return {
          message: 'Turma e todas as dependências excluídas com sucesso',
          tipo: 'cascade_delete',
          detalhes: {
            turmaNome: existingTurma.designacao,
            confirmacoes: confirmacoesCount,
            servicos: servicosCount,
            docenteTurma: docenteTurmaCount,
            servicosTurma: servicosTurmaCount,
            diretoresTurma: diretoresTurmaCount,
            permissoes: permissoesCount
          }
        };
      }, {
        maxWait: 30000,
        timeout: 30000,
      });
      
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[DELETE TURMA] ✗ Erro ao excluir turma em cascata:', error);
      console.error('Stack trace:', error.stack);
      throw new AppError(`Erro ao excluir turma e dependências: ${error.message}`, 500);
    }
  }

  static async getTurmas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [turmas, total] = await Promise.all([
        prisma.tb_turmas.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_classes: { select: { codigo: true, designacao: true } },
            tb_cursos: { select: { codigo: true, designacao: true } },
            tb_salas: { select: { codigo: true, designacao: true } },
            tb_periodos: { select: { codigo: true, designacao: true } }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_turmas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: turmas,
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
      throw new AppError('Erro ao buscar turmas', 500);
    }
  }

  static async getTurmaById(id) {
    try {
      const turma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });

      if (!turma) {
        throw new AppError('Turma não encontrada', 404);
      }

      return turma;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar turma', 500);
    }
  }

  // ===============================
  // GRADE CURRICULAR - CRUD COMPLETO
  // ===============================

  static async createGradeCurricular(data) {
    try {
      const {
        codigo_disciplina, codigo_Classe, codigo_Curso,
        codigo_user, codigo_empresa, status, codigoTipoNota
      } = data;

      // Verificar entidades relacionadas
      const [disciplina, classe, curso] = await Promise.all([
        prisma.tb_disciplinas.findUnique({ where: { codigo: parseInt(codigo_disciplina) } }),
        prisma.tb_classes.findUnique({ where: { codigo: parseInt(codigo_Classe) } }),
        prisma.tb_cursos.findUnique({ where: { codigo: parseInt(codigo_Curso) } })
      ]);

      if (!disciplina) throw new AppError('Disciplina não encontrada', 404);
      if (!classe) throw new AppError('Classe não encontrada', 404);
      if (!curso) throw new AppError('Curso não encontrado', 404);

      // Verificar se já existe essa combinação
      const existingGrade = await prisma.tb_grade_curricular.findFirst({
        where: {
          codigo_disciplina: parseInt(codigo_disciplina),
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso)
        }
      });

      if (existingGrade) {
        throw new AppError('Esta disciplina já está na grade curricular para esta classe e curso', 409);
      }

      return await prisma.tb_grade_curricular.create({
        data: {
          codigo_disciplina: parseInt(codigo_disciplina),
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso),
          codigo_user: parseInt(codigo_user),
          codigo_empresa: parseInt(codigo_empresa),
          status: parseInt(status),
          codigoTipoNota: parseInt(codigoTipoNota)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar grade curricular', 500);
    }
  }

  static async updateGradeCurricular(id, data) {
    try {
      const existingGrade = await prisma.tb_grade_curricular.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingGrade) {
        throw new AppError('Grade curricular não encontrada', 404);
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          updateData[key] = parseInt(data[key]);
        }
      });

      return await prisma.tb_grade_curricular.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar grade curricular', 500);
    }
  }

  static async deleteGradeCurricular(id) {
    try {
      const existingGrade = await prisma.tb_grade_curricular.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingGrade) {
        throw new AppError('Grade curricular não encontrada', 404);
      }

      await prisma.tb_grade_curricular.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Grade curricular excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir grade curricular', 500);
    }
  }

  static async getGradeCurricular(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          {
            tb_disciplinas: {
              designacao: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            tb_classes: {
              designacao: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            tb_cursos: {
              designacao: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ]
      } : {};

      const [gradeCurricular, total] = await Promise.all([
        prisma.tb_grade_curricular.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_classes: { select: { codigo: true, designacao: true } },
            tb_cursos: { select: { codigo: true, designacao: true } }
          },
          orderBy: { codigo: 'asc' }
        }),
        prisma.tb_grade_curricular.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: gradeCurricular,
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
      throw new AppError('Erro ao buscar grade curricular', 500);
    }
  }

  static async getGradeCurricularById(id) {
    try {
      const gradeCurricular = await prisma.tb_grade_curricular.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });

      if (!gradeCurricular) {
        throw new AppError('Grade curricular não encontrada', 404);
      }

      return gradeCurricular;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar grade curricular', 500);
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS
  // ===============================

  static async getGradeByCursoAndClasse(codigo_Curso, codigo_Classe) {
    try {
      return await prisma.tb_grade_curricular.findMany({
        where: {
          codigo_Curso: parseInt(codigo_Curso),
          codigo_Classe: parseInt(codigo_Classe)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar grade curricular', 500);
    }
  }

  static async getTurmasByAnoLectivo(codigo_AnoLectivo) {
    try {
      return await prisma.tb_turmas.findMany({
        where: { codigo_AnoLectivo: parseInt(codigo_AnoLectivo) },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar turmas do ano letivo', 500);
    }
  }

  static async getDisciplinasByCurso(codigo_Curso) {
    try {
      return await prisma.tb_disciplinas.findMany({
        where: { codigo_Curso: parseInt(codigo_Curso) },
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar disciplinas do curso', 500);
    }
  }

  static async getTurmasByClasseAndCurso(codigo_Classe, codigo_Curso) {
    try {
      return await prisma.tb_turmas.findMany({
        where: {
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso)
        },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar turmas por classe e curso', 500);
    }
  }

  // ===============================
  // RELATÓRIOS DE ALUNOS POR TURMA
  // ===============================

  static async getAlunosByTurma(turmaId) {
    try {
      // Primeiro verificar se a turma existe
      const turma = await prisma.tb_turmas.findUnique({
        where: { codigo: turmaId }
      });

      if (!turma) {
        throw new AppError('Turma não encontrada', 404);
      }

      // Buscar alunos matriculados na turma através das confirmações
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: turmaId,
          codigo_Status: 1 // Apenas confirmações ativas
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  n_documento_identificacao: true,
                  email: true,
                  telefone: true,
                  dataNascimento: true,
                  sexo: true
                }
              }
            }
          }
        }
      });

      // Extrair dados dos alunos e remover duplicatas
      const alunosMap = new Map();
      confirmacoes.forEach(confirmacao => {
        const aluno = confirmacao.tb_matriculas?.tb_alunos;
        if (aluno && !alunosMap.has(aluno.codigo)) {
          alunosMap.set(aluno.codigo, {
            codigo: aluno.codigo,
            nome: aluno.nome,
            numero_documento: aluno.n_documento_identificacao,
            email: aluno.email,
            telefone: aluno.telefone,
            data_nascimento: aluno.dataNascimento,
            genero: aluno.sexo
          });
        }
      });

      return Array.from(alunosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro ao buscar alunos da turma:', error);
      throw new AppError('Erro ao buscar alunos da turma', 500);
    }
  }

  static async getRelatorioCompletoTurmas(anoLectivoId) {
    try {
      // Construir filtros
      const where = {
        OR: [
          { status: 'Ativo' },
          { status: 'Activo' } // Variação encontrada no banco
        ]
      };
      
      // Adicionar filtro de ano letivo se fornecido
      if (anoLectivoId) {
        where.codigo_AnoLectivo = parseInt(anoLectivoId);
      }
      
      // Buscar turmas com filtros
      const turmas = await prisma.tb_turmas.findMany({
        where,
        include: {
          tb_classes: { select: { designacao: true } },
          tb_cursos: { select: { designacao: true } },
          tb_salas: { select: { designacao: true } },
          tb_periodos: { select: { designacao: true } }
        },
        orderBy: [
          { tb_classes: { designacao: 'asc' } },
          { designacao: 'asc' }
        ]
      });

      // Para cada turma, buscar seus alunos
      const relatorioCompleto = [];
      
      for (const turma of turmas) {
        try {
          const alunos = await this.getAlunosByTurma(turma.codigo);
          
          relatorioCompleto.push({
            turma: {
              codigo: turma.codigo,
              designacao: turma.designacao,
              tb_classes: turma.tb_classes,
              tb_cursos: turma.tb_cursos,
              tb_salas: turma.tb_salas,
              tb_periodos: turma.tb_periodos
            },
            alunos: alunos
          });
        } catch (error) {
          console.error(`Erro ao buscar alunos da turma ${turma.designacao}:`, error);
          // Continuar com as outras turmas mesmo se uma falhar
          relatorioCompleto.push({
            turma: {
              codigo: turma.codigo,
              designacao: turma.designacao,
              tb_classes: turma.tb_classes,
              tb_cursos: turma.tb_cursos,
              tb_salas: turma.tb_salas,
              tb_periodos: turma.tb_periodos
            },
            alunos: []
          });
        }
      }

      return relatorioCompleto;
    } catch (error) {
      console.error('Erro ao gerar relatório completo:', error);
      throw new AppError('Erro ao gerar relatório completo de turmas', 500);
    }
  }
}
