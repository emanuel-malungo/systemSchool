import api from '../utils/api.utils'
import type {
  IDiretorTurmaInput,
  IDiretorTurmaResponse,
  IDiretorTurmaListResponse,
  IDiretorTurmaActionResponse
} from '../types/directorTurma.types'

/**
 * Parâmetros de paginação e filtros para diretores de turma
 */
export interface DirectorTurmaPaginationParams {
  page?: number
  limit?: number
  search?: string
  codigoAnoLectivo?: number
  codigoTurma?: number
  codigoDocente?: number
}

/**
 * Service para gerenciamento de Diretores de Turma
 * Implementa todas as operações CRUD e validações
 * Baseado no padrão do backend: academic-staff/diretores-turmas
 */
class DirectorTurmaService {
  private readonly baseURL = '/api/academic-staff/diretores-turmas'

  /**
   * Busca todos os diretores de turma com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de diretores de turma
   */
  async getDiretoresTurma(
    params: DirectorTurmaPaginationParams = { page: 1, limit: 10 }
  ): Promise<IDiretorTurmaListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.codigoAnoLectivo) queryParams.append('codigoAnoLectivo', params.codigoAnoLectivo.toString())
      if (params.codigoTurma) queryParams.append('codigoTurma', params.codigoTurma.toString())
      if (params.codigoDocente) queryParams.append('codigoDocente', params.codigoDocente.toString())

      const response = await api.get<IDiretorTurmaListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar diretores de turma:', error)
      throw error
    }
  }

  /**
   * Busca todos os diretores de turma sem paginação (para selects)
   * Útil para dropdowns e componentes de seleção
   * @param search - Termo de busca opcional
   * @returns Promise com lista completa de diretores de turma
   */
  async getAllDiretoresTurma(search = ''): Promise<IDiretorTurmaListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', '1')
      queryParams.append('limit', '1000') // Limite alto para pegar todos
      
      if (search) {
        queryParams.append('search', search)
      }

      const response = await api.get<IDiretorTurmaListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todos os diretores de turma:', error)
      throw error
    }
  }

  /**
   * Busca um diretor de turma específico por ID
   * @param id - Código do diretor de turma
   * @returns Promise com dados do diretor de turma
   * @throws Error se o diretor de turma não for encontrado
   */
  async getDiretorTurmaById(id: number): Promise<IDiretorTurmaResponse> {
    try {
      const response = await api.get<IDiretorTurmaResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar diretor de turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo diretor de turma
   * @param payload - Dados do novo diretor de turma
   * @returns Promise com dados do diretor de turma criado
   * @throws Error se já existir um diretor para a turma no ano letivo
   */
  async createDiretorTurma(payload: IDiretorTurmaInput): Promise<IDiretorTurmaActionResponse> {
    try {
      const response = await api.post<IDiretorTurmaActionResponse>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar diretor de turma:', error)
      throw error
    }
  }

  /**
   * Atualiza um diretor de turma existente
   * @param id - Código do diretor de turma
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados do diretor de turma atualizado
   * @throws Error se o diretor de turma não for encontrado
   */
  async updateDiretorTurma(
    id: number,
    payload: Partial<IDiretorTurmaInput>
  ): Promise<IDiretorTurmaActionResponse> {
    try {
      const response = await api.put<IDiretorTurmaActionResponse>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar diretor de turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um diretor de turma permanentemente
   * @param id - Código do diretor de turma
   * @returns Promise com mensagem de sucesso
   * @throws Error se o diretor de turma não for encontrado
   */
  async deleteDiretorTurma(id: number): Promise<IDiretorTurmaActionResponse> {
    try {
      const response = await api.delete<IDiretorTurmaActionResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar diretor de turma ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca diretores de turma por termo de busca
   * @param searchTerm - Termo para buscar
   * @returns Promise com lista de diretores de turma que correspondem à busca
   */
  async searchDiretoresTurma(searchTerm: string): Promise<IDiretorTurmaListResponse> {
    return this.getDiretoresTurma({ page: 1, limit: 50, search: searchTerm })
  }

  /**
   * Busca diretor de uma turma específica
   * @param codigoTurma - Código da turma
   * @returns Promise com lista de diretores da turma
   */
  async getDiretorPorTurma(codigoTurma: number): Promise<IDiretorTurmaListResponse> {
    return this.getDiretoresTurma({ page: 1, limit: 10, codigoTurma })
  }

  /**
   * Busca turmas de um docente como diretor
   * @param codigoDocente - Código do docente
   * @returns Promise com lista de turmas que o docente dirige
   */
  async getTurmasPorDiretor(codigoDocente: number): Promise<IDiretorTurmaListResponse> {
    return this.getDiretoresTurma({ page: 1, limit: 100, codigoDocente })
  }

  /**
   * Busca diretores de turma por ano letivo
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise com lista de diretores do ano letivo
   */
  async getDiretoresPorAnoLectivo(codigoAnoLectivo: number): Promise<IDiretorTurmaListResponse> {
    return this.getDiretoresTurma({ page: 1, limit: 100, codigoAnoLectivo })
  }
}

// Exporta uma instância única do service (Singleton)
export default new DirectorTurmaService()
