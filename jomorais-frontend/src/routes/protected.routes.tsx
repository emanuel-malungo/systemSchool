import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import authService from '../services/auth.service'

interface ProtectedRouteProps {
  redirectTo?: string
  requiredRole?: number
}

export function ProtectedRoute({ 
  redirectTo = '/auth',
  requiredRole
}: ProtectedRouteProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  // Verificar validade do token periodicamente
  useEffect(() => {
    const checkTokenValidity = () => {
      if (!authService.hasValidToken()) {
        // console.warn('🔐 Token inválido detectado - fazendo logout automático');
        logout();
      }
    };

    // Verificar imediatamente
    checkTokenValidity();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkTokenValidity, 30000);

    return () => clearInterval(interval);
  }, [logout]);

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Redirecionar professores tentando acessar a área administrativa
  if (user?.tipo === 4 && location.pathname.startsWith('/admin')) {
    return <Navigate to="/professor/dashboard" replace />
  }

  // Verificar role se especificado
  if (requiredRole !== undefined && user?.tipo !== requiredRole) {
    return <Navigate to={redirectTo} replace />
  }

  // Renderizar rota protegida
  return <Outlet />
}
