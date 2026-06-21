import api from '../utils/api.utils'
import type {
  CreateCertificatePayload,
  UpdateCertificatePayload,
  CertificateResponse,
  CertificatesListResponse,
  CertificateFilters,
} from '../types/certificate.types'

/**
 * Service para gerenciamento de Certificados
 * Implementa todas as operações CRUD baseado no backend: certificates.services.js
 */
class CertificateService {
  private readonly baseURL = '/api/certificates'

  // ===============================
  // CERTIFICADOS - CRUD
  // ===============================

  /**
   * Busca certificados com paginação e filtros
   * @param page - Número da página (padrão: 1)
   * @param limit - Itens por página (padrão: 10)
   * @param filters - Filtros adicionais
   * @returns Promise com lista paginada de certificados
   */
  async getCertificates(
    page = 1,
    limit = 10,
    filters?: CertificateFilters
  ): Promise<CertificatesListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      if (filters?.codigoAluno) {
        queryParams.append('codigoAluno', filters.codigoAluno.toString())
      }
      if (filters?.status) {
        queryParams.append('status', filters.status)
      }
      if (filters?.codigoAnoLectivo) {
        queryParams.append('codigoAnoLectivo', filters.codigoAnoLectivo.toString())
      }

      const response = await api.get<CertificatesListResponse>(
        `${this.baseURL}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar certificados:', error)
      throw error
    }
  }

  /**
   * Busca um certificado específico por ID
   * @param id - Código do certificado
   * @returns Promise com dados do certificado
   */
  async getCertificateById(id: number): Promise<CertificateResponse> {
    try {
      const response = await api.get<CertificateResponse>(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar certificado ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo certificado
   * @param data - Dados do certificado
   * @returns Promise com certificado criado
   */
  async createCertificate(data: CreateCertificatePayload): Promise<CertificateResponse> {
    try {
      const response = await api.post<CertificateResponse>(this.baseURL, data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar certificado:', error)
      throw error
    }
  }

  /**
   * Cria certificados para uma turma inteira
   * @param data - Dados da turma
   * @returns Promise com o sumario da operacao
   */
  async createClassCertificates(data: { codigoTurma: number; codigoAnoLectivo: number; observacoes?: string }): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: any }>(`${this.baseURL}/class`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar certificados da turma:', error)
      throw error
    }
  }

  /**
   * Atualiza um certificado existente
   * @param id - Código do certificado
   * @param data - Dados a atualizar
   * @returns Promise com certificado atualizado
   */
  async updateCertificate(id: number, data: UpdateCertificatePayload): Promise<CertificateResponse> {
    try {
      const response = await api.put<CertificateResponse>(`${this.baseURL}/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar certificado ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um certificado
   * @param id - Código do certificado
   * @returns Promise<void>
   */
  async deleteCertificate(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar certificado ${id}:`, error)
      throw error
    }
  }

  /**
   * Assina um certificado digitalmente
   * @param id - Código do certificado
   * @param codigoUtilizador - Código do utilizador que assina
   * @returns Promise com certificado assinado
   */
  async signCertificate(id: number, codigoUtilizador: number): Promise<CertificateResponse> {
    try {
      const response = await api.post<CertificateResponse>(
        `${this.baseURL}/${id}/sign`,
        { codigoUtilizador }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao assinar certificado ${id}:`, error)
      throw error
    }
  }

  /**
   * Gera número sequencial de certificado
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise com número gerado
   */
  async generateNumeroCertificado(codigoAnoLectivo: number): Promise<{ numero: string }> {
    try {
      const response = await api.get<{ numero: string }>(
        `${this.baseURL}/generate/numero/${codigoAnoLectivo}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao gerar número de certificado:', error)
      throw error
    }
  }

  /**
   * Verifica a autenticidade de um certificado publicamente
   * @param numeroCertificado - Número do certificado
   * @returns Promise com resultado da verificação
   */
  async verifyCertificate(numeroCertificado: string): Promise<any> {
    try {
      const response = await api.get<any>(`${this.baseURL}/verificar/${numeroCertificado}`)
      return response.data
    } catch (error) {
      console.error('Erro ao verificar certificado:', error)
      throw error
    }
  }
}

export default new CertificateService()
