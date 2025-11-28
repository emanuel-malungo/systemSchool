import { X } from 'lucide-react'
import type { IMoeda } from '../../types/financialService.types'

interface MoedaViewModalProps {
  isOpen: boolean
  onClose: () => void
  moeda: IMoeda | null
  onEdit: () => void
}

export default function MoedaViewModal({
  isOpen,
  onClose,
  moeda,
  onEdit,
}: MoedaViewModalProps) {
  if (!isOpen || !moeda) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-[#007C00] to-[#005a00] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Detalhes da Moeda</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Código */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm font-semibold text-gray-600 mb-1">Código</p>
              <p className="text-lg font-bold text-gray-900">{moeda.codigo}</p>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  moeda.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {moeda.activo ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            {/* Designação */}
            <div className="bg-gray-50 p-4 rounded-xl col-span-2">
              <p className="text-sm font-semibold text-gray-600 mb-1">Designação</p>
              <p className="text-lg text-gray-900">{moeda.designacao}</p>
            </div>

            {/* Símbolo */}
            <div className="bg-gray-50 p-4 rounded-xl col-span-2">
              <p className="text-sm font-semibold text-gray-600 mb-1">Símbolo</p>
              <p className="text-2xl font-bold text-gray-900">{moeda.simbolo}</p>
            </div>
          </div>

          {/* Datas */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
            <div className="grid grid-cols-2 gap-4">
              {moeda.dataCriacao && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Data de Criação</p>
                  <p className="text-sm text-gray-900">
                    {new Date(moeda.dataCriacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {moeda.dataActualizacao && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Última Atualização</p>
                  <p className="text-sm text-gray-900">
                    {new Date(moeda.dataActualizacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Fechar
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all font-medium"
            >
              Editar Moeda
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
