import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import reportsService from '../services/reports.service'
import reportGeneratorService from '../services/reportGenerator.service'
import type {
  ReportPaginationParams,
  ReportFilters,
  UseStudentsReportParams,
  UseStudentStatisticsParams,
  UseStudentCompleteDataParams,
  GenerateReportRequest,
  GenerateIndividualReportRequest,
  ApiError,
  StudentReportData,
  StudentStatistics,
} from '../types/reports.types'

// ===============================
// CHAVES DE CACHE PARA REACT QUERY
// ===============================

export const reportsKeys = {
  all: ['reports'] as const,
  students: () => [...reportsKeys.all, 'students'] as const,
  studentsList: (params: ReportPaginationParams) => [...reportsKeys.students(), 'list', params] as const,
  studentsStatistics: (filters: ReportFilters) => [...reportsKeys.students(), 'statistics', filters] as const,
  studentDetails: () => [...reportsKeys.students(), 'details'] as const,
  studentDetail: (id: number) => [...reportsKeys.studentDetails(), id] as const,
  filterOptions: () => [...reportsKeys.all, 'filter-options'] as const,
  generated: () => [...reportsKeys.all, 'generated'] as const,
}

// ===============================
// HOOKS DE CONSULTA (QUERIES)
// ===============================

/**
 * Hook para buscar alunos para relatórios com filtros e paginação
 * Implementa cache automático e refetch otimizado
 */
export function useStudentsReport(params: UseStudentsReportParams = { page: 1, limit: 10 }) {
  const { enabled = true, ...queryParams } = params

  return useQuery({
    queryKey: reportsKeys.studentsList(queryParams),
    queryFn: () => reportsService.getStudentsForReport(queryParams),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache válido por 2 minutos
    gcTime: 1000 * 60 * 5, // Mantém no cache por 5 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
    select: (data) => ({
      students: data.data.students,
      pagination: data.data.pagination,
      success: data.success,
      message: data.message,
    }),
  })
}

/**
 * Hook para buscar estatísticas dos alunos
 * Cache otimizado para estatísticas que mudam menos frequentemente
 */
export function useStudentStatistics(params: UseStudentStatisticsParams = {}) {
  const { enabled = true, ...filters } = params

  return useQuery({
    queryKey: reportsKeys.studentsStatistics(filters),
    queryFn: () => reportsService.getStudentStatistics(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  })
}

/**
 * Hook para buscar dados completos de um aluno específico
 * Usado para relatórios individuais
 */
export function useStudentCompleteData(params: UseStudentCompleteDataParams) {
  const { studentId, enabled = true } = params

  return useQuery({
    queryKey: reportsKeys.studentDetail(studentId),
    queryFn: () => reportsService.getStudentCompleteData(studentId),
    enabled: enabled && !!studentId,
    staleTime: 1000 * 60 * 3, // Cache válido por 3 minutos
    gcTime: 1000 * 60 * 8, // Mantém no cache por 8 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  })
}

/**
 * Hook para buscar opções de filtros disponíveis
 * Cache de longa duração pois essas opções mudam raramente
 */
export function useFilterOptions(enabled = true) {
  return useQuery({
    queryKey: reportsKeys.filterOptions(),
    queryFn: () => reportsService.getFilterOptions(),
    enabled,
    staleTime: 1000 * 60 * 30, // Cache válido por 30 minutos
    gcTime: 1000 * 60 * 60, // Mantém no cache por 1 hora
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  })
}

// ===============================
// HOOKS DE MUTAÇÃO (MUTATIONS)
// ===============================

/**
 * Hook para gerar relatório geral de alunos
 * Inclui feedback de loading e sucesso/erro
 */
export function useGenerateStudentsReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateReportRequest) => 
      reportsService.generateStudentsReport(request),
    onSuccess: () => {
      toast.success('Relatório gerado com sucesso!')
      
      // Invalidar cache relacionado se necessário
      queryClient.invalidateQueries({
        queryKey: reportsKeys.generated()
      })
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || 'Erro ao gerar relatório'
      toast.error(message)
      console.error('Erro ao gerar relatório de alunos:', error)
    },
  })
}

/**
 * Hook para gerar relatório individual de aluno
 * Inclui feedback de loading e sucesso/erro
 */
export function useGenerateIndividualReport() {
  return useMutation({
    mutationFn: ({ studentId, request }: { studentId: number; request: GenerateIndividualReportRequest }) =>
      reportsService.generateIndividualStudentReport(studentId, request),
    onSuccess: () => {
      toast.success('Relatório individual gerado com sucesso!')
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || 'Erro ao gerar relatório individual'
      toast.error(message)
      console.error('Erro ao gerar relatório individual:', error)
    },
  })
}

/**
 * Hook para exportar relatório em formato específico
 * Gerencia download automático do arquivo
 */
export function useExportReport() {
  return useMutation({
    mutationFn: ({ format, data, filename }: { format: 'pdf' | 'excel' | 'word'; data: any; filename: string }) =>
      reportsService.exportReport(format, data).then(blob => ({ blob, filename })),
    onSuccess: ({ blob, filename }) => {
      reportsService.downloadReport(filename, blob)
      toast.success('Relatório exportado com sucesso!')
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || 'Erro ao exportar relatório'
      toast.error(message)
      console.error('Erro ao exportar relatório:', error)
    },
  })
}

/**
 * Hook para gerar relatório Word local usando docx
 * Não depende do backend, gera o arquivo diretamente no frontend
 */
