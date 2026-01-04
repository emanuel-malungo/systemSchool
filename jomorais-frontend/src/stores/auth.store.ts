import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LegacyUser, ModernUser } from '../types/auth.types'

export type User = LegacyUser | ModernUser

interface AuthState {
  // Estado
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Ações
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Ações
      setUser: (user) => set({ 
        user,
        isAuthenticated: !!user 
      }),

      setToken: (token) => set({ token }),

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData } as User
          })
        }
      }
    }),
    {
      name: 'auth-storage', // nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }), // Apenas esses campos serão persistidos
    }
  )
)
