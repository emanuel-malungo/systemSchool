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

export default function Payments() {
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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-linear-to-br from-[#182F59] to-[#1a3260] rounded-xl shadow-md">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestão de Pagamentos</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Sistema ativo</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-base max-w-2xl">
                Gerencie pagamentos de propinas e outros serviços financeiros da instituição de forma rápida e eficiente
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowStudentsModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#182F59] rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-[#182F59] shadow-md hover:shadow-lg group"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Estado dos Alunos</span>
              </button>
              <button
                onClick={() => setShowMakePaymentModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 group"
              >
                <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Fazer Pagamento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-linear-to-br from-green-50 via-white to-green-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {dashboardStats.hasRealData && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="font-bold text-xs text-emerald-600">
                    Ativo
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-green-600">Total Recebido</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCompactCurrency(dashboardStats.totalRecebido)}
              </p>
              {!dashboardStats.hasRealData && (
                <p className="text-xs text-gray-400 mt-1">Aguardando dados</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          <div className="bg-linear-to-br from-blue-50 via-white to-blue-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-[#182F59] to-[#1a3260] rounded-xl shadow-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              {dashboardStats.pagamentosHoje > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="font-bold text-xs text-blue-600">
                    Hoje
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-[#182F59]">Pagamentos Hoje</p>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardStats.pagamentosHoje}
              </p>
              {dashboardStats.pagamentosHoje === 0 && (
                <p className="text-xs text-gray-400 mt-1">Nenhum pagamento hoje</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          <div className="bg-linear-to-br from-purple-50 via-white to-purple-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              {dashboardStats.receitaMensal > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                  <span className="font-bold text-xs text-purple-600">
                    Mês
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-purple-600">Receita Mensal</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCompactCurrency(dashboardStats.receitaMensal)}
              </p>
              {dashboardStats.receitaMensal === 0 && (
                <p className="text-xs text-gray-400 mt-1">Sem receita este mês</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          <div className="bg-linear-to-br from-orange-50 via-white to-orange-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              {dashboardStats.totalPendente > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  <span className="font-bold text-xs text-orange-600">
                    Aberto
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-orange-600">Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCompactCurrency(dashboardStats.totalPendente)}
              </p>
              {dashboardStats.totalPendente === 0 && (
                <p className="text-xs text-gray-400 mt-1">Nenhum valor pendente</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome do aluno, fatura ou borderô..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tipo de Serviço */}
                  <div>
                    <label htmlFor="tipo-servico-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Serviço
                    </label>
                    <select
                      id="tipo-servico-filter"
                      title="Tipo de Serviço"
                      value={filterTipoServico}
                      onChange={(e) => setFilterTipoServico(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label htmlFor="data-inicio-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Data Início
                    </label>
                    <input
                      id="data-inicio-filter"
                      title="Data Início"
                      type="date"
                      value={filterDataInicio}
                      onChange={(e) => setFilterDataInicio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Data Fim */}
                  <div>
                    <label htmlFor="data-fim-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Data Fim
                    </label>
                    <input
                      id="data-fim-filter"
                      title="Data Fim"
                      type="date"
                      value={filterDataFim}
                      onChange={(e) => setFilterDataFim(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFilter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpar Filtros
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês/Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {payment.fatura || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {payment.aluno?.nome || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.aluno?.n_documento_identificacao || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {payment.tipoServico?.designacao || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {payment.mes}/{payment.ano}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {payment.formaPagamento?.designacao || 'DINHEIRO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(payment.preco)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
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
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Aluno</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Documento</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Turma</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Curso</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.codigo} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{student.nome}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.n_documento_identificacao}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.confirmacao?.turma?.designacao || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.confirmacao?.turma?.tb_classes?.designacao || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewStudent(student)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  Visualizar
                                </button>
                                <button
                                  onClick={() => handleMakePaymentFromStudents(student)}
                                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  <DollarSign className="w-4 h-4 inline mr-1" />
                                  Pagar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
