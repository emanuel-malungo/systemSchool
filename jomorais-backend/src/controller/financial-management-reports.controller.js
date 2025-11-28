// controller/financial-management-reports.controller.js
import { PrismaClient } from '@prisma/client';
import { FinancialReportsService } from "../services/financial-management-reports.services.js";
import { handleControllerError } from "../utils/validation.utils.js";
import { convertBigIntToString } from "../utils/bigint.utils.js";
import {
  financialReportFiltersSchema,
  financialStatisticsFiltersSchema
} from "../validations/financial-management-reports.validations.js";

const prisma = new PrismaClient();

export class FinancialReportsController {
  // ===============================
  // RELATÓRIOS FINANCEIROS
  // ===============================

  /**
   * Buscar transações financeiras com filtros para relatórios
   */
  static async getFinancialTransactions(req, res) {
    try {
      const validatedQuery = financialReportFiltersSchema.parse(req.query);
      
      const { page = 1, limit = 10, ...filters } = validatedQuery;
      
      const result = await FinancialReportsService.getFinancialTransactions(
        filters,
        page,
        limit
      );

      const convertedResult = convertBigIntToString(result);

      res.status(200).json({
        success: true,
        message: 'Transações financeiras recuperadas com sucesso',
        data: {
          transactions: convertedResult.transactions,
          pagination: convertedResult.pagination
        }
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar transações financeiras');
    }
  }

  /**
   * Buscar estatísticas financeiras
   */
  static async getFinancialStatistics(req, res) {
    try {
      const validatedQuery = financialStatisticsFiltersSchema.parse(req.query);
      
      const statistics = await FinancialReportsService.getFinancialStatistics(validatedQuery);
      
      const convertedStatistics = convertBigIntToString(statistics);

      res.status(200).json({
        success: true,
        message: 'Estatísticas financeiras recuperadas com sucesso',
        data: convertedStatistics
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar estatísticas financeiras');
    }
  }

  /**
   * Buscar opções disponíveis para filtros financeiros
   */
  static async getFilterOptions(req, res) {
    try {
      // Por enquanto, retornar opções estáticas
      // Futuramente, buscar do banco de dados quando os relacionamentos estiverem corretos
      const filterOptions = {
        anosAcademicos: ['2024', '2025'], // Dados estáticos por enquanto
        classes: ['10ª Classe', '11ª Classe', '12ª Classe'], // Dados estáticos por enquanto
        cursos: ['Informática', 'Contabilidade', 'Gestão'], // Dados estáticos por enquanto
        tiposTransacao: [
          { value: 'payment', label: 'Pagamento' },
          { value: 'tuition', label: 'Propina' },
          { value: 'fine', label: 'Multa' },
          { value: 'discount', label: 'Desconto' }
        ],
        statusPagamento: [
          { value: 'paid', label: 'Pago' },
          { value: 'pending', label: 'Pendente' },
          { value: 'overdue', label: 'Atrasado' },
          { value: 'cancelled', label: 'Cancelado' }
        ],
        metodosPagamento: [
          { value: 'cash', label: 'Dinheiro' },
          { value: 'transfer', label: 'Transferência' },
          { value: 'multicaixa', label: 'Multicaixa' },
          { value: 'other', label: 'Outros' }
        ]
      };

      res.status(200).json({
        success: true,
        message: 'Opções de filtros financeiros recuperadas com sucesso',
        data: filterOptions
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar opções de filtros financeiros');
    }
  }
}
