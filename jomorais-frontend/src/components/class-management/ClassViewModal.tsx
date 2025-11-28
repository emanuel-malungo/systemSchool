import { X, Edit2, GraduationCap, Hash, CheckCircle, XCircle, FileCheck, FileX } from 'lucide-react'
import type { IClass } from '../../types/class.types'
import Button from '../common/Button'

interface ClassViewModalProps {
  isOpen: boolean
  onClose: () => void
  classItem: IClass | null
  onEdit: () => void
}

export default function ClassViewModal({
  isOpen,
  onClose,
  classItem,
  onEdit,
}: ClassViewModalProps) {
  if (!isOpen || !classItem) return null

  const getStatusInfo = (status: number) => {
    if (status === 1) {
      return {
        label: 'Ativo',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
      }
    }
    return {
      label: 'Inativo',
      className: 'bg-red-100 text-red-800',
      icon: <XCircle className="h-4 w-4" />,
    }
  }

  const statusInfo = getStatusInfo(classItem.status)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#007C00] to-[#005a00]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Detalhes da Classe</h2>
                <p className="text-green-100 text-sm">Visualização completa</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Código e Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Código:</span>
                <span className="text-lg font-bold text-gray-900">#{classItem.codigo}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>

            {/* Designação */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#007C00] rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Designação da Classe
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{classItem.designacao}</p>
                </div>
              </div>
            </div>

            {/* Nota Máxima */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hash className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nota Máxima
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{classItem.notaMaxima} valores</p>
                </div>
              </div>
            </div>

            {/* Exame */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  classItem.exame ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  {classItem.exame ? (
                    <FileCheck className="h-5 w-5 text-white" />
                  ) : (
                    <FileX className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Possui Exame
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {classItem.exame ? 'Sim' : 'Não'}
                  </p>
                  {classItem.exame && (
                    <p className="text-sm text-gray-600 mt-1">
                      Esta classe requer exame final
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3">
                <label className="block text-xs font-medium text-blue-700 mb-1">
                  Tipo de Avaliação
                </label>
                <p className="text-sm font-semibold text-blue-900">
                  {classItem.exame ? 'Com Exame Final' : 'Avaliação Contínua'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <label className="block text-xs font-medium text-green-700 mb-1">
                  Sistema de Notas
                </label>
                <p className="text-sm font-semibold text-green-900">
                  0 - {classItem.notaMaxima} valores
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar Classe
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
