import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import type { IClass, IClassInput } from '../../types/class.types'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import { mockStatus } from '../../mocks/status.mock'

interface ClassFormModalProps {
  isOpen: boolean
  onClose: () => void
  classItem: IClass | null
  onSubmit: (data: IClassInput) => void
  isLoading: boolean
}

// Schema de validação
const validationSchema = yup.object({
  designacao: yup.string().required('Designação é obrigatória').min(2, 'Mínimo 2 caracteres'),
  notaMaxima: yup.number()
    .required('Nota máxima é obrigatória')
    .positive('Nota máxima deve ser positiva'),
  exame: yup.boolean().required('Campo obrigatório'),
  status: yup.number(),
})

type FormData = IClassInput

export default function ClassFormModal({
  isOpen,
  onClose,
  classItem,
  onSubmit,
  isLoading,
}: ClassFormModalProps) {
  const isEditing = !!classItem

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
      notaMaxima: 20,
      exame: false,
      status: 1,
    },
  })

  // Resetar form quando modal abrir ou classe mudar
  useEffect(() => {
    if (isOpen) {
      if (classItem) {
        reset({
          designacao: classItem.designacao,
          notaMaxima: classItem.notaMaxima,
          exame: classItem.exame,
          status: classItem.status,
        })
      } else {
        reset({
          designacao: '',
          notaMaxima: 20,
          exame: false,
          status: 1,
        })
      }
    }
  }, [classItem, isOpen, reset])

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
              {isEditing ? 'Editar Classe' : 'Nova Classe'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              title="Fechar"
              aria-label="Fechar"
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
                    label="Designação da Classe"
                    placeholder="Ex: 10ª Classe, 11ª Classe"
                    error={errors.designacao?.message}
                    required
                  />
                )}
              />
            </div>

            {/* Nota Máxima */}
            <div>
              <Controller
                name="notaMaxima"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Nota Máxima"
                    placeholder="Ex: 20"
                    error={errors.notaMaxima?.message}
                    required
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>

            {/* Exame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Possui Exame?
              </label>
              <Controller
                name="exame"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="w-4 h-4 text-[#007C00] border-gray-300 focus:ring-[#007C00]"
                      />
                      <span className="text-sm text-gray-700">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="w-4 h-4 text-[#007C00] border-gray-300 focus:ring-[#007C00]"
                      />
                      <span className="text-sm text-gray-700">Não</span>
                    </label>
                  </div>
                )}
              />
              {errors.exame && (
                <p className="mt-1 text-sm text-red-600">{errors.exame.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    placeholder="Selecione o status"
                    options={mockStatus.map(status => ({
                      value: status.codigo,
                      label: status.designacao
                    }))}
                    error={errors.status?.message}
                    required
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                {isEditing ? 'Atualizar' : 'Criar'} Classe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
