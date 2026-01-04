import api from '../utils/api.utils'
import type {
  Nacionalidade,
  EstadoCivil,
  Provincia,
  Municipio,
  Comuna,
  GeographicHierarchy,
  SearchResult,
  ApiResponse,
} from '../types/geographic.types'

/**
 * Service para gerenciamento de dados geográficos e cadastrais
 * Singleton pattern para garantir uma única instância
 * 
 * ESTRATÉGIA DE CACHE:
 * - Estes dados raramente mudam (nacionalidades, províncias, etc)
 * - Implementamos cache de longa duração no React Query
 * - staleTime: 24 horas (dados considerados "frescos" por 1 dia)
 * - gcTime: 7 dias (mantidos em memória por 1 semana)
 * - Ideal para dropdowns e selects que não mudam frequentemente
 */
class GeographicService {
  private static instance: GeographicService
  private readonly baseUrl = '/api/geographic'

  private constructor() {}

  /**
   * Obtém a instância única do serviço
   */
  static getInstance(): GeographicService {
    if (!GeographicService.instance) {
      GeographicService.instance = new GeographicService()
    }
    return GeographicService.instance
  }

  // ===============================
  // NACIONALIDADES
  // ===============================

  /**
   * Busca todas as nacionalidades
   * @returns Promise com lista de nacionalidades
   */
  async getAllNacionalidades(): Promise<Nacionalidade[]> {
    try {
      const response = await api.get<ApiResponse<Nacionalidade[]> | Nacionalidade[]>(
        `${this.baseUrl}/nacionalidades`
      )

      // A API pode retornar direto ou dentro de um objeto com 'data'
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data as ApiResponse<Nacionalidade[]>).data

      // Mapeia para incluir campos de compatibilidade
      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
      }))
    } catch (error) {
      console.error('Erro ao buscar nacionalidades:', error)
      throw error
    }
  }

  /**
   * Busca uma nacionalidade por ID
   * @param id - Código da nacionalidade
   * @returns Promise com dados da nacionalidade
   */
  async getNacionalidadeById(id: number): Promise<Nacionalidade> {
    try {
      const response = await api.get<ApiResponse<Nacionalidade>>(
        `${this.baseUrl}/nacionalidades/${id}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Erro ao buscar nacionalidade ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // ESTADO CIVIL
  // ===============================

  /**
   * Busca todos os estados civis
   * @returns Promise com lista de estados civis
   */
  async getAllEstadoCivil(): Promise<EstadoCivil[]> {
    try {
      const response = await api.get<ApiResponse<EstadoCivil[]> | EstadoCivil[]>(
        `${this.baseUrl}/estado-civil`
      )

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiResponse<EstadoCivil[]>).data

      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
        id: item.codigo,
        nome: item.designacao,
      }))
    } catch (error) {
      console.error('Erro ao buscar estados civis:', error)
      throw error
    }
  }

  /**
   * Busca estado civil por ID
   * @param id - Código do estado civil
   */
  async getEstadoCivilById(id: number): Promise<EstadoCivil> {
    try {
      const response = await api.get<ApiResponse<EstadoCivil>>(
        `${this.baseUrl}/estado-civil/${id}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Erro ao buscar estado civil ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // PROVÍNCIAS
  // ===============================

  /**
   * Busca todas as províncias
   * @returns Promise com lista de províncias
   */
  async getAllProvincias(): Promise<Provincia[]> {
    try {
      const response = await api.get<ApiResponse<Provincia[]> | Provincia[]>(
        `${this.baseUrl}/provincias`
      )

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiResponse<Provincia[]>).data

      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
        id: item.codigo,
        nome: item.designacao,
      }))
    } catch (error) {
      console.error('Erro ao buscar províncias:', error)
      throw error
    }
  }

  /**
   * Busca província por ID
   * @param id - Código da província
   */
  async getProvinciaById(id: number): Promise<Provincia> {
    try {
      const response = await api.get<ApiResponse<Provincia>>(
        `${this.baseUrl}/provincias/${id}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Erro ao buscar província ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // MUNICÍPIOS
  // ===============================

  /**
   * Busca todos os municípios
   * @returns Promise com lista de municípios
   */
  async getAllMunicipios(): Promise<Municipio[]> {
    try {
      const response = await api.get<ApiResponse<Municipio[]> | Municipio[]>(
        `${this.baseUrl}/municipios`
      )

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiResponse<Municipio[]>).data

      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
        codigo_Provincia: item.codigo_Provincia,
        id: item.codigo,
        nome: item.designacao,
      }))
    } catch (error) {
      console.error('Erro ao buscar municípios:', error)
      throw error
    }
  }

  /**
   * Busca município por ID
   * @param id - Código do município
   */
  async getMunicipioById(id: number): Promise<Municipio> {
    try {
      const response = await api.get<ApiResponse<Municipio>>(
        `${this.baseUrl}/municipios/${id}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Erro ao buscar município ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca municípios por província
   * @param provinciaId - Código da província
   */
  async getMunicipiosByProvincia(provinciaId: number): Promise<Municipio[]> {
    try {
      const response = await api.get<ApiResponse<Municipio[]> | Municipio[]>(
        `${this.baseUrl}/provincias/${provinciaId}/municipios`
      )

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiResponse<Municipio[]>).data

      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
        codigo_Provincia: item.codigo_Provincia,
        id: item.codigo,
        nome: item.designacao,
      }))
    } catch (error) {
      console.error(`Erro ao buscar municípios da província ${provinciaId}:`, error)
      throw error
    }
  }

  // ===============================
  // COMUNAS
  // ===============================

  /**
   * Busca todas as comunas
   * @returns Promise com lista de comunas
   */
  async getAllComunas(): Promise<Comuna[]> {
    try {
      const response = await api.get<ApiResponse<Comuna[]> | Comuna[]>(
        `${this.baseUrl}/comunas`
      )

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiResponse<Comuna[]>).data

      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
        codigo_Municipio: item.codigo_Municipio,
        id: item.codigo,
        nome: item.designacao,
      }))
    } catch (error) {
      console.error('Erro ao buscar comunas:', error)
      throw error
    }
  }

  /**
   * Busca comuna por ID
   * @param id - Código da comuna
   */
  async getComunaById(id: number): Promise<Comuna> {
    try {
      const response = await api.get<ApiResponse<Comuna>>(
        `${this.baseUrl}/comunas/${id}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Erro ao buscar comuna ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca comunas por município
   * @param municipioId - Código do município
   */
  async getComunasByMunicipio(municipioId: number): Promise<Comuna[]> {
    try {
      const response = await api.get<ApiResponse<Comuna[]> | Comuna[]>(
        `${this.baseUrl}/municipios/${municipioId}/comunas`
      )

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiResponse<Comuna[]>).data

      return data.map((item) => ({
        codigo: item.codigo,
        designacao: item.designacao,
        codigo_Municipio: item.codigo_Municipio,
        id: item.codigo,
        nome: item.designacao,
      }))
    } catch (error) {
      console.error(`Erro ao buscar comunas do município ${municipioId}:`, error)
      throw error
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS
  // ===============================

  /**
   * Busca hierarquia geográfica completa
   */
  async getGeographicHierarchy(): Promise<GeographicHierarchy> {
    try {
      const response = await api.get<ApiResponse<GeographicHierarchy>>(
        `${this.baseUrl}/hierarchy`
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar hierarquia geográfica:', error)
      throw error
    }
  }

  /**
   * Busca geográfica por termo
   * @param searchTerm - Termo de busca
   */
  async searchGeographic(searchTerm: string): Promise<SearchResult[]> {
    try {
      const response = await api.get<ApiResponse<SearchResult[]>>(
        `${this.baseUrl}/search`,
        { params: { q: searchTerm } }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao realizar busca geográfica:', error)
      throw error
    }
  }

  // ===============================
  // CRUD PROVÍNCIAS
  // ===============================

  /**
   * Criar nova província
   */
  async createProvincia(designacao: string): Promise<Provincia> {
    try {
      const response = await api.post<ApiResponse<Provincia>>(
        `${this.baseUrl}/provincias`,
        { designacao }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao criar província:', error)
      throw error
    }
  }

  /**
   * Atualizar província
   */
  async updateProvincia(id: number, designacao: string): Promise<Provincia> {
    try {
      const response = await api.put<ApiResponse<Provincia>>(
        `${this.baseUrl}/provincias/${id}`,
        { designacao }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar província:', error)
      throw error
    }
  }

  /**
   * Excluir província
   */
  async deleteProvincia(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/provincias/${id}`)
    } catch (error) {
      console.error('Erro ao excluir província:', error)
      throw error
    }
  }

  // ===============================
  // CRUD MUNICÍPIOS
  // ===============================

  /**
   * Criar novo município
   */
  async createMunicipio(designacao: string, codigo_Provincia: number): Promise<Municipio> {
    try {
      const response = await api.post<ApiResponse<Municipio>>(
        `${this.baseUrl}/municipios`,
        { designacao, codigo_Provincia }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao criar município:', error)
      throw error
    }
  }

  /**
   * Atualizar município
   */
  async updateMunicipio(id: number, designacao: string, codigo_Provincia?: number): Promise<Municipio> {
    try {
      const response = await api.put<ApiResponse<Municipio>>(
        `${this.baseUrl}/municipios/${id}`,
        { designacao, ...(codigo_Provincia && { codigo_Provincia }) }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar município:', error)
      throw error
    }
  }

  /**
   * Excluir município
   */
  async deleteMunicipio(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/municipios/${id}`)
    } catch (error) {
      console.error('Erro ao excluir município:', error)
      throw error
    }
  }

  // ===============================
  // CRUD COMUNAS
  // ===============================

  /**
   * Criar nova comuna
   */
  async createComuna(designacao: string, codigo_Municipio: number): Promise<Comuna> {
    try {
      const response = await api.post<ApiResponse<Comuna>>(
        `${this.baseUrl}/comunas`,
        { designacao, codigo_Municipio }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao criar comuna:', error)
      throw error
    }
  }

  /**
   * Atualizar comuna
   */
  async updateComuna(id: number, designacao: string, codigo_Municipio?: number): Promise<Comuna> {
    try {
      const response = await api.put<ApiResponse<Comuna>>(
        `${this.baseUrl}/comunas/${id}`,
        { designacao, ...(codigo_Municipio && { codigo_Municipio }) }
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar comuna:', error)
      throw error
    }
  }

  /**
   * Excluir comuna
   */
  async deleteComuna(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/comunas/${id}`)
    } catch (error) {
      console.error('Erro ao excluir comuna:', error)
      throw error
    }
  }
}

// Exportar instância única
export default GeographicService.getInstance()