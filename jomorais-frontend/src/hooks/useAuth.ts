import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

// Hook para verificar permissões (pode ser expandido)
export function usePermissions() {
  const { user } = useAuth()
  
  const hasRole = (roleCode: number): boolean => {
    if (!user) return false
    return user.tipo === roleCode
  }

  const isAdmin = (): boolean => {
    return hasRole(1) // Assumindo que 1 é admin
  }

  const isTeacher = (): boolean => {
    return hasRole(2) // Assumindo que 2 é professor
  }

  const isStudent = (): boolean => {
    return hasRole(3) // Assumindo que 3 é aluno
  }

  return {
    hasRole,
    isAdmin,
    isTeacher,
    isStudent
  }
}
