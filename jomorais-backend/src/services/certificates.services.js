/**
 * Serviço de Certificados
 * Gerencia a emissão, assinatura e consulta de certificados de conclusão/aprovação
 */

import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';

export class CertificatesService {
  /**
   * Gerar número sequencial de certificado
   * Formato: CERT-AAAA-NNNNNN
   */
  static async generateNumeroCertificado(codigoAnoLectivo, tx = prisma) {
    try {
      const anoLectivo = await tx.tb_ano_lectivo.findUnique({
        where: { codigo: codigoAnoLectivo }
      });
      
      if (!anoLectivo) {
        throw new AppError('Ano letivo não encontrado', 404, 'YEAR_NOT_FOUND');
      }

      // Contar certificados deste ano
      const total = await tx.tb_certificados.count({
        where: {
          Codigo_AnoLectivo: codigoAnoLectivo
        }
      });

      const sequencial = String(total + 1).padStart(6, '0');
      const anoInicial = anoLectivo.anoInicial;
      const proposedNumber = `CERT-${anoInicial}-${sequencial}`;

      // Verificar duplicidade de número para concorrência
      const duplicateNumber = await tx.tb_certificados.findFirst({
        where: { NumeroCertificado: proposedNumber }
      });
      if (duplicateNumber) {
        const totalRefetched = await tx.tb_certificados.count({
          where: { Codigo_AnoLectivo: codigoAnoLectivo }
        });
        return `CERT-${anoInicial}-${String(totalRefetched + 1).padStart(6, '0')}`;
      }

      return proposedNumber;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao gerar número de certificado', 500, 'GENERATION_ERROR', { originalError: error.message });
    }
  }

  /**
   * Criar novo certificado
   */
  static async createCertificate(data) {
    try {
      const {
        codigoAluno,
        codigoDisciplina,
        codigoAnoLectivo,
        observacoes
      } = data;

      // Validar campos obrigatórios
      if (!codigoAluno || !codigoDisciplina || !codigoAnoLectivo) {
        throw new AppError('Campos obrigatórios: codigoAluno, codigoDisciplina, codigoAnoLectivo', 400, 'MISSING_FIELDS');
      }

      // Executar toda a lógica de validação acadêmica e criação dentro de uma transação
      const certificado = await prisma.$transaction(async (tx) => {
        // Validar existência de entidades
        const [aluno, disciplina, anoLectivo] = await Promise.all([
          tx.tb_alunos.findUnique({ where: { codigo: codigoAluno } }),
          tx.tb_disciplinas.findUnique({ where: { codigo: codigoDisciplina } }),
          tx.tb_ano_lectivo.findUnique({ where: { codigo: codigoAnoLectivo } })
        ]);

        if (!aluno) {
          throw new AppError('Aluno não encontrado', 404, 'STUDENT_NOT_FOUND');
        }
        if (!disciplina) {
          throw new AppError('Disciplina não encontrada', 404, 'SUBJECT_NOT_FOUND');
        }
        if (!anoLectivo) {
          throw new AppError('Ano letivo não encontrado', 404, 'YEAR_NOT_FOUND');
        }

        // 1. Validar se o aluno tem matrícula confirmada ativa no ano letivo
        const enrollment = await tx.tb_confirmacoes.findFirst({
          where: {
            tb_matriculas: {
              codigo_Aluno: codigoAluno
            },
            codigo_Ano_lectivo: codigoAnoLectivo
          }
        });
        if (!enrollment) {
          throw new AppError('O aluno não possui confirmação de matrícula ativa para o ano letivo selecionado', 400, 'NO_ENROLLMENT');
        }

        // 2. Validar se o aluno foi aprovado na disciplina (média das notas >= 10)
        const grades = await tx.tb_notas_alunos.findMany({
          where: {
            CodigoAluno: codigoAluno,
            CodigoDisciplina: codigoDisciplina,
            CodigoAnoLectivo: codigoAnoLectivo
          }
        });

        if (grades.length === 0) {
          throw new AppError('Não foram encontradas notas lançadas para este aluno nesta disciplina', 400, 'NO_GRADES');
        }

        const totalNotas = grades.reduce((acc, curr) => acc + curr.Nota, 0);
        const media = totalNotas / grades.length;

        if (media < 10) {
          throw new AppError(`Aluno não foi aprovado nesta disciplina. Média final obtida: ${media.toFixed(1)} (mínimo de 10.0 necessário)`, 400, 'NOT_APPROVED');
        }

        // 3. Verificar se já existe certificado cadastrado
        const existente = await tx.tb_certificados.findUnique({
          where: {
            Codigo_Aluno_Codigo_Disciplina_Codigo_AnoLectivo: {
              Codigo_Aluno: codigoAluno,
              Codigo_Disciplina: codigoDisciplina,
              Codigo_AnoLectivo: codigoAnoLectivo
            }
          }
        });

        if (existente) {
          throw new AppError('Certificado já existe para este aluno nesta disciplina', 409, 'DUPLICATE_CERTIFICATE');
        }

        // Gerar número de certificado único dentro da transação
        const numeroCertificado = await this.generateNumeroCertificado(codigoAnoLectivo, tx);

        // Criar certificado
        return await tx.tb_certificados.create({
          data: {
            Codigo_Aluno: codigoAluno,
            Codigo_Disciplina: codigoDisciplina,
            Codigo_AnoLectivo: codigoAnoLectivo,
            NumeroCertificado: numeroCertificado,
            DataEmissao: new Date(),
            Status: 'Pendente',
            Observacoes: observacoes || null
          },
          include: {
            tb_alunos: {
              select: { codigo: true, nome: true }
            },
            tb_disciplinas: {
              select: { codigo: true, designacao: true }
            },
            tb_ano_lectivo: {
              select: { codigo: true, designacao: true }
            }
          }
        });
      });

      return certificado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar certificado', 500, 'CREATE_ERROR', { originalError: error.message });
    }
  }

