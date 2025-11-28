// services/financial-management-reports.services.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FinancialReportsService {
  // ===============================
  // RELATÓRIOS FINANCEIROS
  // ===============================

  /**
   * Buscar transações financeiras com filtros para relatórios
   * @param {Object} filters - Filtros de pesquisa
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Object} Lista de transações e metadados de paginação
   */
  static async getFinancialTransactions(filters = {}, page = 1, limit = 10) {
    try {
      const {
        anoAcademico,
        classe,
        curso,
        tipoTransacao,
        statusPagamento,
        dataInicio,
        dataFim,
        valorMinimo,
        valorMaximo,
        search
      } = filters;

      // Construir condições WHERE
      const whereConditions = {
        AND: []
      };

      // Filtro por ano académico - Simplificado por enquanto
      if (anoAcademico) {
        whereConditions.AND.push({
          ano: parseInt(anoAcademico)
        });
      }

      // Filtro por tipo de transação (baseado no tipo de serviço)
      if (tipoTransacao) {
        // Por enquanto, usar uma lógica simples baseada no tipo de serviço
        // Futuramente, implementar mapeamento mais específico
      }

      // Filtro por status de pagamento (baseado no código de status)
      if (statusPagamento) {
        let statusValue;
        switch (statusPagamento) {
          case 'paid':
            statusValue = 1; // Pago
            break;
          case 'pending':
            statusValue = 2; // Pendente
            break;
          case 'overdue':
            statusValue = 3; // Atrasado
            break;
          case 'cancelled':
            statusValue = 4; // Cancelado
            break;
          default:
            statusValue = null;
        }
        
        if (statusValue !== null) {
          whereConditions.AND.push({
            codigo_Estatus: statusValue
          });
        }
      }

      // Filtro por data
      if (dataInicio || dataFim) {
        const dateFilter = {};
        if (dataInicio) {
          dateFilter.gte = new Date(dataInicio);
        }
        if (dataFim) {
          dateFilter.lte = new Date(dataFim);
        }
        whereConditions.AND.push({
          data: dateFilter
        });
      }

      // Filtro por valor
      if (valorMinimo || valorMaximo) {
        const valueFilter = {};
        if (valorMinimo) {
          valueFilter.gte = parseFloat(valorMinimo);
        }
        if (valorMaximo) {
          valueFilter.lte = parseFloat(valorMaximo);
        }
        whereConditions.AND.push({
          totalgeral: valueFilter
        });
      }

      // Filtro de pesquisa por nome do aluno
      if (search) {
        whereConditions.AND.push({
          aluno: {
            nome: { contains: search, mode: 'insensitive' }
          }
        });
      }

      // Se não há filtros, remover AND vazio
      const finalWhere = whereConditions.AND.length > 0 ? whereConditions : {};

      // Calcular offset
      const offset = (page - 1) * limit;

      // Debug: Log the final where conditions
      console.log('Final WHERE conditions:', JSON.stringify(finalWhere, null, 2));
      
      // First, let's check if there's any data at all
      const totalRecords = await prisma.tb_pagamentos.count();
      console.log('Total records in tb_pagamentos:', totalRecords);

      // Buscar transações com paginação
      const [transactions, totalCount] = await Promise.all([
        prisma.tb_pagamentos.findMany({
          where: finalWhere,
          include: {
            aluno: {
              select: {
                codigo: true,
                nome: true,
                email: true,
                telefone: true
              }
            },
            tipoServico: {
              select: {
                designacao: true,
                preco: true
              }
            },
            formaPagamento: {
              select: {
                designacao: true
              }
            }
          },
          skip: offset,
          take: limit,
          orderBy: {
            data: 'desc'
          }
        }),
        prisma.tb_pagamentos.count({
          where: finalWhere
        })
      ]);

      console.log('Transactions found:', transactions.length);
      console.log('Total count with filters:', totalCount);

      // Formatar dados das transações
      const formattedTransactions = transactions.map(transaction => {
        return {
          id: transaction.codigo,
          nomeAluno: transaction.aluno?.nome || 'N/A',
          numeroMatricula: `MAT-${transaction.codigo_Aluno}`,
          tipoTransacao: this.mapTransactionType(transaction.tipoServico?.designacao),
          descricao: transaction.tipoServico?.designacao || transaction.observacao || 'N/A',
          valor: transaction.totalgeral || 0,
          valorPago: transaction.totalgeral || 0, // Assumir que o valor total é o valor pago
          valorPendente: 0, // Calcular baseado no status
          statusPagamento: this.getPaymentStatusLabel(transaction.codigo_Estatus),
          dataTransacao: transaction.data,
          dataPagamento: transaction.dataBanco || transaction.data,
          metodoPagamento: transaction.formaPagamento?.designacao || 'N/A',
          multa: transaction.multa || 0,
          desconto: transaction.desconto || 0,
          mes: transaction.mes,
          ano: transaction.ano,
          observacao: transaction.observacao
        };
      });

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);

      return {
        transactions: formattedTransactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erro ao buscar transações financeiras:', error);
      throw new Error('Erro interno do servidor ao buscar transações financeiras');
    }
  }

  /**
   * Buscar estatísticas financeiras
   * @param {Object} filters - Filtros para as estatísticas
   * @returns {Object} Estatísticas financeiras
   */
  static async getFinancialStatistics(filters = {}) {
    try {
      const {
        anoAcademico,
        classe,
        curso,
        tipoTransacao,
        statusPagamento,
        dataInicio,
        dataFim
      } = filters;

      // Construir condições WHERE (similar ao método anterior)
      const whereConditions = {
        AND: []
      };

      if (anoAcademico) {
        whereConditions.AND.push({
          ano: parseInt(anoAcademico)
        });
      }

      if (dataInicio || dataFim) {
        const dateFilter = {};
        if (dataInicio) {
          dateFilter.gte = new Date(dataInicio);
        }
        if (dataFim) {
          dateFilter.lte = new Date(dataFim);
        }
        whereConditions.AND.push({
          data: dateFilter
        });
      }

      const finalWhere = whereConditions.AND.length > 0 ? whereConditions : {};

      // Buscar estatísticas básicas
      const [
        totalTransactions,
        paidTransactions,
        pendingTransactions,
        overdueTransactions,
        cancelledTransactions,
        totalArrecadado,
        totalPendente
      ] = await Promise.all([
        prisma.tb_pagamentos.count({ where: finalWhere }),
        prisma.tb_pagamentos.count({ 
          where: { ...finalWhere, codigo_Estatus: 1 } 
        }),
        prisma.tb_pagamentos.count({ 
          where: { ...finalWhere, codigo_Estatus: 2 } 
        }),
        prisma.tb_pagamentos.count({ 
          where: { ...finalWhere, codigo_Estatus: 3 } 
        }),
        prisma.tb_pagamentos.count({ 
          where: { ...finalWhere, codigo_Estatus: 4 } 
        }),
        prisma.tb_pagamentos.aggregate({
          where: { ...finalWhere, codigo_Estatus: 1 },
          _sum: { totalgeral: true }
        }),
        prisma.tb_pagamentos.aggregate({
          where: { ...finalWhere, codigo_Estatus: { in: [2, 3] } },
          _sum: { totalgeral: true }
        })
      ]);

      // Calcular estatísticas derivadas
      const valorTotalArrecadado = totalArrecadado._sum.totalgeral || 0;
      const valorTotalPendente = totalPendente._sum.totalgeral || 0;
      const valorTotalAtrasado = valorTotalPendente; // Simplificado por enquanto
      const percentualArrecadacao = totalTransactions > 0 
        ? ((paidTransactions / totalTransactions) * 100) 
        : 0;
      const ticketMedio = totalTransactions > 0 
        ? (valorTotalArrecadado / totalTransactions) 
        : 0;

      return {
        valorTotalArrecadado,
        valorTotalPendente,
        valorTotalAtrasado,
        totalTransacoes: totalTransactions,
        transacoesPagas: paidTransactions,
        transacoesPendentes: pendingTransactions,
        transacoesAtrasadas: overdueTransactions,
        transacoesCanceladas: cancelledTransactions,
        percentualArrecadacao: Math.round(percentualArrecadacao * 100) / 100,
        ticketMedio: Math.round(ticketMedio * 100) / 100,
        distribuicaoPorTipo: {
          pagamentos: Math.floor(totalTransactions * 0.4), // Mock data
          propinas: Math.floor(totalTransactions * 0.35),
          multas: Math.floor(totalTransactions * 0.15),
          descontos: Math.floor(totalTransactions * 0.1)
        },
        distribuicaoPorMetodo: {
          dinheiro: Math.floor(totalTransactions * 0.3), // Mock data
          transferencia: Math.floor(totalTransactions * 0.4),
          multicaixa: Math.floor(totalTransactions * 0.25),
          outros: Math.floor(totalTransactions * 0.05)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      throw new Error('Erro interno do servidor ao buscar estatísticas financeiras');
    }
  }

  // ===============================
  // MÉTODOS AUXILIARES
  // ===============================

  /**
   * Mapear tipo de transação baseado na designação do serviço
   */
  static mapTransactionType(designacao) {
    if (!designacao) return 'payment';
    
    const lower = designacao.toLowerCase();
    if (lower.includes('propina') || lower.includes('mensalidade')) {
      return 'tuition';
    } else if (lower.includes('multa') || lower.includes('penalidade')) {
      return 'fine';
    } else if (lower.includes('desconto') || lower.includes('bolsa')) {
      return 'discount';
    } else {
      return 'payment';
    }
  }

  /**
   * Obter label do status de pagamento
   */
  static getPaymentStatusLabel(statusCode) {
    switch (statusCode) {
      case 1:
        return 'paid';
      case 2:
        return 'pending';
      case 3:
        return 'overdue';
      case 4:
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}
