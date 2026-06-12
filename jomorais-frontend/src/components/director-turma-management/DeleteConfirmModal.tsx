import { AlertTriangle, X } from 'lucide-react'
import Button from '../common/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  directorTurmaInfo: string
  isLoading: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  directorTurmaInfo,
  isLoading,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={isLoading ? undefined : onClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
                <p className="text-sm text-gray-500 mt-0.5">Esta ação é permanente</p>
              </div>
            </div>
            <button onClick={onClose} disabled={isLoading} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-7">
            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja deletar o diretor de turma{' '}
              <strong className="font-semibold text-gray-900">"{directorTurmaInfo}"</strong>?
            </p>

            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                Atenção: Esta ação é irreversível
              </p>
              <ul className="text-sm text-red-700/90 space-y-1.5 ml-3.5 list-disc">
                <li>O diretor será removido da turma</li>
                <li>Esta ação não pode ser desfeita</li>
                <li>A turma ficará sem diretor até que um novo seja atribuído</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} size="md">
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirm} loading={isLoading} variant="danger" size="md">
              Sim, Deletar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
