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
  static async generateNumeroCertificado(codigoAnoLectivo) {
    try {
      const anoLectivo = await prisma.tb_ano_lectivo.findUnique({
        where: { Codigo: codigoAnoLectivo }
      });
      
      if (!anoLectivo) {
        throw new AppError('Ano letivo não encontrado', 404, 'YEAR_NOT_FOUND');
      }

      // Contar certificados deste ano
      const total = await prisma.tb_certificados.count({
        where: {
          Codigo_AnoLectivo: codigoAnoLectivo
        }
      });

      const sequencial = String(total + 1).padStart(6, '0');
      const anoInicial = anoLectivo.anoInicial;
      return `CERT-${anoInicial}-${sequencial}`;
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

      // Validar existência de entidades
      const [aluno, disciplina, anoLectivo] = await Promise.all([
        prisma.tb_alunos.findUnique({ where: { Codigo: codigoAluno } }),
        prisma.tb_disciplinas.findUnique({ where: { codigo: codigoDisciplina } }),
        prisma.tb_ano_lectivo.findUnique({ where: { Codigo: codigoAnoLectivo } })
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

      // Validar se aluno foi aprovado (nota >= 10)
      const nota = await prisma.tb_notas_alunos.findFirst({
        where: {
          CodigoAluno: codigoAluno,
          CodigoDisciplina: codigoDisciplina,
          CodigoAnoLectivo: codigoAnoLectivo
        }
      });

      if (!nota || nota.Nota < 10) {
        throw new AppError('Aluno não foi aprovado nesta disciplina (nota < 10)', 400, 'NOT_APPROVED');
      }

      // Verificar se já existe certificado
      const existente = await prisma.tb_certificados.findUnique({
        where: {
          UK_tb_certificados: {
            Codigo_Aluno: codigoAluno,
            Codigo_Disciplina: codigoDisciplina,
            Codigo_AnoLectivo: codigoAnoLectivo
          }
        }
      });

      if (existente) {
        throw new AppError('Certificado já existe para este aluno nesta disciplina', 409, 'DUPLICATE_CERTIFICATE');
      }

      // Gerar número do certificado
      const numeroCertificado = await this.generateNumeroCertificado(codigoAnoLectivo);

      // Criar certificado
      const certificado = await prisma.tb_certificados.create({
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
            select: { Codigo: true, Nome: true }
          },
          tb_disciplinas: {
            select: { codigo: true, designacao: true }
          },
          tb_ano_lectivo: {
            select: { Codigo: true, designacao: true }
          }
        }
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
              select: { Codigo: true, Nome: true, email: true }
            },
            tb_disciplinas: {
              select: { codigo: true, designacao: true }
            },
            tb_ano_lectivo: {
              select: { Codigo: true, designacao: true }
            },
            tb_utilizadores: {
              select: { Codigo: true, Nome: true }
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

  /**
   * Obter certificado por ID
   */
  static async getCertificateById(id) {
    try {
      const certificado = await prisma.tb_certificados.findUnique({
        where: { Codigo: id },
        include: {
          tb_alunos: {
            select: { Codigo: true, Nome: true, email: true, dataNascimento: true }
          },
          tb_disciplinas: {
            select: { codigo: true, designacao: true }
          },
          tb_ano_lectivo: {
            select: { Codigo: true, designacao: true }
          },
          tb_utilizadores: {
            select: { Codigo: true, Nome: true }
          }
        }
      });

      if (!certificado) {
        throw new AppError('Certificado não encontrado', 404, 'CERTIFICATE_NOT_FOUND');
      }

      return certificado;
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
          tb_alunos: { select: { Codigo: true, Nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_ano_lectivo: { select: { Codigo: true, designacao: true } }
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
        where: { Codigo: codigoUtilizador }
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
          tb_alunos: { select: { Codigo: true, Nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_utilizadores: { select: { Codigo: true, Nome: true } }
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
      const aluno = await prisma.tb_alunos.findUnique({ where: { Codigo: codigoAluno } });
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
            select: { Codigo: true, designacao: true }
          }
        },
        orderBy: { DataEmissao: 'desc' }
      });

      return {
        aluno: {
          codigo: aluno.Codigo,
          nome: aluno.Nome,
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
        where: { Codigo: codigoAnoLectivo }
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
}
