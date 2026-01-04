import api from '../utils/api.utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type {
  FinancialReportFilters,
  FinancialTransactionsApiResponse,
  FinancialStatisticsApiResponse,
  FinancialFilterOptionsApiResponse,
  GenerateFinancialReportRequest,
  UseFinancialReportsParams
} from '../types/financial-reports.types'

/**
 * Service para gerenciamento de relatórios financeiros
 * Implementa todas as operações de busca, estatísticas e geração de relatórios
 */
class FinancialReportsService {
  private readonly baseUrl = '/api/financial-management/reports'

  /**
   * Busca transações financeiras com filtros e paginação
   */
  async getFinancialTransactions(params: UseFinancialReportsParams): Promise<FinancialTransactionsApiResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      // Parâmetros de paginação
      queryParams.append('page', (params.page || 1).toString())
      queryParams.append('limit', (params.limit || 10).toString())
      
      // Aplicar filtros se existirem
      if (params.filters) {
        const { filters } = params
        
        if (filters.anoAcademico) {
          queryParams.append('anoAcademico', filters.anoAcademico)
        }
        if (filters.classe) {
          queryParams.append('classe', filters.classe)
        }
        if (filters.curso) {
          queryParams.append('curso', filters.curso)
        }
        if (filters.periodo) {
          queryParams.append('periodo', filters.periodo)
        }
        if (filters.tipoTransacao && filters.tipoTransacao !== 'todos') {
          queryParams.append('tipoTransacao', filters.tipoTransacao)
        }
        if (filters.statusPagamento && filters.statusPagamento !== 'todos') {
          queryParams.append('statusPagamento', filters.statusPagamento)
        }
        if (filters.dataInicio) {
          queryParams.append('dataInicio', filters.dataInicio)
        }
        if (filters.dataFim) {
          queryParams.append('dataFim', filters.dataFim)
        }
        if (filters.valorMinimo && filters.valorMinimo > 0) {
          queryParams.append('valorMinimo', filters.valorMinimo.toString())
        }
        if (filters.valorMaximo && filters.valorMaximo > 0) {
          queryParams.append('valorMaximo', filters.valorMaximo.toString())
        }
      }

      const response = await api.get<FinancialTransactionsApiResponse>(
        `${this.baseUrl}/transactions?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar transações financeiras:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas financeiras com filtros
   */
  async getFinancialStatistics(filters: FinancialReportFilters = {}): Promise<FinancialStatisticsApiResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      // Aplicar filtros
      if (filters.anoAcademico) {
        queryParams.append('anoAcademico', filters.anoAcademico)
      }
      if (filters.classe) {
        queryParams.append('classe', filters.classe)
      }
      if (filters.curso) {
        queryParams.append('curso', filters.curso)
      }
      if (filters.periodo) {
        queryParams.append('periodo', filters.periodo)
      }
      if (filters.tipoTransacao && filters.tipoTransacao !== 'todos') {
        queryParams.append('tipoTransacao', filters.tipoTransacao)
      }
      if (filters.statusPagamento && filters.statusPagamento !== 'todos') {
        queryParams.append('statusPagamento', filters.statusPagamento)
      }
      if (filters.dataInicio) {
        queryParams.append('dataInicio', filters.dataInicio)
      }
      if (filters.dataFim) {
        queryParams.append('dataFim', filters.dataFim)
      }

      const response = await api.get<FinancialStatisticsApiResponse>(
        `${this.baseUrl}/statistics?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas financeiras:', error)
      throw error
    }
  }

  /**
   * Busca opções de filtros disponíveis
   */
  async getFilterOptions(): Promise<FinancialFilterOptionsApiResponse> {
    try {
      const response = await api.get<FinancialFilterOptionsApiResponse>(
        `${this.baseUrl}/filter-options`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar opções de filtros:', error)
      throw error
    }
  }

  /**
   * Gera relatório financeiro no backend
   */
  async generateFinancialReport(request: GenerateFinancialReportRequest): Promise<Blob> {
    try {
      const response = await api.post(
        `${this.baseUrl}/generate`,
        request,
        {
          responseType: 'blob'
        }
      )

      return response.data
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error)
      throw error
    }
  }

  /**
   * Exporta relatório em formato específico
   */
  async exportReport(format: 'pdf' | 'excel' | 'word', data: any): Promise<Blob> {
    try {
      const response = await api.post(
        `${this.baseUrl}/export`,
        { format, data },
        {
          responseType: 'blob'
        }
      )

      return response.data
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      throw error
    }
  }

  /**
   * Faz download de arquivo
   */
  downloadReport(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Valida intervalo de datas
   */
  validateDateRange(dateFrom?: string, dateTo?: string): boolean {
    if (!dateFrom || !dateTo) return true
    
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    
    return startDate <= endDate
  }

  /**
   * Formata filtros para exibição
   */
  formatFiltersForDisplay(filters: FinancialReportFilters): Record<string, string> {
    const formatted: Record<string, string> = {}
    
    if (filters.anoAcademico) {
      formatted['Ano Académico'] = filters.anoAcademico
    }
    if (filters.classe) {
      formatted['Classe'] = filters.classe
    }
    if (filters.curso) {
      formatted['Curso'] = filters.curso
    }
    if (filters.periodo) {
      formatted['Período'] = filters.periodo
    }
    if (filters.tipoTransacao && filters.tipoTransacao !== 'todos') {
      formatted['Tipo de Transação'] = filters.tipoTransacao
    }
    if (filters.statusPagamento && filters.statusPagamento !== 'todos') {
      formatted['Status de Pagamento'] = filters.statusPagamento
    }
    if (filters.dataInicio) {
      formatted['Data Início'] = format(new Date(filters.dataInicio), 'dd/MM/yyyy', { locale: ptBR })
    }
    if (filters.dataFim) {
      formatted['Data Fim'] = format(new Date(filters.dataFim), 'dd/MM/yyyy', { locale: ptBR })
    }
    if (filters.valorMinimo && filters.valorMinimo > 0) {
      formatted['Valor Mínimo'] = `${filters.valorMinimo.toLocaleString('pt-AO')} Kz`
    }
    if (filters.valorMaximo && filters.valorMaximo > 0) {
      formatted['Valor Máximo'] = `${filters.valorMaximo.toLocaleString('pt-AO')} Kz`
    }
    
    return formatted
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return `${value.toLocaleString('pt-AO', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} Kz`
  }

  /**
   * Formata data
   */
  formatDate(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  /**
   * Formata data e hora
   */
  formatDateTime(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }
}

export default new FinancialReportsService()
