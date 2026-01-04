import { memo } from 'react'
import { 
  Database, 
  Clock, 
  Users, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react'
import type { SystemStatus, SystemAlert } from '../../types/dashboard.types'

interface AlertBadgeProps {
  alert: SystemAlert
}

const AlertBadge = memo(({ alert }: AlertBadgeProps) => {
  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { icon: React.ComponentType<{ size: number; className: string }>; bgColor: string; textColor: string; borderColor: string }> = {
      success: {
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
      },
      error: {
        icon: XCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
      },
    }
    return configs[severity] || configs.info
  }

  const config = getSeverityConfig(alert.severity)
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <Icon size={16} className={`${config.textColor} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${config.textColor} capitalize`}>
          {alert.type}
        </p>
        <p className={`text-xs ${config.textColor} mt-0.5`}>
          {alert.message}
        </p>
      </div>
    </div>
  )
})

AlertBadge.displayName = 'AlertBadge'

interface SystemStatusCardProps {
  status: SystemStatus
  loading?: boolean
}

export default function SystemStatusCard({ status, loading = false }: SystemStatusCardProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ))}
        <div className="mt-4 space-y-2">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const statusItems = [
    {
      icon: Database,
      label: 'Database',
      value: status.database,
      color: status.database === 'Online' ? 'text-green-600' : 'text-red-600',
      bgColor: status.database === 'Online' ? 'bg-green-100' : 'bg-red-100',
    },
    {
      icon: Clock,
      label: 'Último Backup',
      value: status.lastBackup,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Users,
      label: 'Usuários Ativos',
      value: status.activeUsers.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Activity,
      label: 'Carga do Sistema',
      value: status.systemLoad,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Status Items */}
      <div className="grid grid-cols-1 gap-3">
        {statusItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-2.5 ${item.bgColor} rounded-lg`}>
                <Icon size={20} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className={`text-sm font-semibold ${item.color} truncate`}>
                  {item.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Alerts */}
      {status.alerts && status.alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Alertas do Sistema
          </h4>
          <div className="space-y-2">
            {status.alerts.map((alert, index) => (
              <AlertBadge key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {status.alerts && status.alerts.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
            <CheckCircle2 size={16} />
            <p className="text-xs font-medium">Sistema operando normalmente</p>
          </div>
        </div>
      )}
    </div>
  )
}
