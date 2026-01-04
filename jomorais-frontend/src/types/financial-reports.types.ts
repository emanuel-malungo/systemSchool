// Interfaces para relatórios financeiros

export interface FinancialReportFilters {
  anoAcademico?: string
  classe?: string
  curso?: string
  periodo?: string
  tipoTransacao?: 'pagamento' | 'propina' | 'multa' | 'desconto' | 'todos'
  statusPagamento?: 'pago' | 'pendente' | 'atrasado' | 'cancelado' | 'todos'
  dataInicio?: string
  dataFim?: string
  valorMinimo?: number
  valorMaximo?: number
}

export interface FinancialTransaction {
  codigo: number
  codigoAluno: number
  nomeAluno: string
  numeroMatricula: string
  classe?: string
  curso?: string
  tipoTransacao: string
  descricao: string
  valor: number
  valorPago: number
  valorPendente: number
  dataVencimento: string
  dataPagamento?: string
  statusPagamento: string
  metodoPagamento?: string
  numeroRecibo?: string
  observacoes?: string
  dataRegistro: string
}

export interface FinancialStatistics {
  totalTransacoes: number
  valorTotalArrecadado: number
  valorTotalPendente: number
  valorTotalAtrasado: number
  transacoesPagas: number
  transacoesPendentes: number
  transacoesAtrasadas: number
  transacoesCanceladas: number
  percentualArrecadacao: number
  ticketMedio: number
  distribuicaoPorTipo: {
    pagamentos: number
    propinas: number
    multas: number
    descontos: number
  }
  distribuicaoPorMetodo: {
    dinheiro: number
    transferencia: number
    multicaixa: number
    outros: number
  }
}

export interface FinancialReportData {
  transacoes: FinancialTransaction[]
  estatisticas: FinancialStatistics
  resumoPorPeriodo: {
    periodo: string
    valor: number
    transacoes: number
  }[]
  resumoPorClasse: {
    classe: string
    valor: number
    alunos: number
  }[]
}

export interface UseFinancialReportsParams {
  page?: number
  limit?: number
  enabled?: boolean
  filters?: FinancialReportFilters
}

export interface FinancialReportsResponse {
  success: boolean
  message: string
  data: {
    transactions: FinancialTransaction[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

export interface FinancialStatisticsResponse {
  success: boolean
  message: string
  data: FinancialStatistics
}

export interface GenerateFinancialReportRequest {
  format: 'word' | 'pdf' | 'excel'
  filters: FinancialReportFilters
  includeStatistics: boolean
  includeCharts: boolean
  includeDetails: boolean
  periodo?: {
    inicio: string
    fim: string
  }
}

export interface FinancialFilterOptions {
  anosAcademicos: Array<{
    codigo: number
    designacao: string
  }>
  classes: Array<{
    codigo: number
    designacao: string
  }>
  cursos: Array<{
    codigo: number
    designacao: string
  }>
  periodos: Array<{
    value: string
    label: string
  }>
  tiposTransacao: Array<{
    value: string
    label: string
  }>
  statusPagamento: Array<{
    value: string
    label: string
  }>
  metodosPagamento: Array<{
    value: string
    label: string
  }>
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type FinancialTransactionsApiResponse = ApiResponse<{
  transactions: FinancialTransaction[]
  pagination: PaginationMeta
}>

export type FinancialStatisticsApiResponse = ApiResponse<FinancialStatistics>

export type FinancialFilterOptionsApiResponse = ApiResponse<FinancialFilterOptions>
