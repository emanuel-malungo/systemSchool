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
import { useGrades } from '../../../hooks/useGrade'

interface DisciplineStats {
  codigoDisciplina: number
  nomeDisciplina: string
  totalAlunos: number
  media: number
  aprovados: number
  reprovados: number
  percentualAprovacao: number
  notas: any[]
}

interface FilterState {
  codigoTurma: string
  codigoAnoLectivo: string
}

export default function NotesByDiscipline() {
  // Estados de filtro
  const [filters, setFilters] = useState<FilterState>({
    codigoTurma: '',
    codigoAnoLectivo: '',
  })

  // Estados de expansão de disciplinas
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<number>>(new Set())

  // Hooks de dados
  const { data: gradesData, isLoading: isLoadingGrades } = useGrades(
    1,
    1000, // Buscar muitos para agrupar
    {
      codigoTurma: filters.codigoTurma ? parseInt(filters.codigoTurma) : undefined,
      codigoAnoLectivo: filters.codigoAnoLectivo ? parseInt(filters.codigoAnoLectivo) : undefined,
    }
  )

  // Dados extraídos
  const grades = gradesData?.data || []

  // Agrupar notas por disciplina
  const disciplineStats = useMemo(() => {
    const stats = new Map<number, DisciplineStats>()

    grades.forEach(grade => {
      const disciplinaId = grade.CodigoDisciplina
      const disciplinaName = grade.tb_disciplinas?.designacao || `Disciplina ${disciplinaId}`

      if (!stats.has(disciplinaId)) {
        stats.set(disciplinaId, {
          codigoDisciplina: disciplinaId,
          nomeDisciplina: disciplinaName,
          totalAlunos: 0,
          media: 0,
          aprovados: 0,
          reprovados: 0,
          percentualAprovacao: 0,
          notas: [],
        })
      }

      const disciplinaStat = stats.get(disciplinaId)!
      disciplinaStat.notas.push(grade)
      disciplinaStat.totalAlunos++

      if (grade.Nota >= 10) {
        disciplinaStat.aprovados++
      } else {
        disciplinaStat.reprovados++
      }
    })

    // Calcular média e percentual
    stats.forEach((stat) => {
      if (stat.notas.length > 0) {
        stat.media = stat.notas.reduce((sum, g) => sum + g.Nota, 0) / stat.notas.length
        stat.percentualAprovacao = (stat.aprovados / stat.totalAlunos) * 100
      }
    })

    return Array.from(stats.values()).sort((a, b) => b.media - a.media)
  }, [grades])

  // Estatísticas gerais
  const generalStats = useMemo(() => {
    if (disciplineStats.length === 0) {
      return {
        totalDisciplinas: 0,
        mediaGeral: 0,
        totalAprovados: 0,
        totalReprovados: 0,
        percentualAprovacaoGeral: 0,
      }
    }

    const totalAprovados = disciplineStats.reduce((sum, d) => sum + d.aprovados, 0)
    const totalReprovados = disciplineStats.reduce((sum, d) => sum + d.reprovados, 0)
    const mediaGeral =
      disciplineStats.reduce((sum, d) => sum + d.media * d.totalAlunos, 0) /
      (totalAprovados + totalReprovados)

    return {
      totalDisciplinas: disciplineStats.length,
      mediaGeral: mediaGeral || 0,
      totalAprovados,
      totalReprovados,
      percentualAprovacaoGeral:
        ((totalAprovados / (totalAprovados + totalReprovados)) * 100) || 0,
    }
  }, [disciplineStats])

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
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-indigo-50 via-white to-indigo-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100/30 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="h-8 w-8 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Notas por Disciplina
                </h1>
                <p className="text-gray-600 text-lg">
                  Dashboard consolidado de notas agrupadas por disciplina
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código da Turma
            </label>
            <input
              type="number"
              value={filters.codigoTurma}
              onChange={e => setFilters(f => ({ ...f, codigoTurma: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
              placeholder="Ex: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano Letivo
            </label>
            <input
              type="number"
              value={filters.codigoAnoLectivo}
              onChange={e => setFilters(f => ({ ...f, codigoAnoLectivo: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
              placeholder="Ex: 1"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setExpandedDisciplines(new Set())}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      {disciplineStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Disciplinas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {generalStats.totalDisciplinas}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Média Geral</p>
                <p className="text-3xl font-bold text-gray-900">
                  {generalStats.mediaGeral.toFixed(2)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Aprovados</p>
                <p className="text-3xl font-bold text-green-600">
                  {generalStats.totalAprovados}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Reprovados</p>
                <p className="text-3xl font-bold text-red-600">
                  {generalStats.totalReprovados}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Taxa Aprovação</p>
                <p className={`text-3xl font-bold ${getDisciplinePerformanceColor(generalStats.percentualAprovacaoGeral)}`}>
                  {generalStats.percentualAprovacaoGeral.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Disciplinas */}
      <div className="space-y-4">
        {isLoadingGrades ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
            <p className="text-gray-600">Carregando notas...</p>
          </div>
        ) : disciplineStats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-600 font-medium">Nenhuma nota encontrada</p>
            <p className="text-sm text-gray-500">
              Selecione os filtros para visualizar notas por disciplina
            </p>
          </div>
        ) : (
          disciplineStats.map(discipline => (
            <div
              key={discipline.codigoDisciplina}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header da Disciplina */}
              <button
                onClick={() => toggleDisciplineExpanded(discipline.codigoDisciplina)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
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

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Alunos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {discipline.totalAlunos}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Média</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {discipline.media.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Aprovação</p>
                      <p
                        className={`text-2xl font-bold ${getDisciplinePerformanceColor(discipline.percentualAprovacao)}`}
                      >
                        {discipline.percentualAprovacao.toFixed(0)}%
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              {discipline.aprovados}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="font-bold text-red-600">
                              {discipline.reprovados}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Detalhes da Disciplina */}
              {expandedDisciplines.has(discipline.codigoDisciplina) && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                            Aluno
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                            Trimestre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                            Nota
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                            Tipo Avaliação
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {discipline.notas.map((nota, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 hover:bg-white transition-colors"
                          >
                            <td className="px-6 py-3">
                              <p className="font-medium text-gray-900">
                                {nota.tb_alunos?.nome || `Aluno ${nota.CodigoAluno}`}
                              </p>
                            </td>
                            <td className="px-6 py-3 text-gray-600 text-sm">
                              {nota.CodigoAluno}
                            </td>
                            <td className="px-6 py-3 text-gray-600 text-sm">
                              {nota.tb_trimestres?.designacao || `Trimestre ${nota.CodigoTrimestre}`}
                            </td>
                            <td className="px-6 py-3">
                              <span className="font-bold text-lg text-gray-900">
                                {nota.Nota.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              {getStatusBadge(nota.Nota)}
                            </td>
                            <td className="px-6 py-3 text-gray-600 text-sm">
                              {nota.tb_tipo_avaliacao?.designacao ||
                                `Avaliação ${nota.CodigoTipoAvaliacao}`}
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
      {disciplineStats.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Resumo da Análise:</p>
              <ul className="space-y-1 text-blue-800">
                <li>
                  • Total de disciplinas: <strong>{generalStats.totalDisciplinas}</strong>
                </li>
                <li>
                  • Total de notas registradas:{' '}
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
    </Container>
  )
}
