import { X, Edit2, Calendar, Clock } from 'lucide-react'
import type { IAnoLectivo } from '../../../types/anoLectivo.types'
import Button from '../../common/Button'

interface AnoLectivoViewModalProps {
  isOpen: boolean
  onClose: () => void
  anoLectivo: IAnoLectivo | null
  onEdit: () => void
}

export default function AnoLectivoViewModal({
  isOpen,
  onClose,
  anoLectivo,
  onEdit,
}: AnoLectivoViewModalProps) {
  if (!isOpen || !anoLectivo) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Ano Letivo</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6">
            {/* Cabeçalho do Ano Letivo */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center text-white text-2xl font-bold">
                {anoLectivo.designacao.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{anoLectivo.designacao}</h3>
                <p className="text-gray-600">
                  {anoLectivo.anoInicial} - {anoLectivo.anoFinal}
                </p>
              </div>
            </div>

            {/* Informações do Ano Letivo */}
            <div className="grid grid-cols-2 gap-6">
              {/* Código */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="text-base font-semibold text-gray-900">#{anoLectivo.codigo}</p>
                </div>
              </div>

              {/* Designação */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designação</p>
                  <p className="text-base font-semibold text-gray-900">
                    {anoLectivo.designacao}
                  </p>
                </div>
              </div>

              {/* Mês Inicial */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-[#007C00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mês Inicial</p>
                  <p className="text-base font-semibold text-gray-900">
                    {anoLectivo.mesInicial}
                  </p>
                </div>
              </div>

              {/* Mês Final */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mês Final</p>
                  <p className="text-base font-semibold text-gray-900">
                    {anoLectivo.mesFinal}
                  </p>
                </div>
              </div>

              {/* Ano Inicial */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ano Inicial</p>
                  <p className="text-base font-semibold text-gray-900">
                    {anoLectivo.anoInicial}
                  </p>
                </div>
              </div>

              {/* Ano Final */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ano Final</p>
                  <p className="text-base font-semibold text-gray-900">
                    {anoLectivo.anoFinal}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Período Completo</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-center text-lg font-semibold text-gray-900">
                  {anoLectivo.mesInicial} de {anoLectivo.anoInicial} até {anoLectivo.mesFinal} de {anoLectivo.anoFinal}
                </p>
              </div>
            </div>
          </div>

          {/* Footer com Ações */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={onEdit}
              variant="primary"
              className="flex-1 bg-[#007C00] hover:bg-[#005a00] focus:ring-[#007C00]/40 border-[#007C00]"
            >
              <Edit2 className="h-4 w-4" />
              Editar Ano Letivo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
