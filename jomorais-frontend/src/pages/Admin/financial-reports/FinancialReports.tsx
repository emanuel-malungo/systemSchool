import { useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import Container from '../../../components/layout/Container'
import ErrorBoundary from '../../../components/common/ErrorBoundary'
import { 
  FinancialReportFilters, 
  FinancialTransactionsTable, 
  FinancialReportGenerationModal,
  FinancialStatisticsCards
} from '../../../components/financial-reports'
import { 
  useFinancialReportsManager
} from '../../../hooks/useFinancialReports'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useClassesComplete } from '../../../hooks/useClass'
import { useCoursesComplete } from '../../../hooks/useCourse'
import { commonPeriods } from '../../../mocks/periods.mock'
import type { FinancialReportFilters as IFinancialReportFilters } from '../../../types/financial-reports.types'

export default function FinancialReports() {
  const initialFilters: IFinancialReportFilters = {
    anoAcademico: undefined,
    classe: undefined,
    curso: undefined,
    periodo: undefined,
    tipoTransacao: 'todos',
    statusPagamento: 'todos',
    dataInicio: undefined,
    dataFim: undefined,
    valorMinimo: undefined,
    valorMaximo: undefined
  }

  const [filters, setFilters] = useState<IFinancialReportFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<IFinancialReportFilters>(initialFilters)

  const [showReportModal, setShowReportModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Hooks para buscar dados das opções de filtros
  const { data: anosLectivosData, isLoading: isLoadingAnos } = useAnosLectivos({ 
    page: 1, 
    limit: 100 
  })
  
  const { data: classesData, isLoading: isLoadingClasses } = useClassesComplete('', true)
  const { data: cursosData, isLoading: isLoadingCursos } = useCoursesComplete('', false, true)

  // Usar hook para gerenciar relatórios financeiros
  const {
    transactions,
    pagination,
    statistics,
    isLoadingTransactions,
    isGeneratingReport,
    isGeneratingWordReport,
    isGeneratingPDFReport,
    generateWordReport,
    generatePDFReport,
  } = useFinancialReportsManager({
    filters: appliedFilters,
    page: currentPage,
    limit: itemsPerPage
  })

  // Preparar opções de filtros com dados reais
  const filterOptions = {
    anosAcademicos: anosLectivosData?.data || [],
    classes: classesData?.data || [],
    cursos: cursosData?.data || [],
    periodos: commonPeriods.map(period => ({
      value: period.designacao,
      label: period.designacao
    })),
    tiposTransacao: [
      { value: 'todos', label: 'Todos os Tipos' },
      { value: 'pagamento', label: 'Pagamento' },
      { value: 'propina', label: 'Propina' },
      { value: 'multa', label: 'Multa' },
      { value: 'desconto', label: 'Desconto' }
    ],
    statusPagamento: [
      { value: 'todos', label: 'Todos os Status' },
      { value: 'pago', label: 'Pago' },
      { value: 'pendente', label: 'Pendente' },
      { value: 'atrasado', label: 'Atrasado' },
      { value: 'cancelado', label: 'Cancelado' }
    ],
    metodosPagamento: [
      { value: 'dinheiro', label: 'Dinheiro' },
      { value: 'transferencia', label: 'Transferência Bancária' },
      { value: 'multicaixa', label: 'Multicaixa Express' },
      { value: 'outros', label: 'Outros' }
    ]
  }

  const isLoadingOptions = isLoadingAnos || isLoadingClasses || isLoadingCursos

  const handleFilterChange = (key: keyof IFinancialReportFilters, value: string | number | undefined) => {
    setFilters((prev: IFinancialReportFilters) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    // Reset to first page when applying filters
    setCurrentPage(1)
    setAppliedFilters(filters)
  }

  const handleClearFilters = () => {
    const clearedFilters: IFinancialReportFilters = {
      anoAcademico: undefined,
      classe: undefined,
      curso: undefined,
      periodo: undefined,
      tipoTransacao: 'todos',
      statusPagamento: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined
    }

    setFilters(clearedFilters)
    setAppliedFilters(clearedFilters)
    setCurrentPage(1)
  }

  const handleGenerateReport = () => {
    setShowReportModal(true)
  }

  const handleGenerateWordReport = () => {
    if (!transactions || !statistics) {
      console.error('Dados insuficientes para gerar relatório')
      return
    }

    generateWordReport({
      transactions,
      statistics,
      filters,
      filename: `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.docx`
    })
    setShowReportModal(false)
  }

  const handleGeneratePDFReport = () => {
    if (!transactions || !statistics) {
      console.error('Dados insuficientes para gerar relatório')
      return
    }

    generatePDFReport({
      transactions,
      statistics,
      filters,
      filename: `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`
    })
    setShowReportModal(false)
  }

  const handleViewTransactionDetails = (transactionId: number) => {
    console.log('View details for transaction:', transactionId)
    // Implement transaction details logic
  }

  const totalPages = pagination?.totalPages || 1

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
          <div className="relative p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Relatórios Financeiros
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Gere relatórios completos e detalhados sobre as transações financeiras da escola.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingWordReport || isGeneratingPDFReport}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUp className="h-5 w-5" />
                {(isGeneratingWordReport || isGeneratingPDFReport) ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <ErrorBoundary>
          <FinancialStatisticsCards statistics={statistics} />
        </ErrorBoundary>

        {/* Filters Section */}
        <FinancialReportFilters
          filters={filters}
          filterOptions={filterOptions}
          isLoadingOptions={isLoadingOptions}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Transactions Table */}
        <ErrorBoundary>
          {isLoadingTransactions ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center text-gray-600">Carregando transações...</div>
            </div>
          ) : (
            <FinancialTransactionsTable
              transactions={transactions || []}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onViewDetails={handleViewTransactionDetails}
              onPageChange={setCurrentPage}
            />
          )}
        </ErrorBoundary>

        {/* Report Generation Modal */}
        <FinancialReportGenerationModal
          isOpen={showReportModal}
          isGenerating={isGeneratingReport}
          isGeneratingWord={isGeneratingWordReport}
          isGeneratingPDF={isGeneratingPDFReport}
          onClose={() => setShowReportModal(false)}
          onGenerateWordReport={handleGenerateWordReport}
          onGeneratePDFReport={handleGeneratePDFReport}
        />
      </div>
    </Container>
  )
}
