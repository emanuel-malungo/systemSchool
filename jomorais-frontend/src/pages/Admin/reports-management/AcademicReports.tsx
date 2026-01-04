import { useState } from 'react'
import { BookOpen, TrendingUp } from 'lucide-react'
import Container from '../../../components/layout/Container'
import { 
  AcademicReportFilters, 
  AcademicStudentsTable, 
  AcademicReportGenerationModal,
  AcademicStatisticsCards,
  AcademicStudentDetailsModal
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
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false)
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
    anosAcademicos: anosLectivosData?.data || [],
    classes: classesData?.data || [],
    cursos: cursosData?.data || [],
    turmas: [], // TODO: Implementar hook para turmas
    disciplinas: [], // TODO: Implementar hook para disciplinas
    professores: [], // TODO: Implementar hook para professores
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
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl shadow-lg overflow-hidden">
          <div className="relative p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/30 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Relatórios Acadêmicos
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Acompanhe o desempenho acadêmico, notas e frequência dos alunos.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingWordReport || isGeneratingPDFReport}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUp className="h-5 w-5" />
                {(isGeneratingWordReport || isGeneratingPDFReport) ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <AcademicStatisticsCards statistics={statistics} />
        )}

        {/* Filters Section */}
        <AcademicReportFilters
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
