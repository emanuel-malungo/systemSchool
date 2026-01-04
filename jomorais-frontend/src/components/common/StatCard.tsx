import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { formatSmartValue, formatCurrency } from '../../utils/format.utils'
import { TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ComponentType<LucideProps>
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  subtitle?: string
  iconBgColor?: string
  iconColor?: string
  onClick?: () => void
  loading?: boolean
  valueType?: 'number' | 'currency' | 'percentage' | 'custom'
  currency?: 'AOA' | 'USD' | 'EUR'
  bgGradient?: string
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  subtitle,
  iconBgColor = 'bg-linear-to-br from-blue-500 to-blue-600',
  iconColor = 'text-white',
  onClick,
  loading = false,
  valueType = 'custom',
  currency = 'AOA',
  bgGradient = 'from-blue-50 via-white to-blue-50/50',
}: StatCardProps) {
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-600'
    if (trendDirection === 'down') return 'text-red-600'
    return 'text-gray-600'
  }


  const getFormattedValue = (): string => {
    if (typeof value === 'string') return value
    
    switch (valueType) {
      case 'currency':
        return formatCurrency(value, currency, true)
      case 'number':
      case 'percentage':
        return formatSmartValue(value, valueType)
      case 'custom':
      default:
        return value.toString()
    }
  }

  if (loading) {
    return (
      <div className="bg-linear-to-br from-gray-50 via-white to-gray-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    )
  }

  const hasValue = value !== 0 && value !== '0' && value !== '';

  return (
    <div
      onClick={onClick}
      className={`bg-linear-to-br ${bgGradient} rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-xl shadow-sm`}>
          <Icon size={24} />
        </div>
        {trend && hasValue && (
          <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <TrendingUp className={`h-3 w-3 ${getTrendColor()}`} />
            <span className={`font-bold text-xs ${getTrendColor()}`}>
              {trend}
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold mb-2 text-gray-700">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1 truncate">
          {getFormattedValue()}
        </h3>
        
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
    </div>
  )
}
