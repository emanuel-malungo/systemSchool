import api from "../utils/api.utils"
import type {
  IMatricula,
  IMatriculaInput,
  IMatriculaListResponse,
  IMatriculaDetailed,
  IMatriculasWithoutConfirmation,
  IBatchResponse,
  IMatriculaStatistics,
  ApiResponse,
  PaginationParams,
  IPagination,
} from "../types/matricula.types"

/**
 * Service para gerenciamento de matrículas
 * Implementa todas as operações CRUD, batch e estatísticas
 */
class MatriculaService {
  private readonly baseUrl = "/api/student-management/matriculas"
  private readonly statisticsUrl = "/api/student-management/statistics/matriculas"

  /**
   * Cria uma nova matrícula
   * @param payload - Dados da matrícula
   * @returns Promise com dados da matrícula criada
   */
  async createMatricula(payload: IMatriculaInput): Promise<ApiResponse<IMatricula>> {
    try {
      const response = await api.post<ApiResponse<IMatricula>>(this.baseUrl, payload)
      return response.data
    } catch (error) {
      console.error("Erro ao criar matrícula:", error)
      throw error
    }
  }

  /**
   * Busca todas as matrículas com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de matrículas
   */
  async getMatriculas(params: PaginationParams = { page: 1, limit: 10 }): Promise<IMatriculaListResponse> {
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
      if (params.curso && params.curso !== "all") {
        queryParams.append("curso", params.curso)
      }

      interface MatriculaApiResponse {
        success: boolean
        message: string
        data: IMatricula[]
        pagination: IPagination
      }

      const response = await api.get<MatriculaApiResponse>(
        `${this.baseUrl}?${queryParams.toString()}`
      )
      // A API retorna { success, message, data: [...], pagination: {...} }
      // Precisamos retornar { data, pagination }
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error("Erro ao buscar matrículas:", error)
      throw error
    }
  }

  /**
   * Busca uma matrícula pelo ID com dados detalhados
   * @param id - ID da matrícula
   * @returns Promise com dados detalhados da matrícula
   */
  async getMatriculaById(id: number): Promise<ApiResponse<IMatriculaDetailed>> {
    try {
      const response = await api.get<ApiResponse<IMatriculaDetailed>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar matrícula ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma matrícula existente
   * @param id - ID da matrícula
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da matrícula atualizada
   */
  async updateMatricula(
    id: number,
    payload: Partial<IMatriculaInput>
  ): Promise<ApiResponse<IMatricula>> {
    try {
      const response = await api.put<ApiResponse<IMatricula>>(
        `${this.baseUrl}/${id}`,
        payload
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar matrícula ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma matrícula
   * @param id - ID da matrícula
   * @returns Promise com mensagem de sucesso
   */
  async deleteMatricula(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar matrícula ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria múltiplas matrículas em lote
   * @param payload - Array de dados de matrículas
   * @returns Promise com resultado do batch
   */
  async batchMatricula(
    payload: IMatriculaInput[]
  ): Promise<ApiResponse<IBatchResponse<IMatricula>>> {
    try {
      const response = await api.post<ApiResponse<IBatchResponse<IMatricula>>>(
        `${this.baseUrl}/batch`,
        { matriculas: payload }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar matrículas em lote:", error)
      throw error
    }
  }

  /**
   * Busca matrículas por ano letivo
   * @param anoLectivoId - ID do ano letivo
   * @returns Promise com lista de matrículas
   */
  async getMatriculasByAnoLectivo(
    anoLectivoId: number
  ): Promise<ApiResponse<IMatricula[]>> {
    try {
      const response = await api.get<ApiResponse<IMatricula[]>>(
        `${this.baseUrl}/ano-lectivo/${anoLectivoId}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar matrículas do ano letivo ${anoLectivoId}:`, error)
      throw error
    }
  }

  /**
   * Busca matrículas sem confirmação
   * @returns Promise com lista de matrículas sem confirmação
   */
  async getMatriculasWithoutConfirmacao(): Promise<
    ApiResponse<IMatriculasWithoutConfirmation[]>
  > {
    try {
      const response = await api.get<ApiResponse<IMatriculasWithoutConfirmation[]>>(
        `${this.baseUrl}/sem-confirmacao`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar matrículas sem confirmação:", error)
      throw error
    }
  }

  /**
   * Busca estatísticas das matrículas
   * @param filters - Filtros de status e curso
   * @returns Promise com estatísticas
   */
  async getMatriculasStatistics(
    filters: { status?: string | null; curso?: string | null } = {}
  ): Promise<IMatriculaStatistics> {
    try {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status)
      }
      if (filters.curso && filters.curso !== "all") {
        params.append("curso", filters.curso)
      }

      const queryString = params.toString()
      const url = `${this.statisticsUrl}${queryString ? `?${queryString}` : ""}`

      const response = await api.get<ApiResponse<IMatriculaStatistics>>(url)
      return response.data.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas de matrículas:", error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new MatriculaService()