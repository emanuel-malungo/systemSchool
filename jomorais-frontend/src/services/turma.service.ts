import api from '../utils/api.utils'
import type { ITurma, ITurmaInput } from '../types/turma.types'

/**
 * Parâmetros de paginação e filtros para turmas
 */
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  anoLectivo?: number
  classe?: number
  curso?: number
}

/**
 * Resposta genérica da API
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/**
 * Service para gerenciamento de turmas
 * Implementa todas as operações CRUD e validações
 */
class TurmaService {
  private readonly baseURL = '/api/academic-management/turmas'
  /**
   * Cria uma nova turma
   * @param payload - Dados da nova turma
   * @returns Promise com dados da turma criada
   */
  async createTurma(payload: ITurmaInput): Promise<ApiResponse<ITurma>> {
    try {
      const response = await api.post<ApiResponse<ITurma>>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      throw error
    }
  }

  /**
   * Busca todas as turmas sem paginação (para selects)
   * @param search - Termo de busca opcional
   * @returns Promise com lista completa de turmas
   */
  async getAllTurmas(search = ''): Promise<ApiResponse<ITurma[]>> {
    try {
      const response = await api.get<ApiResponse<ITurma[]>>(`${this.baseURL}/complete`, {
        params: { search }
      })
	  console.log('Resposta getAllTurmas:', response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todas as turmas:', error)
      throw error
    }
  }

  /**
   * Busca turmas com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de turmas
   */
  async getTurmas(params: PaginationParams = { page: 1, limit: 10 }): Promise<ApiResponse<ITurma[]> & { pagination: any }> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params.anoLectivo) queryParams.append('anoLectivo', params.anoLectivo.toString())
      if (params.classe) queryParams.append('classe', params.classe.toString())
      if (params.curso) queryParams.append('curso', params.curso.toString())

      const response = await api.get<ApiResponse<ITurma[]> & { pagination: any }>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
      throw error
    }
  }

  /**
   * Busca uma turma específica por ID
   * @param id - ID da turma
   * @returns Promise com dados da turma
   */
  async getTurmaById(id: number): Promise<ApiResponse<ITurma>> {
    try {
      const response = await api.get<ApiResponse<ITurma>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma turma existente
   * @param id - ID da turma
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da turma atualizada
   */
  async updateTurma(id: number, payload: Partial<ITurmaInput>): Promise<ApiResponse<ITurma>> {
    try {
      const response = await api.put<ApiResponse<ITurma>>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma turma
   * @param id - ID da turma
   * @returns Promise com mensagem de sucesso
   */
  async deleteTurma(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Valida disponibilidade de sala
   * @param codigoSala - Código da sala
   * @param codigoPeriodo - Código do período
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise com disponibilidade e possíveis conflitos
   */
  async validateSalaDisponibilidade(
    codigoSala: number,
    codigoPeriodo: number,
    codigoAnoLectivo: number
  ): Promise<ApiResponse<{
    disponivel: boolean
    conflitos?: Array<{
      turma: string
      periodo: string
      anoLectivo: string
    }>
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        disponivel: boolean
        conflitos?: Array<{
          turma: string
          periodo: string
          anoLectivo: string
        }>
      }>>(`/api/academic-management/salas/${codigoSala}/disponibilidade`, {
        params: { codigoPeriodo, codigoAnoLectivo }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao validar disponibilidade da sala:', error)
      throw error
    }
  }

  /**
   * Atualiza o status da turma (Ativo/Inativo/Arquivado)
   * @param id - ID da turma
   * @param status - Novo status da turma
   * @returns Promise com dados da turma atualizada
   */
  async updateTurmaStatus(
    id: number,
    status: 'Ativo' | 'Inativo' | 'Arquivado'
  ): Promise<ApiResponse<ITurma>> {
    try {
      const response = await api.patch<ApiResponse<ITurma>>(
        `${this.baseURL}/${id}/status`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar status da turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca alunos de uma turma específica
   * @param turmaId - ID da turma
   * @returns Promise com lista de alunos da turma
   */
  async getAlunosByTurma(turmaId: number): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await api.get<ApiResponse<unknown[]>>(
        `${this.baseURL}/${turmaId}/alunos`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar alunos da turma ${turmaId}:`, error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new TurmaService()
