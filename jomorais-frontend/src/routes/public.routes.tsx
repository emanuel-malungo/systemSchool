import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PublicRouteProps {
  redirectTo?: string
}

export function PublicRoute({ 
  redirectTo = '/admin'
}: PublicRouteProps) {
  const { isAuthenticated } = useAuth()

  // Se estiver autenticado, redirecionar para área protegida
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Renderizar rota pública
  return <Outlet />
}
