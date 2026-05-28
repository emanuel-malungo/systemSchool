import api from '../utils/api.utils'
import type {
  TipoAvaliacao,
  TipoNota,
  CreateTipoAvaliacaoPayload,
  CreateTipoNotaPayload,
  CreateTipoNotaValorPayload,
  CreatePeriodoAvaliacaoPayload,
  UpdatePeriodoAvaliacaoPayload,
  TipoAvaliacaoResponse,
  TiposAvaliacaoListResponse,
  TipoNotaResponse,
  TiposNotaListResponse,
  TipoNotaValorResponse,
  TiposNotaValorListResponse,
  PeriodoAvaliacaoResponse,
  PeriodosAvaliacaoListResponse,
} from '../types/academic-evaluation.types'

/**
 * Parâmetros de paginação para Academic Evaluation
 */
export interface AcademicEvaluationPaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  tipoNotaId?: number
}

/**
 * Service para gestão de Avaliação Acadêmica
 * Implementa todas as operações CRUD baseado no backend: academic-evaluation.services.js
 */
class AcademicEvaluationService {
  // URLs base
  private readonly tiposAvaliacaoURL = '/api/academic-evaluation/tipos-avaliacao'
  private readonly tiposNotaURL = '/api/academic-evaluation/tipos-nota'
  private readonly tiposNotaValorURL = '/api/academic-evaluation/tipos-nota-valor'
  private readonly periodosAvaliacaoURL = '/api/academic-evaluation/periodos-avaliacao'

  // ===============================
  // TIPOS DE AVALIAÇÃO - CRUD
  // ===============================

  /**
   * Busca tipos de avaliação com paginação e busca
   * @param page - Número da página
   * @param limit - Itens por página
   * @param search - Termo de busca
   * @returns Promise com lista paginada
   */
  async getTiposAvaliacao(page = 1, limit = 10, search = ''): Promise<TiposAvaliacaoListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      if (search) queryParams.append('search', search)

