import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, usePermissions } from '../hooks/useAuth'

interface PublicRouteProps {
  redirectTo?: string
}

export function PublicRoute({ 
  redirectTo = '/admin'
}: PublicRouteProps) {
  const { isAuthenticated } = useAuth()
  const { userType } = usePermissions()

  // Se estiver autenticado, redirecionar para área protegida correspondente
  if (isAuthenticated) {
    if (userType === 'professor') {
      return <Navigate to="/professor/dashboard" replace />
    } else if (userType === 'director') {
      return <Navigate to="/director/dashboard" replace />
    }
    return <Navigate to={redirectTo} replace />
  }

  // Renderizar rota pública
  return <Outlet />
}
