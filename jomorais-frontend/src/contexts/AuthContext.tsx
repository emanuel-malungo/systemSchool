import { createContext, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type User } from '../stores/auth.store'
import authService from '../services/auth.service'
import type { LegacyLoginCredentials, LegacyRegisterData } from '../types/auth.types'

interface AuthContextType {
  // Estado
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Métodos de autenticação
  login: (credentials: LegacyLoginCredentials) => Promise<void>
  logout: () => void
  register: (userData: LegacyRegisterData) => Promise<void>
  refreshUser: () => Promise<void>
  
  // Métodos auxiliares
  checkAuth: () => Promise<boolean>
  hasValidToken: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Exportar o contexto para uso nos hooks
export { AuthContext }

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  
  // Estado do Zustand
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: setLoginState,
    logout: clearAuthState,
    setLoading,
    setUser
  } = useAuthStore()

  // Verificar autenticação ao carregar (apenas validação local)
  useEffect(() => {
    const initAuth = () => {
      setLoading(true)
      
      try {
        // Verificar se há token válido localmente (sem fazer requisição)
        if (!token || !authService.hasValidToken()) {
          clearAuthState()
          return
        }

        // Verificar se há dados do usuário salvos no localStorage
        const storedUser = authService.getStoredUser()
        if (storedUser) {
          // Usar os dados salvos localmente
          setUser(storedUser)
        } else {
          // Se não houver dados do usuário, limpar a sessão
          clearAuthState()
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        clearAuthState()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executa apenas uma vez ao montar

  // Login
  const login = async (credentials: LegacyLoginCredentials) => {
    try {
      setLoading(true)
      
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data
        
        // Atualizar estado do Zustand
        setLoginState(userData, authToken)
        
        // Redirecionar para dashboard/admin
        navigate('/admin')
      } else {
        throw new Error(response.message || 'Falha ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    // Fazer logout (limpa localStorage)
    authService.logout()
    
    // Limpar estado do Zustand
    clearAuthState()
    
    // Redirecionar para login
    navigate('/auth')
  }

  // Registrar novo usuário
  const register = async (userData: LegacyRegisterData) => {
    try {
      setLoading(true)
      
      const response = await authService.register(userData)
      
      if (response.success) {
        // Após registro bem-sucedido, fazer login automático
        // ou redirecionar para página de login
        navigate('/auth')
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Atualizar dados do usuário (desabilitado - usuário deve fazer logout/login)
  const refreshUser = async () => {
    console.info('Para ver alterações no perfil, faça logout e login novamente.')
    // Não faz requisição para o servidor
    // Usuário precisa fazer logout e login para ver alterações
  }

  // Verificar se está autenticado (apenas validação local, sem requisição)
  const checkAuth = async (): Promise<boolean> => {
    try {
      // Apenas verifica o token localmente, sem fazer requisição ao servidor
      if (!token || !authService.hasValidToken()) {
        return false
      }

      // Verificar se há dados do usuário salvos
      const storedUser = authService.getStoredUser()
      return !!storedUser
    } catch {
      return false
    }
  }

  // Verificar se tem token válido (sem fazer request)
  const hasValidToken = (): boolean => {
    return !!token && authService.hasValidToken()
  }

  const value: AuthContextType = {
    // Estado
    user,
    token,
    isAuthenticated,
    isLoading,

    // Métodos
    login,
    logout,
    register,
    refreshUser,
    checkAuth,
    hasValidToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
