import api from "../utils/api.utils"
import type {
  ReportPaginationParams,
  ReportFilters,
  StudentsReportApiResponse,
  StudentStatisticsApiResponse,
  StudentCompleteDataApiResponse,
  GenerateReportRequest,
  GenerateIndividualReportRequest,
  GeneratedReportApiResponse,
  GeneratedIndividualReportApiResponse,
  FilterOptionsApiResponse,
} from "../types/reports.types"

/**
 * Service para gerenciamento de relatórios
 * Implementa todas as operações de relatórios de alunos
 */
class ReportsService {
  private readonly baseUrl = "/api/reports-management"

  /**
   * Busca alunos para relatórios com filtros e paginação
   * @param params - Parâmetros de filtros e paginação
   * @returns Promise com lista paginada de alunos
   */
  async getStudentsForReport(
    params: ReportPaginationParams = { page: 1, limit: 10 }
  ): Promise<StudentsReportApiResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      // Parâmetros de paginação
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      // Filtros opcionais
      if (params.anoAcademico) {
        queryParams.append("anoAcademico", params.anoAcademico)
      }
      if (params.classe) {
        queryParams.append("classe", params.classe)
      }
      if (params.curso) {
        queryParams.append("curso", params.curso)
      }
      if (params.estado) {
        queryParams.append("estado", params.estado)
      }
      if (params.genero) {
        queryParams.append("genero", params.genero)
      }
      if (params.periodo) {
        queryParams.append("periodo", params.periodo)
      }
      if (params.dataMatriculaFrom) {
        queryParams.append("dataMatriculaFrom", params.dataMatriculaFrom)
      }
      if (params.dataMatriculaTo) {
        queryParams.append("dataMatriculaTo", params.dataMatriculaTo)
      }
      if (params.search) {
        queryParams.append("search", params.search)
      }

      const response = await api.get<StudentsReportApiResponse>(
        `${this.baseUrl}/students?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error("Erro ao buscar alunos para relatório:", error)
      throw error
    }
  }

  /**
   * Busca estatísticas dos alunos com filtros
   * @param filters - Filtros para as estatísticas
   * @returns Promise com estatísticas dos alunos
   */
  async getStudentStatistics(
    filters: ReportFilters = {}
  ): Promise<StudentStatisticsApiResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      // Aplicar filtros
      if (filters.anoAcademico) {
        queryParams.append("anoAcademico", filters.anoAcademico)
      }
      if (filters.classe) {
        queryParams.append("classe", filters.classe)
      }
      if (filters.curso) {
        queryParams.append("curso", filters.curso)
      }
      if (filters.estado) {
        queryParams.append("estado", filters.estado)
      }
      if (filters.genero) {
        queryParams.append("genero", filters.genero)
      }
      if (filters.periodo) {
        queryParams.append("periodo", filters.periodo)
      }

      const response = await api.get<StudentStatisticsApiResponse>(
        `${this.baseUrl}/students/statistics?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas dos alunos:", error)
      throw error
    }
  }

  /**
   * Busca dados completos de um aluno específico
   * @param studentId - ID do aluno
   * @returns Promise com dados completos do aluno
   */
  async getStudentCompleteData(
    studentId: number
  ): Promise<StudentCompleteDataApiResponse> {
    try {
      const response = await api.get<StudentCompleteDataApiResponse>(
        `${this.baseUrl}/students/${studentId}`
      )

      return response.data
    } catch (error) {
      console.error("Erro ao buscar dados completos do aluno:", error)
      throw error
    }
  }

  /**
   * Gera relatório geral de alunos
   * @param request - Configurações do relatório
   * @returns Promise com dados do relatório gerado
   */
  async generateStudentsReport(
    request: GenerateReportRequest
  ): Promise<GeneratedReportApiResponse> {
    try {
      const response = await api.post<GeneratedReportApiResponse>(
        `${this.baseUrl}/students/generate`,
        request
      )

      return response.data
    } catch (error) {
      console.error("Erro ao gerar relatório de alunos:", error)
      throw error
    }
  }

  /**
   * Gera relatório individual de aluno
   * @param studentId - ID do aluno
   * @param request - Configurações do relatório
   * @returns Promise com dados do relatório individual gerado
   */
  async generateIndividualStudentReport(
    studentId: number,
    request: GenerateIndividualReportRequest
  ): Promise<GeneratedIndividualReportApiResponse> {
    try {
      const response = await api.post<GeneratedIndividualReportApiResponse>(
        `${this.baseUrl}/students/${studentId}/generate`,
        request
      )

      return response.data
    } catch (error) {
      console.error("Erro ao gerar relatório individual do aluno:", error)
      throw error
    }
  }

  /**
   * Busca opções disponíveis para filtros
   * @returns Promise com opções de filtros
   */
  async getFilterOptions(): Promise<FilterOptionsApiResponse> {
    try {
      const response = await api.get<FilterOptionsApiResponse>(
        `${this.baseUrl}/filter-options`
      )

      return response.data
    } catch (error) {
      console.error("Erro ao buscar opções de filtros:", error)
      throw error
    }
  }

  /**
   * Exporta relatório em formato específico (futuro)
   * @param format - Formato do arquivo (pdf, excel, word)
   * @param data - Dados para exportação
   * @returns Promise com arquivo gerado
   */
  async exportReport(
    format: 'pdf' | 'excel' | 'word',
    data: any
  ): Promise<Blob> {
    try {
      // Por enquanto, simular exportação
      // Futuramente, implementar geração real de arquivos
      const response = await api.post(
        `${this.baseUrl}/export/${format}`,
        data,
        {
          responseType: 'blob'
        }
      )

      return response.data
    } catch (error) {
      console.error(`Erro ao exportar relatório em ${format}:`, error)
      throw error
    }
  }

  /**
   * Baixa arquivo de relatório gerado
   * @param filename - Nome do arquivo
   * @param blob - Dados do arquivo
   */
  downloadReport(filename: string, blob: Blob): void {
    try {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar relatório:", error)
      throw error
    }
  }

  /**
   * Valida filtros de data
   * @param dateFrom - Data inicial
   * @param dateTo - Data final
   * @returns Verdadeiro se as datas são válidas
   */
  validateDateRange(dateFrom?: string, dateTo?: string): boolean {
    if (!dateFrom || !dateTo) return true
    
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    
    return from <= to
  }

  /**
   * Formata filtros para exibição
   * @param filters - Filtros aplicados
   * @returns Objeto com filtros formatados
   */
  formatFiltersForDisplay(filters: ReportFilters): Record<string, string> {
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
    if (filters.estado) {
      formatted['Estado'] = filters.estado
    }
    if (filters.genero) {
      formatted['Género'] = filters.genero === 'M' ? 'Masculino' : 'Feminino'
    }
    if (filters.periodo) {
      formatted['Período'] = filters.periodo
    }
    if (filters.dataMatriculaFrom) {
      formatted['Data Matrícula (De)'] = new Date(filters.dataMatriculaFrom).toLocaleDateString('pt-AO')
    }
    if (filters.dataMatriculaTo) {
      formatted['Data Matrícula (Até)'] = new Date(filters.dataMatriculaTo).toLocaleDateString('pt-AO')
    }
    if (filters.search) {
      formatted['Pesquisa'] = filters.search
    }

    return formatted
  }
}

// Exportar instância única do service
const reportsService = new ReportsService()
export default reportsService
