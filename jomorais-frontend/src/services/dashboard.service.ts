import api from "../utils/api.utils";

import type {
  DashboardStats,
  EnrollmentEvolution,
  MonthlyRevenue,
  GradeDistribution,
  WeeklyAttendance,
  RecentActivity,
  SystemStatus,
  DashboardData
} from "../types/dashboard.types";

// Cache em memória para dashboard
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DashboardCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos (300 segundos)

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar se expirou
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

const dashboardCache = new DashboardCache();

export class DashboardService {
  /**
   * Obter todos os dados do dashboard de uma vez (RECOMENDADO)
   * Usa cache em memória de 5 minutos + cache do servidor
   * Evita requisições desnecessárias e melhora performance
   */
  static async getDashboardData(): Promise<DashboardData> {
    const cacheKey = 'dashboard:full';
    
    // Tentar buscar do cache em memória primeiro (5 minutos)
    const cached = dashboardCache.get<DashboardData>(cacheKey);
    if (cached) {
      console.log('✅ Dashboard do cache em memória (5min)');
      
      // Atualizar em background (opcional)
      this.refreshDashboardInBackground();
      
      return cached;
    }

    console.log('⏳ Buscando dashboard do servidor...');
    const response = await api.get('/api/dashboard');
    const data = response.data.data;

    // Salvar no cache por 5 minutos
    dashboardCache.set(cacheKey, data);

    return data;
  }

  /**
   * Atualizar dashboard em background (não bloqueia UI)
   */
  private static refreshDashboardInBackground(): void {
    api.get('/api/dashboard')
      .then(response => {
        dashboardCache.set('dashboard:full', response.data.data);
        console.log('✅ Dashboard atualizado em background');
      })
      .catch(error => {
        console.warn('Erro ao atualizar dashboard em background:', error);
      });
  }

  /**
   * Forçar atualização do dashboard (limpa cache)
   */
  static async refreshDashboard(): Promise<DashboardData> {
    dashboardCache.clear();
    return this.getDashboardData();
  }

  /**
   * Obter apenas estatísticas gerais
   * Use getDashboardData() para melhor performance
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const cacheKey = 'dashboard:stats';
    const cached = dashboardCache.get<DashboardStats>(cacheKey);
    if (cached) return cached;

    const response = await api.get('/api/dashboard/stats');
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obter evolução de matrículas
   * Use getDashboardData() para melhor performance
   */
  static async getEnrollmentEvolution(): Promise<EnrollmentEvolution[]> {
    const cacheKey = 'dashboard:enrollment';
    const cached = dashboardCache.get<EnrollmentEvolution[]>(cacheKey);
    if (cached) return cached;

    const response = await api.get('/api/dashboard/enrollment-evolution');
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obter receita mensal
   * Use getDashboardData() para melhor performance
   */
  static async getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    const cacheKey = 'dashboard:revenue';
    const cached = dashboardCache.get<MonthlyRevenue[]>(cacheKey);
    if (cached) return cached;

    const response = await api.get('/api/dashboard/monthly-revenue');
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obter distribuição de notas
   * Use getDashboardData() para melhor performance
   */
  static async getGradeDistribution(): Promise<GradeDistribution[]> {
    const cacheKey = 'dashboard:grades';
    const cached = dashboardCache.get<GradeDistribution[]>(cacheKey);
    if (cached) return cached;

    const response = await api.get('/api/dashboard/grade-distribution');
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obter presença semanal
   * Use getDashboardData() para melhor performance
   */
  static async getWeeklyAttendance(): Promise<WeeklyAttendance[]> {
    const cacheKey = 'dashboard:attendance';
    const cached = dashboardCache.get<WeeklyAttendance[]>(cacheKey);
    if (cached) return cached;

    const response = await api.get('/api/dashboard/weekly-attendance');
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obter atividades recentes
   * Cache mais curto devido à natureza dos dados
   */
  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const cacheKey = `dashboard:activity:${limit}`;
    const cached = dashboardCache.get<RecentActivity[]>(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/api/dashboard/recent-activity?limit=${limit}`);
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obter status do sistema
   * Use getDashboardData() para melhor performance
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    const cacheKey = 'dashboard:status';
    const cached = dashboardCache.get<SystemStatus>(cacheKey);
    if (cached) return cached;

    const response = await api.get('/api/dashboard/system-status');
    const data = response.data.data;
    dashboardCache.set(cacheKey, data);
    return data;
  }

  /**
   * Limpar todo o cache do dashboard
   */
  static clearCache(): void {
    dashboardCache.clear();
  }

  /**
   * Invalidar cache específico
   */
  static invalidateCache(key: string): void {
    dashboardCache.invalidate(key);
  }
}

export default DashboardService;
