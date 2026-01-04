import React from 'react'
import { usePermissions } from '../../hooks/useAuth'
import { AlertTriangle } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  permission: keyof ReturnType<typeof usePermissions>['permissions']
  fallback?: React.ReactNode
  showFallback?: boolean
}

export function PermissionGuard({ 
  children, 
  permission, 
  fallback,
  showFallback = true 
}: PermissionGuardProps) {
  const { permissions, userType } = usePermissions()
  
  const hasPermission = permissions[permission]
  
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (!showFallback) {
      return null
    }
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Acesso Restrito</p>
            <p className="text-sm">
              Seu tipo de usuário ({userType}) não tem permissão para acessar este recurso.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}