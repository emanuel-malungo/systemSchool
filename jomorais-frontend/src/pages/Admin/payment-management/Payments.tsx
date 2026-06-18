import { useState, useEffect, useCallback } from "react"
import { 
  Search, 
  DollarSign, 
  Calendar, 
  Filter, 
  Eye,
  FileText,
  TrendingUp,
  Users,
  CreditCard,
  XCircle,
  Receipt,
  Download,
  Printer
} from "lucide-react"
import { toast } from "react-toastify"
import Container from "../../../components/layout/Container"
import { 
  usePagamentos, 
  useDashboardFinanceiro,
  useTiposServico,
  useAlunosConfirmados
} from "../../../hooks/usePayment"
import { StudentFinancialModal, CreditNoteModal, MakePaymentModal } from "../../../components/payment-management"
import type { PagamentoDetalhe, AlunoConfirmado } from "../../../types/payment.types"
import { usePageTitle } from "../../../hooks/usePageTitle"

export default function Payments() {
  usePageTitle('Gestão de Pagamentos')

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filterTipoServico, setFilterTipoServico] = useState<string>("")
  const [filterDataInicio, setFilterDataInicio] = useState("")
  const [filterDataFim, setFilterDataFim] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PagamentoDetalhe | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [showFinancialModal, setShowFinancialModal] = useState(false)
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false)
  const [showMakePaymentModal, setShowMakePaymentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<AlunoConfirmado | null>(null)
  const [studentsSearch, setStudentsSearch] = useState("")
  const [studentsSearchDebounced, setStudentsSearchDebounced] = useState("")
  const [studentsPage, setStudentsPage] = useState(1)

  const limit = 10

  // Queries
  const { data: paymentsData, isLoading, refetch } = usePagamentos({
    page: currentPage,
    limit,
    search: search || undefined,
    tipo_servico: filterTipoServico || undefined,
    dataInicio: filterDataInicio || undefined,
    dataFim: filterDataFim || undefined
  })

  const { data: dashboardData } = useDashboardFinanceiro()
  const { data: tiposServicoData } = useTiposServico()
  
  // Busca de alunos otimizada com debounce
  const { data: studentsData, isLoading: studentsLoading } = useAlunosConfirmados({
    page: studentsPage,
    limit: 20,
    search: studentsSearchDebounced || undefined
  }, showStudentsModal)
  
  // Debounce para busca de alunos (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStudentsSearchDebounced(studentsSearch)
      // Reset para página 1 quando houver nova busca
      if (studentsSearch !== studentsSearchDebounced) {
        setStudentsPage(1)
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [studentsSearch, studentsSearchDebounced])
  
  const students = studentsData?.data || []
  const studentsPagination = studentsData?.pagination

  const payments = paymentsData?.data || []
  const pagination = paymentsData?.pagination

  // Funções para PDF
  const handleDownloadPDF = (paymentId: number) => {
    console.log('Download PDF para pagamento:', paymentId)
    // TODO: Implementar download de PDF
  }

  const handlePrintPDF = (paymentId: number) => {
    console.log('Imprimir PDF para pagamento:', paymentId)
    // TODO: Implementar impressão de PDF
  }

  // Dados do dashboard com fallback para valores de demonstração
  const dashboardStats = {
    totalRecebido: dashboardData?.data?.resumo?.totalRecebido || 0,
    pagamentosHoje: dashboardData?.data?.resumo?.pagamentosHoje || 0,
    receitaMensal: dashboardData?.data?.resumo?.receitaMensal || 0,
    totalPendente: dashboardData?.data?.resumo?.totalPendente || 0,
    hasRealData: dashboardData?.success && (
      dashboardData.data.resumo.totalRecebido > 0 ||
      dashboardData.data.resumo.pagamentosHoje > 0 ||
      dashboardData.data.resumo.receitaMensal > 0 ||
      dashboardData.data.resumo.totalPendente > 0
    )
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilter = () => {
    setCurrentPage(1)
    refetch()
  }

  const handleClearFilters = () => {
    setFilterTipoServico("")
    setFilterDataInicio("")
    setFilterDataFim("")
    setSearch("")
    setCurrentPage(1)
  }

  const handleViewDetails = (payment: PagamentoDetalhe) => {
    setSelectedPayment(payment)
    setShowDetailsModal(true)
  }

  // Impressão térmica 80mm - Mesmo formato do MakePaymentModal
  const handlePrintThermal = async (payment: PagamentoDetalhe) => {
    try {
      console.log('[Payments] Gerando fatura térmica para pagamento:', payment.codigo);
      
      // Obter nome do funcionário logado
      let nomeOperador = 'Sistema';
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          nomeOperador = user.nome || user.username || 'Sistema';
        }
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
      }

      // Extrair dados acadêmicos
      const matriculas = (payment.aluno as any)?.tb_matriculas || [];
      const ultimaMatricula = matriculas[matriculas.length - 1];
      const confirmacao = ultimaMatricula?.tb_confirmacoes?.[0];
      const turma = confirmacao?.tb_turmas;
      
      const curso = ultimaMatricula?.tb_cursos?.designacao || 'Curso não especificado';
      const classe = turma?.tb_classes?.designacao || 'Classe não informada';
      const turmaNome = turma?.designacao || 'Turma não informada';
      
      // Verificar se tem dados bancários (só mostrar para depósito/multicaixa)
      const formaPagamentoLower = payment.formaPagamento?.designacao?.toLowerCase() || '';
      const isDeposito = formaPagamentoLower.includes('deposito') || 
                        formaPagamentoLower.includes('depósito') || 
                        formaPagamentoLower.includes('multicaixa');

      const dadosFatura = {
        numeroFatura: payment.fatura || `FAT_${Date.now()}`,
        dataEmissao: new Date(payment.data || new Date()).toLocaleString('pt-BR'),
        aluno: {
          nome: payment.aluno?.nome || 'Aluno não identificado',
          curso: curso,
          classe: classe,
          turma: turmaNome
        },
        servicos: [
          {
            descricao: payment.tipoServico?.designacao || 'Propina',
            quantidade: 1,
            precoUnitario: payment.preco || 0,
            total: payment.preco || 0
          }
        ],
        mesesPagos: `${payment.mes}`,
        formaPagamento: payment.formaPagamento?.designacao || 'DINHEIRO',
        contaBancaria: isDeposito ? payment.contaMovimentada : null,
        numeroBordero: isDeposito ? payment.n_Bordoro : null,
        subtotal: payment.preco || 0,
        iva: 0.00,
        desconto: 0.00,
        totalPagar: payment.preco || 0,
        totalPago: payment.preco || 0,
        pagoEmSaldo: 0.00,
        saldoAtual: 0.00,
        operador: nomeOperador
      };
      
      // Criar uma nova janela para impressão (mesmo HTML do MakePaymentModal)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Fatura - ${dadosFatura.numeroFatura}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 8px;
                width: 80mm;
                background: white;
                color: black;
              }
              .header {
                text-align: center;
                border-bottom: 1px solid #000;
                padding-bottom: 8px;
                margin-bottom: 8px;
              }
              .header h2 {
                font-size: 14px;
                font-weight: bold;
                margin: 0 0 4px 0;
              }
              .header p {
                margin: 2px 0;
                font-size: 11px;
              }
              .aluno {
                margin-bottom: 8px;
                font-size: 11px;
              }
              .aluno p {
                margin: 2px 0;
              }
              .servicos-table {
                width: 100%;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
                margin: 8px 0;
                border-collapse: collapse;
              }
              .servicos-table th,
              .servicos-table td {
                padding: 2px 4px;
                font-size: 10px;
                text-align: left;
              }
              .servicos-table th {
                border-bottom: 1px solid #000;
              }
              .text-right {
                text-align: right;
              }
              .totais {
                font-size: 11px;
                margin: 8px 0;
              }
              .totais p {
                margin: 2px 0;
              }
              .rodape {
                text-align: center;
                border-top: 1px solid #000;
                padding-top: 8px;
                margin-top: 12px;
                font-size: 10px;
              }
              .rodape p {
                margin: 2px 0;
              }
              .selo-pago {
                text-align: center;
                margin-top: 16px;
              }
              .selo-pago span {
                font-weight: bold;
                font-size: 16px;
                color: #2563eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/icon.png" alt="Logo Jomorais" style="width: 40px; height: auto; margin-bottom: 5px;" />
              <h2>COMPLEXO ESCOLAR PRIVADO JOMORAIS</h2>
              <p>NIF: 5101165107</p>
              <p>Bairro 1º de Maio, Zongoio - Cabinda</p>
              <p>Tlf: 915312187</p>
              <p>Data: ${dadosFatura.dataEmissao}</p>
              <p>Fatura: ${dadosFatura.numeroFatura}</p>
            </div>

            <div class="aluno">
              <p><strong>Aluno(a):</strong> ${dadosFatura.aluno.nome}</p>
              <p>Consumidor Final</p>
              <p>${dadosFatura.aluno.curso}</p>
              <p>${dadosFatura.aluno.classe} - ${dadosFatura.aluno.turma}</p>
            </div>

            <table class="servicos-table">
              <thead>
                <tr>
                  <th style="width: 50%">Serviços</th>
                  <th class="text-right" style="width: 15%">Qtd</th>
                  <th class="text-right" style="width: 17.5%">P.Unit</th>
                  <th class="text-right" style="width: 17.5%">Total</th>
                </tr>
              </thead>
              <tbody>
                ${dadosFatura.servicos.map(servico => `
                  <tr>
                    <td>${servico.descricao}</td>
                    <td class="text-right">${servico.quantidade}</td>
                    <td class="text-right">${servico.precoUnitario.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">${servico.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totais">
              <p>Forma de Pagamento: ${dadosFatura.formaPagamento}</p>
              ${dadosFatura.contaBancaria ? `<p>Conta Bancária: ${dadosFatura.contaBancaria}</p>` : ''}
              ${dadosFatura.numeroBordero ? `<p>Nº Borderô: ${dadosFatura.numeroBordero}</p>` : ''}
              <p>Mês(s) pago(s): ${dadosFatura.mesesPagos}</p>
              <p>Total: ${dadosFatura.subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              <p>Total IVA: ${dadosFatura.iva.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              <p>N.º de Itens: ${dadosFatura.servicos.length}</p>
              <p>Desconto: ${dadosFatura.desconto.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              <p>A Pagar: ${dadosFatura.totalPagar.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              <p>Total Pago: ${dadosFatura.totalPago.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              <p>Pago em Saldo: ${dadosFatura.pagoEmSaldo.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
              <p>Saldo Actual: ${dadosFatura.saldoAtual.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</p>
            </div>

            <div class="rodape">
              <p>Operador: ${dadosFatura.operador}</p>
              <p>Emitido em: ${dadosFatura.dataEmissao.split(' ')[0]}</p>
              <p>REGIME SIMPLIFICADO</p>
              <p>Processado pelo computador</p>
            </div>

            <div class="selo-pago">
              <span>[ PAGO ]</span>
            </div>
          </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Aguardar o carregamento e imprimir
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } else {
        alert('Por favor, permita pop-ups para imprimir a fatura');
      }
    } catch (error) {
      console.error('[Payments] Erro ao gerar fatura térmica:', error);
      alert('Erro ao gerar fatura térmica');
    }
  };

  const handleViewStudent = useCallback((student: AlunoConfirmado) => {
    setSelectedStudent(student)
    setShowStudentsModal(false)
    setShowFinancialModal(true)
  }, [])
  
  const handleCloseFinancialModal = useCallback(() => {
    setShowFinancialModal(false)
    setSelectedStudent(null)
  }, [])
  
  // Handler otimizado para fechar modal de alunos
  const handleCloseStudentsModal = useCallback(() => {
    setShowStudentsModal(false)
    // Reset estados ao fechar para economizar memória
    setStudentsSearch("")
    setStudentsSearchDebounced("")
    setStudentsPage(1)
  }, [])
  
  const handleMakePaymentFromStudents = useCallback((student: AlunoConfirmado) => {
    setSelectedStudent(student)
    setShowStudentsModal(false)
    setShowMakePaymentModal(true)
  }, [])

  const handleCancelPayment = (payment: PagamentoDetalhe) => {
    setSelectedPayment(payment)
    setShowCreditNoteModal(true)
  }

  const handleCreditNoteSuccess = () => {
    refetch()
    setShowCreditNoteModal(false)
    setSelectedPayment(null)
  }

  // Handler para relançar pagamento após anulação
  const handleRelaunchPayment = (payment: PagamentoDetalhe) => {
    // Fechar modal de nota de crédito
    setShowCreditNoteModal(false)
    setSelectedPayment(null)
    
    // Limpar aluno selecionado para forçar busca
    // O modal MakePaymentModal tem busca interna de alunos
    // Mostramos mensagem para o usuário saber qual aluno buscar
    setSelectedStudent(null)
    
    // Abrir modal de pagamento
    setShowMakePaymentModal(true)
    
    // Mostrar toast com instrução para o usuário
    setTimeout(() => {
      toast.info(
        `Busque o aluno: ${payment.aluno?.nome || 'N/A'} (Doc: ${payment.aluno?.n_documento_identificacao || 'N/A'}) para relançar o pagamento do mês ${payment.mes}`,
        { autoClose: 10000 }
      )
    }, 500)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000000) {
      // Bilhões
      return `${(value / 1000000000).toFixed(2)} B Kz`
    } else if (value >= 1000000) {
      // Milhões
      return `${(value / 1000000).toFixed(2)} M Kz`
    } else if (value >= 1000) {
      // Milhares
      return `${(value / 1000).toFixed(0)} K Kz`
    }
    return formatCurrency(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestão de Pagamentos
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 font-medium">Sistema ativo</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie pagamentos de propinas e outros serviços financeiros
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStudentsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <Users className="h-4 w-4" />
              Estado dos Alunos
            </button>
            <button
              onClick={() => setShowMakePaymentModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <DollarSign className="h-4 w-4" />
              Fazer Pagamento
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Recebido */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#007C00]" />
              </div>
              {dashboardStats.hasRealData && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Ativo</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Recebido</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCompactCurrency(dashboardStats.totalRecebido)}
              </p>
            </div>
          </div>

          {/* Pagamentos Hoje */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pagamentos Hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats.pagamentosHoje}
              </p>
            </div>
          </div>

          {/* Receita Mensal */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCompactCurrency(dashboardStats.receitaMensal)}
              </p>
            </div>
          </div>

          {/* Pendentes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCompactCurrency(dashboardStats.totalPendente)}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-[#007C00] font-medium hover:text-[#005a00] transition-colors"
            >
              {showFilters ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome do aluno, fatura ou borderô..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Tipo de Serviço */}
                  <div>
                    <label htmlFor="tipo-servico-filter" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                      Tipo de Serviço
                    </label>
                    <select
                      id="tipo-servico-filter"
                      title="Tipo de Serviço"
                      value={filterTipoServico}
                      onChange={(e) => setFilterTipoServico(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 text-sm"
                    >
                      <option value="">Todos os serviços</option>
                      {tiposServicoData?.data?.map((tipo) => (
                        <option key={tipo.codigo} value={tipo.designacao}>
                          {tipo.designacao}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data Início */}
                  <div>
                    <label htmlFor="data-inicio-filter" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                      Data Início
                    </label>
                    <input
                      id="data-inicio-filter"
                      title="Data Início"
                      type="date"
                      value={filterDataInicio}
                      onChange={(e) => setFilterDataInicio(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 text-sm"
                    />
                  </div>

                  {/* Data Fim */}
                  <div>
                    <label htmlFor="data-fim-filter" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                      Data Fim
                    </label>
                    <input
                      id="data-fim-filter"
                      title="Data Fim"
                      type="date"
                      value={filterDataFim}
                      onChange={(e) => setFilterDataFim(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 text-sm"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={handleFilter}
                    className="px-4 py-2 text-sm text-white bg-[#007C00] hover:bg-[#005a00] rounded-lg transition-colors shadow-sm"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Serviço / Referência
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Valor Pago
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <span className="ml-3 text-gray-600">Carregando pagamentos...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Nenhum pagamento encontrado</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.codigo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.aluno?.nome || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.aluno?.n_documento_identificacao || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.tipoServico?.designacao || '-'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Ref: {payment.mes}/{payment.ano}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-[#007C00]">
                          {formatCurrency(payment.preco)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {formatDate(payment.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handlePrintThermal(payment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Imprimir Fatura Térmica (80mm)"
                          >
                            <Receipt className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancelPayment(payment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Anular Pagamento"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{" "}
                  até{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}
                  </span>{" "}
                  de <span className="font-medium">{pagination.totalItems}</span> resultados
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pagamento</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Fechar modal"
                    title="Fechar"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informações do Pagamento */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Pagamento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fatura</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayment.fatura}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedPayment.data)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mês/Ano</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.mes}/{selectedPayment.ano}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valor</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(selectedPayment.preco)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo de Serviço</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.tipoServico?.designacao}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Forma de Pagamento</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.formaPagamento?.designacao}
                        </p>
                      </div>
                      {selectedPayment.n_Bordoro && (
                        <div>
                          <p className="text-sm text-gray-500">Nº Borderô</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPayment.n_Bordoro}</p>
                        </div>
                      )}
                      {selectedPayment.contaMovimentada && (
                        <div>
                          <p className="text-sm text-gray-500">Conta Movimentada</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPayment.contaMovimentada}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Aluno */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Aluno</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayment.aluno?.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Documento</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.aluno?.n_documento_identificacao || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  {selectedPayment.observacao && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedPayment.observacao}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        handleDownloadPDF(selectedPayment.codigo)
                        setShowDetailsModal(false)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Baixar PDF
                    </button>
                    <button
                      onClick={() => {
                        handlePrintPDF(selectedPayment.codigo)
                        setShowDetailsModal(false)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Printer className="w-5 h-5" />
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Lista de Alunos */}
        {showStudentsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden m-4">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Estado dos Alunos
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Lista de alunos confirmados com dados financeiros
                  </p>
                </div>
                <button
                  onClick={handleCloseStudentsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fechar modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Search */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Buscar por nome do aluno, documento..."
                      value={studentsSearch}
                      onChange={(e) => setStudentsSearch(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {studentsSearch !== studentsSearchDebounced && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Students List */}
                <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
                  {studentsLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Carregando alunos...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum aluno encontrado</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Aluno
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Turma
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Curso / Classe
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student) => {
                          // Try different property paths since API response might vary
                          const s = student as any;
                          const turmaStr = s.tb_matriculas?.tb_confirmacoes?.[0]?.tb_turmas?.designacao 
                                        || s.tb_matriculas?.tb_turmas?.designacao 
                                        || s.confirmacao?.turma?.designacao 
                                        || 'N/A';
                                        
                          const classeStr = s.tb_matriculas?.tb_confirmacoes?.[0]?.tb_turmas?.tb_classes?.designacao
                                         || s.tb_matriculas?.tb_turmas?.tb_classes?.designacao
                                         || s.confirmacao?.turma?.tb_classes?.designacao 
                                         || '';

                          const cursoNome = s.tb_matriculas?.tb_cursos?.designacao 
                                         || s.confirmacao?.turma?.curso?.designacao 
                                         || 'N/A';

                          const cursoStr = classeStr ? `${cursoNome} / ${classeStr}` : cursoNome;
                          
                          const getInitials = (name: string) => {
                            if (!name) return 'N/A';
                            const parts = name.trim().split(' ');
                            if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                            return name.substring(0, 2).toUpperCase();
                          };

                          return (
                            <tr key={student.codigo} className="hover:bg-gray-50/80 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                                    <span className="text-white font-bold text-[11px]">
                                      {getInitials(student.nome)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 leading-tight">{student.nome}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {student.n_documento_identificacao ? `BI: ${student.n_documento_identificacao}` : 'Sem documento'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                  {turmaStr}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-600">
                                  {cursoStr}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleViewStudent(student)}
                                    className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Visualizar
                                  </button>
                                  <button
                                    onClick={() => handleMakePaymentFromStudents(student)}
                                    className="px-3 py-1.5 text-xs font-medium bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-all shadow-sm flex items-center gap-1.5"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Pagar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {studentsPagination && studentsPagination.totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-600">
                      Mostrando {((studentsPagination.currentPage - 1) * studentsPagination.itemsPerPage) + 1} a{' '}
                      {Math.min(studentsPagination.currentPage * studentsPagination.itemsPerPage, studentsPagination.totalItems)} de{' '}
                      {studentsPagination.totalItems} alunos
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStudentsPage(studentsPagination.currentPage - 1)}
                        disabled={studentsPagination.currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setStudentsPage(studentsPagination.currentPage + 1)}
                        disabled={studentsPagination.currentPage === studentsPagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Status Financeiro do Aluno */}
        <StudentFinancialModal
          open={showFinancialModal}
          onClose={handleCloseFinancialModal}
          student={selectedStudent as any}
        />

        {/* Modal de Nota de Crédito */}
        <CreditNoteModal
          open={showCreditNoteModal}
          onClose={() => {
            setShowCreditNoteModal(false)
            setSelectedPayment(null)
          }}
          payment={selectedPayment}
          onSuccess={handleCreditNoteSuccess}
          onRelaunchPayment={handleRelaunchPayment}
        />

        {/* Modal de Fazer Pagamento */}
        <MakePaymentModal
          open={showMakePaymentModal}
          onClose={() => {
            setShowMakePaymentModal(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent as any}
          onSuccess={() => {
            refetch()
            setShowMakePaymentModal(false)
            setSelectedStudent(null)
          }}
        />
      </div>
    </Container>
  )
}
