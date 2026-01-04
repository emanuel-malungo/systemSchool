import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import institutionService from '../services/institution.service'
import type { IInstitutionInput } from '../types/institution.types'

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
export const institutionKeys = {
  all: ['institutions'] as const,
  lists: () => [...institutionKeys.all, 'list'] as const,
  list: () => [...institutionKeys.lists()] as const,
  details: () => [...institutionKeys.all, 'detail'] as const,
  detail: (id: number) => [...institutionKeys.details(), id] as const,
  principal: () => [...institutionKeys.all, 'principal'] as const,
}

/**
 * Hook para buscar todas as instituições
 * Implementa cache automático e refetch otimizado
 */
export function useInstitutions() {
  return useQuery({
    queryKey: institutionKeys.list(),
    queryFn: () => institutionService.getInstitutions(),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar a instituição principal (primeiro registro)
 */
export function useInstitutionPrincipal(enabled = true) {
  return useQuery({
    queryKey: institutionKeys.principal(),
    queryFn: () => institutionService.getInstitutionPrincipal(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar uma instituição específica por ID
 */
export function useInstitution(id: number, enabled = true) {
  return useQuery({
    queryKey: institutionKeys.detail(id),
    queryFn: () => institutionService.getInstitutionById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova instituição
 * Invalida cache automaticamente após sucesso
 */
export function useCreateInstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (institutionData: IInstitutionInput) =>
      institutionService.createInstitution(institutionData),
    
    onSuccess: (response) => {
      // Invalida todas as listas de instituições para refazer o fetch
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: institutionKeys.principal() })
      
      toast.success(response.message || 'Instituição criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar instituição'
      toast.error(errorMessage)
      console.error('Erro ao criar instituição:', error)
    },
  })
}

/**
 * Hook para atualizar uma instituição existente
 * Utiliza optimistic update para melhor UX
 */
export function useUpdateInstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, institutionData }: { id: number; institutionData: IInstitutionInput }) =>
      institutionService.updateInstitution(id, institutionData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async ({ id, institutionData }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: institutionKeys.detail(id) })

      // Salva o valor anterior
      const previousInstitution = queryClient.getQueryData(institutionKeys.detail(id))

      // Atualiza otimisticamente
      if (previousInstitution) {
        queryClient.setQueryData(institutionKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...institutionData },
          }
        })
      }

      return { previousInstitution }
    },
    
    onSuccess: (response, { id }) => {
      // Atualiza o cache com os dados reais do servidor
      queryClient.setQueryData(institutionKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: institutionKeys.principal() })
      
      toast.success(response.message || 'Instituição atualizada com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousInstitution) {
        queryClient.setQueryData(institutionKeys.detail(id), context.previousInstitution)
      }
      
      const errorMessage = error?.response?.data?.message || 'Erro ao atualizar instituição'
      toast.error(errorMessage)
      console.error('Erro ao atualizar instituição:', error)
    },
    
    onSettled: (_, __, { id }) => {
      // Revalida a query após a operação
      queryClient.invalidateQueries({ queryKey: institutionKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar uma instituição
 */
export function useDeleteInstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => institutionService.deleteInstitution(id),
    
    onSuccess: (response, id) => {
      // Remove a instituição específica do cache
      queryClient.removeQueries({ queryKey: institutionKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: institutionKeys.principal() })
      
      toast.success(response.message || 'Instituição deletada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao deletar instituição'
      toast.error(errorMessage)
      console.error('Erro ao deletar instituição:', error)
    },
  })
}

/**
 * Hook para fazer upload do logo da instituição
 */
export function useUploadLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => institutionService.uploadLogo(file),
    
    onSuccess: () => {
      // Invalida todas as queries de instituição para refletir o novo logo
      queryClient.invalidateQueries({ queryKey: institutionKeys.all })
      
      toast.success('Logo enviado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao enviar logo'
      toast.error(errorMessage)
      console.error('Erro ao enviar logo:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de instituição
 * Útil quando você precisa de múltiplas operações em um componente
 */
export function useInstitutionManager() {
  const institutions = useInstitutions()
  const principal = useInstitutionPrincipal()
  const createInstitution = useCreateInstitution()
  const updateInstitution = useUpdateInstitution()
  const deleteInstitution = useDeleteInstitution()
  const uploadLogo = useUploadLogo()

  return {
    // Queries
    institutions: institutions.data?.data || [],
    principal: principal.data?.data,
    isLoading: institutions.isLoading || principal.isLoading,
    isError: institutions.isError || principal.isError,
    error: institutions.error || principal.error,
    refetch: institutions.refetch,
    refetchPrincipal: principal.refetch,

    // Mutations
    createInstitution: createInstitution.mutate,
    updateInstitution: updateInstitution.mutate,
    deleteInstitution: deleteInstitution.mutate,
    uploadLogo: uploadLogo.mutate,

    // Loading states
    isCreating: createInstitution.isPending,
    isUpdating: updateInstitution.isPending,
    isDeleting: deleteInstitution.isPending,
    isUploading: uploadLogo.isPending,

    // Async versions (para usar com async/await)
    createInstitutionAsync: createInstitution.mutateAsync,
    updateInstitutionAsync: updateInstitution.mutateAsync,
    deleteInstitutionAsync: deleteInstitution.mutateAsync,
    uploadLogoAsync: uploadLogo.mutateAsync,
  }
}
