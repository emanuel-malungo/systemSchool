import { useState, useEffect, useMemo } from 'react'
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import Container from '../../components/layout/Container'
import { ProfessorService, type IAtribuicaoTurma, type IProfessorAluno } from '../../services/professor.service'
import api from '../../utils/api.utils'
import { toast } from 'react-toastify'
import { usePageTitle } from '../../hooks/usePageTitle'

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

export default function ProfessorLancamento() {
  usePageTitle('Lançamento de Notas')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dados de suporte
  const [atribuicoes, setAtribuicoes] = useState<IAtribuicaoTurma[]>([])
  const [openPeriods, setOpenPeriods] = useState<IPeriodoLancamento[]>([])
  const [students, setStudents] = useState<IProfessorAluno[]>([])

  // Seletores de contexto
  const [selectedAtribId, setSelectedAtribId] = useState('')
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('')

  // Estado derivado para manter tudo perfeitamente sincronizado
  const selectedAtrib = useMemo(() => {
    return atribuicoes.find(a => a.codigo.toString() === selectedAtribId)
  }, [atribuicoes, selectedAtribId])

  const selectedPeriod = useMemo(() => {
    return openPeriods.find(p => p.codigo.toString() === selectedPeriodoId)
  }, [openPeriods, selectedPeriodoId])

  const selectedAnoLectivo = selectedAtrib ? selectedAtrib.anoLectivo : ''
  const selectedTurmaId = selectedAtrib ? selectedAtrib.codigo_Turma.toString() : ''
  const selectedDisciplinaId = selectedAtrib ? selectedAtrib.codigo_Disciplina.toString() : ''

  const selectedTrimestre = selectedPeriod ? (selectedPeriod.trimestre || selectedPeriod.Trimestre)?.toString() : ''
  const selectedTipoNota = selectedPeriod ? (selectedPeriod.tipoNota || selectedPeriod.TipoAvaliacao) : ''

  // Estado das notas locais (objeto [codigoAluno]: notaValue)
  const [notasLocais, setNotasLocais] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      // Buscar atribuições do docente
      const atrib = await ProfessorService.getMinhasAtribuicoes()
      setAtribuicoes(atrib.turmas || [])

      // Buscar períodos de lançamento ativos do docente
      const periodsRes = await api.get('/api/periodos-lancamento/ativos')
      if (periodsRes.data && periodsRes.data.success) {
        setOpenPeriods(periodsRes.data.data || [])
      }
    } catch (error) {
      toast.error('Erro ao carregar dados iniciais de lançamento')
    } finally {
      setLoading(false)
    }
  }

  // Verificar se o período de lançamento selecionado está ATIVO
  const isPeriodoAtivo = useMemo((): boolean => {
    if (!selectedAnoLectivo || !selectedTrimestre || !selectedTipoNota) return false;
    
    const agora = new Date()
    const active = openPeriods.find(p => {
      const pTrim = p.trimestre || p.Trimestre;
      const pTipo = p.tipoNota || p.TipoAvaliacao;
      const inicio = new Date(p.dataInicio || p.DataInicio || '')
      const fim = new Date(p.dataFim || p.DataFim || '')
      
      return (
        pTrim?.toString() === selectedTrimestre &&
        pTipo === selectedTipoNota &&
        inicio <= agora &&
        fim >= agora
      );
    });

    return !!active;
  }, [openPeriods, selectedAnoLectivo, selectedTrimestre, selectedTipoNota])

  // Verificar data final do período de lançamento se houver
  const dataFimPeriodo = useMemo(() => {
    if (!selectedAnoLectivo || !selectedTrimestre || !selectedTipoNota) return null;
    const active = openPeriods.find(p => {
      const pTrim = p.trimestre || p.Trimestre;
      const pTipo = p.tipoNota || p.TipoAvaliacao;

      return (
        pTrim?.toString() === selectedTrimestre &&
        pTipo === selectedTipoNota
      );
    });
    return active ? new Date(active.dataFim || active.DataFim || '').toLocaleDateString('pt-AO') : null;
  }, [openPeriods, selectedAnoLectivo, selectedTrimestre, selectedTipoNota])

  // Buscar alunos da turma e notas existentes ao selecionar o contexto completo
  useEffect(() => {
    const fetchContextData = async () => {
      if (!selectedTurmaId || !selectedDisciplinaId || !selectedTrimestre || !selectedAnoLectivo || !selectedTipoNota) {
        setStudents([])
        setNotasLocais({})
        return
      }

      try {
        setLoading(true)
        // 1. Obter alunos ativos da turma
        const alunosList = await ProfessorService.getAlunosDaTurma(parseInt(selectedTurmaId), selectedAnoLectivo)
        setStudents(alunosList)

        // 2. Obter notas já existentes no banco para esse contexto para pre-popular
        const notasExistentes = await ProfessorService.getMinhasNotas({
          turmaId: parseInt(selectedTurmaId),
          disciplinaId: parseInt(selectedDisciplinaId),
          trimestreId: parseInt(selectedTrimestre),
          anoLectivo: selectedAnoLectivo
        })

        // Mapear para o formato local `{ [alunoCodigo]: notaValor }`
        const localMap: Record<number, string> = {}
        alunosList.forEach(a => {
          // Procurar se esse aluno tem nota correspondente ao tipo de nota selecionado
          const match = notasExistentes.find(n => {
            const normDb = n.tipoAvaliacao.descricao === 'NPP' ? 'PP' : (n.tipoAvaliacao.descricao === 'NPT' ? 'PT' : n.tipoAvaliacao.descricao);
            const normSel = selectedTipoNota === 'NPP' ? 'PP' : (selectedTipoNota === 'NPT' ? 'PT' : selectedTipoNota);
            return n.aluno.codigo === a.codigo && normDb === normSel;
          })
          localMap[a.codigo] = match ? match.nota.toString() : ''
        })

        setNotasLocais(localMap)
      } catch (error) {
        toast.error('Erro ao carregar alunos ou notas do contexto selecionado')
      } finally {
        setLoading(false)
      }
    }

    fetchContextData()
  }, [selectedTurmaId, selectedDisciplinaId, selectedTrimestre, selectedAnoLectivo, selectedTipoNota])

  const handleGradeChange = (studentId: number, value: string) => {
    // Permitir vazio ou números e ponto/vírgula
    const sanitized = value.replace(',', '.')
    
    // Validar se é número entre 0 e 20
    if (sanitized !== '') {
      const num = parseFloat(sanitized)
      if (isNaN(num) || num < 0 || num > 20) {
        return; // não aceita input inválido
      }
    }

    setNotasLocais(prev => ({
      ...prev,
      [studentId]: sanitized
    }))
  }

  const handleSaveGrades = async () => {
    const payloadNotas: { codigoAluno: number; nota: number }[] = []
    
    // Validar se todas as notas preenchidas estão ok e montar o payload
    for (const [studentIdStr, value] of Object.entries(notasLocais)) {
      if (value.trim() === '') continue; // Ignorar vazios (opção de não lançar)
      
      const numVal = parseFloat(value)
      if (isNaN(numVal) || numVal < 0 || numVal > 20) {
        toast.error('Existem notas com valores inválidos. Insira valores entre 0 e 20.')
        return;
      }

      payloadNotas.push({
        codigoAluno: parseInt(studentIdStr),
        nota: numVal
      })
    }

    if (payloadNotas.length === 0) {
      toast.warning('Nenhuma nota preenchida para salvar.')
      return;
    }

    try {
      setSaving(true)
      const res = await ProfessorService.lancarNotas({
        codigoTurma: parseInt(selectedTurmaId),
        codigoDisciplina: parseInt(selectedDisciplinaId),
        codigoTrimestre: parseInt(selectedTrimestre || ''),
        anoLectivo: selectedAnoLectivo || '',
        tipoNota: selectedTipoNota as 'MAC' | 'PP' | 'PT',
        notas: payloadNotas
      })

      if (res.success) {
        toast.success(res.message || 'Notas salvas com sucesso!')
        
        // Recarregar notas do banco
        const notasExistentes = await ProfessorService.getMinhasNotas({
          turmaId: parseInt(selectedTurmaId),
          disciplinaId: parseInt(selectedDisciplinaId),
          trimestreId: parseInt(selectedTrimestre || ''),
          anoLectivo: selectedAnoLectivo || ''
        })

        const localMap: Record<number, string> = {}
        students.forEach(a => {
          const match = notasExistentes.find(n => {
            const normDb = n.tipoAvaliacao.descricao === 'NPP' ? 'PP' : (n.tipoAvaliacao.descricao === 'NPT' ? 'PT' : n.tipoAvaliacao.descricao);
            const normSel = selectedTipoNota === 'NPP' ? 'PP' : (selectedTipoNota === 'NPT' ? 'PT' : selectedTipoNota);
            return n.aluno.codigo === a.codigo && normDb === normSel;
          })
          localMap[a.codigo] = match ? match.nota.toString() : ''
        })
        setNotasLocais(localMap)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao lançar notas. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const isContextSelected = !!selectedAnoLectivo && !!selectedTurmaId && !!selectedDisciplinaId && !!selectedTrimestre && !!selectedTipoNota;

  return (
    <Container>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Banner do Título */}
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Lançamento de Notas</h1>
          <p className="text-gray-500 text-sm mt-1">Selecione o contexto abaixo, verifique o status do período e insira as notas em lote.</p>
        </div>

        {/* Seletores de Contexto */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turma & Disciplina */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Turma & Disciplina</label>
              <select
                value={selectedAtribId}
                onChange={e => {
                  setSelectedAtribId(e.target.value)
                  setSelectedPeriodoId('') // resetar período ao trocar de turma
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none"
              >
                <option value="">Selecione...</option>
                {atribuicoes.map(a => (
                  <option key={a.codigo} value={a.codigo}>
                    {a.tb_turmas?.designacao} - {a.tb_turmas?.tb_classes?.designacao || ''} ({a.tb_disciplinas?.designacao})
                  </option>
                ))}
              </select>
              {selectedAtribId && (
                <div className="mt-2 text-xs text-gray-400">
                  Ano Letivo Selecionado: <span className="font-bold text-[#007C00]">{selectedAnoLectivo}</span>
                </div>
              )}
            </div>

            {/* Período de Lançamento */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Período de Lançamento Ativo</label>
              <select
                disabled={!selectedAtribId}
                value={selectedPeriodoId}
                onChange={e => setSelectedPeriodoId(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione...</option>
                {openPeriods.map(p => {
                  const pTrim = p.trimestre || p.Trimestre
                  const pTipo = p.tipoNota || p.TipoAvaliacao
                  const pAno = p.anoLectivo || p.AnoLectivo
                  return (
                    <option key={p.codigo} value={p.codigo}>
                      {p.nome || `${pTrim}º Trimestre - ${pTipo}`} ({pAno})
                    </option>
                  )
                })}
              </select>
              {openPeriods.length === 0 && (
                <div className="mt-2 text-xs text-amber-600 flex items-center gap-1 font-semibold">
                  ⚠️ Nenhum período ativo cadastrado pelo administrador para este ano letivo.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Banner de status do Período de Lançamento */}
        {isContextSelected && (
          <div className={`p-5 rounded-2xl flex items-center justify-between border ${
            isPeriodoAtivo 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            <div className="flex items-center gap-3">
              {isPeriodoAtivo ? <CheckCircle2 size={24} className="text-emerald-600" /> : <AlertCircle size={24} className="text-rose-600" />}
              <div>
                <p className="font-bold text-base">
                  O período de lançamento para {selectedTipoNota} está {isPeriodoAtivo ? 'ATIVO' : 'FECHADO'}
                </p>
                <p className="text-sm opacity-90 mt-0.5">
                  {isPeriodoAtivo 
                    ? `Você pode inserir e atualizar notas livremente. Data final limite: ${dataFimPeriodo}.`
                    : 'Lançamentos e edições estão bloqueados para este trimestre/tipo.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Área de Notas */}
        {isContextSelected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#007C00] mb-3" size={32} />
                <p className="text-gray-400 font-medium">Buscando alunos da turma...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <p className="font-bold text-base">Nenhum aluno ativo nesta turma</p>
                <p className="text-sm text-gray-400 mt-1">Verifique se existem confirmações de matrícula registradas para este ano letivo.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                        <th className="py-4 px-6">Código</th>
                        <th className="py-4 px-6">Nome do Aluno</th>
                        <th className="py-4 px-6 text-center">Sexo</th>
                        <th className="py-4 px-6 text-center w-48">Nota ({selectedTipoNota})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {students.map(student => (
                        <tr key={student.codigo} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 font-mono text-gray-400">{student.codigo}</td>
                          <td className="py-4 px-6 font-semibold text-gray-800">{student.nome}</td>
                          <td className="py-4 px-6 text-center text-gray-500">{student.sexo || 'M'}</td>
                          <td className="py-4 px-6 text-center">
                            <input
                              disabled={!isPeriodoAtivo || saving}
                              type="text"
                              maxLength={5}
                              value={notasLocais[student.codigo] || ''}
                              onChange={e => handleGradeChange(student.codigo, e.target.value)}
                              placeholder="0.0"
                              className="w-24 text-center py-2 border rounded-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] transition-all bg-gray-50/50 disabled:bg-gray-100 disabled:text-gray-400 border-gray-200"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isPeriodoAtivo && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      disabled={saving}
                      onClick={handleSaveGrades}
                      className="px-6 py-3 bg-[#007C00] hover:bg-[#005a00] text-white text-sm font-bold shadow-md shadow-green-600/10 hover:shadow-green-600/20 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Salvando Notas...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Salvar Lote de Notas</span>
                        </>
                      )}
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
