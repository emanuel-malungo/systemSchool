import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import ProfessionService from '../services/profession.service'
import type { Profession } from '../types/profession.types'

/**
 * Query keys para gerenciamento de cache de profissões
 */
export const professionKeys = {
  all: ['professions'] as const,
  lists: () => [...professionKeys.all, 'list'] as const,
  list: () => [...professionKeys.lists()] as const,
  details: () => [...professionKeys.all, 'detail'] as const,
  detail: (id: number) => [...professionKeys.details(), id] as const,
}

/**
 * Configuração de cache para profissões
 * Dados raramente mudam, então usamos cache longo
 */
const PROFESSION_CACHE_CONFIG = {
  staleTime: 1000 * 60 * 60 * 24, // 24 horas
  gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 2,
}

/**
 * Hook para buscar todas as profissões
 * Com cache de longa duração pois profissões raramente mudam
 * 
 * @example
 * ```tsx
 * const { data: professions, isLoading, error } = useProfessions()
 * ```
 */
export function useProfessions(): UseQueryResult<Profession[], Error> {
  return useQuery({
    queryKey: professionKeys.list(),
    queryFn: () => ProfessionService.getAllProfessions(),
    ...PROFESSION_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar profissão por ID
 * 
 * @param id - Código da profissão
 * @example
 * ```tsx
 * const { data: profession, isLoading } = useProfessionById(1)
 * ```
 */
export function useProfessionById(id: number | undefined): UseQueryResult<Profession, Error> {
  return useQuery({
    queryKey: professionKeys.detail(id!),
    queryFn: () => ProfessionService.getProfessionById(id!),
    enabled: !!id && id > 0,
    ...PROFESSION_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar profissões com filtro de busca
 * 
 * @param searchTerm - Termo de busca
 * @example
 * ```tsx
 * const [search, setSearch] = useState('')
 * const { data: filteredProfessions } = useSearchProfessions(search)
 * ```
 */
export function useSearchProfessions(searchTerm: string = ''): UseQueryResult<Profession[], Error> {
  return useQuery({
    queryKey: [...professionKeys.list(), 'search', searchTerm],
    queryFn: () => ProfessionService.searchProfessions(searchTerm),
    ...PROFESSION_CACHE_CONFIG,
  })
}

/**
 * Hook compatível com formato antigo (retorna objeto)
 * Mantido para compatibilidade com código existente
 * 
 * @deprecated Use useProfessions() diretamente
 */
export function useProfessionsCompat() {
  const query = useProfessions()
  
  return {
    professions: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  }
}
