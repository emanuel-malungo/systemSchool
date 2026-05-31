import { useState, useEffect, useMemo } from 'react'
import { BookOpen, School, Calendar, Filter, Loader2, Save, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Container from '../../components/layout/Container'
import { ProfessorService, type IAtribuicaoTurma, type IProfessorAluno } from '../../services/professor.service'
import api from '../../utils/api.utils'
import { toast } from 'react-toastify'

interface IPeriodoLancamento {
  codigo: number;
  TipoAvaliacao: string;
  Trimestre: number;
  AnoLectivo: string;
  DataInicio: string;
  DataFim: string;
}

export default function ProfessorLancamento() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Dados de suporte
  const [atribuicoes, setAtribuicoes] = useState<IAtribuicaoTurma[]>([])
  const [openPeriods, setOpenPeriods] = useState<IPeriodoLancamento[]>([])
  const [students, setStudents] = useState<IProfessorAluno[]>([])

  // Seletores de contexto
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState('')
  const [selectedTurmaId, setSelectedTurmaId] = useState('')
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('')
  const [selectedTrimestre, setSelectedTrimestre] = useState('')
  const [selectedTipoNota, setSelectedTipoNota] = useState<'MAC' | 'PP' | 'PT' | ''>('')

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

      // Buscar períodos de lançamento gerais
      const periodsRes = await api.get('/periodos-lancamento')
      if (periodsRes.data && periodsRes.data.success) {
        setOpenPeriods(periodsRes.data.data || [])
      }

      // Auto-selecionar o ano letivo se houver
      if (atrib.turmas && atrib.turmas.length > 0) {
        const anos = Array.from(new Set(atrib.turmas.map(t => t.anoLectivo)))
        if (anos.length > 0) {
          setSelectedAnoLectivo(anos[0])
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar dados iniciais de lançamento')
    } finally {
      setLoading(false)
    }
  }

  // Anos letivos únicos atribuídos
  const uniqueAnosLectivos = useMemo(() => {
    return Array.from(new Set(atribuicoes.map(t => t.anoLectivo)))
  }, [atribuicoes])

  // Filtrar as turmas disponíveis para o ano letivo selecionado
  const availableTurmas = useMemo(() => {
    if (!selectedAnoLectivo) return [];
    const filtered = atribuicoes.filter(a => a.anoLectivo === selectedAnoLectivo);
    const map = new Map();
    filtered.forEach(a => {
      if (a.tb_turmas) {
        map.set(a.tb_turmas.codigo, a.tb_turmas);
      }
    });
    return Array.from(map.values());
  }, [atribuicoes, selectedAnoLectivo])

  // Filtrar as disciplinas associadas à turma selecionada
  const availableDisciplinas = useMemo(() => {
    if (!selectedTurmaId) return [];
    const filtered = atribuicoes.filter(
      a => a.codigo_Turma.toString() === selectedTurmaId && a.anoLectivo === selectedAnoLectivo
    );
    const map = new Map();
    filtered.forEach(a => {
      if (a.tb_disciplinas) {
        map.set(a.tb_disciplinas.codigo, a.tb_disciplinas);
      }
    });
    return Array.from(map.values());
  }, [atribuicoes, selectedTurmaId, selectedAnoLectivo])

  // Verificar se o período de lançamento selecionado está ATIVO
  const isPeriodoAtivo = useMemo((): boolean => {
    if (!selectedAnoLectivo || !selectedTrimestre || !selectedTipoNota) return false;
    
    const agora = new Date()
    const active = openPeriods.find(p => {
      const inicio = new Date(p.DataInicio)
      const fim = new Date(p.DataFim)
      return (
        p.AnoLectivo === selectedAnoLectivo &&
        p.Trimestre === parseInt(selectedTrimestre) &&
        p.TipoAvaliacao === selectedTipoNota &&
        inicio <= agora &&
        fim >= agora
      );
    });

    return !!active;
  }, [openPeriods, selectedAnoLectivo, selectedTrimestre, selectedTipoNota])

  // Verificar data final do período de lançamento se houver
  const dataFimPeriodo = useMemo(() => {
    if (!selectedAnoLectivo || !selectedTrimestre || !selectedTipoNota) return null;
    const active = openPeriods.find(p => (
      p.AnoLectivo === selectedAnoLectivo &&
      p.Trimestre === parseInt(selectedTrimestre) &&
      p.TipoAvaliacao === selectedTipoNota
    ));
    return active ? new Date(active.DataFim).toLocaleDateString('pt-AO') : null;
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
          const match = notasExistentes.find(
            n => n.aluno.codigo === a.codigo && n.tipoAvaliacao.descricao === selectedTipoNota
          )
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
        codigoTrimestre: parseInt(selectedTrimestre),
        anoLectivo: selectedAnoLectivo,
        tipoNota: selectedTipoNota as 'MAC' | 'PP' | 'PT',
        notas: payloadNotas
      })

      if (res.success) {
        toast.success(res.message || 'Notas salvas com sucesso!')
        
        // Recarregar notas do banco
        const notasExistentes = await ProfessorService.getMinhasNotas({
          turmaId: parseInt(selectedTurmaId),
          disciplinaId: parseInt(selectedDisciplinaId),
          trimestreId: parseInt(selectedTrimestre),
          anoLectivo: selectedAnoLectivo
        })

        const localMap: Record<number, string> = {}
        students.forEach(a => {
          const match = notasExistentes.find(
            n => n.aluno.codigo === a.codigo && n.tipoAvaliacao.descricao === selectedTipoNota
          )
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Ano Letivo */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Ano Letivo</label>
              <select
                value={selectedAnoLectivo}
                onChange={e => {
                  setSelectedAnoLectivo(e.target.value)
                  setSelectedTurmaId('')
                  setSelectedDisciplinaId('')
                  setSelectedTrimestre('')
                  setSelectedTipoNota('')
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none"
              >
                <option value="">Selecione...</option>
                {uniqueAnosLectivos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            {/* Turma */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Turma</label>
              <select
                disabled={!selectedAnoLectivo}
                value={selectedTurmaId}
                onChange={e => {
                  setSelectedTurmaId(e.target.value)
                  setSelectedDisciplinaId('')
                  setSelectedTrimestre('')
                  setSelectedTipoNota('')
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione...</option>
                {availableTurmas.map(t => (
                  <option key={t.codigo} value={t.codigo}>{t.designacao}</option>
                ))}
              </select>
            </div>

            {/* Disciplina */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Disciplina</label>
              <select
                disabled={!selectedTurmaId}
                value={selectedDisciplinaId}
                onChange={e => {
                  setSelectedDisciplinaId(e.target.value)
                  setSelectedTrimestre('')
                  setSelectedTipoNota('')
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione...</option>
                {availableDisciplinas.map(d => (
                  <option key={d.codigo} value={d.codigo}>{d.designacao}</option>
                ))}
              </select>
            </div>

            {/* Trimestre */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Trimestre</label>
              <select
                disabled={!selectedDisciplinaId}
                value={selectedTrimestre}
                onChange={e => {
                  setSelectedTrimestre(e.target.value)
                  setSelectedTipoNota('')
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione...</option>
                <option value="1">1º Trimestre</option>
                <option value="2">2º Trimestre</option>
                <option value="3">3º Trimestre</option>
              </select>
            </div>

            {/* Tipo de Nota */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Tipo de Nota</label>
              <select
                disabled={!selectedTrimestre}
                value={selectedTipoNota}
                onChange={e => setSelectedTipoNota(e.target.value as any)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Selecione...</option>
                <option value="MAC">MAC (Média de Avaliação Contínua)</option>
                <option value="PP">PP (Prova de Professor)</option>
                <option value="PT">PT (Prova Trimestral)</option>
              </select>
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
