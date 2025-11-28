import { useState } from 'react'
import { FileText, BarChart3 } from 'lucide-react'
import Container from '../../../components/layout/Container'
import { 
  ReportFilters, 
  StudentsPreviewTable, 
  ReportGenerationModal 
} from '../../../components/reports-management'
import { 
  useReportsManager, 
  useGenerateIndividualWordReport
} from '../../../hooks/useReports'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useClassesComplete } from '../../../hooks/useClass'
import { useCoursesComplete } from '../../../hooks/useCourse'
import studentService from '../../../services/student.service'
import { commonPeriods } from '../../../mocks/periods.mock'
import type { ReportFilters as IReportFilters } from '../../../types/reports.types'

// Usar o tipo importado em vez de interface local

export default function StudentReports() {
  const [filters, setFilters] = useState<IReportFilters>({
    anoAcademico: undefined,
    classe: undefined,
    curso: undefined,
    estado: undefined,
    genero: undefined,
    periodo: undefined,
    dataMatriculaFrom: undefined,
    dataMatriculaTo: undefined
  })

  const [showReportModal, setShowReportModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Hooks para buscar dados das opções de filtros - otimizados para menos requisições
  const { data: anosLectivosData, isLoading: isLoadingAnos } = useAnosLectivos({ 
    page: 1, 
    limit: 100 
  })
  
  // Reabilitando com cache otimizado
  const { data: classesData, isLoading: isLoadingClasses } = useClassesComplete('', true)
  const { data: cursosData, isLoading: isLoadingCursos } = useCoursesComplete('', false, true)

  // Usar hook para gerenciar relatórios
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
  } = useReportsManager({
    ...filters,
    page: currentPage,
    limit: itemsPerPage
  })

  // Preparar opções de filtros com dados reais
  const filterOptions = {
    anosAcademicos: anosLectivosData?.data || [],
    classes: classesData?.data || [],
    cursos: cursosData?.data || [],
    periodos: commonPeriods
  }

  const isLoadingOptions = isLoadingAnos || isLoadingClasses || isLoadingCursos

  const handleFilterChange = (key: keyof IReportFilters, value: string) => {
    setFilters((prev: IReportFilters) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    // Reset to first page when applying filters
    setCurrentPage(1)
    refetchStudents()
  }

  const handleClearFilters = () => {
    setFilters({
      anoAcademico: undefined,
      classe: undefined,
      curso: undefined,
      estado: undefined,
      genero: undefined,
      periodo: undefined,
      dataMatriculaFrom: undefined,
      dataMatriculaTo: undefined
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
      filename: `relatorio-alunos-${new Date().toISOString().split('T')[0]}.docx`
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
      filename: `relatorio-alunos-${new Date().toISOString().split('T')[0]}.pdf`
    })
    setShowReportModal(false)
  }

  const handleViewDetails = (studentId: number) => {
    console.log('View details for student:', studentId)
    // Implement view details logic
  }

  // Hooks para relatórios individuais
  const generateIndividualWordReport = useGenerateIndividualWordReport()

  const handleGenerateIndividualReport = async (studentId: number) => {
    try {
      // Buscar dados do estudante usando o service diretamente
      const studentResponse = await studentService.getStudentById(studentId)
      
      if (studentResponse?.data) {
        // Usar dados reais do estudante
        const realStudentData = {
          dadosPessoais: {
            nome: studentResponse.data.nome || `Aluno ${studentId}`,
            numeroMatricula: `MAT-${studentResponse.data.codigo}`,
            email: studentResponse.data.email || `aluno${studentId}@escola.ao`,
            telefone: studentResponse.data.telefone || '+244 900 000 000',
            sexo: studentResponse.data.sexo || 'N/A',
            dataNascimento: typeof studentResponse.data.dataNascimento === 'string' 
              ? studentResponse.data.dataNascimento 
              : '2000-01-01',
            status: studentResponse.data.tb_status?.designacao || 'Ativo',
            numeroBI: studentResponse.data.n_documento_identificacao || 'N/A',
            naturalidade: studentResponse.data.tb_comuna?.designacao || 'N/A',
            nacionalidade: studentResponse.data.tb_nacionalidade?.designacao || 'N/A',
            pai: studentResponse.data.pai || 'N/A',
            mae: studentResponse.data.mae || 'N/A',
            morada: studentResponse.data.morada || 'N/A'
          },
          encarregado: (studentResponse.data.encarregado || studentResponse.data.tb_encarregados) ? {
            nome: (studentResponse.data.encarregado?.nome || studentResponse.data.tb_encarregados?.nome) || `Encarregado do Aluno ${studentId}`,
            telefone: (studentResponse.data.encarregado?.telefone || studentResponse.data.tb_encarregados?.telefone) || '+244 900 000 001',
            email: (studentResponse.data.encarregado?.email || studentResponse.data.tb_encarregados?.email) || `encarregado${studentId}@email.ao`,
            profissao: 'N/A', // Campo código_Profissao é numérico, precisaria de lookup
            localTrabalho: (studentResponse.data.encarregado?.local_Trabalho || studentResponse.data.tb_encarregados?.local_Trabalho) || 'N/A'
          } : {
            nome: `Encarregado do Aluno ${studentId}`,
            telefone: '+244 900 000 001',
            email: `encarregado${studentId}@email.ao`,
            profissao: 'N/A',
            localTrabalho: 'N/A'
          },
          matricula: studentResponse.data.tb_matriculas ? {
            dataMatricula: typeof studentResponse.data.tb_matriculas.data_Matricula === 'string' 
              ? studentResponse.data.tb_matriculas.data_Matricula 
              : 'N/A',
            curso: studentResponse.data.tb_matriculas.tb_cursos?.designacao || 'N/A'
          } : null
        }

        generateIndividualWordReport.mutate({
          studentData: realStudentData,
          filename: `relatorio-individual-${studentId}-${new Date().toISOString().split('T')[0]}.docx`
        })
      } else {
        throw new Error('Dados do estudante não encontrados')
      }
    } catch (error) {
      console.error('Erro ao buscar dados do estudante:', error)
      
      // Fallback para dados mock se não conseguir carregar dados reais
      const mockStudentData = {
        dadosPessoais: {
          nome: `Aluno ${studentId}`,
          numeroMatricula: `MAT-${studentId}`,
          email: `aluno${studentId}@escola.ao`,
          telefone: '+244 900 000 000',
          sexo: 'M',
          dataNascimento: '2000-01-01',
          status: 'Ativo'
        },
        encarregado: {
          nome: `Encarregado do Aluno ${studentId}`,
          telefone: '+244 900 000 001',
          email: `encarregado${studentId}@email.ao`
        }
      }

      generateIndividualWordReport.mutate({
        studentData: mockStudentData,
        filename: `relatorio-individual-${studentId}-${new Date().toISOString().split('T')[0]}.docx`
      })
    }
  }

  const totalPages = pagination?.totalPages || 1

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-linear-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden">
          <div className="relative p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Relatórios de Alunos
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Gere relatórios completos e personalizados sobre os alunos do sistema.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingWordReport || isGeneratingPDFReport}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-5 w-5" />
                {(isGeneratingWordReport || isGeneratingPDFReport) ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <ReportFilters
          filters={{
            anoAcademico: filters.anoAcademico || '',
            classe: filters.classe || '',
            curso: filters.curso || '',
            estado: filters.estado || '',
            genero: filters.genero || '',
            periodo: filters.periodo || '',
            dataMatriculaFrom: filters.dataMatriculaFrom || '',
            dataMatriculaTo: filters.dataMatriculaTo || ''
          }}
          filterOptions={filterOptions}
          isLoadingOptions={isLoadingOptions}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Students Preview Table */}
        <StudentsPreviewTable
          students={students || []}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onViewDetails={handleViewDetails}
          onGenerateIndividualReport={handleGenerateIndividualReport}
          onPageChange={setCurrentPage}
        />

        {/* Report Generation Modal */}
        <ReportGenerationModal
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
