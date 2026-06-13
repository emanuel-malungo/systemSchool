import { useQuery } from '@tanstack/react-query'
import disciplinaService, { type IDisciplina } from '../services/disciplina.service'

export const useDisciplinas = () => {
  return useQuery<IDisciplina[], Error>({
    queryKey: ['disciplinas'],
    queryFn: async () => {
      const response = await disciplinaService.getAllDisciplinas()
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
  })
}

export const useDisciplinaById = (id: number | null, enabled: boolean = true) => {
  return useQuery<IDisciplina | null, Error>({
    queryKey: ['disciplina', id],
    queryFn: async () => {
      if (!id) return null
      const response = await disciplinaService.getDisciplinaById(id)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data || null
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
  })
}

export const useDisciplinasByCurso = (cursoId: number | null, enabled: boolean = true) => {
  return useQuery<IDisciplina[], Error>({
    queryKey: ['disciplinas', 'curso', cursoId],
    queryFn: async () => {
      if (!cursoId) return []
      const response = await disciplinaService.getDisciplinasByCurso(cursoId)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data || []
    },
    enabled: !!cursoId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
  })
}
