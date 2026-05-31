import { useState, useEffect } from 'react'
import { BookOpen, School, BarChart3, Clock, Calendar, ShieldAlert, ChevronRight } from 'lucide-react'
import Container from '../../components/layout/Container'
import { ProfessorService, type IAtribuicaoDisciplina, type IAtribuicaoTurma } from '../../services/professor.service'
import api from '../../utils/api.utils'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

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

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [atribuicoes, setAtribuicoes] = useState<{ disciplinas: IAtribuicaoDisciplina[]; turmas: IAtribuicaoTurma[] }>({
    disciplinas: [],
    turmas: []
  })
  const [openPeriods, setOpenPeriods] = useState<IPeriodoLancamento[]>([])
  const [totalNotas, setTotalNotas] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Obter dados do perfil
      const profData = await ProfessorService.getPerfil()
      setProfile(profData)

      // Obter atribuições
      const atribData = await ProfessorService.getMinhasAtribuicoes()
      setAtribuicoes({
        disciplinas: atribData.disciplinas || [],
        turmas: atribData.turmas || []
      })

      // Obter notas lançadas
      const notasData = await ProfessorService.getMinhasNotas()
      setTotalNotas(notasData?.length || 0)

      // Obter períodos ativos de lançamento de notas
      const periodsRes = await api.get('/api/periodos-lancamento')
      if (periodsRes.data && periodsRes.data.success) {
        // Filtrar apenas os que estão ativos hoje
        const agora = new Date()
        const ativos = (periodsRes.data.data || []).filter((p: any) => {
          const inicio = new Date(p.dataInicio || p.DataInicio)
          const fim = new Date(p.dataFim || p.DataFim)
          return inicio <= agora && fim >= agora
        })
        setOpenPeriods(ativos)
      }
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao carregar dados do dashboard do docente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header Boas Vindas */}
        <div className="bg-gradient-to-br from-[#007C00] via-[#006e00] to-[#005a00] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10">
            <School size={300} />
          </div>
          
          <div className="relative z-10 space-y-2">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
              Portal do Docente
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight pt-1">
              Olá, Professor{profile ? ` ${profile.Nome.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-green-100 max-w-2xl font-medium">
              Bem-vindo ao seu portal. Aqui você pode gerenciar suas atribuições, acompanhar períodos de avaliações e lançar notas de seus alunos de forma ágil e segura.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007C00] mb-4"></div>
            <p className="text-gray-500 font-medium">Sincronizando painel...</p>
          </div>
        ) : (
          <>
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Disciplinas */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-400 uppercase">Disciplinas</p>
                  <p className="text-3xl font-extrabold text-gray-800">{atribuicoes.disciplinas.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl text-[#007C00]">
                  <BookOpen size={24} />
                </div>
              </div>

              {/* Turmas */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-400 uppercase">Turmas</p>
                  <p className="text-3xl font-extrabold text-gray-800">{atribuicoes.turmas.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl text-[#007C00]">
                  <School size={24} />
                </div>
              </div>

              {/* Notas Lançadas */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-400 uppercase">Notas Lançadas</p>
                  <p className="text-3xl font-extrabold text-gray-800">{totalNotas}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl text-[#007C00]">
                  <BarChart3 size={24} />
                </div>
              </div>

              {/* Períodos de Lançamento */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-400 uppercase">Períodos Ativos</p>
                  <p className="text-3xl font-extrabold text-gray-800">{openPeriods.length}</p>
                </div>
                <div className={`p-4 rounded-2xl ${openPeriods.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Clock size={24} />
                </div>
              </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna da Esquerda: Períodos Ativos & Avisos */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-[#007C00]" /> Períodos de Lançamento
                  </h2>

                  {openPeriods.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 flex flex-col items-center">
                      <ShieldAlert size={36} className="text-gray-400 mb-2" />
                      <p className="font-semibold text-sm">Nenhum período ativo</p>
                      <p className="text-xs text-gray-400 mt-1">O lançamento de notas está temporariamente fechado pela secretaria acadêmica.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {openPeriods.map(p => (
                        <div key={p.codigo} className="border border-green-100 bg-green-50/30 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-[#007C00] text-white text-[10px] font-extrabold rounded-md uppercase">
                              {p.tipoNota || p.TipoAvaliacao}
                            </span>
                            <span className="text-[11px] font-bold text-gray-500">
                              {p.trimestre || p.Trimestre}º Trimestre
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-700">Ano Letivo: {p.anoLectivo || p.AnoLectivo}</p>
                            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar size={12} />
                               Expira em {(p.dataFim || p.DataFim) ? new Date(p.dataFim || p.DataFim || '').toLocaleDateString('pt-AO') : ''}
                            </p>
                          </div>
                          <Link 
                            to="/professor/lancar-notas" 
                            className="mt-2 text-center text-xs font-bold text-[#007C00] hover:text-[#005a00] py-2 bg-white rounded-lg border border-green-200 transition-colors flex items-center justify-center gap-1"
                          >
                            Lançar Notas <ChevronRight size={14} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna da Direita: Atribuições do Docente */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                  <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                    <School size={20} className="text-[#007C00]" /> Minhas Turmas & Disciplinas Atribuídas
                  </h2>

                  {atribuicoes.turmas.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                      <BookOpen size={40} className="text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold text-sm">Sem atribuições no momento</p>
                      <p className="text-xs text-gray-400 mt-1">Caso possua turmas atribuídas e não apareçam aqui, contate a direção acadêmica.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {atribuicoes.turmas.map(t => (
                        <div key={t.codigo} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex items-start gap-4">
                          <div className="p-3 bg-green-50 rounded-xl text-[#007C00] shrink-0">
                            <School size={20} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-800">{t.tb_turmas?.designacao}</p>
                            <p className="text-xs text-[#007C00] font-semibold">{t.tb_disciplinas?.designacao}</p>
                            <p className="text-[11px] text-gray-400">Classe: {t.tb_turmas?.tb_classes?.designacao || 'N/A'}</p>
                            <p className="text-[11px] text-gray-400">Ano: {t.anoLectivo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}
