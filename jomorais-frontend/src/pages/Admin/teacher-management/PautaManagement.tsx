import { useState, useMemo, Fragment } from 'react'
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import {
  usePauta,
  useExportPautaExcel,
} from '../../../hooks/useGrade'
import { useTurmasComplete } from '../../../hooks/useTurma'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import type { ITurma } from '../../../types/turma.types'
import { toast } from 'react-toastify'

interface FilterState {
  codigoTurma: string
  codigoTrimestre: string
  codigoAnoLectivo: string
  page: number
  limit: number
}

export default function PautaManagement() {
  // Estados de filtro
  const [filters, setFilters] = useState<FilterState>({
    codigoTurma: '',
    codigoTrimestre: '1',
    codigoAnoLectivo: '',
    page: 1,
    limit: 10,
  })

  const [turmaSearch, setTurmaSearch] = useState('')
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false)
  const [isGeneratingPauta, setIsGeneratingPauta] = useState(false)

  // Hooks de dados para os selects
  const { data: anosLetivosData, isLoading: isLoadingAnosLetivos } = useAnosLectivos({ page: 1, limit: 1000 })
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmasComplete('')

  const anosLetivos = anosLetivosData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []

  // Filtrar as turmas de acordo com o Ano Letivo selecionado e o termo de busca
  const filteredTurmas = useMemo(() => {
    if (!filters.codigoAnoLectivo) return []
    return turmas.filter((t: ITurma) => {
      const matchAno = t.codigo_AnoLectivo?.toString() === filters.codigoAnoLectivo
      if (!matchAno) return false
      if (turmaSearch.trim() === '') return true
      return t.designacao.toLowerCase().includes(turmaSearch.toLowerCase())
    })
  }, [turmas, filters.codigoAnoLectivo, turmaSearch])

  // Turma e Ano selecionados
  const selectedTurma = useMemo(() => {
    if (!filters.codigoTurma) return null
    return turmas.find((t: ITurma) => t.codigo?.toString() === filters.codigoTurma)
  }, [turmas, filters.codigoTurma])

  const selectedAnoLetivo = useMemo(() => {
    if (!filters.codigoAnoLectivo) return null
    return anosLetivos.find((a: any) => a.codigo?.toString() === filters.codigoAnoLectivo)
  }, [anosLetivos, filters.codigoAnoLectivo])

  // Verificar se os filtros obrigatórios foram selecionados
  const isContextSelected = useMemo(() => {
    return !!filters.codigoTurma && !!filters.codigoAnoLectivo && !!filters.codigoTrimestre
  }, [filters.codigoTurma, filters.codigoAnoLectivo, filters.codigoTrimestre])

  // Hook de dados para carregar a pauta
  const { data: pautaResponse, isLoading: isLoadingPauta, refetch: refetchPauta } = usePauta(
    parseInt(filters.codigoTurma) || 0,
    parseInt(filters.codigoTrimestre) || 1,
    parseInt(filters.codigoAnoLectivo) || 0,
    isContextSelected
  )

  const pauta = pautaResponse?.data

  // Processar e consolidar a pauta do backend em uma estrutura matricial (grid de disciplinas)
  const consolidatedPauta = useMemo(() => {
    if (!pauta) return null

    const rawPauta = (pauta as any).pauta || {}
    const uniqueStudentIds = Object.keys(rawPauta)

    // Obter todas as disciplinas únicas na pauta para gerar colunas da tabela
    const disciplineNames = new Set<string>()
    Object.values(rawPauta).forEach((studentData: any) => {
      studentData.disciplinas?.forEach((d: any) => {
        if (d.disciplina) {
          disciplineNames.add(d.disciplina)
        }
      })
    })
    const uniqueDisciplines = Array.from(disciplineNames).sort()

    // Calcular estatísticas e médias
    let totalAprovados = 0
    let totalReprovados = 0
    let sumAverages = 0
    let evaluatedStudentsCount = 0

    uniqueStudentIds.forEach(studentId => {
      const studentData = rawPauta[studentId]
      const grades = studentData.disciplinas
        ?.map((d: any) => d.nota)
        .filter((g: any) => g !== null && g !== undefined && !isNaN(g)) || []

      if (grades.length > 0) {
        const avg = grades.reduce((sum: number, val: number) => sum + val, 0) / grades.length
        sumAverages += avg
        evaluatedStudentsCount++
        if (avg >= 10) {
          totalAprovados++
        } else {
          totalReprovados++
        }
      }
    })

    const mediaGeral = evaluatedStudentsCount > 0 ? sumAverages / evaluatedStudentsCount : 0

    return {
      totalAlunos: uniqueStudentIds.length,
      mediaGeral,
      alunosAprovados: totalAprovados,
      alunosReprovados: totalReprovados,
      uniqueDisciplines,
      rawPauta,
      studentIds: uniqueStudentIds
    }
  }, [pauta])

  // Paginação dos alunos
  const paginatedStudentIds = useMemo(() => {
    if (!consolidatedPauta) return []
    const start = (filters.page - 1) * filters.limit
    const end = start + filters.limit
    return consolidatedPauta.studentIds.slice(start, end)
  }, [consolidatedPauta, filters.page, filters.limit])

  // Hooks de mutação
  const { mutate: exportExcel, isPending: isExportingExcel } = useExportPautaExcel()

  // Handlers
  const handleGeneratePauta = async () => {
    if (!filters.codigoTurma || !filters.codigoAnoLectivo) {
      toast.error('Por favor, selecione a turma e o ano letivo')
      return
    }

    setIsGeneratingPauta(true)
    try {
      // Refetch para carregar/gerar a pauta
      await refetchPauta()
      toast.success('Pauta gerada com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar pauta:', error)
      toast.error('Erro ao gerar pauta')
    } finally {
      setIsGeneratingPauta(false)
      setShowGenerateConfirm(false)
    }
  }

  const handleExportExcel = () => {
    if (!pauta) return
    exportExcel({
      codigoTurma: parseInt(filters.codigoTurma),
      codigoTrimestre: parseInt(filters.codigoTrimestre),
      codigoAnoLectivo: parseInt(filters.codigoAnoLectivo),
    })
  }


  const handleAnoLectivoChange = (value: string) => {
    setFilters(f => ({ ...f, codigoAnoLectivo: value, codigoTurma: '', page: 1 }))
    setTurmaSearch('')
  }

  const handleTurmaChange = (value: string) => {
    setFilters(f => ({ ...f, codigoTurma: value, page: 1 }))
  }

  const trimestres = [
    { codigo: 1, designacao: '1º Trimestre' },
    { codigo: 2, designacao: '2º Trimestre' },
    { codigo: 3, designacao: '3º Trimestre' },
  ]

  const totalPages = consolidatedPauta ? Math.ceil(consolidatedPauta.totalAlunos / filters.limit) : 0
  const currentPage = filters.page

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestão de Pautas
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gere, visualize e publique as pautas consolidadas por turma e trimestre
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros de pauta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Ano Letivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ano Letivo *
            </label>
            <select
              value={filters.codigoAnoLectivo}
              onChange={e => handleAnoLectivoChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
              disabled={isLoadingAnosLetivos}
            >
              <option value="">Selecione um ano...</option>
              {anosLetivos.map((ano: any) => (
                <option key={ano.codigo} value={ano.codigo}>
                  {ano.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Turma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Turma *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="🔍 Pesquisar turma..."
                value={turmaSearch}
                onChange={e => setTurmaSearch(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
                disabled={!filters.codigoAnoLectivo || isLoadingTurmas}
              />
              <select
                value={filters.codigoTurma}
                onChange={e => handleTurmaChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
                disabled={!filters.codigoAnoLectivo || isLoadingTurmas}
              >
                <option value="">Selecione uma turma...</option>
                {filteredTurmas.map((turma: ITurma) => (
                  <option key={turma.codigo} value={turma.codigo}>
                    {turma.designacao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trimestre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Trimestre *
            </label>
            <select
              value={filters.codigoTrimestre}
              onChange={e => setFilters(f => ({ ...f, codigoTrimestre: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            >
              {trimestres.map(t => (
                <option key={t.codigo} value={t.codigo}>
                  {t.designacao}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowGenerateConfirm(true)}
              disabled={!filters.codigoTurma || !filters.codigoAnoLectivo || isGeneratingPauta}
              className="w-full py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              {isGeneratingPauta ? <Loader2 className="h-5 w-5 animate-spin" /> : <BarChart3 className="h-5 w-5" />}
              Gerar Pauta
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Consolidadas da Pauta */}
      {consolidatedPauta && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">{consolidatedPauta.totalAlunos}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Aprovados</p>
                <p className="text-3xl font-bold text-green-600">{consolidatedPauta.alunosAprovados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Reprovados</p>
                <p className="text-3xl font-bold text-red-600">{consolidatedPauta.alunosReprovados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Média Geral</p>
                <p className="text-3xl font-bold text-purple-600">{consolidatedPauta.mediaGeral.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Ações da Pauta */}
      {consolidatedPauta && (
        <div className="flex flex-wrap gap-3 mb-6">
          {/* <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-semibold shadow-xs"
          >
            {isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar PDF
          </button> */}

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 font-semibold shadow-xs"
          >
            {isExportingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar Excel
          </button>



          <button
            onClick={() => refetchPauta()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold ml-auto shadow-xs"
          >
            <Calendar className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      )}

      {/* Grid de Exibição da Pauta Matricial */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!isContextSelected ? (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-600 font-medium">Nenhuma turma ou ano letivo selecionados</p>
            <p className="text-sm text-gray-500">Selecione os filtros acima para poder visualizar a pauta.</p>
          </div>
        ) : isLoadingPauta ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
            <p className="text-gray-600">Buscando pauta da turma...</p>
          </div>
        ) : !consolidatedPauta || consolidatedPauta.totalAlunos === 0 ? (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-600 font-medium">Esta pauta ainda não foi gerada</p>
            <p className="text-sm text-gray-500 mb-4">Clique no botão "Gerar Pauta" para calculá-la e exibi-la.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap border-collapse border border-gray-200 text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-900 w-12 border border-gray-200">Nº</th>
                  <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-900 w-24 border border-gray-200">Nº PROC</th>
                  <th rowSpan={2} className="px-6 py-3 text-left font-bold text-gray-900 border border-gray-200 min-w-[200px]">NOME DO ALUNO</th>
                  {consolidatedPauta.uniqueDisciplines.map(disc => (
                    <th key={disc} colSpan={2} className="px-2 py-2 text-center font-bold text-gray-900 border border-gray-200 max-w-[120px] truncate" title={disc}>
                      {disc.toUpperCase()}
                    </th>
                  ))}
                  <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-900 w-20 border border-gray-200">MÉDIA</th>
                  <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-900 w-16 border border-gray-200">Idade</th>
                  <th rowSpan={2} className="px-4 py-3 text-center font-bold text-gray-900 w-16 border border-gray-200">Género</th>
                  <th rowSpan={2} className="px-6 py-3 text-center font-bold text-gray-900 w-36 border border-gray-200">OBS</th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {consolidatedPauta.uniqueDisciplines.map(disc => (
                    <Fragment key={disc}>
                      <th className="px-2 py-1 text-center font-semibold text-gray-500 border border-gray-200 w-10">F</th>
                      <th className="px-2 py-1 text-center font-semibold text-gray-500 border border-gray-200 w-12">MT</th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStudentIds.map((studentId, index) => {
                  const studentData = consolidatedPauta.rawPauta[studentId]
                  const student = studentData.aluno
                  const avg = studentData.mediaGeral || 0
                  const status = studentData.situacao
                  const hasGrades = studentData.disciplinas?.some((d: any) => d.nota !== null)

                  // Mapeia as notas do aluno para as colunas das disciplinas correspondentes
                  const gradesByDisc = consolidatedPauta.uniqueDisciplines.map(discName => {
                    const d = studentData.disciplinas?.find((item: any) => item.disciplina === discName)
                    return d ? { nota: d.nota, faltas: d.faltas } : { nota: null, faltas: 0 }
                  })

                  return (
                    <tr key={studentId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-center text-gray-500 font-medium border border-gray-200">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="px-4 py-2.5 text-center text-gray-600 font-medium border border-gray-200">
                        {student.codigo}
                      </td>
                      <td className="px-6 py-2.5 font-semibold text-gray-900 border border-gray-200">
                        {student.nome.toUpperCase()}
                      </td>
                      {gradesByDisc.map((dObj, idx) => (
                        <Fragment key={idx}>
                          {/* Faltas */}
                          <td className="px-2 py-2.5 text-center text-gray-500 border border-gray-200 font-medium">
                            {dObj.faltas > 0 ? dObj.faltas : '-'}
                          </td>
                          {/* MT */}
                          <td className="px-2 py-2.5 text-center border border-gray-200 font-bold">
                            <span
                              className={
                                dObj.nota !== null
                                  ? dObj.nota >= 10
                                    ? 'text-[#007C00]'
                                    : 'text-red-600'
                                  : 'text-gray-400 font-normal'
                              }
                            >
                              {dObj.nota !== null ? dObj.nota.toFixed(1) : '-'}
                            </span>
                          </td>
                        </Fragment>
                      ))}
                      {/* Média */}
                      <td className="px-4 py-2.5 text-center border border-gray-200 font-bold">
                        <span className={hasGrades ? (avg >= 10 ? 'text-[#007C00]' : 'text-red-600') : 'text-gray-400 font-normal'}>
                          {hasGrades ? avg.toFixed(2) : '-'}
                        </span>
                      </td>
                      {/* Idade */}
                      <td className="px-4 py-2.5 text-center text-gray-600 font-medium border border-gray-200">
                        {student.idade !== null && student.idade !== undefined ? student.idade : '-'}
                      </td>
                      {/* Género */}
                      <td className="px-4 py-2.5 text-center text-gray-600 font-medium border border-gray-200">
                        {student.genero || '-'}
                      </td>
                      {/* OBS */}
                      <td className="px-6 py-2.5 text-center border border-gray-200">
                        {status === 'TRANS' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-[#007C00] border border-green-200">
                            TRANSITA
                          </span>
                        ) : status === 'N/TRAN' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            N/TRANSITA
                          </span>
                        ) : status === 'DESIST.' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 italic">
                            DESISTIDA
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages} ({consolidatedPauta.totalAlunos} alunos)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Geração */}
      {showGenerateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gerar Pauta</h2>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja processar e gerar a pauta consolidada para:
            </p>

            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Turma:</span>
                <span className="font-semibold text-gray-900">
                  {selectedTurma?.designacao || `#${filters.codigoTurma}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trimestre:</span>
                <span className="font-semibold text-gray-900">
                  {parseInt(filters.codigoTrimestre)}º
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ano Letivo:</span>
                <span className="font-semibold text-gray-900">
                  {selectedAnoLetivo?.designacao || `#${filters.codigoAnoLectivo}`}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowGenerateConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGeneratePauta}
                disabled={isGeneratingPauta}
                className="flex-1 px-4 py-2 bg-[#007C00] text-white rounded-lg font-medium hover:bg-[#005a00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingPauta ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
