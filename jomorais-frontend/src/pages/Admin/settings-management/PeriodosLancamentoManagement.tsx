import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Plus,
  Trash2,
  Power,
  PowerOff,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import periodoService, { type PeriodoLancamento, type AnoLetivo } from '../../../services/periodo.service'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getStatusInfo(periodo: PeriodoLancamento): {
  label: string
  color: string
  bg: string
  icon: React.ReactNode
} {
  const agora = new Date()
  const inicio = new Date(periodo.dataInicio)
  const fim = new Date(periodo.dataFim)

  if (agora < inicio) {
    return {
      label: 'Programado',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      icon: <Clock size={14} />
    }
  }
  if (agora > fim) {
    return {
      label: 'Expirado',
      color: 'text-gray-600',
      bg: 'bg-gray-100 border-gray-200',
      icon: <XCircle size={14} />
    }
  }
  return {
    label: 'Ativo',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle size={14} />
  }
}

const TIPO_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  MAC: { label: 'MAC', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  PP: { label: 'PP', color: 'text-violet-700', bg: 'bg-violet-100', dot: 'bg-violet-500' },
  PT: { label: 'PT', color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  NPP: { label: 'NPP', color: 'text-rose-700', bg: 'bg-rose-100', dot: 'bg-rose-500' },
  NPT: { label: 'NPT', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' }
}

function TipoBadge({ tipo }: { tipo: string }) {
  const meta = TIPO_META[tipo] ?? { label: tipo, color: 'text-gray-700', bg: 'bg-gray-100', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

function StatusBadge({ periodo }: { periodo: PeriodoLancamento }) {
  const info = getStatusInfo(periodo)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${info.bg} ${info.color}`}>
      {info.icon}
      {info.label}
    </span>
  )
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─────────────────────────────────────────────
// Modal de Criação
// ─────────────────────────────────────────────
interface CreateModalProps {
  open: boolean
  anosLetivos: AnoLetivo[]
  onClose: () => void
  onCreated: () => void
}

function CreateModal({ open, anosLetivos, onClose, onCreated }: CreateModalProps) {
  const [nome, setNome] = useState('')
  const [tipoNota, setTipoNota] = useState('')
  const [trimestre, setTrimestre] = useState('')
  const [anoLectivo, setAnoLectivo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (open && anosLetivos.length > 0 && !anoLectivo) {
      setAnoLectivo(anosLetivos[0].designacao)
    }
  }, [open, anosLetivos, anoLectivo])

  const reset = () => {
    setNome(''); setTipoNota(''); setTrimestre(''); setAnoLectivo('')
    setDataInicio(''); setDataFim(''); setErro('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!nome || !tipoNota || !trimestre || !anoLectivo || !dataInicio || !dataFim) {
      setErro('Todos os campos são obrigatórios.')
      return
    }
    if (new Date(dataFim) <= new Date(dataInicio)) {
      setErro('A data de fim deve ser posterior à data de início.')
      return
    }

    try {
      setSalvando(true)
      await periodoService.criarPeriodo({
        nome, tipoNota, trimestre: parseInt(trimestre),
        anoLectivo, dataInicio, dataFim
      })
      reset()
      onCreated()
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Erro ao criar período.')
    } finally {
      setSalvando(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007C00] to-[#005a00] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Novo Período</h2>
              <p className="text-green-200 text-xs">Preencha os dados do período de lançamento</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {erro}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nome do Período</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: 1º Trimestre MAC 2025"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-transparent transition-all"
            />
          </div>

          {/* Tipo + Trimestre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Tipo de Nota</label>
              <select
                value={tipoNota}
                onChange={e => setTipoNota(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione</option>
                <option value="MAC">MAC – Média de Avaliação Contínua</option>
                <option value="PP">PP – Prova Parcial</option>
                <option value="PT">PT – Prova Trimestral</option>
                <option value="NPP">NPP – Nota Prova Parcial</option>
                <option value="NPT">NPT – Nota Prova Trimestral</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Trimestre</label>
              <select
                value={trimestre}
                onChange={e => setTrimestre(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione</option>
                <option value="1">1º Trimestre</option>
                <option value="2">2º Trimestre</option>
                <option value="3">3º Trimestre</option>
              </select>
            </div>
          </div>

          {/* Ano letivo */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Ano Letivo</label>
            <select
              value={anoLectivo}
              onChange={e => setAnoLectivo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-transparent transition-all bg-white"
            >
              <option value="">Selecione o ano letivo</option>
              {anosLetivos.map(ano => (
                <option key={ano.codigo} value={ano.designacao}>{ano.designacao}</option>
              ))}
            </select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Data de Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Data de Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#007C00] to-[#005a00] text-white text-sm font-semibold hover:from-[#005a00] hover:to-[#004000] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {salvando ? (
                <><RefreshCw size={14} className="animate-spin" /> A criar…</>
              ) : (
                <><Plus size={14} /> Criar Período</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function PeriodosLancamentoManagement() {
  const [periodos, setPeriodos] = useState<PeriodoLancamento[]>([])
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [acaoId, setAcaoId] = useState<number | null>(null)

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      setErro('')
      const [pList, aList] = await Promise.all([
        periodoService.listarPeriodos(),
        periodoService.listarAnosLetivos()
      ])
      setPeriodos(pList)
      setAnosLetivos(aList)
    } catch (e: any) {
      setErro('Não foi possível carregar os períodos. Verifique a ligação ao servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleAlterarStatus = async (periodo: PeriodoLancamento) => {
    const isAtivo = getStatusInfo(periodo).label === 'Ativo'
    const novoStatus = isAtivo ? 'Inativo' : 'Ativo'
    try {
      setAcaoId(periodo.codigo)
      await periodoService.alterarStatus(periodo.codigo, novoStatus)
      await carregar()
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Erro ao alterar status.')
    } finally {
      setAcaoId(null)
    }
  }

  const handleExcluir = async (periodo: PeriodoLancamento) => {
    if (!confirm(`Deseja realmente excluir o período "${periodo.nome}"?\nEsta ação não pode ser desfeita.`)) return
    try {
      setAcaoId(periodo.codigo)
      await periodoService.excluirPeriodo(periodo.codigo)
      await carregar()
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Erro ao excluir período.')
    } finally {
      setAcaoId(null)
    }
  }

  // Stats
  const totalPeriodos = periodos.length
  const totalAtivos = periodos.filter(p => getStatusInfo(p).label === 'Ativo').length
  const totalProgramados = periodos.filter(p => getStatusInfo(p).label === 'Programado').length

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-100/30 rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-green-100/30 rounded-full -ml-14 -mb-14 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Períodos de Lançamento</h1>
                <p className="text-gray-500 text-sm">Gerencie os períodos de abertura para lançamento de notas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={carregar}
                disabled={loading}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#007C00] transition-all disabled:opacity-40"
                title="Actualizar lista"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm"
              >
                <Plus size={18} />
                Novo Período
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total de Períodos', value: totalPeriodos, icon: <Calendar size={20} />, color: 'from-slate-500 to-slate-700' },
          { label: 'Períodos Ativos', value: totalAtivos, icon: <CheckCircle size={20} />, color: 'from-emerald-500 to-emerald-700' },
          { label: 'Programados', value: totalProgramados, icon: <Clock size={20} />, color: 'from-blue-500 to-blue-700' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '…' : stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Erro global */}
      {erro && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          {erro}
        </div>
      )}

      {/* Lista de Períodos */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : periodos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-gray-400" size={28} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum período registado</h3>
          <p className="text-gray-400 text-sm mb-6">Crie o primeiro período de lançamento de notas.</p>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#007C00] to-[#005a00] text-white rounded-xl text-sm font-semibold hover:from-[#005a00] hover:to-[#004000] transition-all shadow-md"
          >
            <Plus size={16} /> Criar Primeiro Período
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {periodos.map(periodo => {
            const statusInfo = getStatusInfo(periodo)
            const isLoading = acaoId === periodo.codigo
            const isAtivo = statusInfo.label === 'Ativo'

            return (
              <div
                key={periodo.codigo}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 md:p-6 ${isAtivo ? 'border-emerald-200' : 'border-gray-100'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-base font-bold text-gray-900 truncate">{periodo.nome}</h3>
                      <TipoBadge tipo={periodo.tipoNota} />
                      <StatusBadge periodo={periodo} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Trimestre</span>
                        <span className="font-semibold text-gray-800">{periodo.trimestre}º</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Ano Letivo</span>
                        <span className="font-semibold text-gray-800">{periodo.anoLectivo}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Início</span>
                        <span className="font-semibold text-gray-800">{fmt(periodo.dataInicio)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Fim</span>
                        <span className="font-semibold text-gray-800">{fmt(periodo.dataFim)}</span>
                      </div>
                    </div>

                    {periodo.criadoPor && (
                      <p className="mt-3 text-xs text-gray-400">
                        Criado por <span className="font-medium text-gray-500">{periodo.criadoPor}</span>
                        {periodo.dataCriacao && ` · ${fmt(periodo.dataCriacao)}`}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAlterarStatus(periodo)}
                      disabled={isLoading}
                      title={isAtivo ? 'Desativar período' : 'Ativar período'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                        isAtivo
                          ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isLoading ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : isAtivo ? (
                        <><PowerOff size={14} /> Desativar</>
                      ) : (
                        <><Power size={14} /> Ativar</>
                      )}
                    </button>

                    <button
                      onClick={() => handleExcluir(periodo)}
                      disabled={isLoading}
                      title="Excluir período"
                      className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legenda de tipos */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-gray-400" />
          <h4 className="text-sm font-bold text-gray-700">Tipos de Avaliação</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {[
            { tipo: 'MAC', desc: 'Média de Avaliação Contínua — trabalhos, testes e participação ao longo do trimestre.' },
            { tipo: 'PP', desc: 'Prova Parcial — avaliação intermediária realizada a meio do período.' },
            { tipo: 'PT', desc: 'Prova Trimestral — avaliação final realizada no encerramento do trimestre.' },
            { tipo: 'NPP', desc: 'Nota da Prova Parcial — registo da nota obtida na prova parcial.' },
            { tipo: 'NPT', desc: 'Nota da Prova Trimestral — registo da nota obtida na prova trimestral.' }
          ].map(item => (
            <div key={item.tipo} className="flex gap-3 p-3 rounded-xl bg-gray-50">
              <TipoBadge tipo={item.tipo} />
              <p className="text-gray-600 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de criação */}
      <CreateModal
        open={modalAberto}
        anosLetivos={anosLetivos}
        onClose={() => setModalAberto(false)}
        onCreated={() => { setModalAberto(false); carregar() }}
      />
    </Container>
  )
}
