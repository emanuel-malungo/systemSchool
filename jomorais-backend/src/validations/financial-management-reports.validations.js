// validations/financial-management-reports.validations.js
import { z } from 'zod';

// Schema para filtros de relatório financeiro
export const financialReportFiltersSchema = z.object({
  anoAcademico: z.string().optional(),
  classe: z.string().optional(),
  curso: z.string().optional(),
  tipoTransacao: z.enum(['payment', 'tuition', 'fine', 'discount']).optional(),
  statusPagamento: z.enum(['paid', 'pending', 'overdue', 'cancelled']).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  valorMinimo: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  valorMaximo: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional()
});

// Schema para estatísticas financeiras
export const financialStatisticsFiltersSchema = z.object({
  anoAcademico: z.string().optional(),
  classe: z.string().optional(),
  curso: z.string().optional(),
  tipoTransacao: z.enum(['payment', 'tuition', 'fine', 'discount']).optional(),
  statusPagamento: z.enum(['paid', 'pending', 'overdue', 'cancelled']).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional()
});

// Schema para parâmetro ID
export const idParamSchema = z.object({
  id: z.string().transform(val => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) {
      throw new Error('ID deve ser um número válido');
    }
    return parsed;
  })
});

// Schema para geração de relatório financeiro
export const generateFinancialReportSchema = z.object({
  format: z.enum(['pdf', 'excel', 'word']).default('pdf'),
  filters: financialReportFiltersSchema.optional(),
  includeStatistics: z.boolean().default(true),
  includeCharts: z.boolean().default(false)
});
