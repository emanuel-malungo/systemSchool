import React from 'react'
import { usePermissions } from '../../hooks/useAuth'
import { AlertTriangle } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  roles: number[] // Array de códigos de tipo de usuário permitidos
  fallback?: React.ReactNode
  showFallback?: boolean
}

export function RoleGuard({ 
  children, 
  roles, 
  fallback,
  showFallback = true 
}: RoleGuardProps) {
  const { hasRole, userType, user } = usePermissions()
  
  const hasValidRole = roles.some(role => hasRole(role))
  
  if (!hasValidRole) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (!showFallback) {
      return null
    }
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Acesso Negado</p>
            <p className="text-sm">
              Apenas usuários com tipos específicos podem acessar este recurso.
              Seu tipo atual: {userType} (código: {user?.tipo})
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}