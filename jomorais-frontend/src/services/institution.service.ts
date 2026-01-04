import api from "../utils/api.utils"
import type {
  IInstitutionInput,
  IInstitutionResponse,
  IInstitutionListResponse,
  ApiResponse,
} from "../types/institution.types"

/**
 * Service para gerenciamento de dados institucionais
 * Implementa todas as operações CRUD e upload de logo
 */
class InstitutionService {
  private readonly baseUrl = "/api/institutional/dados-instituicao"
  private readonly managementUrl = "/api/institutional-management/dados-instituicao"
  private readonly logoUrl = "/api/settings-management/instituicao/logo"

  /**
   * Busca todos os dados institucionais
   * @returns Promise com lista de instituições
   */
  async getInstitutions(): Promise<IInstitutionListResponse> {
    try {
      const response = await api.get<IInstitutionListResponse>(this.baseUrl)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar dados institucionais:", error)
      throw error
    }
  }

  /**
   * Busca dados principais da instituição (primeiro registro)
   * @returns Promise com dados da instituição principal
   */
  async getInstitutionPrincipal(): Promise<IInstitutionResponse> {
    try {
      const response = await api.get<IInstitutionListResponse>(this.baseUrl)
      const data = response.data

      if (data.data && data.data.length > 0) {
        return {
          success: data.success,
          message: data.message,
          data: data.data[0],
        }
      }

      throw new Error("Nenhum dado institucional encontrado")
    } catch (error) {
      console.error("Erro ao buscar dados principais da instituição:", error)
      throw error
    }
  }

  /**
   * Busca dados institucionais por ID
   * @param id - ID da instituição
   * @returns Promise com dados da instituição
   */
  async getInstitutionById(id: number): Promise<IInstitutionResponse> {
    try {
      const response = await api.get<IInstitutionResponse>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar instituição ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria novos dados institucionais
   * @param institutionData - Dados da instituição
   * @returns Promise com dados da instituição criada
   */
  async createInstitution(
    institutionData: IInstitutionInput
  ): Promise<IInstitutionResponse> {
    try {
      const response = await api.post<IInstitutionResponse>(
        this.managementUrl,
        institutionData
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar dados institucionais:", error)
      throw error
    }
  }

  /**
   * Atualiza dados institucionais existentes
   * @param id - ID da instituição
   * @param institutionData - Dados a serem atualizados
   * @returns Promise com dados da instituição atualizada
   */
  async updateInstitution(
    id: number,
    institutionData: IInstitutionInput
  ): Promise<IInstitutionResponse> {
    try {
      const response = await api.put<IInstitutionResponse>(
        `${this.managementUrl}/${id}`,
        institutionData
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar instituição ${id}:`, error)
      throw error
    }
  }

  /**
   * Faz upload do logo da instituição
   * @param file - Arquivo de imagem do logo
   * @returns Promise com URL do logo
   */
  async uploadLogo(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData()
      formData.append("logo", file)

      const response = await api.post<ApiResponse<{ url: string }>>(
        this.logoUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error)
      throw error
    }
  }

  /**
   * Deleta dados institucionais
   * @param id - ID da instituição
   * @returns Promise com mensagem de sucesso
   */
  async deleteInstitution(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.managementUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar instituição ${id}:`, error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new InstitutionService()
