import { X, Pencil, Hash, Tag } from 'lucide-react'
import type { Room } from '../../types/room.types'
import Button from '../common/Button'

interface RoomViewModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room | null
  onEdit: (room: Room) => void
}

export default function RoomViewModal({
  isOpen,
  onClose,
  room,
  onEdit,
}: RoomViewModalProps) {
  if (!isOpen || !room) return null

  const handleEdit = () => {
    onEdit(room)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#007C00]/10 flex items-center justify-center">
                <Tag className="h-6 w-6 text-[#007C00]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalhes da Sala
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Informações completas da sala
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-2 gap-6">
              {/* Código */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Código
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  #{room.codigo}
                </p>
              </div>

              {/* Designação */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Designação
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {room.designacao}
                </p>
              </div>
            </div>

            {/* Card de Informações */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#007C00] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Informações da Sala
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Código:</span>
                      <span>#{room.codigo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Nome:</span>
                      <span>{room.designacao}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informação Adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Sobre esta sala
                  </h4>
                  <p className="text-sm text-blue-700">
                    Esta sala pode ser associada a turmas e utilizada para
                    organizar o espaço físico da instituição. Certifique-se de
                    manter as informações atualizadas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleEdit}
              className="bg-[#007C00] hover:bg-[#005a00]"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar Sala
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
