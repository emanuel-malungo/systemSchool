import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import geographicService from '../services/geographic.service'

/**
 * Chaves de cache para dados geográficos
 * Organização hierárquica para facilitar invalidação de cache
 * 
 * ESTRATÉGIA DE CACHE:
 * - Dados geográficos raramente mudam
 * - Cache de longa duração (24h stale, 7 dias GC)
 * - Perfeito para dropdowns e selects
 * - Reduz drasticamente chamadas à API
 */
export const geographicKeys = {
  all: ['geographic'] as const,
  
  // Nacionalidades
  nacionalidades: () => [...geographicKeys.all, 'nacionalidades'] as const,
  nacionalidade: (id: number) => [...geographicKeys.nacionalidades(), id] as const,
  
  // Estado Civil
  estadoCivil: () => [...geographicKeys.all, 'estado-civil'] as const,
  estadoCivilDetail: (id: number) => [...geographicKeys.estadoCivil(), id] as const,
  
  // Províncias
  provincias: () => [...geographicKeys.all, 'provincias'] as const,
  provincia: (id: number) => [...geographicKeys.provincias(), id] as const,
  
  // Municípios
  municipios: () => [...geographicKeys.all, 'municipios'] as const,
  municipio: (id: number) => [...geographicKeys.municipios(), id] as const,
  municipiosByProvincia: (provinciaId: number) => 
    [...geographicKeys.municipios(), 'provincia', provinciaId] as const,
  
  // Comunas
  comunas: () => [...geographicKeys.all, 'comunas'] as const,
  comuna: (id: number) => [...geographicKeys.comunas(), id] as const,
  comunasByMunicipio: (municipioId: number) => 
    [...geographicKeys.comunas(), 'municipio', municipioId] as const,
  
  // Operações especiais
  hierarchy: () => [...geographicKeys.all, 'hierarchy'] as const,
  search: (term: string) => [...geographicKeys.all, 'search', term] as const,
}

// ===============================
// CONFIGURAÇÃO DE CACHE
// ===============================

/**
 * Configuração de cache padrão para dados geográficos
 * Dados estáveis que raramente mudam
 */
const LONG_CACHE_CONFIG = {
  staleTime: 1000 * 60 * 60 * 24, // 24 horas - dados considerados "frescos"
  gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias - mantidos em memória
  retry: 1, // 1 tentativa apenas
  refetchOnWindowFocus: false, // Não refaz ao focar janela
  refetchOnMount: false, // Não refaz ao montar componente se já tem cache
}

// ===============================
// NACIONALIDADES
// ===============================

/**
 * Hook para buscar todas as nacionalidades
 * Cache de longa duração - ideal para dropdowns
 */
