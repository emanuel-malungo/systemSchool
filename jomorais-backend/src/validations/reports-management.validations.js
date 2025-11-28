// validations/reports-management.validations.js
import { z } from 'zod';

// Schema para filtros de relatório de alunos
export const studentReportFiltersSchema = z.object({
  anoAcademico: z.string().optional(),
  classe: z.string().optional(),
  curso: z.string().optional(),
  estado: z.enum(['Ativo', 'Transferido', 'Desistente', 'Finalizado']).optional(),
  genero: z.enum(['M', 'F']).optional(),
  periodo: z.enum(['Manhã', 'Tarde', 'Noite']).optional(),
  dataMatriculaFrom: z.string().optional(),
  dataMatriculaTo: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional()
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

// Schema para estatísticas de alunos
export const studentStatisticsFiltersSchema = z.object({
  anoAcademico: z.string().optional(),
  classe: z.string().optional(),
  curso: z.string().optional(),
  estado: z.enum(['Ativo', 'Transferido', 'Desistente', 'Finalizado']).optional(),
  genero: z.enum(['M', 'F']).optional(),
  periodo: z.enum(['Manhã', 'Tarde', 'Noite']).optional()
});

// Schema para geração de relatório
export const generateReportSchema = z.object({
  format: z.enum(['pdf', 'excel', 'word']).default('pdf'),
  filters: studentReportFiltersSchema.optional(),
  includeStatistics: z.boolean().default(true),
  includeCharts: z.boolean().default(false)
});

// Schema para relatório individual de aluno
export const individualStudentReportSchema = z.object({
  studentId: z.number().int().positive(),
  format: z.enum(['pdf', 'word']).default('pdf'),
  includeHistory: z.boolean().default(true),
  includeEncarregado: z.boolean().default(true),
  includeProveniencia: z.boolean().default(true)
});
