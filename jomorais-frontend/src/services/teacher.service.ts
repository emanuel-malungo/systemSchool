import api from '../utils/api.utils'
import type { 
  IDocenteInput, 
  IDocenteResponse, 
  IDocenteListResponse,
  IEspecialidadeResponse,
  IDisciplinaDocenteResponse
} from '../types/teacher.types'

/**
 * Parâmetros de paginação e filtros para docentes
 */
export interface TeacherPaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  especialidade?: number
}

/**
 * Service para gerenciamento de Docentes
 * Implementa todas as operações CRUD e validações
 * Baseado no padrão do backend: academic-staff/docentes
 */
class TeacherService {
  private readonly baseURL = '/api/academic-staff/docentes'
  private readonly especialidadesURL = '/api/academic-staff/especialidades'
  private readonly disciplinasDocenteURL = '/api/academic-staff/disciplinas-docente'

  // ===============================
  // DOCENTES - CRUD
  // ===============================

  /**
   * Busca todas as docentes sem paginação (para selects)
   * Útil para dropdowns e componentes de seleção
   * @param search - Termo de busca opcional
   * @returns Promise com lista completa de docentes
   */
  async getAllDocentes(search = ''): Promise<IDocenteListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', '1')
      queryParams.append('limit', '1000') // Limite alto para pegar todos
      
      if (search) {
        queryParams.append('search', search)
      }

      const response = await api.get<IDocenteListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todos os docentes:', error)
      throw error
    }
  }

  /**
   * Busca docentes com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de docentes
   */
  async getDocentes(params: TeacherPaginationParams = { page: 1, limit: 10 }): Promise<IDocenteListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', params.page?.toString() || '1')
      queryParams.append('limit', params.limit?.toString() || '10')
      
      if (params.search) queryParams.append('search', params.search)
      if (params.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params.especialidade) queryParams.append('especialidade', params.especialidade.toString())

      const response = await api.get<IDocenteListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar docentes:', error)
      throw error
    }
  }

  /**
   * Busca um docente específico por ID
   * @param id - Código do docente
   * @returns Promise com dados do docente
   * @throws Error se o docente não for encontrado
   */
  async getDocenteById(id: number): Promise<IDocenteResponse> {
    try {
      const response = await api.get<IDocenteResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar docente ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo docente
   * @param payload - Dados do novo docente
   * @returns Promise com dados do docente criado
   * @throws Error se já existir um docente com o mesmo email
   */
  async createDocente(payload: IDocenteInput): Promise<IDocenteResponse> {
    try {
      const response = await api.post<IDocenteResponse>(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar docente:', error)
      throw error
    }
  }

  /**
   * Atualiza um docente existente
   * @param id - Código do docente
   * @param payload - Dados a serem atualizados
   * @returns Promise com dados do docente atualizado
   * @throws Error se o docente não for encontrado
   */
  async updateDocente(id: number, payload: Partial<IDocenteInput>): Promise<IDocenteResponse> {
    try {
      const response = await api.put<IDocenteResponse>(`${this.baseURL}/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar docente ${id}:`, error)
      throw error
    }
  }

  /**
   * Atualiza o status do docente
   * @param id - Código do docente
   * @param status - Novo status (0 = Inativo, 1 = Ativo)
   * @returns Promise com dados do docente atualizado
   */
  async updateDocenteStatus(id: number, status: number): Promise<IDocenteResponse> {
    try {
      const response = await api.patch<IDocenteResponse>(
        `${this.baseURL}/${id}/status`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar status do docente ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um docente permanentemente
   * @param id - Código do docente
   * @returns Promise com mensagem de sucesso
   * @throws Error se o docente não for encontrado ou tiver dependências
   */
  async deleteDocente(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar docente ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // ESPECIALIDADES
  // ===============================

  /**
   * Busca todas as especialidades
   * @returns Promise com lista de especialidades
   */
  async getEspecialidades(): Promise<IEspecialidadeResponse> {
    try {
      const response = await api.get<IEspecialidadeResponse>(this.especialidadesURL)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error)
      throw error
    }
  }

  /**
   * Busca docentes por especialidade
   * @param especialidadeId - Código da especialidade
   * @returns Promise com lista de docentes
   */
  async getDocentesPorEspecialidade(especialidadeId: number): Promise<IDocenteListResponse> {
    try {
      const response = await api.get<IDocenteListResponse>(
        `${this.baseURL}/especialidade/${especialidadeId}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar docentes da especialidade ${especialidadeId}:`, error)
      throw error
    }
  }

  // ===============================
  // DISCIPLINAS DO DOCENTE
  // ===============================

  /**
   * Busca todas as disciplinas associadas a docentes
   * @returns Promise com lista de disciplinas docente
   */
  async getDisciplinasDocente(): Promise<IDisciplinaDocenteResponse> {
    try {
      const response = await api.get<IDisciplinaDocenteResponse>(this.disciplinasDocenteURL)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplinas docente:', error)
      throw error
    }
  }

  /**
   * Associa uma disciplina a um docente
   * @param data - Dados da associação (docente, curso, disciplina)
   * @returns Promise com mensagem de sucesso
   */
  async createDisciplinaDocente(
    data: { codigoDocente: number; codigoCurso: number; codigoDisciplina: number }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        this.disciplinasDocenteURL,
        data
      )
      return response.data
    } catch (error) {
      console.error('Erro ao criar disciplina docente:', error)
      throw error
    }
  }

  /**
   * Remove a associação de uma disciplina com um docente
   * @param id - Código da associação
   * @returns Promise com mensagem de sucesso
   */
  async deleteDisciplinaDocente(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(
        `${this.disciplinasDocenteURL}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar disciplina docente ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // RELATÓRIOS E CONSULTAS AVANÇADAS
  // ===============================

  /**
   * Busca turmas associadas a um docente
   * @param docenteId - Código do docente
   * @returns Promise com lista de turmas
   */
  async getTurmasPorDocente(docenteId: number): Promise<Record<string, unknown>[]> {
    try {
      const response = await api.get(`${this.baseURL}/${docenteId}/turmas`)
      return response.data.data || []
    } catch (error) {
      console.error(`Erro ao buscar turmas do docente ${docenteId}:`, error)
      throw error
    }
  }

  /**
   * Busca docentes associados a uma turma
   * @param turmaId - Código da turma
   * @returns Promise com lista de docentes
   */
  async getDocentesPorTurma(turmaId: number): Promise<IDocenteListResponse> {
    try {
      const response = await api.get<IDocenteListResponse>(
        `/api/academic-staff/turmas/${turmaId}/docentes`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar docentes da turma ${turmaId}:`, error)
      throw error
    }
  }

  /**
   * Busca relatório acadêmico geral
   * @returns Promise com dados do relatório
   */
  async getRelatorioAcademico(): Promise<Record<string, unknown>> {
    try {
      const response = await api.get('/api/academic-staff/relatorio-academico')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar relatório acadêmico:', error)
      throw error
    }
  }

  /**
   * Busca docentes por termo de busca
   * @param searchTerm - Termo para buscar no nome ou email
   * @returns Promise com lista de docentes que correspondem à busca
   */
  async searchDocentes(searchTerm: string): Promise<IDocenteListResponse> {
    return this.getDocentes({ page: 1, limit: 50, search: searchTerm })
  }
}

// Exporta uma instância única do service (Singleton)
export default new TeacherService()
