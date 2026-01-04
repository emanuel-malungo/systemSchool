import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Info, Search } from 'lucide-react'
import type { IDiscipline, IDisciplineInput } from '../../types/discipline.types'
import { useCourses } from '../../hooks/useCourse'
import Button from '../common/Button'
import Input from '../common/Input'

interface DisciplineFormModalProps {
  isOpen: boolean
  onClose: () => void
  discipline: IDiscipline | null
  onSubmit: (data: IDisciplineInput) => void
  isLoading: boolean
}

// Schema de validação
const validationSchema = yup.object({
  designacao: yup.string().required('Designação é obrigatória').min(3, 'Mínimo 3 caracteres'),
  codigo_Curso: yup.number().required('Curso é obrigatório').positive('Selecione um curso válido'),
  cadeiraEspecifica: yup.number().oneOf([0, 1], 'Valor inválido'),
})

type FormData = IDisciplineInput

export default function DisciplineFormModal({
  isOpen,
  onClose,
  discipline,
  onSubmit,
  isLoading,
}: DisciplineFormModalProps) {
  const isEditing = !!discipline
  const [courseSearch, setCourseSearch] = useState('')

  const { data: coursesData, isLoading: isLoadingCourses } = useCourses()
  const courses = coursesData?.data || []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      designacao: '',
      codigo_Curso: 0,
      cadeiraEspecifica: 0,
    },
  })

  const filteredCourses = courses.filter(c => 
    c.designacao.toLowerCase().includes(courseSearch.toLowerCase())
  )

  useEffect(() => {
    if (discipline && isOpen) {
      reset({
        designacao: discipline.designacao,
        codigo_Curso: discipline.codigo_Curso,
        cadeiraEspecifica: discipline.cadeiraEspecifica || 0,
      })
    } else if (!isOpen) {
      reset({
        designacao: '',
        codigo_Curso: 0,
        cadeiraEspecifica: 0,
      })
      setCourseSearch('')
    }
  }, [discipline, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
            {/* Designação */}
            <div>
              <Input
                {...register('designacao')}
                label="Designação da Disciplina"
                placeholder="Ex: Matemática Aplicada"
                error={errors.designacao?.message}
                required
                disabled={isLoading}
              />
            </div>

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
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                  disabled={isLoading || isLoadingCourses}
                />
              </div>
              <select
                {...register('codigo_Curso', { valueAsNumber: true })}
                disabled={isLoading || isLoadingCourses}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                  errors.codigo_Curso ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                } ${isLoading || isLoadingCourses ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value={0}>Selecione o curso</option>
                {filteredCourses.map((course) => (
                  <option key={course.codigo} value={course.codigo}>
                    {course.designacao}
                  </option>
                ))}
              </select>
              {errors.codigo_Curso && (
                <p className="mt-1 text-sm text-red-500">{errors.codigo_Curso.message}</p>
              )}
            </div>

            {/* Tipo de Cadeira */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Disciplina
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('cadeiraEspecifica', { valueAsNumber: true })}
                    value={0}
                    defaultChecked
                    disabled={isLoading}
                    className="w-4 h-4 text-[#007C00] border-gray-300 focus:ring-[#007C00]"
                  />
                  <span className="text-sm text-gray-700">Geral</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('cadeiraEspecifica', { valueAsNumber: true })}
                    value={1}
                    disabled={isLoading}
                    className="w-4 h-4 text-[#007C00] border-gray-300 focus:ring-[#007C00]"
                  />
                  <span className="text-sm text-gray-700">Específica</span>
                </label>
              </div>
            </div>

            {/* Informação */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Informação</h4>
                  <p className="text-sm text-blue-700">
                    A disciplina será associada ao curso selecionado. Use a barra de busca para encontrar rapidamente o curso desejado.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
              >
                {isEditing ? 'Atualizar' : 'Criar'} Disciplina
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
