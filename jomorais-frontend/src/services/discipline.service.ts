import api from "../utils/api.utils"
import type {
  IDiscipline,
  IDisciplineInput,
  IDisciplineStatistics,
} from "../types/discipline.types"

/**
 * Parâmetros de paginação e filtros para disciplinas
 */
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  codigo_Curso?: number
  cadeiraEspecifica?: number
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
 * Resposta paginada de disciplinas
 */
export interface PaginatedDisciplineResponse extends ApiResponse<IDiscipline[]> {
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage?: boolean
    hasPreviousPage?: boolean
  }
}

/**
 * Service para gerenciamento de disciplinas
 * Implementa todas as operações CRUD e validações
 */
class DisciplineService {
  private readonly baseURL = '/api/academic-management/disciplinas'

  /**
   * Cria uma nova disciplina
   * @param payload - Dados da nova disciplina
   * @returns Promise com dados da disciplina criada
   */
  async createDiscipline(payload: IDisciplineInput): Promise<ApiResponse<IDiscipline>> {
    try {
      const response = await api.post<ApiResponse<IDiscipline>>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar disciplina:', error)
      throw error
    }
  }

  /**
   * Busca todas as disciplinas sem paginação (para selects)
   * @param search - Termo de busca opcional
   * @param codigo_Curso - Filtro por curso
   * @returns Promise com lista completa de disciplinas
   */
  async getAllDisciplines(search = '', codigo_Curso?: number): Promise<ApiResponse<IDiscipline[]>> {
    try {
      const params: Record<string, string | number> = { search }
      if (codigo_Curso) params.codigo_Curso = codigo_Curso

      const response = await api.get<ApiResponse<IDiscipline[]>>(`${this.baseURL}/complete`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todas as disciplinas:', error)
      throw error
    }
  }

  /**
   * Busca disciplinas com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de disciplinas
   */
  async getDisciplines(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedDisciplineResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params.codigo_Curso) queryParams.append('codigo_Curso', params.codigo_Curso.toString())
      if (params.cadeiraEspecifica !== undefined) {
        queryParams.append('cadeiraEspecifica', params.cadeiraEspecifica.toString())
      }

      const response = await api.get<PaginatedDisciplineResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      throw error
    }
  }

  /**
   * Busca uma disciplina específica por ID
   * @param id - ID da disciplina
   * @returns Promise com dados da disciplina
   */
  async getDisciplineById(id: number): Promise<ApiResponse<IDiscipline>> {
    try {
      const response = await api.get<ApiResponse<IDiscipline>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar disciplina ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma disciplina existente
   * @param id - ID da disciplina
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da disciplina atualizada
   */
  async updateDiscipline(id: number, payload: Partial<IDisciplineInput>): Promise<ApiResponse<IDiscipline>> {
    try {
      const response = await api.put<ApiResponse<IDiscipline>>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar disciplina ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza o status da disciplina
   * @param id - ID da disciplina
   * @param status - Novo status (0 = Inativo, 1 = Ativo)
   * @returns Promise com dados da disciplina atualizada
   */
  async updateDisciplineStatus(id: number, status: number): Promise<ApiResponse<IDiscipline>> {
    try {
      const response = await api.patch<ApiResponse<IDiscipline>>(
        `${this.baseURL}/${id}/status`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar status da disciplina ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma disciplina permanentemente
   * @param id - ID da disciplina
   * @returns Promise com mensagem de sucesso
   */
  async deleteDiscipline(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar disciplina ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca estatísticas de disciplinas
   * @param filters - Filtros opcionais (curso, status)
   * @returns Promise com estatísticas
   */
  async getDisciplineStatistics(
    filters: { codigo_Curso?: number; status?: string } = {}
  ): Promise<ApiResponse<IDisciplineStatistics>> {
    try {
      const params = new URLSearchParams()

      if (filters.codigo_Curso) {
        params.append('codigo_Curso', filters.codigo_Curso.toString())
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }

      const queryString = params.toString()
      const url = `${this.baseURL}/stats${queryString ? `?${queryString}` : ''}`

      const response = await api.get<ApiResponse<IDisciplineStatistics>>(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de disciplinas:', error)
      throw error
    }
  }

  /**
   * Busca disciplinas por curso
   * @param codigo_Curso - Código do curso
   * @returns Promise com lista de disciplinas do curso
   */
  async getDisciplinesByCurso(codigo_Curso: number): Promise<ApiResponse<IDiscipline[]>> {
    try {
      const response = await api.get<ApiResponse<IDiscipline[]>>(
        `${this.baseURL}/curso/${codigo_Curso}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar disciplinas do curso ${codigo_Curso}:`, error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new DisciplineService()
