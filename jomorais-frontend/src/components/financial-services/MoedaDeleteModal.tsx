import { AlertTriangle, X } from 'lucide-react'

interface MoedaDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  moedaName: string
  isLoading: boolean
}

export default function MoedaDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  moedaName,
  isLoading,
}: MoedaDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-linear-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Confirmar Exclusão</h2>
            </div>
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

        {/* Conteúdo */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 text-lg">
              Tem certeza que deseja excluir a moeda{' '}
              <span className="font-bold text-gray-900">"{moedaName}"</span>?
            </p>
            <p className="text-gray-600 mt-2">
              Esta ação não pode ser desfeita. Todos os dados relacionados a esta moeda serão removidos.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
