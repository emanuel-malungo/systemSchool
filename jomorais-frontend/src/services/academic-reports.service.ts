import api from '../utils/api.utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type {
  AcademicReportFilters,
  AcademicStudentsApiResponse,
  AcademicStatisticsApiResponse,
  AcademicFilterOptionsApiResponse,
  ClassPerformanceApiResponse,
  TeacherPerformanceApiResponse,
  GenerateAcademicReportRequest,
  UseAcademicReportsParams
} from '../types/academic-reports.types'

/**
 * Service para gerenciamento de relatórios acadêmicos
 * Implementa todas as operações de busca, estatísticas e geração de relatórios
 */
class AcademicReportsService {
  private readonly baseUrl = '/api/academic-management/reports'

  /**
   * Busca dados acadêmicos dos alunos com filtros e paginação
   */
  async getAcademicStudentData(params: UseAcademicReportsParams): Promise<AcademicStudentsApiResponse> {
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
        if (filters.turma) {
          queryParams.append('turma', filters.turma)
        }
        if (filters.disciplina) {
          queryParams.append('disciplina', filters.disciplina)
        }
        if (filters.professor) {
          queryParams.append('professor', filters.professor)
        }
        if (filters.periodo) {
          queryParams.append('periodo', filters.periodo)
        }
        if (filters.trimestre && filters.trimestre !== 'todos') {
          queryParams.append('trimestre', filters.trimestre)
        }
        if (filters.statusAluno && filters.statusAluno !== 'todos') {
          queryParams.append('statusAluno', filters.statusAluno)
        }
        if (filters.tipoRelatorio && filters.tipoRelatorio !== 'todos') {
          queryParams.append('tipoRelatorio', filters.tipoRelatorio)
        }
        if (filters.dataInicio) {
          queryParams.append('dataInicio', filters.dataInicio)
        }
        if (filters.dataFim) {
          queryParams.append('dataFim', filters.dataFim)
        }
      }

      const response = await api.get<AcademicStudentsApiResponse>(
        `${this.baseUrl}/students?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar dados acadêmicos dos alunos:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas acadêmicas com filtros
   */
  async getAcademicStatistics(filters: AcademicReportFilters = {}): Promise<AcademicStatisticsApiResponse> {
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
      if (filters.turma) {
        queryParams.append('turma', filters.turma)
      }
      if (filters.disciplina) {
        queryParams.append('disciplina', filters.disciplina)
      }
      if (filters.professor) {
        queryParams.append('professor', filters.professor)
      }
      if (filters.periodo) {
        queryParams.append('periodo', filters.periodo)
      }
      if (filters.trimestre && filters.trimestre !== 'todos') {
        queryParams.append('trimestre', filters.trimestre)
      }
      if (filters.statusAluno && filters.statusAluno !== 'todos') {
        queryParams.append('statusAluno', filters.statusAluno)
      }
      if (filters.tipoRelatorio && filters.tipoRelatorio !== 'todos') {
        queryParams.append('tipoRelatorio', filters.tipoRelatorio)
      }

      const response = await api.get<AcademicStatisticsApiResponse>(
        `${this.baseUrl}/statistics?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas acadêmicas:', error)
      throw error
    }
  }

  /**
   * Busca desempenho por turma/classe
   */
  async getClassPerformance(filters: AcademicReportFilters = {}): Promise<ClassPerformanceApiResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.anoAcademico) {
        queryParams.append('anoAcademico', filters.anoAcademico)
      }
      if (filters.classe) {
        queryParams.append('classe', filters.classe)
      }
      if (filters.curso) {
        queryParams.append('curso', filters.curso)
      }
      if (filters.trimestre && filters.trimestre !== 'todos') {
        queryParams.append('trimestre', filters.trimestre)
      }

      const response = await api.get<ClassPerformanceApiResponse>(
        `${this.baseUrl}/class-performance?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar desempenho por turma:', error)
      throw error
    }
  }

  /**
   * Busca desempenho por professor
   */
  async getTeacherPerformance(filters: AcademicReportFilters = {}): Promise<TeacherPerformanceApiResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.anoAcademico) {
        queryParams.append('anoAcademico', filters.anoAcademico)
      }
      if (filters.professor) {
        queryParams.append('professor', filters.professor)
      }
      if (filters.disciplina) {
        queryParams.append('disciplina', filters.disciplina)
      }
      if (filters.trimestre && filters.trimestre !== 'todos') {
        queryParams.append('trimestre', filters.trimestre)
      }

      const response = await api.get<TeacherPerformanceApiResponse>(
        `${this.baseUrl}/teacher-performance?${queryParams.toString()}`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar desempenho por professor:', error)
      throw error
    }
  }

  /**
   * Busca opções de filtros disponíveis
   */
  async getFilterOptions(): Promise<AcademicFilterOptionsApiResponse> {
    try {
      const response = await api.get<AcademicFilterOptionsApiResponse>(
        `${this.baseUrl}/filter-options`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao buscar opções de filtros acadêmicos:', error)
      throw error
    }
  }

  /**
   * Gera relatório acadêmico no backend
   */
  async generateAcademicReport(request: GenerateAcademicReportRequest): Promise<Blob> {
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
      console.error('Erro ao gerar relatório acadêmico:', error)
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
      console.error('Erro ao exportar relatório acadêmico:', error)
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
  formatFiltersForDisplay(filters: AcademicReportFilters): Record<string, string> {
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
    if (filters.turma) {
      formatted['Turma'] = filters.turma
    }
    if (filters.disciplina) {
      formatted['Disciplina'] = filters.disciplina
    }
    if (filters.professor) {
      formatted['Professor'] = filters.professor
    }
    if (filters.periodo) {
      formatted['Período'] = filters.periodo
    }
    if (filters.trimestre && filters.trimestre !== 'todos') {
      formatted['Trimestre'] = `${filters.trimestre}º Trimestre`
    }
    if (filters.statusAluno && filters.statusAluno !== 'todos') {
      formatted['Status do Aluno'] = filters.statusAluno
    }
    if (filters.tipoRelatorio && filters.tipoRelatorio !== 'todos') {
      formatted['Tipo de Relatório'] = filters.tipoRelatorio
    }
    if (filters.dataInicio) {
      formatted['Data Início'] = format(new Date(filters.dataInicio), 'dd/MM/yyyy', { locale: ptBR })
    }
    if (filters.dataFim) {
      formatted['Data Fim'] = format(new Date(filters.dataFim), 'dd/MM/yyyy', { locale: ptBR })
    }
    
    return formatted
  }

  /**
   * Formata nota acadêmica
   */
  formatGrade(grade: number): string {
    return grade.toFixed(1)
  }

  /**
   * Formata percentual
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }

  /**
   * Obtém cor da situação acadêmica
   */
  getSituationColor(situacao: string): string {
    switch (situacao.toLowerCase()) {
      case 'aprovado':
        return 'text-green-600 bg-green-100'
      case 'reprovado':
        return 'text-red-600 bg-red-100'
      case 'recuperacao':
        return 'text-yellow-600 bg-yellow-100'
      case 'pendente':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * Classifica nota acadêmica
   */
  classifyGrade(grade: number): { label: string; color: string } {
    if (grade >= 17) {
      return { label: 'Excelente', color: 'text-green-600' }
    } else if (grade >= 14) {
      return { label: 'Bom', color: 'text-blue-600' }
    } else if (grade >= 10) {
      return { label: 'Suficiente', color: 'text-yellow-600' }
    } else {
      return { label: 'Insuficiente', color: 'text-red-600' }
    }
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

export default new AcademicReportsService()
