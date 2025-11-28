import api from "../utils/api.utils"
import type {
  FormaPagamento,
  FormaPagamentoInput,
  FormaPagamentoResponse,
  TipoServico,
  Pagamentoi,
  PagamentoiInput,
  PagamentoiResponse,
  PagamentoDetalhe,
  PagamentoDetalheInput,
  PagamentoDetalheResponse,
  NotaCredito,
  NotaCreditoInput,
  NotaCreditoResponse,
  MotivoAnulacao,
  MotivoAnulacaoInput,
  MotivoAnulacaoResponse,
  AlunoConfirmadoResponse,
  DadosFinanceirosAluno,
  MesPendente,
  DashboardFinanceiro,
  EstatisticasFinanceiras,
  RelatorioFinanceiro,
  RelatorioVendasFuncionario,
  ApiResponse,
  PaginationParams,
  PaymentFilters,
} from "../types/payment.types"

/**
 * Service para gerenciamento de pagamentos
 * Implementa todas as operações de pagamentos, formas de pagamento, notas de crédito e relatórios
 */
class PaymentService {
  private readonly baseUrl = "/api/payment-management"

  // ===============================
  // FORMAS DE PAGAMENTO
  // ===============================

  /**
   * Busca todas as formas de pagamento
   */
  async getFormasPagamento(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<FormaPagamentoResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) {
        queryParams.append("search", params.search)
      }

