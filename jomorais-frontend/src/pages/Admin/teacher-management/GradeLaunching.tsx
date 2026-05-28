import { useState, useMemo, useEffect } from 'react'
import {
  BookOpen,
  Users,
  BarChart3,
  AlertCircle,
  Loader2,
  Save,
  GraduationCap,
  CheckCircle,
  Clock,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import { useGrades, useUpdateGrade, useImportGradesBulk } from '../../../hooks/useGrade'
import { useAlunosByTurma, useTurmasComplete, useTurmaWithDisciplinas } from '../../../hooks/useTurma'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useTiposAvaliacao } from '../../../hooks/useAcademicEvaluation'
import { useAuth } from '../../../hooks/useAuth'
import { toast } from 'react-toastify'
import type { ITurma } from '../../../types/turma.types'

export default function GradeLaunching() {
  const { user } = useAuth()

  // Estados dos seletores de contexto
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState('')
  const [selectedTurmaId, setSelectedTurmaId] = useState('')
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('')
  const [selectedTrimestre, setSelectedTrimestre] = useState('')

  // Estados adicionais
  const [localGrades, setLocalGrades] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  // Hooks de busca de dados
  const { data: anosLetivosData, isLoading: isLoadingAnosLetivos } = useAnosLectivos({ page: 1, limit: 1000 })
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmasComplete('')
  const { data: tiposAvaliacaoData, isLoading: isLoadingTiposAvaliacao } = useTiposAvaliacao(1, 100)

  const anosLetivos = anosLetivosData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []
  const tiposAvaliacao = tiposAvaliacaoData?.data || []

  // Filtrar as turmas de acordo com o Ano Letivo selecionado
  const filteredTurmas = useMemo(() => {
    if (!selectedAnoLectivo) return []
    return turmas.filter((t: ITurma) => t.codigo_AnoLectivo?.toString() === selectedAnoLectivo)
  }, [turmas, selectedAnoLectivo])

  // Obter a turma selecionada atualmente
  const selectedTurma = useMemo(() => {
    if (!selectedTurmaId) return null
    return turmas.find((t: ITurma) => t.codigo?.toString() === selectedTurmaId)
  }, [turmas, selectedTurmaId])

  // Hooks dependentes da turma e disciplina selecionadas
  const { data: alunosTurmaResponse, isLoading: isLoadingAlunos } = useAlunosByTurma(
    selectedTurma?.codigo || 0,
    !!selectedTurma?.codigo
  )
  
  // Novo hook que já retorna a turma com as disciplinas incluídas
  const { data: turmaWithDisciplinasResponse, isLoading: isLoadingDisciplinas } = useTurmaWithDisciplinas(
    selectedTurma?.codigo || 0,
    !!selectedTurma?.codigo
  )

  const students = (alunosTurmaResponse as any)?.data || (Array.isArray(alunosTurmaResponse) ? alunosTurmaResponse : [])
  
  // Extrair disciplinas da turma com disciplinas
  const disciplines = useMemo(() => {
    console.log('turmaWithDisciplinasResponse:', turmaWithDisciplinasResponse)
    
    const turmaData = turmaWithDisciplinasResponse?.data
    if (turmaData && Array.isArray(turmaData.disciplinas)) {
      console.log('Disciplinas da turma:', turmaData.disciplinas)
      return turmaData.disciplinas
    }

    console.log('Nenhuma disciplina encontrada')
    return []
  }, [turmaWithDisciplinasResponse])

  // Verificar se todo o contexto necessário foi selecionado
  const isContextSelected = useMemo(() => {
    return !!selectedAnoLectivo && !!selectedTurmaId && !!selectedDisciplinaId && !!selectedTrimestre
  }, [selectedAnoLectivo, selectedTurmaId, selectedDisciplinaId, selectedTrimestre])

  // Buscar notas existentes para este contexto
  const { data: gradesData, isLoading: isLoadingGrades, refetch: refetchGrades } = useGrades(
    1,
    1000,
    {
      codigoTurma: selectedTurmaId ? parseInt(selectedTurmaId) : undefined,
      codigoDisciplina: selectedDisciplinaId ? parseInt(selectedDisciplinaId) : undefined,
      codigoTrimestre: selectedTrimestre ? parseInt(selectedTrimestre) : undefined,
      codigoAnoLectivo: selectedAnoLectivo ? parseInt(selectedAnoLectivo) : undefined,
    },
    isContextSelected
  )

  const { mutateAsync: importBulk } = useImportGradesBulk()
  const { mutateAsync: updateGrade } = useUpdateGrade()

  // Sincronizar notas do backend com o estado local ao carregar ou mudar contexto
  useEffect(() => {
    if (gradesData?.data && isContextSelected) {
      const gradesMap: Record<string, number> = {}
      gradesData.data.forEach((grade: any) => {
        gradesMap[`${grade.CodigoAluno}-${grade.CodigoTipoAvaliacao}`] = grade.Nota
      })
      setLocalGrades(gradesMap)
    } else {
      setLocalGrades({})
    }
  }, [gradesData, isContextSelected])

  // Limpar seleções dependentes
  const handleAnoLectivoChange = (value: string) => {
    setSelectedAnoLectivo(value)
    setSelectedTurmaId('')
    setSelectedDisciplinaId('')
    setLocalGrades({})
  }

  const handleTurmaChange = (value: string) => {
    setSelectedTurmaId(value)
    setSelectedDisciplinaId('')
    setLocalGrades({})
  }

  // Trimestres fixos (1, 2, 3)
  const trimestres = [
    { codigo: 1, designacao: '1º Trimestre' },
    { codigo: 2, designacao: '2º Trimestre' },
    { codigo: 3, designacao: '3º Trimestre' },
  ]

  // Calcula a média das notas inseridas localmente para um aluno específico
  const getStudentAverage = (studentId: number) => {
    const studentGrades = tiposAvaliacao
      .map(tipo => localGrades[`${studentId}-${tipo.codigo}`])
      .filter(val => val !== undefined && val !== null && !isNaN(val))
    
    if (studentGrades.length === 0) return undefined
    const sum = studentGrades.reduce((a, b) => a + b, 0)
    return sum / studentGrades.length
  }

  // Estatísticas gerais baseadas nas notas da turma
  const stats = useMemo(() => {
    if (!students.length) return { media: '0.00', aprovados: 0, reprovados: 0, total: 0 }

    let totalGradesCount = 0
    let sumGrades = 0
    let aprovados = 0
    let reprovados = 0

    students.forEach((student: any) => {
      const avg = getStudentAverage(student.codigo)
      if (avg !== undefined) {
        sumGrades += avg
        totalGradesCount++
        if (avg >= 10) {
          aprovados++
        } else {
          reprovados++
        }
      }
    });

    return {
      media: totalGradesCount > 0 ? (sumGrades / totalGradesCount).toFixed(2) : '0.00',
      aprovados,
      reprovados,
      total: totalGradesCount,
    }
  }, [students, localGrades, tiposAvaliacao])

  // Salvar todas as notas lançadas e alteradas
  const handleSaveAllGrades = async () => {
    if (!isContextSelected) {
      toast.error('Selecione todos os filtros de contexto antes de salvar.')
      return
    }

    setSaving(true)
    try {
      const newGradesPayload: any[] = []
      const updatedGradesPromises: Promise<any>[] = []

      for (const key of Object.keys(localGrades)) {
        const [codigoAluno, codigoTipoAvaliacao] = key.split('-').map(Number)
        const currentNota = localGrades[key]

        // Validar nota (0-20)
        if (currentNota < 0 || currentNota > 20) {
          toast.error(`A nota deve estar entre 0 e 20.`)
          setSaving(false)
          return
        }

        // Buscar se essa nota já existia na base de dados
        const existingGrade = gradesData?.data?.find(
          (g: any) =>
            g.CodigoAluno === codigoAluno &&
            g.CodigoTipoAvaliacao === codigoTipoAvaliacao
        )

        if (existingGrade) {
          // Se a nota foi modificada, atualiza-a
          if (existingGrade.Nota !== currentNota) {
            updatedGradesPromises.push(
              updateGrade({
                id: existingGrade.Codigo,
                data: {
                  nota: currentNota,
                },
              })
            )
          }
        } else {
          // Se é uma nota nova, insere no lote
          newGradesPayload.push({
            codigoAluno,
            codigoDisciplina: parseInt(selectedDisciplinaId),
            nota: currentNota,
            codigoTipoAvaliacao,
            codigoTrimestre: parseInt(selectedTrimestre),
            codigoTurma: parseInt(selectedTurmaId),
          })
        }
      }

      // Executa atualizações e inserções
      if (updatedGradesPromises.length > 0) {
        await Promise.all(updatedGradesPromises)
      }

      if (newGradesPayload.length > 0) {
        await importBulk({
          grades: newGradesPayload,
          codigoAnoLectivo: parseInt(selectedAnoLectivo),
          codigoUtilizador: parseInt(user?.id?.toString() || '1'),
        })
      }

      toast.success('Notas salvas com sucesso!')
      refetchGrades()
    } catch (error) {
      console.error('Erro ao salvar notas:', error)
      toast.error('Ocorreu um erro ao salvar algumas notas.')
    } finally {
      setSaving(false)
    }
  }

  const selectedDisciplinaDesignacao = disciplines.find(
    (d: any) => d.codigo?.toString() === selectedDisciplinaId
  )?.designacao

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
                  Selecione o contexto para lançar ou atualizar as notas dos alunos em lote
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {isContextSelected && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Média da Turma</p>
                <p className="text-3xl font-bold text-gray-900">{stats.media}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Alunos Avaliados</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total} / {students.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Aprovados (Média ≥ 10)</p>
                <p className="text-3xl font-bold text-green-600">{stats.aprovados}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Reprovados (Média &lt; 10)</p>
                <p className="text-3xl font-bold text-red-600">{stats.reprovados}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seletores de Contexto */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#007C00]" />
          Seleção de Contexto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Ano Letivo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ano Letivo *
            </label>
            <select
              value={selectedAnoLectivo}
              onChange={e => handleAnoLectivoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
              disabled={isLoadingAnosLetivos}
            >
              <option value="">Selecione um ano...</option>
              {anosLetivos.map(ano => (
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
              value={selectedTurmaId}
              onChange={e => handleTurmaChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
              disabled={!selectedAnoLectivo || isLoadingTurmas}
            >
              <option value="">Selecione uma turma...</option>
              {filteredTurmas.map((turma: ITurma) => (
                <option key={turma.codigo} value={turma.codigo}>
                  {turma.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Disciplina */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Disciplina *
            </label>
            <select
              value={selectedDisciplinaId}
              onChange={e => setSelectedDisciplinaId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
              disabled={!selectedTurmaId || isLoadingDisciplinas}
            >
              <option value="">Selecione a disciplina...</option>
              {disciplines.map((disc: any) => (
                <option key={disc.codigo} value={disc.codigo}>
                  {disc.designacao}
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
              value={selectedTrimestre}
              onChange={e => setSelectedTrimestre(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all bg-white"
            >
              <option value="">Selecione o trimestre...</option>
              {trimestres.map(t => (
                <option key={t.codigo} value={t.codigo}>
                  {t.designacao}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lançamento das Notas */}
      {isContextSelected ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                Alunos da Turma: {selectedTurma?.designacao}
              </h3>
              <p className="text-sm text-gray-500">
                Disciplina: <span className="font-semibold text-gray-700">{selectedDisciplinaDesignacao}</span> | Trimestre: <span className="font-semibold text-gray-700">{selectedTrimestre}º</span>
              </p>
            </div>

            <button
              onClick={handleSaveAllGrades}
              disabled={saving || isLoadingAlunos || isLoadingGrades || students.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Salvar Notas
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoadingAlunos || isLoadingGrades || isLoadingTiposAvaliacao ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
                <p className="text-gray-600">Buscando informações dos alunos e notas...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-600 font-medium">Nenhum aluno encontrado nesta turma.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-16">Nº</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nome do Aluno</th>
                    {tiposAvaliacao.map(tipo => (
                      <th key={tipo.codigo} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
                        {tipo.designacao}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Média</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student: any, index: number) => {
                    const avg = getStudentAverage(student.codigo)
                    return (
                      <tr key={student.codigo} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{student.nome}</p>
                          <p className="text-xs text-gray-400">Cód: #{student.codigo}</p>
                        </td>
                        
                        {/* Inputs Dinâmicos para tipos de avaliações */}
                        {tiposAvaliacao.map(tipo => {
                          const gradeKey = `${student.codigo}-${tipo.codigo}`
                          const value = localGrades[gradeKey] !== undefined ? localGrades[gradeKey] : ''
                          return (
                            <td key={tipo.codigo} className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.1"
                                value={value}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
                                  setLocalGrades(prev => {
                                    const copy = { ...prev }
                                    if (val === undefined || isNaN(val)) {
                                      delete copy[gradeKey]
                                    } else {
                                      copy[gradeKey] = val
                                    }
                                    return copy
                                  })
                                }}
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm font-medium"
                                placeholder="0-20"
                              />
                            </td>
                          )
                        })}

                        {/* Média / Nota Final */}
                        <td className="px-6 py-4">
                          <span className={`text-lg font-bold ${avg !== undefined ? (avg >= 10 ? 'text-[#007C00]' : 'text-red-600') : 'text-gray-400'}`}>
                            {avg !== undefined ? avg.toFixed(2) : '-'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {avg !== undefined ? (
                            avg >= 10 ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Aprovado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                Reprovado
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aguardando Seleção de Contexto</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Por favor, selecione o Ano Letivo, Turma, Disciplina e Trimestre nos filtros acima para carregar a lista de alunos e começar o lançamento de notas.
          </p>
        </div>
      )}
    </Container>
  )
}
