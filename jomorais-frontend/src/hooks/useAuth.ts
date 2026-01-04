import { useContext, useMemo } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { 
  getUserPermissions, 
  canAccessRoute, 
  shouldShowMenuItem,
  type UserPermissions 
} from '../utils/permissions.utils'

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

// Hook para verificar permissões baseado no sistema JOMORAIS
export function usePermissions() {
  const { user } = useAuth()

  const permissions = useMemo((): UserPermissions => {
    if (!user) {
      // Usuário não autenticado - sem permissões
      return {
        canAccessStudentManagement: false,
        canAccessAcademicManagement: false,
        canAccessFinancial: false,
        canAccessReports: false,
        canAccessSettings: false,
        canAccessPayments: false,
        canAccessInvoices: false,
        canAccessFinancialReports: false,
        canAccessSAFT: false,
        canAccessFinancialSettings: false,
      }
    }

    // Para usuários legados, usar tipoDesignacao se disponível
    if ('tipoDesignacao' in user) {
      return getUserPermissions(user.tipo, user.tipoDesignacao)
    }

    // Para usuários modernos, usar apenas o tipo
    return getUserPermissions(user.tipo)
  }, [user])

  const canAccess = useMemo(() => ({
    route: (path: string) => canAccessRoute(path, permissions),
    menuItem: (menuPath: string) => shouldShowMenuItem(menuPath, permissions),
  }), [permissions])

  const hasRole = (roleCode: number): boolean => {
    if (!user) return false
    return user.tipo === roleCode
  }

  const getUserTypeDesignation = (): string => {
    if (!user) return 'unknown'
    
    // Para usuários legados
    if ('tipoDesignacao' in user && user.tipoDesignacao) {
      return user.tipoDesignacao.toLowerCase()
    }
    
    // Para usuários modernos ou fallback
    const typeMapping: Record<number, string> = {
      1: 'lidia',
      2: 'operador',
      3: 'assistente administrativo',
      4: 'professor',
      5: 'pedagogico',
      6: 'administrador',
      7: 'chefe de secretaria'
    }
    
    return typeMapping[user.tipo] || 'unknown'
  }

  return {
    permissions,
    canAccess,
    user,
    userType: getUserTypeDesignation(),
    isAdmin: getUserTypeDesignation() === 'administrador',
    isChefe: getUserTypeDesignation() === 'chefe de secretaria',
    hasFullAccess: getUserTypeDesignation() === 'administrador' || 
                   getUserTypeDesignation() === 'chefe de secretaria',
    hasRole
  }
}
