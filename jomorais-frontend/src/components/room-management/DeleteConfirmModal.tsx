import { AlertTriangle, X } from 'lucide-react'
import Button from '../common/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  roomName: string
  isLoading: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  roomName,
  isLoading,
}: DeleteConfirmModalProps) {
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
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Exclusão
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja deletar a sala{' '}
              <span className="font-semibold text-gray-900">"{roomName}"</span>?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    Atenção!
                  </h4>
                  <p className="text-sm text-red-700">
                    Esta ação não pode ser desfeita. A sala será permanentemente
                    removida do sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              loading={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Deletar Sala
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
