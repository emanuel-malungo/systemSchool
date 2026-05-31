import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Info, Search } from 'lucide-react'
import type { IAtribuicaoCompletaInput } from '../../types/disciplineTeacher.types'
import { useProfessoresComplete } from '../../hooks/useDisciplineTeacher'
import { useDisciplinesComplete } from '../../hooks/useDiscipline'
import { useCoursesComplete } from '../../hooks/useCourse'
import { useTurmasComplete } from '../../hooks/useTurma'
import Button from '../common/Button'

interface DisciplineTeacherFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IAtribuicaoCompletaInput) => void
  isLoading: boolean
}

const validationSchema = yup.object().shape({
  professorId: yup.number().required('Professor é obrigatório').positive('Selecione um professor'),
  cursoId: yup.number().required('Curso é obrigatório').positive('Selecione um curso'),
  disciplinaId: yup.number().required('Disciplina é obrigatória').positive('Selecione uma disciplina'),
  anoLectivo: yup.string().required('Ano letivo é obrigatório'),
  incluirTurma: yup.boolean(),
  turmaId: yup.number().optional()
})

type FormData = {
  professorId: number
  cursoId: number
  disciplinaId: number
  anoLectivo: string
  incluirTurma: boolean
  turmaId?: number
}

export default function DisciplineTeacherFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: DisciplineTeacherFormModalProps) {
  const [docenteSearch, setDocenteSearch] = useState('')
  const [cursoSearch, setCursoSearch] = useState('')
  const [disciplinaSearch, setDisciplinaSearch] = useState('')
  const [turmaSearch, setTurmaSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      professorId: 0,
      cursoId: 0,
      disciplinaId: 0,
      anoLectivo: '2024/2025',
      incluirTurma: false,
      turmaId: 0,
    },
  })

  const { data: docentesData, isLoading: isLoadingDocentes } = useProfessoresComplete(
    '',
    isOpen // Só busca quando o modal está aberto
  )
  const { data: cursosData, isLoading: isLoadingCursos } = useCoursesComplete(
    '',
    false,
    isOpen // Só busca quando o modal está aberto
  )
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmasComplete(
    '',
    isOpen // Só busca quando o modal está aberto
  )
  
  // Observa o curso selecionado para buscar disciplinas filtradas
  const selectedCurso = watch('cursoId')
  const incluirTurma = watch('incluirTurma')
  
  // Busca disciplinas filtradas por curso (usa a API)
  const { data: disciplinasData, isLoading: isLoadingDisciplinas } = useDisciplinesComplete(
    '', 
    selectedCurso !== 0 ? selectedCurso : undefined,
    isOpen // Só busca quando o modal está aberto
  )
  
  const docentes = useMemo(() => docentesData?.data || [], [docentesData])
  const cursos = useMemo(() => cursosData?.data || [], [cursosData])
  const disciplinas = useMemo(() => disciplinasData?.data || [], [disciplinasData])
  const turmas = useMemo(() => turmasData?.data || [], [turmasData])

  const filteredDocentes = useMemo(() => {
    return docentes.filter((d: any) => {
      if (docenteSearch.trim() === '') return true
      const searchLower = docenteSearch.toLowerCase()
      return d.nome.toLowerCase().includes(searchLower) ||
             (d.email && d.email.toLowerCase().includes(searchLower)) ||
             (d.numeroFuncionario && d.numeroFuncionario.toLowerCase().includes(searchLower))
    })
  }, [docentes, docenteSearch])

  const filteredCursos = useMemo(() => {
    return cursos.filter((c: any) => {
      if (cursoSearch.trim() === '') return true
      return c.designacao.toLowerCase().includes(cursoSearch.toLowerCase())
    })
  }, [cursos, cursoSearch])

  const filteredDisciplinas = useMemo(() => {
    return disciplinas.filter((d: any) => {
      if (disciplinaSearch.trim() === '') return true
      return d.designacao.toLowerCase().includes(disciplinaSearch.toLowerCase())
    })
  }, [disciplinas, disciplinaSearch])

  const filteredTurmas = useMemo(() => {
    return turmas.filter((t: any) => {
      if (turmaSearch.trim() === '') return true
      return t.designacao.toLowerCase().includes(turmaSearch.toLowerCase())
    })
  }, [turmas, turmaSearch])

  // Reseta a disciplina quando o curso mudar
  useEffect(() => {
    if (selectedCurso !== 0) {
      setValue('disciplinaId', 0)
      setDisciplinaSearch('')
    }
  }, [selectedCurso, setValue])

  useEffect(() => {
    if (!isOpen) {
      reset({
        professorId: 0,
        cursoId: 0,
        disciplinaId: 0,
        anoLectivo: '2024/2025',
        incluirTurma: false,
        turmaId: 0,
      })
      setDocenteSearch('')
      setCursoSearch('')
      setDisciplinaSearch('')
      setTurmaSearch('')
    }
  }, [isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    const submitData: IAtribuicaoCompletaInput = {
      professorId: data.professorId,
      disciplinaId: data.disciplinaId,
      cursoId: data.cursoId,
      anoLectivo: data.anoLectivo,
      turmaId: data.incluirTurma && data.turmaId !== 0 ? data.turmaId : undefined,
      incluirTurma: data.incluirTurma,
    }
    onSubmit(submitData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={isLoading ? undefined : onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Nova Atribuição
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
                {...register('professorId', { valueAsNumber: true })}
                disabled={isLoading || isLoadingDocentes}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                  errors.professorId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                } ${isLoading || isLoadingDocentes ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value={0}>Selecione o professor</option>
                {filteredDocentes.map((docente: any) => (
                  <option key={docente.codigo} value={docente.codigo}>
                    {docente.nome} {docente.numeroFuncionario ? `(${docente.numeroFuncionario})` : ''}
                  </option>
                ))}
              </select>
              {errors.professorId && (
                <p className="mt-1 text-sm text-red-500">{errors.professorId.message}</p>
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
                  {...register('cursoId', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingCursos}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.cursoId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingCursos ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>Selecione o curso</option>
                  {filteredCursos.map((curso: any) => (
                    <option key={curso.codigo} value={curso.codigo}>
                      {curso.designacao}
                    </option>
                  ))}
                </select>
                {errors.cursoId && (
                  <p className="mt-1 text-sm text-red-500">{errors.cursoId.message}</p>
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
                  {...register('disciplinaId', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingDisciplinas || selectedCurso === 0}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.disciplinaId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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
                  {filteredDisciplinas.map((disciplina: any) => (
                    <option key={disciplina.codigo} value={disciplina.codigo}>
                      {disciplina.designacao}
                    </option>
                  ))}
                </select>
                {errors.disciplinaId && (
                  <p className="mt-1 text-sm text-red-500">{errors.disciplinaId.message}</p>
                )}
              </div>
            </div>

            {/* Grid com Ano Letivo e Checkbox */}
            <div className="grid grid-cols-2 gap-6">
              {/* Ano Letivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Letivo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('anoLectivo')}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
                {errors.anoLectivo && (
                  <p className="mt-1 text-sm text-red-500">{errors.anoLectivo.message}</p>
                )}
              </div>

              {/* Incluir Turma Checkbox */}
              <div className="flex flex-col justify-end pb-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('incluirTurma')}
                    disabled={isLoading}
                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Incluir atribuição de turma</span>
                </label>
              </div>
            </div>

            {/* Turma Selecionada Condicionalmente */}
            {incluirTurma && (
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar turma..."
                    value={turmaSearch}
                    onChange={(e) => setTurmaSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    disabled={isLoading || isLoadingTurmas}
                  />
                </div>
                <select
                  {...register('turmaId', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingTurmas}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all ${
                    errors.turmaId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingTurmas ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>Selecione a turma</option>
                  {filteredTurmas.map((turma: any) => (
                    <option key={turma.codigo} value={turma.codigo}>
                      {turma.designacao} {turma.tb_classes?.designacao ? `- ${turma.tb_classes.designacao}` : ''}
                    </option>
                  ))}
                </select>
                {errors.turmaId && (
                  <p className="mt-1 text-sm text-red-500">{errors.turmaId.message}</p>
                )}
              </div>
            )}

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">Informação</h4>
                  <p className="text-sm text-purple-700">
                    Ao criar esta atribuição, o professor será vinculado à disciplina e ao curso selecionados.
                    Caso selecione "Incluir atribuição de turma", ele também será associado a uma turma específica para essa disciplina.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={isLoading} className="bg-purple-600 hover:bg-purple-700">
                Criar Atribuição
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
