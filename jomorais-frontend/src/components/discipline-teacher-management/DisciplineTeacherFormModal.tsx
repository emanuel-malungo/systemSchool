import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Info, Search } from 'lucide-react'
import type { IDisciplinaDocente, IDisciplinaDocenteInput } from '../../types/disciplineTeacher.types'
import { useTeachersComplete } from '../../hooks/useTeacher'
import { useDisciplinesComplete } from '../../hooks/useDiscipline'
import { useCoursesComplete } from '../../hooks/useCourse'
import Button from '../common/Button'

interface DisciplineTeacherFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IDisciplinaDocenteInput) => void
  disciplineTeacher: IDisciplinaDocente | null
  isLoading: boolean
}

const validationSchema = yup.object({
  codigoDocente: yup.number().required('Professor é obrigatório').positive('Selecione um professor'),
  codigoCurso: yup.number().required('Curso é obrigatório').positive('Selecione um curso'),
  codigoDisciplina: yup.number().required('Disciplina é obrigatória').positive('Selecione uma disciplina'),
})

type FormData = IDisciplinaDocenteInput

export default function DisciplineTeacherFormModal({
  isOpen,
  onClose,
  onSubmit,
  disciplineTeacher,
  isLoading,
}: DisciplineTeacherFormModalProps) {
  const isEditMode = !!disciplineTeacher
  const [docenteSearch, setDocenteSearch] = useState('')
  const [cursoSearch, setCursoSearch] = useState('')
  const [disciplinaSearch, setDisciplinaSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      codigoDocente: 0,
      codigoCurso: 0,
      codigoDisciplina: 0,
    },
  })

  const { data: docentesData, isLoading: isLoadingDocentes } = useTeachersComplete()
  const { data: cursosData, isLoading: isLoadingCursos } = useCoursesComplete()
  
  // Observa o curso selecionado para buscar disciplinas filtradas
  const selectedCurso = watch('codigoCurso')
  
  // Busca disciplinas filtradas por curso (usa a API)
  const { data: disciplinasData, isLoading: isLoadingDisciplinas } = useDisciplinesComplete(
    '', 
    selectedCurso !== 0 ? selectedCurso : undefined,
    isOpen // Só busca quando o modal está aberto
  )
  
  const docentes = useMemo(() => docentesData?.data || [], [docentesData])
  const cursos = useMemo(() => cursosData?.data || [], [cursosData])
  const disciplinas = useMemo(() => disciplinasData?.data || [], [disciplinasData])

  const filteredDocentes = useMemo(() => {
    return docentes.filter(d => {
      if (docenteSearch.trim() === '') return true
      const searchLower = docenteSearch.toLowerCase()
      return d.nome.toLowerCase().includes(searchLower) ||
             d.email.toLowerCase().includes(searchLower)
    })
  }, [docentes, docenteSearch])

  const filteredCursos = useMemo(() => {
    return cursos.filter(c => {
      if (cursoSearch.trim() === '') return true
      return c.designacao.toLowerCase().includes(cursoSearch.toLowerCase())
    })
  }, [cursos, cursoSearch])

  const filteredDisciplinas = useMemo(() => {
    // Filtra apenas pelo texto de busca, o filtro por curso já vem da API
    return disciplinas.filter(d => {
      if (disciplinaSearch.trim() === '') return true
      return d.designacao.toLowerCase().includes(disciplinaSearch.toLowerCase())
    })
  }, [disciplinas, disciplinaSearch])

  // Reseta a disciplina quando o curso mudar
  useEffect(() => {
    if (selectedCurso !== 0 && !isEditMode) {
      reset((formValues) => ({
        ...formValues,
        codigoDisciplina: 0,
      }))
      setDisciplinaSearch('') // Limpa a busca também
    }
  }, [selectedCurso, isEditMode, reset])

  useEffect(() => {
    if (disciplineTeacher && isOpen) {
      reset({
        codigoDocente: disciplineTeacher.codigoDocente,
        codigoCurso: disciplineTeacher.codigoCurso,
        codigoDisciplina: disciplineTeacher.codigoDisciplina,
      })
    } else if (!isOpen) {
      reset({
        codigoDocente: 0,
        codigoCurso: 0,
        codigoDisciplina: 0,
      })
      setDocenteSearch('')
      setCursoSearch('')
      setDisciplinaSearch('')
    }
  }, [disciplineTeacher, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={isLoading ? undefined : onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Atribuição' : 'Nova Atribuição'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              title="Fechar"
              aria-label="Fechar"
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
            {/* Professor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professor <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar professor..."
                  value={docenteSearch}
                  onChange={(e) => setDocenteSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                  disabled={isLoading || isLoadingDocentes}
                />
              </div>
              <select
                {...register('codigoDocente', { valueAsNumber: true })}
                disabled={isLoading || isLoadingDocentes}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                  errors.codigoDocente ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                } ${isLoading || isLoadingDocentes ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value={0}>Selecione o professor</option>
                {filteredDocentes.map((docente) => (
                  <option key={docente.codigo} value={docente.codigo}>
                    {docente.nome} - {docente.email}
                  </option>
                ))}
              </select>
              {errors.codigoDocente && (
                <p className="mt-1 text-sm text-red-500">{errors.codigoDocente.message}</p>
              )}
            </div>

            {/* Grid com 2 colunas */}
            <div className="grid grid-cols-2 gap-6">
              {/* Curso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curso <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar curso..."
                    value={cursoSearch}
                    onChange={(e) => setCursoSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    disabled={isLoading || isLoadingCursos}
                  />
                </div>
                <select
                  {...register('codigoCurso', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingCursos}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.codigoCurso ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingCursos ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>Selecione o curso</option>
                  {filteredCursos.map((curso) => (
                    <option key={curso.codigo} value={curso.codigo}>
                      {curso.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigoCurso && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoCurso.message}</p>
                )}
              </div>

              {/* Disciplina */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplina <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar disciplina..."
                    value={disciplinaSearch}
                    onChange={(e) => setDisciplinaSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    disabled={isLoading || isLoadingDisciplinas}
                  />
                </div>
                <select
                  {...register('codigoDisciplina', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingDisciplinas || selectedCurso === 0}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.codigoDisciplina ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingDisciplinas ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>
                    {selectedCurso === 0 
                      ? 'Selecione primeiro um curso' 
                      : isLoadingDisciplinas
                        ? 'Carregando disciplinas...'
                        : filteredDisciplinas.length === 0 
                          ? 'Nenhuma disciplina disponível para este curso' 
                          : 'Selecione a disciplina'}
                  </option>
                  {filteredDisciplinas.map((disciplina) => (
                    <option key={disciplina.codigo} value={disciplina.codigo}>
                      {disciplina.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigoDisciplina && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoDisciplina.message}</p>
                )}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">Informação</h4>
                  <p className="text-sm text-purple-700">
                    Esta atribuição permite que o professor lecione a disciplina selecionada no curso especificado.
                    Use a barra de busca para encontrar rapidamente professores, cursos e disciplinas.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isEditMode ? 'Atualizar' : 'Criar'} Atribuição
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
