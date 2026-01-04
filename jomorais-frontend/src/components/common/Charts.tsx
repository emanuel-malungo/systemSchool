import { memo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { 
  EnrollmentEvolution, 
  MonthlyRevenue, 
  GradeDistribution, 
  WeeklyAttendance 
} from '../../types/dashboard.types'

// Componente de Tooltip customizado (simplificado)
function CustomTooltip(props: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  const { active, payload, label } = props
  
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm">
          <span className="font-semibold text-gray-800">
            {entry.name}: {entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

// Gráfico de Evolução de Matrículas
interface EnrollmentChartProps {
  data: EnrollmentEvolution[]
}

export const EnrollmentChart = memo(({ data }: EnrollmentChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Area
          type="monotone"
          dataKey="students"
          name="Alunos"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorStudents)"
        />
        <Area
          type="monotone"
          dataKey="teachers"
          name="Professores"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorTeachers)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

EnrollmentChart.displayName = 'EnrollmentChart'

// Gráfico de Receita Mensal
interface RevenueChartProps {
  data: MonthlyRevenue[]
}

export const RevenueChart = memo(({ data }: RevenueChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="propinas" name="Propinas" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="servicos" name="Serviços" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        <Bar dataKey="total" name="Total" fill="#6366f1" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
})

RevenueChart.displayName = 'RevenueChart'

// Gráfico de Distribuição de Notas
interface GradesChartProps {
  data: GradeDistribution[]
}

export const GradesChart = memo(({ data }: GradesChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
          nameKey="grade"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
})

GradesChart.displayName = 'GradesChart'

// Gráfico de Presença Semanal
interface AttendanceChartProps {
  data: WeeklyAttendance[]
}

export const AttendanceChart = memo(({ data }: AttendanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey="attendance"
          name="Presença"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="students"
          name="Total de Alunos"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#94a3b8', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

AttendanceChart.displayName = 'AttendanceChart'
