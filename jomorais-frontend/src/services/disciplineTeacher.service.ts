import api from '../utils/api.utils'
import type {
  IDisciplinaDocenteResponse,
  IDisciplinaDocenteInput,
  IDisciplinaDocenteActionResponse
} from '../types/disciplineTeacher.types'

/**
 * Parâmetros de paginação e filtros para disciplinas docente
 */
export interface DisciplineTeacherPaginationParams {
  page?: number
  limit?: number
  search?: string
  codigoDocente?: number
  codigoCurso?: number
  codigoDisciplina?: number
}

/**
 * Interface para estatísticas de disciplinas docente
 */
export interface IDisciplinaDocenteStats {
  success: boolean
  message: string
  data: {
    resumo: {
      totalAtribuicoes: number
      professoresAtivos: number
      cursosUnicos: number
      disciplinasUnicas: number
    }
    rankings: {
      topDocentes: Array<{ codigo: number; nome: string; totalAtribuicoes: number }>
      topCursos: Array<{ codigo: number; nome: string; totalAtribuicoes: number }>
    }
  }
}

/**
 * Service para gerenciamento de Disciplinas do Docente
 * Implementa todas as operações CRUD e validações
 * Baseado no padrão do backend: academic-staff/disciplinas-docente
 */
class DisciplineTeacherService {
  private readonly baseURL = '/api/academic-staff/disciplinas-docente'

  /**
   * Busca todas as disciplinas docente com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de disciplinas docente
   */
  async getDisciplinasDocente(
    params: DisciplineTeacherPaginationParams = { page: 1, limit: 10 }
  ): Promise<IDisciplinaDocenteResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.codigoDocente) queryParams.append('codigoDocente', params.codigoDocente.toString())
      if (params.codigoCurso) queryParams.append('codigoCurso', params.codigoCurso.toString())
      if (params.codigoDisciplina) queryParams.append('codigoDisciplina', params.codigoDisciplina.toString())

      const response = await api.get<IDisciplinaDocenteResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplinas docente:', error)
      throw error
    }
  }

  /**
   * Busca todas as disciplinas docente sem paginação (para selects)
   * Útil para dropdowns e componentes de seleção
   * @param search - Termo de busca opcional
   * @returns Promise com lista completa de disciplinas docente
   */
  async getAllDisciplinasDocente(search = ''): Promise<IDisciplinaDocenteResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', '1')
      queryParams.append('limit', '1000') // Limite alto para pegar todas
      
      if (search) {
        queryParams.append('search', search)
      }

      const response = await api.get<IDisciplinaDocenteResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todas as disciplinas docente:', error)
      throw error
    }
  }

  /**
   * Busca uma disciplina docente específica por ID
   * @param id - Código da disciplina docente
   * @returns Promise com dados da disciplina docente
   * @throws Error se a disciplina docente não for encontrada
   */
  async getDisciplinaDocenteById(id: number): Promise<IDisciplinaDocenteActionResponse> {
    try {
      const response = await api.get<IDisciplinaDocenteActionResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar disciplina docente ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria uma nova associação disciplina-docente
   * @param payload - Dados da nova associação
   * @returns Promise com dados da disciplina docente criada
   * @throws Error se já existir uma associação igual
   */
  async createDisciplinaDocente(payload: IDisciplinaDocenteInput): Promise<IDisciplinaDocenteActionResponse> {
    try {
      const response = await api.post<IDisciplinaDocenteActionResponse>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar disciplina docente:', error)
      throw error
    }
  }

  /**
   * Atualiza uma associação disciplina-docente existente
   * @param id - Código da disciplina docente
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados da disciplina docente atualizada
   * @throws Error se a disciplina docente não for encontrada
   */
  async updateDisciplinaDocente(
    id: number,
    payload: Partial<IDisciplinaDocenteInput>
  ): Promise<IDisciplinaDocenteActionResponse> {
    try {
      const response = await api.put<IDisciplinaDocenteActionResponse>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar disciplina docente ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma associação disciplina-docente permanentemente
   * @param id - Código da disciplina docente
   * @returns Promise com mensagem de sucesso
   * @throws Error se a disciplina docente não for encontrada
   */
  async deleteDisciplinaDocente(id: number): Promise<IDisciplinaDocenteActionResponse> {
    try {
      const response = await api.delete<IDisciplinaDocenteActionResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar disciplina docente ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca estatísticas de disciplinas-docente
   * @returns Promise com estatísticas completas
   */
  async getEstatisticasDisciplinasDocente(): Promise<IDisciplinaDocenteStats> {
    try {
      const response = await api.get<IDisciplinaDocenteStats>(`${this.baseURL}/estatisticas`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de disciplinas docente:', error)
      throw error
    }
  }

  /**
   * Busca disciplinas docente por termo de busca
   * @param searchTerm - Termo para buscar
   * @returns Promise com lista de disciplinas docente que correspondem à busca
   */
  async searchDisciplinasDocente(searchTerm: string): Promise<IDisciplinaDocenteResponse> {
    return this.getDisciplinasDocente({ page: 1, limit: 50, search: searchTerm })
  }

  /**
   * Busca disciplinas de um docente específico
   * @param codigoDocente - Código do docente
   * @returns Promise com lista de disciplinas do docente
   */
  async getDisciplinasPorDocente(codigoDocente: number): Promise<IDisciplinaDocenteResponse> {
    return this.getDisciplinasDocente({ page: 1, limit: 100, codigoDocente })
  }

  /**
   * Busca docentes de uma disciplina específica
   * @param codigoDisciplina - Código da disciplina
   * @returns Promise com lista de docentes da disciplina
   */
  async getDocentesPorDisciplina(codigoDisciplina: number): Promise<IDisciplinaDocenteResponse> {
    return this.getDisciplinasDocente({ page: 1, limit: 100, codigoDisciplina })
  }
}

// Exporta uma instância única do service (Singleton)
export default new DisciplineTeacherService()
