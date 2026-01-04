import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import academicReportsService from '../services/academic-reports.service'
import reportGeneratorService from '../services/reportGenerator.service'
import type {
  AcademicReportFilters,
  UseAcademicReportsParams,
  GenerateAcademicReportRequest,
  ApiError,
  StudentAcademicData,
  AcademicStatistics,
} from '../types/academic-reports.types'

// ===============================
// CHAVES DE CACHE PARA REACT QUERY
// ===============================

export const academicReportsKeys = {
  all: ['academic-reports'] as const,
  students: () => [...academicReportsKeys.all, 'students'] as const,
  studentsList: (params: UseAcademicReportsParams) => [...academicReportsKeys.students(), 'list', params] as const,
  statistics: (filters: AcademicReportFilters) => [...academicReportsKeys.all, 'statistics', filters] as const,
  classPerformance: (filters: AcademicReportFilters) => [...academicReportsKeys.all, 'class-performance', filters] as const,
  teacherPerformance: (filters: AcademicReportFilters) => [...academicReportsKeys.all, 'teacher-performance', filters] as const,
  filterOptions: () => [...academicReportsKeys.all, 'filter-options'] as const,
  generated: () => [...academicReportsKeys.all, 'generated'] as const,
}

// ===============================
// HOOKS DE CONSULTA (QUERIES)
// ===============================

/**
 * Hook para buscar dados acadêmicos dos alunos com filtros e paginação
 */
export function useAcademicStudentData(params: UseAcademicReportsParams = { page: 1, limit: 10 }) {
  const { enabled = true, ...queryParams } = params

  return useQuery({
    queryKey: academicReportsKeys.studentsList(queryParams),
    queryFn: () => academicReportsService.getAcademicStudentData(queryParams),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache válido por 2 minutos
    gcTime: 1000 * 60 * 5, // Mantém no cache por 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => ({
      students: data.data.students,
      pagination: data.data.pagination,
      success: data.success,
      message: data.message,
    }),
  })
}

/**
 * Hook para buscar estatísticas acadêmicas
 */
