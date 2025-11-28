import api from "../utils/api.utils"
import type {
  IAnoLectivo,
  IAnoLectivoInput,
  PaginatedAnoLectivoResponse,
  ApiResponse,
  PaginationParams,
} from "../types/anoLectivo.types"

/**
 * Service para gerenciamento de anos letivos
 * Implementa todas as operações CRUD
 */
class AnoLectivoService {
  private readonly baseUrl = "/api/academic-management/anos-lectivos"

  /**
   * Busca todos os anos letivos com paginação
   * @param params - Parâmetros de paginação (page, limit, search)
   * @returns Promise com lista paginada de anos letivos
   */
  async getAnosLectivos(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedAnoLectivoResponse> {
    try {
      const response = await api.get<PaginatedAnoLectivoResponse>(
        this.baseUrl,
        { params }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar anos letivos:", error)
      throw error
    }
  }

  /**
   * Busca um ano letivo pelo ID
   * @param id - ID do ano letivo
   * @returns Promise com dados do ano letivo
   */
  async getAnoLectivoById(id: number): Promise<ApiResponse<IAnoLectivo>> {
    try {
      const response = await api.get<ApiResponse<IAnoLectivo>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar ano letivo ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo ano letivo
   * @param anoLectivoData - Dados do novo ano letivo
   * @returns Promise com dados do ano letivo criado
   */
  async createAnoLectivo(
    anoLectivoData: IAnoLectivoInput
  ): Promise<ApiResponse<IAnoLectivo>> {
    try {
      const response = await api.post<ApiResponse<IAnoLectivo>>(
        this.baseUrl,
        anoLectivoData
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar ano letivo:", error)
      throw error
    }
  }

  /**
   * Atualiza um ano letivo existente
   * @param id - ID do ano letivo
   * @param anoLectivoData - Dados a serem atualizados
   * @returns Promise com dados do ano letivo atualizado
   */
  async updateAnoLectivo(
    id: number,
    anoLectivoData: IAnoLectivoInput
  ): Promise<ApiResponse<IAnoLectivo>> {
    try {
      const response = await api.put<ApiResponse<IAnoLectivo>>(
        `${this.baseUrl}/${id}`,
        anoLectivoData
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar ano letivo ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um ano letivo
   * @param id - ID do ano letivo
   * @returns Promise com mensagem de sucesso
   */
  async deleteAnoLectivo(id: number): Promise<ApiResponse<{ message: string }>> {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
  }

  /**
   * Busca anos letivos por filtros
   * @param filters - Filtros de busca
   * @returns Promise com lista filtrada de anos letivos
   */
  async searchAnosLectivos(
    filters: { search?: string },
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedAnoLectivoResponse> {
    try {
      const response = await api.get<PaginatedAnoLectivoResponse>(
        `${this.baseUrl}/search`,
        { params: { ...params, ...filters } }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar anos letivos:", error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new AnoLectivoService()
