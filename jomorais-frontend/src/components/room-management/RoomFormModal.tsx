import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Info } from 'lucide-react'
import type { Room, RoomInput } from '../../types/room.types'
import Button from '../common/Button'
import Input from '../common/Input'

interface RoomFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RoomInput) => void
  room: Room | null
  isLoading: boolean
}

// Schema de validação
const validationSchema = yup.object({
  designacao: yup
    .string()
    .required('Designação é obrigatória')
    .min(2, 'Mínimo de 2 caracteres')
    .max(100, 'Máximo de 100 caracteres'),
})

type FormData = RoomInput

export default function RoomFormModal({
  isOpen,
  onClose,
  onSubmit,
  room,
  isLoading,
}: RoomFormModalProps) {
  const isEditMode = !!room

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
    },
  })

  // Preenche o formulário quando está em modo de edição
  useEffect(() => {
    if (room && isOpen) {
      reset({
        designacao: room.designacao,
      })
    } else if (!isOpen) {
      reset({
        designacao: '',
      })
    }
  }, [room, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Sala' : 'Nova Sala'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
                label="Designação da Sala"
                placeholder="Ex: Sala 101, Laboratório A, etc."
                error={errors.designacao?.message}
                required
                disabled={isLoading}
              />
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Dicas para nomear salas
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use nomes claros e descritivos</li>
                    <li>• Inclua número ou localização quando possível</li>
                    <li>• Evite caracteres especiais</li>
                    <li>• Mantenha consistência na nomenclatura</li>
                  </ul>
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
                className="bg-[#007C00] hover:bg-[#005a00]"
              >
                {isEditMode ? 'Atualizar' : 'Criar'} Sala
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