export function useAcademicStatistics(params: { filters?: AcademicReportFilters; enabled?: boolean } = {}) {
  const { enabled = true, filters = {} } = params

  return useQuery({
    queryKey: academicReportsKeys.statistics(filters),
    queryFn: () => academicReportsService.getAcademicStatistics(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  })
}

/**
 * Hook para buscar desempenho por turma/classe
 */
export function useClassPerformance(params: { filters?: AcademicReportFilters; enabled?: boolean } = {}) {
  const { enabled = true, filters = {} } = params

  return useQuery({
    queryKey: academicReportsKeys.classPerformance(filters),
    queryFn: () => academicReportsService.getClassPerformance(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  })
}

/**
 * Hook para buscar desempenho por professor
 */
export function useTeacherPerformance(params: { filters?: AcademicReportFilters; enabled?: boolean } = {}) {
  const { enabled = true, filters = {} } = params

  return useQuery({
    queryKey: academicReportsKeys.teacherPerformance(filters),
    queryFn: () => academicReportsService.getTeacherPerformance(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  })
}

/**
 * Hook para buscar opções de filtros disponíveis
 */
export function useAcademicFilterOptions(enabled = true) {
  return useQuery({
    queryKey: academicReportsKeys.filterOptions(),
    queryFn: () => academicReportsService.getFilterOptions(),
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
 * Hook para gerar relatório acadêmico no backend
 */
export function useGenerateAcademicReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateAcademicReportRequest) => 
      academicReportsService.generateAcademicReport(request),
    onSuccess: () => {
      toast.success('Relatório acadêmico gerado com sucesso!')
      
      queryClient.invalidateQueries({
        queryKey: academicReportsKeys.generated()
      })
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || 'Erro ao gerar relatório acadêmico'
      toast.error(message)
      console.error('Erro ao gerar relatório acadêmico:', error)
    },
  })
}

/**
 * Hook para exportar relatório em formato específico
 */
export function useExportAcademicReport() {
  return useMutation({
    mutationFn: ({ format, data, filename }: { format: 'pdf' | 'excel' | 'word'; data: any; filename: string }) =>
      academicReportsService.exportReport(format, data).then(blob => ({ blob, filename })),
    onSuccess: ({ blob, filename }) => {
      academicReportsService.downloadReport(filename, blob)
      toast.success('Relatório acadêmico exportado com sucesso!')
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || 'Erro ao exportar relatório acadêmico'
      toast.error(message)
      console.error('Erro ao exportar relatório acadêmico:', error)
    },
  })
}

/**
 * Hook para gerar relatório acadêmico Word local usando docx
 */
export function useGenerateAcademicWordReport() {
  return useMutation({
    mutationFn: async ({ 
      students, 
      statistics, 
      filters, 
      filename 
    }: { 
      students: StudentAcademicData[]
      statistics: AcademicStatistics
      filters: AcademicReportFilters
      filename?: string 
    }) => {
      await reportGeneratorService.generateAcademicWordReport(students, statistics, filters, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório acadêmico Word gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório acadêmico Word')
      console.error('Erro ao gerar relatório acadêmico Word:', error)
    },
  })
}

/**
 * Hook para gerar relatório acadêmico PDF local usando jsPDF
 */
export function useGenerateAcademicPDFReport() {
  return useMutation({
    mutationFn: async ({ 
      students, 
      statistics, 
      filters, 
      filename 
    }: { 
      students: StudentAcademicData[]
      statistics: AcademicStatistics
      filters: AcademicReportFilters
      filename?: string 
    }) => {
      reportGeneratorService.generateAcademicPDFReport(students, statistics, filters, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório acadêmico PDF gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório acadêmico PDF')
      console.error('Erro ao gerar relatório acadêmico PDF:', error)
    },
  })
}

// ===============================
// HOOKS COMPOSTOS E UTILITÁRIOS
// ===============================

/**
 * Hook composto que gerencia estado completo de relatórios acadêmicos
 */
export function useAcademicReportsManager(params: UseAcademicReportsParams = {}) {
  const studentsQuery = useAcademicStudentData(params)
  const statisticsQuery = useAcademicStatistics({ filters: params.filters })
  const classPerformanceQuery = useClassPerformance({ filters: params.filters })
  const teacherPerformanceQuery = useTeacherPerformance({ filters: params.filters })
  const filterOptionsQuery = useAcademicFilterOptions()
  
  const generateReportMutation = useGenerateAcademicReport()
  const exportReportMutation = useExportAcademicReport()
  const generateWordReportMutation = useGenerateAcademicWordReport()
  const generatePDFReportMutation = useGenerateAcademicPDFReport()

  return {
    // Dados
    students: studentsQuery.data?.students || [],
    pagination: studentsQuery.data?.pagination,
    statistics: statisticsQuery.data,
    classPerformance: classPerformanceQuery.data || [],
    teacherPerformance: teacherPerformanceQuery.data || [],
    filterOptions: filterOptionsQuery.data,
    
    // Estados de loading
    isLoadingStudents: studentsQuery.isLoading,
    isLoadingStatistics: statisticsQuery.isLoading,
    isLoadingClassPerformance: classPerformanceQuery.isLoading,
    isLoadingTeacherPerformance: teacherPerformanceQuery.isLoading,
    isLoadingFilterOptions: filterOptionsQuery.isLoading,
    isGeneratingReport: generateReportMutation.isPending,
    isExportingReport: exportReportMutation.isPending,
    isGeneratingWordReport: generateWordReportMutation.isPending,
    isGeneratingPDFReport: generatePDFReportMutation.isPending,
    
    // Estados de erro
    studentsError: studentsQuery.error,
    statisticsError: statisticsQuery.error,
    classPerformanceError: classPerformanceQuery.error,
    teacherPerformanceError: teacherPerformanceQuery.error,
    filterOptionsError: filterOptionsQuery.error,
    
    // Ações
    generateReport: generateReportMutation.mutate,
    exportReport: exportReportMutation.mutate,
    generateWordReport: generateWordReportMutation.mutate,
    generatePDFReport: generatePDFReportMutation.mutate,
    
    // Refetch functions
    refetchStudents: studentsQuery.refetch,
    refetchStatistics: statisticsQuery.refetch,
    refetchClassPerformance: classPerformanceQuery.refetch,
    refetchTeacherPerformance: teacherPerformanceQuery.refetch,
    refetchFilterOptions: filterOptionsQuery.refetch,
  }
}

/**
 * Hook para invalidar cache de relatórios acadêmicos
 */
export function useInvalidateAcademicReportsCache() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: academicReportsKeys.all })
    },
    invalidateStudents: () => {
      queryClient.invalidateQueries({ queryKey: academicReportsKeys.students() })
    },
    invalidateStatistics: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'academic-reports' && 
          query.queryKey[1] === 'statistics'
      })
    },
    invalidateFilterOptions: () => {
      queryClient.invalidateQueries({ queryKey: academicReportsKeys.filterOptions() })
    },
  }
}

// ===============================
// UTILITÁRIOS
// ===============================

/**
 * Função utilitária para validar filtros de data
 */
export function validateAcademicDateFilters(dateFrom?: string, dateTo?: string): boolean {
  return academicReportsService.validateDateRange(dateFrom, dateTo)
}

/**
 * Função utilitária para formatar filtros para exibição
 */
export function formatAcademicFiltersDisplay(filters: AcademicReportFilters): Record<string, string> {
  return academicReportsService.formatFiltersForDisplay(filters)
}
