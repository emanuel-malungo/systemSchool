import api from "../utils/api.utils"
import type {
  LegacyUser,
  CreateLegacyUserDTO,
  UpdateLegacyUserDTO,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  UserAccessType,
} from "../types/users.types"
import { mockUserAccessTypesResponse, getUserAccessTypeByCode } from "../mocks/userAccessTypes.mock"

/**
 * Service para gerenciamento de usuários
 * Implementa todas as operações CRUD e funcionalidades adicionais
 */
class UsersService {
  private readonly baseUrl = "/api/users"

  /**
   * Busca todos os usuários legados com paginação
   * @param params - Parâmetros de paginação (page, limit)
   * @returns Promise com lista paginada de usuários
   */
  async getAllUsersLegacy(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<LegacyUser>> {
    try {
      const response = await api.get<PaginatedResponse<LegacyUser>>(
        `${this.baseUrl}/legacy`,
        { params }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar usuários legados:", error)
      throw error
    }
  }

  /**
   * Busca um usuário legado pelo ID
   * @param id - ID do usuário
   * @returns Promise com dados do usuário
   */
  async getUserLegacyById(id: number): Promise<ApiResponse<LegacyUser>> {
    try {
      const response = await api.get<ApiResponse<LegacyUser>>(
        `${this.baseUrl}/legacy/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo usuário legado
   * @param userData - Dados do novo usuário
   * @returns Promise com dados do usuário criado
   */
  async createLegacyUser(
    userData: CreateLegacyUserDTO
  ): Promise<ApiResponse<LegacyUser>> {
    try {
      const response = await api.post<ApiResponse<LegacyUser>>(
        `${this.baseUrl}/legacy`,
        userData
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      throw error
    }
  }

  /**
   * Atualiza um usuário legado existente
   * @param id - ID do usuário
   * @param userData - Dados a serem atualizados
   * @returns Promise com dados do usuário atualizado
   */
  async updateLegacyUser(
    id: number,
    userData: UpdateLegacyUserDTO
  ): Promise<ApiResponse<LegacyUser>> {
    try {
      const response = await api.put<ApiResponse<LegacyUser>>(
        `${this.baseUrl}/legacy/${id}`,
        userData
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um usuário legado (exclusão em cascata)
   * @param id - ID do usuário
   * @returns Promise com mensagem de sucesso
   */
  async deleteLegacyUser(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/legacy/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar usuário ${id}:`, error)
      throw error
    }
  }

  /**
   * Desativa um usuário legado (soft delete)
   * @param id - ID do usuário
   * @returns Promise com dados do usuário desativado
   */
  async deactivateLegacyUser(id: number): Promise<ApiResponse<LegacyUser>> {
    try {
      const response = await api.patch<ApiResponse<LegacyUser>>(
        `${this.baseUrl}/legacy/${id}/deactivate`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao desativar usuário ${id}:`, error)
      throw error
    }
  }

  /**
   * Ativa um usuário legado
   * @param id - ID do usuário
   * @returns Promise com dados do usuário ativado
   */
  async activateLegacyUser(id: number): Promise<ApiResponse<LegacyUser>> {
    try {
      const response = await api.patch<ApiResponse<LegacyUser>>(
        `${this.baseUrl}/legacy/${id}/activate`,
        { estadoActual: "ATIVO" }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao ativar usuário ${id}:`, error)
      throw error
    }
  }

  /**
   * Verifica se um nome de usuário já existe
   * @param username - Nome de usuário a verificar
   * @returns Promise com boolean indicando se existe
   */
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<{ exists: boolean }>>(
        `${this.baseUrl}/legacy/check-username`,
        { params: { username } }
      )
      return response.data.data.exists
    } catch (error) {
      console.error("Erro ao verificar nome de usuário:", error)
      return false
    }
  }

  /**
   * Busca usuários por filtros
   * @param filters - Filtros de busca
   * @returns Promise com lista filtrada de usuários
   */
  async searchUsers(
    filters: { search?: string; estadoActual?: string },
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<LegacyUser>> {
    try {
      const response = await api.get<PaginatedResponse<LegacyUser>>(
        `${this.baseUrl}/legacy/search`,
        { params: { ...params, ...filters } }
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      throw error
    }
  }

  /**
   * Busca todos os tipos de acesso de usuários (MOCK)
   * Atualmente retorna dados mockados, mas pode ser integrado com a API posteriormente
   * @returns Promise com lista de tipos de acesso
   */
  async getUserAccessTypes(): Promise<ApiResponse<UserAccessType[]>> {
    try {
      // Por enquanto retorna mock, mas pode ser substituído por chamada à API:
      // const response = await api.get<ApiResponse<UserAccessType[]>>(`${this.baseUrl}/access-types`)
      // return response.data
      
      return Promise.resolve(mockUserAccessTypesResponse as ApiResponse<UserAccessType[]>)
    } catch (error) {
      console.error("Erro ao buscar tipos de acesso:", error)
      throw error
    }
  }

  /**
   * Busca um tipo de acesso pelo código (MOCK)
   * @param codigo - Código do tipo de acesso
   * @returns Promise com tipo de acesso encontrado
   */
  async getUserAccessTypeByCode(codigo: number): Promise<ApiResponse<UserAccessType | null>> {
    try {
      const accessType = getUserAccessTypeByCode(codigo)
      
      return Promise.resolve({
        success: true,
        message: accessType ? "Tipo de acesso encontrado" : "Tipo de acesso não encontrado",
        data: accessType || null
      })
    } catch (error) {
      console.error("Erro ao buscar tipo de acesso:", error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new UsersService()
