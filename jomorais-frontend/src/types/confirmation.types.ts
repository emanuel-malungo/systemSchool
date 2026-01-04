export interface IConfirmationInput {
  codigo_Matricula: number
  data_Confirmacao: string // formato ISO: "2024-01-15T10:30:00.000Z"
  codigo_Turma: number
  codigo_Ano_lectivo: number
  codigo_Utilizador: number
  mes_Comecar?: string | null // formato ISO: "2024-01-15T10:30:00.000Z"
  codigo_Status: number
  classificacao?: string | null
}

export interface IProfession {
  codigo: number
  designacao: string
}

export interface IGuardian {
  codigo: number
  nome: string
  telefone: string
  email?: string | null
  local_Trabalho: string
  tb_profissao: IProfession
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
  tb_encarregados?: IGuardian
}

export interface ICourse {
  codigo: number
  designacao: string
  codigo_Status: number
}

export interface IUser {
  codigo: number
  nome: string
  user: string
  email?: string
}

export interface IEnrollment {
  codigo: number
  codigo_Aluno: number
  data_Matricula: string
  codigo_Curso: number
  codigo_Utilizador: number
  codigoStatus: number
  tb_alunos: IStudent
  tb_cursos: ICourse
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
  tb_salas: IRoom
  tb_periodos: IPeriod
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
  tb_matriculas: IEnrollment
  tb_turmas: IClassGroup
  tb_utilizadores: IUser
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface IConfirmationListResponse {
  data: IConfirmation[]
  pagination: IPagination
}

export interface IConfirmationsByClassAndYear {
  codigo_Turma: number
  codigo_AnoLectivo: number
}

export interface IConfirmationStatistics {
  totalConfirmacoes: number
  confirmacoesAtivas: number
  confirmacoesInativas: number
  aprovados: number
  reprovados: number
  pendentes: number
  distribuicaoPorAnoLectivo: {
    codigo_Ano_lectivo: number
    designacao: string
    total: number
  }[]
  distribuicaoPorClassificacao: {
    classificacao: string
    total: number
  }[]
  distribuicaoPorTurma: {
    codigo_Turma: number
    designacao_Turma: string
    designacao_Classe: string
    total: number
  }[]
  percentuais: {
    ativas: string
    inativas: string
    aprovados: string
    reprovados: string
    pendentes: string
  }
}