import { FileText, File, X } from 'lucide-react'

interface ReportGenerationModalProps {
  isOpen: boolean
  isGenerating: boolean
  isGeneratingWord?: boolean
  isGeneratingPDF?: boolean
  onClose: () => void
  onGenerateWordReport: () => void
  onGeneratePDFReport: () => void
}

export default function ReportGenerationModal({
  isOpen,
  isGenerating,
  isGeneratingWord = false,
  isGeneratingPDF = false,
  onClose,
  onGenerateWordReport,
  onGeneratePDFReport
}: ReportGenerationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Gerar Relatório</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Selecione o formato do relatório que deseja gerar:
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onGenerateWordReport}
              disabled={isGenerating || isGeneratingWord}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Documento Word (.docx)</div>
                <div className="text-sm text-gray-600">Relatório completo em formato Word</div>
              </div>
              {isGeneratingWord && (
                <div className="text-sm text-blue-600">Gerando...</div>
              )}
            </button>

            <button
              onClick={onGeneratePDFReport}
              disabled={isGenerating || isGeneratingPDF}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <File className="h-6 w-6 text-red-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Documento PDF (.pdf)</div>
                <div className="text-sm text-gray-600">Relatório completo em formato PDF</div>
              </div>
              {isGeneratingPDF && (
                <div className="text-sm text-red-600">Gerando...</div>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onGenerateWordReport}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Gerando...' : 'Gerar'}
          </button>
        </div>
      </div>
    </div>
  )
}
