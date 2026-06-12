import { useState, useEffect, useMemo } from 'react'
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import Container from '../../components/layout/Container'
import { DirectorService, type IDirectorTurma } from '../../services/director.service'
import api from '../../utils/api.utils'
import { toast } from 'react-toastify'

interface IPeriodoLancamento {
  codigo: number;
  TipoAvaliacao?: string;
  tipoNota?: string;
  Trimestre?: number;
  trimestre?: number;
  AnoLectivo?: string;
  anoLectivo?: string;
  DataInicio?: string;
  dataInicio?: string;
  DataFim?: string;
  dataFim?: string;
  nome?: string;
}

export default function DirectorLancamento() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [turmasDirigidas, setTurmasDirigidas] = useState<IDirectorTurma[]>([])
  const [openPeriods, setOpenPeriods] = useState<IPeriodoLancamento[]>([])
  const [students, setStudents] = useState<any[]>([])

  const [selectedTurmaId, setSelectedTurmaId] = useState('')
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('')
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('')

  const selectedTurma = useMemo(() => {
    return turmasDirigidas.find(t => t.codigo_Turma.toString() === selectedTurmaId)
  }, [turmasDirigidas, selectedTurmaId])

  const selectedAnoLectivo = selectedTurma ? selectedTurma.anoLectivo : ''

  const selectedPeriod = useMemo(() => {
    return openPeriods.find(p => p.codigo.toString() === selectedPeriodoId)
  }, [openPeriods, selectedPeriodoId])

  const selectedTrimestre = selectedPeriod ? (selectedPeriod.trimestre || selectedPeriod.Trimestre)?.toString() : ''
  const selectedTipoNota = selectedPeriod ? (selectedPeriod.tipoNota || selectedPeriod.TipoAvaliacao) : ''

  const [notasLocais, setNotasLocais] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const turmas = await DirectorService.getMinhasTurmas()
      setTurmasDirigidas(turmas)

      const periodsRes = await api.get('/api/periodos-lancamento/ativos')
      if (periodsRes.data && periodsRes.data.success) {
        setOpenPeriods(periodsRes.data.data || [])
      }
    } catch (error) {
      toast.error('Erro ao carregar dados iniciais')
    } finally {
      setLoading(false)
    }
  }

  const isPeriodoAtivo = useMemo((): boolean => {
    if (!selectedAnoLectivo || !selectedTrimestre || !selectedTipoNota) return false;
    const agora = new Date()
    const active = openPeriods.find(p => {
      const pTrim = p.trimestre || p.Trimestre;
      const pTipo = p.tipoNota || p.TipoAvaliacao;
      const inicio = new Date(p.dataInicio || p.DataInicio || '')
      const fim = new Date(p.dataFim || p.DataFim || '')
      return pTrim?.toString() === selectedTrimestre && pTipo === selectedTipoNota && inicio <= agora && fim >= agora;
    });
    return !!active;
  }, [openPeriods, selectedAnoLectivo, selectedTrimestre, selectedTipoNota])

  useEffect(() => {
    const fetchContextData = async () => {
      if (!selectedTurmaId || !selectedDisciplinaId || !selectedTrimestre || !selectedAnoLectivo || !selectedTipoNota) {
        setStudents([])
        setNotasLocais({})
        return
      }

      try {
        setLoading(true)
        const alunosList = await DirectorService.getAlunosDaTurma(parseInt(selectedTurmaId), selectedAnoLectivo)
        setStudents(alunosList)

        const notasExistentes = await DirectorService.getNotasDaTurma(parseInt(selectedTurmaId), {
          disciplinaId: parseInt(selectedDisciplinaId),
          trimestreId: parseInt(selectedTrimestre),
          anoLectivo: selectedAnoLectivo
        })

        const localMap: Record<number, string> = {}
        alunosList.forEach(a => {
          const match = notasExistentes.find((n: any) => {
            const normDb = n.tipoAvaliacao.descricao === 'NPP' ? 'PP' : (n.tipoAvaliacao.descricao === 'NPT' ? 'PT' : n.tipoAvaliacao.descricao);
            const normSel = selectedTipoNota === 'NPP' ? 'PP' : (selectedTipoNota === 'NPT' ? 'PT' : selectedTipoNota);
            return n.aluno.codigo === a.codigo && normDb === normSel;
          })
          localMap[a.codigo] = match ? match.nota.toString() : ''
        })

        setNotasLocais(localMap)
      } catch (error) {
        toast.error('Erro ao carregar alunos ou notas')
      } finally {
        setLoading(false)
      }
    }

    fetchContextData()
  }, [selectedTurmaId, selectedDisciplinaId, selectedTrimestre, selectedAnoLectivo, selectedTipoNota])

  const handleGradeChange = (studentId: number, value: string) => {
    const sanitized = value.replace(',', '.')
    if (sanitized !== '') {
      const num = parseFloat(sanitized)
      if (isNaN(num) || num < 0 || num > 20) return;
    }
    setNotasLocais(prev => ({ ...prev, [studentId]: sanitized }))
  }

  const handleSaveGrades = async () => {
    const payloadNotas: { codigoAluno: number; nota: number }[] = []
    
    for (const [studentIdStr, value] of Object.entries(notasLocais)) {
      if (value.trim() === '') continue;
      const numVal = parseFloat(value)
      if (isNaN(numVal) || numVal < 0 || numVal > 20) {
        toast.error('Existem notas com valores inválidos.')
        return;
      }
      payloadNotas.push({ codigoAluno: parseInt(studentIdStr), nota: numVal })
    }

    if (payloadNotas.length === 0) {
      toast.warning('Nenhuma nota preenchida para salvar.')
      return;
    }

    try {
      setSaving(true)
      const res = await DirectorService.lancarNotas({
        codigoTurma: parseInt(selectedTurmaId),
        codigoDisciplina: parseInt(selectedDisciplinaId),
        codigoTrimestre: parseInt(selectedTrimestre || ''),
        anoLectivo: selectedAnoLectivo || '',
        tipoNota: selectedTipoNota as 'MAC' | 'PP' | 'PT',
        notas: payloadNotas
      })

      if (res.success) {
        toast.success(res.message || 'Notas salvas com sucesso!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao lançar notas.')
    } finally {
      setSaving(false)
    }
  }

  const isContextSelected = !!selectedAnoLectivo && !!selectedTurmaId && !!selectedDisciplinaId && !!selectedTrimestre && !!selectedTipoNota;

  return (
    <Container>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Lançamento de Notas - Diretor</h1>
          <p className="text-gray-500 text-sm mt-1">Insira notas de qualquer disciplina para as suas turmas.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Turma Dirigida</label>
              <select
                value={selectedTurmaId}
                onChange={e => {
                  setSelectedTurmaId(e.target.value)
                  setSelectedDisciplinaId('')
                  setSelectedPeriodoId('')
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-[#007C00] outline-none"
              >
                <option value="">Selecione a Turma...</option>
                {turmasDirigidas.map(t => (
                  <option key={t.codigo_Turma} value={t.codigo_Turma}>
                    {t.tb_turmas?.designacao} - {t.tb_turmas?.tb_classes?.designacao || ''} ({t.anoLectivo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Disciplina</label>
              <select
                disabled={!selectedTurmaId}
                value={selectedDisciplinaId}
                onChange={e => setSelectedDisciplinaId(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione a Disciplina...</option>
                {selectedTurma?.disciplinas?.map(d => (
                  <option key={d.codigo} value={d.codigo}>{d.designacao}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Período Ativo</label>
              <select
                disabled={!selectedDisciplinaId}
                value={selectedPeriodoId}
                onChange={e => setSelectedPeriodoId(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione...</option>
                {openPeriods.map(p => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.nome || `${p.trimestre || p.Trimestre}º Trimestre - ${p.tipoNota || p.TipoAvaliacao}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isContextSelected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#007C00] mb-3" size={32} />
              </div>
            ) : students.length === 0 ? (
              <div className="py-20 text-center text-gray-500">Nenhum aluno ativo nesta turma</div>
            ) : (
              <div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="py-4 px-6">Código</th>
                      <th className="py-4 px-6">Nome do Aluno</th>
                      <th className="py-4 px-6 text-center w-48">Nota ({selectedTipoNota})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {students.map(student => (
                      <tr key={student.codigo} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6 font-mono text-gray-400">{student.codigo}</td>
                        <td className="py-4 px-6 font-semibold text-gray-800">{student.nome}</td>
                        <td className="py-4 px-6 text-center">
                          <input
                            disabled={!isPeriodoAtivo || saving}
                            type="text"
                            value={notasLocais[student.codigo] || ''}
                            onChange={e => handleGradeChange(student.codigo, e.target.value)}
                            placeholder="0.0"
                            className="w-24 text-center py-2 border rounded-xl font-bold focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] transition-all disabled:bg-gray-100"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isPeriodoAtivo && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                      disabled={saving}
                      onClick={handleSaveGrades}
                      className="px-6 py-3 bg-[#007C00] hover:bg-[#005a00] text-white font-bold rounded-xl flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar Notas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}
