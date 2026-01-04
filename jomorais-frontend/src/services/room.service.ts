import api from "../utils/api.utils"
import type { 
  RoomInput, 
  RoomUpdate,
  SingleRoomResponse,
  RoomListResponse,
  RoomDeleteResponse,
  RoomPaginationParams 
} from "../types/room.types"

/**
 * Service para gerenciamento de Salas de Aula
 * Implementa todas as operações CRUD e validações
 * Baseado no padrão do backend: academic-management/salas
 */
class RoomService {
  private readonly baseURL = '/api/academic-management/salas'

  /**
   * Cria uma nova sala
   * @param payload - Dados da nova sala (designacao)
   * @returns Promise com dados da sala criada
   * @throws Error se já existir uma sala com a mesma designação
   */
  async createRoom(payload: RoomInput): Promise<SingleRoomResponse> {
    try {
      const response = await api.post<SingleRoomResponse>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar sala:', error)
      throw error
    }
  }

  /**
   * Busca todas as salas com paginação e filtros
   * @param params - Parâmetros de paginação e busca
   * @returns Promise com lista paginada de salas
   */
  async getRooms(params: RoomPaginationParams = { page: 1, limit: 10 }): Promise<RoomListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) {
        queryParams.append('search', params.search)
      }

      const response = await api.get<RoomListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar salas:', error)
      throw error
    }
  }

  /**
   * Busca todas as salas sem paginação (para selects)
   * Útil para dropdowns e componentes de seleção
   * @param search - Termo de busca opcional
   * @returns Promise com lista completa de salas
   */
  async getAllRooms(search = ''): Promise<RoomListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', '1')
      queryParams.append('limit', '1000') // Limite alto para pegar todas
      
      if (search) {
        queryParams.append('search', search)
      }

      const response = await api.get<RoomListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todas as salas:', error)
      throw error
    }
  }

  /**
   * Busca uma sala específica por ID
   * @param id - Código da sala
   * @returns Promise com dados da sala
   * @throws Error se a sala não for encontrada
   */
  async getRoomById(id: number): Promise<SingleRoomResponse> {
    try {
      const response = await api.get<SingleRoomResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar sala ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza uma sala existente
   * @param id - Código da sala
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da sala atualizada
   * @throws Error se a sala não for encontrada
   */
  async updateRoom(id: number, payload: RoomUpdate): Promise<SingleRoomResponse> {
    try {
      const response = await api.put<SingleRoomResponse>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar sala ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma sala permanentemente
   * @param id - Código da sala
   * @returns Promise com mensagem de sucesso
   * @throws Error se a sala não for encontrada ou tiver turmas associadas
   */
  async deleteRoom(id: number): Promise<RoomDeleteResponse> {
    try {
      const response = await api.delete<RoomDeleteResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar sala ${id}:`, error)
      throw error
    }
  }

  /**
   * Verifica se uma sala está disponível (não tem turmas associadas)
   * @param id - Código da sala
   * @returns Promise<boolean> - true se disponível, false caso contrário
   */
  async isRoomAvailable(id: number): Promise<boolean> {
    try {
      const response = await this.getRoomById(id)
      // Implementação futura: verificar se há turmas associadas
      return !!response.data
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade da sala ${id}:`, error)
      return false
    }
  }

  /**
   * Busca salas por termo de busca
   * @param searchTerm - Termo para buscar na designação
   * @returns Promise com lista de salas que correspondem à busca
   */
  async searchRooms(searchTerm: string): Promise<RoomListResponse> {
    return this.getRooms({ page: 1, limit: 50, search: searchTerm })
  }
}

// Exporta uma instância única do service (Singleton)
export default new RoomService()
