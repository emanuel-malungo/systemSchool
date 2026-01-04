import api from "../utils/api.utils"
import type { IClass, IClassInput } from "../types/class.types"

/**
 * Parâmetros de paginação e filtros para classes
 */
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
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
 * Resposta paginada de classes
 */
export interface PaginatedClassResponse extends ApiResponse<IClass[]> {
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
 * Estatísticas de classes
 */
export interface IClassStatistics {
  totalClasses: number
  classesAtivas: number
  classesInativas: number
  classesComExame: number
  classesSemExame: number
}

/**
 * Service para gerenciamento de classes
 * Implementa todas as operações CRUD e validações
 */
class ClassService {
  private readonly baseURL = '/api/academic-management/classes'

  /**
   * Cria uma nova classe
   * @param payload - Dados da nova classe
   * @returns Promise com dados da classe criada
   */
  async createClass(payload: IClassInput): Promise<ApiResponse<IClass>> {
    try {
      const response = await api.post<ApiResponse<IClass>>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar classe:', error)
      throw error
    }
  }

  /**
   * Busca todas as classes sem paginação (para selects)
   * @param search - Termo de busca opcional
   * @returns Promise com lista completa de classes
   */
  async getAllClasses(search = ''): Promise<ApiResponse<IClass[]>> {
    try {
      const response = await api.get<ApiResponse<IClass[]>>(`${this.baseURL}/complete`, {
        params: { search }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todas as classes:', error)
      throw error
    }
  }

  /**
   * Busca classes com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de classes
   */
  async getClasses(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedClassResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.status && params.status !== 'all') queryParams.append('status', params.status)

      const response = await api.get<PaginatedClassResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar classes:', error)
      throw error
    }
  }

  /**
   * Busca uma classe específica por ID
   * @param id - ID da classe
   * @returns Promise com dados da classe
   */
  async getClassById(id: number): Promise<ApiResponse<IClass>> {
    try {
      const response = await api.get<ApiResponse<IClass>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar classe ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma classe existente
   * @param id - ID da classe
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da classe atualizada
   */
  async updateClass(id: number, payload: Partial<IClassInput>): Promise<ApiResponse<IClass>> {
    try {
      const response = await api.put<ApiResponse<IClass>>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar classe ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza o status da classe
   * @param id - ID da classe
   * @param status - Novo status (0 = Inativo, 1 = Ativo)
   * @returns Promise com dados da classe atualizada
   */
  async updateClassStatus(id: number, status: number): Promise<ApiResponse<IClass>> {
    try {
      const response = await api.patch<ApiResponse<IClass>>(
        `${this.baseURL}/${id}/status`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar status da classe ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma classe permanentemente
   * @param id - ID da classe
   * @returns Promise com mensagem de sucesso
   */
  async deleteClass(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar classe ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca estatísticas de classes
   * @param filters - Filtros opcionais (status)
   * @returns Promise com estatísticas
   */
  async getClassStatistics(
    filters: { status?: string } = {}
  ): Promise<ApiResponse<IClassStatistics>> {
    try {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }

      const queryString = params.toString()
      const url = `${this.baseURL}/stats${queryString ? `?${queryString}` : ''}`

      const response = await api.get<ApiResponse<IClassStatistics>>(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de classes:', error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new ClassService()