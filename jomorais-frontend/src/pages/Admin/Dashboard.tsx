import { memo } from 'react'
import Container from '../../components/layout/Container'
import { useDashboardManager } from '../../hooks/useDashboard'
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
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-linear-to-br from-[#182F59] to-[#1a3260] rounded-xl shadow-md">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dashboard Administrativo
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Sistema ativo</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-base max-w-2xl">
              Visão geral completa do sistema educacional com métricas de desempenho em tempo real
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-5 py-3 bg-white text-[#182F59] rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-[#182F59] shadow-md hover:shadow-lg ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="font-medium">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {isError && <ErrorState onRetry={handleRefresh} />}

      {/* Loading State */}
      {isLoading && <DashboardSkeleton />}

      {/* Dashboard Content */}
      {!isLoading && !isError && data && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              iconBgColor="bg-linear-to-br from-blue-500 to-blue-600"
              iconColor="text-white"
              bgGradient="from-blue-50 via-white to-blue-50/50"
            />

            <StatCard
              title="Alunos Ativos"
              value={stats?.activeStudents || 0}
              valueType="number"
              icon={GraduationCap}
              trend={`${stats?.activityRate || 0}%`}
              trendDirection="up"
              subtitle="taxa de atividade"
              iconBgColor="bg-linear-to-br from-green-500 to-green-600"
              iconColor="text-white"
              bgGradient="from-green-50 via-white to-green-50/50"
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
              iconBgColor="bg-linear-to-br from-purple-500 to-purple-600"
              iconColor="text-white"
              bgGradient="from-purple-50 via-white to-purple-50/50"
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
              iconBgColor="bg-linear-to-br from-orange-500 to-orange-600"
              iconColor="text-white"
              bgGradient="from-orange-50 via-white to-orange-50/50"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Distribuição de Notas"
              subtitle="Performance acadêmica dos alunos"
              icon={PieChart}
            >
              {gradeDistribution && gradeDistribution.length > 0 ? (
                <GradesChart data={gradeDistribution} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Sem dados disponíveis
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Presença Semanal"
              subtitle="Taxa de presença dos alunos"
              icon={BarChart3}
            >
              {weeklyAttendance && weeklyAttendance.length > 0 ? (
                <AttendanceChart data={weeklyAttendance} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Sem dados disponíveis
                </div>
              )}
            </ChartCard>
          </div>

          {/* Activity & System Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Recent Activity - 2 columns */}
            <ChartCard
              title="Atividades Recentes"
              subtitle="Últimas ações no sistema"
              icon={ActivityIcon}
              className="lg:col-span-2"
            >
              {recentActivity && recentActivity.length > 0 ? (
                <ActivityFeed activities={recentActivity} />
              ) : (
                <div className="py-8 text-center text-gray-500">
                  Nenhuma atividade recente
                </div>
              )}
            </ChartCard>

            {/* System Status - 1 column */}
            {/* <ChartCard
              title="Status do Sistema"
              subtitle="Monitoramento em tempo real"
              icon={Server}
            >
              {systemStatus ? (
                <SystemStatusCard status={systemStatus} />
              ) : (
                <div className="py-8 text-center text-gray-500">
                  Status não disponível
                </div>
              )}
            </ChartCard> */}
          </div>
        </div>
      )}
    </Container>
  )
}
