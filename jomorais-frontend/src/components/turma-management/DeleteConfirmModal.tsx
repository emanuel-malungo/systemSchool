import { AlertTriangle } from 'lucide-react'
import Button from '../common/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  turmaName: string
  isDeleting: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  turmaName,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={isDeleting ? undefined : onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Confirmar Exclusão
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700">
              Tem certeza que deseja excluir a turma{' '}
              <span className="font-semibold text-gray-900">"{turmaName}"</span>?
            </p>
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ⚠️ <strong>Atenção:</strong> Ao excluir esta turma, todas as confirmações
                e dados relacionados poderão ser afetados.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              loading={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Turma
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
