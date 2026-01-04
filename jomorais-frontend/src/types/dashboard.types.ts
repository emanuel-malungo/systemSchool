// types/dashboard.types.ts

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalRevenue: number;
  totalPayments: number;
  activityRate: number;
  studentGrowth: string;
  teacherGrowth: string;
  revenueGrowth: string;
}

export interface EnrollmentEvolution {
  month: string;
  students: number;
  teachers: number;
  growth: string;
}

export interface MonthlyRevenue {
  month: string;
  propinas: number;
  servicos: number;
  total: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: string;
  color: string;
  [key: string]: string | number; // Index signature para compatibilidade com recharts
}

export interface WeeklyAttendance {
  day: string;
  attendance: number;
  students: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface SystemAlert {
  type: string;
  message: string;
  severity: string;
}

export interface SystemStatus {
  database: string;
  lastBackup: string;
  activeUsers: number;
  systemLoad: string;
  alerts: SystemAlert[];
}

export interface DashboardData {
  stats: DashboardStats;
  enrollmentEvolution: EnrollmentEvolution[];
  monthlyRevenue: MonthlyRevenue[];
  gradeDistribution: GradeDistribution[];
  weeklyAttendance: WeeklyAttendance[];
  recentActivity: RecentActivity[];
  systemStatus: SystemStatus;
}

export interface DashboardResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
