import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import usersService from '../services/users.service'
import type {
  CreateLegacyUserDTO,
  UpdateLegacyUserDTO,
  PaginationParams,
} from '../types/users.types'

// Tipo para erros da API
interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

// Chaves de cache para o React Query
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
  search: (filters: Record<string, unknown>) => [...usersKeys.all, 'search', filters] as const,
}

/**
 * Hook para buscar todos os usuários com paginação
 * Implementa cache automático e refetch otimizado
 */
export function useUsers(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersService.getAllUsersLegacy(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos (anteriormente cacheTime)
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar um usuário específico por ID
 */
export function useUser(id: number, enabled = true) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.getUserLegacyById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar um novo usuário
 * Invalida cache automaticamente após sucesso
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateLegacyUserDTO) =>
      usersService.createLegacyUser(userData),
    
    onSuccess: (response) => {
      // Invalida todas as listas de usuários para refazer o fetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      
      toast.success(response.message || 'Usuário criado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar usuário'
      toast.error(errorMessage)
      console.error('Erro ao criar usuário:', error)
    },
  })
}

/**
 * Hook para atualizar um usuário existente
 * Utiliza optimistic update para melhor UX
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateLegacyUserDTO }) =>
      usersService.updateLegacyUser(id, userData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async ({ id, userData }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: usersKeys.detail(id) })

      // Salva o valor anterior
      const previousUser = queryClient.getQueryData(usersKeys.detail(id))

      // Atualiza otimisticamente
      if (previousUser) {
        queryClient.setQueryData(usersKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...userData },
          }
        })
      }

      return { previousUser }
    },
    
    onSuccess: (response, { id }) => {
      // Atualiza o cache com os dados reais do servidor
      queryClient.setQueryData(usersKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      
      toast.success(response.message || 'Usuário atualizado com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousUser) {
        queryClient.setQueryData(usersKeys.detail(id), context.previousUser)
      }
      
      const errorMessage = error?.response?.data?.message || 'Erro ao atualizar usuário'
      toast.error(errorMessage)
      console.error('Erro ao atualizar usuário:', error)
    },
    
    onSettled: (_, __, { id }) => {
      // Revalida a query após a operação
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar um usuário (exclusão permanente em cascata)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.deleteLegacyUser(id),
    
    onSuccess: (response, id) => {
      // Remove o usuário específico do cache
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      
      toast.success(response.message || 'Usuário deletado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao deletar usuário'
      toast.error(errorMessage)
      console.error('Erro ao deletar usuário:', error)
    },
  })
}

/**
 * Hook para desativar um usuário (soft delete)
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.deactivateLegacyUser(id),
    
    onSuccess: (response, id) => {
      // Atualiza o cache do usuário específico
      queryClient.setQueryData(usersKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      
      toast.success(response.message || 'Usuário desativado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao desativar usuário'
      toast.error(errorMessage)
      console.error('Erro ao desativar usuário:', error)
    },
  })
}

/**
 * Hook para ativar um usuário
 */
export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.activateLegacyUser(id),
    
    onSuccess: (response, id) => {
      // Atualiza o cache do usuário específico
      queryClient.setQueryData(usersKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      
      toast.success(response.message || 'Usuário ativado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao ativar usuário'
      toast.error(errorMessage)
      console.error('Erro ao ativar usuário:', error)
    },
  })
}

/**
 * Hook para buscar usuários com filtros
 */
export function useSearchUsers(
  filters: { search?: string; estadoActual?: string },
  params: PaginationParams = { page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: usersKeys.search({ ...filters, ...params }),
    queryFn: () => usersService.searchUsers(filters, params),
    enabled: !!(filters.search || filters.estadoActual), // Só executa se houver filtros
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos para buscas
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook auxiliar para verificar se um username já existe
 * Útil para validação em tempo real no formulário
 */
export function useCheckUsername(username: string, enabled = true) {
  return useQuery({
    queryKey: [...usersKeys.all, 'check-username', username],
    queryFn: () => usersService.checkUsernameExists(username),
    enabled: enabled && username.length >= 3, // Só executa se username tiver 3+ caracteres
    staleTime: 1000 * 60, // Cache de 1 minuto
    retry: false, // Não retenta em caso de erro
  })
}

/**
 * Hook combinado para gerenciar todas as operações de usuários
 * Útil quando você precisa de múltiplas operações em um componente
 */
export function useUsersManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const users = useUsers(params)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const deactivateUser = useDeactivateUser()
  const activateUser = useActivateUser()

  return {
    // Queries
    users: users.data?.data || [],
    meta: users.data?.meta,
    isLoading: users.isLoading,
    isError: users.isError,
    error: users.error,
    refetch: users.refetch,

    // Mutations
    createUser: createUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    deactivateUser: deactivateUser.mutate,
    activateUser: activateUser.mutate,

    // Loading states
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isDeactivating: deactivateUser.isPending,
    isActivating: activateUser.isPending,

    // Async versions (para usar com async/await)
    createUserAsync: createUser.mutateAsync,
    updateUserAsync: updateUser.mutateAsync,
    deleteUserAsync: deleteUser.mutateAsync,
    deactivateUserAsync: deactivateUser.mutateAsync,
    activateUserAsync: activateUser.mutateAsync,
  }
}
