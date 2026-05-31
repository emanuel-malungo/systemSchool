import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PublicRouteProps {
  redirectTo?: string
}

export function PublicRoute({ 
  redirectTo = '/admin'
}: PublicRouteProps) {
  const { isAuthenticated, user } = useAuth()

  // Se estiver autenticado, redirecionar para área protegida correspondente
  if (isAuthenticated) {
    const isProfessor = Number(user?.tipo) === 4
    return <Navigate to={isProfessor ? '/professor/dashboard' : redirectTo} replace />
  }

  // Renderizar rota pública
  return <Outlet />
}
