import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import financialReportsService from '../services/financial-reports.service'
import reportGeneratorService from '../services/reportGenerator.service'
import type {
  FinancialReportFilters,
  UseFinancialReportsParams,
  GenerateFinancialReportRequest,
  ApiError,
  FinancialTransaction,
  FinancialStatistics,
} from '../types/financial-reports.types'

// ===============================
// CHAVES DE CACHE PARA REACT QUERY
// ===============================

export const financialReportsKeys = {
  all: ['financial-reports'] as const,
  transactions: () => [...financialReportsKeys.all, 'transactions'] as const,
  transactionsList: (params: UseFinancialReportsParams) => [...financialReportsKeys.transactions(), 'list', params] as const,
  statistics: (filters: FinancialReportFilters) => [...financialReportsKeys.all, 'statistics', filters] as const,
  filterOptions: () => [...financialReportsKeys.all, 'filter-options'] as const,
  generated: () => [...financialReportsKeys.all, 'generated'] as const,
}

// ===============================
// HOOKS DE CONSULTA (QUERIES)
// ===============================

/**
 * Hook para buscar transações financeiras com filtros e paginação
 */
export function useFinancialTransactions(params: UseFinancialReportsParams = { page: 1, limit: 10 }) {
  const { enabled = true, ...queryParams } = params

  return useQuery({
    queryKey: financialReportsKeys.transactionsList(queryParams),
    queryFn: () => financialReportsService.getFinancialTransactions(queryParams),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache válido por 2 minutos
    gcTime: 1000 * 60 * 5, // Mantém no cache por 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (data) => ({
      // A API retorna `transactions` no backend
      transactions: data.data.transactions,
      pagination: data.data.pagination,
      success: data.success,
      message: data.message,
    }),
  })
}

/**
 * Hook para buscar estatísticas financeiras
 */
export function useFinancialStatistics(params: { filters?: FinancialReportFilters; enabled?: boolean } = {}) {
  const { enabled = true, filters = {} } = params

  return useQuery({
    queryKey: financialReportsKeys.statistics(filters),
    queryFn: () => financialReportsService.getFinancialStatistics(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (data) => data.data,
  })
}

/**
 * Hook para buscar opções de filtros disponíveis
 */
export function useFinancialFilterOptions(enabled = true) {
  return useQuery({
    queryKey: financialReportsKeys.filterOptions(),
    queryFn: () => financialReportsService.getFilterOptions(),
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
 * Hook para gerar relatório financeiro no backend
 */
export function useGenerateFinancialReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateFinancialReportRequest) => 
      financialReportsService.generateFinancialReport(request),
    onSuccess: () => {
      toast.success('Relatório financeiro gerado com sucesso!')
      
      queryClient.invalidateQueries({
        queryKey: financialReportsKeys.generated()
      })
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || 'Erro ao gerar relatório financeiro'
      toast.error(message)
      console.error('Erro ao gerar relatório financeiro:', error)
    },
  })
}

/**
 * Hook para exportar relatório em formato específico
 */
