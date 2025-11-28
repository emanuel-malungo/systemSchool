import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import type { ICourse, ICourseInput } from '../../types/course.types'
import Button from '../common/Button'
import Input from '../common/Input'

interface CourseFormModalProps {
  isOpen: boolean
  onClose: () => void
  course: ICourse | null
  onSubmit: (data: ICourseInput) => void
  isLoading: boolean
}

// Schema de validação
const validationSchema = yup.object({
  designacao: yup.string().required('Designação é obrigatória').min(3, 'Mínimo 3 caracteres'),
})

type FormData = ICourseInput

export default function CourseFormModal({
  isOpen,
  onClose,
  course,
  onSubmit,
  isLoading,
}: CourseFormModalProps) {
  const isEditing = !!course

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      designacao: '',
    },
  })

  // Resetar form quando modal abrir ou curso mudar
  useEffect(() => {
    if (isOpen) {
      if (course) {
        reset({
          designacao: course.designacao,
        })
      } else {
        reset({
          designacao: '',
        })
      }
    }
  }, [course, isOpen, reset])

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
              {isEditing ? 'Editar Curso' : 'Novo Curso'}
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
              <Controller
                name="designacao"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Designação do Curso"
                    placeholder="Ex: Informática de Gestão"
                    error={errors.designacao?.message}
                    required
                  />
                )}
              />
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
                {isEditing ? 'Atualizar' : 'Criar'} Curso
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
