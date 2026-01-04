// Interface para input de dados institucionais (criação/atualização)
export interface IInstitutionInput {
  nome: string
  n_Escola?: string
  director: string
  subDirector?: string
  telefone_Fixo?: string
  telefone_Movel?: string
  email: string
  site?: string
  localidade?: string
  contribuinte?: string
  nif: string
  logotipo?: string
  provincia?: string
  municipio?: string
  nescola?: string
  contaBancaria1?: string
  contaBancaria2?: string
  contaBancaria3?: string
  contaBancaria4?: string
  contaBancaria5?: string
  contaBancaria6?: string
  regime_Iva?: string
  taxaIva?: number
}

// Interface completa para dados institucionais
export interface IInstitution extends IInstitutionInput {
  codigo: number
  tb_regime_iva?: {
    codigo: number
    designacao: string
  }
}

// Interface genérica para resposta da API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Interface para resposta da API
export interface IInstitutionResponse {
  success: boolean
  message: string
  data: IInstitution
}

// Interface para lista de instituições (caso seja necessário)
export interface IInstitutionListResponse {
  success: boolean
  message: string
  data: IInstitution[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}
