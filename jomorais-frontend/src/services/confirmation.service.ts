import api from "../utils/api.utils"
import type {
  IConfirmation,
  IConfirmationInput,
  IConfirmationListResponse,
  IConfirmationStatistics,
  IPagination,
} from "../types/confirmation.types"

// Tipos auxiliares
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string | null
  anoLectivo?: string | null
}

/**
 * Service para gerenciamento de confirmações de matrícula
 * Implementa todas as operações CRUD, batch e estatísticas
 */
class ConfirmationService {
  private readonly baseUrl = "/api/student-management/confirmacoes"
  private readonly statisticsUrl = "/api/student-management/statistics/confirmacoes"

  /**
   * Cria uma nova confirmação
   * @param payload - Dados da confirmação
   * @returns Promise com dados da confirmação criada
   */
  async createConfirmation(payload: IConfirmationInput): Promise<ApiResponse<IConfirmation>> {
    try {
      const response = await api.post<ApiResponse<IConfirmation>>(this.baseUrl, payload)
      return response.data
    } catch (error) {
      console.error("Erro ao criar confirmação:", error)
      throw error
    }
  }

  /**
   * Busca todas as confirmações com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de confirmações
   */
  async getConfirmations(params: PaginationParams = { page: 1, limit: 10 }): Promise<IConfirmationListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) {
        queryParams.append("search", params.search)
      }
      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status)
      }
      if (params.anoLectivo && params.anoLectivo !== "all") {
        queryParams.append("anoLectivo", params.anoLectivo)
      }

      interface ConfirmationApiResponse {
        success: boolean
        message: string
        data: IConfirmation[]
        pagination: IPagination
      }

      const response = await api.get<ConfirmationApiResponse>(
        `${this.baseUrl}?${queryParams.toString()}`
      )
      
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error("Erro ao buscar confirmações:", error)
      throw error
    }
  }

  /**
   * Busca uma confirmação pelo ID
   * @param id - ID da confirmação
   * @returns Promise com dados da confirmação
   */
  async getConfirmationById(id: number): Promise<ApiResponse<IConfirmation>> {
    try {
      const response = await api.get<ApiResponse<IConfirmation>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar confirmação ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma confirmação existente
   * @param id - ID da confirmação
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da confirmação atualizada
   */
  async updateConfirmation(
    id: number,
    payload: Partial<IConfirmationInput>
  ): Promise<ApiResponse<IConfirmation>> {
    try {
      const response = await api.put<ApiResponse<IConfirmation>>(
        `${this.baseUrl}/${id}`,
        payload
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar confirmação ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma confirmação
   * @param id - ID da confirmação
   * @returns Promise com mensagem de sucesso
   */
  async deleteConfirmation(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar confirmação ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria múltiplas confirmações em lote
   * @param payload - Array de dados de confirmações
   * @returns Promise com lista de confirmações criadas
   */
  async batchConfirmation(
    payload: IConfirmationInput[]
  ): Promise<ApiResponse<IConfirmation[]>> {
    try {
      const response = await api.post<ApiResponse<IConfirmation[]>>(
        `${this.baseUrl}/batch`,
        { confirmacoes: payload }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar confirmações em lote:", error)
      throw error
    }
  }

  /**
   * Busca confirmações por turma e ano letivo
   * @param turmaId - ID da turma
   * @param anoLectivoId - ID do ano letivo
   * @returns Promise com lista de confirmações
   */
  async getConfirmationsByClassAndYear(
    turmaId: number,
    anoLectivoId: number
  ): Promise<ApiResponse<IConfirmation[]>> {
    try {
      const response = await api.get<ApiResponse<IConfirmation[]>>(
        `${this.baseUrl}/turma/${turmaId}/ano/${anoLectivoId}`
      )
      return response.data
    } catch (error) {
      console.error(
        `Erro ao buscar confirmações da turma ${turmaId} e ano ${anoLectivoId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Busca estatísticas das confirmações
   * @param filters - Filtros de status e ano letivo
   * @returns Promise com estatísticas
   */
  async getConfirmationsStatistics(
    filters: { status?: string | null; anoLectivo?: string | null } = {}
  ): Promise<IConfirmationStatistics> {
    try {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status)
      }
      if (filters.anoLectivo && filters.anoLectivo !== "all") {
        params.append("anoLectivo", filters.anoLectivo)
      }

      const queryString = params.toString()
      const url = `${this.statisticsUrl}${queryString ? `?${queryString}` : ""}`

      const response = await api.get<ApiResponse<IConfirmationStatistics>>(url)
      return response.data.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas de confirmações:", error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new ConfirmationService()