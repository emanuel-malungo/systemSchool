// validations/academic-management-reports.validations.js
import { z } from 'zod'

// Schema base para filtros de relatórios acadêmicos
export const academicReportFiltersSchema = z.object({
  anoAcademico: z.string().optional(),
  classe: z.string().optional(),
  curso: z.string().optional(),
  turma: z.string().optional(),
  disciplina: z.string().optional(),
  professor: z.string().optional(),
  periodo: z.string().optional(),
  trimestre: z.enum(['1', '2', '3', 'todos']).optional(),
  statusAluno: z.enum(['ativo', 'transferido', 'desistente', 'finalizado', 'todos']).optional(),
  tipoRelatorio: z.enum(['notas', 'frequencia', 'aproveitamento', 'todos']).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
})

// Filtros para lista de alunos (inclui paginação)
export const academicStudentsFiltersSchema = academicReportFiltersSchema.extend({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .optional(),
})

// Filtros para estatísticas acadêmicas
export const academicStatisticsFiltersSchema = academicReportFiltersSchema

// Filtros para desempenho por turma/classe
export const classPerformanceFiltersSchema = academicReportFiltersSchema

// Filtros para desempenho por professor
export const teacherPerformanceFiltersSchema = academicReportFiltersSchema

export default {
  academicReportFiltersSchema,
  academicStudentsFiltersSchema,
  academicStatisticsFiltersSchema,
  classPerformanceFiltersSchema,
  teacherPerformanceFiltersSchema,
}
