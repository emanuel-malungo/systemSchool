import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import DocumentService from '../services/document.service'
import type { IDocumentType, IDocumentNumbering } from '../types/document.types'

/**
 * Query keys para gerenciamento de cache de documentos
 */
export const documentKeys = {
  all: ['documents'] as const,
  types: () => [...documentKeys.all, 'types'] as const,
  type: (id: number) => [...documentKeys.types(), id] as const,
  numberings: () => [...documentKeys.all, 'numberings'] as const,
  numbering: (id: number) => [...documentKeys.numberings(), id] as const,
}

/**
 * Configuração de cache para tipos de documento
 * Dados raramente mudam, então usamos cache longo
 */
const DOCUMENT_TYPE_CACHE_CONFIG = {
  staleTime: 1000 * 60 * 60 * 24, // 24 horas
  gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 2,
}

/**
 * Configuração de cache para numeração de documentos
 * Dados mudam com mais frequência, cache mais curto
 */
const NUMBERING_CACHE_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutos
  gcTime: 1000 * 60 * 30, // 30 minutos
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  retry: 2,
}

// ============================================
// HOOKS PARA TIPOS DE DOCUMENTO
// ============================================

/**
 * Hook para buscar todos os tipos de documento
 * Com cache de longa duração pois tipos raramente mudam
 * 
 * @example
 * ```tsx
 * const { data: documentTypes, isLoading, error } = useDocumentTypes()
 * ```
 */
export function useDocumentTypes(): UseQueryResult<IDocumentType[], Error> {
  return useQuery({
    queryKey: documentKeys.types(),
    queryFn: () => DocumentService.getAllDocumentTypes(),
    ...DOCUMENT_TYPE_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar tipo de documento por ID
 * 
 * @param id - Código do tipo de documento
 */
export function useDocumentTypeById(id: number | undefined): UseQueryResult<IDocumentType, Error> {
  return useQuery({
    queryKey: documentKeys.type(id!),
    queryFn: () => DocumentService.getDocumentTypeById(id!),
    enabled: !!id && id > 0,
    ...DOCUMENT_TYPE_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar tipos de documento com filtro de busca
 * 
 * @param searchTerm - Termo de busca
 */
export function useSearchDocumentTypes(searchTerm: string = ''): UseQueryResult<IDocumentType[], Error> {
  return useQuery({
    queryKey: [...documentKeys.types(), 'search', searchTerm],
    queryFn: () => DocumentService.searchDocumentTypes(searchTerm),
    ...DOCUMENT_TYPE_CACHE_CONFIG,
  })
}

// ============================================
// HOOKS PARA NUMERAÇÃO DE DOCUMENTOS
// ============================================

/**
 * Hook para buscar todas as numerações de documentos
 */
export function useDocumentNumberings(): UseQueryResult<IDocumentNumbering[], Error> {
  return useQuery({
    queryKey: documentKeys.numberings(),
    queryFn: () => DocumentService.getDocumentNumbering(),
    ...NUMBERING_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar numeração de documento por ID
 */
export function useDocumentNumberingById(id: number | undefined): UseQueryResult<IDocumentNumbering, Error> {
  return useQuery({
    queryKey: documentKeys.numbering(id!),
    queryFn: () => DocumentService.getDocumentNumberingById(id!),
    enabled: !!id && id > 0,
    ...NUMBERING_CACHE_CONFIG,
  })
}

/**
 * Hook para criar numeração de documento
 */
export function useCreateDocumentNumbering(): UseMutationResult<
  IDocumentNumbering,
  Error,
  IDocumentNumbering
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (numberingData: IDocumentNumbering) => 
      DocumentService.createDocumentNumbering(numberingData),
    onSuccess: () => {
      // Invalidar cache para recarregar lista
      queryClient.invalidateQueries({ queryKey: documentKeys.numberings() })
    },
  })
}

/**
 * Hook para atualizar numeração de documento
 */
export function useUpdateDocumentNumbering(): UseMutationResult<
  IDocumentNumbering,
  Error,
  { id: number; data: IDocumentNumbering }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IDocumentNumbering }) => 
      DocumentService.updateDocumentNumbering(id, data),
    onSuccess: (_, variables) => {
      // Invalidar cache específico e lista
      queryClient.invalidateQueries({ queryKey: documentKeys.numbering(variables.id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.numberings() })
    },
  })
}

/**
 * Hook para deletar numeração de documento
 */
export function useDeleteDocumentNumbering(): UseMutationResult<
  void,
  Error,
  number
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => DocumentService.deleteDocumentNumbering(id),
    onSuccess: (_, id) => {
      // Remover do cache e invalidar lista
      queryClient.removeQueries({ queryKey: documentKeys.numbering(id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.numberings() })
    },
  })
}

// ============================================
// HOOKS DE COMPATIBILIDADE (FORMATO ANTIGO)
// ============================================

/**
 * Hook compatível com formato antigo para tipos de documento
 * Mantido para compatibilidade com código existente
 * 
 * @deprecated Use useDocumentTypes() diretamente
 */
export function useDocumentTypesCompat() {
  const query = useDocumentTypes()
  
  return {
    documentTypes: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  }
}

/**
 * Hook compatível com formato antigo para numerações
 * 
 * @deprecated Use useDocumentNumberings() diretamente
 */
export function useDocumentNumberingsCompat() {
  const query = useDocumentNumberings()
  
  return {
    numberings: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  }
}
