import { AlertTriangle, X } from 'lucide-react'
import Button from '../common/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  courseName: string
  isDeleting: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  courseName,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Fechar"
              aria-label="Fechar"
              disabled={isDeleting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja deletar o curso{' '}
              <span className="font-bold text-gray-900">"{courseName}"</span>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os dados
                relacionados a este curso serão permanentemente removidos.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onConfirm}
              loading={isDeleting}
              className="bg-red-600 hover:bg-red-700 border-red-600"
            >
              Deletar Curso
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