      const response = await api.get<TiposAvaliacaoListResponse>(
        `${this.tiposAvaliacaoURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar tipos de avaliação:', error)
      throw error
    }
  }

  /**
   * Busca um tipo de avaliação específico
   * @param id - Código do tipo
   * @returns Promise com dados do tipo
   */
  async getTipoAvaliacaoById(id: number): Promise<TipoAvaliacaoResponse> {
    try {
      const response = await api.get<TipoAvaliacaoResponse>(`${this.tiposAvaliacaoURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar tipo de avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca tipos de avaliação por tipo
   * @param tipoAvaliacao - Tipo de avaliação
   * @returns Promise com lista de tipos
   */
  async getTiposAvaliacaoPorTipo(tipoAvaliacao: number): Promise<TipoAvaliacao[]> {
    try {
      const response = await api.get<TipoAvaliacao[]>(
        `${this.tiposAvaliacaoURL}/por-tipo/${tipoAvaliacao}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar tipos de avaliação por tipo:', error)
      throw error
    }
  }

  /**
   * Cria novo tipo de avaliação
   * @param data - Dados do tipo
   * @returns Promise com tipo criado
   */
  async createTipoAvaliacao(data: CreateTipoAvaliacaoPayload): Promise<TipoAvaliacaoResponse> {
    try {
      const response = await api.post<TipoAvaliacaoResponse>(this.tiposAvaliacaoURL, data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar tipo de avaliação:', error)
      throw error
    }
  }

  /**
   * Atualiza um tipo de avaliação
   * @param id - Código do tipo
   * @param data - Dados a atualizar
   * @returns Promise com tipo atualizado
   */
  async updateTipoAvaliacao(
    id: number,
    data: CreateTipoAvaliacaoPayload
  ): Promise<TipoAvaliacaoResponse> {
    try {
      const response = await api.put<TipoAvaliacaoResponse>(
        `${this.tiposAvaliacaoURL}/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar tipo de avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um tipo de avaliação
   * @param id - Código do tipo
   * @returns Promise<void>
   */
  async deleteTipoAvaliacao(id: number): Promise<void> {
    try {
      await api.delete(`${this.tiposAvaliacaoURL}/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar tipo de avaliação ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // TIPOS DE NOTA - CRUD
  // ===============================

  /**
   * Busca tipos de nota com paginação
   * @param page - Número da página
   * @param limit - Itens por página
   * @param search - Termo de busca
   * @returns Promise com lista paginada
   */
  async getTiposNota(page = 1, limit = 10, search = ''): Promise<TiposNotaListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      if (search) queryParams.append('search', search)

      const response = await api.get<TiposNotaListResponse>(
        `${this.tiposNotaURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar tipos de nota:', error)
      throw error
    }
  }

  /**
   * Busca um tipo de nota específico
   * @param id - Código do tipo
   * @returns Promise com dados do tipo
   */
  async getTipoNotaById(id: number): Promise<TipoNotaResponse> {
    try {
      const response = await api.get<TipoNotaResponse>(`${this.tiposNotaURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar tipo de nota ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca todos os tipos de nota ativos
   * @returns Promise com lista de tipos ativos
   */
  async getTiposNotaAtivos(): Promise<TipoNota[]> {
    try {
      const response = await api.get<TipoNota[]>(`${this.tiposNotaURL}/ativos`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar tipos de nota ativos:', error)
      throw error
    }
  }

  /**
   * Cria novo tipo de nota
   * @param data - Dados do tipo
   * @returns Promise com tipo criado
   */
  async createTipoNota(data: CreateTipoNotaPayload): Promise<TipoNotaResponse> {
    try {
      const response = await api.post<TipoNotaResponse>(this.tiposNotaURL, data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar tipo de nota:', error)
      throw error
    }
  }

  /**
   * Atualiza um tipo de nota
   * @param id - Código do tipo
   * @param data - Dados a atualizar
   * @returns Promise com tipo atualizado
   */
  async updateTipoNota(id: number, data: CreateTipoNotaPayload): Promise<TipoNotaResponse> {
    try {
      const response = await api.put<TipoNotaResponse>(`${this.tiposNotaURL}/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar tipo de nota ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um tipo de nota
   * @param id - Código do tipo
   * @returns Promise<void>
   */
  async deleteTipoNota(id: number): Promise<void> {
    try {
      await api.delete(`${this.tiposNotaURL}/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar tipo de nota ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // TIPOS DE NOTA VALOR - CRUD
  // ===============================

  /**
   * Busca tipos de nota valor com paginação
   * @param page - Número da página
   * @param limit - Itens por página
   * @param tipoNotaId - Filtro por ID do tipo de nota
   * @returns Promise com lista paginada
   */
  async getTiposNotaValor(
    page = 1,
    limit = 10,
    tipoNotaId?: number
  ): Promise<TiposNotaValorListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      if (tipoNotaId) queryParams.append('tipoNotaId', tipoNotaId.toString())

      const response = await api.get<TiposNotaValorListResponse>(
        `${this.tiposNotaValorURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar tipos de nota valor:', error)
      throw error
    }
  }

  /**
   * Busca um tipo de nota valor específico
   * @param id - Código do tipo
   * @returns Promise com dados do tipo
   */
  async getTipoNotaValorById(id: number): Promise<TipoNotaValorResponse> {
    try {
      const response = await api.get<TipoNotaValorResponse>(`${this.tiposNotaValorURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar tipo de nota valor ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria novo tipo de nota valor
   * @param data - Dados do tipo
   * @returns Promise com tipo criado
   */
  async createTipoNotaValor(data: CreateTipoNotaValorPayload): Promise<TipoNotaValorResponse> {
    try {
      const response = await api.post<TipoNotaValorResponse>(this.tiposNotaValorURL, data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar tipo de nota valor:', error)
      throw error
    }
  }

  /**
   * Atualiza um tipo de nota valor
   * @param id - Código do tipo
   * @param data - Dados a atualizar
   * @returns Promise com tipo atualizado
   */
  async updateTipoNotaValor(
    id: number,
    data: CreateTipoNotaValorPayload
  ): Promise<TipoNotaValorResponse> {
    try {
      const response = await api.put<TipoNotaValorResponse>(
        `${this.tiposNotaValorURL}/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar tipo de nota valor ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um tipo de nota valor
   * @param id - Código do tipo
   * @returns Promise<void>
   */
  async deleteTipoNotaValor(id: number): Promise<void> {
    try {
      await api.delete(`${this.tiposNotaValorURL}/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar tipo de nota valor ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // PERÍODOS DE AVALIAÇÃO - CRUD
  // ===============================

  /**
   * Busca períodos de avaliação com paginação
   * @param page - Número da página
   * @param limit - Itens por página
   * @param search - Termo de busca
   * @returns Promise com lista paginada
   */
  async getPeriodosAvaliacao(
    page = 1,
    limit = 10,
    search = ''
  ): Promise<PeriodosAvaliacaoListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      if (search) queryParams.append('search', search)

      const response = await api.get<PeriodosAvaliacaoListResponse>(
        `${this.periodosAvaliacaoURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar períodos de avaliação:', error)
      throw error
    }
  }

  /**
   * Busca um período de avaliação específico
   * @param id - Código do período
   * @returns Promise com dados do período
   */
  async getPeriodoAvaliacaoById(id: number): Promise<PeriodoAvaliacaoResponse> {
    try {
      const response = await api.get<PeriodoAvaliacaoResponse>(
        `${this.periodosAvaliacaoURL}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar período de avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria novo período de avaliação
   * @param data - Dados do período
   * @returns Promise com período criado
   */
  async createPeriodoAvaliacao(
    data: CreatePeriodoAvaliacaoPayload
  ): Promise<PeriodoAvaliacaoResponse> {
    try {
      const response = await api.post<PeriodoAvaliacaoResponse>(
        this.periodosAvaliacaoURL,
        data
      )
      return response.data
    } catch (error) {
      console.error('Erro ao criar período de avaliação:', error)
      throw error
    }
  }

  /**
   * Atualiza um período de avaliação
   * @param id - Código do período
   * @param data - Dados a atualizar
   * @returns Promise com período atualizado
   */
  async updatePeriodoAvaliacao(
    id: number,
    data: UpdatePeriodoAvaliacaoPayload
  ): Promise<PeriodoAvaliacaoResponse> {
    try {
      const response = await api.put<PeriodoAvaliacaoResponse>(
        `${this.periodosAvaliacaoURL}/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar período de avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um período de avaliação
   * @param id - Código do período
   * @returns Promise<void>
   */
  async deletePeriodoAvaliacao(id: number): Promise<void> {
    try {
      await api.delete(`${this.periodosAvaliacaoURL}/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar período de avaliação ${id}:`, error)
      throw error
    }
  }
}

export default new AcademicEvaluationService()
