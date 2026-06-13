import { useState, useMemo, useEffect } from 'react'
import {
  Users,
  BarChart3,
  AlertCircle,
  Loader2,
  Save,
  GraduationCap,
  Filter,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth, usePermissions } from '../../../hooks/useAuth'
import type { ITurma } from '../../../types/turma.types'
import Container from '../../../components/layout/Container'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useDisciplinasByCurso } from '../../../hooks/useDisciplina'
import { useAlunosByTurma, useTurmasComplete } from '../../../hooks/useTurma'
import { useGrades, useUpdateGrade, useImportGradesBulk } from '../../../hooks/useGrade'

interface ExamGradeEntry {
  pap?: number
  exame?: number
}

export default function FinalExamsLaunching() {
  const { user } = useAuth()
  const { userType } = usePermissions()
  
  // Pedagogico e Secretaria apenas visualizam
  const isReadOnly = userType === 'pedagogico' || userType === 'chefe de secretaria'

  // Estados dos seletores de contexto
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState('')
  const [selectedTurmaId, setSelectedTurmaId] = useState('')

  // Estados adicionais
  const [localGrades, setLocalGrades] = useState<Record<string, ExamGradeEntry>>({})
  const [saving, setSaving] = useState(false)

  // Hooks de busca de dados
  const { data: anosLetivosData, isLoading: isLoadingAnosLetivos } = useAnosLectivos({ page: 1, limit: 1000 })
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmasComplete('')

  const anosLetivos = anosLetivosData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []

  // Obter a turma selecionada atualmente
  const selectedTurma = useMemo(() => {
    if (!selectedTurmaId) return null
    return turmas.find((t: ITurma) => t.codigo?.toString() === selectedTurmaId)
  }, [turmas, selectedTurmaId])

  // Buscar disciplinas pelo curso da turma
  const { data: disciplinasData, isLoading: isLoadingDisciplinas } = useDisciplinasByCurso(
    selectedTurma?.codigo_Curso || null,
    !!selectedTurma?.codigo_Curso
  )
  
  const disciplines = Array.isArray(disciplinasData) ? disciplinasData : []

  // Identificar disciplinas PAP e Exame Prático
  const papDiscipline = useMemo(() => {
    return disciplines.find((d: any) => {
      const name = d.designacao?.toLowerCase() || ''
      return name.includes('pap') || name.includes('prova de aptidão')
    })
  }, [disciplines])

  const exameDiscipline = useMemo(() => {
    return disciplines.find((d: any) => {
      const name = d.designacao?.toLowerCase() || ''
      return name.includes('exame prático') || name.includes('exame pratico') || name.includes('prova prática')
    })
  }, [disciplines])

  // Filtrar as turmas de acordo com o Ano Letivo selecionado
  const filteredTurmas = useMemo(() => {
    if (!selectedAnoLectivo) return []
    return turmas.filter((t: ITurma) => t.codigo_AnoLectivo?.toString() === selectedAnoLectivo)
  }, [turmas, selectedAnoLectivo])

  // Hook dependente apenas da turma selecionada para buscar alunos
  const { data: alunosTurmaResponse, isLoading: isLoadingAlunos } = useAlunosByTurma(
    selectedTurma?.codigo || 0,
    !!selectedTurma?.codigo
  )

  const students = (alunosTurmaResponse as any)?.data || (Array.isArray(alunosTurmaResponse) ? alunosTurmaResponse : [])

  // Verificar se todo o contexto necessário foi selecionado
  const isContextSelected = useMemo(() => {
    return !!selectedAnoLectivo && !!selectedTurmaId
  }, [selectedAnoLectivo, selectedTurmaId])

  // Buscar todas as notas desta turma (não filtramos por disciplina para apanhar ambas)
  const { data: gradesData, isLoading: isLoadingGrades, refetch: refetchGrades } = useGrades(
    1,
    5000, // Limite alto para garantir que todas as notas da turma vêm
    {
      codigoTurma: selectedTurmaId ? parseInt(selectedTurmaId) : undefined,
      codigoAnoLectivo: selectedAnoLectivo ? parseInt(selectedAnoLectivo) : undefined,
    },
    isContextSelected
  )

  const { mutateAsync: importBulk } = useImportGradesBulk()
  const { mutateAsync: updateGrade } = useUpdateGrade()

  // Sincronizar notas do backend com o estado local ao carregar ou mudar contexto
  useEffect(() => {
    if (gradesData?.data && isContextSelected && (papDiscipline || exameDiscipline)) {
      const gradesMap: Record<string, ExamGradeEntry> = {}
      gradesData.data.forEach((grade: any) => {
        // Filtrar apenas as notas que pertencem à PAP ou Exame
        const isPap = papDiscipline && grade.CodigoDisciplina === papDiscipline.codigo
        const isExame = exameDiscipline && grade.CodigoDisciplina === exameDiscipline.codigo

        if (isPap || isExame) {
          const key = grade.CodigoAluno.toString()
          gradesMap[key] = {
            ...gradesMap[key],
            ...(isPap ? { pap: grade.Nota } : {}),
            ...(isExame ? { exame: grade.Nota } : {}),
          }
        }
      })
      setLocalGrades(gradesMap)
    } else {
      setLocalGrades({})
    }
  }, [gradesData, isContextSelected, papDiscipline, exameDiscipline])

  // Limpar seleções dependentes
  const handleAnoLectivoChange = (value: string) => {
    setSelectedAnoLectivo(value)
    setSelectedTurmaId('')
    setLocalGrades({})
  }

  const handleTurmaChange = (value: string) => {
    setSelectedTurmaId(value)
    setLocalGrades({})
  }

  // Atualizar nota localmente
  const updateGradeField = (studentId: number, field: 'pap' | 'exame', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    
    // Validar se está no intervalo 0-20
    if (numValue !== undefined && (numValue < 0 || numValue > 20 || isNaN(numValue))) {
      toast.error('A nota deve estar entre 0 e 20')
      return
    }

    setLocalGrades(prev => {
      const key = studentId.toString()
      const entry = prev[key] ? { ...prev[key] } : {}
      entry[field] = numValue
      
      return { ...prev, [key]: entry }
    })
  }

  // Salvar todas as notas lançadas e alteradas
  const handleSaveAllGrades = async () => {
    if (!isContextSelected) {
      toast.error('Selecione todos os filtros de contexto antes de salvar.')
      return
    }

    if (!papDiscipline && !exameDiscipline) {
      toast.error('Não existem disciplinas de PAP ou Exame Prático para guardar as notas.')
      return
    }

    setSaving(true)
    try {
      const newGradesPayload: any[] = []
      const updatedGradesPromises: Promise<any>[] = []

      for (const student of students) {
        const key = student.codigo.toString()
        const grades = localGrades[key]
        
        if (!grades || (grades.pap === undefined && grades.exame === undefined)) {
          continue // Pular se não tem nenhuma nota
        }

        // Processar PAP (Guardar como PT = 3 no último trimestre = 3)
        if (grades.pap !== undefined && papDiscipline) {
          const existingGrade = gradesData?.data?.find(
            (g: any) => g.CodigoAluno === student.codigo && g.CodigoDisciplina === papDiscipline.codigo
          )

          if (existingGrade) {
            if (existingGrade.Nota !== grades.pap) {
              updatedGradesPromises.push(
                updateGrade({
                  id: existingGrade.Codigo,
                  data: { nota: grades.pap },
                })
              )
            }
          } else {
            newGradesPayload.push({
              codigoAluno: student.codigo,
              codigoDisciplina: papDiscipline.codigo,
              nota: grades.pap,
              codigoTipoAvaliacao: 3, // Final/PT
              codigoTrimestre: 3, // Último trimestre
              codigoTurma: parseInt(selectedTurmaId),
            })
          }
        }

        // Processar Exame Prático
        if (grades.exame !== undefined && exameDiscipline) {
          const existingGrade = gradesData?.data?.find(
            (g: any) => g.CodigoAluno === student.codigo && g.CodigoDisciplina === exameDiscipline.codigo
          )

          if (existingGrade) {
            if (existingGrade.Nota !== grades.exame) {
              updatedGradesPromises.push(
                updateGrade({
                  id: existingGrade.Codigo,
                  data: { nota: grades.exame },
                })
              )
            }
          } else {
            newGradesPayload.push({
              codigoAluno: student.codigo,
              codigoDisciplina: exameDiscipline.codigo,
              nota: grades.exame,
              codigoTipoAvaliacao: 3, // Final/PT
              codigoTrimestre: 3, // Último trimestre
              codigoTurma: parseInt(selectedTurmaId),
            })
          }
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

      toast.success('Notas finais de Exame/PAP salvas com sucesso!')
      refetchGrades()
    } catch (error) {
      console.error('Erro ao salvar notas:', error)
      toast.error('Ocorreu um erro ao salvar algumas notas.')
    } finally {
      setSaving(false)
    }
  }

  const hasMissingDisciplines = isContextSelected && (!papDiscipline || !exameDiscipline) && !isLoadingDisciplinas

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lançamento de Exames e PAP
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Insira rapidamente as notas finais de Exame Prático e Defesa de PAP dos alunos
            </p>
          </div>
        </div>
      </div>

      {/* Seletores de Contexto */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Seleção de Contexto</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ano Letivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ano Letivo *
            </label>
            <select
              value={selectedAnoLectivo}
              onChange={e => handleAnoLectivoChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Turma Finalista *
            </label>
            <select
              value={selectedTurmaId}
              onChange={e => handleTurmaChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        </div>
        
        {/* Aviso de Disciplinas em Falta */}
        {hasMissingDisciplines && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Atenção: Disciplinas não configuradas</h4>
              <p className="text-sm text-amber-700 mt-1">
                O sistema não encontrou as seguintes disciplinas na grelha deste curso:
                {!papDiscipline && <span className="font-semibold"> "PAP"</span>}
                {!papDiscipline && !exameDiscipline && " e"}
                {!exameDiscipline && <span className="font-semibold"> "Exame Prático"</span>}.
                <br/>
                Ainda pode visualizar a turma, mas os campos dessas disciplinas estarão desativados até que a secretaria as crie.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lançamento das Notas */}
      {isContextSelected ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div>
              <h3 className="font-semibold text-gray-900">
                Alunos da Turma: {selectedTurma?.designacao}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Registo de Classificações Finais de Fim de Curso
              </p>
            </div>

            {!isReadOnly && (
              <button
                onClick={handleSaveAllGrades}
                disabled={saving || isLoadingAlunos || isLoadingGrades || students.length === 0 || (!papDiscipline && !exameDiscipline)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A Guardar...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Classificações
                  </>
                )}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {isLoadingAlunos || isLoadingGrades || isLoadingDisciplinas ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
                <p className="text-gray-600">A carregar informações dos alunos e notas finais...</p>
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-32">
                      Nota PAP
                      {!papDiscipline && <span className="block text-xs text-red-500 font-normal mt-0.5">(Falta Criar)</span>}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-32">
                      Nota Exame Prático
                      {!exameDiscipline && <span className="block text-xs text-red-500 font-normal mt-0.5">(Falta Criar)</span>}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student: any, index: number) => {
                    const key = student.codigo.toString()
                    const grades = localGrades[key] || {}

                    return (
                      <tr key={student.codigo} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{student.nome}</p>
                          <p className="text-xs text-gray-400">Cód: #{student.codigo}</p>
                        </td>
                        
                        {/* PAP Input */}
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            disabled={isReadOnly || !papDiscipline}
                            value={grades.pap !== undefined ? grades.pap : ''}
                            onChange={(e) => updateGradeField(student.codigo, 'pap', e.target.value)}
                            className={`w-24 px-3 py-2 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 text-sm font-semibold text-center transition-all ${
                              isReadOnly || !papDiscipline
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-50 focus:bg-green-100 hover:bg-green-100/75 placeholder:text-gray-400 text-[#007C00]'
                            }`}
                            placeholder="0-20"
                          />
                        </td>

                        {/* Exame Prático Input */}
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            disabled={isReadOnly || !exameDiscipline}
                            value={grades.exame !== undefined ? grades.exame : ''}
                            onChange={(e) => updateGradeField(student.codigo, 'exame', e.target.value)}
                            className={`w-24 px-3 py-2 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 text-sm font-semibold text-center transition-all ${
                              isReadOnly || !exameDiscipline
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-50 focus:bg-blue-100 hover:bg-blue-100/75 placeholder:text-gray-400 text-blue-700'
                            }`}
                            placeholder="0-20"
                          />
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aguardando Seleção de Turma</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Por favor, selecione o Ano Letivo e a Turma finalista para carregar a lista de alunos e lançar as notas de Defesa (PAP) e Exame Prático.
          </p>
        </div>
      )}
    </Container>
  )
}
