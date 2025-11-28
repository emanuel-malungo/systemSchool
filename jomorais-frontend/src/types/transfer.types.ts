export interface ITransferInput {
  codigoAluno: number
  codigoEscola: number
  dataTransferencia: string // formato ISO datetime: "2024-06-15T10:00:00.000Z"
  codigoMotivo: number
  obs?: string
}

export interface IStudent {
  codigo: number
  nome: string
  dataNascimento: string | null
  sexo: string
  url_Foto: string | null
  telefone?: string
  morada?: string
  tb_encarregados?: {
    codigo: number
    nome: string
    telefone: string
    email?: string | null
    tb_profissao?: {
      codigo: number
      designacao: string
    }
  }
  tb_matriculas?: {
    codigo: number
    tb_cursos: {
      codigo: number
      designacao: string
    }
  }
}

export interface ISchool {
  codigo: number
  designacao: string
  morada?: string
  telefone?: string
}

export interface IMotivo {
  codigo: number
  designacao: string
}

export interface IUser {
  codigo: number
  nome: string
  user: string
  email?: string
}

export interface ITransfer {
  codigo: number
  codigoAluno: number
  codigoEscola: number
  codigoUtilizador: number
  dataTransferencia: string | object // API retorna {} às vezes
  codigoMotivo: number
  obs?: string | null
  dataActualizacao?: string | object | null // API retorna {} às vezes
  tb_alunos: IStudent
  tb_utilizadores?: IUser | null
  // Nota: tb_escolas e tb_motivo_transferencia não existem no schema do banco
  // Os dados dessas entidades devem ser buscados através dos códigos usando mapeamentos estáticos
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ITransferListResponse {
  data: ITransfer[]
  pagination: IPagination
}

// Types for batch operations response
export interface IBatchResult<T> {
  index: number
  success: boolean
  data?: T
  error?: string
}

export interface IBatchResponse<T> {
  created: IBatchResult<T>[]
  errors: IBatchResult<T>[]
  summary: {
    total: number
    success: number
    failed: number
  }
}
