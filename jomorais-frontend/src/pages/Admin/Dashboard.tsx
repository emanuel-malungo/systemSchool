import { memo } from 'react'
import Container from '../../components/layout/Container'
import { useDashboardManager } from '../../hooks/useDashboard'
import { usePageTitle } from '../../hooks/usePageTitle'
import StatCard from '../../components/common/StatCard'
import ChartCard from '../../components/common/ChartCard'
import ActivityFeed from '../../components/common/ActivityFeed'
import {
  EnrollmentChart,
  RevenueChart,
  GradesChart,
  AttendanceChart,
} from '../../components/common/Charts'
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity as ActivityIcon,
  Rocket
} from 'lucide-react'

// Componente de Loading Skeleton
const DashboardSkeleton = memo(() => (
  <div className="space-y-6">
    {/* Stats Loading */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatCard
          key={i}
          title=""
          value=""
          icon={Users}
          loading={true}
        />
      ))}
    </div>

    {/* Charts Loading */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="" loading={true}>
        <div />
      </ChartCard>
      <ChartCard title="" loading={true}>
        <div />
      </ChartCard>
    </div>
  </div>
))

DashboardSkeleton.displayName = 'DashboardSkeleton'

// Componente de Error State
const ErrorState = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <AlertCircle className="text-red-500 mb-4" size={48} />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erro ao carregar dashboard
    </h3>
    <p className="text-gray-600 mb-4">
      Não foi possível carregar os dados do dashboard.
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors flex items-center gap-2"
    >
      <RefreshCw size={16} />
      Tentar novamente
    </button>
  </div>
))

ErrorState.displayName = 'ErrorState'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const {
    data,
    stats,
    enrollmentEvolution,
    monthlyRevenue,
    gradeDistribution,
    weeklyAttendance,
    recentActivity,
    isLoading,
    isError,
    refresh,
    isRefreshing,
  } = useDashboardManager()

  // Handler para refresh
  const handleRefresh = () => {
    refresh()
  }

  return (
    <Container>
      {/* Header removido em favor do novo banner superior, mas mantido o botão de refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="text-sm font-medium">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      </div>

      {/* Error State */}
      {isError && <ErrorState onRetry={handleRefresh} />}

      {/* Loading State */}
      {isLoading && <DashboardSkeleton />}

      {/* Dashboard Content */}
      {!isLoading && !isError && data && (
        <div className="space-y-6">
          {/* Banner Topo */}
          <div className="bg-[#1a4a2b] rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-md relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Rocket className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg md:text-xl">Potencialize sua gestão com Ferramentas Pro</h3>
                <p className="text-green-100 text-sm">Tenha acesso a relatórios avançados e análises preditivas.</p>
              </div>
            </div>
            <button className="relative z-10 bg-white text-[#1a4a2b] px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
              Fazer Upgrade
            </button>
            {/* Elemento Decorativo */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Gráfico Principal e Atividades */}
            <div className="xl:col-span-2 space-y-6">
              <ChartCard
                title="Evolução de Matrículas"
                subtitle="Alunos e professores por mês"
                icon={TrendingUp}
              >
                {enrollmentEvolution && enrollmentEvolution.length > 0 ? (
                  <EnrollmentChart data={enrollmentEvolution} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Sem dados disponíveis
                  </div>
                )}
              </ChartCard>

              <ChartCard
                title="Atividades Recentes"
                subtitle="Últimas ações no sistema"
                icon={ActivityIcon}
              >
                {recentActivity && recentActivity.length > 0 ? (
                  <ActivityFeed activities={recentActivity} />
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Nenhuma atividade recente
                  </div>
                )}
              </ChartCard>
              
              <ChartCard
                title="Receita Mensal"
                subtitle="Propinas, serviços e total"
                icon={DollarSign}
              >
                {monthlyRevenue && monthlyRevenue.length > 0 ? (
                  <RevenueChart data={monthlyRevenue} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Sem dados disponíveis
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Coluna Direita - Stats Cards e Gráficos Menores */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <StatCard
                  title="Total de Alunos"
                  value={stats?.totalStudents || 0}
                  valueType="number"
                  icon={Users}
                  trend={stats?.studentGrowth || '0%'}
                  trendDirection={
                    stats?.studentGrowth?.startsWith('+') ? 'up' : 
                    stats?.studentGrowth?.startsWith('-') ? 'down' : 'neutral'
                  }
                  subtitle="vs. mês anterior"
                  iconBgColor="bg-green-50"
                  iconColor="text-green-600"
                  bgGradient="bg-white"
                />

                <StatCard
                  title="Alunos Ativos"
                  value={stats?.activeStudents || 0}
                  valueType="number"
                  icon={GraduationCap}
                  trend={`${stats?.activityRate || 0}%`}
                  trendDirection="up"
                  subtitle="taxa de atividade"
                  iconBgColor="bg-green-50"
                  iconColor="text-green-600"
                  bgGradient="bg-white"
                />

                <StatCard
                  title="Total de Professores"
                  value={stats?.totalTeachers || 0}
                  valueType="number"
                  icon={Users}
                  trend={stats?.teacherGrowth || '0%'}
                  trendDirection={
                    stats?.teacherGrowth?.startsWith('+') ? 'up' : 
                    stats?.teacherGrowth?.startsWith('-') ? 'down' : 'neutral'
                  }
                  subtitle="vs. mês anterior"
                  iconBgColor="bg-green-50"
                  iconColor="text-green-600"
                  bgGradient="bg-white"
                />

                <StatCard
                  title="Receita Total"
                  value={stats?.totalRevenue || 0}
                  valueType="currency"
                  currency="AOA"
                  icon={DollarSign}
                  trend={stats?.revenueGrowth || '0%'}
                  trendDirection={
                    stats?.revenueGrowth?.startsWith('+') ? 'up' : 
                    stats?.revenueGrowth?.startsWith('-') ? 'down' : 'neutral'
                  }
                  subtitle="vs. mês anterior"
                  iconBgColor="bg-green-50"
                  iconColor="text-green-600"
                  bgGradient="bg-white"
                />
              </div>

              <ChartCard
                title="Distribuição de Notas"
                subtitle="Performance acadêmica"
                icon={PieChart}
              >
                {gradeDistribution && gradeDistribution.length > 0 ? (
                  <GradesChart data={gradeDistribution} />
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    Sem dados disponíveis
                  </div>
                )}
              </ChartCard>

              <ChartCard
                title="Presença Semanal"
                subtitle="Taxa de presença"
                icon={BarChart3}
              >
                {weeklyAttendance && weeklyAttendance.length > 0 ? (
                  <AttendanceChart data={weeklyAttendance} />
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    Sem dados disponíveis
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
