import api from "../utils/api.utils"
import type {
  ITransfer,
  ITransferInput,
  ITransferListResponse,
  IPagination,
} from "../types/transfer.types"

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
  motivo?: string | null
}

/**
 * Service para gerenciamento de transferências de alunos
 * Implementa todas as operações CRUD e estatísticas
 */
class TransferService {
  private readonly baseUrl = "/api/student-management/transferencias"
  private readonly statisticsUrl = "/api/student-management/statistics/transferencias"

  /**
   * Cria uma nova transferência
   * @param payload - Dados da transferência
   * @returns Promise com dados da transferência criada
   */
  async createTransfer(payload: ITransferInput): Promise<ApiResponse<ITransfer>> {
    try {
      const response = await api.post<ApiResponse<ITransfer>>(this.baseUrl, payload)
      return response.data
    } catch (error) {
      console.error("Erro ao criar transferência:", error)
      throw error
    }
  }

  /**
   * Busca todas as transferências com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de transferências
   */
  async getTransfers(params: PaginationParams = { page: 1, limit: 10 }): Promise<ITransferListResponse> {
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
      if (params.motivo && params.motivo !== "all") {
        queryParams.append("motivo", params.motivo)
      }

      interface TransferApiResponse {
        success: boolean
        message: string
        data: ITransfer[]
        pagination: IPagination
      }

      const response = await api.get<TransferApiResponse>(
        `${this.baseUrl}?${queryParams.toString()}`
      )
      
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error("Erro ao buscar transferências:", error)
      throw error
    }
  }

  /**
   * Busca uma transferência pelo ID
   * @param id - ID da transferência
   * @returns Promise com dados da transferência
   */
  async getTransferById(id: number): Promise<ApiResponse<ITransfer>> {
    try {
      const response = await api.get<ApiResponse<ITransfer>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar transferência ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma transferência existente
   * @param id - ID da transferência
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da transferência atualizada
   */
  async updateTransfer(
    id: number,
    payload: Partial<ITransferInput>
  ): Promise<ApiResponse<ITransfer>> {
    try {
      const response = await api.put<ApiResponse<ITransfer>>(
        `${this.baseUrl}/${id}`,
        payload
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar transferência ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma transferência
   * @param id - ID da transferência
   * @returns Promise com mensagem de sucesso
   */
  async deleteTransfer(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar transferência ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria múltiplas transferências em lote
   * @param payload - Array de dados de transferências
   * @returns Promise com lista de transferências criadas
   */
  async batchTransfer(
    payload: ITransferInput[]
  ): Promise<ApiResponse<ITransfer[]>> {
    try {
      const response = await api.post<ApiResponse<ITransfer[]>>(
        `${this.baseUrl}/batch`,
        { transferencias: payload }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar transferências em lote:", error)
      throw error
    }
  }

  /**
   * Busca transferências por aluno
   * @param alunoId - ID do aluno
   * @returns Promise com lista de transferências do aluno
   */
  async getTransfersByStudent(
    alunoId: number
  ): Promise<ApiResponse<ITransfer[]>> {
    try {
      const response = await api.get<ApiResponse<ITransfer[]>>(
        `${this.baseUrl}/aluno/${alunoId}`
      )
      return response.data
    } catch (error) {
      console.error(
        `Erro ao buscar transferências do aluno ${alunoId}:`,
        error
      )
      throw error
    }
  }

  /**
   * Busca estatísticas das transferências
   * @param filters - Filtros de motivo e período
   * @returns Promise com estatísticas
   */
  async getTransfersStatistics(
    filters: { motivo?: string | null; startDate?: string; endDate?: string } = {}
  ): Promise<any> {
    try {
      const params = new URLSearchParams()

      if (filters.motivo && filters.motivo !== "all") {
        params.append("motivo", filters.motivo)
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate)
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate)
      }

      const queryString = params.toString()
      const url = `${this.statisticsUrl}${queryString ? `?${queryString}` : ""}`

      const response = await api.get<ApiResponse<any>>(url)
      return response.data.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas de transferências:", error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new TransferService()
