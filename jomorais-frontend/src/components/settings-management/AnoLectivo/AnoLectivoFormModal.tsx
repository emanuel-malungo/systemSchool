import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import type { IAnoLectivo, IAnoLectivoInput } from '../../../types/anoLectivo.types'
import Button from '../../common/Button'
import Input from '../../common/Input'

interface AnoLectivoFormModalProps {
  isOpen: boolean
  onClose: () => void
  anoLectivo: IAnoLectivo | null
  onSubmit: (data: IAnoLectivoInput) => void
  isSubmitting: boolean
}

// Schema de validação
const validationSchema = yup.object({
  designacao: yup.string().required('Designação é obrigatória'),
  mesInicial: yup.string().required('Mês inicial é obrigatório'),
  mesFinal: yup.string().required('Mês final é obrigatório'),
  anoInicial: yup.string().required('Ano inicial é obrigatório'),
  anoFinal: yup.string().required('Ano final é obrigatório'),
})

type FormData = IAnoLectivoInput

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export default function AnoLectivoFormModal({
  isOpen,
  onClose,
  anoLectivo,
  onSubmit,
  isSubmitting,
}: AnoLectivoFormModalProps) {
  const isEditing = !!anoLectivo

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
      mesInicial: '',
      mesFinal: '',
      anoInicial: '',
      anoFinal: '',
    },
  })

  // Resetar form quando modal abrir ou ano letivo mudar
  useEffect(() => {
    if (isOpen) {
      if (anoLectivo) {
        reset({
          designacao: anoLectivo.designacao,
          mesInicial: anoLectivo.mesInicial,
          mesFinal: anoLectivo.mesFinal,
          anoInicial: anoLectivo.anoInicial,
          anoFinal: anoLectivo.anoFinal,
        })
      } else {
        reset({
          designacao: '',
          mesInicial: '',
          mesFinal: '',
          anoInicial: '',
          anoFinal: '',
        })
      }
    }
  }, [anoLectivo, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={isSubmitting ? undefined : onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {anoLectivo ? 'Editar Ano Letivo' : 'Novo Ano Letivo'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Designação */}
            <Controller
              name="designacao"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Designação"
                  placeholder="Ex: Ano Letivo 2024/2025"
                  error={errors.designacao?.message}
                  disabled={isSubmitting}
                  required
                />
              )}
            />

            {/* Mês Inicial */}
            <div>
              <label htmlFor="mesInicial" className="block text-sm font-medium text-gray-700 mb-1">
                Mês Inicial <span className="text-red-500">*</span>
              </label>
              <Controller
                name="mesInicial"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="mesInicial"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] ${
                      errors.mesInicial ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione o mês</option>
                    {meses.map((mes) => (
                      <option key={mes} value={mes}>
                        {mes}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.mesInicial && (
                <p className="mt-1 text-sm text-red-600">{errors.mesInicial.message}</p>
              )}
            </div>

            {/* Mês Final */}
            <div>
              <label htmlFor="mesFinal" className="block text-sm font-medium text-gray-700 mb-1">
                Mês Final <span className="text-red-500">*</span>
              </label>
              <Controller
                name="mesFinal"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="mesFinal"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] ${
                      errors.mesFinal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione o mês</option>
                    {meses.map((mes) => (
                      <option key={mes} value={mes}>
                        {mes}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.mesFinal && (
                <p className="mt-1 text-sm text-red-600">{errors.mesFinal.message}</p>
              )}
            </div>

            {/* Ano Inicial */}
            <Controller
              name="anoInicial"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Ano Inicial"
                  placeholder="Ex: 2024"
                  error={errors.anoInicial?.message}
                  disabled={isSubmitting}
                  required
                />
              )}
            />

            {/* Ano Final */}
            <Controller
              name="anoFinal"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Ano Final"
                  placeholder="Ex: 2025"
                  error={errors.anoFinal?.message}
                  disabled={isSubmitting}
                  required
                />
              )}
            />

            {/* Botões */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="flex-1"
                loading={isSubmitting}
              >
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
