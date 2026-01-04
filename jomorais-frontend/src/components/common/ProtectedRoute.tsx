import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, usePermissions } from '../../hooks/useAuth'
import { AlertTriangle, Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requirePermission?: boolean
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = "/auth",
  requirePermission = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { canAccess, userType } = usePermissions()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Só fazer redirecionamento após o carregamento estar completo
    if (!isLoading && !isAuthenticated) {
      // Verificar se já estamos na página de destino para evitar redirecionamento desnecessário
      if (location.pathname !== redirectTo) {
        navigate(redirectTo, { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, location.pathname])

  // Mostrar loading durante verificação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, não renderizar nada (redirecionamento em andamento)
  if (!isAuthenticated) {
     return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Verificar permissões quando estiver autenticado e for necessário
  if (requirePermission && !canAccess.route(location.pathname)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tipo de usuário: <span className="font-medium capitalize">{userType}</span>
          </p>
          <button
            onClick={() => navigate('/admin', { replace: true })}
            className="bg-[#007C00] hover:bg-[#005a00] text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}