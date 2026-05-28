// Types para gestão de certificados

export interface Student {
  Codigo: number
  Nome: string
  email?: string
  dataNascimento?: string
}

export interface Subject {
  codigo: number
  designacao: string
}

export interface AcademicYear {
  Codigo: number
  designacao: string
}

export interface User {
  Codigo: number
  Nome: string
}

export interface Certificate {
  Codigo: number
  Codigo_Aluno: number
  Codigo_Disciplina: number
  Codigo_AnoLectivo: number
  NumeroCertificado: string
  DataEmissao: string
  DataAssinatura?: string
  Status: 'Pendente' | 'Assinado'
  Observacoes?: string
  AssinadoPor?: number
  tb_alunos?: Student
  tb_disciplinas?: Subject
  tb_ano_lectivo?: AcademicYear
  tb_utilizadores?: User
}

export interface CreateCertificatePayload {
  codigoAluno: number
  codigoDisciplina: number
  codigoAnoLectivo: number
  observacoes?: string
}

export interface UpdateCertificatePayload {
  observacoes?: string
}

export interface SignCertificatePayload {
  codigoUtilizador: number
}

export interface CertificateResponse {
  success: boolean
  message: string
  data: Certificate
}

export interface CertificatesListResponse {
  success: boolean
  message: string
  data: Certificate[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface CertificateFilters {
  codigoAluno?: number
  codigoDisciplina?: number
  status?: 'Pendente' | 'Assinado'
  codigoAnoLectivo?: number
}

export interface UseCertificateState {
  certificates: Certificate[]
  certificate: Certificate | null
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  } | null
}

export interface UseCertificateReturn extends UseCertificateState {
  getCertificates: (page?: number, limit?: number, filters?: CertificateFilters) => Promise<void>
  getCertificateById: (id: number) => Promise<void>
  createCertificate: (data: CreateCertificatePayload) => Promise<void>
  updateCertificate: (id: number, data: UpdateCertificatePayload) => Promise<void>
  deleteCertificate: (id: number) => Promise<void>
  signCertificate: (id: number, codigoUtilizador: number) => Promise<void>
  clearError: () => void
  clearCertificate: () => void
  setLoading: (loading: boolean) => void
}
