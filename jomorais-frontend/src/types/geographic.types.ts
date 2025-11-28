/**
 * Tipos para dados geográficos
 * Dados relativamente estáveis que raramente mudam
 */

export interface Nacionalidade {
  codigo: number
  designacao: string
  // Campos compatíveis com interfaces antigas
  id?: number
  nome?: string
}

export interface EstadoCivil {
  codigo: number
  designacao: string
  // Campos compatíveis
  id?: number
  nome?: string
}

export interface Provincia {
  codigo: number
  designacao: string
  // Campos compatíveis
  id?: number
  nome?: string
}

export interface Municipio {
  codigo: number
  designacao: string
  codigo_Provincia: number
  provincia?: Provincia
  // Campos compatíveis
  id?: number
  nome?: string
}

export interface Comuna {
  codigo: number
  designacao: string
  codigo_Municipio: number
  municipio?: Municipio
  // Campos compatíveis
  id?: number
  nome?: string
}

export interface GeographicHierarchy {
  provincias: (Provincia & {
    municipios: (Municipio & {
      comunas: Comuna[]
    })[]
  })[]
}

export interface SearchResult {
  type: 'provincia' | 'municipio' | 'comuna'
  id: number
  nome: string
  hierarchy?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
