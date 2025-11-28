import { AlertTriangle, X } from 'lucide-react'
import Button from '../common/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  studentName: string
  isDeleting: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  studentName,
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja deletar o estudante <strong>{studentName}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Atenção:</strong> Esta ação é <strong>irreversível</strong> e irá:
              </p>
              <ul className="mt-2 text-sm text-red-700 space-y-1 ml-4 list-disc">
                <li>Deletar permanentemente o estudante</li>
                <li>Remover todos os dados relacionados</li>
                <li>Esta ação não pode ser desfeita</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
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
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-600/40 border-red-600"
            >
              Sim, Deletar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
