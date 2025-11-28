import api from '../utils/api.utils'
import type { Profession, ApiResponse } from '../types/profession.types'

/**
 * Service para gerenciamento de profissões
 * Singleton pattern para melhor performance e cache de dados
 */
class ProfessionService {
  private static instance: ProfessionService
  private baseURL = '/api/institutional/profissoes'

  private constructor() {}

  /**
   * Obtém a instância única do serviço
   */
  static getInstance(): ProfessionService {
    if (!ProfessionService.instance) {
      ProfessionService.instance = new ProfessionService()
    }
    return ProfessionService.instance
  }

  /**
   * Busca todas as profissões
   * @returns Promise com a lista de profissões ordenadas por designação
   */
  async getAllProfessions(): Promise<Profession[]> {
    try {
      const response = await api.get<ApiResponse<Profession[]>>(this.baseURL)
      
      if (response.data?.success) {
        return response.data.data
      }
      
      // Fallback para APIs que retornam array direto
      if (Array.isArray(response.data)) {
        return response.data
      }
      
      throw new Error('Erro ao buscar profissões')
    } catch (error) {
      console.error('Erro ao buscar profissões:', error)
      throw error
    }
  }

  /**
   * Busca profissão por ID
   * @param id - Código da profissão
   * @returns Promise com os dados da profissão
   */
  async getProfessionById(id: number): Promise<Profession> {
    try {
      const response = await api.get<ApiResponse<Profession>>(`${this.baseURL}/${id}`)
      
      if (response.data?.success) {
        return response.data.data
      }
      
      // Fallback para APIs que retornam objeto direto
      if (response.data && 'codigo' in response.data && 'designacao' in response.data) {
        return response.data as unknown as Profession
      }
      
      throw new Error('Erro ao buscar profissão')
    } catch (error) {
      console.error(`Erro ao buscar profissão com ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca profissões por termo de busca
   * @param searchTerm - Termo para buscar na designação
   * @returns Promise com lista filtrada de profissões
   */
  async searchProfessions(searchTerm: string): Promise<Profession[]> {
    try {
      const allProfessions = await this.getAllProfessions()
      
      if (!searchTerm.trim()) {
        return allProfessions
      }

      const term = searchTerm.toLowerCase()
      return allProfessions.filter(profession => 
        profession.designacao.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Erro ao buscar profissões:', error)
      throw error
    }
  }
}

// Exportar instância única
export default ProfessionService.getInstance()