      const response = await api.get<FormaPagamentoResponse>(
        `${this.baseUrl}/formas-pagamento?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error)
      throw error
    }
  }

  /**
   * Busca todas as formas de pagamento sem paginação
   */
  async getAllFormasPagamento(): Promise<ApiResponse<FormaPagamento[]>> {
    try {
      const response = await api.get<ApiResponse<FormaPagamento[]>>(
        `${this.baseUrl}/formas-pagamento`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar todas as formas de pagamento:", error)
      throw error
    }
  }

  /**
   * Busca forma de pagamento por ID
   */
  async getFormaPagamentoById(id: number): Promise<ApiResponse<FormaPagamento>> {
    try {
      const response = await api.get<ApiResponse<FormaPagamento>>(
        `${this.baseUrl}/formas-pagamento/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar forma de pagamento ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria uma nova forma de pagamento
   */
  async createFormaPagamento(data: FormaPagamentoInput): Promise<ApiResponse<FormaPagamento>> {
    try {
      const response = await api.post<ApiResponse<FormaPagamento>>(
        `${this.baseUrl}/formas-pagamento`,
        data
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar forma de pagamento:", error)
      throw error
    }
  }

  /**
   * Atualiza uma forma de pagamento
   */
  async updateFormaPagamento(id: number, data: FormaPagamentoInput): Promise<ApiResponse<FormaPagamento>> {
    try {
      const response = await api.put<ApiResponse<FormaPagamento>>(
        `${this.baseUrl}/formas-pagamento/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar forma de pagamento ${id}:`, error)
      throw error
    }
  }

  /**
   * Exclui uma forma de pagamento
   */
  async deleteFormaPagamento(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/formas-pagamento/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir forma de pagamento ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // TIPOS DE SERVIÇO
  // ===============================

  /**
   * Busca todos os tipos de serviço
   */
  async getTiposServico(): Promise<ApiResponse<TipoServico[]>> {
    try {
      const response = await api.get<ApiResponse<TipoServico[]>>(
        `${this.baseUrl}/tipos-servico`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar tipos de serviço:", error)
      throw error
    }
  }

  // ===============================
  // PAGAMENTOS PRINCIPAIS (tb_pagamentoi)
  // ===============================

  /**
   * Busca todos os pagamentos principais
   */
  async getPagamentois(
    params: PaginationParams & PaymentFilters = { page: 1, limit: 10 }
  ): Promise<PagamentoiResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      // Adicionar filtros
      if (params.codigo_Aluno) queryParams.append("codigo_Aluno", params.codigo_Aluno.toString())
      if (params.status) queryParams.append("status", params.status.toString())
      if (params.dataInicio) queryParams.append("dataInicio", params.dataInicio)
      if (params.dataFim) queryParams.append("dataFim", params.dataFim)

      const response = await api.get<PagamentoiResponse>(
        `${this.baseUrl}/pagamentois?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar pagamentos principais:", error)
      throw error
    }
  }

  /**
   * Busca pagamento principal por ID
   */
  async getPagamentoiById(id: number): Promise<ApiResponse<Pagamentoi>> {
    try {
      const response = await api.get<ApiResponse<Pagamentoi>>(
        `${this.baseUrl}/pagamentois/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar pagamento principal ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo pagamento principal
   */
  async createPagamentoi(data: PagamentoiInput): Promise<ApiResponse<Pagamentoi>> {
    try {
      const response = await api.post<ApiResponse<Pagamentoi>>(
        `${this.baseUrl}/pagamentois`,
        data
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar pagamento principal:", error)
      throw error
    }
  }

  /**
   * Atualiza um pagamento principal
   */
  async updatePagamentoi(id: number, data: Partial<PagamentoiInput>): Promise<ApiResponse<Pagamentoi>> {
    try {
      const response = await api.put<ApiResponse<Pagamentoi>>(
        `${this.baseUrl}/pagamentois/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar pagamento principal ${id}:`, error)
      throw error
    }
  }

  /**
   * Exclui um pagamento principal
   */
  async deletePagamentoi(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/pagamentois/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir pagamento principal ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // DETALHES DE PAGAMENTO (tb_pagamentos)
  // ===============================

  /**
   * Busca todos os detalhes de pagamento
   */
  async getPagamentos(
    params: PaginationParams & PaymentFilters = { page: 1, limit: 10 }
  ): Promise<PagamentoDetalheResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      // Adicionar filtros
      if (params.search) queryParams.append("search", params.search)
      if (params.codigo_Aluno) queryParams.append("codigo_Aluno", params.codigo_Aluno.toString())
      if (params.codigo_Tipo_Servico) queryParams.append("codigo_Tipo_Servico", params.codigo_Tipo_Servico.toString())
      if (params.tipo_servico) queryParams.append("tipo_servico", params.tipo_servico)
      if (params.codigoPagamento) queryParams.append("codigoPagamento", params.codigoPagamento.toString())
      if (params.n_Bordoro) queryParams.append("n_Bordoro", params.n_Bordoro)
      if (params.dataInicio) queryParams.append("dataInicio", params.dataInicio)
      if (params.dataFim) queryParams.append("dataFim", params.dataFim)

      const response = await api.get<PagamentoDetalheResponse>(
        `${this.baseUrl}/pagamentos?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar detalhes de pagamento:", error)
      throw error
    }
  }

  /**
   * Busca detalhe de pagamento por ID
   */
  async getPagamentoById(id: number): Promise<ApiResponse<PagamentoDetalhe>> {
    try {
      const response = await api.get<ApiResponse<PagamentoDetalhe>>(
        `${this.baseUrl}/pagamentos/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar detalhe de pagamento ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo detalhe de pagamento (pagamento unificado)
   */
  async createPagamento(data: PagamentoDetalheInput): Promise<ApiResponse<PagamentoDetalhe>> {
    try {
      const response = await api.post<ApiResponse<PagamentoDetalhe>>(
        `${this.baseUrl}/pagamentos`,
        data
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar pagamento:", error)
      throw error
    }
  }

  /**
   * Atualiza um detalhe de pagamento
   */
  async updatePagamento(id: number, data: Partial<PagamentoDetalheInput>): Promise<ApiResponse<PagamentoDetalhe>> {
    try {
      const response = await api.put<ApiResponse<PagamentoDetalhe>>(
        `${this.baseUrl}/pagamentos/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar pagamento ${id}:`, error)
      throw error
    }
  }

  /**
   * Exclui um detalhe de pagamento
   */
  async deletePagamento(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/pagamentos/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir pagamento ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // NOTAS DE CRÉDITO
  // ===============================

  /**
   * Busca todas as notas de crédito
   */
  async getNotasCredito(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<NotaCreditoResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) {
        queryParams.append("search", params.search)
      }

      const response = await api.get<NotaCreditoResponse>(
        `${this.baseUrl}/notas-credito?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar notas de crédito:", error)
      throw error
    }
  }

  /**
   * Busca nota de crédito por ID
   */
  async getNotaCreditoById(id: number): Promise<ApiResponse<NotaCredito>> {
    try {
      const response = await api.get<ApiResponse<NotaCredito>>(
        `${this.baseUrl}/notas-credito/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar nota de crédito ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria uma nova nota de crédito
   */
  async createNotaCredito(data: NotaCreditoInput): Promise<ApiResponse<NotaCredito>> {
    try {
      const response = await api.post<ApiResponse<NotaCredito>>(
        `${this.baseUrl}/notas-credito`,
        data
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar nota de crédito:", error)
      throw error
    }
  }

  /**
   * Atualiza uma nota de crédito
   */
  async updateNotaCredito(id: number, data: Partial<NotaCreditoInput>): Promise<ApiResponse<NotaCredito>> {
    try {
      const response = await api.put<ApiResponse<NotaCredito>>(
        `${this.baseUrl}/notas-credito/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar nota de crédito ${id}:`, error)
      throw error
    }
  }

  /**
   * Exclui uma nota de crédito
   */
  async deleteNotaCredito(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/notas-credito/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir nota de crédito ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // MOTIVOS DE ANULAÇÃO
  // ===============================

  /**
   * Busca todos os motivos de anulação
   */
  async getMotivosAnulacao(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<MotivoAnulacaoResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) {
        queryParams.append("search", params.search)
      }

      const response = await api.get<MotivoAnulacaoResponse>(
        `${this.baseUrl}/motivos-anulacao?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar motivos de anulação:", error)
      throw error
    }
  }

  /**
   * Busca motivo de anulação por ID
   */
  async getMotivoAnulacaoById(id: number): Promise<ApiResponse<MotivoAnulacao>> {
    try {
      const response = await api.get<ApiResponse<MotivoAnulacao>>(
        `${this.baseUrl}/motivos-anulacao/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar motivo de anulação ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo motivo de anulação
   */
  async createMotivoAnulacao(data: MotivoAnulacaoInput): Promise<ApiResponse<MotivoAnulacao>> {
    try {
      const response = await api.post<ApiResponse<MotivoAnulacao>>(
        `${this.baseUrl}/motivos-anulacao`,
        data
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar motivo de anulação:", error)
      throw error
    }
  }

  /**
   * Atualiza um motivo de anulação
   */
  async updateMotivoAnulacao(id: number, data: Partial<MotivoAnulacaoInput>): Promise<ApiResponse<MotivoAnulacao>> {
    try {
      const response = await api.put<ApiResponse<MotivoAnulacao>>(
        `${this.baseUrl}/motivos-anulacao/${id}`,
        data
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar motivo de anulação ${id}:`, error)
      throw error
    }
  }

  /**
   * Exclui um motivo de anulação
   */
  async deleteMotivoAnulacao(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/motivos-anulacao/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir motivo de anulação ${id}:`, error)
      throw error
    }
  }

  // ===============================
  // ALUNOS CONFIRMADOS
  // ===============================

  /**
   * Busca alunos confirmados com dados financeiros
   */
  async getAlunosConfirmados(
    params: PaginationParams & { codigo_Ano_lectivo?: number } = { page: 1, limit: 10 }
  ): Promise<AlunoConfirmadoResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) queryParams.append("search", params.search)
      if (params.codigo_Ano_lectivo) queryParams.append("codigo_Ano_lectivo", params.codigo_Ano_lectivo.toString())

      const response = await api.get<AlunoConfirmadoResponse>(
        `${this.baseUrl}/alunos-confirmados?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar alunos confirmados:", error)
      throw error
    }
  }

  /**
   * Busca dados financeiros detalhados de um aluno
   */
  async getDadosFinanceirosAluno(
    alunoId: number,
    anoLectivoId?: number
  ): Promise<ApiResponse<DadosFinanceirosAluno>> {
    try {
      const queryParams = new URLSearchParams()
      if (anoLectivoId) queryParams.append("anoLectivoId", anoLectivoId.toString())

      const response = await api.get<ApiResponse<DadosFinanceirosAluno>>(
        `${this.baseUrl}/alunos/${alunoId}/dados-financeiros?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar dados financeiros do aluno ${alunoId}:`, error)
      throw error
    }
  }

  /**
   * Busca meses pendentes de pagamento de um aluno
   */
  async getMesesPendentes(
    alunoId: number,
    codigoAnoLectivo?: number
  ): Promise<ApiResponse<MesPendente[]>> {
    try {
      const queryParams = new URLSearchParams()
      if (codigoAnoLectivo) queryParams.append("codigoAnoLectivo", codigoAnoLectivo.toString())

      const response = await api.get<ApiResponse<MesPendente[]>>(
        `${this.baseUrl}/aluno/${alunoId}/meses-pendentes?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar meses pendentes do aluno ${alunoId}:`, error)
      throw error
    }
  }

  // ===============================
  // DASHBOARDS E ESTATÍSTICAS
  // ===============================

  /**
   * Busca dados do dashboard financeiro
   */
  async getDashboardFinanceiro(): Promise<ApiResponse<DashboardFinanceiro>> {
    try {
      const response = await api.get<ApiResponse<DashboardFinanceiro>>(
        `${this.baseUrl}/dashboard`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar dashboard financeiro:", error)
      throw error
    }
  }

  /**
   * Busca estatísticas de pagamentos
   */
  async getEstatisticasPagamentos(periodo = "30"): Promise<ApiResponse<EstatisticasFinanceiras>> {
    try {
      const response = await api.get<ApiResponse<EstatisticasFinanceiras>>(
        `${this.baseUrl}/estatisticas?periodo=${periodo}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas de pagamentos:", error)
      throw error
    }
  }

  // ===============================
  // RELATÓRIOS
  // ===============================

  /**
   * Gera relatório financeiro
   */
  async getRelatorioFinanceiro(
    tipo: 'resumo' | 'detalhado' | 'por_aluno' | 'por_servico',
    filters: PaymentFilters
  ): Promise<ApiResponse<RelatorioFinanceiro>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("tipo", tipo)
      
      if (filters.dataInicio) queryParams.append("dataInicio", filters.dataInicio)
      if (filters.dataFim) queryParams.append("dataFim", filters.dataFim)
      if (filters.codigo_Aluno) queryParams.append("codigo_Aluno", filters.codigo_Aluno.toString())
      if (filters.codigo_Tipo_Servico) queryParams.append("codigo_Tipo_Servico", filters.codigo_Tipo_Servico.toString())

      const response = await api.get<ApiResponse<RelatorioFinanceiro>>(
        `${this.baseUrl}/relatorios/financeiro?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao gerar relatório financeiro:", error)
      throw error
    }
  }

  /**
   * Busca relatório de vendas por funcionário
   */
  async getRelatorioVendasFuncionarios(
    periodo = 'diario',
    dataInicio?: string,
    dataFim?: string
  ): Promise<ApiResponse<RelatorioVendasFuncionario[]>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("periodo", periodo)
      
      if (dataInicio) queryParams.append("dataInicio", dataInicio)
      if (dataFim) queryParams.append("dataFim", dataFim)

      const response = await api.get<ApiResponse<RelatorioVendasFuncionario[]>>(
        `${this.baseUrl}/relatorios/vendas-funcionarios?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao buscar relatório de vendas por funcionário:", error)
      throw error
    }
  }

  /**
   * Busca relatório detalhado de vendas de um funcionário
   */
  async getRelatorioVendasDetalhado(
    funcionarioId: number,
    periodo = 'diario',
    dataInicio?: string,
    dataFim?: string
  ): Promise<ApiResponse<RelatorioVendasFuncionario>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("periodo", periodo)
      
      if (dataInicio) queryParams.append("dataInicio", dataInicio)
      if (dataFim) queryParams.append("dataFim", dataFim)

      const response = await api.get<ApiResponse<RelatorioVendasFuncionario>>(
        `${this.baseUrl}/relatorios/vendas-funcionarios/${funcionarioId}?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar relatório detalhado do funcionário ${funcionarioId}:`, error)
      throw error
    }
  }

  /**
   * Gera e baixa PDF de fatura
   */
  async gerarFaturaPDF(pagamentoId: number): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseUrl}/pagamentos/${pagamentoId}/fatura-pdf`,
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao gerar PDF da fatura ${pagamentoId}:`, error)
      throw error
    }
  }

  /**
   * Valida número de borderô
   */
  async validateBordero(bordero: string, excludeId?: number): Promise<ApiResponse<{ valid: boolean; message: string }>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("bordero", bordero)
      if (excludeId) queryParams.append("excludeId", excludeId.toString())

      const response = await api.get<ApiResponse<{ valid: boolean; message: string }>>(
        `${this.baseUrl}/validate-bordero?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("Erro ao validar borderô:", error)
      throw error
    }
  }
}

// Exporta instância única do serviço
const paymentService = new PaymentService()
export default paymentService
