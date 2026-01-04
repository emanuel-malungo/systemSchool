import type { ComponentType, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  icon?: ComponentType<LucideProps>
  children: ReactNode
  loading?: boolean
  actions?: ReactNode
  className?: string
}

export default function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  loading = false,
  actions,
  className = '',
}: ChartCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-green-50 rounded-lg">
              <Icon size={20} className="text-green-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}
