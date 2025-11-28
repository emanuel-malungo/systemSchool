import { useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardService from '../services/dashboard.service'
import type {
  DashboardData,
  DashboardStats,
  EnrollmentEvolution,
  MonthlyRevenue,
  GradeDistribution,
  WeeklyAttendance,
  RecentActivity,
  SystemStatus,
} from '../types/dashboard.types'

/**
 * Tipo para erros da API
 */
interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

/**
 * Chaves de cache para o React Query
 * Organizadas hierarquicamente para facilitar invalidação de cache
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  full: () => [...dashboardKeys.all, 'full'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  enrollment: () => [...dashboardKeys.all, 'enrollment'] as const,
  revenue: () => [...dashboardKeys.all, 'revenue'] as const,
  grades: () => [...dashboardKeys.all, 'grades'] as const,
  attendance: () => [...dashboardKeys.all, 'attendance'] as const,
  activity: (limit: number) => [...dashboardKeys.all, 'activity', limit] as const,
  status: () => [...dashboardKeys.all, 'status'] as const,
}

/**
 * Hook principal para buscar todos os dados do dashboard de uma vez (RECOMENDADO)
 * 
 * Este hook utiliza:
 * - Cache em memória de 5 minutos no serviço
 * - Cache do React Query de 5 minutos
 * - Atualização automática em background
 * - Refetch otimizado
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com todos os dados do dashboard
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useDashboard()
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <Error message={error.message} />
 * 
 * return <DashboardView data={data} />
 * ```
 */
export function useDashboard(enabled = true) {
  return useQuery<DashboardData, ApiError>({
    queryKey: dashboardKeys.full(),
    queryFn: () => DashboardService.getDashboardData(),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos (mesmo do serviço)
    gcTime: 1000 * 60 * 15, // Mantém no cache por 15 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
    refetchInterval: 1000 * 60 * 5, // Atualiza automaticamente a cada 5 minutos
  })
}

/**
 * Hook para forçar atualização do dashboard (limpa todos os caches)
 * 
 * Use este hook quando precisar de dados completamente atualizados,
 * como após operações críticas (criação de matrícula, pagamento, etc)
 * 
 * @example
 * ```tsx
 * const { refresh, isRefreshing } = useDashboardRefresh()
 * 
 * const handlePayment = async () => {
 *   await createPayment()
 *   await refresh() // Força atualização do dashboard
 * }
 * ```
 */
export function useDashboardRefresh() {
  const queryClient = useQueryClient()

  const refresh = async () => {
    // Limpa cache do serviço
    DashboardService.clearCache()
    
    // Invalida e refaz a query do React Query
    return queryClient.refetchQueries({ 
      queryKey: dashboardKeys.full(),
      type: 'active' 
    })
  }

  return {
    refresh,
    isRefreshing: queryClient.isFetching({ queryKey: dashboardKeys.full() }) > 0,
  }
}

/**
 * Hook para buscar apenas estatísticas gerais
 * 
 * Use apenas se precisar exclusivamente das estatísticas.
 * Para melhor performance, prefira useDashboard() que traz todos os dados de uma vez.
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com estatísticas do dashboard
 */
export function useDashboardStats(enabled = true) {
  return useQuery<DashboardStats, ApiError>({
    queryKey: dashboardKeys.stats(),
    queryFn: () => DashboardService.getDashboardStats(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar evolução de matrículas
 * 
 * Use apenas se precisar exclusivamente deste gráfico.
 * Para melhor performance, prefira useDashboard() que traz todos os dados de uma vez.
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados de evolução de matrículas
 */
export function useDashboardEnrollment(enabled = true) {
  return useQuery<EnrollmentEvolution[], ApiError>({
    queryKey: dashboardKeys.enrollment(),
    queryFn: () => DashboardService.getEnrollmentEvolution(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar receita mensal
 * 
 * Use apenas se precisar exclusivamente deste gráfico.
 * Para melhor performance, prefira useDashboard() que traz todos os dados de uma vez.
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados de receita mensal
 */
export function useDashboardRevenue(enabled = true) {
  return useQuery<MonthlyRevenue[], ApiError>({
    queryKey: dashboardKeys.revenue(),
    queryFn: () => DashboardService.getMonthlyRevenue(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar distribuição de notas
 * 
 * Use apenas se precisar exclusivamente deste gráfico.
 * Para melhor performance, prefira useDashboard() que traz todos os dados de uma vez.
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados de distribuição de notas
 */
export function useDashboardGrades(enabled = true) {
  return useQuery<GradeDistribution[], ApiError>({
    queryKey: dashboardKeys.grades(),
    queryFn: () => DashboardService.getGradeDistribution(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar presença semanal
 * 
 * Use apenas se precisar exclusivamente deste gráfico.
 * Para melhor performance, prefira useDashboard() que traz todos os dados de uma vez.
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados de presença semanal
 */
export function useDashboardAttendance(enabled = true) {
  return useQuery<WeeklyAttendance[], ApiError>({
    queryKey: dashboardKeys.attendance(),
    queryFn: () => DashboardService.getWeeklyAttendance(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar atividades recentes
 * 
 * Cache mais curto devido à natureza dinâmica dos dados.
 * 
 * @param limit - Número de atividades a buscar (padrão: 10)
 * @param enabled - Se a query deve ser executada
 * @returns Query com atividades recentes
 * 
 * @example
 * ```tsx
 * const { data: activities } = useDashboardActivity(20)
 * ```
 */
export function useDashboardActivity(limit = 10, enabled = true) {
  return useQuery<RecentActivity[], ApiError>({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => DashboardService.getRecentActivity(limit),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache de apenas 2 minutos (dados mais dinâmicos)
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar status do sistema
 * 
 * Use apenas se precisar exclusivamente do status.
 * Para melhor performance, prefira useDashboard() que traz todos os dados de uma vez.
 * 
 * @param enabled - Se a query deve ser executada
 * @returns Query com status do sistema
 */
export function useDashboardStatus(enabled = true) {
  return useQuery<SystemStatus, ApiError>({
    queryKey: dashboardKeys.status(),
    queryFn: () => DashboardService.getSystemStatus(),
    enabled,
    staleTime: 1000 * 60 * 3, // Cache de 3 minutos
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook combinado para gerenciar o dashboard de forma completa
 * 
 * Fornece todos os dados, estado de carregamento e função de refresh.
 * Este é o hook mais conveniente para usar em componentes de dashboard.
 * 
 * @param autoRefresh - Se deve atualizar automaticamente a cada 5 minutos (padrão: true)
 * @returns Objeto com dados, estados e funções do dashboard
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const {
 *     data,
 *     isLoading,
 *     error,
 *     refresh,
 *     isRefreshing
 *   } = useDashboardManager()
 * 
 *   return (
 *     <div>
 *       <button onClick={refresh} disabled={isRefreshing}>
 *         Atualizar
 *       </button>
 *       {isLoading ? <Skeleton /> : <DashboardView data={data} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useDashboardManager(autoRefresh = true) {
  const dashboard = useDashboard(true)
  const { refresh, isRefreshing } = useDashboardRefresh()

  return {
    // Dados estruturados
    data: dashboard.data,
    stats: dashboard.data?.stats,
    enrollmentEvolution: dashboard.data?.enrollmentEvolution,
    monthlyRevenue: dashboard.data?.monthlyRevenue,
    gradeDistribution: dashboard.data?.gradeDistribution,
    weeklyAttendance: dashboard.data?.weeklyAttendance,
    recentActivity: dashboard.data?.recentActivity,
    systemStatus: dashboard.data?.systemStatus,

    // Estados
    isLoading: dashboard.isLoading,
    isError: dashboard.isError,
    error: dashboard.error,
    isRefreshing,
    isFetching: dashboard.isFetching,

    // Funções
    refresh,
    refetch: dashboard.refetch,

    // Auto-refresh está ativo por padrão (configurado no useDashboard)
    autoRefreshEnabled: autoRefresh,
  }
}

/**
 * Hook para invalidar cache específico do dashboard
 * 
 * Use quando fizer operações que afetam dados específicos do dashboard.
 * Por exemplo, após criar uma matrícula, invalide o enrollment e stats.
 * 
 * @example
 * ```tsx
 * const { invalidateStats, invalidateEnrollment } = useDashboardCache()
 * 
 * const createMatricula = async () => {
 *   await matriculaService.create(data)
 *   invalidateStats() // Atualiza estatísticas
 *   invalidateEnrollment() // Atualiza gráfico de matrículas
 * }
 * ```
 */
export function useDashboardCache() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      DashboardService.clearCache()
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    invalidateFull: () => {
      DashboardService.invalidateCache('dashboard:full')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.full() })
    },
    invalidateStats: () => {
      DashboardService.invalidateCache('dashboard:stats')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
    },
    invalidateEnrollment: () => {
      DashboardService.invalidateCache('dashboard:enrollment')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.enrollment() })
    },
    invalidateRevenue: () => {
      DashboardService.invalidateCache('dashboard:revenue')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.revenue() })
    },
    invalidateGrades: () => {
      DashboardService.invalidateCache('dashboard:grades')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.grades() })
    },
    invalidateAttendance: () => {
      DashboardService.invalidateCache('dashboard:attendance')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.attendance() })
    },
    invalidateActivity: (limit?: number) => {
      if (limit) {
        DashboardService.invalidateCache(`dashboard:activity:${limit}`)
        queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(limit) })
      } else {
        queryClient.invalidateQueries({ queryKey: [...dashboardKeys.all, 'activity'] })
      }
    },
    invalidateStatus: () => {
      DashboardService.invalidateCache('dashboard:status')
      queryClient.invalidateQueries({ queryKey: dashboardKeys.status() })
    },
  }
}
