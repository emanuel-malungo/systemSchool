import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  BookOpen,
  Users,
  BarChart3,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import {
  useGrades,
  useCreateGrade,
  useUpdateGrade,
  useDeleteGrade,
} from '../../../hooks/useGrade'
import { useStudentsComplete } from '../../../hooks/useStudent'
import { useDisciplines } from '../../../hooks/useDiscipline'
import { useTurmasComplete } from '../../../hooks/useTurma'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useTiposAvaliacao } from '../../../hooks/useAcademicEvaluation'
import type { Grade, CreateGradePayload } from '../../../types/grade.types'

interface FilterState {
  page: number
  limit: number
  codigoAluno?: number
  codigoDisciplina?: number
  codigoTurma?: number
  codigoAnoLectivo?: number
}

interface FormState {
  codigoAluno: string
  codigoDisciplina: string
  nota: string
  codigoAnoLectivo: string
  codigoTipoAvaliacao: string
  codigoTrimestre: string
  codigoTurma?: string
}

export default function GradeLaunching() {
  // Estados de filtro
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Estados de modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isEditingGrade, setIsEditingGrade] = useState<Grade | null>(null)
  const [formData, setFormData] = useState<FormState>({
    codigoAluno: '',
    codigoDisciplina: '',
    nota: '',
    codigoAnoLectivo: '',
    codigoTipoAvaliacao: '',
    codigoTrimestre: '',
    codigoTurma: '',
  })

  // Estados de busca para selects
  const [studentSearch, setStudentSearch] = useState('')
  const [disciplineSearch, setDisciplineSearch] = useState('')
  const [turmaSearch, setTurmaSearch] = useState('')

  // Hooks de dados
  const { data: gradesData, isLoading: isLoadingGrades } = useGrades(
    filters.page,
    filters.limit,
    {
      codigoAluno: filters.codigoAluno,
      codigoDisciplina: filters.codigoDisciplina,
      codigoTurma: filters.codigoTurma,
      codigoAnoLectivo: filters.codigoAnoLectivo,
    }
  )

  // Hooks para dados dos selects
  const { data: studentsData, isLoading: isLoadingStudents } = useStudentsComplete(true)
  const { data: disciplinesData, isLoading: isLoadingDisciplines } = useDisciplines({ 
    page: 1, 
    limit: 1000,
    search: disciplineSearch 
  })
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmasComplete(turmaSearch)
  const { data: anosLetivosData, isLoading: isLoadingAnosLectivos } = useAnosLectivos({ page: 1, limit: 1000 })
  const { data: tiposAvaliacaoData, isLoading: isLoadingTiposAvaliacao } = useTiposAvaliacao(1, 100)

  // Hooks de mutação
  const { mutate: createGrade, isPending: isCreating } = useCreateGrade()
  const { mutate: updateGrade, isPending: isUpdating } = useUpdateGrade()
  const { mutate: deleteGrade, isPending: isDeleting } = useDeleteGrade()

  // Dados extraídos
  const grades = gradesData?.data || []
  const pagination = gradesData?.pagination

  // Dados dos selects
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []
  const disciplines = disciplinesData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []
  const anosLetivos = anosLetivosData?.data || []
  const tiposAvaliacao = tiposAvaliacaoData?.data || []

  // Filtros locais para dados que vêm sem paginação
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students
    const term = studentSearch.toLowerCase()
    return students.filter(s => 
      s.nome?.toLowerCase().includes(term) || 
      s.codigo?.toString().includes(term)
    )
  }, [students, studentSearch])

  const filteredDisciplines = useMemo(() => {
    // Já filtra via API com 'search' param, mas podemos filtrar localmente também
    return disciplines
  }, [disciplines])

  const filteredTurmas = useMemo(() => {
    // Já filtra via API com 'turmaSearch' param
    return turmas
  }, [turmas])

  // Trimestres fixos (1, 2, 3)
  const trimestres = [
    { codigo: 1, designacao: '1º Trimestre' },
    { codigo: 2, designacao: '2º Trimestre' },
    { codigo: 3, designacao: '3º Trimestre' },
  ]

  // Estatísticas
  const stats = useMemo(() => {
    if (!grades.length) return { media: 0, aprovados: 0, reprovados: 0, total: 0 }

    const media = grades.reduce((sum, g) => sum + g.Nota, 0) / grades.length
    const aprovados = grades.filter(g => g.Nota >= 10).length
    const reprovados = grades.filter(g => g.Nota < 10).length

    return {
      media: media.toFixed(2),
      aprovados,
      reprovados,
      total: grades.length,
    }
  }, [grades])

  // Handlers
  const handleOpenForm = (grade?: Grade) => {
    if (grade) {
      setIsEditingGrade(grade)
      setFormData({
        codigoAluno: grade.CodigoAluno.toString(),
        codigoDisciplina: grade.CodigoDisciplina.toString(),
        nota: grade.Nota.toString(),
        codigoAnoLectivo: grade.CodigoAnoLectivo.toString(),
        codigoTipoAvaliacao: grade.CodigoTipoAvaliacao.toString(),
        codigoTrimestre: grade.CodigoTrimestre.toString(),
        codigoTurma: grade.CodigoTurma?.toString() || '',
      })
    } else {
      setIsEditingGrade(null)
      setFormData({
        codigoAluno: '',
        codigoDisciplina: '',
        nota: '',
        codigoAnoLectivo: '',
        codigoTipoAvaliacao: '',
        codigoTrimestre: '',
        codigoTurma: '',
      })
    }
    setIsFormModalOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormModalOpen(false)
    setIsEditingGrade(null)
    setFormData({
      codigoAluno: '',
      codigoDisciplina: '',
      nota: '',
      codigoAnoLectivo: '',
      codigoTipoAvaliacao: '',
      codigoTrimestre: '',
      codigoTurma: '',
    })
    // Limpar filtros de busca
    setStudentSearch('')
    setDisciplineSearch('')
    setTurmaSearch('')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (
      !formData.codigoAluno ||
      !formData.codigoDisciplina ||
      !formData.nota ||
      !formData.codigoAnoLectivo ||
      !formData.codigoTipoAvaliacao ||
      !formData.codigoTrimestre
    ) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const nota = parseFloat(formData.nota)
    if (nota < 0 || nota > 20) {
      alert('A nota deve estar entre 0 e 20')
      return
    }

    try {
      if (isEditingGrade) {
        updateGrade({
          id: isEditingGrade.Codigo,
          data: {
            nota,
          },
        })
      } else {
        const payload: CreateGradePayload = {
          codigoAluno: parseInt(formData.codigoAluno),
          codigoDisciplina: parseInt(formData.codigoDisciplina),
          nota,
          codigoAnoLectivo: parseInt(formData.codigoAnoLectivo),
          codigoTipoAvaliacao: parseInt(formData.codigoTipoAvaliacao),
          codigoTrimestre: parseInt(formData.codigoTrimestre),
          codigoUtilizador: 1, // TODO: Usar usuario logado
          codigoTurma: formData.codigoTurma ? parseInt(formData.codigoTurma) : undefined,
        }
        createGrade(payload)
      }
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
    }
  }

  const handleDeleteGrade = (gradeId: number) => {
    if (confirm('Tem certeza que deseja deletar esta nota?')) {
      deleteGrade(gradeId)
    }
  }

  const getStatusBadge = (nota: number) => {
    if (nota >= 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Aprovado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Reprovado
      </span>
    )
  }

  const totalPages = pagination?.totalPages || 1
  const currentPage = pagination?.currentPage || 1

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-emerald-50 via-white to-emerald-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Lançamento de Notas
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie e lance as notas dos alunos por disciplina e trimestre
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Lançar Nota
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total de Notas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Média de Notas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.media}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Aprovados</p>
              <p className="text-3xl font-bold text-green-600">{stats.aprovados}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Reprovados</p>
              <p className="text-3xl font-bold text-red-600">{stats.reprovados}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por aluno ou disciplina..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setFilters(f => ({ ...f, page: 1 }))
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{grades.length}</span> de{' '}
            <span className="text-gray-900 font-bold">{pagination?.totalItems || 0}</span> notas
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters(f => ({ ...f, page: 1 }))
              }}
              className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Notas */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aluno</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Disciplina</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trimestre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nota</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ano Letivo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingGrades ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
                    <p className="text-gray-600">Carregando notas...</p>
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-gray-600 font-medium">Nenhuma nota encontrada</p>
                    <p className="text-sm text-gray-500">Clique em "Lançar Nota" para adicionar a primeira nota</p>
                  </td>
                </tr>
              ) : (
                grades.map(grade => (
                  <tr key={grade.Codigo} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{grade.tb_alunos?.nome || `Aluno ${grade.CodigoAluno}`}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{grade.tb_disciplinas?.designacao || `Disciplina ${grade.CodigoDisciplina}`}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{grade.tb_trimestres?.designacao || `Trimestre ${grade.CodigoTrimestre}`}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-lg text-gray-900">{grade.Nota.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(grade.Nota)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">2024/2025</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenForm(grade)}
                          className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade.Codigo)}
                          disabled={isDeleting}
                          className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!isLoadingGrades && grades.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                disabled={currentPage === 1 || isLoadingGrades}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                disabled={currentPage === totalPages || isLoadingGrades}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditingGrade ? 'Editar Nota' : 'Lançar Nota'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {!isEditingGrade && (
                <>
                  {/* Aluno com busca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aluno * ({filteredStudents.length})
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar aluno por nome ou código..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] mb-2"
                    />
                    <select
                      value={formData.codigoAluno}
                      onChange={e => {
                        setFormData(f => ({ ...f, codigoAluno: e.target.value }))
                        setStudentSearch('')
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                      disabled={isLoadingStudents}
                    >
                      <option value="">Selecione um aluno...</option>
                      {isLoadingStudents ? (
                        <option disabled>Carregando alunos...</option>
                      ) : filteredStudents.length === 0 ? (
                        <option disabled>Nenhum aluno encontrado</option>
                      ) : (
                        filteredStudents.map(student => (
                          <option key={student.codigo} value={student.codigo}>
                            {student.nome} (#{student.codigo})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Disciplina com busca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disciplina * ({filteredDisciplines.length})
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar disciplina..."
                      value={disciplineSearch}
                      onChange={(e) => setDisciplineSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] mb-2"
                    />
                    <select
                      value={formData.codigoDisciplina}
                      onChange={e => {
                        setFormData(f => ({ ...f, codigoDisciplina: e.target.value }))
                        setDisciplineSearch('')
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                      disabled={isLoadingDisciplines}
                    >
                      <option value="">Selecione uma disciplina...</option>
                      {isLoadingDisciplines ? (
                        <option disabled>Carregando disciplinas...</option>
                      ) : filteredDisciplines.length === 0 ? (
                        <option disabled>Nenhuma disciplina encontrada</option>
                      ) : (
                        filteredDisciplines.map(discipline => (
                          <option key={discipline.codigo} value={discipline.codigo}>
                            {discipline.designacao}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Ano Letivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano Letivo * ({anosLetivos.length})
                    </label>
                    <select
                      value={formData.codigoAnoLectivo}
                      onChange={e => setFormData(f => ({ ...f, codigoAnoLectivo: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                      disabled={isLoadingAnosLectivos}
                    >
                      <option value="">Selecione um ano letivo...</option>
                      {isLoadingAnosLectivos ? (
                        <option disabled>Carregando anos letivos...</option>
                      ) : anosLetivos.length === 0 ? (
                        <option disabled>Nenhum ano letivo disponível</option>
                      ) : (
                        anosLetivos.map(ano => (
                          <option key={ano.codigo} value={ano.codigo}>
                            {ano.designacao}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Tipo de Avaliação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Avaliação * ({tiposAvaliacao.length})
                    </label>
                    <select
                      value={formData.codigoTipoAvaliacao}
                      onChange={e => setFormData(f => ({ ...f, codigoTipoAvaliacao: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                      disabled={isLoadingTiposAvaliacao}
                    >
                      <option value="">Selecione um tipo de avaliação...</option>
                      {isLoadingTiposAvaliacao ? (
                        <option disabled>Carregando tipos de avaliação...</option>
                      ) : tiposAvaliacao.length === 0 ? (
                        <option disabled>Nenhum tipo de avaliação disponível</option>
                      ) : (
                        tiposAvaliacao.map(tipo => (
                          <option key={tipo.codigo} value={tipo.codigo}>
                            {tipo.designacao}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Trimestre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trimestre *
                    </label>
                    <select
                      value={formData.codigoTrimestre}
                      onChange={e => setFormData(f => ({ ...f, codigoTrimestre: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                    >
                      <option value="">Selecione um trimestre...</option>
                      {trimestres.map(trimestre => (
                        <option key={trimestre.codigo} value={trimestre.codigo}>
                          {trimestre.designacao}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Turma com busca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turma (Opcional) ({filteredTurmas.length})
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar turma..."
                      value={turmaSearch}
                      onChange={(e) => setTurmaSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] mb-2"
                    />
                    <select
                      value={formData.codigoTurma}
                      onChange={e => {
                        setFormData(f => ({ ...f, codigoTurma: e.target.value }))
                        setTurmaSearch('')
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                      disabled={isLoadingTurmas}
                    >
                      <option value="">Selecione uma turma (opcional)...</option>
                      {isLoadingTurmas ? (
                        <option disabled>Carregando turmas...</option>
                      ) : filteredTurmas.length === 0 ? (
                        <option disabled>Nenhuma turma encontrada</option>
                      ) : (
                        filteredTurmas.map(turma => (
                          <option key={turma.codigo} value={turma.codigo}>
                            {turma.designacao}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (0-20) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={formData.nota}
                  onChange={e => setFormData(f => ({ ...f, nota: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                  placeholder="Ex: 15.5"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2 bg-[#007C00] text-white rounded-lg font-medium hover:bg-[#005a00] transition-colors disabled:opacity-50"
                >
                  {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  )
}
