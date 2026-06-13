import api from '../utils/api.utils'
import type { ApiResponse } from '../types/course.types'

interface IDisciplina {
  codigo: number
  designacao: string
}

class DisciplinaService {
  private readonly baseURL = '/api/academic-management/disciplinas'

  // Buscar TODAS as disciplinas (sem paginação) - para usar em selects
  async getAllDisciplinas(): Promise<ApiResponse<IDisciplina[]>> {
    try {
      const response = await api.get<ApiResponse<IDisciplina[]>>(
        `${this.baseURL}/todas`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      throw error
    }
  }

  // Buscar disciplinas com paginação (para tabelas)
  async getDisciplinas(page: number = 1, limit: number = 10, search: string = ''): Promise<ApiResponse<IDisciplina[]>> {
    try {
      const response = await api.get<ApiResponse<IDisciplina[]>>(
        this.baseURL,
        {
          params: { page, limit, search }
        }
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      throw error
    }
  }

  // Buscar disciplina por ID
  async getDisciplinaById(id: number): Promise<ApiResponse<IDisciplina>> {
    try {
      const response = await api.get<ApiResponse<IDisciplina>>(
        `${this.baseURL}/${id}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplina:', error)
      throw error
    }
  }

  // Buscar disciplinas por curso
  async getDisciplinasByCurso(cursoId: number): Promise<ApiResponse<IDisciplina[]>> {
    try {
      const response = await api.get<ApiResponse<IDisciplina[]>>(
        `${this.baseURL}/curso/${cursoId}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar disciplinas por curso:', error)
      throw error
    }
  }
}

export default new DisciplinaService()
export type { IDisciplina }
