import { memo } from 'react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { 
  UserPlus, 
  DollarSign, 
  BookOpen, 
  UserCheck,
  FileText,
  AlertCircle
} from 'lucide-react'
import type { RecentActivity } from '../../types/dashboard.types'

interface ActivityItemProps {
  activity: RecentActivity
}

const getIcon = (iconName: string): ComponentType<LucideProps> => {
  const icons: Record<string, ComponentType<LucideProps>> = {
    UserPlus,
    DollarSign,
    BookOpen,
    UserCheck,
    FileText,
    AlertCircle,
  }
  return icons[iconName] || FileText
}

const getIconColor = (type: string) => {
  const colors: Record<string, string> = {
    enrollment: 'bg-blue-100 text-blue-600',
    payment: 'bg-green-100 text-green-600',
    grade: 'bg-purple-100 text-purple-600',
    attendance: 'bg-yellow-100 text-yellow-600',
    document: 'bg-gray-100 text-gray-600',
    alert: 'bg-red-100 text-red-600',
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ActivityItem = memo(({ activity }: ActivityItemProps) => {
  const Icon = getIcon(activity.icon)
  const colorClass = getIconColor(activity.type)

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.title}
        </p>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  )
})

ActivityItem.displayName = 'ActivityItem'

interface ActivityFeedProps {
  activities: RecentActivity[]
  loading?: boolean
}

export default function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-gray-600 text-sm">Nenhuma atividade recente</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {activities.map((activity, index) => (
        <ActivityItem key={index} activity={activity} />
      ))}
    </div>
  )
}