export function useNacionalidades(enabled = true) {
  return useQuery({
    queryKey: geographicKeys.nacionalidades(),
    queryFn: () => geographicService.getAllNacionalidades(),
    enabled,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar uma nacionalidade específica
 */
export function useNacionalidade(id: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.nacionalidade(id),
    queryFn: () => geographicService.getNacionalidadeById(id),
    enabled: enabled && !!id,
    ...LONG_CACHE_CONFIG,
  })
}

// ===============================
// ESTADO CIVIL
// ===============================

/**
 * Hook para buscar todos os estados civis
 * Cache de longa duração - ideal para dropdowns
 */
export function useEstadoCivil(enabled = true) {
  return useQuery({
    queryKey: geographicKeys.estadoCivil(),
    queryFn: () => geographicService.getAllEstadoCivil(),
    enabled,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar um estado civil específico
 */
export function useEstadoCivilDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.estadoCivilDetail(id),
    queryFn: () => geographicService.getEstadoCivilById(id),
    enabled: enabled && !!id,
    ...LONG_CACHE_CONFIG,
  })
}

// ===============================
// PROVÍNCIAS
// ===============================

/**
 * Hook para buscar todas as províncias
 * Cache de longa duração - ideal para dropdowns
 */
export function useProvincias(enabled = true) {
  return useQuery({
    queryKey: geographicKeys.provincias(),
    queryFn: () => geographicService.getAllProvincias(),
    enabled,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar uma província específica
 */
export function useProvincia(id: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.provincia(id),
    queryFn: () => geographicService.getProvinciaById(id),
    enabled: enabled && !!id,
    ...LONG_CACHE_CONFIG,
  })
}

// ===============================
// MUNICÍPIOS
// ===============================

/**
 * Hook para buscar todos os municípios
 * Cache de longa duração
 */
export function useMunicipios(enabled = true) {
  return useQuery({
    queryKey: geographicKeys.municipios(),
    queryFn: () => geographicService.getAllMunicipios(),
    enabled,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar um município específico
 */
export function useMunicipio(id: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.municipio(id),
    queryFn: () => geographicService.getMunicipioById(id),
    enabled: enabled && !!id,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar municípios de uma província
 * Útil para dropdowns dependentes (província -> município)
 */
export function useMunicipiosByProvincia(provinciaId: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.municipiosByProvincia(provinciaId),
    queryFn: () => geographicService.getMunicipiosByProvincia(provinciaId),
    enabled: enabled && !!provinciaId,
    ...LONG_CACHE_CONFIG,
  })
}

// ===============================
// COMUNAS
// ===============================

/**
 * Hook para buscar todas as comunas
 * Cache de longa duração
 */
export function useComunas(enabled = true) {
  return useQuery({
    queryKey: geographicKeys.comunas(),
    queryFn: () => geographicService.getAllComunas(),
    enabled,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar uma comuna específica
 */
export function useComuna(id: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.comuna(id),
    queryFn: () => geographicService.getComunaById(id),
    enabled: enabled && !!id,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para buscar comunas de um município
 * Útil para dropdowns dependentes (município -> comuna)
 */
export function useComunasByMunicipio(municipioId: number, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.comunasByMunicipio(municipioId),
    queryFn: () => geographicService.getComunasByMunicipio(municipioId),
    enabled: enabled && !!municipioId,
    ...LONG_CACHE_CONFIG,
  })
}

// ===============================
// OPERAÇÕES ESPECIAIS
// ===============================

/**
 * Hook para buscar hierarquia geográfica completa
 * Útil para árvores de seleção aninhadas
 */
export function useGeographicHierarchy(enabled = true) {
  return useQuery({
    queryKey: geographicKeys.hierarchy(),
    queryFn: () => geographicService.getGeographicHierarchy(),
    enabled,
    ...LONG_CACHE_CONFIG,
  })
}

/**
 * Hook para busca de dados geográficos
 * Cache mais curto pois depende do termo de busca
 */
export function useGeographicSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: geographicKeys.search(searchTerm),
    queryFn: () => geographicService.searchGeographic(searchTerm),
    enabled: enabled && searchTerm.length >= 2, // Só busca com 2+ caracteres
    staleTime: 1000 * 60 * 5, // 5 minutos (mais curto que outros)
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  })
}

// ===============================
// HOOK COMBINADO
// ===============================

/**
 * Hook combinado para facilitar o uso em formulários
 * Retorna todos os dados necessários para um formulário completo
 */
export function useGeographicFormData() {
  const nacionalidades = useNacionalidades()
  const estadoCivil = useEstadoCivil()
  const provincias = useProvincias()

  return {
    // Dados
    nacionalidades: nacionalidades.data || [],
    estadoCivil: estadoCivil.data || [],
    provincias: provincias.data || [],

    // Estados de loading
    isLoading:
      nacionalidades.isLoading ||
      estadoCivil.isLoading ||
      provincias.isLoading,

    // Estados de erro
    isError:
      nacionalidades.isError ||
      estadoCivil.isError ||
      provincias.isError,

    // Refetch individual
    refetchNacionalidades: nacionalidades.refetch,
    refetchEstadoCivil: estadoCivil.refetch,
    refetchProvincias: provincias.refetch,

    // Refetch todos
    refetchAll: () => {
      nacionalidades.refetch()
      estadoCivil.refetch()
      provincias.refetch()
    },
  }
}

/**
 * Hook para endereço completo (província -> município -> comuna)
 * Gerencia dropdowns dependentes automaticamente
 */
export function useEnderecoCompleto(
  provinciaId?: number,
  municipioId?: number
) {
  const provincias = useProvincias()
  const municipios = useMunicipiosByProvincia(
    provinciaId || 0,
    !!provinciaId
  )
  const comunas = useComunasByMunicipio(
    municipioId || 0,
    !!municipioId
  )

  return {
    // Dados
    provincias: provincias.data || [],
    municipios: municipios.data || [],
    comunas: comunas.data || [],

    // Estados de loading
    isLoadingProvincias: provincias.isLoading,
    isLoadingMunicipios: municipios.isLoading,
    isLoadingComunas: comunas.isLoading,

    // Estados de erro
    isErrorProvincias: provincias.isError,
    isErrorMunicipios: municipios.isError,
    isErrorComunas: comunas.isError,

    // Refetch
    refetchProvincias: provincias.refetch,
    refetchMunicipios: municipios.refetch,
    refetchComunas: comunas.refetch,
  }
}

// ===============================
// MUTATIONS - PROVÍNCIAS
// ===============================

/**
 * Hook para criar província
 */
export function useCreateProvincia() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (designacao: string) => geographicService.createProvincia(designacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.provincias() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

/**
 * Hook para atualizar província
 */
export function useUpdateProvincia() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, designacao }: { id: number; designacao: string }) => 
      geographicService.updateProvincia(id, designacao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.provincias() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

/**
 * Hook para excluir província
 */
export function useDeleteProvincia() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => geographicService.deleteProvincia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.provincias() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

// ===============================
// MUTATIONS - MUNICÍPIOS
// ===============================

/**
 * Hook para criar município
 */
export function useCreateMunicipio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ designacao, codigo_Provincia }: { designacao: string; codigo_Provincia: number }) => 
      geographicService.createMunicipio(designacao, codigo_Provincia),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.municipios() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.municipiosByProvincia(variables.codigo_Provincia) })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

/**
 * Hook para atualizar município
 */
export function useUpdateMunicipio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, designacao, codigo_Provincia }: { id: number; designacao: string; codigo_Provincia?: number }) => 
      geographicService.updateMunicipio(id, designacao, codigo_Provincia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.municipios() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

/**
 * Hook para excluir município
 */
export function useDeleteMunicipio() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => geographicService.deleteMunicipio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.municipios() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

// ===============================
// MUTATIONS - COMUNAS
// ===============================

/**
 * Hook para criar comuna
 */
export function useCreateComuna() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ designacao, codigo_Municipio }: { designacao: string; codigo_Municipio: number }) => 
      geographicService.createComuna(designacao, codigo_Municipio),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.comunas() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.comunasByMunicipio(variables.codigo_Municipio) })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

/**
 * Hook para atualizar comuna
 */
export function useUpdateComuna() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, designacao, codigo_Municipio }: { id: number; designacao: string; codigo_Municipio?: number }) => 
      geographicService.updateComuna(id, designacao, codigo_Municipio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.comunas() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}

/**
 * Hook para excluir comuna
 */
export function useDeleteComuna() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => geographicService.deleteComuna(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicKeys.comunas() })
      queryClient.invalidateQueries({ queryKey: geographicKeys.hierarchy() })
    }
  })
}
