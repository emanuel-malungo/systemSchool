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
	UserPlus,
	FileText,
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
			<div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8">
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
					<div className="flex-1">
						<div className="flex items-center gap-4 mb-3">
							<div className="w-14 h-14 flex items-center justify-center bg-[#3964d7] rounded-2xl shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]">
								<BarChart3 className="w-7 h-7 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-black text-[#1e293b] leading-tight">
									Dashboard Administrativo
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
									<span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Sistema ativo</span>
								</div>
							</div>
						</div>
						<p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
							Resumo gerencial e métricas de desempenho em tempo real do ecossistema escolar.
						</p>
					</div>
					<button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className={`flex items-center gap-2.5 px-6 py-3.5 bg-[#3964d7] text-white rounded-2xl hover:bg-[#2d52b2] transition-all duration-300 font-bold text-sm shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)] hover:-translate-y-0.5 active:scale-95 ${isRefreshing ? 'opacity-50 cursor-not-allowed scale-100 shadow-none translate-y-0' : ''
							}`}
					>
						<RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
						<span>{isRefreshing ? 'Sincronizando...' : 'Atualizar Dados'}</span>
					</button>
				</div>
			</div>

			{/* Error State */}
			{isError && <ErrorState onRetry={handleRefresh} />}

			{/* Loading State */}
			{isLoading && <DashboardSkeleton />}

			{/* Dashboard Content */}
			{!isLoading && !isError && data && (
				<div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
					{/* Stats Cards Section */}
					<section>
						<div className="flex items-center gap-3 mb-4 ml-1">
							<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
							<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Métricas Rápidas</h2>
						</div>
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
								iconBgColor="bg-[#3964d7]/10"
								iconColor="text-[#3964d7]"
							/>

							<StatCard
								title="Alunos Ativos"
								value={stats?.activeStudents || 0}
								valueType="number"
								icon={GraduationCap}
								trend={`${stats?.activityRate || 0}%`}
								trendDirection="up"
								subtitle="taxa de atividade"
								iconBgColor="bg-emerald-500/10"
								iconColor="text-emerald-500"
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
								iconBgColor="bg-violet-500/10"
								iconColor="text-violet-500"
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
								iconBgColor="bg-amber-500/10"
								iconColor="text-amber-500"
							/>
						</div>
					</section>

					{/* Main Content Grid */}
					<div className="grid grid-cols-12 gap-8">
						{/* Left Column - Main Charts (8 cols) */}
						<div className="col-span-12 lg:col-span-8 space-y-8">
							<div className="flex items-center gap-3 mb-2 ml-1">
								<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
								<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Análise Acadêmica & Financeira</h2>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<ChartCard
									title="Evolução de Matrículas"
									subtitle="Fluxo de Alunos e Professores"
									icon={TrendingUp}
									className="md:col-span-2"
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
									subtitle="Consolidado Financeiro"
									icon={DollarSign}
								>
									{monthlyRevenue && monthlyRevenue.length > 0 ? (
										<RevenueChart data={monthlyRevenue} />
									) : (
										<div className="h-[200px] flex items-center justify-center text-gray-500">
											Sem dados disponíveis
										</div>
									)}
								</ChartCard>


								<div className="grid grid-cols-2 gap-4">
									{[
										{ title: 'Matricular Aluno', sub: 'Novo registro', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
										{ title: 'Lançar Notas', sub: 'Gestão acadêmica', icon: ActivityIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
										{ title: 'Financeiro', sub: 'Pagamentos/Propinas', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
										{ title: 'Relatórios', sub: 'Exportar dados', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
									].map((btn, idx) => (
										<button
											key={idx}
											className="flex flex-col items-start p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#3964d7] hover:bg-gray-50/50 transition-all duration-300 group text-left"
										>
											<div className={`w-10 h-10 rounded-xl ${btn.bg} ${btn.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
												<btn.icon size={20} />
											</div>
											<span className="text-sm font-black text-[#1e293b] block">{btn.title}</span>
											<span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{btn.sub}</span>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Right Column - Secondary Analysis & Activity (4 cols) */}
						<div className="col-span-12 lg:col-span-4 space-y-8">
							<div className="flex items-center gap-3 mb-2 ml-1">
								<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
								<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo do Sistema</h2>
							</div>

							<ChartCard
								title="Atividades Recentes"
								subtitle="Monitoramento em Logs"
								icon={BarChart3}
							>
								{recentActivity && recentActivity.length > 0 ? (
									<ActivityFeed activities={recentActivity.slice(0, 5)} />
								) : (
									<div className="py-8 text-center text-gray-500">
										Nenhuma atividade recente
									</div>
								)}
							</ChartCard>

							<ChartCard
								title="Distribuição de Notas"
								subtitle="Performance por Categoria"
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

						</div>
					</div>
				</div>
			)}
		</Container>
	)
}
