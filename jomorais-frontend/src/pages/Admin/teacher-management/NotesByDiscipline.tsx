import { useState, useMemo } from 'react'
import {
  BookOpen,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import { useConsolidatedDisciplineStatistics } from '../../../hooks/useGrade'
import { useTurmasComplete } from '../../../hooks/useTurma'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import type { ITurma } from '../../../types/turma.types'
import { usePageTitle } from '../../../hooks/usePageTitle'

interface FilterState {
  codigoTurma: string
  codigoAnoLectivo: string
  codigoTrimestre: string
}

export default function NotesByDiscipline() {
  usePageTitle('Notas por Disciplina')
  // Estados de filtro
  const [filters, setFilters] = useState<FilterState>({
    codigoTurma: '',
    codigoAnoLectivo: '',
    codigoTrimestre: '1',
  })

  // Estados de expansão de disciplinas
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<number>>(new Set())

  // Hooks de dados para os selects
  const { data: anosLetivosData, isLoading: isLoadingAnosLetivos } = useAnosLectivos({ page: 1, limit: 1000 })
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmasComplete('')

  const anosLetivos = anosLetivosData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []

  // Filtrar as turmas de acordo com o Ano Letivo selecionado
  const filteredTurmas = useMemo(() => {
    if (!filters.codigoAnoLectivo) return []
    return turmas.filter((t: ITurma) => t.codigo_AnoLectivo?.toString() === filters.codigoAnoLectivo)
  }, [turmas, filters.codigoAnoLectivo])

  const isContextSelected = useMemo(() => {
    return !!filters.codigoTurma && !!filters.codigoAnoLectivo && !!filters.codigoTrimestre
  }, [filters.codigoTurma, filters.codigoAnoLectivo, filters.codigoTrimestre])

  // Hooks de dados
  const { data: statsData, isLoading: isLoadingStats } = useConsolidatedDisciplineStatistics(
    filters.codigoTurma ? parseInt(filters.codigoTurma) : 0,
    filters.codigoTrimestre ? parseInt(filters.codigoTrimestre) : 0,
    filters.codigoAnoLectivo ? parseInt(filters.codigoAnoLectivo) : 0,
    isContextSelected
  )

  const disciplineStats = statsData?.data?.disciplinas || statsData?.disciplinas || []
  const generalStats = statsData?.data?.geral || statsData?.geral || {
    totalDisciplinas: 0,
    mediaGeral: 0,
    totalAprovados: 0,
    totalReprovados: 0,
    percentualAprovacaoGeral: 0,
  }

  // Handlers
  const toggleDisciplineExpanded = (disciplinaId: number) => {
    const newExpanded = new Set(expandedDisciplines)
    if (newExpanded.has(disciplinaId)) {
      newExpanded.delete(disciplinaId)
    } else {
      newExpanded.add(disciplinaId)
    }
    setExpandedDisciplines(newExpanded)
  }

  const handleAnoLectivoChange = (value: string) => {
    setFilters(f => ({ ...f, codigoAnoLectivo: value, codigoTurma: '' }))
  }

  const handleTurmaChange = (value: string) => {
    setFilters(f => ({ ...f, codigoTurma: value }))
  }

  const getStatusBadge = (nota: number) => {
    if (nota >= 10) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Aprovado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Reprovado
      </span>
    )
  }

  const getDisciplinePerformanceColor = (percentual: number) => {
    if (percentual >= 80) return 'text-green-600'
    if (percentual >= 60) return 'text-blue-600'
    if (percentual >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notas por Disciplina
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Dashboard consolidado de notas agrupadas por disciplina
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Ano Letivo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ano Letivo *
            </label>
            <select
              value={filters.codigoAnoLectivo}
              onChange={e => handleAnoLectivoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Turma *
            </label>
            <select
              value={filters.codigoTurma}
              onChange={e => handleTurmaChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
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

          {/* Trimestre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trimestre *
            </label>
            <select
              value={filters.codigoTrimestre}
              onChange={e => setFilters(f => ({ ...f, codigoTrimestre: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
            >
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setExpandedDisciplines(new Set())}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      {isContextSelected && disciplineStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Disciplinas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {generalStats.totalDisciplinas}
                </p>
              </div>
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Média Geral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {generalStats.mediaGeral.toFixed(2)}
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Aprovados</p>
                <p className="text-2xl font-bold text-[#007C00]">
                  {generalStats.totalAprovados}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-[#007C00]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Reprovados</p>
                <p className="text-2xl font-bold text-red-600">
                  {generalStats.totalReprovados}
                </p>
              </div>
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Taxa Aprovação</p>
                <p className={`text-2xl font-bold ${getDisciplinePerformanceColor(generalStats.percentualAprovacaoGeral)}`}>
                  {generalStats.percentualAprovacaoGeral.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Disciplinas */}
      <div className="space-y-4">
        {!isContextSelected ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-900 font-semibold">Filtros não selecionados</p>
            <p className="text-sm text-gray-500 mt-1">
              Selecione o Ano Letivo, a Turma e o Trimestre acima para visualizar as notas agrupadas por disciplina.
            </p>
          </div>
        ) : isLoadingStats ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
            <p className="text-gray-600">Carregando notas...</p>
          </div>
        ) : disciplineStats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-900 font-semibold">Nenhuma nota encontrada</p>
            <p className="text-sm text-gray-500 mt-1">
              Não existem notas lançadas para a turma, ano letivo e trimestre selecionados.
            </p>
          </div>
        ) : (
          disciplineStats.map((discipline: any) => (
            <div
              key={discipline.codigoDisciplina}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Header da Disciplina */}
              <button
                onClick={() => toggleDisciplineExpanded(discipline.codigoDisciplina)}
                className="w-full px-6 py-4 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {expandedDisciplines.has(discipline.codigoDisciplina) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {discipline.nomeDisciplina}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Código: {discipline.codigoDisciplina}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end md:self-auto">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Alunos</p>
                      <p className="text-xl font-bold text-gray-900">
                        {discipline.totalAlunos}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Média</p>
                      <p className="text-xl font-bold text-gray-900">
                        {discipline.media.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Aprovação</p>
                      <p
                        className={`text-xl font-bold ${getDisciplinePerformanceColor(discipline.percentualAprovacao)}`}
                      >
                        {discipline.percentualAprovacao.toFixed(0)}%
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-600 text-sm">
                            {discipline.aprovados}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-bold text-red-600 text-sm">
                            {discipline.reprovados}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Detalhes da Disciplina */}
              {expandedDisciplines.has(discipline.codigoDisciplina) && (
                <div className="border-t border-gray-200 bg-gray-50/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Aluno
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            MAC
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            PP
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            PT
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Nota Final
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {discipline.alunos?.map((aluno: any, idx: number) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-3">
                              <p className="font-semibold text-gray-900">
                                {aluno.nomeAluno}
                              </p>
                            </td>
                            <td className="px-6 py-3 text-gray-600 text-sm">
                              {aluno.codigoAluno}
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600 text-sm font-medium">
                              {aluno.MAC !== null && aluno.MAC !== undefined ? aluno.MAC.toFixed(1) : '-'}
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600 text-sm font-medium">
                              {aluno.PP !== null && aluno.PP !== undefined ? aluno.PP.toFixed(1) : '-'}
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600 text-sm font-medium">
                              {aluno.PT !== null && aluno.PT !== undefined ? aluno.PT.toFixed(1) : '-'}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className={`font-bold text-sm ${aluno.notaFinal >= 10 ? 'text-[#007C00]' : 'text-red-600'}`}>
                                {aluno.notaFinal.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              {getStatusBadge(aluno.notaFinal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Rodapé com informações */}
      {isContextSelected && disciplineStats.length > 0 && (
        <div className="mt-8 bg-green-50/50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#007C00] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#007C00]">
              <p className="font-semibold mb-1">Resumo da Análise:</p>
              <ul className="space-y-1 opacity-90">
                <li>
                  • Total de disciplinas: <strong>{generalStats.totalDisciplinas}</strong>
                </li>
                <li>
                  • Total de médias calculadas:{' '}
                  <strong>
                    {generalStats.totalAprovados + generalStats.totalReprovados}
                  </strong>
                </li>
                <li>
                  • Taxa geral de aprovação:{' '}
                  <strong>{generalStats.percentualAprovacaoGeral.toFixed(1)}%</strong>
                </li>
                <li>
                  • Melhor disciplina:{' '}
                  <strong>
                    {disciplineStats[0]?.nomeDisciplina} ({disciplineStats[0]?.media.toFixed(2)})
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>
    </Container>
  )
}
