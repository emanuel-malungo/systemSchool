import { useState, useEffect, useMemo } from 'react'
import { Filter, Loader2, RefreshCw, BarChart3 } from 'lucide-react'
import Container from '../../components/layout/Container'
import { ProfessorService, type IAtribuicaoTurma, type INotaAlunoResponse } from '../../services/professor.service'
import { toast } from 'react-toastify'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function ProfessorNotas() {
  usePageTitle('Histórico de Notas Lançadas')
  const [loading, setLoading] = useState(true)
  const [grades, setGrades] = useState<INotaAlunoResponse[]>([])
  const [atribuicoes, setAtribuicoes] = useState<IAtribuicaoTurma[]>([])

  // Filtros de seleção
  const [selectedTurmaId, setSelectedTurmaId] = useState('')
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('')
  const [selectedTrimestre, setSelectedTrimestre] = useState('')
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      // Buscar atribuições para popular filtros
      const atri = await ProfessorService.getMinhasAtribuicoes()
      setAtribuicoes(atri.turmas || [])

      // Buscar histórico geral de notas
      const allGrades = await ProfessorService.getMinhasNotas()
      setGrades(allGrades || [])

      // Auto-selecionar o ano letivo mais recente se houver atribuições
      if (atri.turmas && atri.turmas.length > 0) {
        const anos = Array.from(new Set(atri.turmas.map(t => t.anoLectivo)))
        if (anos.length > 0) {
          setSelectedAnoLectivo(anos[0])
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar histórico de notas')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar disciplinas associadas à turma selecionada
  const availableDisciplinas = useMemo(() => {
    if (!selectedTurmaId) {
      // Retornar todas as disciplinas únicas atribuídas
      const map = new Map();
      atribuicoes.forEach(a => {
        if (a.tb_disciplinas) {
          map.set(a.tb_disciplinas.codigo, a.tb_disciplinas);
        }
      });
      return Array.from(map.values());
    }

    const filtered = atribuicoes.filter(a => a.codigo_Turma.toString() === selectedTurmaId);
    const map = new Map();
    filtered.forEach(a => {
      if (a.tb_disciplinas) {
        map.set(a.tb_disciplinas.codigo, a.tb_disciplinas);
      }
    });
    return Array.from(map.values());
  }, [atribuicoes, selectedTurmaId])

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

  const handleFilter = async () => {
    try {
      setLoading(true)
      const data = await ProfessorService.getMinhasNotas({
        turmaId: selectedTurmaId ? parseInt(selectedTurmaId) : undefined,
        disciplinaId: selectedDisciplinaId ? parseInt(selectedDisciplinaId) : undefined,
        trimestreId: selectedTrimestre ? parseInt(selectedTrimestre) : undefined,
        anoLectivo: selectedAnoLectivo || undefined
      })
      setGrades(data || [])
    } catch (error) {
      toast.error('Erro ao recarregar notas filtradas')
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = async () => {
    setSelectedTurmaId('')
    setSelectedDisciplinaId('')
    setSelectedTrimestre('')
    
    try {
      setLoading(true)
      const data = await ProfessorService.getMinhasNotas({
        anoLectivo: selectedAnoLectivo || undefined
      })
      setGrades(data || [])
    } catch (error) {
      toast.error('Erro ao recarregar notas')
    } finally {
      setLoading(false)
    }
  }

  // Anos letivos únicos atribuídos
  const uniqueAnosLectivos = useMemo(() => {
    return Array.from(new Set(atribuicoes.map(t => t.anoLectivo)))
  }, [atribuicoes])

  return (
    <Container>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Histórico de Notas Lançadas</h1>
            <p className="text-gray-500 text-sm mt-1">Consulte todas as avaliações e classificações de alunos que foram submetidas por si.</p>
          </div>
          <button
            onClick={fetchInitialData}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-green-200 hover:text-[#007C00] rounded-xl text-gray-600 text-sm font-semibold transition-all bg-white"
          >
            <RefreshCw size={16} /> Atualizar Lista
          </button>
        </div>

        {/* Bloco de Filtros */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Filter size={16} className="text-[#007C00]" /> Filtrar Notas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Ano Letivo */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Ano Letivo</label>
              <select
                value={selectedAnoLectivo}
                onChange={e => {
                  setSelectedAnoLectivo(e.target.value)
                  setSelectedTurmaId('')
                  setSelectedDisciplinaId('')
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
              <label className="block text-xs font-semibold text-gray-500 uppercase">Turma</label>
              <select
                disabled={!selectedAnoLectivo}
                value={selectedTurmaId}
                onChange={e => {
                  setSelectedTurmaId(e.target.value)
                  setSelectedDisciplinaId('')
                }}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none disabled:bg-gray-50"
              >
                <option value="">Todas</option>
                {availableTurmas.map(t => (
                  <option key={t.codigo} value={t.codigo}>{t.designacao}</option>
                ))}
              </select>
            </div>

            {/* Disciplina */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Disciplina</label>
              <select
                value={selectedDisciplinaId}
                onChange={e => setSelectedDisciplinaId(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none"
              >
                <option value="">Todas</option>
                {availableDisciplinas.map(d => (
                  <option key={d.codigo} value={d.codigo}>{d.designacao}</option>
                ))}
              </select>
            </div>

            {/* Trimestre */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Trimestre</label>
              <select
                value={selectedTrimestre}
                onChange={e => setSelectedTrimestre(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] outline-none"
              >
                <option value="">Todos</option>
                <option value="1">1º Trimestre</option>
                <option value="2">2º Trimestre</option>
                <option value="3">3º Trimestre</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-50">
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-all"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleFilter}
              className="px-5 py-2.5 rounded-xl bg-[#007C00] hover:bg-[#005a00] text-white text-sm font-semibold shadow-md shadow-green-600/10 transition-all flex items-center gap-2"
            >
              <Filter size={16} /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Tabela de Notas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#007C00] mb-3" size={32} />
              <p className="text-gray-400 font-medium">Buscando notas lançadas...</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
              <BarChart3 size={48} className="text-gray-300 mb-3" />
              <p className="font-bold text-base">Nenhuma nota encontrada</p>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">Use os filtros acima ou lance notas para ver seu histórico de lançamentos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6">Aluno</th>
                    <th className="py-4 px-6">Turma</th>
                    <th className="py-4 px-6">Disciplina</th>
                    <th className="py-4 px-6 text-center">Trimestre</th>
                    <th className="py-4 px-6 text-center">Tipo</th>
                    <th className="py-4 px-6 text-center">Nota</th>
                    <th className="py-4 px-6">Data de Lançamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {grades.map(n => {
                    const isPositive = n.nota >= 10;
                    return (
                      <tr key={n.codigo} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-800">{n.aluno?.nome}</td>
                        <td className="py-4 px-6 text-gray-600 font-medium">{n.turma?.designacao}</td>
                        <td className="py-4 px-6 text-[#007C00] font-semibold">{n.disciplina?.designacao}</td>
                        <td className="py-4 px-6 text-center text-gray-500 font-semibold">{n.trimestre?.designacao}</td>
                        <td className="py-4 px-6 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs">
                            {n.tipoAvaliacao?.descricao}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1.5 rounded-xl text-sm font-extrabold shadow-xs inline-block min-w-[42px] ${
                            isPositive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {n.nota.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-xs font-medium">
                          {new Date(n.dataCadastro).toLocaleString('pt-AO')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
