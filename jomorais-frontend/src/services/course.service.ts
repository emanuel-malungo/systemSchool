import api from "../utils/api.utils"
import type {
  ICourse,
  ICourseInput,
  ApiResponse,
  PaginationParams,
  PaginatedCourseResponse,
  ICourseStats,
} from "../types/course.types"

/**
 * Service para gerenciamento de cursos
 * Implementa todas as operações CRUD e validações
 */
class CourseService {
  private readonly baseURL = '/api/academic-management/cursos'

  /**
   * Cria um novo curso
   * @param payload - Dados do novo curso
   * @returns Promise com dados do curso criado
   */
  async createCourse(payload: ICourseInput): Promise<ApiResponse<ICourse>> {
    try {
      const response = await api.post<ApiResponse<ICourse>>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar curso:', error)
      throw error
    }
  }

  /**
   * Busca todos os cursos sem paginação (para selects)
   * @param search - Termo de busca opcional
   * @param includeArchived - Incluir cursos arquivados
   * @returns Promise com lista completa de cursos
   */
  async getAllCourses(search = '', includeArchived = false): Promise<ApiResponse<ICourse[]>> {
    try {
      const response = await api.get<ApiResponse<ICourse[]>>(`${this.baseURL}/complete`, {
        params: { search, includeArchived }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todos os cursos:', error)
      throw error
    }
  }

  /**
   * Busca cursos com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de cursos
   */
  async getCourses(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedCourseResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.includeArchived) queryParams.append('includeArchived', 'true')

      const response = await api.get<PaginatedCourseResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar cursos:', error)
      throw error
    }
  }

  /**
   * Busca um curso específico por ID
   * @param id - ID do curso
   * @returns Promise com dados do curso
   */
  async getCourseById(id: number): Promise<ApiResponse<ICourse>> {
    try {
      const response = await api.get<ApiResponse<ICourse>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar curso ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza um curso existente
   * @param id - ID do curso
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados do curso atualizado
   */
  async updateCourse(id: number, payload: Partial<ICourseInput>): Promise<ApiResponse<ICourse>> {
    try {
      const response = await api.put<ApiResponse<ICourse>>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar curso ${id}:`, error)
      throw error
    }
  }

  /**
   * Arquiva um curso
   * @param id - ID do curso
   * @returns Promise com mensagem de sucesso
   */
  async archiveCourse(id: number): Promise<ApiResponse<ICourse>> {
    try {
      const response = await api.patch<ApiResponse<ICourse>>(`${this.baseURL}/${id}/archive`)
      return response.data
    } catch (error) {
      console.error(`Erro ao arquivar curso ${id}:`, error)
      throw error
    }
  }

  /**
   * Restaura um curso arquivado
   * @param id - ID do curso
   * @returns Promise com mensagem de sucesso
   */
  async unarchiveCourse(id: number): Promise<ApiResponse<ICourse>> {
    try {
      const response = await api.patch<ApiResponse<ICourse>>(`${this.baseURL}/${id}/unarchive`)
      return response.data
    } catch (error) {
      console.error(`Erro ao restaurar curso ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca estatísticas de cursos
   * @returns Promise com estatísticas (total, ativos, inativos)
   */
  async getCourseStats(): Promise<ApiResponse<ICourseStats>> {
    try {
      const response = await api.get<ApiResponse<ICourseStats>>(`${this.baseURL}/stats`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de cursos:', error)
      throw error
    }
  }

  /**
   * Deleta um curso permanentemente (apenas para admin)
   * @param id - ID do curso
   * @returns Promise com mensagem de sucesso
   */
  async deleteCourse(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar curso ${id}:`, error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new CourseService()
