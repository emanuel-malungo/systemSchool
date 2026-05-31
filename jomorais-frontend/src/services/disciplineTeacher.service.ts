import api from '../utils/api.utils'
import type { IAtribuicaoCompletaInput } from '../types/disciplineTeacher.types'

/**
 * Service para gerenciamento de Atribuições de Professores (Disciplinas e Turmas)
 * Alinhado com o Junqueira, consumindo os novos endpoints.
 */
class DisciplineTeacherService {
  /**
   * Busca todas as atribuições de disciplinas
   */
  async getProfessorDisciplinas(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/api/professor-disciplinas')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar atribuições de disciplinas:', error)
      throw error
    }
  }

  /**
   * Busca todas as atribuições de turmas
   */
  async getProfessorTurmas(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/api/professor-turmas')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar atribuições de turmas:', error)
      throw error
    }
  }

  /**
   * Busca professores mapeados para minúsculo
   */
  async getProfessoresComplete(search = ''): Promise<{ success: boolean; data: any[] }> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', '1')
      queryParams.append('limit', '1000') // Limite alto para todos
      if (search) {
        queryParams.append('search', search)
      }
      const response = await api.get<{ success: boolean; data: any[] }>(`/api/professores?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar todos os professores:', error)
      throw error
    }
  }

  /**
   * Cria uma atribuição completa (disciplina e opcionalmente turma)
   */
  async createAtribuicaoCompleta(payload: IAtribuicaoCompletaInput): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: any }>('/api/atribuicao-completa', payload)
      return response.data
    } catch (error) {
      console.error('Erro ao criar atribuição completa:', error)
      throw error
    }
  }

  /**
   * Remove uma atribuição de disciplina
   */
  async deleteProfessorDisciplina(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/professor-disciplinas/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar atribuição de disciplina ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove uma atribuição de turma
   */
  async deleteProfessorTurma(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/professor-turmas/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar atribuição de turma ${id}:`, error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new DisciplineTeacherService()
