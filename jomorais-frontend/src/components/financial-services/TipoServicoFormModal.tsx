import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { ITipoServico, ITipoServicoInput } from '../../types/financialService.types'
import { useMoedas } from '../../hooks/useFinancialServices'
import { useCategoriasServicos } from '../../hooks/useFinancialServices'

interface TipoServicoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ITipoServicoInput) => void
  tipoServico: ITipoServico | null
  isLoading: boolean
}

const TIPOS_SERVICO = ['Propina', 'Taxa', 'Multa', 'Certificado', 'Outro']
const STATUS_OPTIONS = ['Activo', 'Inactivo']

export default function TipoServicoFormModal({
  isOpen,
  onClose,
  onSubmit,
  tipoServico,
  isLoading,
}: TipoServicoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ITipoServicoInput>({
    defaultValues: {
      designacao: '',
      descricao: '',
      preco: 0,
      codigo_Moeda: 0,
      tipoServico: 'Propina',
      status: 'Activo',
      aplicarMulta: false,
      aplicarDesconto: false,
      valorMulta: 0,
      iva: 0,
      categoria: undefined,
      codigo_Utilizador: 1, // Deve ser obtido do contexto do usuário
      codigo_Ano: 1, // Deve ser obtido do ano letivo atual
    },
  })

  const { data: moedasData } = useMoedas({ page: 1, limit: 100 })
  const { data: categoriasData } = useCategoriasServicos({ page: 1, limit: 100 })

  const aplicarMulta = watch('aplicarMulta')

  useEffect(() => {
    if (isOpen) {
      if (tipoServico) {
        reset({
          designacao: tipoServico.designacao,
          descricao: tipoServico.descricao,
          preco: tipoServico.preco,
          codigo_Moeda: tipoServico.codigo_Moeda,
          tipoServico: tipoServico.tipoServico,
          status: tipoServico.status,
          aplicarMulta: tipoServico.aplicarMulta,
          aplicarDesconto: tipoServico.aplicarDesconto,
          valorMulta: tipoServico.valorMulta,
          iva: tipoServico.iva,
          categoria: tipoServico.categoria,
          codigo_Utilizador: tipoServico.codigo_Utilizador,
          codigo_Ano: tipoServico.codigo_Ano,
        })
      } else {
        reset({
          designacao: '',
          descricao: '',
          preco: 0,
          codigo_Moeda: moedasData?.data[0]?.codigo || 0,
          tipoServico: 'Propina',
          status: 'Activo',
          aplicarMulta: false,
          aplicarDesconto: false,
          valorMulta: 0,
          iva: 0,
          categoria: undefined,
          codigo_Utilizador: 1,
          codigo_Ano: 1,
        })
      }
    }
  }, [isOpen, tipoServico, reset, moedasData])

  if (!isOpen) return null

  const handleFormSubmit = (data: ITipoServicoInput) => {
    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-[#007C00] to-[#005a00] p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {tipoServico ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'}
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
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designação */}
              <div className="md:col-span-2">
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
                  placeholder="Ex: Propina do 1º Trimestre"
                  disabled={isLoading}
                />
                {errors.designacao && (
                  <p className="mt-1 text-sm text-red-600">{errors.designacao.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  {...register('descricao')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] transition-all"
                  placeholder="Descrição do serviço..."
                  disabled={isLoading}
                />
              </div>

              {/* Tipo de Serviço */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Serviço <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('tipoServico', { required: 'O tipo é obrigatório' })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.tipoServico
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#007C00]'
                  }`}
                  disabled={isLoading}
                >
                  {TIPOS_SERVICO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                {errors.tipoServico && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipoServico.message}</p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  {...register('categoria', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] transition-all"
                  disabled={isLoading}
                >
                  <option value="">Sem categoria</option>
                  {categoriasData?.data.map((cat) => (
                    <option key={cat.codigo} value={cat.codigo}>
                      {cat.designacao}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Valores
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preço */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preço <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('preco', {
                    required: 'O preço é obrigatório',
                    min: { value: 0, message: 'O preço deve ser positivo' },
                    valueAsNumber: true,
                  })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.preco
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#007C00]'
                  }`}
                  placeholder="0.00"
                  disabled={isLoading}
                />
                {errors.preco && (
                  <p className="mt-1 text-sm text-red-600">{errors.preco.message}</p>
                )}
              </div>

              {/* Moeda */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Moeda <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigo_Moeda', {
                    required: 'A moeda é obrigatória',
                    valueAsNumber: true,
                  })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.codigo_Moeda
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#007C00]'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Selecione...</option>
                  {moedasData?.data.map((moeda) => (
                    <option key={moeda.codigo} value={moeda.codigo}>
                      {moeda.designacao} ({moeda.codigo})
                    </option>
                  ))}
                </select>
                {errors.codigo_Moeda && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo_Moeda.message}</p>
                )}
              </div>

              {/* IVA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IVA (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('iva', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] transition-all"
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Configurações
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] transition-all"
                  disabled={isLoading}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor da Multa (condicionalmente) */}
              {aplicarMulta && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valor da Multa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('valorMulta', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] transition-all"
                    placeholder="0.00"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="aplicarMulta"
                  {...register('aplicarMulta')}
                  className="w-5 h-5 text-[#007C00] border-gray-300 rounded focus:ring-[#007C00]"
                  disabled={isLoading}
                />
                <label htmlFor="aplicarMulta" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Aplicar multa por atraso
                </label>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="aplicarDesconto"
                  {...register('aplicarDesconto')}
                  className="w-5 h-5 text-[#007C00] border-gray-300 rounded focus:ring-[#007C00]"
                  disabled={isLoading}
                />
                <label htmlFor="aplicarDesconto" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Permitir descontos
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
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
              {isLoading ? 'Salvando...' : tipoServico ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
