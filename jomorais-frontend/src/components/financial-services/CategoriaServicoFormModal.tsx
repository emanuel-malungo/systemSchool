import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { ICategoriaServico, ICategoriaServicoInput } from '../../types/financialService.types'

interface CategoriaServicoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ICategoriaServicoInput) => void
  categoria: ICategoriaServico | null
  isLoading: boolean
}

export default function CategoriaServicoFormModal({
  isOpen,
  onClose,
  onSubmit,
  categoria,
  isLoading,
}: CategoriaServicoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICategoriaServicoInput>({
    defaultValues: {
      designacao: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (categoria) {
        reset({
          designacao: categoria.designacao,
        })
      } else {
        reset({
          designacao: '',
        })
      }
    }
  }, [isOpen, categoria, reset])

  if (!isOpen) return null

  const handleFormSubmit = (data: ICategoriaServicoInput) => {
    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-[#007C00] to-[#005a00] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {categoria ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              disabled={isLoading}
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Designação */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Designação <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('designacao', {
                required: 'A designação é obrigatória',
                minLength: {
                  value: 2,
                  message: 'A designação deve ter no mínimo 2 caracteres',
                },
              })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.designacao
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-[#007C00]'
              }`}
              placeholder="Ex: Propinas"
              disabled={isLoading}
            />
            {errors.designacao && (
              <p className="mt-1 text-sm text-red-600">{errors.designacao.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : categoria ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