  /**
   * Obter certificados com paginação e filtros
   */
  static async getCertificates(page = 1, limit = 10, filters = {}) {
    try {
      const { codigoAluno, codigoDisciplina, status, codigoAnoLectivo } = filters;
      
      const skip = (page - 1) * limit;
      
      const where = {};
      if (codigoAluno) where.Codigo_Aluno = codigoAluno;
      if (codigoDisciplina) where.Codigo_Disciplina = codigoDisciplina;
      if (status) where.Status = status;
      if (codigoAnoLectivo) where.Codigo_AnoLectivo = codigoAnoLectivo;

      const [certificados, total] = await Promise.all([
        prisma.tb_certificados.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_alunos: {
              select: { codigo: true, nome: true, email: true }
            },
            tb_disciplinas: {
              select: { codigo: true, designacao: true }
            },
            tb_ano_lectivo: {
              select: { codigo: true, designacao: true }
            },
            tb_utilizadores: {
              select: { codigo: true, nome: true }
            }
          },
          orderBy: { DataEmissao: 'desc' }
        }),
        prisma.tb_certificados.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);
      
      return {
        data: certificados,
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
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao listar certificados', 500, 'LIST_ERROR', { originalError: error.message });
    }
  }

  static async getCertificateById(id) {
    try {
      const certificado = await prisma.tb_certificados.findUnique({
        where: { Codigo: id },
        include: {
          tb_alunos: {
            include: {
              tb_matriculas: {
                include: {
                  tb_cursos: {
                    select: { designacao: true }
                  },
                  tb_confirmacoes: {
                    include: {
                      tb_turmas: {
                        include: {
                          tb_classes: {
                            select: { designacao: true }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          tb_disciplinas: {
            select: { codigo: true, designacao: true }
          },
          tb_ano_lectivo: {
            select: { codigo: true, designacao: true }
          },
          tb_utilizadores: {
            select: { codigo: true, nome: true }
          }
        }
      });

      if (!certificado) {
        throw new AppError('Certificado não encontrado', 404, 'CERTIFICATE_NOT_FOUND');
      }

      // Buscar e calcular média final das notas na disciplina para injetar no retorno
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoAluno: certificado.Codigo_Aluno,
          CodigoDisciplina: certificado.Codigo_Disciplina,
          CodigoAnoLectivo: certificado.Codigo_AnoLectivo
        }
      });

      const totalNotas = grades.reduce((acc, curr) => acc + curr.Nota, 0);
      const media = grades.length > 0 ? (totalNotas / grades.length) : 0;

      return {
        ...certificado,
        mediaFinal: parseFloat(media.toFixed(1))
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao obter certificado', 500, 'GET_ERROR', { originalError: error.message });
    }
  }

  /**
   * Atualizar certificado
   */
  static async updateCertificate(id, data) {
    try {
      const { observacoes } = data;

      // Validar certificado existe
      const certificado = await prisma.tb_certificados.findUnique({ where: { Codigo: id } });
      if (!certificado) {
        throw new AppError('Certificado não encontrado', 404, 'CERTIFICATE_NOT_FOUND');
      }

      // Não permitir alteração se já assinado
      if (certificado.Status === 'Assinado') {
        throw new AppError('Não é possível alterar um certificado já assinado', 400, 'ALREADY_SIGNED');
      }

      const atualizado = await prisma.tb_certificados.update({
        where: { Codigo: id },
        data: {
          ...(observacoes !== undefined && { Observacoes: observacoes })
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_ano_lectivo: { select: { codigo: true, designacao: true } }
        }
      });

      return atualizado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar certificado', 500, 'UPDATE_ERROR', { originalError: error.message });
    }
  }

  /**
   * Assinar certificado (digital)
   */
  static async signCertificate(id, codigoUtilizador) {
    try {
      // Validar certificado existe
      const certificado = await prisma.tb_certificados.findUnique({ where: { Codigo: id } });
      if (!certificado) {
        throw new AppError('Certificado não encontrado', 404, 'CERTIFICATE_NOT_FOUND');
      }

      // Validar utilizador existe
      const utilizador = await prisma.tb_utilizadores.findUnique({
        where: { codigo: codigoUtilizador }
      });
      if (!utilizador) {
        throw new AppError('Utilizador não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Não permitir dupla assinatura
      if (certificado.Status === 'Assinado') {
        throw new AppError('Certificado já foi assinado', 400, 'ALREADY_SIGNED');
      }

      const assinado = await prisma.tb_certificados.update({
        where: { Codigo: id },
        data: {
          Status: 'Assinado',
          DataAssinatura: new Date(),
          AssinadoPor: codigoUtilizador
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_utilizadores: { select: { codigo: true, nome: true } }
        }
      });

      return assinado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao assinar certificado', 500, 'SIGN_ERROR', { originalError: error.message });
    }
  }

  /**
   * Cancelar certificado
   */
  static async deleteCertificate(id) {
    try {
      const certificado = await prisma.tb_certificados.findUnique({ where: { Codigo: id } });
      if (!certificado) {
        throw new AppError('Certificado não encontrado', 404, 'CERTIFICATE_NOT_FOUND');
      }

      const cancelado = await prisma.tb_certificados.update({
        where: { Codigo: id },
        data: { Status: 'Cancelado' }
      });

      return cancelado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao cancelar certificado', 500, 'DELETE_ERROR', { originalError: error.message });
    }
  }

  /**
   * Obter certificados de um aluno
   */
  static async getCertificatesByStudent(codigoAluno, codigoAnoLectivo) {
    try {
      // Validar aluno existe
      const aluno = await prisma.tb_alunos.findUnique({ where: { codigo: codigoAluno } });
      if (!aluno) {
        throw new AppError('Aluno não encontrado', 404, 'STUDENT_NOT_FOUND');
      }

      const where = { Codigo_Aluno: codigoAluno };
      if (codigoAnoLectivo) where.Codigo_AnoLectivo = codigoAnoLectivo;

      const certificados = await prisma.tb_certificados.findMany({
        where,
        include: {
          tb_disciplinas: {
            select: { codigo: true, designacao: true }
          },
          tb_ano_lectivo: {
            select: { codigo: true, designacao: true }
          }
        },
        orderBy: { DataEmissao: 'desc' }
      });

      return {
        aluno: {
          codigo: aluno.codigo,
          nome: aluno.nome,
          email: aluno.email
        },
        totalCertificados: certificados.length,
        certificados
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao obter certificados do aluno', 500, 'GET_ERROR', { originalError: error.message });
    }
  }

  /**
   * Obter estatísticas de certificados
   */
  static async getCertificateStatistics(codigoAnoLectivo) {
    try {
      // Validar ano letivo
      const anoLectivo = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: codigoAnoLectivo }
      });
      if (!anoLectivo) {
        throw new AppError('Ano letivo não encontrado', 404, 'YEAR_NOT_FOUND');
      }

      const where = { Codigo_AnoLectivo: codigoAnoLectivo };

      const [
        totalCertificados,
        assinados,
        pendentes,
        cancelados,
        porDisciplina
      ] = await Promise.all([
        prisma.tb_certificados.count({ where }),
        prisma.tb_certificados.count({ where: { ...where, Status: 'Assinado' } }),
        prisma.tb_certificados.count({ where: { ...where, Status: 'Pendente' } }),
        prisma.tb_certificados.count({ where: { ...where, Status: 'Cancelado' } }),
        prisma.tb_certificados.groupBy({
          by: ['Codigo_Disciplina'],
          where,
          _count: true
        })
      ]);

      // Agrupar por disciplina
      const disciplinaDetails = await Promise.all(
        porDisciplina.map(async (item) => {
          const disciplina = await prisma.tb_disciplinas.findUnique({
            where: { codigo: item.Codigo_Disciplina },
            select: { designacao: true }
          });
          return {
            disciplina: disciplina?.designacao || 'Desconhecida',
            total: item._count
          };
        })
      );

      return {
        anoLectivo: anoLectivo.designacao,
        totalCertificados,
        assinados,
        pendentes,
        cancelados,
        taxaAssinatura: totalCertificados > 0 ? ((assinados / totalCertificados) * 100).toFixed(2) + '%' : '0%',
        porDisciplina: disciplinaDetails.sort((a, b) => b.total - a.total)
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao obter estatísticas', 500, 'STATS_ERROR', { originalError: error.message });
    }
  }

  /**
   * Verificar certificado publicamente
   */
  static async verifyCertificate(numeroCertificado) {
    try {
      if (!numeroCertificado) {
        throw new AppError('Número do certificado é obrigatório', 400, 'MISSING_FIELDS');
      }

      const certificado = await prisma.tb_certificados.findFirst({
        where: { NumeroCertificado: numeroCertificado },
        include: {
          tb_alunos: {
            select: { codigo: true, nome: true }
          },
          tb_disciplinas: {
            select: { codigo: true, designacao: true }
          },
          tb_ano_lectivo: {
            select: { codigo: true, designacao: true }
          },
          tb_utilizadores: {
            select: { codigo: true, nome: true }
          }
        }
      });

      if (!certificado) {
        throw new AppError('Certificado não encontrado ou número inválido', 404, 'CERTIFICATE_NOT_FOUND');
      }

      return {
        valido: certificado.Status === 'Assinado',
        status: certificado.Status,
        numero: certificado.NumeroCertificado,
        aluno: certificado.tb_alunos.nome,
        disciplina: certificado.tb_disciplinas.designacao,
        anoLectivo: certificado.tb_ano_lectivo.designacao,
        dataEmissao: certificado.DataEmissao,
        dataAssinatura: certificado.DataAssinatura,
        assinadoPor: certificado.tb_utilizadores?.nome || null
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao verificar certificado', 500, 'VERIFICATION_ERROR', { originalError: error.message });
    }
  }
}