export function useGenerateWordReport() {
  return useMutation({
    mutationFn: async ({ 
      students, 
      statistics, 
      filters, 
      filename 
    }: { 
      students: StudentReportData[]
      statistics: StudentStatistics
      filters: ReportFilters
      filename?: string 
    }) => {
      await reportGeneratorService.generateStudentsWordReport(students, statistics, filters, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório Word gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório Word')
      console.error('Erro ao gerar relatório Word:', error)
    },
  })
}

/**
 * Hook para gerar relatório PDF local usando jsPDF
 * Não depende do backend, gera o arquivo diretamente no frontend
 */
export function useGeneratePDFReport() {
  return useMutation({
    mutationFn: async ({ 
      students, 
      statistics, 
      filters, 
      filename 
    }: { 
      students: StudentReportData[]
      statistics: StudentStatistics
      filters: ReportFilters
      filename?: string 
    }) => {
      reportGeneratorService.generateStudentsPDFReport(students, statistics, filters, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório PDF gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório PDF')
      console.error('Erro ao gerar relatório PDF:', error)
    },
  })
}

/**
 * Hook para gerar relatório individual Word
 */
export function useGenerateIndividualWordReport() {
  return useMutation({
    mutationFn: async ({ 
      studentData, 
      filename 
    }: { 
      studentData: any
      filename?: string 
    }) => {
      await reportGeneratorService.generateIndividualWordReport(studentData, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório individual Word gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório individual Word')
      console.error('Erro ao gerar relatório individual Word:', error)
    },
  })
}

/**
 * Hook para gerar relatório individual PDF
 */
export function useGenerateIndividualPDFReport() {
  return useMutation({
    mutationFn: async ({ 
      studentData, 
      filename 
    }: { 
      studentData: any
      filename?: string 
    }) => {
      reportGeneratorService.generateIndividualPDFReport(studentData, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório individual PDF gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório individual PDF')
      console.error('Erro ao gerar relatório individual PDF:', error)
    },
  })
}

// ===============================
// HOOKS COMPOSTOS E UTILITÁRIOS
// ===============================

/**
 * Hook composto que gerencia estado completo de relatórios
 * Inclui dados, estatísticas e opções de filtros
 */
export function useReportsManager(params: UseStudentsReportParams = {}) {
  const studentsQuery = useStudentsReport(params)
  const statisticsQuery = useStudentStatistics(params)
  const filterOptionsQuery = useFilterOptions()
  
  const generateReportMutation = useGenerateStudentsReport()
  const exportReportMutation = useExportReport()
  const generateWordReportMutation = useGenerateWordReport()
  const generatePDFReportMutation = useGeneratePDFReport()

  return {
    // Dados
    students: studentsQuery.data?.students || [],
    pagination: studentsQuery.data?.pagination,
    statistics: statisticsQuery.data,
    filterOptions: filterOptionsQuery.data,
    
    // Estados de loading
    isLoadingStudents: studentsQuery.isLoading,
    isLoadingStatistics: statisticsQuery.isLoading,
    isLoadingFilterOptions: filterOptionsQuery.isLoading,
    isGeneratingReport: generateReportMutation.isPending,
    isExportingReport: exportReportMutation.isPending,
    isGeneratingWordReport: generateWordReportMutation.isPending,
    isGeneratingPDFReport: generatePDFReportMutation.isPending,
    
    // Estados de erro
    studentsError: studentsQuery.error,
    statisticsError: statisticsQuery.error,
    filterOptionsError: filterOptionsQuery.error,
    
    // Ações
    generateReport: generateReportMutation.mutate,
    exportReport: exportReportMutation.mutate,
    generateWordReport: generateWordReportMutation.mutate,
    generatePDFReport: generatePDFReportMutation.mutate,
    
    // Refetch functions
    refetchStudents: studentsQuery.refetch,
    refetchStatistics: statisticsQuery.refetch,
    refetchFilterOptions: filterOptionsQuery.refetch,
  }
}

/**
 * Hook para gerenciar relatório individual de aluno
 * Inclui dados completos e geração de relatório
 */
export function useIndividualReportManager(studentId: number, enabled = true) {
  const studentDataQuery = useStudentCompleteData({ studentId, enabled })
  const generateReportMutation = useGenerateIndividualReport()

  return {
    // Dados
    studentData: studentDataQuery.data,
    
    // Estados
    isLoading: studentDataQuery.isLoading,
    isGenerating: generateReportMutation.isPending,
    error: studentDataQuery.error,
    
    // Ações
    generateReport: (request: GenerateIndividualReportRequest) =>
      generateReportMutation.mutate({ studentId, request }),
    
    // Refetch
    refetch: studentDataQuery.refetch,
  }
}

/**
 * Hook para invalidar cache de relatórios
 * Útil após operações que afetam os dados
 */
export function useInvalidateReportsCache() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.all })
    },
    invalidateStudents: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.students() })
    },
    invalidateStatistics: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reports' && 
          query.queryKey[2] === 'statistics'
      })
    },
    invalidateFilterOptions: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.filterOptions() })
    },
  }
}

// ===============================
// UTILITÁRIOS
// ===============================

/**
 * Função utilitária para validar filtros de data
 */
export function validateDateFilters(dateFrom?: string, dateTo?: string): boolean {
  return reportsService.validateDateRange(dateFrom, dateTo)
}

/**
 * Função utilitária para formatar filtros para exibição
 */
export function formatFiltersDisplay(filters: ReportFilters): Record<string, string> {
  return reportsService.formatFiltersForDisplay(filters)
}
