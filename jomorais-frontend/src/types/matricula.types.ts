// Tipo para Curso
export interface ICourse {
  codigo: number
  designacao: string
  codigo_Status: number
}

export interface IMatriculaInput {
  codigo_Aluno: number
  data_Matricula: string // formato ISO: "2024-01-15T10:30:00.000Z"
  codigo_Curso: number
  codigo_Utilizador: number
  codigoStatus: number
}

export interface IStudent {
  codigo: number
  nome: string
  dataNascimento: string | null
  sexo: string
  url_Foto: string | null
  email?: string | null
  telefone?: string | null
  morada?: string | null
  pai?: string | null
  mae?: string | null
}

export interface IStudentDetailed extends IStudent {
  n_documento_identificacao?: string | null
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
  tb_tipo_documento?: {
    codigo: number
    designacao: string
  }
}


export interface IUser {
  codigo: number
  nome: string
  user: string
  email?: string
}

export interface IClass {
  codigo: number
  designacao: string
  status: number
  notaMaxima: number
  exame: boolean
}

export interface IRoom {
  codigo: number
  designacao: string
  capacidade: number
  status: number
}

export interface IPeriod {
  codigo: number
  designacao: string
  horaInicio: string
  horaFim: string
  status: number
}

export interface IClassGroup {
  codigo: number
  designacao: string
  codigo_Classe: number
  codigo_Curso: number
  codigo_Sala: number
  codigo_Periodo: number
  status: string
  codigo_AnoLectivo: number
  max_Alunos: number
  tb_classes: IClass
  tb_salas?: IRoom
  tb_periodos?: IPeriod
}

export interface IConfirmation {
  codigo: number
  codigo_Matricula: number
  data_Confirmacao: string | null
  codigo_Turma: number
  codigo_Ano_lectivo: number
  codigo_Utilizador: number
  mes_Comecar: string | null
  codigo_Status: number
  classificacao: string | null
  tb_turmas: IClassGroup
}

export interface IMatricula {
  codigo: number
  codigo_Aluno: number
  data_Matricula: string
  codigo_Curso: number
  codigo_Utilizador: number
  codigoStatus: number
  tb_alunos: IStudent
  tb_cursos: ICourse
  tb_utilizadores: IUser
  tb_confirmacoes?: IConfirmation[]
}

export interface IMatriculaDetailed extends Omit<IMatricula, 'tb_alunos'> {
  tb_alunos: IStudentDetailed
  tb_confirmacoes: IConfirmation[]
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface IMatriculaListResponse {
  data: IMatricula[]
  pagination: IPagination
}

export interface IMatriculasByAnoLectivo {
  codigo_AnoLectivo: number
}

export interface IMatriculasWithoutConfirmation extends IMatricula {
  tb_alunos: IStudent
  tb_cursos: ICourse
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

// Types for statistics
export interface IMatriculaStatistics {
  total: number
  ativas: number
  inativas: number
  comConfirmacao: number
  semConfirmacao: number
  percentualAtivas: string
  percentualComConfirmacao: string
  distribuicaoPorCurso: Array<{
    curso: string
    total: number
  }>
}

// Tipos para padronização com outros services
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string | null
  curso?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}