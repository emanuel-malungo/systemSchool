import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Proveniencia, CreateProvenienciaPayload } from '../../types/proveniencia.types'
import Button from '../common/Button'
import Input from '../common/Input'
import { mockStatus } from '../../mocks/status.mock'

interface ProvenienciaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProvenienciaPayload) => void
  proveniencia?: Proveniencia | null
  isLoading: boolean
}

export default function ProvenienciaFormModal({
  isOpen,
  onClose,
  onSubmit,
  proveniencia,
  isLoading,
}: ProvenienciaFormModalProps) {
  const isEditMode = !!proveniencia

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateProvenienciaPayload>()

  // Preenche o formulário quando está em modo de edição
  useEffect(() => {
    if (proveniencia && isOpen) {
      setValue('designacao', proveniencia.designacao)
      setValue('localizacao', proveniencia.localizacao || '')
      setValue('contacto', proveniencia.contacto || '')
      setValue('codigoStatus', proveniencia.codigoStatus)
    } else if (!isOpen) {
      reset()
    }
  }, [proveniencia, isOpen, setValue, reset])

  const handleFormSubmit = (data: CreateProvenienciaPayload) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={isLoading ? undefined : onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Proveniência' : 'Nova Proveniência'}
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
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Designação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designação <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Digite o nome da escola/proveniência"
                  {...register('designacao', {
                    required: 'Designação é obrigatória',
                    minLength: { value: 3, message: 'Mínimo de 3 caracteres' },
                  })}
                  error={errors.designacao?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <Input
                  type="text"
                  placeholder="Digite a localização (endereço, município, etc.)"
                  {...register('localizacao')}
                  error={errors.localizacao?.message}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Endereço, município ou província da escola
                </p>
              </div>

              {/* Contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contacto
                </label>
                <Input
                  type="text"
                  placeholder="Digite o telefone ou email de contacto"
                  {...register('contacto')}
                  error={errors.contacto?.message}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Telefone ou email para contacto
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigoStatus', {
                    required: 'Status é obrigatório',
                    valueAsNumber: true,
                  })}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigoStatus
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  aria-label="Selecionar status"
                >
                  <option value="">Selecione o status</option>
                  {mockStatus.map((status) => (
                    <option key={status.codigo} value={status.codigo}>
                      {status.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigoStatus && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoStatus.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Status da proveniência/escola
                </p>
              </div>

              {/* Informações Importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  ℹ️ Informações
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                  <li>A designação é o nome oficial da escola/instituição</li>
                  <li>A localização ajuda a identificar a região da escola</li>
                  <li>O contacto facilita a comunicação com a instituição</li>
                  <li>Status "Ativa" permite que a escola seja selecionada em transferências</li>
                </ul>
              </div>
            </div>
          </form>

          {/* Footer com Ações */}
          <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              className="flex-1 bg-[#007C00] hover:bg-[#005a00]"
            >
              {isEditMode ? 'Atualizar Proveniência' : 'Criar Proveniência'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
