import { useState } from 'react'
import { BookOpen, TrendingUp, Search, Filter } from 'lucide-react'
import Container from '../../../components/layout/Container'
import { 
  AcademicStudentsTable, 
  AcademicReportGenerationModal,
  AcademicStatisticsCards,
  AcademicStudentDetailsModal,
  AcademicReportFiltersModal
} from '../../../components/academic-reports'
import { 
  useAcademicReportsManager
} from '../../../hooks/useAcademicReports'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useClassesComplete } from '../../../hooks/useClass'
import { useCoursesComplete } from '../../../hooks/useCourse'
import { commonPeriods } from '../../../mocks/periods.mock'
import type { AcademicReportFilters as IAcademicReportFilters, StudentAcademicData } from '../../../types/academic-reports.types'

export default function AcademicReports() {
  const [filters, setFilters] = useState<IAcademicReportFilters>({
    anoAcademico: undefined,
    classe: undefined,
    curso: undefined,
    turma: undefined,
    disciplina: undefined,
    professor: undefined,
    periodo: undefined,
    trimestre: 'todos',
    statusAluno: 'todos',
    tipoRelatorio: 'todos',
    dataInicio: undefined,
    dataFim: undefined
  })

  const [showReportModal, setShowReportModal] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentAcademicData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Hooks para buscar dados das opções de filtros
  const { data: anosLectivosData, isLoading: isLoadingAnos } = useAnosLectivos({ 
    page: 1, 
    limit: 100 
  })
  
  const { data: classesData, isLoading: isLoadingClasses } = useClassesComplete('', true)
  const { data: cursosData, isLoading: isLoadingCursos } = useCoursesComplete('', false, true)

  // Usar hook para gerenciar relatórios acadêmicos
  const {
    students,
    pagination,
    statistics,
    filterOptions: apiFilterOptions,
    isGeneratingReport,
    isGeneratingWordReport,
    isGeneratingPDFReport,
    generateWordReport,
    generatePDFReport,
    refetchStudents
  } = useAcademicReportsManager({
    ...filters,
    page: currentPage,
    limit: itemsPerPage
  })

  // Preparar opções de filtros com dados reais
  const filterOptions = {
    anosAcademicos: anosLectivosData?.data || apiFilterOptions?.anosAcademicos || [],
    classes: classesData?.data || apiFilterOptions?.classes || [],
    cursos: cursosData?.data || apiFilterOptions?.cursos || [],
    turmas: apiFilterOptions?.turmas || [],
    disciplinas: apiFilterOptions?.disciplinas || [],
    professores: apiFilterOptions?.professores || [],
    periodos: commonPeriods.map((periodo) => ({
      value: periodo.designacao,
      label: periodo.designacao,
    })),
    trimestres: [
      { value: 'todos', label: 'Todos os Trimestres' },
      { value: '1', label: '1º Trimestre' },
      { value: '2', label: '2º Trimestre' },
      { value: '3', label: '3º Trimestre' }
    ],
    statusAluno: [
      { value: 'todos', label: 'Todos os Status' },
      { value: 'ativo', label: 'Ativo' },
      { value: 'transferido', label: 'Transferido' },
      { value: 'desistente', label: 'Desistente' },
      { value: 'finalizado', label: 'Finalizado' }
    ],
    tiposRelatorio: [
      { value: 'todos', label: 'Todos os Tipos' },
      { value: 'notas', label: 'Notas' },
      { value: 'frequencia', label: 'Frequência' },
      { value: 'aproveitamento', label: 'Aproveitamento' }
    ]
  }

  const isLoadingOptions = isLoadingAnos || isLoadingClasses || isLoadingCursos

  const handleFilterChange = (key: keyof IAcademicReportFilters, value: string | undefined) => {
    setFilters((prev: IAcademicReportFilters) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    refetchStudents()
  }

  const handleClearFilters = () => {
    setFilters({
      anoAcademico: undefined,
      classe: undefined,
      curso: undefined,
      turma: undefined,
      disciplina: undefined,
      professor: undefined,
      periodo: undefined,
      trimestre: 'todos',
      statusAluno: 'todos',
      tipoRelatorio: 'todos',
      dataInicio: undefined,
      dataFim: undefined
    })
    setCurrentPage(1)
  }

  const handleGenerateReport = () => {
    setShowReportModal(true)
  }

  const handleGenerateWordReport = () => {
    if (!students || !statistics) {
      console.error('Dados insuficientes para gerar relatório')
      return
    }

    generateWordReport({
      students,
      statistics,
      filters,
      filename: `relatorio-academico-${new Date().toISOString().split('T')[0]}.docx`
    })
    setShowReportModal(false)
  }

  const handleGeneratePDFReport = () => {
    if (!students || !statistics) {
      console.error('Dados insuficientes para gerar relatório')
      return
    }

    generatePDFReport({
      students,
      statistics,
      filters,
      filename: `relatorio-academico-${new Date().toISOString().split('T')[0]}.pdf`
    })
    setShowReportModal(false)
  }

  const handleViewStudentDetails = (studentId: number) => {
    const student = students?.find((s) => s.codigo === studentId) || null
    if (!student) return

    setSelectedStudent(student)
    setShowStudentDetailsModal(true)
  }

  const totalPages = pagination?.totalPages || 1

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Relatórios Acadêmicos
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Acompanhe o desempenho acadêmico, notas e frequência dos alunos
              </p>
            </div>
          </div>
          
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingWordReport || isGeneratingPDFReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="h-4 w-4" />
            {(isGeneratingWordReport || isGeneratingPDFReport) ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <AcademicStatisticsCards statistics={statistics} />
        )}

        {/* Filtros e Pesquisa */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Barra de Pesquisa Geral */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
              />
            </div>
            
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 font-medium text-sm"
            >
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </button>
          </div>
        </div>

        {/* Filters Modal */}
        <AcademicReportFiltersModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          filterOptions={filterOptions}
          isLoadingOptions={isLoadingOptions}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Students Table */}
        <AcademicStudentsTable
          students={students || []}
          currentPage={currentPage}
          totalPages={totalPages}
          onViewDetails={handleViewStudentDetails}
          onPageChange={setCurrentPage}
        />

        {/* Report Generation Modal */}
        <AcademicReportGenerationModal
          isOpen={showReportModal}
          isGenerating={isGeneratingReport}
          isGeneratingWord={isGeneratingWordReport}
          isGeneratingPDF={isGeneratingPDFReport}
          onClose={() => setShowReportModal(false)}
          onGenerateWordReport={handleGenerateWordReport}
          onGeneratePDFReport={handleGeneratePDFReport}
        />

        {/* Student Details Modal */}
        <AcademicStudentDetailsModal
          isOpen={showStudentDetailsModal}
          student={selectedStudent}
          onClose={() => setShowStudentDetailsModal(false)}
        />
      </div>
    </Container>
  )
}