export function useExportFinancialReport() {
  return useMutation({
    mutationFn: ({ format, data, filename }: { format: 'pdf' | 'excel' | 'word'; data: any; filename: string }) =>
      financialReportsService.exportReport(format, data).then(blob => ({ blob, filename })),
    onSuccess: ({ blob, filename }) => {
      financialReportsService.downloadReport(filename, blob)
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
 */
export function useGenerateFinancialWordReport() {
  return useMutation({
    mutationFn: async ({ 
      transactions, 
      statistics, 
      filters, 
      filename 
    }: { 
      transactions: FinancialTransaction[]
      statistics: FinancialStatistics
      filters: FinancialReportFilters
      filename?: string 
    }) => {
      await reportGeneratorService.generateFinancialWordReport(transactions, statistics, filters, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório financeiro Word gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório financeiro Word')
      console.error('Erro ao gerar relatório financeiro Word:', error)
    },
  })
}

/**
 * Hook para gerar relatório PDF local usando jsPDF
 */
export function useGenerateFinancialPDFReport() {
  return useMutation({
    mutationFn: async ({ 
      transactions, 
      statistics, 
      filters, 
      filename 
    }: { 
      transactions: FinancialTransaction[]
      statistics: FinancialStatistics
      filters: FinancialReportFilters
      filename?: string 
    }) => {
      reportGeneratorService.generateFinancialPDFReport(transactions, statistics, filters, filename)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Relatório financeiro PDF gerado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao gerar relatório financeiro PDF')
      console.error('Erro ao gerar relatório financeiro PDF:', error)
    },
  })
}

// ===============================
// HOOKS COMPOSTOS E UTILITÁRIOS
// ===============================

/**
 * Hook composto que gerencia estado completo de relatórios financeiros
 */
export function useFinancialReportsManager(params: UseFinancialReportsParams = {}) {
  const transactionsQuery = useFinancialTransactions(params)
  const statisticsQuery = useFinancialStatistics({ filters: params.filters })
  // Nesta aplicação, as opções de filtros financeiros vêm de outros hooks
  // (anos lectivos, classes, cursos). Evitamos buscar /filter-options aqui
  // para reduzir requisições desnecessárias.
  const filterOptionsQuery = useFinancialFilterOptions(false)
  
  const generateReportMutation = useGenerateFinancialReport()
  const exportReportMutation = useExportFinancialReport()
  const generateWordReportMutation = useGenerateFinancialWordReport()
  const generatePDFReportMutation = useGenerateFinancialPDFReport()

  return {
    // Dados
    transactions: transactionsQuery.data?.transactions || [],
    pagination: transactionsQuery.data?.pagination,
    statistics: statisticsQuery.data,
    filterOptions: filterOptionsQuery.data,
    
    // Estados de loading
    isLoadingTransactions: transactionsQuery.isLoading,
    isLoadingStatistics: statisticsQuery.isLoading,
    isLoadingFilterOptions: filterOptionsQuery.isLoading,
    isGeneratingReport: generateReportMutation.isPending,
    isExportingReport: exportReportMutation.isPending,
    isGeneratingWordReport: generateWordReportMutation.isPending,
    isGeneratingPDFReport: generatePDFReportMutation.isPending,
    
    // Estados de erro
    transactionsError: transactionsQuery.error,
    statisticsError: statisticsQuery.error,
    filterOptionsError: filterOptionsQuery.error,
    
    // Ações
    generateReport: generateReportMutation.mutate,
    exportReport: exportReportMutation.mutate,
    generateWordReport: generateWordReportMutation.mutate,
    generatePDFReport: generatePDFReportMutation.mutate,
    
    // Refetch functions
    refetchTransactions: transactionsQuery.refetch,
    refetchStatistics: statisticsQuery.refetch,
    refetchFilterOptions: filterOptionsQuery.refetch,
  }
}

/**
 * Hook para invalidar cache de relatórios financeiros
 */
export function useInvalidateFinancialReportsCache() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: financialReportsKeys.all })
    },
    invalidateTransactions: () => {
      queryClient.invalidateQueries({ queryKey: financialReportsKeys.transactions() })
    },
    invalidateStatistics: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'financial-reports' && 
          query.queryKey[1] === 'statistics'
      })
    },
    invalidateFilterOptions: () => {
      queryClient.invalidateQueries({ queryKey: financialReportsKeys.filterOptions() })
    },
  }
}

// ===============================
// UTILITÁRIOS
// ===============================

/**
 * Função utilitária para validar filtros de data
 */
export function validateFinancialDateFilters(dateFrom?: string, dateTo?: string): boolean {
  return financialReportsService.validateDateRange(dateFrom, dateTo)
}

/**
 * Função utilitária para formatar filtros para exibição
 */
export function formatFinancialFiltersDisplay(filters: FinancialReportFilters): Record<string, string> {
  return financialReportsService.formatFiltersForDisplay(filters)
}
