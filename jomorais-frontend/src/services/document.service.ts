import api from "../utils/api.utils";
import { toast } from "react-toastify";
import type {
  IDocumentType,
  IDocumentNumbering,
  IApiResponse,
} from "../types/document.types";

/**
 * Service para gerenciamento de documentos
 * Singleton pattern para melhor performance e consistência
 */
class DocumentService {
  private static instance: DocumentService
  private baseURL = '/api/institutional'
  private managementURL = '/api/institutional-management'

  private constructor() {}

  /**
   * Obtém a instância única do serviço
   */
  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService()
    }
    return DocumentService.instance
  }

  // ---------------------------------------------
  // SERVICES PARA TIPOS DE DOCUMENTO
  // ----------------------------------------------

  /**
   * Busca todos os tipos de documento
   * @returns Promise com lista de tipos de documento
   */
  async getAllDocumentTypes(): Promise<IDocumentType[]> {
    try {
      const response = await api.get<IApiResponse<IDocumentType[]>>(`${this.baseURL}/tipos-documento`)
      const apiResponse = response.data

      if (apiResponse.success) {
        return apiResponse.data
      } else {
        throw new Error(apiResponse.message || "Erro ao buscar tipos de documento")
      }
    } catch (error) {
      console.error("Erro ao buscar tipos de documento:", error)
      throw error
    }
  }

  /**
   * Busca tipo de documento por ID
   * @param id - Código do tipo de documento
   */
  async getDocumentTypeById(id: number): Promise<IDocumentType> {
    try {
      const response = await api.get<IApiResponse<IDocumentType>>(`${this.baseURL}/tipos-documento/${id}`)
      const apiResponse = response.data

      if (apiResponse.success) {
        return apiResponse.data
      } else {
        throw new Error(apiResponse.message || "Erro ao buscar tipo de documento")
      }
    } catch (error) {
      console.error("Erro ao buscar tipo de documento:", error)
      throw error
    }
  }

  /**
   * Busca tipos de documento por termo de busca
   * @param searchTerm - Termo para buscar na designação
   */
  async searchDocumentTypes(searchTerm: string): Promise<IDocumentType[]> {
    try {
      const allTypes = await this.getAllDocumentTypes()
      
      if (!searchTerm.trim()) {
        return allTypes
      }

      const term = searchTerm.toLowerCase()
      return allTypes.filter(type => 
        type.designacao.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error("Erro ao buscar tipos de documento:", error)
      throw error
    }
  }

  // ---------------------------------------------
  // SERVICES PARA NUMERAÇÃO DOCUMENTOS
  // ----------------------------------------------

  async getDocumentNumbering(): Promise<IDocumentNumbering[]> {
    try {
      const response = await api.get<IApiResponse<IDocumentNumbering[]>>(`${this.managementURL}/numeracao-documentos`)
      const apiResponse = response.data

      if (apiResponse.success) {
        return apiResponse.data
      } else {
        throw new Error(apiResponse.message || "Erro ao buscar numeração de documentos")
      }
    } catch (error) {
      console.error("Erro ao buscar numeração de documentos:", error)
      throw error
    }
  }

  async getDocumentNumberingById(id: number): Promise<IDocumentNumbering> {
    try {
      const response = await api.get<IApiResponse<IDocumentNumbering>>(`${this.managementURL}/numeracao-documentos/${id}`)
      const apiResponse = response.data

      if (apiResponse.success) {
        return apiResponse.data
      } else {
        throw new Error(apiResponse.message || "Erro ao buscar numeração de documento")
      }
    } catch (error) {
      console.error("Erro ao buscar numeração de documento:", error)
      throw error
    }
  }

  async updateDocumentNumbering(
    id: number,
    numberingData: IDocumentNumbering
  ): Promise<IDocumentNumbering> {
    try {
      const response = await api.put<IApiResponse<IDocumentNumbering>>(
        `${this.managementURL}/numeracao-documentos/${id}`,
        numberingData
      )
      const apiResponse = response.data

      if (apiResponse.success) {
        toast.success(apiResponse.message || "Numeração atualizada com sucesso!")
        return apiResponse.data
      } else {
        toast.error(apiResponse.message || "Erro ao atualizar numeração de documento")
        throw new Error(apiResponse.message || "Erro ao atualizar numeração de documento")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao atualizar numeração de documento"
      toast.error(errorMessage)
      console.error("Erro ao atualizar numeração de documento:", error)
      throw error
    }
  }

  async createDocumentNumbering(
    numberingData: IDocumentNumbering
  ): Promise<IDocumentNumbering> {
    try {
      const response = await api.post<IApiResponse<IDocumentNumbering>>(
        `${this.managementURL}/numeracao-documentos`,
        numberingData
      )
      const apiResponse = response.data

      if (apiResponse.success) {
        toast.success(apiResponse.message || "Numeração criada com sucesso!")
        return apiResponse.data
      } else {
        toast.error(apiResponse.message || "Erro ao criar numeração de documento")
        throw new Error(apiResponse.message || "Erro ao criar numeração de documento")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao criar numeração de documento"
      toast.error(errorMessage)
      console.error("Erro ao criar numeração de documento:", error)
      throw error
    }
  }

  async deleteDocumentNumbering(id: number): Promise<void> {
    try {
      const response = await api.delete<IApiResponse<null>>(`${this.managementURL}/numeracao-documentos/${id}`)
      const apiResponse = response.data

      if (apiResponse.success) {
        toast.success(apiResponse.message || "Numeração deletada com sucesso!")
      } else {
        toast.error(apiResponse.message || "Erro ao deletar numeração de documento")
        throw new Error(apiResponse.message || "Erro ao deletar numeração de documento")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao deletar numeração de documento"
      toast.error(errorMessage)
      console.error("Erro ao deletar numeração de documento:", error)
      throw error
    }
  }
}

// Exportar instância única
export default DocumentService.getInstance()
