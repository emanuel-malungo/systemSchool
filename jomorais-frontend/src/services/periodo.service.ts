import api from '../utils/api.utils'

export interface PeriodoLancamento {
  codigo: number
  nome: string
  tipoNota: string
  trimestre: number
  anoLectivo: string
  status: string
  dataInicio: string
  dataFim: string
  criadoPor?: string
  dataCriacao?: string
}

export interface AnoLetivo {
  codigo: number
  designacao: string
}

export interface CreatePeriodoInput {
  nome: string
  tipoNota: string
  trimestre: number
  anoLectivo: string
  dataInicio: string
  dataFim: string
}

class PeriodoService {
  private readonly baseUrl = '/api/periodos-lancamento'

  async listarPeriodos(): Promise<PeriodoLancamento[]> {
    const response = await api.get(this.baseUrl)
    return response.data.data
  }

  async listarPeriodosAtivos(): Promise<PeriodoLancamento[]> {
    const response = await api.get(`${this.baseUrl}/ativos`)
    return response.data.data
  }

  async listarAnosLetivos(): Promise<AnoLetivo[]> {
    const response = await api.get(`${this.baseUrl}/anos-letivos`)
    return response.data.data
  }

  async criarPeriodo(data: CreatePeriodoInput): Promise<PeriodoLancamento> {
    const response = await api.post(this.baseUrl, data)
    return response.data.data
  }

  async alterarStatus(id: number, status: 'Ativo' | 'Inativo'): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/status`, { status })
  }

  async excluirPeriodo(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`)
  }
}

export default new PeriodoService()
