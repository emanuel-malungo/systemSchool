import api from "../utils/api.utils"
import type {
  Proveniencia,
  ProvenienciaResponse,
  SingleProvenienciaResponse,
  CreateProvenienciaPayload,
  UpdateProvenienciaPayload,
  ApiResponse,
  PaginationParams,
  PaginatedProvenienciaResponse,
} from "../types/proveniencia.types"

/**
 * Service para gerenciamento de proveniências (escolas de origem)
 * Implementa todas as operações CRUD
 */
class ProvenienciaService {
  private readonly baseUrl = "/api/student-management/proveniencias"

  /**
   * Busca todas as proveniências com paginação e filtros
   * @param params - Parâmetros de paginação e busca
   * @returns Promise com lista paginada de proveniências
   */
  async getAllProveniencias(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedProvenienciaResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) {
        queryParams.append("search", params.search)
      }

      const response = await api.get<ProvenienciaResponse>(
        `${this.baseUrl}?${queryParams.toString()}`
      )

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
        pagination: response.data.pagination || {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: response.data.data.length,
          itemsPerPage: params.limit || 10,
        },
      }
    } catch (error) {
      console.error("Erro ao buscar proveniências:", error)
      throw error
    }
  }

  /**
   * Busca todas as proveniências sem paginação (para selects, etc)
   * @returns Promise com lista completa de proveniências
   */
  async getAllProvenienciasComplete(): Promise<PaginatedProvenienciaResponse> {
    return this.getAllProveniencias({ page: 1, limit: 1000 })
  }

  /**
   * Busca uma proveniência pelo ID
   * @param id - ID da proveniência
   * @returns Promise com dados da proveniência
   */
  async getProvenienciaById(id: number): Promise<ApiResponse<Proveniencia>> {
    try {
      const response = await api.get<SingleProvenienciaResponse>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar proveniência ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria uma nova proveniência
   * @param data - Dados da nova proveniência
   * @returns Promise com dados da proveniência criada
   */
  async createProveniencia(
    data: CreateProvenienciaPayload
  ): Promise<ApiResponse<Proveniencia>> {
    try {
      const response = await api.post<SingleProvenienciaResponse>(
        this.baseUrl,
        data
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar proveniência:", error)
      throw error
    }
  }

  /**
   * Atualiza uma proveniência existente
   * @param id - ID da proveniência
   * @param data - Dados a serem atualizados
   * @returns Promise com dados da proveniência atualizada
   */
  async updateProveniencia(
    id: number,
    data: UpdateProvenienciaPayload
  ): Promise<ApiResponse<Proveniencia>> {
    try {
      const response = await api.put<SingleProvenienciaResponse>(
        `${this.baseUrl}/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar proveniência ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma proveniência
   * @param id - ID da proveniência
   * @returns Promise com mensagem de sucesso
   */
  async deleteProveniencia(
    id: number
  ): Promise<ApiResponse<{ message: string; tipo: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string; tipo: string }>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar proveniência ${id}:`, error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new ProvenienciaService()
